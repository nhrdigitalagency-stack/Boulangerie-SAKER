import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Settings, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BRAND_CONFIG } from '../config/brand';
import { useSiteData } from '../context/SiteDataContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginAdmin } = useSiteData();
  const shouldReduceMotion = useReducedMotion();
  const identifierRef = useRef<HTMLInputElement>(null);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    const t = window.setTimeout(() => identifierRef.current?.focus(), 60);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMsg('Veuillez renseigner votre identifiant et votre mot de passe.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await loginAdmin(identifier.trim(), password);
    setIsSubmitting(false);

    if (!res.ok) {
      setErrorMsg(res.error || 'Identifiants incorrects.');
      return;
    }

    setPassword('');
    onSuccess();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-login-title"
        >
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2A1810]/60"
            aria-hidden="true"
          />

          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md bg-white rounded-[18px] border border-[#E6DEC8] shadow-2xl overflow-hidden"
          >
            {/* En-tête modal */}
            <div className="px-6 py-5 bg-[#FAF7F2] border-b border-[#E6DEC8] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#2A1810] text-[#F5B316] flex items-center justify-center shrink-0">
                  <Settings className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2
                    id="admin-login-title"
                    className="text-base font-bold text-[#212529] font-sans"
                  >
                    Espace Propriétaire SAKER
                  </h2>
                  <p className="text-[11px] text-[#5C534C]">
                    Gestion des produits, pop-ups &amp; contenus Sanity CMS
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer la fenêtre de connexion"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C534C] hover:bg-[#EFE9DC] hover:text-[#212529] transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Formulaire d'authentification vérifié contre la BD Sanity */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-1">
                <img
                  src={BRAND_CONFIG.logos.primary}
                  alt="Boulangerie SAKER"
                  className="h-8 w-auto object-contain"
                />
                <span className="text-xs text-[#868E96]">
                  Accès réservé à la direction du site
                </span>
              </div>

              {errorMsg && (
                <div
                  role="alert"
                  className="p-3 rounded-[10px] bg-[#FFF5F5] border border-[#F03E3E]/30 flex items-start gap-2.5 text-xs text-[#C92A2A]"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="admin-identifier"
                  className="block text-xs font-semibold text-[#212529] mb-1.5"
                >
                  Nom d’utilisateur ou adresse e-mail
                </label>
                <input
                  ref={identifierRef}
                  id="admin-identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ex. saker-admin ou votre e-mail"
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-sm text-[#212529] focus:outline-none focus:bg-white focus:border-[#E31E24] transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold text-[#212529] mb-1.5"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe propriétaire"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-sm text-[#212529] focus:outline-none focus:bg-white focus:border-[#E31E24] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
                    }
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#868E96] hover:text-[#212529]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-[10px] bg-[#FAF7F2] hover:bg-[#EFE9DC] border border-[#E6DEC8] text-xs font-semibold text-[#5C534C] transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Vérification...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Se connecter au tableau de bord</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
