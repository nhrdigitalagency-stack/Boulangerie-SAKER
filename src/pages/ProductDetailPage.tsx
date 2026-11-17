import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Check,
  Heart,
  Info,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { formatPriceFCFA, Product } from '../data/catalog';
import { SAKER_DURATIONS, SAKER_EASE, SAKER_MOTION } from '../config/motion';
import { useSiteData } from '../context/SiteDataContext';
import { useStore } from '../context/StoreContext';
import { ProductImage } from '../components/ProductImage';
import { ProductCard } from '../components/ProductCard';
import { ProductReviewsSection } from '../components/ProductReviewsSection';

interface ProductDetailPageProps {
  product: Product;
  onBackToShop: () => void;
  onSelectCategory: (categorySlug: string) => void;
  onSelectProduct: (product: Product) => void;
  onProceedToCheckout: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBackToShop,
  onSelectCategory,
  onSelectProduct,
  onProceedToCheckout,
}) => {
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const { products } = useSiteData();
  const shouldReduceMotion = useReducedMotion();
  const [quantity, setQuantity] = useState<number>(1);
  const [cakeMessage, setCakeMessage] = useState<string>('');
  const [desiredDate, setDesiredDate] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [showCustomForm, setShowCustomForm] = useState<boolean>(false);
  const [addedFeedback, setAddedFeedback] = useState<boolean>(false);

  // Reset local form when switching product
  useEffect(() => {
    setQuantity(1);
    setCakeMessage('');
    setDesiredDate('');
    setAdditionalNotes('');
    setShowCustomForm(false);
    setAddedFeedback(false);
  }, [product.id]);

  const fav = isFavorite(product.id);

  const relatedProducts = useMemo(() => {
    const sameCategory = products.filter(
      (p) => p.categorySlug === product.categorySlug && p.id !== product.id
    );
    if (sameCategory.length >= 4) {
      return sameCategory.slice(0, 4);
    }
    const others = products.filter(
      (p) => p.categorySlug !== product.categorySlug && p.id !== product.id
    );
    return [...sameCategory, ...others].slice(0, 4);
  }, [product, products]);

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    addToCart(
      product,
      quantity,
      product.isCustomizableCake && showCustomForm
        ? {
            cakeMessage,
            desiredDate,
            additionalNotes,
          }
        : undefined
    );
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 1800);
  };

  return (
    <div className="space-y-8">
      {/* Fil d'Ariane & Retour */}
      <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#212529] hover:text-[#E31E24] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Retour au catalogue</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-[#868E96]">
          <button
            type="button"
            onClick={onBackToShop}
            className="hover:text-[#212529] transition-colors"
          >
            Boutique
          </button>
          <span aria-hidden="true">/</span>
          <button
            type="button"
            onClick={() => onSelectCategory(product.categorySlug)}
            className="hover:text-[#E31E24] transition-colors font-medium text-[#5C534C]"
          >
            {product.category}
          </button>
          <span aria-hidden="true">/</span>
          <span className="text-[#212529] font-semibold truncate max-w-[180px] sm:max-w-xs">
            {product.name}
          </span>
        </div>
      </nav>

      {/* Fiche Produit Principale */}
      <div className="bg-white rounded-[18px] border border-[#E6DEC8] p-5 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* Colonne Visuel (Sticky sur grand écran) */}
          <div className="lg:col-span-6 space-y-3">
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0.9, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: SAKER_DURATIONS.editorial, ease: SAKER_EASE }}
              className="aspect-square w-full rounded-[14px] bg-[#F5EFE6] border border-[#E6DEC8] overflow-hidden relative"
            >
              <ProductImage
                src={product.image}
                alt={product.name}
                category={product.category}
                priority
                className="w-full h-full p-6 sm:p-10"
              />
            </motion.div>
            <p className="text-[11px] text-[#868E96] text-center">
              Photographie issue du catalogue officiel Boulangerie SAKER (réf. #{product.id})
            </p>
          </div>

          {/* Colonne Informations & Module d'achat contigu */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#868E96] mb-1.5">
                <button
                  type="button"
                  onClick={() => onSelectCategory(product.categorySlug)}
                  className="text-[#E31E24] font-semibold hover:underline"
                >
                  {product.category}
                </button>
                <span aria-hidden="true">·</span>
                <span>Réf. #{product.id}</span>
                <span aria-hidden="true">·</span>
                <span>Disponibilité confirmée à la commande</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#212529] leading-tight">
                {product.name}
              </h1>

              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-[#E31E24] tabular-price">
                  {formatPriceFCFA(product.price)}
                </span>
                <span className="text-xs text-[#868E96]">Prix unitaire TTC (XAF)</span>
              </div>
            </div>

            {product.formatNote && (
              <div className="p-3 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs text-[#5C534C]">
                {product.formatNote}
              </div>
            )}

            {/* Description officielle issue du site */}
            <div className="space-y-2.5 text-sm text-[#5C534C] leading-relaxed border-t border-b border-[#EFE9DC] py-4">
              {product.shortDescription && (
                <p className="font-medium text-[#212529]">{product.shortDescription}</p>
              )}
              {product.description && product.description !== product.shortDescription && (
                <p>{product.description}</p>
              )}
            </div>

            {/* Formulaire d'ajout au panier + Demande de personnalisation éventuelle */}
            <form onSubmit={handleAddToCart} className="space-y-4">
              {product.isCustomizableCake && (
                <div className="rounded-[12px] bg-[#FAF7F2] border border-[#E6DEC8] p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h2 className="text-xs sm:text-sm font-bold text-[#212529] font-sans">
                        Demande de personnalisation (à confirmer)
                      </h2>
                      <p className="text-[11px] text-[#5C534C]">
                        Optionnel — toute demande d’inscription ou de date est soumise à validation
                        par la boulangerie.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCustomForm(!showCustomForm)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#E6DEC8] text-xs font-semibold text-[#212529] hover:border-[#E31E24] transition-colors whitespace-nowrap shrink-0"
                    >
                      {showCustomForm ? 'Masquer' : 'Personnaliser'}
                    </button>
                  </div>

                  {showCustomForm && (
                    <div className="space-y-3 pt-2 border-t border-[#E6DEC8]">
                      <div>
                        <label
                          htmlFor="cake-message"
                          className="block text-xs font-semibold text-[#212529] mb-1"
                        >
                          Message souhaité sur le gâteau (à confirmer)
                        </label>
                        <input
                          id="cake-message"
                          type="text"
                          maxLength={60}
                          value={cakeMessage}
                          onChange={(e) => setCakeMessage(e.target.value)}
                          placeholder="Ex. Joyeux anniversaire Marie"
                          className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6DEC8] text-xs text-[#212529] focus:outline-none focus:border-[#E31E24]"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="cake-date"
                          className="block text-xs font-semibold text-[#212529] mb-1"
                        >
                          Date souhaitée
                        </label>
                        <div className="relative">
                          <Calendar
                            className="w-3.5 h-3.5 text-[#868E96] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            aria-hidden="true"
                          />
                          <input
                            id="cake-date"
                            type="date"
                            value={desiredDate}
                            onChange={(e) => setDesiredDate(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-[#E6DEC8] text-xs text-[#212529] focus:outline-none focus:border-[#E31E24]"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="cake-notes"
                          className="block text-xs font-semibold text-[#212529] mb-1"
                        >
                          Informations complémentaires
                        </label>
                        <textarea
                          id="cake-notes"
                          rows={2}
                          value={additionalNotes}
                          onChange={(e) => setAdditionalNotes(e.target.value)}
                          placeholder="Précisions sur l’événement, heure souhaitée, questions..."
                          className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6DEC8] text-xs text-[#212529] focus:outline-none focus:border-[#E31E24]"
                        />
                      </div>

                      <p className="text-[11px] text-[#868E96]">
                        Aucun supplément chiffré n’est facturé automatiquement : nos équipes vous
                        confirmeront la faisabilité et les modalités par téléphone.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Sélecteur de quantité + Boutons d'action */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center rounded-[10px] border border-[#E6DEC8] bg-[#FAF7F2] h-11">
                  <motion.button
                    type="button"
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Diminuer la quantité"
                    className="w-10 h-full flex items-center justify-center text-[#212529] hover:bg-[#EFE9DC] rounded-l-[10px] transition-colors"
                  >
                    <Minus className="w-4 h-4" aria-hidden="true" />
                  </motion.button>
                  <span
                    className="px-4 text-sm font-bold text-[#212529] tabular-price select-none"
                    aria-label={`Quantité sélectionnée : ${quantity}`}
                  >
                    {quantity}
                  </span>
                  <motion.button
                    type="button"
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Augmenter la quantité"
                    className="w-10 h-full flex items-center justify-center text-[#212529] hover:bg-[#EFE9DC] rounded-r-[10px] transition-colors"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                  </motion.button>
                </div>

                <motion.button
                  type="submit"
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : { scale: SAKER_MOTION.buttonHoverScale, y: -1 }
                  }
                  whileTap={shouldReduceMotion ? undefined : { scale: SAKER_MOTION.buttonTapScale }}
                  transition={{ duration: SAKER_DURATIONS.fast, ease: SAKER_EASE }}
                  className={`flex-1 min-w-[200px] h-11 px-5 rounded-[10px] text-xs sm:text-sm font-semibold text-white flex items-center justify-center gap-2 transition-colors shadow-xs hover:shadow-[0_8px_20px_rgba(227,30,36,0.28)] ${
                    addedFeedback
                      ? 'bg-[#099268] shadow-[0_6px_16px_rgba(9,146,104,0.28)]'
                      : 'bg-[#E31E24] hover:bg-[#C8161C]'
                  }`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {addedFeedback ? (
                      <motion.span
                        key="detail-added"
                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                        transition={{ duration: SAKER_DURATIONS.fast, ease: SAKER_EASE }}
                        className="inline-flex items-center gap-2"
                      >
                        <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Ajouté au panier ({formatPriceFCFA(product.price * quantity)})</span>
                      </motion.span>
                    ) : (
                      <motion.span
                        key="detail-add"
                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                        transition={{ duration: SAKER_DURATIONS.fast, ease: SAKER_EASE }}
                        className="inline-flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>
                          Ajouter au panier · {formatPriceFCFA(product.price * quantity)}
                        </span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: SAKER_MOTION.buttonTapScale }}
                  transition={{ duration: SAKER_DURATIONS.fast, ease: SAKER_EASE }}
                  onClick={() => toggleFavorite(product.id)}
                  aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  aria-pressed={fav}
                  className={`h-11 px-3.5 rounded-[10px] border flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors ${
                    fav
                      ? 'bg-[#FFF4F6] text-[#E31E24] border-[#E31E24]/30'
                      : 'bg-white text-[#5C534C] border-[#E6DEC8] hover:text-[#212529] hover:border-[#E31E24]/35'
                  }`}
                >
                  <Heart className={`w-4 h-4 transition-transform ${fav ? 'fill-[#E31E24] scale-110' : ''}`} aria-hidden="true" />
                  <span className="hidden sm:inline">{fav ? 'Favori' : 'Ajouter aux favoris'}</span>
                </motion.button>
              </div>

              {addedFeedback && (
                <div className="p-3 rounded-[10px] bg-[#E6FCF5] border border-[#099268]/30 flex items-center justify-between gap-3 text-xs text-[#099268]">
                  <span className="font-semibold">
                    Produit ajouté à votre panier.
                  </span>
                  <button
                    type="button"
                    onClick={onProceedToCheckout}
                    className="font-bold underline underline-offset-2 whitespace-nowrap"
                  >
                    Préparer ma commande →
                  </button>
                </div>
              )}
            </form>

            {/* Mention obligatoire Ingrédients & Allergènes */}
            <div className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E6DEC8] flex items-start gap-3 text-xs text-[#5C534C]">
              <Info className="w-4 h-4 text-[#E31E24] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <p className="font-semibold text-[#212529]">
                  Ingrédients, allergènes et informations nutritionnelles
                </p>
                <p>
                  Pour connaître les ingrédients et allergènes de ce produit, veuillez contacter la
                  boulangerie :{' '}
                  <a
                    href="tel:+237695944664"
                    className="inline-flex items-center gap-1 font-semibold text-[#E31E24] hover:underline tabular-price"
                  >
                    <Phone className="w-3 h-3" aria-hidden="true" />
                    695 94 46 64
                  </a>{' '}
                  ou{' '}
                  <a
                    href="tel:+237683355262"
                    className="font-semibold text-[#E31E24] hover:underline tabular-price"
                  >
                    683 35 52 62
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Avis clients (note moyenne, répartition et retours naturels) */}
      <ProductReviewsSection product={product} />

      {/* Produits associés réellement pertinents */}
      <section aria-labelledby="related-products-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="related-products-heading" className="text-lg sm:text-xl font-bold text-[#212529]">
            Autres spécialités à découvrir
          </h2>
          <button
            type="button"
            onClick={() => onSelectCategory(product.categorySlug)}
            className="text-xs font-semibold text-[#E31E24] hover:underline"
          >
            Voir tout le rayon {product.category} →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
          {relatedProducts.map((rel) => (
            <ProductCard key={rel.id} product={rel} onSelectProduct={onSelectProduct} />
          ))}
        </div>
      </section>
    </div>
  );
};
