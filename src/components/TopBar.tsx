import React from 'react';
import { Heart, Menu, Phone, Search, ShoppingBag, X } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { useStore } from '../context/StoreContext';
import { ActivePage } from './LeftNavigation';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
  onOpenMobileMenu: () => void;
  onOpenCart: () => void;
  onOpenFavorites: () => void;
  onNavigateHome: () => void;
  activePage: ActivePage;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onOpenMobileMenu,
  onOpenCart,
  onOpenFavorites,
  onNavigateHome,
  activePage,
}) => {
  const { totalQuantity, favorites } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-xs border-b border-[#E6DEC8] px-3.5 sm:px-6 py-2.5 sm:py-3">
      <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-2.5 sm:gap-4">
        {/* Zone 1 : Bouton Menu + Logo sur Mobile/Tablette */}
        <div className="flex items-center gap-2 lg:hidden shrink-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Ouvrir le menu de navigation"
            className="w-10 h-10 rounded-[10px] bg-white border border-[#E6DEC8] flex items-center justify-center text-[#212529] hover:bg-[#F5EFE6] transition-colors focus-visible:outline-2 focus-visible:outline-[#E31E24]"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onNavigateHome}
            aria-label="Boulangerie SAKER — Accueil"
            className="focus-visible:outline-2 focus-visible:outline-[#E31E24] rounded"
          >
            <img
              src={BRAND_CONFIG.logos.primary}
              alt="Boulangerie SAKER"
              className="h-8 sm:h-10 w-auto object-contain"
            />
          </button>
        </div>

        {/* Zone 2 : Barre de recherche accessible (pleine largeur sur mobile, centrale sur md+) */}
        <form
          onSubmit={handleSubmit}
          role="search"
          aria-label="Rechercher un produit dans le catalogue SAKER"
          className="order-3 md:order-2 w-full md:flex-1 md:max-w-xl"
        >
          <div className="relative flex items-center">
            <label htmlFor="saker-global-search" className="sr-only">
              Rechercher un produit (ex. Pain Saker, Forêt noire, Cake, Sablé)
            </label>
            <Search
              className="w-4 h-4 text-[#868E96] absolute left-3.5 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="saker-global-search"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher un pain, un entremet, un cake, un sablé..."
              className="w-full pl-9 sm:pl-10 pr-9 py-2 sm:py-2.5 rounded-[10px] bg-white border border-[#E6DEC8] text-xs sm:text-sm text-[#212529] placeholder:text-[#868E96] focus:outline-none focus:border-[#E31E24] focus:ring-2 focus:ring-[#E31E24]/15 transition-all"
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

        {/* Zone 3 : Actions rapides réelles (Contact direct, Favoris, Panier) */}
        <div className="order-2 md:order-3 flex items-center gap-1.5 sm:gap-2 shrink-0">
          <a
            href="tel:+237695944664"
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-white border border-[#E6DEC8] hover:border-[#D4C5AE] text-xs font-semibold text-[#212529] transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            title="Appeler le siège social Boulangerie SAKER à Douala"
          >
            <Phone className="w-3.5 h-3.5 text-[#E31E24] shrink-0" aria-hidden="true" />
            <span className="tabular-price">695 94 46 64</span>
          </a>

          <button
            type="button"
            onClick={onOpenFavorites}
            aria-label={`Voir mes favoris (${favorites.length})`}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-[10px] border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
              activePage === 'shop' && favorites.length > 0
                ? 'bg-white border-[#E6DEC8] text-[#212529] hover:border-[#E31E24]'
                : 'bg-white border-[#E6DEC8] text-[#212529] hover:bg-[#F5EFE6]'
            }`}
          >
            <Heart
              className={`w-4 h-4 shrink-0 ${
                favorites.length > 0 ? 'text-[#E31E24] fill-[#E31E24]' : 'text-[#5C534C]'
              }`}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">Favoris</span>
            <span className="text-[11px] font-bold tabular-price text-[#5C534C]">
              ({favorites.length})
            </span>
          </button>

          {/* Bouton Panier toujours visible dans la barre supérieure */}
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Ouvrir mon panier (${totalQuantity} articles)`}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[40px] shadow-xs"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Panier</span>
            <span className="tabular-price font-bold">({totalQuantity})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
