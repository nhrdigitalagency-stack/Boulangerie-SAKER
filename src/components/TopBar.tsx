import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Heart, Menu, Phone, Search, ShoppingBag, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BRAND_CONFIG } from '../config/brand';
import { useSiteData } from '../context/SiteDataContext';
import { useStore } from '../context/StoreContext';
import { ActivePage } from './LeftNavigation';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
  onOpenMobileMenu: () => void;
  onOpenCart: () => void;
  onOpenFavorites: () => void;
  onNavigate: (page: ActivePage, categorySlug?: string, favOnly?: boolean) => void;
  activePage: ActivePage;
  selectedCategory?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onOpenMobileMenu,
  onOpenCart,
  onOpenFavorites,
  onNavigate,
  activePage,
  selectedCategory = 'all',
}) => {
  const { totalQuantity, favorites } = useStore();
  const { categories, products } = useSiteData();
  const shouldReduceMotion = useReducedMotion();

  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCatalogOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsCatalogOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };

  const navItems: Array<{ id: ActivePage; label: string }> = [
    { id: 'home', label: 'Accueil' },
    { id: 'shop', label: 'Boutique' },
    { id: 'services', label: 'Nos services' },
    { id: 'about', label: 'À propos' },
    { id: 'contact', label: 'Contact & Agences' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-[#E6DEC8] px-4 sm:px-6 lg:px-10 xl:px-14 py-2.5 sm:py-3 shadow-[0_2px_12px_rgba(42,24,16,0.03)]">
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 lg:gap-5">
        {/* Zone 1 : Bouton Menu Mobile + Logo officiel SAKER (toujours visible) */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Ouvrir le menu de navigation"
            className="lg:hidden w-10 h-10 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] flex items-center justify-center text-[#212529] hover:bg-[#F5EFE6] hover:border-[#D4C5AE] transition-colors focus-visible:outline-2 focus-visible:outline-[#E31E24]"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('home')}
            aria-label="Boulangerie SAKER — Retour à l'accueil"
            className="group focus-visible:outline-2 focus-visible:outline-[#E31E24] rounded-lg transition-transform duration-200 hover:scale-[1.02]"
          >
            <img
              src={BRAND_CONFIG.logos.primary}
              alt="Boulangerie SAKER"
              className="h-9 sm:h-11 lg:h-12 w-auto object-contain"
            />
          </button>
        </div>

        {/* Zone 2 : Navigation horizontale complète sur ordinateur (lg+) */}
        <nav
          aria-label="Navigation principale"
          className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0"
        >
          {navItems.map((item) => {
            const isActive =
              item.id === 'shop'
                ? activePage === 'shop' || activePage === 'product'
                : activePage === item.id;

            if (item.id === 'shop') {
              return (
                <div
                  key={item.id}
                  ref={dropdownRef}
                  className="relative"
                  onMouseEnter={() => setIsCatalogOpen(true)}
                  onMouseLeave={() => setIsCatalogOpen(false)}
                >
                  <button
                    type="button"
                    aria-expanded={isCatalogOpen}
                    onClick={() => {
                      onNavigate('shop', 'all', false);
                      setIsCatalogOpen(false);
                    }}
                    className={`relative px-3 py-2 rounded-[10px] text-xs xl:text-[13px] font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-[#E31E24]'
                        : 'text-[#212529] hover:text-[#E31E24] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isCatalogOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                    {isActive && (
                      <motion.span
                        layoutId="desktop-nav-indicator"
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute bottom-0.5 left-3 right-3 h-[2px] rounded-full bg-[#E31E24]"
                        aria-hidden="true"
                      />
                    )}
                  </button>

                  <AnimatePresence>
                    {isCatalogOpen && (
                      <motion.div
                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute left-0 top-full pt-2 w-72 z-50"
                      >
                        <div className="bg-white rounded-[14px] border border-[#E6DEC8] shadow-[0_14px_34px_rgba(42,24,16,0.12)] p-2 space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              onNavigate('shop', 'all', false);
                              setIsCatalogOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-[10px] text-xs font-semibold transition-colors ${
                              activePage === 'shop' && selectedCategory === 'all'
                                ? 'bg-[#FFF4F6] text-[#E31E24]'
                                : 'text-[#212529] hover:bg-[#FAF7F2] hover:text-[#E31E24]'
                            }`}
                          >
                            <span>Tout le catalogue</span>
                            <span className="text-[11px] text-[#868E96] tabular-price">
                              {products.length}
                            </span>
                          </button>

                          <div className="h-px bg-[#EFE9DC] my-1" />

                          {categories.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                onNavigate('shop', cat.slug, false);
                                setIsCatalogOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-[10px] text-xs font-medium transition-all hover:translate-x-0.5 ${
                                activePage === 'shop' && selectedCategory === cat.slug
                                  ? 'bg-[#FFF4F6] text-[#E31E24] font-semibold'
                                  : 'text-[#5C534C] hover:bg-[#FAF7F2] hover:text-[#212529]'
                              }`}
                            >
                              <span className="truncate">{cat.name}</span>
                              <span className="text-[11px] text-[#868E96] tabular-price shrink-0">
                                {cat.count}
                              </span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative px-3 py-2 rounded-[10px] text-xs xl:text-[13px] font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-[#E31E24]'
                    : 'text-[#212529] hover:text-[#E31E24] hover:bg-[#FAF7F2]'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="desktop-nav-indicator"
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute bottom-0.5 left-3 right-3 h-[2px] rounded-full bg-[#E31E24]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3 : Barre de recherche accessible */}
        <form
          onSubmit={handleSubmit}
          role="search"
          aria-label="Rechercher un produit dans le catalogue SAKER"
          className="order-3 lg:order-none w-full lg:flex-1 lg:max-w-sm xl:max-w-md"
        >
          <div className="relative flex items-center group">
            <label htmlFor="saker-global-search" className="sr-only">
              Rechercher un produit (ex. Pain Saker, Forêt noire, Cake, Sablé)
            </label>
            <Search
              className="w-4 h-4 text-[#868E96] group-focus-within:text-[#E31E24] transition-colors absolute left-3.5 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="saker-global-search"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher un pain, entremet, cake..."
              className="w-full pl-9 sm:pl-10 pr-9 py-2 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] hover:border-[#D4C5AE] text-xs sm:text-sm text-[#212529] placeholder:text-[#868E96] focus:bg-white focus:outline-none focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/15 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Effacer la recherche"
                className="absolute right-2.5 p-1 text-[#868E96] hover:text-[#212529] rounded"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </form>

        {/* Zone 4 : Actions rapides réelles (Contact direct, Favoris, Panier) */}
        <div className="order-2 lg:order-none flex items-center gap-1.5 sm:gap-2 shrink-0">
          <a
            href="tel:+237695944664"
            className="hidden 2xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] hover:border-[#E31E24]/40 hover:bg-white text-xs font-semibold text-[#212529] transition-all whitespace-nowrap shrink-0 min-h-[40px]"
            title="Appeler le siège social Boulangerie SAKER à Douala"
          >
            <Phone className="w-3.5 h-3.5 text-[#E31E24] shrink-0" aria-hidden="true" />
            <span className="tabular-price">695 94 46 64</span>
          </a>

          <motion.button
            type="button"
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            onClick={onOpenFavorites}
            aria-label={`Voir mes favoris (${favorites.length})`}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-[10px] border border-[#E6DEC8] bg-[#FAF7F2] hover:bg-white hover:border-[#E31E24]/40 text-xs font-semibold text-[#212529] transition-all whitespace-nowrap shrink-0 min-h-[40px]"
          >
            <Heart
              className={`w-4 h-4 shrink-0 transition-transform ${
                favorites.length > 0 ? 'text-[#E31E24] fill-[#E31E24]' : 'text-[#5C534C]'
              }`}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">Favoris</span>
            <span className="text-[11px] font-bold tabular-price text-[#5C534C]">
              ({favorites.length})
            </span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            onClick={onOpenCart}
            aria-label={`Ouvrir mon panier (${totalQuantity} articles)`}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] text-white text-xs font-semibold transition-all whitespace-nowrap shrink-0 min-h-[40px] shadow-xs hover:shadow-md"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Panier</span>
            <span className="tabular-price font-bold">({totalQuantity})</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
