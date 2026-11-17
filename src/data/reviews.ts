export interface ProductReview {
  id: string;
  productId: number;
  author: string;
  agencyVisited: string;
  rating: number; // 1 to 5
  date: string;
  comment: string;
  contextTag?: string;
}

/**
 * Retours clients rédigés avec sobriété et réalisme (nuances sur le goût, la texture,
 * le retrait en agence à Douala ou les délais de commande) pour chaque produit ou famille.
 */
export const INITIAL_PRODUCT_REVIEWS: Record<number, ProductReview[]> = {
  // Pain Saker (3090)
  3090: [
    {
      id: 'rev-3090-1',
      productId: 3090,
      author: 'Jean-Paul M.',
      agencyVisited: 'Agence de Deïdo',
      rating: 5,
      date: 'Il y a 5 jours',
      comment:
        'C’est le pain qu’on prend tous les matins à la maison. Quand il sort du four, la croûte est bien dorée et la mie ne s’effrite pas pour les sandwichs des enfants.',
      contextTag: 'Achat quotidien',
    },
    {
      id: 'rev-3090-2',
      productId: 3090,
      author: 'Clarisse N.',
      agencyVisited: 'Agence d’Akwa',
      rating: 4,
      date: 'Il y a 2 semaines',
      comment:
        'Bon rapport qualité-prix à 135 FCFA. Aux heures de pointe de 18h il y a parfois un peu d’attente au comptoir, mais les fournées se succèdent vite.',
      contextTag: 'Retrait en agence',
    },
    {
      id: 'rev-3090-3',
      productId: 3090,
      author: 'Hervé T.',
      agencyVisited: 'Agence de Makepe',
      rating: 5,
      date: 'Il y a 3 semaines',
      comment:
        'Se conserve bien jusqu’au lendemain matin si on le garde dans un torchon propre. Très régulier.',
      contextTag: 'Panification',
    },
  ],

  // Petit pain (3085)
  3085: [
    {
      id: 'rev-3085-1',
      productId: 3085,
      author: 'Mireille K.',
      agencyVisited: 'Agence de Bali',
      rating: 5,
      date: 'Il y a 1 semaine',
      comment:
        'Format très pratique pour le goûter des enfants ou avec du chocolat à tartiner. À 50 FCFA l’unité, j’en prends souvent une dizaine d’un coup.',
      contextTag: 'Format individuel',
    },
    {
      id: 'rev-3085-2',
      productId: 3085,
      author: 'Alain E.',
      agencyVisited: 'Agence PK10',
      rating: 4,
      date: 'Il y a 3 semaines',
      comment:
        'Mie souple, pratique pour préparer des petits pains garnis lors d’une réunion de famille.',
      contextTag: 'Réception familiale',
    },
  ],

  // Pain complet (3081)
  3081: [
    {
      id: 'rev-3081-1',
      productId: 3081,
      author: 'Dr. Samuel B.',
      agencyVisited: 'Agence d’Akwa',
      rating: 4,
      date: 'Il y a 6 jours',
      comment:
        'Je privilégie le pain complet pour le petit-déjeuner. Il est léger et rassasiant. Je conseille de passer le matin pour être sûr d’en trouver.',
      contextTag: 'Petit-déjeuner',
    },
    {
      id: 'rev-3081-2',
      productId: 3081,
      author: 'Nadine F.',
      agencyVisited: 'Agence de Makepe',
      rating: 5,
      date: 'Il y a 1 mois',
      comment:
        'Bon goût de céréales sans être sec, très agréable légèrement grillé avec un peu de beurre.',
      contextTag: 'Achat régulier',
    },
  ],

  // Pain galimois (3077)
  3077: [
    {
      id: 'rev-3077-1',
      productId: 3077,
      author: 'Christian D.',
      agencyVisited: 'Agence de Bali',
      rating: 5,
      date: 'Il y a 10 jours',
      comment:
        'Une belle surprise si on aime les pains avec une croûte plus épaisse et une mie plus dense que la baguette classique. Accompagne très bien les plats en sauce.',
      contextTag: 'Repas en famille',
    },
    {
      id: 'rev-3077-2',
      productId: 3077,
      author: 'Stéphanie L.',
      agencyVisited: 'Agence de Deïdo',
      rating: 4,
      date: 'Il y a 3 semaines',
      comment:
        'Pain généreux et consistant à 300 FCFA, un seul suffit largement pour un repas à deux.',
      contextTag: 'Panification',
    },
  ],

  // Pain viennois (3074)
  3074: [
    {
      id: 'rev-3074-1',
      productId: 3074,
      author: 'Estelle W.',
      agencyVisited: 'Agence de Makepe',
      rating: 5,
      date: 'Il y a 4 jours',
      comment:
        'Moelleux et juste assez sucré sans être écœurant. Parfait avec une tasse de café au lait le matin.',
      contextTag: 'Pause matinale',
    },
    {
      id: 'rev-3074-2',
      productId: 3074,
      author: 'Patrick O.',
      agencyVisited: 'Agence de Beedi',
      rating: 4,
      date: 'Il y a 2 semaines',
      comment:
        'La texture briochée est bien réussie. Mes enfants l’adorent au retour de l’école.',
      contextTag: 'Goûter',
    },
  ],

  // Friands à la viande (3097)
  3097: [
    {
      id: 'rev-3097-1',
      productId: 3097,
      author: 'Cédric N.',
      agencyVisited: 'Agence d’Akwa',
      rating: 5,
      date: 'Il y a 3 jours',
      comment:
        'Le feuilletage est bien croustillant et pas trop gras. La farce est bien assaisonnée, idéal pour dépanner à la pause de midi au bureau.',
      contextTag: 'Pause déjeuner',
    },
    {
      id: 'rev-3097-2',
      productId: 3097,
      author: 'Yolande M.',
      agencyVisited: 'Agence de Logbaba',
      rating: 4,
      date: 'Il y a 2 semaines',
      comment:
        'Encore meilleur quand il est tiède. Nous en avons aussi commandé deux plateaux pour une soutenance et tout est parti rapidement.',
      contextTag: 'Collation / Soutenance',
    },
  ],

  // Cake pot (3035)
  3035: [
    {
      id: 'rev-3035-1',
      productId: 3035,
      author: 'Aurore T.',
      agencyVisited: 'Agence de Makepe',
      rating: 4,
      date: 'Il y a 1 semaine',
      comment:
        'Format très pratique à emporter dans le sac sans que le gâteau s’écrase. Le biscuit à l’intérieur reste bien humide.',
      contextTag: 'Pause gourmande',
    },
    {
      id: 'rev-3035-2',
      productId: 3035,
      author: 'Junior K.',
      agencyVisited: 'Agence de Deïdo',
      rating: 5,
      date: 'Il y a 3 semaines',
      comment:
        'À 350 FCFA c’est un petit dessert sympa après le déjeuner. La crème sur le dessus est légère.',
      contextTag: 'Dessert individuel',
    },
  ],

  // Cake Cœur (3106)
  3106: [
    {
      id: 'rev-3106-1',
      productId: 3106,
      author: 'Raïssa E.',
      agencyVisited: 'Agence de Bali',
      rating: 5,
      date: 'Il y a 8 jours',
      comment:
        'Acheté pour faire plaisir à ma mère dimanche dernier. La présentation en cœur est jolie et la pâte a un bon goût vanillé.',
      contextTag: 'Attention familiale',
    },
    {
      id: 'rev-3106-2',
      productId: 3106,
      author: 'Brice M.',
      agencyVisited: 'Agence d’Akwa',
      rating: 4,
      date: 'Il y a 1 mois',
      comment:
        'Cake bien dense et régulier à la découpe, très correct pour 2 000 FCFA.',
      contextTag: 'Pâtisserie familiale',
    },
  ],

  // Cake rectangulaire (3109)
  3109: [
    {
      id: 'rev-3109-1',
      productId: 3109,
      author: 'Solange P.',
      agencyVisited: 'Agence de Beedi',
      rating: 5,
      date: 'Il y a 5 jours',
      comment:
        'Facile à trancher en parts égales quand on reçoit de la visite à la maison. Il reste moelleux plusieurs jours bien emballé.',
      contextTag: 'Format familial',
    },
    {
      id: 'rev-3109-2',
      productId: 3109,
      author: 'Gaston N.',
      agencyVisited: 'Agence Aéroport',
      rating: 4,
      date: 'Il y a 3 semaines',
      comment:
        'Un classique sans mauvaise surprise pour accompagner le thé du matin.',
      contextTag: 'Petit-déjeuner',
    },
  ],

  // Entremet en forêt noir (3050)
  3050: [
    {
      id: 'rev-3050-1',
      productId: 3050,
      author: 'Sandrine & Marc T.',
      agencyVisited: 'Salle de fête d’Akwa',
      rating: 5,
      date: 'Il y a 6 jours',
      comment:
        'Commandé pour les 40 ans de mon époux. La génoise au chocolat était bien imbibée, la chantilly tenait bien malgré la chaleur et les copeaux de chocolat sont généreux.',
      contextTag: 'Anniversaire',
    },
    {
      id: 'rev-3050-2',
      productId: 3050,
      author: 'Lionel K.',
      agencyVisited: 'Agence de Makepe',
      rating: 4,
      date: 'Il y a 2 semaines',
      comment:
        'Très bon équilibre entre le chocolat noir et les cerises. Pensez à appeler la veille si vous voulez faire ajouter une plaque personnalisée.',
      contextTag: 'Conseil commande',
    },
    {
      id: 'rev-3050-3',
      productId: 3050,
      author: 'Béatrice A.',
      agencyVisited: 'Agence de Bali',
      rating: 5,
      date: 'Il y a 1 mois',
      comment:
        'Tous les invités ont apprécié, la mousse au chocolat reste légère en fin de repas.',
      contextTag: 'Réception',
    },
  ],

  // Entremet Vanille & fraise 15 000 FCFA (3069)
  3069: [
    {
      id: 'rev-3069-1',
      productId: 3069,
      author: 'Carine M.',
      agencyVisited: 'Agence d’Akwa',
      rating: 5,
      date: 'Il y a 1 semaine',
      comment:
        'Pris pour l’anniversaire de ma fille. Le nappage fraise est frais et la crème vanille n’est pas trop lourde. Le format à 15 000 FCFA a permis de servir toute la table.',
      contextTag: 'Anniversaire enfant',
    },
    {
      id: 'rev-3069-2',
      productId: 3069,
      author: 'Fabrice N.',
      agencyVisited: 'Agence de Deïdo',
      rating: 4,
      date: 'Il y a 3 semaines',
      comment:
        'Belle présentation en vitrine et décor soigné. Mieux vaut le garder bien au frais jusqu’au moment de servir.',
      contextTag: 'Pâtisserie fraîche',
    },
  ],

  // Entremet Vanille fraise 8 000 FCFA (3042)
  3042: [
    {
      id: 'rev-3042-1',
      productId: 3042,
      author: 'Élodie B.',
      agencyVisited: 'Agence de Makepe',
      rating: 5,
      date: 'Il y a 9 jours',
      comment:
        'Ce format à 8 000 FCFA est idéal quand on fête un anniversaire en petit comité (6 à 8 personnes). Très doux en bouche.',
      contextTag: 'Petit comité',
    },
    {
      id: 'rev-3042-2',
      productId: 3042,
      author: 'Romaric D.',
      agencyVisited: 'Agence PK10',
      rating: 4,
      date: 'Il y a 1 mois',
      comment:
        'Bon mariage vanille-fraise, génoise bien aérée.',
      contextTag: 'Dessert du dimanche',
    },
  ],
};

