import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Product } from '../data/catalog';
import { useSiteData } from './SiteDataContext';

export interface CakeCustomizationRequest {
  cakeMessage?: string;
  desiredDate?: string;
  additionalNotes?: string;
}

export interface CartItem {
  lineId: string;
  productId: number;
  product: Product;
  quantity: number;
  customization?: CakeCustomizationRequest;
}

interface StoreContextValue {
  cartItems: CartItem[];
  totalQuantity: number;
  subtotal: number;
  favorites: number[];
  lastAddedNotice: { productName: string; quantity: number; timestamp: number } | null;
  addToCart: (product: Product, quantity?: number, customization?: CakeCustomizationRequest) => void;
  updateQuantity: (lineId: string, newQuantity: number) => void;
  removeFromCart: (lineId: string) => void;
  clearCart: () => void;
  toggleFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
  dismissNotice: () => void;
}

const CART_STORAGE_KEY = 'boulangerie_saker_cart_v1';
const FAVORITES_STORAGE_KEY = 'boulangerie_saker_favorites_v1';

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

function buildLineId(productId: number, customization?: CakeCustomizationRequest): string {
  if (!customization || (!customization.cakeMessage && !customization.desiredDate && !customization.additionalNotes)) {
    return `prod_${productId}`;
  }
  const msg = (customization.cakeMessage || '').trim();
  const date = (customization.desiredDate || '').trim();
  const notes = (customization.additionalNotes || '').trim();
  return `prod_${productId}__${msg}__${date}__${notes}`;
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { products } = useSiteData();

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const hydrated: CartItem[] = [];
      for (const entry of parsed) {
        const officialProduct = products.find((p) => p.id === Number(entry.productId));
        const qty = Math.max(1, Math.floor(Number(entry.quantity) || 1));
        if (officialProduct) {
          hydrated.push({
            lineId: entry.lineId || buildLineId(officialProduct.id, entry.customization),
            productId: officialProduct.id,
            product: officialProduct,
            quantity: qty,
            customization: entry.customization,
          });
        }
      }
      return hydrated;
    } catch {
      return [];
    }
  });

  // Synchronise les infos/prix du panier si les produits Sanity changent
  useEffect(() => {
    if (products.length === 0) return;
    setCartItems((prev) => {
      if (prev.length === 0) {
        try {
          const raw = localStorage.getItem(CART_STORAGE_KEY);
          if (!raw) return prev;
          const parsed = JSON.parse(raw);
          if (!Array.isArray(parsed) || parsed.length === 0) return prev;
          const hydrated: CartItem[] = [];
          for (const entry of parsed) {
            const found = products.find((p) => p.id === Number(entry.productId));
            if (found) {
              hydrated.push({
                lineId: entry.lineId || buildLineId(found.id, entry.customization),
                productId: found.id,
                product: found,
                quantity: Math.max(1, Math.floor(Number(entry.quantity) || 1)),
                customization: entry.customization,
              });
            }
          }
          return hydrated.length > 0 ? hydrated : prev;
        } catch {
          return prev;
        }
      }
      return prev.map((item) => {
        const fresh = products.find((p) => p.id === item.productId);
        return fresh ? { ...item, product: fresh } : item;
      });
    });
  }, [products]);

  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'number') : [];
    } catch {
      return [];
    }
  });

  const [lastAddedNotice, setLastAddedNotice] = useState<{
    productName: string;
    quantity: number;
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    try {
      const serializable = cartItems.map((item) => ({
        lineId: item.lineId,
        productId: item.productId,
        quantity: item.quantity,
        customization: item.customization,
      }));
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(serializable));
    } catch {
      // Ignore storage quota errors
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Ignore storage quota errors
    }
  }, [favorites]);

  useEffect(() => {
    if (!lastAddedNotice) return;
    const timer = window.setTimeout(() => {
      setLastAddedNotice(null);
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [lastAddedNotice]);

  const addToCart = (product: Product, quantity = 1, customization?: CakeCustomizationRequest) => {
    const cleanQty = Math.max(1, Math.floor(quantity));
    const cleanCustomization =
      customization &&
      (customization.cakeMessage?.trim() ||
        customization.desiredDate?.trim() ||
        customization.additionalNotes?.trim())
        ? {
            cakeMessage: customization.cakeMessage?.trim() || undefined,
            desiredDate: customization.desiredDate?.trim() || undefined,
            additionalNotes: customization.additionalNotes?.trim() || undefined,
          }
        : undefined;

    const lineId = buildLineId(product.id, cleanCustomization);

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.lineId === lineId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + cleanQty,
        };
        return updated;
      }
      return [
        ...prev,
        {
          lineId,
          productId: product.id,
          product,
          quantity: cleanQty,
          customization: cleanCustomization,
        },
      ];
    });

    setLastAddedNotice({
      productName: product.name,
      quantity: cleanQty,
      timestamp: Date.now(),
    });
  };

  const updateQuantity = (lineId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(lineId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.lineId === lineId ? { ...item, quantity: Math.floor(newQuantity) } : item
      )
    );
  };

  const removeFromCart = (lineId: string) => {
    setCartItems((prev) => prev.filter((item) => item.lineId !== lineId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleFavorite = (productId: number) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isFavorite = (productId: number) => favorites.includes(productId);

  const totalQuantity = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems]
  );

  return (
    <StoreContext.Provider
      value={{
        cartItems,
        totalQuantity,
        subtotal,
        favorites,
        lastAddedNotice,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleFavorite,
        isFavorite,
        dismissNotice: () => setLastAddedNotice(null),
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
