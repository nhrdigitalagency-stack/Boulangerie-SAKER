import React, { useEffect } from 'react';
import { BRAND_CONFIG } from '../config/brand';
import { useSiteData } from '../context/SiteDataContext';
import { Product } from '../data/catalog';
import { ActivePage } from './LeftNavigation';

interface BakeryJsonLdProps {
  activePage: ActivePage;
  selectedProduct?: Product;
  selectedCategory?: string;
}

const PAGE_SEO_META: Record<ActivePage, { title: string; description: string; pathHash: string }> = {
  home: {
    title: 'Boulangerie SAKER — Pain, Pâtisserie & Traiteur à Douala',
    description:
      'Boutique en ligne et présentation des Boulangeries SAKER à Douala : panification, pâtisserie fraîche, viennoiseries, gâteaux d’anniversaire et de mariage, service traiteur, salons de thé et salles de fêtes.',
    pathHash: '',
  },
  shop: {
    title: 'Boutique & Catalogue — Boulangerie SAKER Douala',
    description:
      'Commandez en ligne vos pains frais, entremets pâtissiers, gâteaux, viennoiseries, cakes et sablés des Boulangeries SAKER à Douala (Cameroun).',
    pathHash: '#boutique',
  },
  product: {
    title: 'Produit — Boulangerie SAKER Douala',
    description:
      'Découvrez les créations artisanales de la Boulangerie SAKER à Douala : pains quotidiens, viennoiseries et entremets pâtissiers.',
    pathHash: '#produit',
  },
  services: {
    title: 'Nos Services : Traiteur, Gâteaux, Salles de fêtes & Glaciers — Boulangerie SAKER',
    description:
      'Service traiteur événementiel, gâteaux de mariage et d’anniversaire avec livraison à Douala, salles de fêtes (Akwa), salons de thé et glaciers SAKER.',
    pathHash: '#services',
  },
  about: {
    title: 'À propos & Histoire depuis 1990 — Boulangerie SAKER Douala',
    description:
      'Fondée en 1990 à Bepanda (Douala) par M. TSHOUONGANG Élie Saker, la Boulangerie SAKER incarne la rigueur, la qualité et la convivialité boulangère au Cameroun.',
    pathHash: '#a-propos',
  },
  contact: {
    title: 'Contact & Nos Agences à Douala — Boulangerie SAKER',
    description:
      'Retrouvez nos boulangeries-pâtisseries SAKER à Douala : Siège social & Salle de fête d’Akwa, Makepe, Deïdo, Bali, PK10, Logbaba, Beedi et Aéroport.',
    pathHash: '#contact',
  },
  checkout: {
    title: 'Finaliser votre commande — Boulangerie SAKER Douala',
    description:
      'Finalisez votre pré-commande Boulangerie SAKER pour retrait en agence à Douala ou demande de livraison événementielle.',
    pathHash: '#commande',
  },
  admin: {
    title: 'Administration — Boulangerie SAKER',
    description: 'Espace d’administration Boulangerie SAKER.',
    pathHash: '#admin',
  },
};

