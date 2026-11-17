export interface SakerAgency {
  id: string;
  name: string;
  district: string;
  phone: string;
  phoneClean: string;
  postalBox: string;
  isHeadquarters?: boolean;
  note?: string;
}

export interface SakerService {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  summary: string;
  description: string;
  highlights: string[];
  deliveryNote?: string;
  ctaLabel: string;
  image: string;
}

export interface SakerValue {
  id: string;
  title: string;
  description: string;
}

export const BRAND_CONFIG = {
  name: 'Boulangerie SAKER',
  legalGroup: 'GROUPE SAKER',
  founder: 'M. TSHOUONGANG Élie Saker',
  founderTitle: 'PCA GROUPE SAKER',
  foundingYear: 1990,
  brandLabelYear: 2006,
  foundingDistrict: 'Bepanda, Douala',
  city: 'Douala, Cameroun',
  currency: 'XAF',
  currencyLabel: 'FCFA',
  logos: {
    primary: '/assets/saker/logo-boulangerie-saker-1.png',
    compact: '/assets/saker/boulangerie-saker.png',
  },
  banners: {
    painSaker: '/assets/saker/maquette-web-PAIN-SAKER-copie.png',
    beignetSaker: '/assets/saker/maquette-web-beignet-saker.png',
    vertical: '/assets/saker/slider-vertical-boulangerie-asaker-copie.png',
  },
  colorsVerified: {
    logoRed: '#E31E24',
    themePrimaryRed: '#EF233C',
    themePrimaryDark: '#D81D33',
    themePrimaryLighter: '#FFF4F6',
    logoWheatGold: '#F5B316',
    bannerCrustBrown: '#2A1810',
    textPrimary: '#212529',
    textSecondary: '#868E96',
    success: '#12B886',
    danger: '#F03E3E',
  },
  fontsVerified: {
    officialSiteFont: 'Krub (identifiée dans le code source de boulangeriesaker.com via Google Fonts)',
    complementaryDisplayFont: 'Fraunces (police éditoriale complémentaire choisie pour faire écho au lettrage serif du logo SAKER — non présentée comme police historique)',
  },
  contacts: {
    primaryPhones: [
      { display: '695 94 46 64', tel: '+237695944664', label: 'Siège social / Salle de fête d’Akwa' },
      { display: '683 35 52 62', tel: '+237683355262', label: 'Siège social / Standard' },
    ],
    assistancePhone: {
      display: '696 12 68 24',
      tel: '+237696126824',
      label: 'Assistance immédiate (relevée sur la page Contact)',
    },
    headquartersLocation: 'Salle de fête d’Akwa, Douala',
    postalBox: 'BP : 2754 Douala (adresse postale uniquement — ne constitue pas une adresse de retrait ou de livraison)',
    emailFromSource: 'contact@boulangerie-saker.cm',
    emailNote: 'Adresse e-mail relevée dans le pied de page du site source (à valider avant activation d’un routage d’e-mails transactionnels).',
    openingHoursSource: 'Lundi – Dimanche : 00h00 – 23h59 (mentionné sur le site source — horaires précis par agence et par service à confirmer avant publication définitive).',
  },
  history: {
    intro:
      'Depuis sa création dans les années 1990 par son promoteur M. TSHOUONGANG Élie Saker, les Boulangeries SAKER sont guidées par l’excellence boulangère et la volonté d’offrir un pain et une pâtisserie de qualité, adaptés aux traditions alimentaires locales.',
    milestones: [
      {
        year: '1990',
        title: 'Première boulangerie à Bepanda (Douala)',
        text: 'Création de la première boulangerie dans la ville de Douala, au quartier Bepanda, par M. TSHOUONGANG Élie Saker grâce à l’acquisition d’un premier four.',
      },
      {
        year: '2006',
        title: 'Seconde unité & naissance du label BOULANGERIE SAKER',
        text: 'L’entreprise investit dans une seconde boulangerie-pâtisserie et développe le label BOULANGERIE SAKER, dont l’image est associée au pain et à la pâtisserie de très bonne qualité.',
      },
      {
        year: '2008 – 2010',
        title: 'Expansion du réseau à Douala',
        text: 'Pour répondre à la croissance démographique de Douala et à une demande accrue, deux unités supplémentaires voient le jour en 2008 et en 2010.',
      },
      {
        year: '2011 – 2019',
        title: 'Développement de nouveaux complexes en ville',
        text: 'Le groupe investit dans de nouvelles unités réparties dans les quartiers à forte concentration démographique de Douala, intégrant boulangerie, pâtisserie, salons de thé, glaciers et salles de fêtes.',
      },
    ],
    historicalMetricsNote:
      'Note sur les chiffres du texte source : la page « À propos » du site mentionne le passage à 5 unités (2008–2010), puis 9 boulangeries-pâtisseries entre 2011 et 2019 et près de 40 % de parts de marché à Douala. Ces données sont attribuées au récit historique du site source et doivent être revalidées par la direction avant d’être présentées comme des chiffres actuels certifiés.',
    founderQuote:
      '« Depuis la création de la Boulangerie Saker, ma vision a toujours été claire : offrir à chaque famille un pain de qualité, accessible et préparé avec passion. Nous avons grandi avec Douala, en restant fidèles à nos valeurs d’authenticité, de rigueur et de proximité. Chaque jour, nos équipes s’engagent à perpétuer cette tradition, tout en innovant pour mieux vous servir. Mon souhait est que la Boulangerie Saker continue d’être non seulement un lieu où l’on achète du pain, mais surtout un espace de partage, de convivialité et de confiance. Merci de faire partie de cette belle histoire. »',
    vision:
      'Fournir aux consommateurs du pain et de la pâtisserie de très bonne qualité tout en respectant scrupuleusement les normes alimentaires.',
    mission:
      'Le personnel des Boulangeries SAKER œuvre au quotidien pour satisfaire la demande et les exigences des clients et consommateurs, dans le strict respect des règles de qualité, d’éthique et d’hygiène.',
    unitsOverview:
      'Les Boulangeries SAKER sont implantées dans plusieurs quartiers à forte concentration démographique de la ville de Douala afin de rester proches des consommateurs.',
  },
  values: [
    {
      id: 'rigueur',
      title: 'La Rigueur',
      description:
        'La quête quotidienne de perfection nous engage à veiller de manière rigoureuse à la réalisation de notre boulangerie-pâtisserie, dans le respect scrupuleux des normes et de la qualité du secteur agroalimentaire.',
    },
    {
      id: 'qualite',
      title: 'La Qualité',
      description:
        'La production d’un pain et d’une pâtisserie soignés avec des pâtissiers expérimentés et des équipements de production modernes, pour garantir une fraîcheur et un goût constants.',
    },
    {
      id: 'ecoute',
      title: 'L’Écoute',
      description:
        'Une communication permanente avec nos clients et consommateurs fidèles, dans le but de répondre avec justesse à leurs besoins quotidiens et événementiels.',
    },
    {
      id: 'conseil',
      title: 'Le Conseil',
      description:
        'Un accompagnement attentif des clients et partenaires, appuyé par nos techniciens agroalimentaires qui veillent au respect des attentes des consommateurs.',
    },
    {
      id: 'dynamisme',
      title: 'Le Dynamisme',
      description:
        'S’appuyer sur notre savoir-faire reconnu en boulangerie et pâtisserie au Cameroun pour proposer des produits et services adaptés aux réalités locales.',
    },
    {
      id: 'competence',
      title: 'La Compétence',
      description:
        'Choisir et former des professionnels aux compétences complémentaires, animés par le goût du travail bien fait et le sens de l’accueil.',
    },
  ] as SakerValue[],
  services: [
    {
      id: 'gateaux-evenements',
      slug: 'gateaux-mariage-anniversaire',
      title: 'Gâteaux de mariage et d’anniversaire',
      shortTitle: 'Mariages & Anniversaires',
      summary:
        'Créations pâtissières d’exception et entremets pour célébrer vos mariages, anniversaires et réceptions, avec service de livraison à domicile dédié.',
      description:
        'Nos pâtissiers réalisent vos entremets et gâteaux de cérémonie pour vos moments précieux. Conformément aux informations officielles de la Boulangerie SAKER, un service de livraison à domicile est proposé spécifiquement pour les gâteaux de mariage et d’anniversaire.',
      highlights: [
        'Entremets et gâteaux de célébration sur mesure',
        'Livraison à domicile disponible pour les gâteaux de mariage et d’anniversaire (modalités à confirmer avec la boulangerie)',
        'Personnalisation du message et du format sur demande validée',
      ],
      deliveryNote: 'Livraison à domicile attestée pour les gâteaux de mariage et d’anniversaire.',
      ctaLabel: 'Demander un devis gâteau',
      image: '/assets/saker/10-boulangerie-saker-douala-cameroun.png',
    },
    {
      id: 'traiteur',
      slug: 'service-traiteur',
      title: 'Service traiteur événementiel',
      shortTitle: 'Service Traiteur',
      summary:
        'Accompagnement gourmand pour vos mariages, anniversaires, colloques, conférences, soutenances et rencontres professionnelles à Douala.',
      description:
        'Les Boulangeries SAKER proposent un service traiteur complet pour les événements qui rassemblent : mariages, anniversaires, colloques, conférences, soutenances et réceptions familiales ou institutionnelles.',
      highlights: [
        'Mariages, anniversaires et réceptions privées',
        'Colloques, conférences, séminaires et soutenances',
        'Assortiments boulangers, viennoiseries, feuilletés et pâtisseries sur devis',
      ],
      ctaLabel: 'Demander un devis traiteur',
      image: '/assets/saker/friande-de-viandet-boulangerie-saker-douala-cameroun.png',
    },
    {
      id: 'salles-de-fetes',
      slug: 'salles-de-fetes',
      title: 'Salles de fêtes SAKER',
      shortTitle: 'Salles de Fêtes',
      summary:
        'Des salles de réception accueillantes à Douala, dont la Salle de fête d’Akwa, pour organiser vos cérémonies et événements.',
      description:
        'Pour accueillir vos réceptions dans un cadre soigné, Boulangerie SAKER met à disposition des salles de fêtes adaptées à vos événements familiaux, associatifs ou professionnels, notamment la Salle de fête d’Akwa à Douala.',
      highlights: [
        'Salle de fête d’Akwa (Siège social) et espaces dédiés',
        'Cadre adapté aux mariages, banquets, conférences et cérémonies',
        'Possibilité de coupler la location avec le service traiteur et la pâtisserie SAKER',
      ],
      ctaLabel: 'Vérifier les disponibilités',
      image: '/assets/saker/12-boulangerie-saker-douala-cameroun.png',
    },
    {
      id: 'salons-de-the',
      slug: 'salons-de-the',
      title: 'Salons de thé modernes',
      shortTitle: 'Salons de Thé',
      summary:
        'Des espaces conviviaux au sein de nos unités pour déguster sur place pains frais, viennoiseries, cakes et pâtisseries.',
      description:
        'Plus qu’un lieu où l’on achète du pain, les Boulangeries SAKER offrent des salons de thé modernes pensés comme des espaces de partage, de détente et de convivialité autour de nos viennoiseries et pâtisseries fraîches.',
      highlights: [
        'Dégustation sur place de pâtisseries fraîches, cakes et viennoiseries',
        'Cadre chaleureux pour vos pauses gourmandes et rendez-vous',
        'Informations et réservations de groupe sur demande',
      ],
      ctaLabel: 'Demander des informations',
      image: '/assets/saker/19-boulangerie-saker-douala-cameroun.png',
    },
    {
      id: 'glaciers',
      slug: 'glaciers-saker',
      title: 'Glaciers modernes (Glaces SAKER)',
      shortTitle: 'Glaciers SAKER',
      summary:
        'Des espaces glaciers modernes intégrés aux Boulangeries SAKER pour vos pauses fraîches en famille ou entre amis.',
      description:
        'Le réseau Boulangerie SAKER comprend également des glaciers modernes proposant les Glaces SAKER. Les parfums et formats disponibles en point de vente varient selon l’unité ; contactez-nous pour toute commande événementielle ou information.',
      highlights: [
        'Espaces glaciers modernes en point de vente',
        'Note : les parfums et tarifs détaillés des Glaces SAKER ne figurant pas dans le catalogue en ligne actuel, aucun produit fictif n’est affiché',
        'Renseignements directs auprès de nos agences à Douala',
      ],
      ctaLabel: 'Se renseigner sur les Glaces SAKER',
      image: '/assets/saker/03-boulangerie-saker-douala-cameroun.png',
    },
  ] as SakerService[],
  agencies: [
    {
      id: 'siege-akwa',
      name: 'Siège Social SAKER — Salle de fête d’Akwa',
      district: 'Akwa, Douala',
      phone: '695 94 46 64 / 683 35 52 62 / 676 26 39 24',
      phoneClean: '+237695944664',
      postalBox: 'BP : 2754 Douala',
      isHeadquarters: true,
      note: 'Siège social et Salle de fête d’Akwa',
    },
    {
      id: 'akwa',
      name: 'Boulangerie SAKER d’Akwa',
      district: 'Akwa, Douala',
      phone: '672 09 29 81',
      phoneClean: '+237672092981',
      postalBox: 'BP : 2754 Douala',
    },
    {
      id: 'makepe',
      name: 'Boulangerie SAKER Makepe',
      district: 'Makepe, Douala',
      phone: '651 48 62 03',
      phoneClean: '+237651486203',
      postalBox: 'BP : 2754 Douala',
    },
    {
      id: 'deido',
      name: 'Boulangerie SAKER Deïdo',
      district: 'Deïdo, Douala',
      phone: '678 85 18 01',
      phoneClean: '+237678851801',
      postalBox: 'BP : 2754 Douala',
    },
    {
      id: 'bali',
      name: 'Boulangerie SAKER Bali',
      district: 'Bali, Douala',
      phone: '678 93 40 10',
      phoneClean: '+237678934010',
      postalBox: 'BP : 2754 Douala',
    },
    {
      id: 'pk10',
      name: 'Boulangerie SAKER PK10',
      district: 'PK10, Douala',
      phone: '676 61 82 68',
      phoneClean: '+237676618268',
      postalBox: 'BP : 2754 Douala',
    },
    {
      id: 'logbaba',
      name: 'SAKER Logbaba',
      district: 'Logbaba, Douala',
      phone: '678 87 04 84',
      phoneClean: '+237678870484',
      postalBox: 'BP : 2754 Douala',
    },
    {
      id: 'beedi',
      name: 'Boulangerie SAKER Beedi',
      district: 'Beedi, Douala',
      phone: '678 51 03 00 / 678 510 030',
      phoneClean: '+237678510030',
      postalBox: 'BP : 2754 Douala',
    },
    {
      id: 'aeroport',
      name: 'Boulangerie SAKER Aéroport',
      district: 'Secteur Aéroport, Douala',
      phone: '673 85 93 69',
      phoneClean: '+237673859369',
      postalBox: 'BP : 2754 Douala',
    },
  ] as SakerAgency[],
};
