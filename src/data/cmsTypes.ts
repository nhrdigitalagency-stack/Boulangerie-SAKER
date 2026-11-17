import { BRAND_CONFIG, SakerAgency, SakerService } from '../config/brand';
import { Product } from './catalog';

export interface CmsProduct extends Product {
  _id?: string;
  featured?: boolean;
  sortOrder?: number;
}

export interface CmsPopup {
  _id: string;
  title: string;
  eyebrow?: string;
  message: string;
  imageUrl?: string;
  ctaLabel: string;
  ctaTargetPage: 'shop' | 'services' | 'contact' | 'about';
  ctaCategorySlug?: string;
  isActive: boolean;
  triggerDelaySeconds: number;
  frequency: 'once_per_session' | 'once_per_day' | 'always';
  updatedAt?: string;
}

export interface HeroUniverseContent {
  badge: string;
  title: string;
  subtitle: string;
  ctaPrimaryLabel: string;
}

export interface SakerFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface CmsSiteContent {
  _id?: string;
  home: {
    universes: {
      panification: HeroUniverseContent;
      patisserie: HeroUniverseContent;
      pauseGourmande: HeroUniverseContent;
    };
    categoriesHeading: string;
    categoriesSubheading: string;
    productsHeading: string;
    productsSubheading: string;
    historyHeading: string;
    historyBody: string;
    reassuranceItems: Array<{
      title: string;
      desc: string;
    }>;
  };
  about: {
    pageTitle: string;
    intro: string;
    founderQuote: string;
    vision: string;
    mission: string;
    unitsOverview: string;
    faqHeading: string;
    faqItems: SakerFaqItem[];
  };
  servicesPage: {
    pageTitle: string;
    pageIntro: string;
    services: SakerService[];
  };
  contactPage: {
    pageTitle: string;
    pageIntro: string;
    phonePrimary: string;
    phoneSecondary: string;
    phoneAssistance: string;
    email: string;
    headquartersLocation: string;
    postalBox: string;
    openingHours: string;
    agencies: SakerAgency[];
  };
  footer: {
    brandDescription: string;
    legalNotice: string;
  };
  updatedAt?: string;
}

export interface AdminUserProfile {
  username: string;
  email: string;
  displayName: string;
}