function ensureMetaTag(selector: string, createAttrs: Record<string, string>, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    for (const [k, v] of Object.entries(createAttrs)) {
      el.setAttribute(k, v);
    }
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function toAbsoluteUrl(origin: string, pathOrUrl: string | null | undefined): string | undefined {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${origin}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

export const BakeryJsonLd: React.FC<BakeryJsonLdProps> = ({
  activePage,
  selectedProduct,
  selectedCategory,
}) => {
  const { siteContent, products, categories } = useSiteData();

  useEffect(() => {
    const origin = window.location.origin;
    const basePathname = window.location.pathname === '/' ? '/' : window.location.pathname;
    const baseCanonicalUrl = `${origin}${basePathname}`;
    const seoMeta = PAGE_SEO_META[activePage] || PAGE_SEO_META.home;

    const resolvedTitle =
      activePage === 'product' && selectedProduct
        ? `${selectedProduct.name} — Boulangerie SAKER Douala`
        : activePage === 'shop' && selectedCategory && selectedCategory !== 'all'
        ? `${categories.find((c) => c.slug === selectedCategory)?.name || 'Boutique'} — Boulangerie SAKER Douala`
        : seoMeta.title;

    const resolvedDescription =
      activePage === 'product' && selectedProduct
        ? (selectedProduct.shortDescription || selectedProduct.description || seoMeta.description).trim()
        : seoMeta.description;

    const resolvedImage =
      activePage === 'product' && selectedProduct?.image
        ? toAbsoluteUrl(origin, selectedProduct.image)
        : toAbsoluteUrl(origin, BRAND_CONFIG.logos.primary);

    // 1. Synchronisation des balises meta & canonical dans <head>
    document.title = resolvedTitle;

    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', baseCanonicalUrl);

    ensureMetaTag('meta[name="description"]', { name: 'description' }, resolvedDescription);
    ensureMetaTag('meta[property="og:title"]', { property: 'og:title' }, resolvedTitle);
    ensureMetaTag('meta[property="og:description"]', { property: 'og:description' }, resolvedDescription);
    ensureMetaTag('meta[property="og:url"]', { property: 'og:url' }, baseCanonicalUrl);
    if (resolvedImage) {
      ensureMetaTag('meta[property="og:image"]', { property: 'og:image' }, resolvedImage);
      ensureMetaTag('meta[name="twitter:image"]', { name: 'twitter:image' }, resolvedImage);
    }
    ensureMetaTag('meta[name="twitter:title"]', { name: 'twitter:title' }, resolvedTitle);
    ensureMetaTag('meta[name="twitter:description"]', { name: 'twitter:description' }, resolvedDescription);

    // 2. Construction des données structurées Schema.org JSON-LD (@type: "Bakery" sur toutes les pages)
    const agencies = siteContent.contactPage.agencies?.length
      ? siteContent.contactPage.agencies
      : BRAND_CONFIG.agencies;

    const rawPhone = siteContent.contactPage.phonePrimary;
    const primaryPhone = rawPhone
      ? rawPhone.startsWith('+')
        ? rawPhone.replace(/\s+/g, '')
        : `+237${rawPhone.replace(/\s+/g, '')}`
      : BRAND_CONFIG.contacts.primaryPhones[0].tel;
    const email = siteContent.contactPage.email || BRAND_CONFIG.contacts.emailFromSource;
    const hqAddress =
      siteContent.contactPage.headquartersLocation || BRAND_CONFIG.contacts.headquartersLocation;

    const minPrice = products.length > 0 ? Math.min(...products.map((p) => p.price)) : 50;
    const maxPrice = products.length > 0 ? Math.max(...products.map((p) => p.price)) : 25000;
    const formatNum = (n: number) =>
      new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n).replace(/\u202f/g, ' ');

    const bakeryId = `${origin}/#bakery`;
    const websiteId = `${origin}/#website`;

    const bakerySchema: Record<string, unknown> = {
      '@type': 'Bakery',
      '@id': bakeryId,
      name: BRAND_CONFIG.name,
      legalName: BRAND_CONFIG.legalGroup,
      url: baseCanonicalUrl,
      logo: toAbsoluteUrl(origin, BRAND_CONFIG.logos.primary),
      image: [
        toAbsoluteUrl(origin, BRAND_CONFIG.logos.primary),
        toAbsoluteUrl(origin, BRAND_CONFIG.banners.painSaker),
      ].filter(Boolean),
      description:
        'Boulangerie, pâtisserie fraîche, viennoiseries, service traiteur, gâteaux sur mesure, salons de thé, glaciers et salles de fêtes à Douala (Cameroun) depuis 1990.',
      foundingDate: String(BRAND_CONFIG.foundingYear),
      foundingLocation: {
        '@type': 'Place',
        name: BRAND_CONFIG.foundingDistrict,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Douala',
          addressRegion: 'Littoral',
          addressCountry: 'CM',
        },
      },
      founder: {
        '@type': 'Person',
        name: BRAND_CONFIG.founder,
        jobTitle: BRAND_CONFIG.founderTitle,
      },
      telephone: primaryPhone,
      email,
      priceRange: `${formatNum(minPrice)} – ${formatNum(maxPrice)} FCFA`,
      currenciesAccepted: BRAND_CONFIG.currency,
      paymentAccepted: 'Espèces (FCFA), confirmation agence / Mobile Money selon modalités',
      address: {
        '@type': 'PostalAddress',
        streetAddress: hqAddress,
        addressLocality: 'Douala',
        addressRegion: 'Littoral',
        postalCode: 'BP 2754',
        addressCountry: 'CM',
      },
      areaServed: {
        '@type': 'City',
        name: 'Douala',
        containedInPlace: {
          '@type': 'AdministrativeArea',
          name: 'Littoral',
          containedInPlace: {
            '@type': 'Country',
            name: 'Cameroun',
          },
        },
      },
      knowsAbout: [
        'Panification artisanale',
        'Pâtisserie fraîche et entremets',
        'Viennoiseries et cakes',
        'Gâteaux de mariage et d’anniversaire',
        'Service traiteur événementiel à Douala',
        'Salles de fêtes',
        'Salons de thé et glaciers',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Catalogue Boulangerie & Pâtisserie SAKER',
        itemListElement: categories.map((cat) => ({
          '@type': 'OfferCatalog',
          name: cat.name,
          description: cat.description,
        })),
      },
      department: agencies
        .filter((agency) => !agency.isHeadquarters)
        .map((agency) => ({
          '@type': 'Bakery',
          name: agency.name,
          telephone: agency.phoneClean,
          parentOrganization: { '@id': bakeryId },
          address: {
            '@type': 'PostalAddress',
            streetAddress: agency.district,
            addressLocality: 'Douala',
            addressRegion: 'Littoral',
            postalCode: 'BP 2754',
            addressCountry: 'CM',
          },
        })),
    };

    const websiteSchema: Record<string, unknown> = {
      '@type': 'WebSite',
      '@id': websiteId,
      name: BRAND_CONFIG.name,
      url: baseCanonicalUrl,
      inLanguage: 'fr-CM',
      publisher: { '@id': bakeryId },
    };

    const webPageSchema: Record<string, unknown> = {
      '@type': 'WebPage',
      '@id': `${baseCanonicalUrl}${seoMeta.pathHash}#webpage`,
      url: `${baseCanonicalUrl}${seoMeta.pathHash}`,
      name: resolvedTitle,
      description: resolvedDescription,
      inLanguage: 'fr-CM',
      isPartOf: { '@id': websiteId },
      about: { '@id': bakeryId },
    };

    const graph: Record<string, unknown>[] = [bakerySchema, websiteSchema, webPageSchema];

    // Enrichissement contextuel sur la fiche produit sans altérer le schéma Bakery principal
    if (activePage === 'product' && selectedProduct) {
      graph.push({
        '@type': 'Product',
        name: selectedProduct.name,
        description:
          selectedProduct.description ||
          selectedProduct.shortDescription ||
          `${selectedProduct.name} — ${selectedProduct.category} par Boulangerie SAKER à Douala.`,
        category: selectedProduct.category,
        image: toAbsoluteUrl(origin, selectedProduct.image),
        sku: `SAKER-${selectedProduct.id}`,
        brand: {
          '@type': 'Brand',
          name: BRAND_CONFIG.name,
        },
        offers: {
          '@type': 'Offer',
          price: String(selectedProduct.price),
          priceCurrency: BRAND_CONFIG.currency,
          seller: { '@id': bakeryId },
          areaServed: {
            '@type': 'City',
            name: 'Douala',
          },
        },
      });
    }

    // Enrichissement contextuel FAQPage sur la page À propos (données issues de Sanity)
    if (activePage === 'about' && siteContent.about.faqItems?.length > 0) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: siteContent.about.faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      });
    }

    const jsonLdPayload = {
      '@context': 'https://schema.org',
      '@graph': graph,
    };

    let scriptEl = document.head.querySelector<HTMLScriptElement>('script#saker-bakery-jsonld');
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'saker-bakery-jsonld';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLdPayload, null, 2);
  }, [activePage, selectedProduct, selectedCategory, siteContent, products, categories]);

  return null;
};
