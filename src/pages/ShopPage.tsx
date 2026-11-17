import React, { useMemo, useState } from 'react';
import { ArrowUpDown, Heart, RotateCcw, Search, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { normalizeSearchText, Product } from '../data/catalog';
import { useSiteData } from '../context/SiteDataContext';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

interface ShopPageProps {
  selectedCategory: string;
  onSelectCategory: (catSlug: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onlyFavorites: boolean;
  onToggleOnlyFavorites: (val: boolean) => void;
  onSelectProduct: (product: Product) => void;
}

type SortOption = 'default' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';
type BudgetFilter = 'all' | 'under-1000' | '1000-5000' | 'over-5000';

export const ShopPage: React.FC<ShopPageProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onlyFavorites,
  onToggleOnlyFavorites,
  onSelectProduct,
}) => {
  const { favorites } = useStore();
  const { products, categories } = useSiteData();
  const shouldReduceMotion = useReducedMotion();
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [budgetFilter, setBudgetFilter] = useState<BudgetFilter>('all');

  const activeCategoryInfo = useMemo(
    () => categories.find((c) => c.slug === selectedCategory),
    [categories, selectedCategory]
  );

  const filteredProducts = useMemo(() => {
    const normQuery = normalizeSearchText(searchQuery);

    const list = products.filter((product) => {
      if (onlyFavorites && !favorites.includes(product.id)) {
        return false;
      }
      if (selectedCategory !== 'all' && product.categorySlug !== selectedCategory) {
        return false;
      }
      if (budgetFilter === 'under-1000' && product.price > 1000) {
        return false;
      }
      if (budgetFilter === '1000-5000' && (product.price <= 1000 || product.price > 5000)) {
        return false;
      }
      if (budgetFilter === 'over-5000' && product.price <= 5000) {
        return false;
      }
      if (normQuery) {
        const haystack = normalizeSearchText(
          `${product.name} ${product.category} ${product.shortDescription || ''}`
        );
        return haystack.includes(normQuery);
      }
      return true;
    });

    if (sortBy === 'name-asc') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    }
    if (sortBy === 'name-desc') {
      return [...list].sort((a, b) => b.name.localeCompare(a.name, 'fr'));
    }
    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [products, selectedCategory, searchQuery, onlyFavorites, favorites, sortBy, budgetFilter]);

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    Boolean(searchQuery.trim()) ||
    onlyFavorites ||
    sortBy !== 'default' ||
    budgetFilter !== 'all';

  const handleResetFilters = () => {
    onSelectCategory('all');
    onSearchChange('');
    onToggleOnlyFavorites(false);
    setSortBy('default');
    setBudgetFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* En-tête de la page Boutique */}
      <div className="bg-white rounded-[16px] border border-[#E6DEC8] p-4 sm:p-6 space-y-4 shadow-[0_2px_12px_rgba(42,24,16,0.04)]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#868E96] mb-1">
              <span>Catalogue officiel</span>
              <span aria-hidden="true">·</span>
              <span>Prix vérifiés en FCFA (XAF)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#212529]">
              {onlyFavorites
                ? 'Mes produits favoris'
                : activeCategoryInfo
                ? activeCategoryInfo.name
                : 'Boutique Boulangerie SAKER'}
            </h1>
            <p className="text-xs sm:text-sm text-[#5C534C] mt-1 max-w-2xl">
              {onlyFavorites
                ? 'Retrouvez ici les pains, viennoiseries et pâtisseries que vous avez enregistrés.'
                : activeCategoryInfo
                ? activeCategoryInfo.description
                : 'Explorez l’ensemble des produits relevés sur le catalogue officiel de la Boulangerie SAKER à Douala.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-semibold text-[#212529] bg-[#FAF7F2] px-3 py-1.5 rounded-lg border border-[#E6DEC8] tabular-price whitespace-nowrap">
              {filteredProducts.length}{' '}
              {filteredProducts.length > 1 ? 'produits affichés' : 'produit affiché'}
            </span>
          </div>
        </div>

        {/* Barre de filtres catégories + favoris avec indicateur animé */}
        <div className="pt-3 border-t border-[#EFE9DC] space-y-3">
          <div
            role="group"
            aria-label="Filtrer par catégorie"
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1"
          >
            <button
              type="button"
              onClick={() => {
                onSelectCategory('all');
                onToggleOnlyFavorites(false);
              }}
              className={`relative px-3.5 py-2 rounded-[10px] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === 'all' && !onlyFavorites
                  ? 'text-white'
                  : 'bg-[#FAF7F2] text-[#5C534C] border border-[#E6DEC8] hover:text-[#212529]'
              }`}
            >
              {selectedCategory === 'all' && !onlyFavorites && (
                <motion.span
                  layoutId="shop-category-active-pill"
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 rounded-[10px] bg-[#E31E24] shadow-xs"
                  aria-hidden="true"
                />
              )}
              <span className="relative z-10">Tous ({products.length})</span>
            </button>

            {categories.map((cat) => {
              const active = selectedCategory === cat.slug && !onlyFavorites;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onSelectCategory(cat.slug);
                    onToggleOnlyFavorites(false);
                  }}
                  className={`relative px-3.5 py-2 rounded-[10px] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'text-white'
                      : 'bg-[#FAF7F2] text-[#5C534C] border border-[#E6DEC8] hover:text-[#212529]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="shop-category-active-pill"
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 rounded-[10px] bg-[#E31E24] shadow-xs"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10">
                    {cat.name} ({cat.count})
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => onToggleOnlyFavorites(!onlyFavorites)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                onlyFavorites
                  ? 'bg-[#212529] text-white'
                  : 'bg-[#FAF7F2] text-[#5C534C] border border-[#E6DEC8] hover:text-[#212529]'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white' : ''}`}
                aria-hidden="true"
              />
              <span>Favoris ({favorites.length})</span>
            </button>
          </div>

          {/* Seconde ligne : Filtres par budget FCFA + Tri + Réinitialisation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-semibold text-[#868E96] whitespace-nowrap mr-1">
                Budget :
              </span>
              {(
                [
                  { id: 'all', label: 'Tous les prix' },
                  { id: 'under-1000', label: '≤ 1 000 FCFA' },
                  { id: '1000-5000', label: '1 000 – 5 000 FCFA' },
                  { id: 'over-5000', label: 'Entremets (> 5 000 FCFA)' },
                ] as const
              ).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBudgetFilter(b.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    budgetFilter === b.id
                      ? 'bg-[#2A1810] text-white'
                      : 'bg-[#FAF7F2] text-[#5C534C] border border-[#E6DEC8] hover:text-[#212529]'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <label
                  htmlFor="shop-sort-select"
                  className="text-xs font-medium text-[#5C534C] inline-flex items-center gap-1 whitespace-nowrap"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Trier :</span>
                </label>
                <select
                  id="shop-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs font-semibold text-[#212529] focus:outline-none focus:border-[#E31E24]"
                >
                  <option value="default">Ordre du catalogue</option>
                  <option value="price-asc">Prix : croissant</option>
                  <option value="price-desc">Prix : décroissant</option>
                  <option value="name-asc">Nom : A à Z</option>
                  <option value="name-desc">Nom : Z à A</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#FFF5F5] border border-[#E6DEC8] text-xs font-semibold text-[#C92A2A] transition-colors whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Réinitialiser</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Rappel de recherche active */}
        {searchQuery.trim() && (
          <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs">
            <span>
              Recherche active pour :{' '}
              <strong className="text-[#212529]">« {searchQuery.trim()} »</strong>
            </span>
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="inline-flex items-center gap-1 text-[#E31E24] font-semibold hover:underline"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Effacer</span>
            </button>
          </div>
        )}
      </div>

      {/* Grille de produits animée ou État vide */}
      <AnimatePresence mode="wait">
        {filteredProducts.length === 0 ? (
          <motion.div
            key="empty-shop"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-[16px] border border-[#E6DEC8] p-8 sm:p-10 text-center space-y-3"
          >
            <div className="w-12 h-12 rounded-full bg-[#F5EFE6] border border-[#E6DEC8] flex items-center justify-center mx-auto text-[#868E96]">
              <Search className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-[#212529]">
              Aucun produit ne correspond à votre sélection
            </h2>
            <p className="text-xs sm:text-sm text-[#5C534C] max-w-md mx-auto">
              {onlyFavorites && favorites.length === 0
                ? 'Vous n’avez pas encore ajouté de produit à vos favoris. Cliquez sur l’icône cœur d’une fiche produit pour l’enregistrer.'
                : 'Essayez un autre terme (ex. « Pain Saker », « Forêt noire », « Cake », « Friands ») ou réinitialisez les filtres actifs.'}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] text-white text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Afficher tous les produits</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`${selectedCategory}-${budgetFilter}-${onlyFavorites}-${sortBy}`}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-2.5 sm:gap-5"
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note de transparence sur le catalogue */}
      <div className="p-4 rounded-[12px] bg-white border border-[#E6DEC8] text-xs text-[#5C534C] leading-relaxed">
        <strong className="text-[#212529]">Note sur la disponibilité et les formats :</strong> Les
        prix affichés en FCFA sont ceux relevés sur le catalogue officiel{' '}
        <span className="font-mono text-[11px]">boulangeriesaker.com</span>. Les deux références{' '}
        <em>« Entremet Vanille fraise » (8 000 FCFA)</em> et{' '}
        <em>« Entremet Vanille &amp; fraise » (15 000 FCFA)</em> correspondent à deux fiches
        distinctes du catalogue source et sont conservées séparément. La disponibilité en temps réel
        est confirmée par la boulangerie lors de la validation de votre commande.
      </div>
    </div>
  );
};
