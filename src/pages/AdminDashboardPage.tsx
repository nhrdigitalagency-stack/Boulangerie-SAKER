import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Database,
  Edit3,
  Eye,
  FileText,
  ImagePlus,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  Package,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { useSiteData } from '../context/SiteDataContext';
import { formatPriceFCFA, normalizeSearchText, VERIFIED_CATEGORIES } from '../data/catalog';
import { CmsPopup, CmsProduct, CmsSiteContent } from '../data/cmsTypes';
import { ProductImage } from '../components/ProductImage';
import { SitePopupBanner } from '../components/SitePopupBanner';

type AdminTab = 'overview' | 'products' | 'popups' | 'pages' | 'account';
type ContentSubTab = 'home' | 'about' | 'services' | 'contact' | 'footer';

interface AdminDashboardPageProps {
  onBackToStorefront: () => void;
}

interface ProductFormState {
  _id?: string;
  name: string;
  price: string;
  categorySlug: string;
  image: string;
  shortDescription: string;
  description: string;
  isCustomizableCake: boolean;
  formatNote: string;
  featured: boolean;
}

interface PopupFormState {
  _id?: string;
  title: string;
  eyebrow: string;
  message: string;
  imageUrl: string;
  ctaLabel: string;
  ctaTargetPage: 'shop' | 'services' | 'contact' | 'about';
  ctaCategorySlug: string;
  isActive: boolean;
  triggerDelaySeconds: number;
  frequency: 'once_per_session' | 'once_per_day' | 'always';
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Impossible de lire le fichier image.'));
    reader.readAsDataURL(file);
  });
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onBackToStorefront,
}) => {
  const {
    adminUser,
    adminToken,
    logoutAdmin,
    refreshSiteData,
    setAdminSession,
    siteContent: liveSiteContent,
  } = useSiteData();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [contentSubTab, setContentSubTab] = useState<ContentSubTab>('home');

  const [products, setProducts] = useState<CmsProduct[]>([]);
  const [popups, setPopups] = useState<CmsPopup[]>([]);
  const [contentDraft, setContentDraft] = useState<CmsSiteContent>(liveSiteContent);
  const [sanityMeta, setSanityMeta] = useState<{
    projectId: string;
    orgId: string;
    dataset: string;
  }>({ projectId: '4li08lhr', orgId: 'oh314dkvd', dataset: 'production' });

  const [isLoadingOverview, setIsLoadingOverview] = useState<boolean>(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filtres Produits
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');

  // Modales Produit & Suppression
  const [editingProduct, setEditingProduct] = useState<ProductFormState | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isUploadingProductImg, setIsUploadingProductImg] = useState(false);
  const [productFormError, setProductFormError] = useState<string | null>(null);
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState<CmsProduct | null>(null);

  // Modales Pop-up & Prévisualisation
  const [editingPopup, setEditingPopup] = useState<PopupFormState | null>(null);
  const [isSavingPopup, setIsSavingPopup] = useState(false);
  const [isUploadingPopupImg, setIsUploadingPopupImg] = useState(false);
  const [popupFormError, setPopupFormError] = useState<string | null>(null);
  const [previewPopup, setPreviewPopup] = useState<CmsPopup | null>(null);
  const [confirmDeletePopup, setConfirmDeletePopup] = useState<CmsPopup | null>(null);

  // Sauvegarde Contenu Pages
  const [isSavingContent, setIsSavingContent] = useState(false);

  // Formulaire Compte Propriétaire
  const [accUsername, setAccUsername] = useState(adminUser?.username || '');
  const [accEmail, setAccEmail] = useState(adminUser?.email || '');
  const [accDisplayName, setAccDisplayName] = useState(adminUser?.displayName || '');
  const [accCurrentPassword, setAccCurrentPassword] = useState('');
  const [accNewPassword, setAccNewPassword] = useState('');
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  const authHeaders = useCallback((): HeadersInit => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (adminToken) {
      headers.Authorization = `Bearer ${adminToken}`;
    }
    return headers;
  }, [adminToken]);

  const loadOverview = useCallback(async () => {
    setIsLoadingOverview(true);
    try {
      const headers: HeadersInit = adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
      const res = await fetch('/api/admin/overview', { headers, cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Impossible de charger les données Sanity.');
        return;
      }
      setProducts(data.products || []);
      setPopups(data.popups || []);
      if (data.siteContent) setContentDraft(data.siteContent);
      if (data.sanityMeta) setSanityMeta(data.sanityMeta);
    } catch {
      showToast('error', 'Erreur réseau lors du chargement de Sanity.');
    } finally {
      setIsLoadingOverview(false);
    }
  }, [adminToken, showToast]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (adminUser) {
      setAccUsername(adminUser.username);
      setAccEmail(adminUser.email);
      setAccDisplayName(adminUser.displayName);
    }
  }, [adminUser]);

  const filteredProducts = useMemo(() => {
    const q = normalizeSearchText(productSearch);
    return products.filter((p) => {
      if (productCatFilter !== 'all' && p.categorySlug !== productCatFilter) return false;
      if (q) {
        const hay = normalizeSearchText(`${p.name} ${p.category} ${p.id}`);
        return hay.includes(q);
      }
      return true;
    });
  }, [products, productSearch, productCatFilter]);

  const activePopupsCount = useMemo(
    () => popups.filter((p) => p.isActive).length,
    [popups]
  );

  // --- Upload d'image vers Sanity Assets ---
  const handleImageUpload = async (
    file: File,
    onDone: (url: string) => void,
    setBusy: (b: boolean) => void
  ) => {
    setBusy(true);
    try {
      const base64Data = await fileToBase64(file);
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type || 'image/png',
          base64Data,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Échec du téléversement image.');
        return;
      }
      onDone(data.url);
      showToast('success', 'Image téléversée et hébergée sur Sanity CDN.');
    } catch {
      showToast('error', 'Erreur lors de l’envoi de l’image.');
    } finally {
      setBusy(false);
    }
  };

  // --- Produits : Ouvrir création / édition ---
  const openCreateProduct = () => {
    setProductFormError(null);
    setEditingProduct({
      name: '',
      price: '',
      categorySlug: VERIFIED_CATEGORIES[0].slug,
      image: '',
      shortDescription: '',
      description: '',
      isCustomizableCake: false,
      formatNote: '',
      featured: false,
    });
  };

  const openEditProduct = (p: CmsProduct) => {
    setProductFormError(null);
    setEditingProduct({
      _id: p._id,
      name: p.name,
      price: String(p.price),
      categorySlug: p.categorySlug,
      image: p.image || '',
      shortDescription: p.shortDescription || '',
      description: p.description || '',
      isCustomizableCake: Boolean(p.isCustomizableCake),
      formatNote: p.formatNote || '',
      featured: Boolean(p.featured),
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const cleanName = editingProduct.name.trim();
    const numericPrice = Number(editingProduct.price);

    if (cleanName.length < 2) {
      setProductFormError('Veuillez saisir un nom de produit valide (au moins 2 caractères).');
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setProductFormError('Veuillez saisir un prix valide en FCFA (nombre supérieur à 0).');
      return;
    }

    setIsSavingProduct(true);
    setProductFormError(null);

    try {
      const isEdit = Boolean(editingProduct._id);
      const url = isEdit
        ? `/api/admin/products/${encodeURIComponent(editingProduct._id!)}`
        : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify({
          name: cleanName,
          price: Math.round(numericPrice),
          categorySlug: editingProduct.categorySlug,
          image: editingProduct.image.trim() || null,
          shortDescription: editingProduct.shortDescription.trim(),
          description: editingProduct.description.trim(),
          isCustomizableCake: editingProduct.isCustomizableCake,
          formatNote: editingProduct.formatNote.trim(),
          featured: editingProduct.featured,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProductFormError(data.error || 'Erreur lors de l’enregistrement.');
        return;
      }

      setEditingProduct(null);
      await Promise.all([loadOverview(), refreshSiteData()]);
      showToast(
        'success',
        isEdit
          ? `Produit « ${cleanName} » mis à jour dans Sanity.`
          : `Produit « ${cleanName} » ajouté à la boutique.`
      );
    } catch {
      setProductFormError('Impossible de contacter le serveur.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!confirmDeleteProduct?._id) return;
    try {
      const res = await fetch(
        `/api/admin/products/${encodeURIComponent(confirmDeleteProduct._id)}`,
        {
          method: 'DELETE',
          headers: authHeaders(),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        showToast('error', data.error || 'Suppression impossible.');
        return;
      }
      const deletedName = confirmDeleteProduct.name;
      setConfirmDeleteProduct(null);
      await Promise.all([loadOverview(), refreshSiteData()]);
      showToast('success', `Produit « ${deletedName} » supprimé.`);
    } catch {
      showToast('error', 'Erreur lors de la suppression.');
    }
  };

  // --- Pop-ups : Création / Édition / Activation ---
  const openCreatePopup = () => {
    setPopupFormError(null);
    setEditingPopup({
      title: '',
      eyebrow: 'Boulangerie SAKER · Offre ou Annonce',
      message: '',
      imageUrl: '',
      ctaLabel: 'Voir le catalogue',
      ctaTargetPage: 'shop',
      ctaCategorySlug: 'all',
      isActive: true,
      triggerDelaySeconds: 2,
      frequency: 'once_per_session',
    });
  };

  const openEditPopup = (pop: CmsPopup) => {
    setPopupFormError(null);
    setEditingPopup({
      _id: pop._id,
      title: pop.title,
      eyebrow: pop.eyebrow || '',
      message: pop.message,
      imageUrl: pop.imageUrl || '',
      ctaLabel: pop.ctaLabel,
      ctaTargetPage: pop.ctaTargetPage || 'shop',
      ctaCategorySlug: pop.ctaCategorySlug || 'all',
      isActive: pop.isActive,
      triggerDelaySeconds: pop.triggerDelaySeconds ?? 2,
      frequency: pop.frequency || 'once_per_session',
    });
  };

  const handleSavePopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPopup) return;
    if (!editingPopup.title.trim() || !editingPopup.message.trim()) {
      setPopupFormError('Le titre et le message principal du pop-up sont obligatoires.');
      return;
    }

    setIsSavingPopup(true);
    setPopupFormError(null);
    try {
      const isEdit = Boolean(editingPopup._id);
      const url = isEdit
        ? `/api/admin/popups/${encodeURIComponent(editingPopup._id!)}`
        : '/api/admin/popups';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(editingPopup),
      });
      const data = await res.json();
      if (!res.ok) {
        setPopupFormError(data.error || 'Erreur lors de l’enregistrement du pop-up.');
        return;
      }
      setEditingPopup(null);
      await Promise.all([loadOverview(), refreshSiteData()]);
      showToast(
        'success',
        isEdit ? 'Pop-up mis à jour dans Sanity.' : 'Nouveau pop-up enregistré.'
      );
    } catch {
      setPopupFormError('Erreur de connexion au serveur.');
    } finally {
      setIsSavingPopup(false);
    }
  };

  const handleTogglePopupActive = async (pop: CmsPopup) => {
    try {
      const res = await fetch(`/api/admin/popups/${encodeURIComponent(pop._id)}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ ...pop, isActive: !pop.isActive }),
      });
      if (!res.ok) {
        showToast('error', 'Impossible de modifier le statut du pop-up.');
        return;
      }
      await Promise.all([loadOverview(), refreshSiteData()]);
      showToast(
        'success',
        !pop.isActive
          ? `Pop-up « ${pop.title} » activé sur le site.`
          : `Pop-up « ${pop.title} » mis en pause.`
      );
    } catch {
      showToast('error', 'Erreur réseau.');
    }
  };

  const handleDeletePopup = async () => {
    if (!confirmDeletePopup) return;
    try {
      const res = await fetch(
        `/api/admin/popups/${encodeURIComponent(confirmDeletePopup._id)}`,
        {
          method: 'DELETE',
          headers: authHeaders(),
        }
      );
      if (!res.ok) {
        showToast('error', 'Impossible de supprimer ce pop-up.');
        return;
      }
      setConfirmDeletePopup(null);
      await Promise.all([loadOverview(), refreshSiteData()]);
      showToast('success', 'Pop-up supprimé de Sanity.');
    } catch {
      showToast('error', 'Erreur lors de la suppression.');
    }
  };

  // --- Contenus des pages du site ---
  const handleSaveSiteContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingContent(true);
    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(contentDraft),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Échec de la sauvegarde des contenus.');
        return;
      }
      if (data.siteContent) setContentDraft(data.siteContent);
      await refreshSiteData();
      showToast('success', 'Contenus des pages mis à jour dans Sanity et publiés sur le site.');
    } catch {
      showToast('error', 'Impossible de joindre le serveur.');
    } finally {
      setIsSavingContent(false);
    }
  };

  // --- Compte propriétaire ---
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accCurrentPassword) {
      showToast('error', 'Veuillez saisir votre mot de passe actuel pour confirmer.');
      return;
    }
    setIsSavingAccount(true);
    try {
      const res = await fetch('/api/admin/account', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          username: accUsername,
          email: accEmail,
          displayName: accDisplayName,
          currentPassword: accCurrentPassword,
          newPassword: accNewPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Échec de la mise à jour du compte.');
        return;
      }
      setAdminSession(data.user, data.token);
      setAccCurrentPassword('');
      setAccNewPassword('');
      showToast('success', 'Identifiants propriétaire mis à jour dans Sanity.');
    } catch {
      showToast('error', 'Erreur de communication avec le serveur.');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const navItems: Array<{ id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: 'Vue d’ensemble', icon: LayoutDashboard },
    { id: 'products', label: `Produits (${products.length})`, icon: Package },
    { id: 'popups', label: `Pop-ups (${popups.length})`, icon: Megaphone },
    { id: 'pages', label: 'Contenus du site', icon: FileText },
    { id: 'account', label: 'Accès propriétaire', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#212529] flex flex-col lg:flex-row">
      {/* Barre latérale du Dashboard Propriétaire */}
      <aside className="lg:w-[250px] shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-[#E6DEC8] flex flex-col">
        <div className="px-5 py-4 border-b border-[#E6DEC8] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={BRAND_CONFIG.logos.primary}
              alt="Boulangerie SAKER"
              className="h-9 w-auto object-contain shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#212529] truncate">Administration</p>
              <p className="text-[11px] text-[#868E96] truncate">Sanity · {sanityMeta.projectId}</p>
            </div>
          </div>
        </div>

        <nav
          aria-label="Menu d'administration"
          className="p-3 flex lg:flex-col gap-1 overflow-x-auto no-scrollbar"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#E31E24] text-white shadow-xs'
                    : 'text-[#5C534C] hover:bg-[#F5EFE6] hover:text-[#212529]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="hidden lg:block mt-auto p-4 border-t border-[#E6DEC8] bg-[#FAF7F2] space-y-2.5">
          <div className="flex items-center gap-2 text-[11px] text-[#099268] font-semibold">
            <Database className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Base Sanity connectée ({sanityMeta.dataset})</span>
          </div>
          {adminUser && (
            <div className="text-xs">
              <p className="font-bold text-[#212529] truncate">{adminUser.displayName}</p>
              <p className="text-[11px] text-[#868E96] truncate">{adminUser.email}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Espace principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* En-tête supérieur */}
        <header className="bg-white border-b border-[#E6DEC8] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToStorefront}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-[#FAF7F2] hover:bg-[#EFE9DC] border border-[#E6DEC8] text-xs font-semibold text-[#212529] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Retour à la boutique</span>
            </button>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-[#212529] font-sans">
                {navItems.find((i) => i.id === activeTab)?.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                logoutAdmin();
                onBackToStorefront();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] border border-[#E6DEC8] hover:bg-[#FFF5F5] hover:text-[#C92A2A] text-xs font-semibold text-[#5C534C] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Déconnexion</span>
            </button>
          </div>
        </header>

        {/* Notification Toast */}
        {toast && (
          <div className="px-4 sm:px-8 pt-4">
            <div
              role="status"
              className={`p-3.5 rounded-[12px] border flex items-center justify-between gap-3 text-xs font-semibold ${
                toast.type === 'success'
                  ? 'bg-[#E6FCF5] border-[#12B886]/40 text-[#099268]'
                  : 'bg-[#FFF5F5] border-[#F03E3E]/40 text-[#C92A2A]'
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                )}
                <span>{toast.text}</span>
              </div>
              <button type="button" onClick={() => setToast(null)} aria-label="Fermer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-10 w-full space-y-6">
          {isLoadingOverview ? (
            <div className="bg-white rounded-[16px] border border-[#E6DEC8] p-12 flex flex-col items-center justify-center gap-3 text-sm text-[#5C534C]">
              <Loader2 className="w-6 h-6 text-[#E31E24] animate-spin" aria-hidden="true" />
              <span>Chargement des données Sanity CMS...</span>
            </div>
          ) : (
            <>
              {/* --- ONGLET 1 : VUE D'ENSEMBLE --- */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="bg-[#2A1810] text-white rounded-[18px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-[#F5B316]">
                        Tableau de bord Boulangerie SAKER
                      </span>
                      <h2 className="text-2xl font-bold text-white">
                        Bonjour {adminUser?.displayName || 'Propriétaire'}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#EAE0D5] max-w-xl">
                        Gérez votre catalogue de produits, vos annonces pop-up et le contenu
                        éditorial de vos pages en toute simplicité. Chaque modification est
                        enregistrée directement dans Sanity.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('products');
                        openCreateProduct();
                      }}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      <span>Ajouter un produit</span>
                    </button>
                  </div>

                  {/* Statistiques réelles depuis Sanity */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-[16px] border border-[#E6DEC8] p-5 space-y-1">
                      <p className="text-xs text-[#868E96] font-semibold">Produits en catalogue</p>
                      <p className="text-3xl font-bold text-[#212529] tabular-price">
                        {products.length}
                      </p>
                      <p className="text-[11px] text-[#5C534C]">
                        Répartis sur {VERIFIED_CATEGORIES.length} rayons officiels
                      </p>
                    </div>

                    <div className="bg-white rounded-[16px] border border-[#E6DEC8] p-5 space-y-1">
                      <p className="text-xs text-[#868E96] font-semibold">Pop-ups actifs</p>
                      <p className="text-3xl font-bold text-[#E31E24] tabular-price">
                        {activePopupsCount} / {popups.length}
                      </p>
                      <p className="text-[11px] text-[#5C534C]">
                        Diffusés aux visiteurs de la boutique
                      </p>
                    </div>

                    <div className="bg-white rounded-[16px] border border-[#E6DEC8] p-5 space-y-1">
                      <p className="text-xs text-[#868E96] font-semibold">Connexion Sanity CMS</p>
                      <p className="text-lg font-bold text-[#099268] font-mono">
                        {sanityMeta.projectId}
                      </p>
                      <p className="text-[11px] text-[#5C534C]">
                        Dataset « {sanityMeta.dataset} » · Synchronisation temps réel
                      </p>
                    </div>
                  </div>

                  {/* Raccourcis clairs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('products');
                        openCreateProduct();
                      }}
                      className="p-5 rounded-[16px] bg-white hover:bg-[#FFF4F6]/50 border border-[#E6DEC8] hover:border-[#E31E24]/40 text-left space-y-2 transition-colors"
                    >
                      <Package className="w-5 h-5 text-[#E31E24]" aria-hidden="true" />
                      <h3 className="text-sm font-bold text-[#212529] font-sans">
                        1. Ajouter ou modifier un produit
                      </h3>
                      <p className="text-xs text-[#5C534C]">
                        Ajoutez une photo, fixez le prix en FCFA, choisissez la catégorie et
                        publiez sans erreur.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('popups')}
                      className="p-5 rounded-[16px] bg-white hover:bg-[#FFF4F6]/50 border border-[#E6DEC8] hover:border-[#E31E24]/40 text-left space-y-2 transition-colors"
                    >
                      <Megaphone className="w-5 h-5 text-[#E31E24]" aria-hidden="true" />
                      <h3 className="text-sm font-bold text-[#212529] font-sans">
                        2. Créer une annonce pop-up
                      </h3>
                      <p className="text-xs text-[#5C534C]">
                        Mettez en avant une offre spéciale, un gâteau de fête ou un horaire
                        exceptionnel.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('pages')}
                      className="p-5 rounded-[16px] bg-white hover:bg-[#FFF4F6]/50 border border-[#E6DEC8] hover:border-[#E31E24]/40 text-left space-y-2 transition-colors"
                    >
                      <FileText className="w-5 h-5 text-[#E31E24]" aria-hidden="true" />
                      <h3 className="text-sm font-bold text-[#212529] font-sans">
                        3. Modifier les textes des pages
                      </h3>
                      <p className="text-xs text-[#5C534C]">
                        Mettez à jour l’accueil, À propos, Services, téléphones et adresses des
                        agences.
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* --- ONGLET 2 : GESTION DES PRODUITS --- */}
              {activeTab === 'products' && (
                <div className="space-y-5">
                  <div className="bg-white rounded-[16px] border border-[#E6DEC8] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-1 flex-wrap items-center gap-2.5">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search
                          className="w-4 h-4 text-[#868E96] absolute left-3 top-1/2 -translate-y-1/2"
                          aria-hidden="true"
                        />
                        <input
                          type="search"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Rechercher un produit par nom ou référence..."
                          className="w-full pl-9 pr-3 py-2 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs text-[#212529] focus:outline-none focus:border-[#E31E24]"
                        />
                      </div>

                      <select
                        value={productCatFilter}
                        onChange={(e) => setProductCatFilter(e.target.value)}
                        aria-label="Filtrer par catégorie"
                        className="px-3 py-2 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs font-semibold text-[#212529] focus:outline-none focus:border-[#E31E24]"
                      >
                        <option value="all">Toutes catégories ({products.length})</option>
                        {VERIFIED_CATEGORIES.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={openCreateProduct}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      <span>Ajouter un produit</span>
                    </button>
                  </div>

                  {/* Liste des produits */}
                  <div className="bg-white rounded-[16px] border border-[#E6DEC8] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#FAF7F2] border-b border-[#E6DEC8] text-[11px] font-bold text-[#5C534C] uppercase tracking-wider">
                            <th className="py-3 px-4">Produit</th>
                            <th className="py-3 px-4">Catégorie</th>
                            <th className="py-3 px-4">Prix (FCFA)</th>
                            <th className="py-3 px-4 hidden md:table-cell">Options</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE9DC] text-xs">
                          {filteredProducts.map((p) => (
                            <tr key={p._id || p.id} className="hover:bg-[#FAF7F2]/60">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-lg bg-[#F5EFE6] border border-[#E6DEC8] shrink-0 overflow-hidden">
                                    <ProductImage
                                      src={p.image}
                                      alt={p.name}
                                      className="w-full h-full p-1"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-[#212529] truncate max-w-[220px]">
                                      {p.name}
                                    </p>
                                    <p className="text-[11px] text-[#868E96]">Réf. #{p.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-[#5C534C] whitespace-nowrap">
                                {p.category}
                              </td>
                              <td className="py-3 px-4 font-bold text-[#E31E24] tabular-price whitespace-nowrap">
                                {formatPriceFCFA(p.price)}
                              </td>
                              <td className="py-3 px-4 hidden md:table-cell text-[11px] text-[#5C534C]">
                                {p.featured && (
                                  <span className="inline-block mr-2 px-2 py-0.5 rounded bg-[#FEF8E8] text-[#B45309] font-semibold">
                                    Vedette accueil
                                  </span>
                                )}
                                {p.isCustomizableCake && (
                                  <span className="inline-block px-2 py-0.5 rounded bg-[#FFF4F6] text-[#E31E24] font-semibold">
                                    Personnalisable
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => openEditProduct(p)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EFE9DC] border border-[#E6DEC8] text-[#212529] font-semibold transition-colors"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                                    <span>Modifier</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteProduct(p)}
                                    aria-label={`Supprimer ${p.name}`}
                                    className="p-1.5 rounded-lg border border-[#E6DEC8] text-[#868E96] hover:bg-[#FFF5F5] hover:text-[#C92A2A] transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* --- ONGLET 3 : POP-UPS & ANNONCES --- */}
              {activeTab === 'popups' && (
                <div className="space-y-5">
                  <div className="bg-white rounded-[16px] border border-[#E6DEC8] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-[#212529] font-sans">
                        Pop-ups &amp; Annonces promotionnelles
                      </h2>
                      <p className="text-xs text-[#5C534C]">
                        Activez ou programmez un message pop-up visible dès l’arrivée sur la
                        boutique.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openCreatePopup}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      <span>Créer un pop-up</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {popups.map((pop) => (
                      <article
                        key={pop._id}
                        className={`bg-white rounded-[16px] border p-5 flex flex-col justify-between gap-4 ${
                          pop.isActive ? 'border-[#12B886]' : 'border-[#E6DEC8]'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                pop.isActive
                                  ? 'bg-[#E6FCF5] text-[#099268]'
                                  : 'bg-[#FAF7F2] text-[#868E96]'
                              }`}
                            >
                              {pop.isActive ? 'Actif sur le site' : 'En pause'}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleTogglePopupActive(pop)}
                              className="text-xs font-semibold text-[#E31E24] hover:underline"
                            >
                              {pop.isActive ? 'Mettre en pause' : 'Activer maintenant'}
                            </button>
                          </div>

                          {pop.imageUrl && (
                            <div className="aspect-[16/9] rounded-lg overflow-hidden bg-[#F5EFE6] border border-[#E6DEC8]">
                              <img
                                src={pop.imageUrl}
                                alt={pop.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <div>
                            <p className="text-[11px] text-[#868E96]">{pop.eyebrow}</p>
                            <h3 className="text-base font-bold text-[#212529] font-sans mt-0.5">
                              {pop.title}
                            </h3>
                            <p className="text-xs text-[#5C534C] mt-1 leading-relaxed">
                              {pop.message}
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#EFE9DC] flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewPopup(pop)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#212529] hover:text-[#E31E24]"
                          >
                            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Prévisualiser</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditPopup(pop)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EFE9DC] border border-[#E6DEC8] text-xs font-semibold text-[#212529]"
                            >
                              <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Modifier</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeletePopup(pop)}
                              aria-label={`Supprimer ${pop.title}`}
                              className="p-1.5 rounded-lg border border-[#E6DEC8] text-[#868E96] hover:bg-[#FFF5F5] hover:text-[#C92A2A]"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* --- ONGLET 4 : CONTENU DES PAGES DU SITE --- */}
              {activeTab === 'pages' && (
                <form onSubmit={handleSaveSiteContent} className="space-y-5">
                  <div className="bg-white rounded-[16px] border border-[#E6DEC8] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(
                        [
                          { id: 'home', label: 'Page Accueil' },
                          { id: 'about', label: 'Page À propos' },
                          { id: 'services', label: 'Page Services' },
                          { id: 'contact', label: 'Contact & Agences' },
                          { id: 'footer', label: 'Pied de page' },
                        ] as const
                      ).map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setContentSubTab(st.id)}
                          className={`px-3.5 py-2 rounded-[10px] text-xs font-semibold transition-colors ${
                            contentSubTab === st.id
                              ? 'bg-[#2A1810] text-white'
                              : 'bg-[#FAF7F2] text-[#5C534C] hover:text-[#212529]'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingContent}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] disabled:opacity-60 text-white text-xs font-semibold transition-colors"
                    >
                      {isSavingContent ? (
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Save className="w-4 h-4" aria-hidden="true" />
                      )}
                      <span>Enregistrer et publier</span>
                    </button>
                  </div>

                  {/* Sous-formulaire Accueil */}
                  {contentSubTab === 'home' && (
                    <div className="bg-white rounded-[16px] border border-[#E6DEC8] p-6 space-y-6">
                      <h3 className="text-base font-bold text-[#212529] font-sans">
                        Bannière d’accueil (3 univers)
                      </h3>

                      {(
                        [
                          { key: 'panification', title: '01. Pains & Fournées' },
                          { key: 'patisserie', title: '02. Entremets & Célébrations' },
                          { key: 'pauseGourmande', title: '03. Friands, Cakes & Pause salée' },
                        ] as const
                      ).map(({ key, title }) => (
                        <div
                          key={key}
                          className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E6DEC8] space-y-3"
                        >
                          <p className="text-xs font-bold text-[#E31E24]">{title}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-[#212529] mb-1">
                                Badge supérieur
                              </label>
                              <input
                                type="text"
                                value={contentDraft.home.universes[key].badge}
                                onChange={(e) =>
                                  setContentDraft({
                                    ...contentDraft,
                                    home: {
                                      ...contentDraft.home,
                                      universes: {
                                        ...contentDraft.home.universes,
                                        [key]: {
                                          ...contentDraft.home.universes[key],
                                          badge: e.target.value,
                                        },
                                      },
                                    },
                                  })
                                }
                                className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6DEC8] text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-[#212529] mb-1">
                                Bouton d’action
                              </label>
                              <input
                                type="text"
                                value={contentDraft.home.universes[key].ctaPrimaryLabel}
                                onChange={(e) =>
                                  setContentDraft({
                                    ...contentDraft,
                                    home: {
                                      ...contentDraft.home,
                                      universes: {
                                        ...contentDraft.home.universes,
                                        [key]: {
                                          ...contentDraft.home.universes[key],
                                          ctaPrimaryLabel: e.target.value,
                                        },
                                      },
                                    },
                                  })
                                }
                                className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6DEC8] text-xs"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[11px] font-semibold text-[#212529] mb-1">
                                Grand titre
                              </label>
                              <input
                                type="text"
                                value={contentDraft.home.universes[key].title}
                                onChange={(e) =>
                                  setContentDraft({
                                    ...contentDraft,
                                    home: {
                                      ...contentDraft.home,
                                      universes: {
                                        ...contentDraft.home.universes,
                                        [key]: {
                                          ...contentDraft.home.universes[key],
                                          title: e.target.value,
                                        },
                                      },
                                    },
                                  })
                                }
                                className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6DEC8] text-xs font-semibold"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[11px] font-semibold text-[#212529] mb-1">
                                Sous-titre descriptif
                              </label>
                              <textarea
                                rows={2}
                                value={contentDraft.home.universes[key].subtitle}
                                onChange={(e) =>
                                  setContentDraft({
                                    ...contentDraft,
                                    home: {
                                      ...contentDraft.home,
                                      universes: {
                                        ...contentDraft.home.universes,
                                        [key]: {
                                          ...contentDraft.home.universes[key],
                                          subtitle: e.target.value,
                                        },
                                      },
                                    },
                                  })
                                }
                                className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6DEC8] text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#EFE9DC]">
                        <div>
                          <label className="block text-xs font-semibold text-[#212529] mb-1">
                            Titre section Rayons
                          </label>
                          <input
                            type="text"
                            value={contentDraft.home.categoriesHeading}
                            onChange={(e) =>
                              setContentDraft({
                                ...contentDraft,
                                home: { ...contentDraft.home, categoriesHeading: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#212529] mb-1">
                            Titre section Spécialités
                          </label>
                          <input
                            type="text"
                            value={contentDraft.home.productsHeading}
                            onChange={(e) =>
                              setContentDraft({
                                ...contentDraft,
                                home: { ...contentDraft.home, productsHeading: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-[#212529] mb-1">
                            Titre bloc Histoire sur l’accueil
                          </label>
                          <input
                            type="text"
                            value={contentDraft.home.historyHeading}
                            onChange={(e) =>
                              setContentDraft({
                                ...contentDraft,
                                home: { ...contentDraft.home, historyHeading: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-[#212529] mb-1">
                            Texte bloc Histoire sur l’accueil
                          </label>
                          <textarea
                            rows={3}
                            value={contentDraft.home.historyBody}
                            onChange={(e) =>
                              setContentDraft({
                                ...contentDraft,
                                home: { ...contentDraft.home, historyBody: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sous-formulaire À propos */}
                  {contentSubTab === 'about' && (
                    <div className="bg-white rounded-[16px] border border-[#E6DEC8] p-6 space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#212529] mb-1">
                          Titre principal (À propos)
                        </label>
                        <input
                          type="text"
                          value={contentDraft.about.pageTitle}
                          onChange={(e) =>
                            setContentDraft({
                              ...contentDraft,
                              about: { ...contentDraft.about, pageTitle: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#212529] mb-1">
                          Introduction
                        </label>
                        <textarea
                          rows={3}
                          value={contentDraft.about.intro}
                          onChange={(e) =>
                            setContentDraft({
                              ...contentDraft,
                              about: { ...contentDraft.about, intro: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#212529] mb-1">
                          Message du Fondateur
                        </label>
                        <textarea
                          rows={4}
                          value={contentDraft.about.founderQuote}
                          onChange={(e) =>
                            setContentDraft({
                              ...contentDraft,
                              about: { ...contentDraft.about, founderQuote: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#212529] mb-1">
                            Notre Vision
                          </label>
                          <textarea
                            rows={3}
                            value={contentDraft.about.vision}
                            onChange={(e) =>
                              setContentDraft({
                                ...contentDraft,
                                about: { ...contentDraft.about, vision: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#212529] mb-1">
                            Notre Mission
                          </label>
                          <textarea
                            rows={3}
                            value={contentDraft.about.mission}
                            onChange={(e) =>
                              setContentDraft({
                                ...contentDraft,
                                about: { ...contentDraft.about, mission: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#212529] mb-1">
                            Nos Unités à Douala
                          </label>
                          <textarea
                            rows={3}
                            value={contentDraft.about.unitsOverview}
                            onChange={(e) =>
                              setContentDraft({
                                ...contentDraft,
                                about: { ...contentDraft.about, unitsOverview: e.target.value },
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                          />
                        </div>
                      </div>

                      {/* Éditeur FAQ de la page À propos */}
                      <div className="pt-5 mt-2 border-t border-[#EFE9DC] space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-[#212529] font-sans">
                              Foire aux questions (FAQ — Page À propos)
                            </h4>
                            <p className="text-[11px] text-[#5C534C]">
                              Ajoutez, modifiez ou supprimez les questions fréquentes visibles par
                              vos clients.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const currentFaq = contentDraft.about.faqItems || [];
                              setContentDraft({
                                ...contentDraft,
                                about: {
                                  ...contentDraft.about,
                                  faqItems: [
                                    ...currentFaq,
                                    {
                                      id: `faq-${Date.now()}`,
                                      question: '',
                                      answer: '',
                                    },
                                  ],
                                },
                              });
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-[#2A1810] hover:bg-[#3D2418] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Ajouter une question FAQ</span>
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#212529] mb-1">
                            Titre de la section FAQ
                          </label>
                          <input
                            type="text"
                            value={contentDraft.about.faqHeading || ''}
                            onChange={(e) =>
                              setContentDraft({
                                ...contentDraft,
                                about: { ...contentDraft.about, faqHeading: e.target.value },
                              })
                            }
                            className="w-full px-3.5 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs font-semibold"
                          />
                        </div>

                        <div className="space-y-3">
                          {(contentDraft.about.faqItems || []).map((faq, idx) => (
                            <div
                              key={faq.id}
                              className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E6DEC8] space-y-2.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold text-[#E31E24]">
                                  Question #{idx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = (contentDraft.about.faqItems || []).filter(
                                      (item) => item.id !== faq.id
                                    );
                                    setContentDraft({
                                      ...contentDraft,
                                      about: { ...contentDraft.about, faqItems: next },
                                    });
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#868E96] hover:text-[#C92A2A]"
                                >
                                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Supprimer</span>
                                </button>
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-[#212529] mb-1">
                                  Question
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="Ex. Quels sont vos délais pour un gâteau personnalisé ?"
                                  value={faq.question}
                                  onChange={(e) => {
                                    const next = [...(contentDraft.about.faqItems || [])];
                                    next[idx] = { ...faq, question: e.target.value };
                                    setContentDraft({
                                      ...contentDraft,
                                      about: { ...contentDraft.about, faqItems: next },
                                    });
                                  }}
                                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6DEC8] text-xs font-semibold"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-[#212529] mb-1">
                                  Réponse
                                </label>
                                <textarea
                                  rows={2}
                                  required
                                  placeholder="Rédigez une réponse claire pour vos clients..."
                                  value={faq.answer}
                                  onChange={(e) => {
                                    const next = [...(contentDraft.about.faqItems || [])];
                                    next[idx] = { ...faq, answer: e.target.value };
                                    setContentDraft({
                                      ...contentDraft,
                                      about: { ...contentDraft.about, faqItems: next },
                                    });
                                  }}
                                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6DEC8] text-xs"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sous-formulaire Services */}
                  {contentSubTab === 'services' && (
                    <div className="bg-white rounded-[16px] border border-[#E6DEC8] p-6 space-y-5">
                      <div>
                        <label className="block text-xs font-semibold text-[#212529] mb-1">
                          Titre de la page Services
                        </label>
                        <input
                          type="text"
                          value={contentDraft.servicesPage.pageTitle}
                          onChange={(e) =>
                            setContentDraft({
                              ...contentDraft,
                              servicesPage: {
                                ...contentDraft.servicesPage,
                                pageTitle: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#212529] mb-1">
                          Introduction Services
                        </label>
                        <textarea
                          rows={3}
                          value={contentDraft.servicesPage.pageIntro}
                          onChange={(e) =>
                            setContentDraft({
                              ...contentDraft,
                              servicesPage: {
                                ...contentDraft.servicesPage,
                                pageIntro: e.target.value,
                              },
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                        />
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs font-bold text-[#212529]">Fiches Services</p>
                        {contentDraft.servicesPage.services.map((srv, idx) => (
                          <div
                            key={srv.id}
                            className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E6DEC8] space-y-2.5"
                          >
                            <input
                              type="text"
                              value={srv.title}
                              onChange={(e) => {
                                const next = [...contentDraft.servicesPage.services];
                                next[idx] = { ...srv, title: e.target.value };
                                setContentDraft({
                                  ...contentDraft,
                                  servicesPage: { ...contentDraft.servicesPage, services: next },
                                });
                              }}
                              className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6DEC8] text-xs font-bold"
                            />
                            <textarea
                              rows={2}
                              value={srv.description}
                              onChange={(e) => {
                                const next = [...contentDraft.servicesPage.services];
                                next[idx] = { ...srv, description: e.target.value };
                                setContentDraft({
                                  ...contentDraft,
                                  servicesPage: { ...contentDraft.servicesPage, services: next },
                                });
                              }}
                              className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6DEC8] text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sous-formulaire Contact & Agences */}
                  {contentSubTab === 'contact' && (
                    <div className="bg-white rounded-[16px] border border-[#E6DEC8] p-6 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-[#212529] mb-1">
                            Titre page Contact
                          </label>
                          <input
                            type="text"
                            value={contentDraft.contactPage.pageTitle}
                            onChange={(e) =>
                              setContentDraft({
                                ...contentDraft,
                                contactPage: {
                                  ...contentDraft.contactPage,
                                  pageTitle: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#212529] mb-1">
                            Téléphone principal
                          </label>
                          <input
                            type="text"
                            value={contentDraft.contactPage.phonePrimary}
                            onChange={(e) =>
                              setContentDraft({
                                ...contentDraft,
                                contactPage: {
                                  ...contentDraft.contactPage,
                                  phonePrimary: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#212529] mb-1">
                            Téléphone secondaire
                          </label>
                          <input
                            type="text"
                            value={contentDraft.contactPage.phoneSecondary}
                            onChange={(e) =>
                              setContentDraft({
                                ...contentDraft,
                                contactPage: {
                                  ...contentDraft.contactPage,
                                  phoneSecondary: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#212529] mb-1">
                            E-mail de contact
                          </label>
                          <input
                            type="email"
                            value={contentDraft.contactPage.email}
                            onChange={(e) =>
                              setContentDraft({
                                ...contentDraft,
                                contactPage: {
                                  ...contentDraft.contactPage,
                                  email: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#212529] mb-1">
                            Horaires affichés
                          </label>
                          <input
                            type="text"
                            value={contentDraft.contactPage.openingHours}
                            onChange={(e) =>
                              setContentDraft({
                                ...contentDraft,
                                contactPage: {
                                  ...contentDraft.contactPage,
                                  openingHours: e.target.value,
                                },
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-2 border-t border-[#EFE9DC]">
                        <p className="text-xs font-bold text-[#212529]">
                          Coordonnées des Agences ({contentDraft.contactPage.agencies.length})
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {contentDraft.contactPage.agencies.map((ag, idx) => (
                            <div
                              key={ag.id}
                              className="p-3.5 rounded-[12px] bg-[#FAF7F2] border border-[#E6DEC8] space-y-2"
                            >
                              <input
                                type="text"
                                value={ag.name}
                                onChange={(e) => {
                                  const next = [...contentDraft.contactPage.agencies];
                                  next[idx] = { ...ag, name: e.target.value };
                                  setContentDraft({
                                    ...contentDraft,
                                    contactPage: { ...contentDraft.contactPage, agencies: next },
                                  });
                                }}
                                className="w-full px-2.5 py-1.5 rounded bg-white border border-[#E6DEC8] text-xs font-bold"
                              />
                              <input
                                type="text"
                                value={ag.phone}
                                onChange={(e) => {
                                  const next = [...contentDraft.contactPage.agencies];
                                  next[idx] = { ...ag, phone: e.target.value };
                                  setContentDraft({
                                    ...contentDraft,
                                    contactPage: { ...contentDraft.contactPage, agencies: next },
                                  });
                                }}
                                placeholder="Téléphone"
                                className="w-full px-2.5 py-1.5 rounded bg-white border border-[#E6DEC8] text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sous-formulaire Pied de page */}
                  {contentSubTab === 'footer' && (
                    <div className="bg-white rounded-[16px] border border-[#E6DEC8] p-6 space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#212529] mb-1">
                          Présentation courte dans le pied de page
                        </label>
                        <textarea
                          rows={3}
                          value={contentDraft.footer.brandDescription}
                          onChange={(e) =>
                            setContentDraft({
                              ...contentDraft,
                              footer: { ...contentDraft.footer, brandDescription: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#212529] mb-1">
                          Mention légale bas de page
                        </label>
                        <input
                          type="text"
                          value={contentDraft.footer.legalNotice}
                          onChange={(e) =>
                            setContentDraft({
                              ...contentDraft,
                              footer: { ...contentDraft.footer, legalNotice: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                        />
                      </div>
                    </div>
                  )}
                </form>
              )}

              {/* --- ONGLET 5 : COMPTE PROPRIÉTAIRE --- */}
              {activeTab === 'account' && (
                <form
                  onSubmit={handleSaveAccount}
                  className="bg-white rounded-[16px] border border-[#E6DEC8] p-6 sm:p-8 max-w-xl space-y-4"
                >
                  <div>
                    <h2 className="text-lg font-bold text-[#212529] font-sans">
                      Identifiants de connexion du propriétaire
                    </h2>
                    <p className="text-xs text-[#5C534C] mt-1">
                      Ces informations sont stockées de manière chiffrée dans Sanity DB et servent
                      à déverrouiller la roue d’engrenage du pied de page.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#212529] mb-1">
                      Nom affiché
                    </label>
                    <input
                      type="text"
                      required
                      value={accDisplayName}
                      onChange={(e) => setAccDisplayName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#212529] mb-1">
                        Nom d’utilisateur
                      </label>
                      <input
                        type="text"
                        required
                        value={accUsername}
                        onChange={(e) => setAccUsername(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#212529] mb-1">
                        Adresse e-mail
                      </label>
                      <input
                        type="email"
                        required
                        value={accEmail}
                        onChange={(e) => setAccEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#EFE9DC] space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#212529] mb-1">
                        Nouveau mot de passe (laisser vide pour conserver l’actuel)
                      </label>
                      <input
                        type="password"
                        value={accNewPassword}
                        onChange={(e) => setAccNewPassword(e.target.value)}
                        placeholder="Minimum 8 caractères"
                        className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#212529] mb-1">
                        Mot de passe actuel <span className="text-[#E31E24]">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={accCurrentPassword}
                        onChange={(e) => setAccCurrentPassword(e.target.value)}
                        placeholder="Confirmez avec votre mot de passe actuel"
                        className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingAccount}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold transition-colors"
                  >
                    {isSavingAccount && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Mettre à jour mes accès</span>
                  </button>
                </form>
              )}
            </>
          )}
        </main>
      </div>

      {/* --- MODALE CRÉATION / ÉDITION PRODUIT SANS FAUTE --- */}
      {editingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1810]/60"
          role="dialog"
          aria-modal="true"
          aria-label="Éditeur de produit"
        >
          <div className="bg-white rounded-[20px] border border-[#E6DEC8] shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E6DEC8] flex items-center justify-between">
              <h2 className="text-base font-bold text-[#212529] font-sans">
                {editingProduct._id ? `Modifier : ${editingProduct.name}` : 'Nouveau produit SAKER'}
              </h2>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C534C] hover:bg-[#EFE9DC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSaveProduct}
              className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5"
            >
              {productFormError && (
                <div className="p-3 rounded-lg bg-[#FFF5F5] border border-[#F03E3E]/40 text-xs text-[#C92A2A] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{productFormError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Colonne Formulaire */}
                <div className="md:col-span-7 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#212529] mb-1">
                      Nom du produit <span className="text-[#E31E24]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, name: e.target.value })
                      }
                      placeholder="Ex. Entremet Royal Chocolat"
                      className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs sm:text-sm focus:outline-none focus:border-[#E31E24]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#212529] mb-1">
                        Prix (en FCFA) <span className="text-[#E31E24]">*</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        step={5}
                        required
                        value={editingProduct.price}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, price: e.target.value })
                        }
                        placeholder="Ex. 15000"
                        className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs sm:text-sm tabular-price focus:outline-none focus:border-[#E31E24]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#212529] mb-1">
                        Rayon / Catégorie <span className="text-[#E31E24]">*</span>
                      </label>
                      <select
                        value={editingProduct.categorySlug}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, categorySlug: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#E31E24]"
                      >
                        {VERIFIED_CATEGORIES.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Photo du produit : Upload Sanity CDN ou URL */}
                  <div className="p-3.5 rounded-[12px] bg-[#FAF7F2] border border-[#E6DEC8] space-y-2.5">
                    <label className="block text-xs font-semibold text-[#212529]">
                      Photo du produit (hébergée sur Sanity)
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#2A1810] hover:bg-[#3D2418] text-white text-xs font-semibold cursor-pointer transition-colors">
                        {isUploadingProductImg ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {isUploadingProductImg ? 'Envoi...' : 'Importer une photo'}
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              void handleImageUpload(
                                f,
                                (url) =>
                                  setEditingProduct((prev) =>
                                    prev ? { ...prev, image: url } : null
                                  ),
                                setIsUploadingProductImg
                              );
                            }
                          }}
                        />
                      </label>

                      <input
                        type="text"
                        value={editingProduct.image}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, image: e.target.value })
                        }
                        placeholder="Ou collez une URL d’image (/assets/saker/...)"
                        className="flex-1 min-w-[180px] px-3 py-2 rounded-lg bg-white border border-[#E6DEC8] text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#212529] mb-1">
                      Accroche courte (affichée sur la carte produit)
                    </label>
                    <textarea
                      rows={2}
                      value={editingProduct.shortDescription}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          shortDescription: e.target.value,
                        })
                      }
                      placeholder="Phrase courte décrivant la saveur ou l'usage..."
                      className="w-full px-3.5 py-2 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs focus:outline-none focus:border-[#E31E24]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#212529] mb-1">
                      Description détaillée
                    </label>
                    <textarea
                      rows={3}
                      value={editingProduct.description}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, description: e.target.value })
                      }
                      placeholder="Détails complets pour la fiche produit..."
                      className="w-full px-3.5 py-2 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs focus:outline-none focus:border-[#E31E24]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-4 pt-1">
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-[#212529] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isCustomizableCake}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            isCustomizableCake: e.target.checked,
                          })
                        }
                        className="accent-[#E31E24] w-4 h-4"
                      />
                      <span>Gâteau personnalisable (message + date)</span>
                    </label>

                    <label className="inline-flex items-center gap-2 text-xs font-medium text-[#212529] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.featured}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, featured: e.target.checked })
                        }
                        className="accent-[#E31E24] w-4 h-4"
                      />
                      <span>Afficher sur la page d’accueil</span>
                    </label>
                  </div>
                </div>

                {/* Colonne Aperçu en direct pour éviter toute faute */}
                <div className="md:col-span-5 space-y-2.5">
                  <p className="text-xs font-bold text-[#5C534C]">
                    Aperçu en direct sur la boutique
                  </p>
                  <div className="rounded-[16px] border border-[#E6DEC8] bg-[#FAF7F2] p-4 space-y-3">
                    <div className="aspect-[4/3] rounded-[12px] bg-white border border-[#E6DEC8] overflow-hidden">
                      <ProductImage
                        src={editingProduct.image || null}
                        alt={editingProduct.name || 'Aperçu produit'}
                        className="w-full h-full p-3"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[#5C534C]">
                        {VERIFIED_CATEGORIES.find((c) => c.slug === editingProduct.categorySlug)
                          ?.name || 'Rayon'}
                      </p>
                      <p className="text-sm font-bold text-[#212529] mt-0.5">
                        {editingProduct.name.trim() || 'Nom du produit'}
                      </p>
                      <p className="text-xs text-[#5C534C] line-clamp-2 mt-1">
                        {editingProduct.shortDescription.trim() ||
                          'Votre accroche apparaîtra ici.'}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-[#E6DEC8] flex items-center justify-between">
                      <span className="text-base font-bold text-[#E31E24] tabular-price">
                        {Number(editingProduct.price) > 0
                          ? formatPriceFCFA(Number(editingProduct.price))
                          : '0 FCFA'}
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-[#E31E24] text-white text-[11px] font-semibold">
                        Ajouter
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E6DEC8] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-[10px] bg-[#FAF7F2] hover:bg-[#EFE9DC] border border-[#E6DEC8] text-xs font-semibold text-[#5C534C]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct || isUploadingProductImg}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold"
                >
                  {isSavingProduct && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {editingProduct._id ? 'Enregistrer les modifications' : 'Publier le produit'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODALE CONFIRMATION SUPPRESSION PRODUIT --- */}
      {confirmDeleteProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1810]/60"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-[18px] border border-[#E6DEC8] p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#212529]">Supprimer ce produit ?</h3>
            <p className="text-xs text-[#5C534C]">
              Le produit <strong>« {confirmDeleteProduct.name} »</strong> sera retiré du
              catalogue Sanity et ne sera plus visible en boutique.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDeleteProduct(null)}
                className="px-4 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs font-semibold text-[#5C534C]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="px-4 py-2 rounded-lg bg-[#C92A2A] hover:bg-[#A61E1E] text-white text-xs font-semibold"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALE CRÉATION / ÉDITION POP-UP --- */}
      {editingPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1810]/60"
          role="dialog"
          aria-modal="true"
          aria-label="Éditeur de pop-up"
        >
          <div className="bg-white rounded-[20px] border border-[#E6DEC8] shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E6DEC8] flex items-center justify-between">
              <h2 className="text-base font-bold text-[#212529] font-sans">
                {editingPopup._id ? 'Modifier le pop-up' : 'Nouveau pop-up vitrine'}
              </h2>
              <button
                type="button"
                onClick={() => setEditingPopup(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C534C] hover:bg-[#EFE9DC]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSavePopup}
              className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4"
            >
              {popupFormError && (
                <div className="p-3 rounded-lg bg-[#FFF5F5] border border-[#F03E3E]/40 text-xs text-[#C92A2A]">
                  {popupFormError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#212529] mb-1">
                  Sur-titre (ex. Offre du moment)
                </label>
                <input
                  type="text"
                  value={editingPopup.eyebrow}
                  onChange={(e) => setEditingPopup({ ...editingPopup, eyebrow: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#212529] mb-1">
                  Titre principal <span className="text-[#E31E24]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingPopup.title}
                  onChange={(e) => setEditingPopup({ ...editingPopup, title: e.target.value })}
                  placeholder="Ex. Commandez vos bûches et gâteaux d’anniversaire"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs sm:text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#212529] mb-1">
                  Message <span className="text-[#E31E24]">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingPopup.message}
                  onChange={(e) => setEditingPopup({ ...editingPopup, message: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                />
              </div>

              {/* Image du pop-up */}
              <div className="p-3 rounded-[12px] bg-[#FAF7F2] border border-[#E6DEC8] space-y-2">
                <label className="block text-xs font-semibold text-[#212529]">
                  Image (facultatif)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2A1810] text-white text-xs font-semibold cursor-pointer">
                    {isUploadingPopupImg ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ImagePlus className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploadingPopupImg ? 'Envoi...' : 'Importer image'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          void handleImageUpload(
                            f,
                            (url) =>
                              setEditingPopup((prev) =>
                                prev ? { ...prev, imageUrl: url } : null
                              ),
                            setIsUploadingPopupImg
                          );
                        }
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    value={editingPopup.imageUrl}
                    onChange={(e) =>
                      setEditingPopup({ ...editingPopup, imageUrl: e.target.value })
                    }
                    placeholder="Ou URL image..."
                    className="flex-1 min-w-[160px] px-3 py-2 rounded-lg bg-white border border-[#E6DEC8] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#212529] mb-1">
                    Libellé du bouton
                  </label>
                  <input
                    type="text"
                    value={editingPopup.ctaLabel}
                    onChange={(e) =>
                      setEditingPopup({ ...editingPopup, ctaLabel: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#212529] mb-1">
                    Page cible du bouton
                  </label>
                  <select
                    value={editingPopup.ctaTargetPage}
                    onChange={(e) =>
                      setEditingPopup({
                        ...editingPopup,
                        ctaTargetPage: e.target.value as PopupFormState['ctaTargetPage'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs font-semibold"
                  >
                    <option value="shop">Boutique / Catalogue</option>
                    <option value="services">Nos Services</option>
                    <option value="contact">Contact &amp; Agences</option>
                    <option value="about">À propos</option>
                  </select>
                </div>

                {editingPopup.ctaTargetPage === 'shop' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#212529] mb-1">
                      Rayon ouvert au clic
                    </label>
                    <select
                      value={editingPopup.ctaCategorySlug}
                      onChange={(e) =>
                        setEditingPopup({ ...editingPopup, ctaCategorySlug: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                    >
                      <option value="all">Tous les rayons</option>
                      {VERIFIED_CATEGORIES.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#212529] mb-1">
                    Délai avant apparition (secondes)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={editingPopup.triggerDelaySeconds}
                    onChange={(e) =>
                      setEditingPopup({
                        ...editingPopup,
                        triggerDelaySeconds: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#212529] mb-1">
                    Fréquence d’affichage
                  </label>
                  <select
                    value={editingPopup.frequency}
                    onChange={(e) =>
                      setEditingPopup({
                        ...editingPopup,
                        frequency: e.target.value as PopupFormState['frequency'],
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs"
                  >
                    <option value="once_per_session">Une fois par visite</option>
                    <option value="once_per_day">Une fois par jour</option>
                    <option value="always">À chaque chargement</option>
                  </select>
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#212529] cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingPopup.isActive}
                  onChange={(e) =>
                    setEditingPopup({ ...editingPopup, isActive: e.target.checked })
                  }
                  className="accent-[#E31E24] w-4 h-4"
                />
                <span>Activer ce pop-up sur le site immédiatement</span>
              </label>

              <div className="pt-3 border-t border-[#E6DEC8] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingPopup(null)}
                  className="px-4 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs font-semibold text-[#5C534C]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingPopup || isUploadingPopupImg}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#E31E24] hover:bg-[#C8161C] text-white text-xs font-semibold"
                >
                  {isSavingPopup && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Enregistrer le pop-up</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODALE CONFIRMATION SUPPRESSION POP-UP --- */}
      {confirmDeletePopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1810]/60"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-[18px] border border-[#E6DEC8] p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#212529]">Supprimer ce pop-up ?</h3>
            <p className="text-xs text-[#5C534C]">
              L’annonce <strong>« {confirmDeletePopup.title} »</strong> sera définitivement
              supprimée.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDeletePopup(null)}
                className="px-4 py-2 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-xs font-semibold text-[#5C534C]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeletePopup}
                className="px-4 py-2 rounded-lg bg-[#C92A2A] hover:bg-[#A61E1E] text-white text-xs font-semibold"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PRÉVISUALISATION POP-UP EN DIRECT --- */}
      {previewPopup && (
        <SitePopupBanner
          previewPopup={previewPopup}
          onClosePreview={() => setPreviewPopup(null)}
          onNavigate={() => setPreviewPopup(null)}
        />
      )}
    </div>
  );
};
