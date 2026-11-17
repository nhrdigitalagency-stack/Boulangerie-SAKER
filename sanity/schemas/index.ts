/**
 * Référence des schémas Sanity CMS pour Boulangerie SAKER
 * Projet Sanity : 4li08lhr · Organisation : oh314dkvd · Dataset : production
 */

export const sakerProductSchema = {
  name: 'sakerProduct',
  title: 'Produit Boulangerie SAKER',
  type: 'document',
  fields: [
    { name: 'id', title: 'ID numérique catalogue', type: 'number' },
    { name: 'name', title: 'Nom du produit', type: 'string' },
    { name: 'slug', title: 'Slug URL', type: 'string' },
    { name: 'price', title: 'Prix (FCFA)', type: 'number' },
    { name: 'currency', title: 'Devise', type: 'string', initialValue: 'XAF' },
    { name: 'category', title: 'Catégorie', type: 'string' },
    { name: 'categorySlug', title: 'Slug catégorie', type: 'string' },
    { name: 'image', title: 'URL photo produit', type: 'url' },
    { name: 'shortDescription', title: 'Accroche courte', type: 'text' },
    { name: 'description', title: 'Description complète', type: 'text' },
    { name: 'isCustomizableCake', title: 'Gâteau personnalisable', type: 'boolean' },
    { name: 'formatNote', title: 'Note de format', type: 'string' },
    { name: 'featured', title: 'Mis en avant sur l’accueil', type: 'boolean' },
    { name: 'sortOrder', title: 'Ordre d’affichage', type: 'number' },
  ],
};

export const sakerPopupSchema = {
  name: 'sakerPopup',
  title: 'Pop-up / Annonce Vitrine',
  type: 'document',
  fields: [
    { name: 'title', title: 'Titre du pop-up', type: 'string' },
    { name: 'eyebrow', title: 'Sur-titre', type: 'string' },
    { name: 'message', title: 'Message principal', type: 'text' },
    { name: 'imageUrl', title: 'Image d’illustration', type: 'url' },
    { name: 'ctaLabel', title: 'Libellé du bouton', type: 'string' },
    { name: 'ctaTargetPage', title: 'Page cible', type: 'string' },
    { name: 'ctaCategorySlug', title: 'Catégorie cible (si boutique)', type: 'string' },
    { name: 'isActive', title: 'Pop-up actif', type: 'boolean' },
    { name: 'triggerDelaySeconds', title: 'Délai avant affichage (s)', type: 'number' },
    { name: 'frequency', title: 'Fréquence d’affichage', type: 'string' },
  ],
};

export const sakerSiteContentSchema = {
  name: 'sakerSiteContent',
  title: 'Contenu des Pages du Site',
  type: 'document',
  fields: [
    { name: 'home', title: 'Page Accueil', type: 'object' },
    { name: 'about', title: 'Page À propos (incluant faqHeading & faqItems)', type: 'object' },
    { name: 'servicesPage', title: 'Page Services', type: 'object' },
    { name: 'contactPage', title: 'Page Contact & Agences', type: 'object' },
    { name: 'footer', title: 'Pied de page', type: 'object' },
  ],
};

export const sakerAdminAccountSchema = {
  name: 'sakerAdminAccount',
  title: 'Compte Propriétaire',
  type: 'document',
  fields: [
    { name: 'username', title: 'Nom d’utilisateur', type: 'string' },
    { name: 'email', title: 'E-mail', type: 'string' },
    { name: 'displayName', title: 'Nom affiché', type: 'string' },
    { name: 'passwordHash', title: 'Empreinte mot de passe (scrypt)', type: 'string' },
    { name: 'role', title: 'Rôle', type: 'string' },
  ],
};

export const SAKER_SANITY_SCHEMAS = [
  sakerProductSchema,
  sakerPopupSchema,
  sakerSiteContentSchema,
  sakerAdminAccountSchema,
];
