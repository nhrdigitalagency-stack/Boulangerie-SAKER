import React, { useEffect, useRef } from 'react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { SAKER_DURATIONS, SAKER_EASE, SAKER_MOTION } from '../config/motion';
import { useStore } from '../context/StoreContext';
import { useSiteData } from '../context/SiteDataContext';
import { formatPriceFCFA, Product } from '../data/catalog';
import { ProductImage } from './ProductImage';

interface CartSidebarProps {
  onSelectProduct: (product: Product) => void;
  onProceedToCheckout: () => void;
  onExploreCatalog: () => void;
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  onSelectProduct,
  onProceedToCheckout,
  onExploreCatalog,
  isDrawerOpen,
  onCloseDrawer,
}) => {
  const { cartItems, totalQuantity, subtotal, addToCart, updateQuantity, removeFromCart, clearCart } =
    useStore();
  const { products } = useSiteData();
  const shouldReduceMotion = useReducedMotion();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        onCloseDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, onCloseDrawer]);

  // Verrouillage du défilement de fond et gestion du focus modal à l'ouverture/fermeture
  useEffect(() => {
    if (isDrawerOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const focusTimer = window.setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 60);
      return () => {
        window.clearTimeout(focusTimer);
        document.body.style.overflow = previousOverflow;
        previousFocusRef.current?.focus?.();
      };
    }
    return undefined;
  }, [isDrawerOpen]);

  // Suggestions rapides de produits emblématiques SAKER non présents dans le panier
  const quickSuggestions = React.useMemo(() => {
    const inCartIds = new Set(cartItems.map((i) => i.productId));
    const popularIds = [3090, 3074, 3097, 3106, 3035];
    const prioritized = popularIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p) && !inCartIds.has(p!.id));
    if (prioritized.length >= 2) return prioritized.slice(0, 2);
    return products.filter((p) => !inCartIds.has(p.id)).slice(0, 2);
  }, [cartItems, products]);

  const renderCartContent = (isMobileDrawer = false) => (
    <div className="flex flex-col h-full bg-white">
      {/* En-tête du panier */}
      <div className="px-5 py-4 border-b border-[#E6DEC8] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <ShoppingBag className="w-5 h-5 text-[#E31E24] shrink-0" aria-hidden="true" />
          <h2 className="text-base font-bold text-[#212529] font-sans">
            Mon panier{' '}
            <span className="text-sm font-semibold text-[#5C534C] tabular-price">
              ({totalQuantity} {totalQuantity > 1 ? 'articles' : 'article'})
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs text-[#868E96] hover:text-[#C92A2A] transition-colors underline underline-offset-2 whitespace-nowrap"
            >
              Vider
            </button>
          )}
          {isMobileDrawer && (
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onCloseDrawer}
              aria-label="Fermer le panier"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[#5C534C] hover:bg-[#F5EFE6] hover:text-[#212529] transition-colors focus-visible:outline-2 focus-visible:outline-[#E31E24]"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Liste des articles ou État vide */}
      {cartItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-between p-5 text-center overflow-y-auto custom-scrollbar">
          <div className="my-auto py-6 flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#F5EFE6] border border-[#E6DEC8] flex items-center justify-center text-[#868E96] mb-3.5">
              <ShoppingBag className="w-6 h-6" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-[#212529] mb-1">Votre panier est vide</p>
            <p className="text-xs text-[#5C534C] max-w-[230px] leading-relaxed mb-5">
              Ajoutez vos pains frais, viennoiseries, cakes ou entremets SAKER pour préparer votre commande.
            </p>
            <button
              type="button"
              onClick={() => {
                onExploreCatalog();
                if (isMobileDrawer) onCloseDrawer();
              }}
              className="px-4 py-2.5 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] text-white text-xs font-semibold transition-colors whitespace-nowrap shadow-xs"
            >
              Découvrir le catalogue
            </button>
          </div>

          {/* Suggestions rapides quand le panier est vide */}
          {quickSuggestions.length > 0 && (
            <div className="w-full pt-4 border-t border-[#EFE9DC] text-left space-y-2.5">
              <p className="text-[11px] font-bold text-[#868E96] uppercase tracking-wider">
                Incontournables SAKER
              </p>
              {quickSuggestions.map((sug) => (
                <div
                  key={sug.id}
                  className="p-2.5 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] flex items-center justify-between gap-2.5"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectProduct(sug);
                      if (isMobileDrawer) onCloseDrawer();
                    }}
                    className="flex items-center gap-2.5 min-w-0 text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white border border-[#E6DEC8] shrink-0 overflow-hidden">
                      <ProductImage src={sug.image} alt={sug.name} className="w-full h-full p-1" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#212529] truncate">{sug.name}</p>
                      <p className="text-[11px] font-bold text-[#E31E24] tabular-price">
                        {formatPriceFCFA(sug.price)}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => addToCart(sug, 1)}
                    aria-label={`Ajouter ${sug.name} au panier`}
                    className="w-8 h-8 rounded-lg bg-white hover:bg-[#E31E24] text-[#212529] hover:text-white border border-[#E6DEC8] hover:border-[#E31E24] flex items-center justify-center transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-[#EFE9DC] px-4 py-2">
            <AnimatePresence initial={false}>
              {cartItems.map((item) => {
                const lineTotal = item.product.price * item.quantity;
                return (
                  <motion.div
                    key={item.lineId}
                    layout={!shouldReduceMotion}
                    initial={shouldReduceMotion ? false : { opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="py-3.5 flex gap-3"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectProduct(item.product);
                        if (isMobileDrawer) onCloseDrawer();
                      }}
                      className="w-16 h-16 rounded-lg bg-[#F5EFE6] border border-[#E6DEC8] shrink-0 overflow-hidden focus-visible:outline-2 focus-visible:outline-[#E31E24]"
                      aria-label={`Voir ${item.product.name}`}
                    >
                      <ProductImage
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full p-1.5"
                      />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectProduct(item.product);
                            if (isMobileDrawer) onCloseDrawer();
                          }}
                          className="text-xs font-semibold text-[#212529] hover:text-[#E31E24] text-left line-clamp-2 leading-snug"
                        >
                          {item.product.name}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.lineId)}
                          aria-label={`Supprimer ${item.product.name} du panier`}
                          className="text-[#868E96] hover:text-[#C92A2A] p-1 -mr-1 rounded transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-[#E31E24]"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>

                      <p className="text-[11px] text-[#5C534C] tabular-price mt-0.5">
                        Prix unitaire : {formatPriceFCFA(item.product.price)}
                      </p>

                      {item.customization && (
                        <div className="mt-1.5 p-2 rounded bg-[#FAF7F2] border border-[#E6DEC8] text-[11px] text-[#5C534C] space-y-0.5">
                          <p className="font-semibold text-[#212529]">
                            Personnalisation (à confirmer) :
                          </p>
                          {item.customization.cakeMessage && (
                            <p className="truncate">Message : « {item.customization.cakeMessage} »</p>
                          )}
                          {item.customization.desiredDate && (
                            <p>Date souhaitée : {item.customization.desiredDate}</p>
                          )}
                          {item.customization.additionalNotes && (
                            <p className="line-clamp-2">Note : {item.customization.additionalNotes}</p>
                          )}
                        </div>
                      )}

                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        {/* Contrôle de quantité */}
                        <div className="inline-flex items-center rounded-lg border border-[#E6DEC8] bg-[#FAF7F2]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                            aria-label={`Diminuer la quantité de ${item.product.name}`}
                            className="w-7 h-7 flex items-center justify-center text-[#212529] hover:bg-[#EFE9DC] rounded-l-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#E31E24]"
                          >
                            <Minus className="w-3 h-3" aria-hidden="true" />
                          </button>
                          <span
                            className="px-2.5 text-xs font-semibold text-[#212529] tabular-price select-none"
                            aria-label={`Quantité : ${item.quantity}`}
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                            aria-label={`Augmenter la quantité de ${item.product.name}`}
                            className="w-7 h-7 flex items-center justify-center text-[#212529] hover:bg-[#EFE9DC] rounded-r-lg transition-colors focus-visible:outline-2 focus-visible:outline-[#E31E24]"
                          >
                            <Plus className="w-3 h-3" aria-hidden="true" />
                          </button>
                        </div>

                        {/* Sous-total de ligne */}
                        <span className="text-xs font-bold text-[#212529] tabular-price whitespace-nowrap">
                          {formatPriceFCFA(lineTotal)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Récapitulatif et Action principale */}
          <div className="p-4 bg-[#FAF7F2] border-t border-[#E6DEC8] space-y-3 shrink-0">
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#5C534C]">
                <span>Sous-total articles ({totalQuantity})</span>
                <span className="font-semibold text-[#212529] tabular-price">
                  {formatPriceFCFA(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#5C534C]">
                <span>Modalités &amp; livraison</span>
                <span className="text-[11px] font-medium text-[#5C534C]">
                  À confirmer
                </span>
              </div>
              <div className="pt-2 border-t border-[#E6DEC8] flex items-baseline justify-between">
                <span className="text-sm font-bold text-[#212529]">Total produits</span>
                <div className="text-right">
                  <span className="text-base font-bold text-[#E31E24] tabular-price">
                    {formatPriceFCFA(subtotal)}
                  </span>
                  <span className="block text-[10px] text-[#868E96]">
                    Hors frais éventuels à confirmer
                  </span>
                </div>
              </div>
            </div>

            <motion.button
              type="button"
              whileHover={shouldReduceMotion ? undefined : { scale: 1.015, y: -1 }}
              whileTap={shouldReduceMotion ? undefined : { scale: SAKER_MOTION.buttonTapScale }}
              transition={{ duration: SAKER_DURATIONS.fast, ease: SAKER_EASE }}
              onClick={() => {
                onProceedToCheckout();
                if (isMobileDrawer) onCloseDrawer();
              }}
              className="w-full py-3 px-4 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs hover:shadow-[0_6px_16px_rgba(227,30,36,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E31E24]"
            >
              <span>Préparer ma commande ({totalQuantity})</span>
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </motion.button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Tiroir Panier accessible sur tous les écrans (mobile, tablette et bureau) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div
            className="fixed inset-0 z-50 flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-label="Mon panier"
          >
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: SAKER_DURATIONS.drawer, ease: SAKER_EASE }}
              className="fixed inset-0 bg-black/50"
              onClick={onCloseDrawer}
              aria-hidden="true"
            />
            <motion.div
              initial={shouldReduceMotion ? { x: 0 } : { x: '100%' }}
              animate={{ x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
              transition={{ duration: SAKER_DURATIONS.drawer, ease: SAKER_EASE }}
              className="relative z-10 w-full max-w-[380px] h-full bg-white shadow-2xl flex flex-col"
            >
              {renderCartContent(true)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
