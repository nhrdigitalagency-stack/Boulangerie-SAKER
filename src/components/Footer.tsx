import React from 'react';
import { FileCheck2, MapPin, Phone, Settings } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { useSiteData } from '../context/SiteDataContext';
import { ActivePage } from './LeftNavigation';

interface FooterProps {
  onNavigate: (page: ActivePage, categorySlug?: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin }) => {
  const { categories, siteContent, adminUser } = useSiteData();

  return (
    <footer className="mt-14 border-t border-[#E6DEC8] bg-white text-[#212529]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Colonne 1 : Marque & Histoire */}
          <div className="space-y-3">
            <img
              src={BRAND_CONFIG.logos.primary}
              alt="Boulangerie SAKER"
              className="h-12 w-auto object-contain"
            />
            <p className="text-xs text-[#5C534C] leading-relaxed">
              {siteContent.footer.brandDescription}
            </p>
            <p className="text-[11px] text-[#868E96]">
              Label développé en {BRAND_CONFIG.brandLabelYear} · {BRAND_CONFIG.city}
            </p>
          </div>

          {/* Colonne 2 : Catégories du catalogue */}
          <div>
            <h3 className="text-xs font-bold text-[#212529] tracking-wide mb-3 font-sans">
              Catalogue vérifié
            </h3>
            <ul className="space-y-2 text-xs text-[#5C534C]">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate('shop', cat.slug)}
                    className="hover:text-[#E31E24] transition-colors text-left"
                  >
                    {cat.name} ({cat.count})
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 : Maison SAKER & Services */}
          <div>
            <h3 className="text-xs font-bold text-[#212529] tracking-wide mb-3 font-sans">
              Entreprise &amp; Services
            </h3>
            <ul className="space-y-2 text-xs text-[#5C534C]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="hover:text-[#E31E24] transition-colors text-left"
                >
                  Service traiteur &amp; Événements
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="hover:text-[#E31E24] transition-colors text-left"
                >
                  Gâteaux de mariage et d’anniversaire
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('services')}
                  className="hover:text-[#E31E24] transition-colors text-left"
                >
                  Salles de fêtes, Salons de thé &amp; Glaciers
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#E31E24] transition-colors text-left"
                >
                  Notre histoire &amp; nos valeurs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#E31E24] transition-colors text-left"
                >
                  Nos agences à Douala &amp; Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Colonne 4 : Coordonnées vérifiées */}
          <div className="space-y-2.5 text-xs text-[#5C534C]">
            <h3 className="text-xs font-bold text-[#212529] tracking-wide mb-3 font-sans">
              Coordonnées officielles
            </h3>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#E31E24] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold text-[#212529]">
                  Siège social : {siteContent.contactPage.headquartersLocation}
                </p>
                <p className="text-[11px] text-[#868E96] mt-0.5">
                  Boîte postale : {siteContent.contactPage.postalBox}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <Phone className="w-4 h-4 text-[#E31E24] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-1">
                <a
                  href={`tel:+237${siteContent.contactPage.phonePrimary.replace(/\D/g, '')}`}
                  className="block font-semibold text-[#212529] hover:text-[#E31E24] tabular-price"
                >
                  +237 {siteContent.contactPage.phonePrimary}
                </a>
                <a
                  href={`tel:+237${siteContent.contactPage.phoneSecondary.replace(/\D/g, '')}`}
                  className="block font-semibold text-[#212529] hover:text-[#E31E24] tabular-price"
                >
                  +237 {siteContent.contactPage.phoneSecondary}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bas de page, audit & accès propriétaire par roue d'engrenage */}
        <div className="mt-8 pt-6 border-t border-[#EFE9DC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-[#868E96]">
          <p>
            © {new Date().getFullYear()} {BRAND_CONFIG.name} ({BRAND_CONFIG.legalGroup}).{' '}
            {siteContent.footer.legalNotice}
          </p>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => onNavigate('audit')}
              className="inline-flex items-center gap-1.5 text-[#5C534C] hover:text-[#E31E24] font-semibold transition-colors whitespace-nowrap"
            >
              <FileCheck2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Audit &amp; redirections 301</span>
            </button>

            <button
              type="button"
              onClick={onOpenAdmin}
              aria-label={
                adminUser
                  ? 'Accéder au tableau de bord propriétaire'
                  : 'Connexion espace propriétaire (administration)'
              }
              title={
                adminUser
                  ? `Connecté : ${adminUser.displayName} — Ouvrir le tableau de bord`
                  : 'Espace propriétaire'
              }
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all focus-visible:outline-2 focus-visible:outline-[#E31E24] ${
                adminUser
                  ? 'bg-[#2A1810] border-[#2A1810] text-[#F5B316] hover:bg-[#3D2418]'
                  : 'bg-[#FAF7F2] border-[#E6DEC8] text-[#5C534C] hover:text-[#E31E24] hover:border-[#E31E24]/40 hover:rotate-45'
              }`}
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