export const DEFAULT_CMS_SITE_CONTENT: CmsSiteContent = {
  _id: 'saker-site-content-main',
  home: {
    universes: {
      panification: {
        badge: 'Fournées quotidiennes · Depuis 1990 à Douala',
        title: 'Le plaisir du pain chaud et de la viennoiserie dorée',
        subtitle:
          'Du célèbre Pain Saker à 135 FCFA aux pains viennois moelleux, nos fournées se succèdent tout au long de la journée dans nos agences de Douala.',
        ctaPrimaryLabel: 'Explorer le rayon Panification',
      },
      patisserie: {
        badge: 'Haute Pâtisserie & Célébrations · Livraison dédiée',
        title: 'Vos entremets de fête et gâteaux d’anniversaire à Douala',
        subtitle:
          'Forêt noire, Entremet Vanille & fraise, Framboisier ou créations de mariage : commandez en ligne et profitez de notre service de livraison dédié aux gâteaux d’événements.',
        ctaPrimaryLabel: 'Voir la Pâtisserie fraîche',
      },
      pauseGourmande: {
        badge: 'Salons de thé, Pause salée & Cakes moelleux',
        title: 'Friands croustillants, cakes dorés et pauses gourmandes',
        subtitle:
          'Pour vos pauses déjeuner, réceptions ou goûters en famille : découvrez nos friands de viande, cakes cœur, cakes marbrés et sablés pur beurre.',
        ctaPrimaryLabel: 'Découvrir nos Cakes & Viennoiseries',
      },
    },
    categoriesHeading: 'Nos rayons de boulangerie et pâtisserie',
    categoriesSubheading: 'Explorez les familles officielles du catalogue Boulangerie SAKER',
    productsHeading: 'Découvrez nos spécialités',
    productsSubheading: 'Sélection issue du catalogue officiel Boulangerie SAKER — prix affichés en FCFA',
    historyHeading: 'Une tradition d’excellence boulangère née à Bepanda',
    historyBody:
      'Créée en 1990 au quartier Bepanda à Douala par M. TSHOUONGANG Élie Saker, l’entreprise développe en 2006 le label BOULANGERIE SAKER autour d’une exigence constante : offrir à chaque famille un pain et une pâtisserie de qualité, préparés avec rigueur et proximité.',
    reassuranceItems: [
      { title: 'Fondée en 1990', desc: 'Savoir-faire né à Bepanda, Douala' },
      { title: '9 Agences à Douala', desc: 'Akwa, Bepanda, Deïdo, Bali, Makepe…' },
      { title: '50 à 25 000 FCFA', desc: 'Tarifs officiels accessibles au quotidien' },
      { title: 'Événements & Traiteur', desc: 'Livraison dédiée gâteaux mariage & fête' },
    ],
  },
  about: {
    pageTitle: 'Notre histoire : de Bepanda en 1990 au réseau des Boulangeries SAKER',
    intro: BRAND_CONFIG.history.intro,
    founderQuote: BRAND_CONFIG.history.founderQuote,
    vision: BRAND_CONFIG.history.vision,
    mission: BRAND_CONFIG.history.mission,
    unitsOverview: BRAND_CONFIG.history.unitsOverview,
    faqHeading: 'Questions fréquentes sur la Boulangerie SAKER',
    faqItems: [
      {
        id: 'faq-livraison-gateaux',
        question: 'Proposez-vous la livraison à domicile pour les gâteaux de fête ?',
        answer:
          'Oui, un service de livraison à domicile dédié est proposé spécifiquement pour les gâteaux de mariage et d’anniversaire à Douala. Les modalités précises et créneaux sont confirmés avec notre équipe lors de la validation de votre commande.',
      },
      {
        id: 'faq-personnalisation',
        question: 'Peut-on personnaliser un entremet avec un prénom ou une date ?',
        answer:
          'Oui, la plupart de nos entremets de la catégorie Pâtisserie fraîche (Forêt noire, Vanille & fraise, Entremets ronds) ainsi que nos cakes acceptent une demande d’inscription et de date souhaitée directement depuis la fiche produit, sous réserve de validation par nos pâtissiers.',
      },
      {
        id: 'faq-agences',
        question: 'Où trouver les agences Boulangerie SAKER à Douala ?',
        answer:
          'Vous pouvez consulter la carte interactive et les numéros directs sur la page « Contact & Agences ». Notre siège social est situé à la Salle de fête d’Akwa, avec des points de vente notamment à Akwa, Makepe, Deïdo, Bali, PK10, Logbaba, Beedi et secteur Aéroport.',
      },
      {
        id: 'faq-traiteur-salles',
        question: 'Organisez-vous le service traiteur et la location de salles de fêtes ?',
        answer:
          'Oui, nous accompagnons vos mariages, anniversaires, colloques, conférences et soutenances avec notre service traiteur et nos salles de fêtes (dont la Salle de fête d’Akwa). Vous pouvez préparer une demande de devis depuis la page « Nos services » ou appeler le 695 94 46 64.',
      },
      {
        id: 'faq-allergenes',
        question: 'Comment connaître la liste exacte des ingrédients et allergènes d’un produit ?',
        answer:
          'Pour toute précision sur les ingrédients, allergènes ou formats disponibles en temps réel, contactez directement nos équipes au 695 94 46 64 ou au 683 35 52 62 avant de finaliser votre commande.',
      },
    ],
  },
  servicesPage: {
    pageTitle: 'Nos services événementiels, salons de thé & glaciers',
    pageIntro:
      'Les Boulangeries SAKER offrent plusieurs services complémentaires à la panification et à la pâtisserie : un service traiteur pour vos mariages, anniversaires, colloques, conférences et soutenances, des salles de fêtes (dont la Salle de fête d’Akwa), la livraison à domicile pour les gâteaux de mariage et d’anniversaire, ainsi que des salons de thé et glaciers modernes.',
    services: BRAND_CONFIG.services,
  },
  contactPage: {
    pageTitle: 'Contactez Boulangerie SAKER & nos agences à Douala',
    pageIntro:
      'Retrouvez ci-dessous la carte interactive de nos points de vente à Douala, les numéros du Siège social (Salle de fête d’Akwa) ainsi que les coordonnées de chacune des agences SAKER.',
    phonePrimary: '695 94 46 64',
    phoneSecondary: '683 35 52 62',
    phoneAssistance: '696 12 68 24',
    email: BRAND_CONFIG.contacts.emailFromSource,
    headquartersLocation: BRAND_CONFIG.contacts.headquartersLocation,
    postalBox: 'BP : 2754 Douala',
    openingHours: BRAND_CONFIG.contacts.openingHoursSource,
    agencies: BRAND_CONFIG.agencies,
  },
  footer: {
    brandDescription:
      'Fondée dans les années 1990 à Douala (Bepanda) par M. TSHOUONGANG Élie Saker, la Boulangerie SAKER propose au quotidien pains, viennoiseries, pâtisseries fraîches et services événementiels.',
    legalNotice:
      'Mentions légales, CGV et politique de confidentialité — Boulangerie SAKER (GROUPE SAKER).',
  },
};
