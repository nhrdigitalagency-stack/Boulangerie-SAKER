import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import express, { NextFunction, Request, Response } from 'express';
import { createClient, SanityClient } from '@sanity/client';
import { createServer as createViteServer } from 'vite';
import { CATALOG_PRODUCTS, CategoryInfo, VERIFIED_CATEGORIES } from './src/data/catalog.ts';
import {
  AdminUserProfile,
  CmsPopup,
  CmsProduct,
  CmsSiteContent,
  DEFAULT_CMS_SITE_CONTENT,
} from './src/data/cmsTypes.ts';

const PORT = Number(process.env.PORT) || 3000;
const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || '4li08lhr';
const SANITY_ORG_ID = process.env.SANITY_ORG_ID || 'oh314dkvd';
const SANITY_DATASET = process.env.SANITY_DATASET || 'production';
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN || '';
const ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  crypto.createHash('sha256').update(`${SANITY_PROJECT_ID}:${SANITY_API_TOKEN || 'dev'}`).digest('hex');

const ADMIN_COOKIE_NAME = 'saker_admin_session';
const OWNER_DOC_ID = 'saker-owner-primary';
const SITE_CONTENT_DOC_ID = 'saker-site-content-main';
const SAMPLE_POPUP_DOC_ID = 'saker-popup-welcome-1';

if (!SANITY_API_TOKEN) {
  console.warn('[SAKER CMS] Attention : SANITY_API_TOKEN non défini dans .env');
}

const sanityClient: SanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2025-02-01',
  token: SANITY_API_TOKEN,
  useCdn: false,
});

interface SanityAdminAccountDoc {
  _id: string;
  _type: 'sakerAdminAccount';
  username: string;
  email: string;
  displayName: string;
  passwordHash: string;
  role: 'owner';
  updatedAt: string;
}

interface AdminSessionPayload {
  id: string;
  username: string;
  email: string;
  displayName: string;
  exp: number;
}

interface AuthenticatedRequest extends Request {
  adminUser?: AdminSessionPayload;
}

function hashPassword(password: string, existingSalt?: string): string {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, originalHex] = parts;
  if (!salt || !originalHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const original = Buffer.from(originalHex, 'hex');
  if (derived.length !== original.length) return false;
  return crypto.timingSafeEqual(derived, original);
}

function signSessionToken(payload: AdminSessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', ADMIN_SESSION_SECRET)
    .update(data)
    .digest('base64url');
  return `${data}.${sig}`;
}

function verifySessionToken(token: string | undefined): AdminSessionPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  if (!data || !sig) return null;
  const expectedSig = crypto
    .createHmac('sha256', ADMIN_SESSION_SECRET)
    .update(data)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as AdminSessionPayload;
    if (!parsed.exp || Date.now() > parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = decodeURIComponent(part.slice(idx + 1).trim());
    result[key] = val;
  }
  return result;
}

function extractTokenFromReq(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookies = parseCookies(req.headers.cookie);
  return cookies[ADMIN_COOKIE_NAME];
}

function setSessionCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [
    `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${7 * 24 * 60 * 60}`,
  ];
  if (isProd) {
    parts.push('Secure');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearSessionCookie(res: Response): void {
  res.setHeader(
    'Set-Cookie',
    `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token = extractTokenFromReq(req);
  const payload = verifySessionToken(token);
  if (!payload) {
    res.status(401).json({
      error: 'Session administrateur requise ou expirée. Veuillez vous reconnecter.',
    });
    return;
  }
  req.adminUser = payload;
  next();
}

function slugifyFrench(input: string): string {
  return input
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

let seedPromise: Promise<void> | null = null;

async function ensureSanitySeeded(): Promise<void> {
  if (!SANITY_API_TOKEN) return;
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    try {
      // 1. Compte propriétaire dans Sanity
      const existingOwner = await sanityClient.fetch<SanityAdminAccountDoc | null>(
        `*[_type == "sakerAdminAccount" && _id == $id][0]`,
        { id: OWNER_DOC_ID }
      );
      if (!existingOwner) {
        const seedPassword =
          process.env.INITIAL_ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url');
        await sanityClient.createIfNotExists({
          _id: OWNER_DOC_ID,
          _type: 'sakerAdminAccount',
          username: 'saker-admin',
          email: 'nhrdigitalagency@gmail.com',
          displayName: 'Direction Boulangerie SAKER',
          passwordHash: hashPassword(seedPassword),
          role: 'owner',
          updatedAt: new Date().toISOString(),
        });
        console.log('[SAKER CMS] Compte propriétaire initial créé dans Sanity.');
      }

      // 2. Contenu global des pages du site
      const existingSiteContent = await sanityClient.fetch<{ _id: string } | null>(
        `*[_type == "sakerSiteContent" && _id == $id][0]{_id}`,
        { id: SITE_CONTENT_DOC_ID }
      );
      if (!existingSiteContent) {
        await sanityClient.createIfNotExists({
          ...DEFAULT_CMS_SITE_CONTENT,
          _id: SITE_CONTENT_DOC_ID,
          _type: 'sakerSiteContent',
          updatedAt: new Date().toISOString(),
        });
        console.log('[SAKER CMS] Contenu éditorial du site initialisé dans Sanity.');
      }

      // 3. Catalogue initial des 22 produits SAKER
      const productCount = await sanityClient.fetch<number>(
        `count(*[_type == "sakerProduct"])`
      );
      if (productCount === 0) {
        const tx = sanityClient.transaction();
        CATALOG_PRODUCTS.forEach((p, idx) => {
          tx.createIfNotExists({
            _id: `saker-product-${p.id}`,
            _type: 'sakerProduct',
            id: p.id,
            slug: p.slug,
            legacySlug: p.legacySlug,
            name: p.name,
            price: p.price,
            currency: p.currency,
            category: p.category,
            categorySlug: p.categorySlug,
            image: p.image,
            shortDescription: p.shortDescription,
            description: p.description,
            sourceUrl: p.sourceUrl,
            availability: p.availability,
            isCustomizableCake: Boolean(p.isCustomizableCake),
            formatNote: p.formatNote || null,
            featured: [3090, 3050, 3106, 3097, 3074, 3069, 3035, 3132].includes(p.id),
            sortOrder: idx + 1,
          });
        });
        await tx.commit();
        console.log(`[SAKER CMS] ${CATALOG_PRODUCTS.length} produits SAKER importés dans Sanity.`);
      }

      // 4. Exemple de pop-up (inactif par défaut, prêt à être activé par le propriétaire)
      const popupCount = await sanityClient.fetch<number>(
        `count(*[_type == "sakerPopup"])`
      );
      if (popupCount === 0) {
        await sanityClient.createIfNotExists({
          _id: SAMPLE_POPUP_DOC_ID,
          _type: 'sakerPopup',
          title: 'Commandez vos gâteaux de fête et entremets à Douala',
          eyebrow: 'Boulangerie SAKER · Pâtisserie fraîche',
          message:
            'Mariages, anniversaires ou réceptions : personnalisez votre entremet en ligne et profitez de notre service dédié en agences ou à domicile.',
          imageUrl: '/assets/saker/07-boulangerie-saker-douala-cameroun.png',
          ctaLabel: 'Découvrir nos entremets',
          ctaTargetPage: 'shop',
          ctaCategorySlug: 'patisserie-fraiche',
          isActive: false,
          triggerDelaySeconds: 2,
          frequency: 'once_per_session',
          updatedAt: new Date().toISOString(),
        });
        console.log('[SAKER CMS] Modèle de pop-up initialisé dans Sanity.');
      }
    } catch (err) {
      console.error('[SAKER CMS] Erreur lors de l’initialisation Sanity :', err);
      seedPromise = null;
    }
  })();

  return seedPromise;
}

function normalizeProductDoc(doc: Record<string, unknown>): CmsProduct {
  return {
    _id: String(doc._id || ''),
    id: Number(doc.id),
    slug: String(doc.slug || ''),
    legacySlug: String(doc.legacySlug || doc.slug || ''),
    name: String(doc.name || ''),
    price: Number(doc.price || 0),
    currency: 'XAF',
    category: String(doc.category || 'Autres viennoiserie'),
    categorySlug: String(doc.categorySlug || 'autres-viennoiserie'),
    image: typeof doc.image === 'string' && doc.image.trim() ? doc.image : null,
    shortDescription:
      typeof doc.shortDescription === 'string' ? doc.shortDescription : null,
    description: typeof doc.description === 'string' ? doc.description : null,
    sourceUrl:
      typeof doc.sourceUrl === 'string'
        ? doc.sourceUrl
        : 'https://boulangeriesaker.com/boutique/',
    availability: 'sur_verification',
    isCustomizableCake: Boolean(doc.isCustomizableCake),
    formatNote: typeof doc.formatNote === 'string' && doc.formatNote ? doc.formatNote : undefined,
    featured: Boolean(doc.featured),
    sortOrder: typeof doc.sortOrder === 'number' ? doc.sortOrder : 999,
  };
}

function buildCategoriesWithLiveCounts(products: CmsProduct[]): CategoryInfo[] {
  const countsBySlug = new Map<string, number>();
  for (const p of products) {
    countsBySlug.set(p.categorySlug, (countsBySlug.get(p.categorySlug) || 0) + 1);
  }
  return VERIFIED_CATEGORIES.map((cat) => ({
    ...cat,
    count: countsBySlug.get(cat.slug) ?? 0,
  }));
}

function mergeSiteContent(doc: Partial<CmsSiteContent> | null): CmsSiteContent {
  if (!doc) return DEFAULT_CMS_SITE_CONTENT;
  return {
    _id: doc._id || SITE_CONTENT_DOC_ID,
    home: {
      ...DEFAULT_CMS_SITE_CONTENT.home,
      ...(doc.home || {}),
      universes: {
        panification: {
          ...DEFAULT_CMS_SITE_CONTENT.home.universes.panification,
          ...(doc.home?.universes?.panification || {}),
        },
        patisserie: {
          ...DEFAULT_CMS_SITE_CONTENT.home.universes.patisserie,
          ...(doc.home?.universes?.patisserie || {}),
        },
        pauseGourmande: {
          ...DEFAULT_CMS_SITE_CONTENT.home.universes.pauseGourmande,
          ...(doc.home?.universes?.pauseGourmande || {}),
        },
      },
      reassuranceItems:
        Array.isArray(doc.home?.reassuranceItems) && doc.home.reassuranceItems.length > 0
          ? doc.home.reassuranceItems
          : DEFAULT_CMS_SITE_CONTENT.home.reassuranceItems,
    },
    about: {
      ...DEFAULT_CMS_SITE_CONTENT.about,
      ...(doc.about || {}),
      faqHeading: doc.about?.faqHeading || DEFAULT_CMS_SITE_CONTENT.about.faqHeading,
      faqItems:
        Array.isArray(doc.about?.faqItems)
          ? doc.about!.faqItems
          : DEFAULT_CMS_SITE_CONTENT.about.faqItems,
    },
    servicesPage: {
      ...DEFAULT_CMS_SITE_CONTENT.servicesPage,
      ...(doc.servicesPage || {}),
      services:
        Array.isArray(doc.servicesPage?.services) && doc.servicesPage.services.length > 0
          ? doc.servicesPage.services
          : DEFAULT_CMS_SITE_CONTENT.servicesPage.services,
    },
    contactPage: {
      ...DEFAULT_CMS_SITE_CONTENT.contactPage,
      ...(doc.contactPage || {}),
      agencies:
        Array.isArray(doc.contactPage?.agencies) && doc.contactPage.agencies.length > 0
          ? doc.contactPage.agencies
          : DEFAULT_CMS_SITE_CONTENT.contactPage.agencies,
    },
    footer: {
      ...DEFAULT_CMS_SITE_CONTENT.footer,
      ...(doc.footer || {}),
    },
    updatedAt: doc.updatedAt,
  };
}

async function fetchAllPublicData() {
  await ensureSanitySeeded();
  const [rawProducts, rawPopups, rawSiteContent] = await Promise.all([
    sanityClient.fetch<Record<string, unknown>[]>(
      `*[_type == "sakerProduct"] | order(coalesce(sortOrder, 999) asc, id asc)`
    ),
    sanityClient.fetch<CmsPopup[]>(
      `*[_type == "sakerPopup" && isActive == true] | order(updatedAt desc)`
    ),
    sanityClient.fetch<Partial<CmsSiteContent> | null>(
      `*[_type == "sakerSiteContent" && _id == $id][0]`,
      { id: SITE_CONTENT_DOC_ID }
    ),
  ]);

  const products =
    rawProducts && rawProducts.length > 0
      ? rawProducts.map(normalizeProductDoc)
      : CATALOG_PRODUCTS.map((p, idx) => ({ ...p, _id: `saker-product-${p.id}`, sortOrder: idx + 1 }));

  return {
    products,
    categories: buildCategoriesWithLiveCounts(products),
    popups: rawPopups || [],
    siteContent: mergeSiteContent(rawSiteContent),
    sanityConnected: true,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '12mb' }));

  // Pré-initialisation asynchrone sans bloquer l'écoute HTTP
  void ensureSanitySeeded();

  // --- Santé serveur & Sanity ---
  app.get('/api/health', async (_req, res) => {
    try {
      await ensureSanitySeeded();
      const count = await sanityClient.fetch<number>(`count(*[_type == "sakerProduct"])`);
      res.json({
        ok: true,
        sanityConnected: true,
        projectId: SANITY_PROJECT_ID,
        dataset: SANITY_DATASET,
        productsCount: count,
      });
    } catch (err) {
      res.status(500).json({
        ok: false,
        sanityConnected: false,
        error: err instanceof Error ? err.message : 'Erreur Sanity',
      });
    }
  });

  // --- Données publiques de la boutique (produits, catégories, pop-ups actifs, contenus) ---
  app.get('/api/public/site-data', async (_req, res) => {
    try {
      const data = await fetchAllPublicData();
      res.json(data);
    } catch (err) {
      console.error('[SAKER CMS] /api/public/site-data error:', err);
      res.json({
        products: CATALOG_PRODUCTS,
        categories: VERIFIED_CATEGORIES,
        popups: [],
        siteContent: DEFAULT_CMS_SITE_CONTENT,
        sanityConnected: false,
      });
    }
  });

  // --- Authentification propriétaire contre Sanity DB ---
  app.post('/api/admin/login', async (req, res) => {
    try {
      await ensureSanitySeeded();
      const identifier = String(req.body?.identifier || '').trim().toLowerCase();
      const password = String(req.body?.password || '');

      if (!identifier || !password) {
        res.status(400).json({
          error: 'Veuillez saisir votre nom d’utilisateur (ou e-mail) et votre mot de passe.',
        });
        return;
      }

      const account = await sanityClient.fetch<SanityAdminAccountDoc | null>(
        `*[_type == "sakerAdminAccount" && (lower(username) == $identifier || lower(email) == $identifier)][0]`,
        { identifier }
      );

      if (!account || !verifyPassword(password, account.passwordHash)) {
        res.status(401).json({
          error: 'Identifiant ou mot de passe incorrect. Vérifiez vos accès enregistrés dans la base.',
        });
        return;
      }

      const payload: AdminSessionPayload = {
        id: account._id,
        username: account.username,
        email: account.email,
        displayName: account.displayName,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
      };

      const token = signSessionToken(payload);
      setSessionCookie(res, token);

      const user: AdminUserProfile = {
        username: account.username,
        email: account.email,
        displayName: account.displayName,
      };
      res.json({ authenticated: true, user, token });
    } catch (err) {
      console.error('[SAKER CMS] login error:', err);
      res.status(500).json({
        error: 'Impossible de vérifier les identifiants auprès de Sanity pour le moment.',
      });
    }
  });

  app.post('/api/admin/logout', (_req, res) => {
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  app.get('/api/admin/me', async (req: AuthenticatedRequest, res) => {
    const token = extractTokenFromReq(req);
    const payload = verifySessionToken(token);
    if (!payload) {
      res.json({ authenticated: false, user: null });
      return;
    }
    try {
      const account = await sanityClient.fetch<SanityAdminAccountDoc | null>(
        `*[_type == "sakerAdminAccount" && _id == $id][0]`,
        { id: payload.id }
      );
      if (!account) {
        res.json({ authenticated: false, user: null });
        return;
      }
      res.json({
        authenticated: true,
        user: {
          username: account.username,
          email: account.email,
          displayName: account.displayName,
        },
      });
    } catch {
      res.json({
        authenticated: true,
        user: {
          username: payload.username,
          email: payload.email,
          displayName: payload.displayName,
        },
      });
    }
  });

  // --- Mise à jour des identifiants du propriétaire dans Sanity DB ---
  app.put('/api/admin/account', requireAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const currentPassword = String(req.body?.currentPassword || '');
      const username = String(req.body?.username || '').trim();
      const email = String(req.body?.email || '').trim().toLowerCase();
      const displayName = String(req.body?.displayName || '').trim();
      const newPassword = String(req.body?.newPassword || '');

      if (!currentPassword) {
        res.status(400).json({ error: 'Veuillez confirmer votre mot de passe actuel.' });
        return;
      }
      if (!username || username.length < 3) {
        res.status(400).json({ error: 'Le nom d’utilisateur doit contenir au moins 3 caractères.' });
        return;
      }
      if (!email || !email.includes('@')) {
        res.status(400).json({ error: 'Veuillez saisir une adresse e-mail valide.' });
        return;
      }
      if (!displayName) {
        res.status(400).json({ error: 'Veuillez renseigner un nom affiché.' });
        return;
      }
      if (newPassword && newPassword.length < 8) {
        res.status(400).json({
          error: 'Le nouveau mot de passe doit contenir au moins 8 caractères.',
        });
        return;
      }

      const account = await sanityClient.fetch<SanityAdminAccountDoc | null>(
        `*[_type == "sakerAdminAccount" && _id == $id][0]`,
        { id: req.adminUser!.id }
      );
      if (!account || !verifyPassword(currentPassword, account.passwordHash)) {
        res.status(401).json({ error: 'Le mot de passe actuel est incorrect.' });
        return;
      }

      const patchPayload: Record<string, string> = {
        username,
        email,
        displayName,
        updatedAt: new Date().toISOString(),
      };
      if (newPassword) {
        patchPayload.passwordHash = hashPassword(newPassword);
      }

      await sanityClient.patch(account._id).set(patchPayload).commit();

      const nextPayload: AdminSessionPayload = {
        id: account._id,
        username,
        email,
        displayName,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
      };
      const token = signSessionToken(nextPayload);
      setSessionCookie(res, token);

      res.json({
        user: { username, email, displayName },
        token,
      });
    } catch (err) {
      console.error('[SAKER CMS] update account error:', err);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du compte propriétaire.' });
    }
  });

  // --- Vue d'ensemble admin Sanity ---
  app.get('/api/admin/overview', requireAdmin, async (_req, res) => {
    try {
      await ensureSanitySeeded();
      const [rawProducts, rawPopups, rawSiteContent] = await Promise.all([
        sanityClient.fetch<Record<string, unknown>[]>(
          `*[_type == "sakerProduct"] | order(coalesce(sortOrder, 999) asc, id asc)`
        ),
        sanityClient.fetch<CmsPopup[]>(
          `*[_type == "sakerPopup"] | order(updatedAt desc)`
        ),
        sanityClient.fetch<Partial<CmsSiteContent> | null>(
          `*[_type == "sakerSiteContent" && _id == $id][0]`,
          { id: SITE_CONTENT_DOC_ID }
        ),
      ]);

      const products = (rawProducts || []).map(normalizeProductDoc);
      res.json({
        products,
        categories: buildCategoriesWithLiveCounts(products),
        popups: rawPopups || [],
        siteContent: mergeSiteContent(rawSiteContent),
        sanityMeta: {
          projectId: SANITY_PROJECT_ID,
          orgId: SANITY_ORG_ID,
          dataset: SANITY_DATASET,
        },
      });
    } catch (err) {
      console.error('[SAKER CMS] overview error:', err);
      res.status(500).json({ error: 'Impossible de charger les données depuis Sanity.' });
    }
  });

  // --- Téléversement d'image vers Sanity Assets ---
  app.post('/api/admin/upload-image', requireAdmin, async (req, res) => {
    try {
      const filename = String(req.body?.filename || 'produit-saker.png');
      const mimeType = String(req.body?.mimeType || 'image/png');
      const base64Data = String(req.body?.base64Data || '');

      if (!base64Data) {
        res.status(400).json({ error: 'Aucune donnée image reçue.' });
        return;
      }

      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(mimeType.toLowerCase())) {
        res.status(400).json({
          error: 'Format non supporté. Utilisez une image PNG, JPG ou WebP.',
        });
        return;
      }

      const cleanedBase64 = base64Data.includes(',')
        ? base64Data.split(',')[1]
        : base64Data;
      const buffer = Buffer.from(cleanedBase64, 'base64');

      if (buffer.length > 8 * 1024 * 1024) {
        res.status(400).json({ error: 'L’image dépasse 8 Mo. Compressez-la avant l’envoi.' });
        return;
      }

      const asset = await sanityClient.assets.upload('image', buffer, {
        filename: filename.replace(/[^a-zA-Z0-9._-]/g, '-'),
        contentType: mimeType,
      });

      res.json({
        assetId: asset._id,
        url: asset.url,
      });
    } catch (err) {
      console.error('[SAKER CMS] upload image error:', err);
      res.status(500).json({ error: 'Échec du téléversement de l’image vers Sanity.' });
    }
  });

  // --- CRUD Produits dans Sanity ---
  app.post('/api/admin/products', requireAdmin, async (req, res) => {
    try {
      const name = String(req.body?.name || '').trim();
      const price = Number(req.body?.price);
      const categorySlug = String(req.body?.categorySlug || '').trim();
      const shortDescription = String(req.body?.shortDescription || '').trim();
      const description = String(req.body?.description || '').trim();
      const image = typeof req.body?.image === 'string' ? req.body.image.trim() : null;
      const isCustomizableCake = Boolean(req.body?.isCustomizableCake);
      const formatNote = String(req.body?.formatNote || '').trim();
      const featured = Boolean(req.body?.featured);

      if (!name || name.length < 2) {
        res.status(400).json({ error: 'Le nom du produit doit contenir au moins 2 caractères.' });
        return;
      }
      if (!Number.isFinite(price) || price <= 0) {
        res.status(400).json({ error: 'Veuillez saisir un prix valide supérieur à 0 FCFA.' });
        return;
      }
      const categoryObj = VERIFIED_CATEGORIES.find((c) => c.slug === categorySlug);
      if (!categoryObj) {
        res.status(400).json({ error: 'Veuillez sélectionner une catégorie valide.' });
        return;
      }

      const existingIds = await sanityClient.fetch<number[]>(`*[_type == "sakerProduct"].id`);
      const maxId = existingIds.length > 0 ? Math.max(...existingIds.filter(Number.isFinite)) : 3200;
      const nextId = maxId + 1;
      const baseSlug = slugifyFrench(name) || `produit-${nextId}`;
      const docId = `saker-product-${nextId}`;

      const created = await sanityClient.create({
        _id: docId,
        _type: 'sakerProduct',
        id: nextId,
        slug: `${baseSlug}-${nextId}`,
        legacySlug: `${baseSlug}-${nextId}`,
        name,
        price: Math.round(price),
        currency: 'XAF',
        category: categoryObj.name,
        categorySlug: categoryObj.slug,
        image: image || null,
        shortDescription: shortDescription || null,
        description: description || shortDescription || null,
        sourceUrl: `https://boulangeriesaker.com/produit/${baseSlug}-${nextId}/`,
        availability: 'sur_verification',
        isCustomizableCake,
        formatNote: formatNote || null,
        featured,
        sortOrder: 0,
      });

      res.status(201).json({ product: normalizeProductDoc(created) });
    } catch (err) {
      console.error('[SAKER CMS] create product error:', err);
      res.status(500).json({ error: 'Impossible de créer le produit dans Sanity.' });
    }
  });

  app.put('/api/admin/products/:docId', requireAdmin, async (req, res) => {
    try {
      const { docId } = req.params;
      const name = String(req.body?.name || '').trim();
      const price = Number(req.body?.price);
      const categorySlug = String(req.body?.categorySlug || '').trim();
      const shortDescription = String(req.body?.shortDescription || '').trim();
      const description = String(req.body?.description || '').trim();
      const image = typeof req.body?.image === 'string' && req.body.image.trim() ? req.body.image.trim() : null;
      const isCustomizableCake = Boolean(req.body?.isCustomizableCake);
      const formatNote = String(req.body?.formatNote || '').trim();
      const featured = Boolean(req.body?.featured);

      if (!name || name.length < 2) {
        res.status(400).json({ error: 'Le nom du produit doit contenir au moins 2 caractères.' });
        return;
      }
      if (!Number.isFinite(price) || price <= 0) {
        res.status(400).json({ error: 'Veuillez saisir un prix valide supérieur à 0 FCFA.' });
        return;
      }
      const categoryObj = VERIFIED_CATEGORIES.find((c) => c.slug === categorySlug);
      if (!categoryObj) {
        res.status(400).json({ error: 'Catégorie invalide.' });
        return;
      }

      const updated = await sanityClient
        .patch(docId)
        .set({
          name,
          price: Math.round(price),
          category: categoryObj.name,
          categorySlug: categoryObj.slug,
          image,
          shortDescription: shortDescription || null,
          description: description || shortDescription || null,
          isCustomizableCake,
          formatNote: formatNote || null,
          featured,
        })
        .commit();

      res.json({ product: normalizeProductDoc(updated) });
    } catch (err) {
      console.error('[SAKER CMS] update product error:', err);
      res.status(500).json({ error: 'Impossible de mettre à jour ce produit dans Sanity.' });
    }
  });

  app.delete('/api/admin/products/:docId', requireAdmin, async (req, res) => {
    try {
      const { docId } = req.params;
      await sanityClient.delete(docId);
      res.json({ ok: true, deletedId: docId });
    } catch (err) {
      console.error('[SAKER CMS] delete product error:', err);
      res.status(500).json({ error: 'Impossible de supprimer ce produit dans Sanity.' });
    }
  });

  // --- CRUD Pop-ups dans Sanity ---
  app.post('/api/admin/popups', requireAdmin, async (req, res) => {
    try {
      const title = String(req.body?.title || '').trim();
      const eyebrow = String(req.body?.eyebrow || '').trim();
      const message = String(req.body?.message || '').trim();
      const imageUrl = typeof req.body?.imageUrl === 'string' && req.body.imageUrl.trim() ? req.body.imageUrl.trim() : undefined;
      const ctaLabel = String(req.body?.ctaLabel || 'Découvrir').trim();
      const ctaTargetPage = (['shop', 'services', 'contact', 'about'].includes(req.body?.ctaTargetPage)
        ? req.body.ctaTargetPage
        : 'shop') as CmsPopup['ctaTargetPage'];
      const ctaCategorySlug = String(req.body?.ctaCategorySlug || 'all').trim();
      const isActive = Boolean(req.body?.isActive);
      const triggerDelaySeconds = Math.max(0, Math.min(30, Number(req.body?.triggerDelaySeconds ?? 2)));
      const frequency = (['once_per_session', 'once_per_day', 'always'].includes(req.body?.frequency)
        ? req.body.frequency
        : 'once_per_session') as CmsPopup['frequency'];

      if (!title || !message) {
        res.status(400).json({ error: 'Le titre et le message du pop-up sont obligatoires.' });
        return;
      }

      const docId = `saker-popup-${Date.now()}`;
      const created = await sanityClient.create({
        _id: docId,
        _type: 'sakerPopup',
        title,
        eyebrow: eyebrow || 'Information Boulangerie SAKER',
        message,
        imageUrl,
        ctaLabel,
        ctaTargetPage,
        ctaCategorySlug,
        isActive,
        triggerDelaySeconds,
        frequency,
        updatedAt: new Date().toISOString(),
      });

      res.status(201).json({ popup: created });
    } catch (err) {
      console.error('[SAKER CMS] create popup error:', err);
      res.status(500).json({ error: 'Impossible de créer le pop-up dans Sanity.' });
    }
  });

  app.put('/api/admin/popups/:docId', requireAdmin, async (req, res) => {
    try {
      const { docId } = req.params;
      const title = String(req.body?.title || '').trim();
      const eyebrow = String(req.body?.eyebrow || '').trim();
      const message = String(req.body?.message || '').trim();
      const imageUrl = typeof req.body?.imageUrl === 'string' && req.body.imageUrl.trim() ? req.body.imageUrl.trim() : null;
      const ctaLabel = String(req.body?.ctaLabel || 'Découvrir').trim();
      const ctaTargetPage = ['shop', 'services', 'contact', 'about'].includes(req.body?.ctaTargetPage)
        ? req.body.ctaTargetPage
        : 'shop';
      const ctaCategorySlug = String(req.body?.ctaCategorySlug || 'all').trim();
      const isActive = Boolean(req.body?.isActive);
      const triggerDelaySeconds = Math.max(0, Math.min(30, Number(req.body?.triggerDelaySeconds ?? 2)));
      const frequency = ['once_per_session', 'once_per_day', 'always'].includes(req.body?.frequency)
        ? req.body.frequency
        : 'once_per_session';

      if (!title || !message) {
        res.status(400).json({ error: 'Le titre et le message du pop-up sont obligatoires.' });
        return;
      }

      const updated = await sanityClient
        .patch(docId)
        .set({
          title,
          eyebrow: eyebrow || 'Information Boulangerie SAKER',
          message,
          imageUrl,
          ctaLabel,
          ctaTargetPage,
          ctaCategorySlug,
          isActive,
          triggerDelaySeconds,
          frequency,
          updatedAt: new Date().toISOString(),
        })
        .commit();

      res.json({ popup: updated });
    } catch (err) {
      console.error('[SAKER CMS] update popup error:', err);
      res.status(500).json({ error: 'Impossible de mettre à jour le pop-up dans Sanity.' });
    }
  });

  app.delete('/api/admin/popups/:docId', requireAdmin, async (req, res) => {
    try {
      const { docId } = req.params;
      await sanityClient.delete(docId);
      res.json({ ok: true, deletedId: docId });
    } catch (err) {
      console.error('[SAKER CMS] delete popup error:', err);
      res.status(500).json({ error: 'Impossible de supprimer ce pop-up dans Sanity.' });
    }
  });

  // --- Mise à jour des contenus de pages du site dans Sanity ---
  app.put('/api/admin/site-content', requireAdmin, async (req, res) => {
    try {
      const nextContent = mergeSiteContent(req.body as Partial<CmsSiteContent>);
      const saved = await sanityClient.createOrReplace({
        ...nextContent,
        _id: SITE_CONTENT_DOC_ID,
        _type: 'sakerSiteContent',
        updatedAt: new Date().toISOString(),
      });
      res.json({ siteContent: mergeSiteContent(saved as unknown as Partial<CmsSiteContent>) });
    } catch (err) {
      console.error('[SAKER CMS] update site-content error:', err);
      res.status(500).json({ error: 'Impossible d’enregistrer les contenus du site dans Sanity.' });
    }
  });

  // --- Vite dev middleware vs static production ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(import.meta.dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build dist/index.html introuvable.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SAKER] Serveur Express + Sanity CMS actif sur http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[SAKER] Erreur fatale au démarrage du serveur :', err);
  process.exit(1);
});
