export interface Product {
  id: number;
  slug: string;
  legacySlug: string;
  name: string;
  price: number;
  currency: 'XAF';
  category: string;
  categorySlug: string;
  image: string | null;
  shortDescription: string | null;
  description: string | null;
  sourceUrl: string;
  availability: 'sur_verification';
  isCustomizableCake?: boolean;
  formatNote?: string;
}

export interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  representativeImage: string;
}

/**
 * Formatage monétaire en français : ex. 15000 -> "15 000 FCFA"
 */
export function formatPriceFCFA(amount: number): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\u202f/g, ' ');
  return `${formatted} FCFA`;
}

/**
 * Normalisation de texte pour la recherche (insensible à la casse, aux accents et ligatures œ/æ)
 */
export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Catégories principales réellement vérifiées dans WooCommerce sur boulangeriesaker.com
 */
export const VERIFIED_CATEGORIES: CategoryInfo[] = [
  {
    id: 191,
    name: 'Panification',
    slug: 'panification',
    description: 'Pains quotidiens et spécialités boulangères SAKER : Pain Saker, Pain complet, Petit pain et Pain galimois.',
    count: 4,
    representativeImage: '/assets/saker/pain-baguette-boulangerie-saker-douala-cameroun.png',
  },
  {
    id: 194,
    name: 'Pâtisserie fraîche',
    slug: 'patisserie-fraiche',
    description: 'Entremets et gâteaux de célébration (anniversaires, réceptions) préparés par nos artisans pâtissiers.',
    count: 8,
    representativeImage: '/assets/saker/07-boulangerie-saker-douala-cameroun.png',
  },
  {
    id: 190,
    name: 'Autres viennoiserie',
    slug: 'autres-viennoiserie',
    description: 'Cakes, sablés, beignets et douceurs gourmandes pour vos pauses de la journée.',
    count: 8,
    representativeImage: '/assets/saker/19-boulangerie-saker-douala-cameroun.png',
  },
  {
    id: 192,
    name: 'Pâte à brioche',
    slug: 'pate-a-brioche',
    description: 'Spécialités briochées moelleuses et légèrement sucrées, dont notre Pain viennois.',
    count: 1,
    representativeImage: '/assets/saker/pain-vienois-boulangerie-saker-douala-cameroun.png',
  },
  {
    id: 193,
    name: 'Pâte feuilletée',
    slug: 'pate-feuilletee',
    description: 'Feuilletés croustillants et gourmands salés, dont nos Friands à la viande.',
    count: 1,
    representativeImage: '/assets/saker/friande-de-viandet-boulangerie-saker-douala-cameroun.png',
  },
];

/**
 * Note sur les termes de navigation mentionnés dans l'audit du site :
 * - "Gâteaux" & "Anniversaire" correspondent aux entremets de la catégorie "Pâtisserie fraîche" et aux cakes.
 * - "Glaces SAKER" correspond à l'activité Glacier mentionnée dans les services, sans produits individuels listés dans l'API WooCommerce.
 */
