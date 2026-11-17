import React from 'react';
import { ArrowRight, Award, BookOpen, Info, MapPin, Quote, ShieldCheck } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { useSiteData } from '../context/SiteDataContext';
import { ActivePage } from '../components/LeftNavigation';

interface AboutPageProps {
  onNavigate: (page: ActivePage) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { siteContent } = useSiteData();

  return (
    <div className="space-y-10">
      {/* En-tête Histoire */}
      <section className="bg-white rounded-[18px] border border-[#E6DEC8] p-6 sm:p-8 lg:p-10 space-y-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#E31E24]">
          <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>À propos de la Maison SAKER · Douala, Cameroun</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#212529] leading-tight">
          {siteContent.about.pageTitle}
        </h1>

        <p className="text-sm sm:text-base text-[#5C534C] leading-relaxed max-w-3xl">
          {siteContent.about.intro}
        </p>

        {/* Frise chronologique confirmée */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3">
          {BRAND_CONFIG.history.milestones.map((m) => (
            <div
              key={m.year}
              className="p-4 rounded-[14px] bg-[#FAF7F2] border border-[#E6DEC8] flex flex-col justify-between gap-2"
            >
              <div>
                <span className="text-lg font-bold text-[#E31E24] font-display tabular-price">
                  {m.year}
                </span>
                <h2 className="text-xs sm:text-sm font-bold text-[#212529] mt-1 font-sans">
                  {m.title}
                </h2>
              </div>
              <p className="text-xs text-[#5C534C] leading-relaxed">{m.text}</p>
            </div>
          ))}
        </div>

        {/* Note de rigueur éditoriale sur les données chiffrées du texte source */}
        <div className="p-4 rounded-[12px] bg-[#FEF8E8] border border-[#D9920B]/35 flex items-start gap-3 text-xs text-[#5C534C]">
          <Info className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">{BRAND_CONFIG.history.historicalMetricsNote}</p>
        </div>
      </section>

      {/* Mot du Fondateur */}
      <section
        aria-labelledby="founder-heading"
        className="bg-[#2A1810] text-white rounded-[18px] p-6 sm:p-8 lg:p-10 border border-[#3D2418]"
      >
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F5B316]">
            <Quote className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Message du Fondateur</span>
          </div>

          <h2 id="founder-heading" className="text-xl sm:text-2xl font-bold text-white">
            {BRAND_CONFIG.founder}
          </h2>

          <blockquote className="text-sm sm:text-base text-[#EAE0D5] leading-relaxed italic">
            {siteContent.about.founderQuote}
          </blockquote>

          <div className="pt-2">
            <p className="text-xs font-bold text-[#F5B316]">{BRAND_CONFIG.founder}</p>
            <p className="text-xs text-[#C7B8AA]">{BRAND_CONFIG.founderTitle}</p>
          </div>
        </div>
      </section>

      {/* Notre Vision, Notre Mission & Nos Unités */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-[16px] border border-[#E6DEC8] p-5 sm:p-6 space-y-2">
          <span className="text-xs font-bold text-[#E31E24]">01. Notre Vision</span>
          <h2 className="text-base sm:text-lg font-bold text-[#212529] font-sans">
            Qualité et respect des normes alimentaires
          </h2>
          <p className="text-xs sm:text-sm text-[#5C534C] leading-relaxed">
            {siteContent.about.vision}
          </p>
        </div>

        <div className="bg-white rounded-[16px] border border-[#E6DEC8] p-5 sm:p-6 space-y-2">
          <span className="text-xs font-bold text-[#E31E24]">02. Notre Mission</span>
          <h2 className="text-base sm:text-lg font-bold text-[#212529] font-sans">
            Éthique, hygiène et satisfaction client
          </h2>
          <p className="text-xs sm:text-sm text-[#5C534C] leading-relaxed">
            {siteContent.about.mission}
          </p>
        </div>

        <div className="bg-white rounded-[16px] border border-[#E6DEC8] p-5 sm:p-6 space-y-2">
          <span className="text-xs font-bold text-[#E31E24]">03. Nos Unités à Douala</span>
          <h2 className="text-base sm:text-lg font-bold text-[#212529] font-sans">
            Proximité dans les quartiers de Douala
          </h2>
          <p className="text-xs sm:text-sm text-[#5C534C] leading-relaxed">
            {siteContent.about.unitsOverview}
          </p>
        </div>
      </section>

      {/* Les 6 Valeurs officielles SAKER */}
      <section aria-labelledby="values-heading" className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#E31E24] mb-1">
            <Award className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Nos engagements au quotidien</span>
          </div>
          <h2 id="values-heading" className="text-xl sm:text-2xl font-bold text-[#212529]">
            Les 6 valeurs des Boulangeries SAKER
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BRAND_CONFIG.values.map((val, index) => (
            <article
              key={val.id}
              className="bg-white rounded-[14px] border border-[#E6DEC8] p-5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#212529] font-sans">{val.title}</h3>
                <span className="text-xs font-bold text-[#868E96] tabular-price">
                  0{index + 1}
                </span>
              </div>
              <p className="text-xs text-[#5C534C] leading-relaxed">{val.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Accès rapide vers Services, Boutique et Agences */}
      <section className="bg-white rounded-[16px] border border-[#E6DEC8] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#212529]">
            <ShieldCheck className="w-4 h-4 text-[#E31E24]" aria-hidden="true" />
            <span>Découvrir nos produits et nos points de vente</span>
          </div>
          <p className="text-xs text-[#5C534C]">
            Consultez notre catalogue de panification et pâtisserie fraîche ou contactez nos agences
            à Douala.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('shop')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] text-white text-xs font-semibold transition-colors"
          >
            <span>Voir la boutique</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('contact')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#FAF7F2] hover:bg-[#F5EFE6] border border-[#E6DEC8] text-xs font-semibold text-[#212529] transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-[#E31E24]" aria-hidden="true" />
            <span>Nos agences &amp; contacts</span>
          </button>
        </div>
      </section>
    </div>
  );
};
