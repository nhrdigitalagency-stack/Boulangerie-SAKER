import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  ChevronDown,
  HelpCircle,
  MapPin,
  Quote,
  ShieldCheck,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BRAND_CONFIG } from '../config/brand';
import { getSectionRevealProps } from '../config/motion';
import { useSiteData } from '../context/SiteDataContext';
import { ActivePage } from '../components/LeftNavigation';
import { FaqSkeleton } from '../components/LoadingSkeletons';

interface AboutPageProps {
  onNavigate: (page: ActivePage) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { siteContent, isLoadingData } = useSiteData();
  const shouldReduceMotion = useReducedMotion();
  const faqItems = siteContent.about.faqItems || [];
  const [openFaqId, setOpenFaqId] = useState<string | null>(() => faqItems[0]?.id || null);

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
              className="p-4 rounded-[14px] bg-[#FAF7F2] border border-[#E6DEC8] hover:border-[#E31E24]/40 hover:-translate-y-1 hover:shadow-[0_10px_22px_rgba(42,24,16,0.07)] transition-all duration-200 flex flex-col justify-between gap-2"
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
      </section>

      {/* Mot du Fondateur */}
      <motion.section
        {...getSectionRevealProps(shouldReduceMotion)}
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
      </motion.section>

      {/* Notre Vision, Notre Mission & Nos Unités */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-[16px] border border-[#E6DEC8] hover:border-[#E31E24]/35 hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(42,24,16,0.08)] transition-all duration-200 p-5 sm:p-6 space-y-2">
          <span className="text-xs font-bold text-[#E31E24]">01. Notre Vision</span>
          <h2 className="text-base sm:text-lg font-bold text-[#212529] font-sans">
            Qualité et respect des normes alimentaires
          </h2>
          <p className="text-xs sm:text-sm text-[#5C534C] leading-relaxed">
            {siteContent.about.vision}
          </p>
        </div>

        <div className="bg-white rounded-[16px] border border-[#E6DEC8] hover:border-[#E31E24]/35 hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(42,24,16,0.08)] transition-all duration-200 p-5 sm:p-6 space-y-2">
          <span className="text-xs font-bold text-[#E31E24]">02. Notre Mission</span>
          <h2 className="text-base sm:text-lg font-bold text-[#212529] font-sans">
            Éthique, hygiène et satisfaction client
          </h2>
          <p className="text-xs sm:text-sm text-[#5C534C] leading-relaxed">
            {siteContent.about.mission}
          </p>
        </div>

        <div className="bg-white rounded-[16px] border border-[#E6DEC8] hover:border-[#E31E24]/35 hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(42,24,16,0.08)] transition-all duration-200 p-5 sm:p-6 space-y-2">
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
      <motion.section
        {...getSectionRevealProps(shouldReduceMotion)}
        aria-labelledby="values-heading"
        className="space-y-4"
      >
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
              className="group bg-white rounded-[14px] border border-[#E6DEC8] hover:border-[#E31E24]/40 hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(42,24,16,0.08)] transition-all duration-200 p-5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#212529] group-hover:text-[#E31E24] transition-colors font-sans">
                  {val.title}
                </h3>
                <span className="text-xs font-bold text-[#868E96] group-hover:text-[#E31E24] transition-colors tabular-price">
                  0{index + 1}
                </span>
              </div>
              <p className="text-xs text-[#5C534C] leading-relaxed">{val.description}</p>
            </article>
          ))}
        </div>
      </motion.section>

      {/* Section FAQ modifiable depuis Sanity CMS */}
      <motion.section
        {...getSectionRevealProps(shouldReduceMotion)}
        aria-labelledby="about-faq-heading"
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#E31E24] mb-1">
              <HelpCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Informations pratiques &amp; réponses directes</span>
            </div>
            <h2 id="about-faq-heading" className="text-xl sm:text-2xl font-bold text-[#212529]">
              {siteContent.about.faqHeading || 'Questions fréquentes sur la Boulangerie SAKER'}
            </h2>
          </div>
          <p className="text-xs text-[#868E96]">
            {faqItems.length} {faqItems.length > 1 ? 'questions répertoriées' : 'question répertoriée'}
          </p>
        </div>

        {isLoadingData ? (
          <FaqSkeleton />
        ) : faqItems.length === 0 ? (
          <div className="bg-white rounded-[14px] border border-[#E6DEC8] p-6 text-xs text-[#5C534C]">
            Aucune question enregistrée pour le moment. Contactez nos agences au 695 94 46 64 pour
            toute précision.
          </div>
        ) : (
          <div className="space-y-2.5">
            {faqItems.map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div
                  key={item.id}
                  className={`rounded-[14px] border transition-all duration-200 bg-white overflow-hidden ${
                    isOpen
                      ? 'border-[#E31E24]/45 shadow-sm'
                      : 'border-[#E6DEC8] hover:border-[#E31E24]/35 hover:shadow-xs'
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                    className="group w-full px-4 sm:px-6 py-4 flex items-center justify-between gap-4 text-left focus-visible:outline-2 focus-visible:outline-[#E31E24]"
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#212529] group-hover:text-[#E31E24] transition-colors leading-snug">
                      {item.question}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                        isOpen
                          ? 'bg-[#E31E24] text-white rotate-180'
                          : 'bg-[#FAF7F2] text-[#5C534C] group-hover:bg-[#FFF4F6] group-hover:text-[#E31E24]'
                      }`}
                      aria-hidden="true"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 sm:px-6 pb-4 pt-1 text-xs sm:text-sm text-[#5C534C] leading-relaxed border-t border-[#EFE9DC]">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </motion.section>

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