export const CATALOG_PRODUCTS: Product[] = [
  // --- PANIFICATION (4 produits) ---
  {
    id: 3090,
    name: 'Pain Saker',
    slug: 'pain-saker',
    legacySlug: 'r1-concepts-eline-series-plain-brake-rotors',
    price: 135,
    currency: 'XAF',
    category: 'Panification',
    categorySlug: 'panification',
    image: '/assets/saker/pain-baguette-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'Le « Pain Saker » de la Boulangerie SAKER, c’est l’essence même de la tradition boulangère, à la croûte dorée et à la mie généreuse.',
    description:
      'Le « Pain Saker » de la Boulangerie SAKER incarne notre savoir-faire quotidien en panification à Douala. Pétri et cuit avec soin dans nos fours, il offre une croûte croustillante et une mie tendre idéale pour accompagner tous les repas de la famille.',
    sourceUrl: 'https://boulangeriesaker.com/produit/r1-concepts-eline-series-plain-brake-rotors/',
    availability: 'sur_verification',
  },
  {
    id: 3085,
    name: 'Petit pain',
    slug: 'petit-pain',
    legacySlug: 'power-stop-evolution-drilled-and-slotted',
    price: 50,
    currency: 'XAF',
    category: 'Panification',
    categorySlug: 'panification',
    image: '/assets/saker/pain-baguette-petit-modele-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'Nos petits pains sont polyvalents et se marient parfaitement avec toutes vos garnitures sucrées ou salées.',
    description:
      'Format individuel pratique et gourmand, le Petit pain de la Boulangerie SAKER conserve toute la qualité de notre panification traditionnelle. Idéal pour le petit-déjeuner, les sandwichs ou les pauses de la journée.',
    sourceUrl: 'https://boulangeriesaker.com/produit/power-stop-evolution-drilled-and-slotted/',
    availability: 'sur_verification',
  },
  {
    id: 3081,
    name: 'Pain complet',
    slug: 'pain-complet',
    legacySlug: 'pirelli-tires-scorpion-as-plus-3',
    price: 50,
    currency: 'XAF',
    category: 'Panification',
    categorySlug: 'panification',
    image: '/assets/saker/pain-complet-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'À la Boulangerie SAKER, nous sommes fiers de vous proposer un pain complet savoureux et équilibré pour le quotidien.',
    description:
      'Préparé avec soin pour offrir une saveur authentique et céréalière, notre Pain complet accompagne aussi bien le petit-déjeuner que vos repas équilibrés tout au long de la journée.',
    sourceUrl: 'https://boulangeriesaker.com/produit/pirelli-tires-scorpion-as-plus-3/',
    availability: 'sur_verification',
  },
  {
    id: 3077,
    name: 'Pain galimois',
    slug: 'pain-galimois',
    legacySlug: 'pirelli-tires-p4-four-seasons-plus',
    price: 300,
    currency: 'XAF',
    category: 'Panification',
    categorySlug: 'panification',
    image: '/assets/saker/pain-galimois-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'Ce pain, inspiré par les traditions de la boulangerie, offre une texture rustique et une croûte croustillante au caractère authentique.',
    description:
      'Découvrez notre Pain Galimois, une création de la Boulangerie SAKER qui incarne notre passion pour la boulangerie. Pétri avec soin pour obtenir une texture rustique et une croûte croustillante, il révèle à chaque bouchée l’équilibre entre la douceur de la mie et le caractère de la croûte.',
    sourceUrl: 'https://boulangeriesaker.com/produit/pirelli-tires-p4-four-seasons-plus/',
    availability: 'sur_verification',
  },

  // --- PÂTE À BRIOCHE (1 produit) ---
  {
    id: 3074,
    name: 'Pain viennois',
    slug: 'pain-viennois',
    legacySlug: 'pennzoil-platinum-high-mileage-full-synthetic-0w-20',
    price: 250,
    currency: 'XAF',
    category: 'Pâte à brioche',
    categorySlug: 'pate-a-brioche',
    image: '/assets/saker/pain-vienois-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'Sa texture légère, moelleuse et délicieusement briochée est sublimée par une touche de douceur sucrée.',
    description:
      'Plongez dans l’élégance gustative avec notre Pain Viennois signé Boulangerie SAKER. Sa texture légère, moelleuse et délicatement briochée en fait l’accompagnement idéal au petit-déjeuner, au goûter ou pour une pause gourmande à tout moment de la journée.',
    sourceUrl: 'https://boulangeriesaker.com/produit/pennzoil-platinum-high-mileage-full-synthetic-0w-20/',
    availability: 'sur_verification',
  },

  // --- PÂTE FEUILLETÉE (1 produit) ---
  {
    id: 3097,
    name: 'Friands à la viande',
    slug: 'friands-a-la-viande',
    legacySlug: 'right-stuff-drilled-and-slotted-brake-rotor',
    price: 600,
    currency: 'XAF',
    category: 'Pâte feuilletée',
    categorySlug: 'pate-feuilletee',
    image: '/assets/saker/friande-de-viandet-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'Un feuilletage doré et croustillant garni d’une farce savoureuse à la viande.',
    description:
      'Chaque bouchée de nos Friands à la viande associe le croustillant d’une pâte feuilletée pur savoir-faire à une garniture généreuse et parfumée. Idéal pour un encas salé ou pour composer vos plateaux traiteur.',
    sourceUrl: 'https://boulangeriesaker.com/produit/right-stuff-drilled-and-slotted-brake-rotor/',
    availability: 'sur_verification',
  },

  // --- AUTRES VIENNOISERIE (8 produits : Cakes, Beignets, Boule sucrée, Sablés) ---
  {
    id: 3035,
    name: 'Cake pot',
    slug: 'cake-pot',
    legacySlug: 'hre-flowform-ft01-tarmac',
    price: 350,
    currency: 'XAF',
    category: 'Autres viennoiserie',
    categorySlug: 'autres-viennoiserie',
    image: '/assets/saker/03-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'Nos Cake Pots sont disponibles dans une variété de saveurs alléchantes, conçus pour capturer la richesse du gâteau dans chaque cuillerée.',
    description:
      'Plongez dans une expérience gustative unique avec notre Cake Pot, une création de la Boulangerie SAKER. Ce gâteau en pot est conçu pour offrir une pause gourmande pratique et généreuse, en solo ou à partager.',
    sourceUrl: 'https://boulangeriesaker.com/produit/hre-flowform-ft01-tarmac/',
    availability: 'sur_verification',
  },
  {
    id: 3106,
    name: 'Cake Cœur',
    slug: 'cake-coeur',
    legacySlug: 'shell-rotella-t1-sae-30-conventional-heavy-duty',
    price: 2000,
    currency: 'XAF',
    category: 'Autres viennoiserie',
    categorySlug: 'autres-viennoiserie',
    image: '/assets/saker/19-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'Notre Cake Cœur est un mélange subtil de tendresse et de gourmandise, idéal à offrir ou à partager.',
    description:
      'Façonné avec attention dans un moule en forme de cœur, le Cake Cœur de la Boulangerie SAKER séduit par sa texture moelleuse et son goût délicat. Une attention gourmande parfaite pour témoigner votre affection ou accompagner un moment convivial.',
    sourceUrl: 'https://boulangeriesaker.com/produit/shell-rotella-t1-sae-30-conventional-heavy-duty/',
    availability: 'sur_verification',
    isCustomizableCake: true,
  },
  {
    id: 3109,
    name: 'Cake rectangulaire',
    slug: 'cake-rectangulaire',
    legacySlug: 'snowyfox-rv-15amp-to-50amp-adapter-15male',
    price: 2500,
    currency: 'XAF',
    category: 'Autres viennoiserie',
    categorySlug: 'autres-viennoiserie',
    image: '/assets/saker/18-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'Préparé avec passion et expertise, notre cake rectangulaire offre un tranchage facile et un moelleux généreux pour toute la famille.',
    description:
      'Le Cake rectangulaire de la Boulangerie SAKER est un grand classique familial. Sa mie fondante et dorée accompagne à merveille le petit-déjeuner, le thé ou le café, ainsi que vos réceptions.',
    sourceUrl: 'https://boulangeriesaker.com/produit/snowyfox-rv-15amp-to-50amp-adapter-15male/',
    availability: 'sur_verification',
    isCustomizableCake: true,
  },
  {
    id: 3102,
    name: 'Beignet Sucré',
    slug: 'beignet-sucre',
    legacySlug: 'schumacher-125-chrome-fan-12v',
    price: 100,
    currency: 'XAF',
    category: 'Autres viennoiserie',
    categorySlug: 'autres-viennoiserie',
    image: '/assets/saker/beignet-saker-au-sucre-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'Offrez-vous une pause gourmande avec notre Beignet Sucré doré et moelleux.',
    description:
      'Incontournable des pauses gourmandes à Douala, le Beignet Sucré de la Boulangerie SAKER se distingue par sa pâte souple, aérée et délicatement sucrée.',
    sourceUrl: 'https://boulangeriesaker.com/produit/schumacher-125-chrome-fan-12v/',
    availability: 'sur_verification',
  },
  {
    id: 3031,
    name: 'Beignet fourré',
    slug: 'beignet-fourre',
    legacySlug: 'general-altimax-365aw',
    price: 250,
    currency: 'XAF',
    category: 'Autres viennoiserie',
    categorySlug: 'autres-viennoiserie',
    image: '/assets/saker/02-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'Des beignets moelleux, dorés à la perfection et généreusement garnis pour éveiller vos papilles.',
    description:
      'Succombez à la tentation des beignets fourrés de la Boulangerie SAKER. Préparés avec soin par nos boulangers-pâtissiers, ils allient une pâte moelleuse et dorée à un cœur gourmand.',
    sourceUrl: 'https://boulangeriesaker.com/produit/general-altimax-365aw/',
    availability: 'sur_verification',
  },
  {
    id: 3027,
    name: 'Boule sucrée',
    slug: 'boule-sucree',
    legacySlug: 'fuel-d771-twitch-1pc-candy-red-with-milled-accents',
    price: 250,
    currency: 'XAF',
    category: 'Autres viennoiserie',
    categorySlug: 'autres-viennoiserie',
    image: '/assets/saker/01-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'Spécialité viennoise ronde et généreuse, appréciée pour son moelleux et sa douceur.',
    description:
      'La Boule sucrée de la Boulangerie SAKER fait partie des douceurs boulangères emblématiques de notre catalogue. Aucune description longue additionnelle n’étant renseignée sur la fiche source, contactez-nous pour toute précision.',
    sourceUrl: 'https://boulangeriesaker.com/produit/fuel-d771-twitch-1pc-candy-red-with-milled-accents/',
    availability: 'sur_verification',
  },
  {
    id: 3119,
    name: 'Sablé d’or',
    slug: 'sable-dor',
    legacySlug: 'spyder-projector-headlights',
    price: 200,
    currency: 'XAF',
    category: 'Autres viennoiserie',
    categorySlug: 'autres-viennoiserie',
    image: '/assets/saker/16-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'Des biscuits sablés dorés et croquants, préparés avec soin pour accompagner vos pauses thé ou café.',
    description:
      'Les Sablés d’or de la Boulangerie SAKER offrent une texture sablée fondante et un goût beurré équilibré, parfaits à tout moment de la journée.',
    sourceUrl: 'https://boulangeriesaker.com/produit/spyder-projector-headlights/',
    availability: 'sur_verification',
  },
  {
    id: 3132,
    name: 'Sablé coco',
    slug: 'sable-coco',
    legacySlug: 'sable-coco',
    price: 250,
    currency: 'XAF',
    category: 'Autres viennoiserie',
    categorySlug: 'autres-viennoiserie',
    image: '/assets/saker/15-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'Nos sablés coco sont confectionnés avec soin pour offrir une note exotique et croquante à chaque bouchée.',
    description:
      'Alliance gourmande d’une pâte sablée dorée et de la saveur parfumée de la noix de coco, le Sablé coco SAKER ravit les amateurs de petits fours secs.',
    sourceUrl: 'https://boulangeriesaker.com/produit/sable-coco/',
    availability: 'sur_verification',
  },

  // --- PÂTISSERIE FRAÎCHE (8 produits : Entremets de 8 000 à 25 000 FCFA) ---
  {
    id: 3042,
    name: 'Entremet Vanille fraise',
    slug: 'entremet-vanille-fraise-8000',
    legacySlug: 'leather-honey-leather-conditioner-best-leather-conditioner',
    price: 8000,
    currency: 'XAF',
    category: 'Pâtisserie fraîche',
    categorySlug: 'patisserie-fraiche',
    image: '/assets/saker/05-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'La délicate vanille se marie harmonieusement à la fraîcheur de la fraise dans ce format à 8 000 FCFA.',
    description:
      'Succombez à la tentation avec notre Entremet saveur Vanille fraise (référence 3042 à 8 000 FCFA). Lorsque vous dégustez cet entremet, la douceur de la vanille s’unit à la note fruitée de la fraise. Notre équipe de pâtissiers allie savoir-faire traditionnel et créativité pour vos occasions spéciales.',
    sourceUrl: 'https://boulangeriesaker.com/produit/leather-honey-leather-conditioner-best-leather-conditioner/',
    availability: 'sur_verification',
    isCustomizableCake: true,
    formatNote: 'Référence #3042 — Tarif catalogue : 8 000 FCFA (conservée distinctement de la référence #3069 à 15 000 FCFA conformément au catalogue source).',
  },
  {
    id: 3069,
    name: 'Entremet Vanille & fraise',
    slug: 'entremet-vanille-et-fraise-15000',
    legacySlug: 'niche-m178-trento-gloss-black-with-brushed-face',
    price: 15000,
    currency: 'XAF',
    category: 'Pâtisserie fraîche',
    categorySlug: 'patisserie-fraiche',
    image: '/assets/saker/12-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'Grand entremet rectangulaire Vanille & fraise de célébration (référence #3069 à 15 000 FCFA).',
    description:
      'Cet Entremet Vanille & fraise (référence #3069 à 15 000 FCFA) est présenté sur le catalogue officiel avec un décor pâtissier de fête. Idéal pour célébrer un anniversaire ou un événement en famille. Les dimensions et le nombre exact de parts sont à confirmer auprès de la boulangerie lors de votre commande.',
    sourceUrl: 'https://boulangeriesaker.com/produit/niche-m178-trento-gloss-black-with-brushed-face/',
    availability: 'sur_verification',
    isCustomizableCake: true,
    formatNote: 'Référence #3069 — Tarif catalogue : 15 000 FCFA (conservée distinctement de la référence #3042 à 8 000 FCFA).',
  },
  {
    id: 3059,
    name: 'Entremets rond parfum orange',
    slug: 'entremets-rond-parfum-orange',
    legacySlug: 'mobil-1-extended-performance-full-synthetic-motor-oil',
    price: 15000,
    currency: 'XAF',
    category: 'Pâtisserie fraîche',
    categorySlug: 'patisserie-fraiche',
    image: '/assets/saker/09-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'La douceur de l’orange imprègne chaque bouchée, équilibrant le sucré et l’acidulé sur une génoise moelleuse et un glaçage à l’orange.',
    description:
      'Laissez-vous séduire par l’entremets rond parfum orange de la Boulangerie SAKER. Sa texture moelleuse et fondante se marie à la finesse de la génoise, couronnée d’une fine couche de glaçage à l’orange qui apporte une note sucrée et acidulée rafraîchissante.',
    sourceUrl: 'https://boulangeriesaker.com/produit/mobil-1-extended-performance-full-synthetic-motor-oil/',
    availability: 'sur_verification',
    isCustomizableCake: true,
  },
  {
    id: 3046,
    name: 'Entremet vanille choco',
    slug: 'entremet-vanille-choco',
    legacySlug: 'lumen-custom-headlights',
    price: 15000,
    currency: 'XAF',
    category: 'Pâtisserie fraîche',
    categorySlug: 'patisserie-fraiche',
    image: '/assets/saker/06-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'La douceur envoûtante de la vanille rencontre l’intensité du chocolat dans un entremet à la texture veloutée.',
    description:
      'Plongez dans une expérience de délice avec notre Entremet vanille choco de la Boulangerie SAKER. La douceur de la vanille rencontre l’intensité du chocolat dans chaque bouchée. Que ce soit pour célébrer une occasion spéciale ou pour partager en famille, cet entremet est confectionné avec une attention méticuleuse aux détails.',
    sourceUrl: 'https://boulangeriesaker.com/produit/lumen-custom-headlights/',
    availability: 'sur_verification',
    isCustomizableCake: true,
  },
  {
    id: 3065,
    name: 'Entremet Vanille',
    slug: 'entremet-vanille',
    legacySlug: 'nexen-n-priz-ah5-with-white-wall',
    price: 15000,
    currency: 'XAF',
    category: 'Pâtisserie fraîche',
    categorySlug: 'patisserie-fraiche',
    image: '/assets/saker/11-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'Une douce symphonie de saveurs où la vanille est à l’honneur dans une texture légère et aérienne.',
    description:
      'Découvrez l’Entremet Vanille de la Boulangerie SAKER. La vanille, avec ses notes délicates, offre une expérience gustative raffinée à chaque bouchée. Sa texture légère et aérienne fond en bouche, idéale pour célébrer une occasion spéciale.',
    sourceUrl: 'https://boulangeriesaker.com/produit/nexen-n-priz-ah5-with-white-wall/',
    availability: 'sur_verification',
    isCustomizableCake: true,
  },
  {
    id: 3054,
    name: 'Entremets rond tout choco',
    slug: 'entremets-rond-tout-choco',
    legacySlug: 'maxpeedingrods-gt45-t4-upgrade-racing-turbo-charger',
    price: 20000,
    currency: 'XAF',
    category: 'Pâtisserie fraîche',
    categorySlug: 'patisserie-fraiche',
    image: '/assets/saker/08-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'Une création intensément chocolatée dédiée aux amoureux du chocolat sous toutes ses textures.',
    description:
      'Notre Entremets Rond Tout Choco est une célébration du chocolat préparée par les pâtissiers de la Boulangerie SAKER. Sa générosité et sa finition soignée en font une pièce maîtresse pour vos anniversaires et réceptions.',
    sourceUrl: 'https://boulangeriesaker.com/produit/maxpeedingrods-gt45-t4-upgrade-racing-turbo-charger/',
    availability: 'sur_verification',
    isCustomizableCake: true,
  },
  {
    id: 3050,
    name: 'Entremet en forêt noir',
    slug: 'entremet-en-foret-noire',
    legacySlug: 'lumen-custom-sealed-beam-led-headlights',
    price: 25000,
    currency: 'XAF',
    category: 'Pâtisserie fraîche',
    categorySlug: 'patisserie-fraiche',
    image: '/assets/saker/07-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'Biscuit au chocolat moelleux, mousse légère au chocolat noir, cerises juteuses, copeaux de chocolat croquant et chantilly onctueuse.',
    description:
      'Laissez-vous emporter par notre Entremet Forêt Noire de la Boulangerie SAKER. À la base, un biscuit au chocolat moelleux imbibé apporte une touche de douceur. Ensuite, une mousse légère au chocolat noir enveloppe délicatement des cerises juteuses, créant un équilibre entre le sucré et l’acidulé, le tout couronné de copeaux de chocolat noir et de chantilly.',
    sourceUrl: 'https://boulangeriesaker.com/produit/lumen-custom-sealed-beam-led-headlights/',
    availability: 'sur_verification',
    isCustomizableCake: true,
  },
  {
    id: 3062,
    name: 'Entremet en hauteur',
    slug: 'entremet-en-hauteur',
    legacySlug: 'mobil-delvac-1300-super-heavy-duty-synthetic-blend',
    price: 25000,
    currency: 'XAF',
    category: 'Pâtisserie fraîche',
    categorySlug: 'patisserie-fraiche',
    image: '/assets/saker/10-boulangerie-saker-douala-cameroun.png',
    shortDescription:
      'Création pâtissière élancée alliant plusieurs couches de saveurs délicates et de textures couronnées d’un glaçage brillant.',
    description:
      'Laissez-vous séduire par l’élégance de notre Entremet en hauteur à la Boulangerie SAKER. Chaque tranche révèle une superposition harmonieuse de saveurs sucrées, de crémeux onctueux et de croquant, pensée pour sublimer vos grandes célébrations.',
    sourceUrl: 'https://boulangeriesaker.com/produit/mobil-delvac-1300-super-heavy-duty-synthetic-blend/',
    availability: 'sur_verification',
    isCustomizableCake: true,
  },
];

/**
 * Plan de redirections 301 pour migrer proprement les anciennes URLs WooCommerce
 * contenant des slugs automobiles du thème Partdo vers des URLs boulangères lisibles.
 */
export const SEO_REDIRECT_PLAN = CATALOG_PRODUCTS.filter((p) => p.slug !== p.legacySlug).map((p) => ({
  productName: p.name,
  oldPath: `/produit/${p.legacySlug}/`,
  newPath: `/produit/${p.slug}`,
  status: 301,
  reason: 'Suppression du slug automobile issu du thème démo Partdo tout en préservant le référencement et l’ID produit #' + p.id,
}));
