import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarHeart,
  Check,
  Clock,
  Croissant,
  MapPin,
  Phone,
  Plus,
  Sparkles,
  Store,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BRAND_CONFIG } from '../config/brand';
import { formatPriceFCFA, Product } from '../data/catalog';
import { useSiteData } from '../context/SiteDataContext';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { ProductImage } from '../components/ProductImage';
import { ActivePage } from '../components/LeftNavigation';

interface HomePageProps {
  onNavigate: (page: ActivePage, categorySlug?: string) => void;
  onSelectProduct: (product: Product) => void;
  onSelectServiceForQuote: (serviceId: string) => void;
}

type HeroShowcaseTab = 'panification' | 'patisserie' | 'pause-gourmande';

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectProduct,
  onSelectServiceForQuote,
}) => {
  const { addToCart } = useStore();
  const { products, categories, siteContent } = useSiteData();
  const shouldReduceMotion = useReducedMotion();

  const [activeHomeCategory, setActiveHomeCategory] = useState<string>('all');
  const [heroTab, setHeroTab] = useState<HeroShowcaseTab>('panification');
  const [addedHeroId, setAddedHeroId] = useState<number | null>(null);

  const featuredProducts = React.useMemo(() => {
    if (activeHomeCategory === 'all') {
      const flagged = products.filter((p) => p.featured);
      if (flagged.length >= 4) return flagged.slice(0, 8);
      const priorityIds = [3090, 3050, 3106, 3097, 3074, 3069, 3035, 3132];
      const byPriority = priorityIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p));
      return byPriority.length > 0 ? byPriority : products.slice(0, 8);
    }
    return products.filter((p) => p.categorySlug === activeHomeCategory).slice(0, 8);
  }, [activeHomeCategory, products]);

  // Produits vedettes par univers pour la vitrine Hero interactive
  const painSaker = products.find((p) => p.id === 3090) || products[0];
  const painViennois = products.find((p) => p.id === 3074) || products[1] || products[0];
  const foretNoire =
    products.find((p) => p.id === 3050) ||
    products.find((p) => p.categorySlug === 'patisserie-fraiche') ||
    products[0];
  const vanilleFraise =
    products.find((p) => p.id === 3069) ||
    products.filter((p) => p.categorySlug === 'patisserie-fraiche')[1] ||
    foretNoire;
  const friandsViande =
    products.find((p) => p.id === 3097) ||
    products.find((p) => p.categorySlug === 'pate-feuilletee') ||
    products[0];
  const cakeCoeur =
    products.find((p) => p.id === 3106) ||
    products.find((p) => p.categorySlug === 'autres-viennoiserie') ||
    products[0];

  const heroUniverses = {
    panification: {
      ...siteContent.home.universes.panification,
      ctaCategory: 'panification',
      bannerImg: BRAND_CONFIG.banners.painSaker,
      bannerAlt: 'Bannière officielle Pain Saker',
      spotlightProducts: [painSaker, painViennois].filter(Boolean),
    },
    patisserie: {
      ...siteContent.home.universes.patisserie,
      ctaCategory: 'patisserie-fraiche',
      bannerImg: foretNoire?.image || BRAND_CONFIG.banners.painSaker,
      bannerAlt: 'Entremet Forêt noire Boulangerie SAKER',
      spotlightProducts: [foretNoire, vanilleFraise].filter(Boolean),
    },
    'pause-gourmande': {
      ...siteContent.home.universes.pauseGourmande,
      ctaCategory: 'autres-viennoiserie',
      bannerImg: BRAND_CONFIG.banners.beignetSaker,
      bannerAlt: 'Spécialités gourmandes SAKER',
      spotlightProducts: [friandsViande, cakeCoeur].filter(Boolean),
    },
  };

  const currentHero = heroUniverses[heroTab];

  const handleQuickHeroAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedHeroId(product.id);
    window.setTimeout(() => setAddedHeroId(null), 1100);
  };

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* A. VITRINE PRINCIPALE GOURMANDE INTERACTIVE */}
      <section
        aria-label="Vitrine Boulangerie SAKER"
        className="relative rounded-[18px] sm:rounded-[22px] overflow-hidden bg-[#2A1810] text-white border border-[#3D2418] shadow-[0_14px_34px_rgba(42,24,16,0.16)]"
      >
        {/* Barre supérieure de sélection des 3 univers gourmands SAKER */}
        <div className="bg-[#21120B] border-b border-white/10 px-3.5 sm:px-8 py-2.5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div
            role="tablist"
            aria-label="Choisir un univers Boulangerie SAKER"
            className="flex items-center gap-1.5 sm:gap-2"
          >
            {(
              [
                { id: 'panification', label: '01. Pains & Fournées' },
                { id: 'patisserie', label: '02. Entremets & Célébrations' },
                { id: 'pause-gourmande', label: '03. Friands, Cakes & Pause salée' },
              ] as const
            ).map((tab) => {
              const active = heroTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setHeroTab(tab.id)}
                  className={`relative px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active ? 'text-[#212529]' : 'text-[#EAE0D5]/80 hover:text-white'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="hero-universe-pill"
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 rounded-lg bg-[#F5B316]"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <span className="hidden xl:inline-flex items-center gap-1.5 text-[11px] text-[#EAE0D5]/80 whitespace-nowrap">
            <MapPin className="w-3.5 h-3.5 text-[#F5B316]" aria-hidden="true" />
            <span>9 points de présence à Douala · Prix officiels en FCFA</span>
          </span>
        </div>

        {/* Contenu animé de la vitrine */}
        <AnimatePresence mode="wait">
          <motion.div
            key={heroTab}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 items-stretch"
          >
            {/* Colonne éditoriale */}
            <div className="lg:col-span-7 p-5 sm:p-8 lg:p-10 flex flex-col justify-between gap-6">
              <div className="space-y-3.5 sm:space-y-4">
                <div className="inline-flex items-center gap-2 text-xs text-[#F5B316] font-semibold tracking-wide">
                  <Croissant className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{currentHero.badge}</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-[38px] font-bold leading-[1.15] text-white">
                  {currentHero.title}
                </h1>

                <p className="text-xs sm:text-base text-[#EAE0D5] leading-relaxed max-w-xl">
                  {currentHero.subtitle}
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <motion.button
                    type="button"
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                    onClick={() => onNavigate('shop', currentHero.ctaCategory)}
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-3 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B316]"
                  >
                    <span>{currentHero.ctaPrimaryLabel}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => onNavigate('shop', 'all')}
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-3 rounded-[10px] bg-white/10 hover:bg-white/18 text-white border border-white/20 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5B316]"
                  >
                    <span>Tout le catalogue ({products.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('contact')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-3 rounded-[10px] text-xs font-semibold text-[#F5B316] hover:text-white transition-colors whitespace-nowrap"
                  >
                    <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Carte des agences</span>
                  </button>
                </div>

                {/* Aperçu visuel de la bannière officielle SAKER associée */}
                <div className="hidden sm:flex items-center gap-3.5 p-2.5 rounded-[12px] bg-black/25 border border-white/10">
                  <div className="w-20 h-12 rounded-lg overflow-hidden bg-[#3D2418] shrink-0">
                    <img
                      src={currentHero.bannerImg || BRAND_CONFIG.banners.painSaker}
                      alt={currentHero.bannerAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">
                      Savoir-faire Boulangerie SAKER — Douala
                    </p>
                    <p className="text-[11px] text-[#EAE0D5]/80 truncate">
                      Commandez en ligne ou retirez vos produits dans nos 9 agences de proximité.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne visuelle gourmande avec vrais produits SAKER interactifs */}
            <div className="lg:col-span-5 bg-[#362015] p-4 sm:p-6 flex flex-col justify-between gap-3.5 border-t lg:border-t-0 lg:border-l border-white/10">
              <div className="flex items-center justify-between text-xs text-[#EAE0D5]">
                <span className="font-semibold text-[#F5B316]">Sélection directe de l’univers</span>
                <span className="text-[11px] opacity-80">Ajout immédiat au panier</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 my-auto">
                {currentHero.spotlightProducts.map((prod) => {
                  const isAdded = addedHeroId === prod.id;
                  return (
                    <motion.div
                      key={prod.id}
                      whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                      onClick={() => onSelectProduct(prod)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectProduct(prod);
                        }
                      }}
                      className="group cursor-pointer text-left bg-[#FAF7F2] rounded-[14px] p-3 text-[#212529] hover:ring-2 hover:ring-[#F5B316] transition-all flex flex-col justify-between shadow-md"
                    >
                      <div>
                        <div className="aspect-square w-full rounded-[10px] bg-gradient-to-b from-[#F8F3EB] to-[#EFE6D5] mb-2.5 overflow-hidden relative">
                          <ProductImage
                            src={prod.image}
                            alt={prod.name}
                            priority
                            className="w-full h-full p-2"
                            imgClassName="transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <span className="block text-[10px] text-[#5C534C] font-medium truncate">
                          {prod.category}
                        </span>
                        <span className="block text-xs sm:text-sm font-bold text-[#212529] truncate mt-0.5">
                          {prod.name}
                        </span>
                      </div>

                      <div className="pt-2 mt-2 border-t border-[#E6DEC8] flex items-center justify-between gap-1.5">
                        <span className="text-xs sm:text-sm font-bold text-[#E31E24] tabular-price whitespace-nowrap">
                          {formatPriceFCFA(prod.price)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleQuickHeroAdd(e, prod)}
                          aria-label={`Ajouter ${prod.name} au panier`}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                            isAdded
                              ? 'bg-[#099268] text-white'
                              : 'bg-[#E31E24] hover:bg-[#C8161C] text-white'
                          }`}
                        >
                          {isAdded ? (
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="px-3.5 py-2.5 rounded-[10px] bg-black/30 text-[11px] text-[#EAE0D5] flex items-center justify-between gap-2">
                <span>{products.length} références officielles en ligne</span>
                <span className="text-[#F5B316] font-bold tabular-price">50 à 25 000 FCFA</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* B. BANDEAU DE RÉASSURANCE MÉTIER (Ultra-responsive 2x2 sur mobile, 4 colonnes sur desktop) */}
      <section
        aria-label="Points forts Boulangerie SAKER"
        className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4"
      >
        {siteContent.home.reassuranceItems.map((item, index) => {
          const icons = [Award, Store, Croissant, Clock];
          const IconComponent = icons[index % icons.length];
          return (
            <div
              key={index}
              className="bg-white rounded-[14px] border border-[#E6DEC8] p-3.5 sm:p-4 flex items-start gap-3 shadow-[0_2px_10px_rgba(42,24,16,0.03)]"
            >
              <div className="w-9 h-9 rounded-[10px] bg-[#FFF4F6] border border-[#E31E24]/20 flex items-center justify-center text-[#E31E24] shrink-0">
                <IconComponent className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-sm font-bold text-[#212529] font-sans truncate">
                  {item.title}
                </h2>
                <p className="text-[11px] text-[#5C534C] leading-snug mt-0.5 line-clamp-2">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* C. ACCÈS RAPIDE AUX CATÉGORIES VÉRIFIÉES */}
      <section aria-labelledby="home-categories-heading" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2
              id="home-categories-heading"
              className="text-xl sm:text-2xl font-bold text-[#212529]"
            >
              {siteContent.home.categoriesHeading}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C534C] mt-0.5">
              {siteContent.home.categoriesSubheading}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('shop', 'all')}
            className="text-xs font-semibold text-[#E31E24] hover:underline inline-flex items-center gap-1 self-start sm:self-auto whitespace-nowrap"
          >
            <span>Voir toute la boutique</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              type="button"
              whileHover={shouldReduceMotion ? undefined : { y: -4 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              onClick={() => onNavigate('shop', cat.slug)}
              className="group bg-white hover:bg-[#FFF4F6]/35 rounded-[14px] p-3 sm:p-3.5 border border-[#E6DEC8] hover:border-[#E31E24]/40 transition-colors text-left flex flex-col justify-between gap-2.5 shadow-[0_2px_10px_rgba(42,24,16,0.04)] hover:shadow-[0_12px_24px_rgba(42,24,16,0.08)] focus-visible:outline-2 focus-visible:outline-[#E31E24]"
            >
              <div className="w-full aspect-[4/3] rounded-[10px] bg-gradient-to-b from-[#F8F3EB] to-[#F2E9DC] overflow-hidden">
                <ProductImage
                  src={cat.representativeImage}
                  alt={cat.name}
                  className="w-full h-full p-2"
                  imgClassName="transition-transform duration-300 group-hover:scale-108"
                />
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-[#212529] group-hover:text-[#E31E24] transition-colors font-sans truncate">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-[#868E96] tabular-price mt-0.5">
                    {cat.count} {cat.count > 1 ? 'références' : 'référence'}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="w-6 h-6 rounded-full bg-[#FAF7F2] group-hover:bg-[#E31E24] text-[#5C534C] group-hover:text-white flex items-center justify-center transition-colors shrink-0"
                >
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Précision sur l'organisation Gâteaux / Anniversaire / Glaces SAKER */}
        <div className="p-3.5 sm:p-4 rounded-[12px] bg-white border border-[#E6DEC8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#5C534C]">
          <p>
            <strong className="text-[#212529]">Gâteaux d’anniversaire &amp; Glaces SAKER :</strong>{' '}
            Nos entremets de fête sont regroupés dans la catégorie{' '}
            <button
              type="button"
              onClick={() => onNavigate('shop', 'patisserie-fraiche')}
              className="text-[#E31E24] font-semibold underline underline-offset-2"
            >
              Pâtisserie fraîche
            </button>
            . Pour nos glaciers modernes et commandes spéciales de mariage, consultez nos services.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('services')}
            className="text-xs font-semibold text-[#212529] hover:text-[#E31E24] whitespace-nowrap shrink-0 underline underline-offset-2"
          >
            En savoir plus →
          </button>
        </div>
      </section>

      {/* D. SÉLECTION DE PRODUITS ("Découvrez nos produits") AVEC FILTRES ANIMÉS */}
      <section aria-labelledby="home-products-heading" className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2
              id="home-products-heading"
              className="text-xl sm:text-2xl font-bold text-[#212529]"
            >
              {siteContent.home.productsHeading}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C534C] mt-0.5">
              {siteContent.home.productsSubheading}
            </p>
          </div>

          {/* Barre de filtrage fonctionnelle par catégorie avec indicateur animé */}
          <div
            role="group"
            aria-label="Filtrer la sélection par catégorie"
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0"
          >
            {[
              { slug: 'all', name: 'Sélection complète' },
              ...categories.map((c) => ({ slug: c.slug, name: c.name })),
            ].map((tab) => {
              const isActive = activeHomeCategory === tab.slug;
              return (
                <button
                  key={tab.slug}
                  type="button"
                  onClick={() => setActiveHomeCategory(tab.slug)}
                  className={`relative px-3.5 py-2 rounded-[10px] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-white'
                      : 'bg-white text-[#5C534C] border border-[#E6DEC8] hover:text-[#212529]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="home-category-filter-pill"
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 rounded-[10px] bg-[#E31E24] shadow-xs"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeHomeCategory}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-2.5 sm:gap-5"
          >
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center pt-2">
          <motion.button
            type="button"
            whileHover={shouldReduceMotion ? undefined : { y: -2 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            onClick={() => onNavigate('shop', activeHomeCategory)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[10px] bg-white hover:bg-[#F5EFE6] border border-[#E6DEC8] text-xs sm:text-sm font-semibold text-[#212529] transition-colors whitespace-nowrap shadow-xs"
          >
            <span>Accéder à l’ensemble du catalogue ({products.length} produits)</span>
            <ArrowRight className="w-4 h-4 text-[#E31E24]" aria-hidden="true" />
          </motion.button>
        </div>
      </section>

      {/* E. ENCARTS DE SERVICES VÉRIFIÉS AVEC VISUELS GOURMANDS */}
      <section aria-labelledby="home-services-heading" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2
              id="home-services-heading"
              className="text-xl sm:text-2xl font-bold text-[#212529]"
            >
              Nos services &amp; espaces à Douala
            </h2>
            <p className="text-xs sm:text-sm text-[#5C534C] mt-0.5">
              Au-delà de la boulangerie-pâtisserie, SAKER vous accompagne pour vos réceptions et
              moments de détente
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('services')}
            className="text-xs font-semibold text-[#E31E24] hover:underline inline-flex items-center gap-1 self-start sm:self-auto whitespace-nowrap"
          >
            <span>Tous nos services &amp; devis</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {siteContent.servicesPage.services.slice(0, 3).map((srv) => (
            <motion.article
              key={srv.id}
              whileHover={shouldReduceMotion ? undefined : { y: -4 }}
              transition={{ duration: 0.22 }}
              className="group bg-white rounded-[14px] border border-[#E6DEC8] overflow-hidden flex flex-col justify-between shadow-[0_2px_12px_rgba(42,24,16,0.04)] hover:shadow-[0_12px_28px_rgba(42,24,16,0.08)]"
            >
              <div>
                <div className="aspect-[16/10] w-full bg-gradient-to-b from-[#F8F3EB] to-[#EFE6D5] border-b border-[#EFE9DC] overflow-hidden">
                  <ProductImage
                    src={srv.image}
                    alt={srv.title}
                    className="w-full h-full p-4"
                    imgClassName="transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 sm:p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#E31E24]">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{srv.shortTitle}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#212529] font-sans">{srv.title}</h3>
                  <p className="text-xs text-[#5C534C] leading-relaxed">{srv.summary}</p>
                </div>
              </div>

              <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                <button
                  type="button"
                  onClick={() => onSelectServiceForQuote(srv.id)}
                  className="w-full py-2.5 px-3.5 rounded-[10px] bg-[#FAF7F2] hover:bg-[#E31E24] border border-[#E6DEC8] hover:border-[#E31E24] text-xs font-semibold text-[#212529] hover:text-white transition-colors flex items-center justify-between"
                >
                  <span>{srv.ctaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Seconde rangée : Salons de thé & Glaciers modernes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {siteContent.servicesPage.services.slice(3, 5).map((srv) => (
            <article
              key={srv.id}
              className="bg-white rounded-[14px] border border-[#E6DEC8] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_2px_10px_rgba(42,24,16,0.03)]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-[12px] bg-[#F5EFE6] border border-[#E6DEC8] shrink-0 overflow-hidden">
                  <ProductImage src={srv.image} alt={srv.title} className="w-full h-full p-2" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-[#212529] font-sans">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-[#5C534C] leading-relaxed">{srv.summary}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectServiceForQuote(srv.id)}
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] hover:bg-[#F5EFE6] border border-[#E6DEC8] text-xs font-semibold text-[#212529] transition-colors whitespace-nowrap shrink-0 text-center"
              >
                {srv.ctaLabel}
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* F. PRÉSENTATION COURTE DE L'ENTREPRISE & COORDONNÉES */}
      <section
        aria-labelledby="home-history-heading"
        className="rounded-[16px] bg-white border border-[#E6DEC8] p-5 sm:p-8 shadow-[0_2px_12px_rgba(42,24,16,0.04)]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#E31E24]">
              <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Notre histoire à Douala depuis 1990</span>
            </div>

            <h2
              id="home-history-heading"
              className="text-xl sm:text-2xl font-bold text-[#212529]"
            >
              {siteContent.home.historyHeading}
            </h2>

            <p className="text-xs sm:text-sm text-[#5C534C] leading-relaxed">
              {siteContent.home.historyBody}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C534C] pt-1">
              {BRAND_CONFIG.values.map((val, idx) => (
                <React.Fragment key={val.id}>
                  <span className="font-semibold text-[#212529]">{val.title}</span>
                  {idx < BRAND_CONFIG.values.length - 1 && <span aria-hidden="true">·</span>}
                </React.Fragment>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => onNavigate('about')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#212529] hover:bg-[#343A40] text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <span>Découvrir toute notre histoire</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#FAF7F2] hover:bg-[#F5EFE6] border border-[#E6DEC8] text-xs font-semibold text-[#212529] transition-colors whitespace-nowrap"
              >
                <MapPin className="w-3.5 h-3.5 text-[#E31E24]" aria-hidden="true" />
                <span>Carte &amp; Agences à Douala</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#FAF7F2] rounded-[14px] p-4 sm:p-5 border border-[#E6DEC8] space-y-3.5">
            <div className="flex items-center gap-2.5">
              <CalendarHeart className="w-5 h-5 text-[#E31E24] shrink-0" aria-hidden="true" />
              <h3 className="text-sm font-bold text-[#212529] font-sans">
                Contact &amp; Commandes d’événements
              </h3>
            </div>
            <p className="text-xs text-[#5C534C] leading-relaxed">
              Pour vos gâteaux d’anniversaire, gâteaux de mariage (avec service de livraison à
              domicile dédié) ou demandes de service traiteur :
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-2 py-1.5 border-b border-[#E6DEC8]">
                <span className="text-[#5C534C]">Siège social</span>
                <span className="font-semibold text-[#212529] text-right">
                  Salle de fête d’Akwa, Douala
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 py-1.5 border-b border-[#E6DEC8]">
                <span className="text-[#5C534C]">Téléphones</span>
                <div className="flex items-center gap-1.5 font-bold text-[#E31E24] tabular-price">
                  <a href="tel:+237695944664" className="hover:underline">
                    695 94 46 64
                  </a>
                  <span>/</span>
                  <a href="tel:+237683355262" className="hover:underline">
                    683 35 52 62
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 py-1.5">
                <span className="text-[#5C534C]">Boîte postale</span>
                <span className="font-medium text-[#212529]">BP : 2754 Douala</span>
              </div>
            </div>
            <a
              href="tel:+237695944664"
              className="w-full py-2.5 px-4 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Appeler le 695 94 46 64</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
