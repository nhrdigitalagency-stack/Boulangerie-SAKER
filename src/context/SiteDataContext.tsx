import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CATALOG_PRODUCTS, CategoryInfo, VERIFIED_CATEGORIES } from '../data/catalog';
import {
  AdminUserProfile,
  CmsPopup,
  CmsProduct,
  CmsSiteContent,
  DEFAULT_CMS_SITE_CONTENT,
} from '../data/cmsTypes';

const ADMIN_TOKEN_STORAGE_KEY = 'saker_admin_bearer_token_v1';

interface SiteDataContextValue {
  products: CmsProduct[];
  categories: CategoryInfo[];
  activePopups: CmsPopup[];
  siteContent: CmsSiteContent;
  isLoadingData: boolean;
  sanityConnected: boolean;
  adminUser: AdminUserProfile | null;
  adminToken: string | null;
  refreshSiteData: () => Promise<void>;
  loginAdmin: (identifier: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  setAdminSession: (user: AdminUserProfile, token?: string) => void;
}

const SiteDataContext = createContext<SiteDataContextValue | undefined>(undefined);

function computeFallbackCategories(products: CmsProduct[]): CategoryInfo[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    counts.set(p.categorySlug, (counts.get(p.categorySlug) || 0) + 1);
  }
  return VERIFIED_CATEGORIES.map((cat) => ({
    ...cat,
    count: counts.get(cat.slug) ?? 0,
  }));
}

export const SiteDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<CmsProduct[]>(() =>
    CATALOG_PRODUCTS.map((p, idx) => ({ ...p, sortOrder: idx + 1 }))
  );
  const [categories, setCategories] = useState<CategoryInfo[]>(() =>
    computeFallbackCategories(CATALOG_PRODUCTS)
  );
  const [activePopups, setActivePopups] = useState<CmsPopup[]>([]);
  const [siteContent, setSiteContent] = useState<CmsSiteContent>(DEFAULT_CMS_SITE_CONTENT);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [sanityConnected, setSanityConnected] = useState<boolean>(false);

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [adminUser, setAdminUser] = useState<AdminUserProfile | null>(null);

  const refreshSiteData = useCallback(async () => {
    try {
      const response = await fetch('/api/public/site-data', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
        setCategories(
          Array.isArray(data.categories)
            ? data.categories
            : computeFallbackCategories(data.products)
        );
      }
      if (Array.isArray(data.popups)) {
        setActivePopups(data.popups);
      }
      if (data.siteContent) {
        setSiteContent(data.siteContent);
      }
      setSanityConnected(Boolean(data.sanityConnected));
    } catch {
      // Conserve les données locales de secours si hors-ligne
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  const checkAdminSession = useCallback(async (tokenOverride?: string | null) => {
    try {
      const tokenToUse = tokenOverride !== undefined ? tokenOverride : adminToken;
      const headers: HeadersInit = {};
      if (tokenToUse) {
        headers.Authorization = `Bearer ${tokenToUse}`;
      }
      const res = await fetch('/api/admin/me', { headers, cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data.authenticated && data.user) {
        setAdminUser(data.user);
      } else {
        setAdminUser(null);
      }
    } catch {
      // ignore
    }
  }, [adminToken]);

  useEffect(() => {
    void refreshSiteData();
    void checkAdminSession();
  }, [refreshSiteData, checkAdminSession]);

  const setAdminSession = useCallback((user: AdminUserProfile, token?: string) => {
    setAdminUser(user);
    if (token) {
      setAdminToken(token);
      try {
        sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
      } catch {
        // ignore
      }
    }
  }, []);

  const loginAdmin = useCallback(
    async (identifier: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          return {
            ok: false,
            error: data.error || 'Identifiants invalides.',
          };
        }
        setAdminSession(data.user, data.token);
        return { ok: true };
      } catch {
        return {
          ok: false,
          error: 'Impossible de contacter le serveur d’authentification.',
        };
      }
    },
    [setAdminSession]
  );

  const logoutAdmin = useCallback(async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setAdminUser(null);
    setAdminToken(null);
    try {
      sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <SiteDataContext.Provider
      value={{
        products,
        categories,
        activePopups,
        siteContent,
        isLoadingData,
        sanityConnected,
        adminUser,
        adminToken,
        refreshSiteData,
        loginAdmin,
        logoutAdmin,
        setAdminSession,
      }}
    >
      {children}
    </SiteDataContext.Provider>
  );
};

export function useSiteData(): SiteDataContextValue {
  const ctx = useContext(SiteDataContext);
  if (!ctx) {
    throw new Error('useSiteData must be used within SiteDataProvider');
  }
  return ctx;
}