/**
 * Retours par défaut sobres pour les autres références du catalogue
 */
export function getDefaultReviewsForProduct(productId: number, productName: string, category: string): ProductReview[] {
  if (INITIAL_PRODUCT_REVIEWS[productId]) {
    return INITIAL_PRODUCT_REVIEWS[productId];
  }

  if (category === 'Pâtisserie fraîche') {
    return [
      {
        id: `rev-${productId}-1`,
        productId,
        author: 'Valérie N.',
        agencyVisited: 'Agence d’Akwa',
        rating: 5,
        date: 'Il y a 1 semaine',
        comment: `Nous avons choisi « ${productName} » pour une fête en famille. La finition pâtissière est propre et les saveurs sont équilibrées sans excès de sucre.`,
        contextTag: 'Événement familial',
      },
      {
        id: `rev-${productId}-2`,
        productId,
        author: 'Thierry M.',
        agencyVisited: 'Agence de Makepe',
        rating: 4,
        date: 'Il y a 3 semaines',
        comment:
          'Bonne tenue au frais et génoise moelleuse. Je recommande de passer un coup de fil à l’agence avant de se déplacer pour réserver son modèle.',
        contextTag: 'Retrait en agence',
      },
    ];
  }

  return [
    {
      id: `rev-${productId}-1`,
      productId,
      author: 'Arnaud K.',
      agencyVisited: 'Agence de Deïdo',
      rating: 5,
      date: 'Il y a 1 semaine',
      comment: `${productName} toujours frais quand on passe en matinée. Une valeur sûre pour la pause café ou le goûter.`,
      contextTag: 'Achat en boutique',
    },
    {
      id: `rev-${productId}-2`,
      productId,
      author: 'Christelle T.',
      agencyVisited: 'Agence de Bali',
      rating: 4,
      date: 'Il y a 2 semaines',
      comment:
        'Produit régulier et tarif accessible. Pratique à prendre en passant dans le quartier.',
      contextTag: 'Pause gourmande',
    },
  ];
}

export function getProductReviewStats(
  productId: number,
  productName = 'Produit SAKER',
  category = 'Boulangerie'
): { averageRating: number; totalReviews: number } {
  const baseReviews = getDefaultReviewsForProduct(productId, productName, category);
  if (baseReviews.length === 0) {
    return { averageRating: 0, totalReviews: 0 };
  }
  const sum = baseReviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    averageRating: Math.round((sum / baseReviews.length) * 10) / 10,
    totalReviews: baseReviews.length,
  };
}

