import React, { useState } from 'react';
import { Check, Eye, Heart, Plus, Star } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { formatPriceFCFA, Product } from '../data/catalog';
import { getProductReviewStats } from '../data/reviews';
import { useStore } from '../context/StoreContext';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  priority = false,
}) => {
  const { addToCart, toggleFavorite, isFavorite, cartItems } = useStore();
  const [justAdded, setJustAdded] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const fav = isFavorite(product.id);
  const quantityInCart = cartItems
    .filter((item) => item.productId === product.id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const reviewStats = getProductReviewStats(product.id, product.name, product.category);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1100);
  };

  const handleToggleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <motion.article
      layout={!shouldReduceMotion}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="group relative bg-white rounded-[14px] border border-[#E6DEC8] hover:border-[#D4C5AE] transition-colors duration-200 flex flex-col h-full overflow-hidden focus-within:ring-2 focus-within:ring-[#E31E24] shadow-[0_2px_12px_rgba(42,24,16,0.045)] hover:shadow-[0_14px_30px_rgba(42,24,16,0.09)]"
    >
      {/* Zone Image cliquable avec effet de zoom doux et aperçu */}
      <div className="relative aspect-[4/3] w-full bg-gradient-to-b from-[#F8F3EB] to-[#F2E9DC] overflow-hidden">
        <button
          type="button"
          onClick={() => onSelectProduct(product)}
          className="w-full h-full block text-left focus:outline-none relative"
          aria-label={`Voir la fiche de ${product.name}`}
        >
          <ProductImage
            src={product.image}
            alt={product.name}
            category={product.category}
            priority={priority}
            className="w-full h-full p-2.5 sm:p-4"
            imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />

          {/* Indication discrète au survol sur grand écran */}
          <span
            aria-hidden="true"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2A1810]/85 text-white text-[11px] font-medium absolute bottom-2.5 left-2.5 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none"
          >
            <Eye className="w-3 h-3 text-[#F5B316]" />
            <span>Voir détails</span>
          </span>
        </button>

        {/* Bouton Favori fonctionnel avec micro-interaction */}
        <motion.button
          type="button"
          whileTap={shouldReduceMotion ? undefined : { scale: 0.85 }}
          onClick={handleToggleFav}
          aria-label={fav ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
          aria-pressed={fav}
          className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors border ${
            fav
              ? 'bg-white text-[#E31E24] border-[#E31E24]/30 shadow-xs'
              : 'bg-white/95 text-[#5C534C] border-[#E6DEC8] hover:text-[#E31E24] hover:bg-white'
          } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E31E24]`}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${fav ? 'fill-[#E31E24] scale-110' : ''}`} aria-hidden="true" />
        </motion.button>
      </div>

      {/* Corps de la carte */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2.5 sm:gap-3">
        <div>
          {/* Métadonnée sobre non encapsulée dans une pilule (Zero-Pill Discipline) */}
          <div className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px] font-medium text-[#868E96] mb-1">
            <span className="truncate">{product.category}</span>
            {reviewStats.totalReviews > 0 && (
              <span
                className="inline-flex items-center gap-0.5 text-[#212529] font-semibold shrink-0 tabular-price"
                title={`Note moyenne : ${reviewStats.averageRating.toFixed(1).replace('.', ',')} / 5 (${reviewStats.totalReviews} avis)`}
              >
                <Star className="w-3 h-3 text-[#F5B316] fill-[#F5B316]" aria-hidden="true" />
                <span>{reviewStats.averageRating.toFixed(1).replace('.', ',')}</span>
              </span>
            )}
          </div>

          <h3 className="text-xs sm:text-[15px] font-semibold text-[#212529] leading-snug line-clamp-2 min-h-[2.1rem] sm:min-h-[2.5rem]">
            <button
              type="button"
              onClick={() => onSelectProduct(product)}
              className="text-left hover:text-[#E31E24] transition-colors focus:outline-none"
            >
              {product.name}
            </button>
          </h3>

          {quantityInCart > 0 && (
            <p className="text-[10px] sm:text-[11px] text-[#099268] font-semibold mt-1 flex items-center gap-1">
              <Check className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span>{quantityInCart} au panier</span>
            </p>
          )}
        </div>

        {/* Pied de carte : Prix aligné + Action d'ajout responsive */}
        <div className="pt-2.5 border-t border-[#EFE9DC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="block text-sm sm:text-base font-bold text-[#212529] tabular-price whitespace-nowrap">
              {formatPriceFCFA(product.price)}
            </span>
          </div>

          <motion.button
            type="button"
            whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
            onClick={handleAdd}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[38px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E31E24] ${
              justAdded
                ? 'bg-[#099268] text-white'
                : 'bg-[#E31E24] hover:bg-[#C8161C] text-white shadow-xs'
            }`}
            aria-label={`Ajouter ${product.name} au panier`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {justAdded ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Ajouté</span>
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Ajouter</span>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
};
