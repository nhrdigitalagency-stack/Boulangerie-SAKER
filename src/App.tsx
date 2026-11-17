import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Home,
  MapPin,
  ShoppingBag,
  Store,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { SiteDataProvider, useSiteData } from './context/SiteDataContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { Product } from './data/catalog';
import { ActivePage, LeftNavigation } from './components/LeftNavigation';
import { TopBar } from './components/TopBar';
import { CartSidebar } from './components/CartSidebar';
import { Footer } from './components/Footer';
import { AdminLoginModal } from './components/AdminLoginModal';
import { SitePopupBanner } from './components/SitePopupBanner';
import { BrandSplashLoader } from './components/BrandSplashLoader';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ServicesPage } from './pages/ServicesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AuditPage } from './pages/AuditPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const StorefrontShell: React.FC = () => {
  const { lastAddedNotice, dismissNotice, totalQuantity } = useStore();
  const { products, adminUser } = useSiteData();
  const shouldReduceMotion = useReducedMotion();

  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product>(() => products[0]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState<boolean>(false);

  // Maintenir selectedProduct synchronisé avec les mises à jour Sanity
  useEffect(() => {
    if (products.length === 0) return;
    setSelectedProduct((prev) => {
      const updated = products.find((p) => p.id === prev?.id);
      return updated || products[0];
    });
  }, [products]);

  // Listen for Google Maps Platform quota exceeded events
  useEffect(() => {
    const handleQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Mise à jour dynamique du titre de la page (SEO)
  useEffect(() => {
    const titles: Record<ActivePage, string> = {
      home: 'Boulangerie SAKER — Pain, Pâtisserie & Traiteur à Douala',
      shop: 'Boutique & Catalogue — Boulangerie SAKER Douala',
      product: `${selectedProduct.name} — Boulangerie SAKER`,
      services: 'Nos Services : Traiteur, Gâteaux, Salles de fêtes & Glaciers — Boulangerie SAKER',
      about: 'À propos & Histoire depuis 1990 — Boulangerie SAKER',
      contact: 'Contact & Nos Agences à Douala — Boulangerie SAKER',
      checkout: 'Préparation de commande — Boulangerie SAKER',
      audit: 'Audit Technique & Plan de Migration SEO — Boulangerie SAKER',
      admin: 'Administration Propriétaire — Boulangerie SAKER',
    };
    document.title = titles[activePage] || 'Boulangerie SAKER — Douala';
  }, [activePage, selectedProduct]);

  const handleNavigate = (
    page: ActivePage,
    categorySlug = 'all',
    favOnly = false
  ) => {
    setActivePage(page);
    if (page === 'shop') {
      setSelectedCategory(categorySlug);
      setOnlyFavorites(favOnly);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setActivePage('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (q.trim() && activePage !== 'shop') {
      setActivePage('shop');
      setSelectedCategory('all');
      setOnlyFavorites(false);
    }
  };

  const handleSearchSubmit = () => {
    if (activePage !== 'shop') {
      setActivePage('shop');
    }
  };

  const handleSelectServiceForQuote = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setActivePage('services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdmin = () => {
    if (adminUser) {
      setActivePage('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  if (activePage === 'admin' && adminUser) {
    return (
      <AdminDashboardPage
        onBackToStorefront={() => {
          setActivePage('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#212529]">
      {/* Préchargeur naturel du logo SAKER à l'ouverture (<= 3 secondes) */}
      <BrandSplashLoader />
      {/* Google Maps Platform Quota Exceeded Sticky Warning Banner */}
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <div className="flex-1 flex min-w-0">
        {/* A. Navigation verticale gauche (Ordinateur lg+ & Tiroir mobile) */}
        <LeftNavigation
          activePage={activePage}
          selectedCategory={selectedCategory}
          onlyFavorites={onlyFavorites}
          onNavigate={handleNavigate}
          onOpenCartDrawer={() => setIsCartDrawerOpen(true)}
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        />

        {/* B. Zone centrale flexible */}
        <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
          <TopBar
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onOpenCart={() => setIsCartDrawerOpen(true)}
            onOpenFavorites={() => handleNavigate('shop', 'all', true)}
            onNavigate={handleNavigate}
            activePage={activePage}
            selectedCategory={selectedCategory}
          />

          <main id="main-content" className="flex-1 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage === 'product' ? `product-${selectedProduct.id}` : activePage}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                {activePage === 'home' ? (
                  <HomePage
                    onNavigate={(page, catSlug) => handleNavigate(page, catSlug || 'all', false)}
                    onSelectProduct={handleSelectProduct}
                    onSelectServiceForQuote={handleSelectServiceForQuote}
                  />
                ) : (
                  <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 pt-6 sm:pt-8">
                    {activePage === 'shop' && (
                      <ShopPage
                        selectedCategory={selectedCategory}
                        onSelectCategory={(cat) => setSelectedCategory(cat)}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onlyFavorites={onlyFavorites}
                        onToggleOnlyFavorites={setOnlyFavorites}
                        onSelectProduct={handleSelectProduct}
                      />
                    )}

                    {activePage === 'product' && (
                      <ProductDetailPage
                        product={selectedProduct}
                        onBackToShop={() => handleNavigate('shop', selectedCategory, onlyFavorites)}
                        onSelectCategory={(catSlug) => handleNavigate('shop', catSlug, false)}
                        onSelectProduct={handleSelectProduct}
                        onProceedToCheckout={() => handleNavigate('checkout')}
                      />
                    )}

                    {activePage === 'services' && (
                      <ServicesPage initialServiceId={selectedServiceId} />
                    )}

                    {activePage === 'about' && (
                      <AboutPage onNavigate={(p) => handleNavigate(p)} />
                    )}

                    {activePage === 'contact' && <ContactPage />}

                    {activePage === 'checkout' && (
                      <CheckoutPage onBackToShop={() => handleNavigate('shop', 'all', false)} />
                    )}

                    {activePage === 'audit' && <AuditPage />}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          <Footer
            onNavigate={(page, catSlug) => handleNavigate(page, catSlug || 'all', false)}
            onOpenAdmin={handleOpenAdmin}
          />
        </div>

        {/* C. Tiroir Panier accessible sur tous les écrans */}
        <CartSidebar
          onSelectProduct={handleSelectProduct}
          onProceedToCheckout={() => handleNavigate('checkout')}
          onExploreCatalog={() => handleNavigate('shop', 'all', false)}
          isDrawerOpen={isCartDrawerOpen}
          onCloseDrawer={() => setIsCartDrawerOpen(false)}
        />
      </div>

      {/* Barre de navigation mobile rapide (affichée uniquement sur écrans < lg) */}
      <nav
        aria-label="Navigation rapide mobile"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-xs border-t border-[#E6DEC8] px-2 py-1.5"
      >
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => handleNavigate('home')}
            className={`relative flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-semibold transition-colors ${
              activePage === 'home' ? 'text-[#E31E24]' : 'text-[#5C534C] hover:text-[#212529]'
            }`}
          >
            <Home className="w-4 h-4 mb-0.5" aria-hidden="true" />
            <span>Accueil</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('shop', 'all', false)}
            className={`relative flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-semibold transition-colors ${
              activePage === 'shop' || activePage === 'product'
                ? 'text-[#E31E24]'
                : 'text-[#5C534C] hover:text-[#212529]'
            }`}
          >
            <Store className="w-4 h-4 mb-0.5" aria-hidden="true" />
            <span>Boutique</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('services')}
            className={`relative flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-semibold transition-colors ${
              activePage === 'services' ? 'text-[#E31E24]' : 'text-[#5C534C] hover:text-[#212529]'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 mb-0.5" aria-hidden="true" />
            <span>Services</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('contact')}
            className={`relative flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-semibold transition-colors ${
              activePage === 'contact' ? 'text-[#E31E24]' : 'text-[#5C534C] hover:text-[#212529]'
            }`}
          >
            <MapPin className="w-4 h-4 mb-0.5" aria-hidden="true" />
            <span>Agences</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(true)}
            className={`relative flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-semibold transition-colors ${
              isCartDrawerOpen || activePage === 'checkout'
                ? 'text-[#E31E24]'
                : 'text-[#5C534C] hover:text-[#212529]'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 mb-0.5" aria-hidden="true" />
              {totalQuantity > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#E31E24] text-white text-[9px] font-bold flex items-center justify-center tabular-price">
                  {totalQuantity}
                </span>
              )}
            </div>
            <span>Panier</span>
          </button>
        </div>
      </nav>

      {/* Retour visuel sobre et animé après ajout au panier */}
      <AnimatePresence>
        {lastAddedNotice && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-16 lg:bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-md w-[calc(100%-1.5rem)] bg-[#212529] text-white px-4 py-3 rounded-[12px] shadow-lg border border-white/15 flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-[#12B886] shrink-0" aria-hidden="true" />
              <span className="truncate">
                <strong>
                  {lastAddedNotice.quantity}× {lastAddedNotice.productName}
                </strong>{' '}
                ajouté au panier
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  dismissNotice();
                  setIsCartDrawerOpen(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#E31E24] hover:bg-[#C8161C] text-white font-semibold transition-colors whitespace-nowrap"
              >
                <ShoppingBag className="w-3 h-3" aria-hidden="true" />
                <span>Panier ({totalQuantity})</span>
              </button>
              <button
                type="button"
                onClick={dismissNotice}
                aria-label="Fermer la notification"
                className="p-1 text-white/70 hover:text-white rounded"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pop-up promotionnel / annonce piloté depuis Sanity */}
      <SitePopupBanner
        onNavigate={(page, catSlug) => handleNavigate(page, catSlug || 'all', false)}
        disabled={isAdminLoginOpen || activePage === 'admin'}
      />

      {/* Modale de connexion propriétaire ouverte par la roue d'engrenage du footer */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          setActivePage('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <SiteDataProvider>
      <StoreProvider>
        <StorefrontShell />
      </StoreProvider>
    </SiteDataProvider>
  );
}
