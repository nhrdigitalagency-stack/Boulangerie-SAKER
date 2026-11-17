import React, { useEffect } from 'react';
import {
  BookOpen,
  Croissant,
  FileCheck2,
  Heart,
  Home,
  MapPin,
  Phone,
  ShoppingBag,
  Store,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BRAND_CONFIG } from '../config/brand';
import { useSiteData } from '../context/SiteDataContext';
import { useStore } from '../context/StoreContext';

export type ActivePage =
  | 'home'
  | 'shop'
  | 'product'
  | 'services'
  | 'about'
  | 'contact'
  | 'checkout'
  | 'audit'
  | 'admin';

interface LeftNavigationProps {
  activePage: ActivePage;
  selectedCategory: string;
  onlyFavorites: boolean;
  onNavigate: (page: ActivePage, categorySlug?: string, favOnly?: boolean) => void;
  onOpenCartDrawer: () => void;
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

export const LeftNavigation: React.FC<LeftNavigationProps> = ({
  activePage,
  selectedCategory,
  onlyFavorites,
  onNavigate,
  onOpenCartDrawer,
  isMobileMenuOpen,
  onCloseMobileMenu,
}) => {
  const { totalQuantity, favorites } = useStore();
  const { products, categories } = useSiteData();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        onCloseMobileMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, onCloseMobileMenu]);

  const handleNavClick = (page: ActivePage, categorySlug = 'all', favOnly = false) => {
    onNavigate(page, categorySlug, favOnly);
    onCloseMobileMenu();
  };

  const renderNavContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-white text-[#212529]">
      {/* Logo officiel SAKER */}
      <div className="px-4 py-4 border-b border-[#E6DEC8] flex items-center justify-between gap-2 shrink-0">
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 text-left focus-visible:outline-2 focus-visible:outline-[#E31E24] rounded-lg"
          aria-label="Boulangerie SAKER — Retour à l'accueil"
        >
          <img
            src={BRAND_CONFIG.logos.primary}
            alt="Logo officiel Boulangerie SAKER"
            className="h-11 sm:h-12 w-auto object-contain shrink-0"
          />
        </button>

        {isMobile && (
          <button
            type="button"
            onClick={onCloseMobileMenu}
            aria-label="Fermer le menu"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#5C534C] hover:bg-[#F5EFE6] transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Liens de navigation avec défilement fluide sur écrans peu hauts */}
      <nav
        aria-label="Navigation principale"
        className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-5"
      >
        {/* Navigation principale */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-xs font-semibold transition-all whitespace-nowrap ${
              activePage === 'home'
                ? 'bg-[#E31E24] text-white shadow-xs'
                : 'text-[#212529] hover:bg-[#F5EFE6] hover:translate-x-0.5'
            }`}
          >
            <Home className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Accueil</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('shop', 'all', false)}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-[10px] text-xs font-semibold transition-all whitespace-nowrap ${
              activePage === 'shop' && selectedCategory === 'all' && !onlyFavorites
                ? 'bg-[#E31E24] text-white shadow-xs'
                : 'text-[#212529] hover:bg-[#F5EFE6] hover:translate-x-0.5'
            }`}
          >
            <span className="flex items-center gap-3">
              <Store className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Boutique</span>
            </span>
            <span
              className={`text-[11px] tabular-price ${
                activePage === 'shop' && selectedCategory === 'all' && !onlyFavorites
                  ? 'text-white/90'
                  : 'text-[#868E96]'
              }`}
            >
              {products.length}
            </span>
          </button>
        </div>

        {/* Catégories vérifiées du catalogue */}
        <div>
          <p className="px-3 text-[11px] font-bold text-[#868E96] tracking-wide mb-1.5">
            Catégories du catalogue
          </p>
          <div className="space-y-0.5">
            {categories.map((cat) => {
              const isSelected =
                activePage === 'shop' && selectedCategory === cat.slug && !onlyFavorites;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleNavClick('shop', cat.slug, false)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-[10px] text-xs font-medium transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#FFF4F6] text-[#E31E24] font-semibold border border-[#E31E24]/25'
                      : 'text-[#5C534C] hover:bg-[#F5EFE6] hover:text-[#212529] hover:translate-x-0.5'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Croissant className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden="true" />
                    <span className="truncate">{cat.name}</span>
                  </span>
                  <span className="text-[11px] text-[#868E96] tabular-price shrink-0">
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Univers & Pages Institutionnelles */}
        <div>
          <p className="px-3 text-[11px] font-bold text-[#868E96] tracking-wide mb-1.5">
            Maison SAKER &amp; Services
          </p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handleNavClick('services')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-xs font-semibold transition-all whitespace-nowrap ${
                activePage === 'services'
                  ? 'bg-[#E31E24] text-white shadow-xs'
                  : 'text-[#212529] hover:bg-[#F5EFE6] hover:translate-x-0.5'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Nos services</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-xs font-semibold transition-all whitespace-nowrap ${
                activePage === 'about'
                  ? 'bg-[#E31E24] text-white shadow-xs'
                  : 'text-[#212529] hover:bg-[#F5EFE6] hover:translate-x-0.5'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>À propos</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('contact')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-xs font-semibold transition-all whitespace-nowrap ${
                activePage === 'contact'
                  ? 'bg-[#E31E24] text-white shadow-xs'
                  : 'text-[#212529] hover:bg-[#F5EFE6] hover:translate-x-0.5'
              }`}
            >
              <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Contact &amp; Agences</span>
            </button>
          </div>
        </div>

        {/* Sélection & Panier (sans aucun compte client fictif) */}
        <div>
          <p className="px-3 text-[11px] font-bold text-[#868E96] tracking-wide mb-1.5">
            Ma sélection
          </p>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handleNavClick('shop', 'all', true)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-[10px] text-xs font-semibold transition-all whitespace-nowrap ${
                activePage === 'shop' && onlyFavorites
                  ? 'bg-[#E31E24] text-white shadow-xs'
                  : 'text-[#212529] hover:bg-[#F5EFE6] hover:translate-x-0.5'
              }`}
            >
              <span className="flex items-center gap-3">
                <Heart className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Mes favoris</span>
              </span>
              <span
                className={`text-[11px] tabular-price ${
                  activePage === 'shop' && onlyFavorites ? 'text-white' : 'text-[#868E96]'
                }`}
              >
                {favorites.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onCloseMobileMenu();
                onOpenCartDrawer();
              }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-[10px] text-xs font-semibold transition-all whitespace-nowrap ${
                activePage === 'checkout'
                  ? 'bg-[#E31E24] text-white shadow-xs'
                  : 'text-[#212529] hover:bg-[#F5EFE6] hover:translate-x-0.5'
              }`}
            >
              <span className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Mon panier</span>
              </span>
              <span
                className={`text-[11px] font-bold tabular-price ${
                  activePage === 'checkout' ? 'text-white' : 'text-[#E31E24]'
                }`}
              >
                {totalQuantity}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('audit')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-[11px] font-medium transition-all whitespace-nowrap ${
                activePage === 'audit'
                  ? 'bg-[#2A1810] text-white'
                  : 'text-[#5C534C] hover:bg-[#F5EFE6] hover:text-[#212529]'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Audit &amp; Migration SEO</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Pied de navigation gauche : Contact téléphonique vérifié */}
      <div className="p-3.5 border-t border-[#E6DEC8] bg-[#FAF7F2] shrink-0">
        <div className="p-3 rounded-[10px] bg-white border border-[#E6DEC8] space-y-2">
          <p className="text-[11px] font-semibold text-[#212529]">
            Renseignements &amp; Devis
          </p>
          <p className="text-[11px] text-[#5C534C] leading-snug">
            Siège social — Salle de fête d’Akwa, Douala
          </p>
          <a
            href="tel:+237695944664"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E31E24] hover:underline tabular-price"
          >
            <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>695 94 46 64</span>
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Barre latérale gauche fixe sur ordinateur (lg: 1024px+) */}
      <aside
        aria-label="Menu latéral Boulangerie SAKER"
        className="hidden lg:flex lg:flex-col w-[225px] shrink-0 border-r border-[#E6DEC8] bg-white sticky top-0 h-screen"
      >
        {renderNavContent(false)}
      </aside>

      {/* Menu latéral mobile / tablette (< lg) avec transition fluide */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden flex"
            role="dialog"
            aria-modal="true"
            aria-label="Menu principal"
          >
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50"
              onClick={onCloseMobileMenu}
              aria-hidden="true"
            />
            <motion.div
              initial={shouldReduceMotion ? { x: 0 } : { x: '-100%' }}
              animate={{ x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-[275px] max-w-[85vw] h-full bg-white shadow-2xl flex flex-col"
            >
              {renderNavContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
