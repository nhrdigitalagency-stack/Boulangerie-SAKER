import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Check,
  Clock,
  Copy,
  Info,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { AgenciesMapSection } from '../components/AgenciesMap';

export const ContactPage: React.FC = () => {
  const { siteContent } = useSiteData();
  const contactInfo = siteContent.contactPage;

  const [selectedAgencyId, setSelectedAgencyId] = useState<string | null>('siege-akwa');
  const mapSectionRef = useRef<HTMLElement>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prepared, setPrepared] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFocusAgencyOnMap = (agencyId: string) => {
    setSelectedAgencyId(agencyId);
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Veuillez renseigner votre nom et prénom.';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) {
      nextErrors.phone = 'Veuillez indiquer un numéro de téléphone valide (+237).';
    }
    if (!message.trim()) nextErrors.message = 'Veuillez saisir votre message.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setPrepared(true);
  };

  const buildMessageSummary = () => {
    return [
      '=== MESSAGE CLIENT — BOULANGERIE SAKER ===',
      `Nom & Prénom : ${name.trim()}`,
      `Téléphone : ${phone.trim()}`,
      email.trim() ? `E-mail : ${email.trim()}` : null,
      '',
      'Message :',
      message.trim(),
    ]
      .filter(Boolean)
      .join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildMessageSummary());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-8">
      {/* En-tête Contact & Coordonnées principales */}
      <section className="bg-white rounded-[18px] border border-[#E6DEC8] p-5 sm:p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#E31E24]">
            <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Coordonnées vérifiées · Douala, Cameroun</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#212529]">
            {contactInfo.pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#5C534C] max-w-3xl leading-relaxed">
            {contactInfo.pageIntro}
          </p>
        </div>

        {/* Cartes des coordonnées principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 sm:p-5 rounded-[14px] bg-[#FAF7F2] border border-[#E6DEC8] hover:border-[#E31E24]/35 hover:-translate-y-1 hover:shadow-[0_10px_22px_rgba(42,24,16,0.07)] transition-all duration-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#212529]">
              <Phone className="w-4 h-4 text-[#E31E24]" aria-hidden="true" />
              <span>Standard &amp; Siège social</span>
            </div>
            <div className="space-y-1 pt-1">
              <a
                href={`tel:+237${contactInfo.phonePrimary.replace(/\D/g, '')}`}
                className="block text-base font-bold text-[#E31E24] hover:underline tabular-price"
              >
                +237 {contactInfo.phonePrimary}
              </a>
              <a
                href={`tel:+237${contactInfo.phoneSecondary.replace(/\D/g, '')}`}
                className="block text-base font-bold text-[#212529] hover:text-[#E31E24] hover:underline tabular-price"
              >
                +237 {contactInfo.phoneSecondary}
              </a>
            </div>
            <p className="text-[11px] text-[#5C534C]">
              Assistance mentionnée sur la page Contact :{' '}
              <a
                href={`tel:+237${contactInfo.phoneAssistance.replace(/\D/g, '')}`}
                className="font-semibold underline tabular-price"
              >
                {contactInfo.phoneAssistance}
              </a>
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-[14px] bg-[#FAF7F2] border border-[#E6DEC8] hover:border-[#E31E24]/35 hover:-translate-y-1 hover:shadow-[0_10px_22px_rgba(42,24,16,0.07)] transition-all duration-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#212529]">
              <Building2 className="w-4 h-4 text-[#E31E24]" aria-hidden="true" />
              <span>Siège social &amp; Courrier</span>
            </div>
            <p className="text-sm font-bold text-[#212529]">
              {contactInfo.headquartersLocation}
            </p>
            <p className="text-xs text-[#5C534C]">
              <strong>{contactInfo.postalBox}</strong>
            </p>
            <p className="text-[11px] text-[#868E96] leading-snug">
              Note : la boîte postale est une référence de courrier administratif et non une adresse
              physique de livraison.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-[14px] bg-[#FAF7F2] border border-[#E6DEC8] hover:border-[#E31E24]/35 hover:-translate-y-1 hover:shadow-[0_10px_22px_rgba(42,24,16,0.07)] transition-all duration-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#212529]">
              <Clock className="w-4 h-4 text-[#E31E24]" aria-hidden="true" />
              <span>Horaires &amp; E-mail (à confirmer)</span>
            </div>
            <p className="text-xs text-[#5C534C] leading-snug">
              {contactInfo.openingHours}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#212529] pt-1">
              <Mail className="w-3.5 h-3.5 text-[#E31E24] shrink-0" aria-hidden="true" />
              <span className="font-mono text-[11px] break-all">
                {contactInfo.email}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Carte Interactive Google Maps avec marqueurs personnalisés SAKER */}
      <section
        ref={mapSectionRef}
        aria-labelledby="interactive-map-heading"
        className="space-y-4"
      >
        <div>
          <h2
            id="interactive-map-heading"
            className="text-xl sm:text-2xl font-bold text-[#212529]"
          >
            Carte interactive des agences SAKER à Douala
          </h2>
          <p className="text-xs sm:text-sm text-[#5C534C] mt-0.5">
            Localisation en temps réel via Google Maps Platform avec marqueurs personnalisés SAKER.
            Cliquez sur un marqueur ou sur une agence dans la liste pour afficher ses détails.
          </p>
        </div>

        <AgenciesMapSection
          selectedAgencyId={selectedAgencyId}
          onSelectAgency={setSelectedAgencyId}
        />
      </section>

      {/* Grille complète des Agences SAKER à Douala */}
      <section aria-labelledby="agencies-heading" className="space-y-4">
        <div>
          <h2 id="agencies-heading" className="text-xl sm:text-2xl font-bold text-[#212529]">
            Annuaire téléphonique de nos agences à Douala
          </h2>
          <p className="text-xs sm:text-sm text-[#5C534C] mt-0.5">
            Coordonnées téléphoniques par quartier relevées sur la page « Contactez-nous » du site
            officiel.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {contactInfo.agencies.map((agency) => {
            const isSelected = selectedAgencyId === agency.id;
            return (
              <article
                key={agency.id}
                className={`group rounded-[14px] border p-4 flex flex-col justify-between gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(42,24,16,0.08)] ${
                  isSelected
                    ? 'bg-[#FFF4F6] border-[#E31E24]'
                    : agency.isHeadquarters
                    ? 'bg-[#FFF4F6]/40 border-[#E31E24]/30 hover:border-[#E31E24]'
                    : 'bg-white border-[#E6DEC8] hover:border-[#E31E24]/40'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-[11px] text-[#868E96]">
                    <span>{agency.district}</span>
                    <span>{agency.postalBox}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-[#212529] group-hover:text-[#E31E24] transition-colors font-sans">
                    {agency.name}
                  </h3>
                  {agency.note && (
                    <p className="text-[11px] text-[#E31E24] font-medium">{agency.note}</p>
                  )}
                </div>

                <div className="pt-2.5 border-t border-[#EFE9DC] flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleFocusAgencyOnMap(agency.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#5C534C] hover:text-[#E31E24] transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#E31E24]" aria-hidden="true" />
                    <span>Voir sur la carte</span>
                  </button>

                  <a
                    href={`tel:${agency.phoneClean}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E31E24] hover:bg-[#C8161C] text-white text-xs font-semibold transition-all hover:shadow-sm whitespace-nowrap shrink-0"
                  >
                    <Phone className="w-3 h-3" aria-hidden="true" />
                    <span>Appeler</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Formulaire de contact */}
      <section className="bg-white rounded-[18px] border border-[#E6DEC8] p-5 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onSubmit={handleSubmit} noValidate className="lg:col-span-7 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[#212529]">Nous écrire</h2>
              <p className="text-xs text-[#5C534C] mt-1">
                Précisez l’indicatif du pays (+237) pour le Cameroun. Sans serveur d’envoi connecté,
                votre message est préparé localement et nos lignes téléphoniques restent le canal
                direct.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-semibold text-[#212529] mb-1"
                >
                  Nom &amp; Prénom <span className="text-[#E31E24]">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  placeholder="Votre nom complet"
                  className={`w-full px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] border text-xs sm:text-sm text-[#212529] focus:outline-none ${
                    errors.name ? 'border-[#C92A2A]' : 'border-[#E6DEC8] focus:border-[#E31E24]'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-[11px] text-[#C92A2A] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact-phone"
                  className="block text-xs font-semibold text-[#212529] mb-1"
                >
                  Téléphone (+237) <span className="text-[#E31E24]">*</span>
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                  placeholder="Ex. +237 695 94 46 64"
                  className={`w-full px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] border text-xs sm:text-sm text-[#212529] focus:outline-none ${
                    errors.phone ? 'border-[#C92A2A]' : 'border-[#E6DEC8] focus:border-[#E31E24]'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-[11px] text-[#C92A2A] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="block text-xs font-semibold text-[#212529] mb-1"
              >
                E-mail <span className="text-[#868E96] font-normal">(facultatif)</span>
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse e-mail"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs sm:text-sm text-[#212529] focus:outline-none focus:border-[#E31E24]"
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="block text-xs font-semibold text-[#212529] mb-1"
              >
                Votre message <span className="text-[#E31E24]">*</span>
              </label>
              <textarea
                id="contact-message"
                rows={4}
                required
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message) setErrors({ ...errors, message: '' });
                }}
                placeholder="Votre question concernant un produit, une commande ou une agence..."
                className={`w-full px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] border text-xs sm:text-sm text-[#212529] focus:outline-none ${
                  errors.message ? 'border-[#C92A2A]' : 'border-[#E6DEC8] focus:border-[#E31E24]'
                }`}
              />
              {errors.message && (
                <p className="mt-1 text-[11px] text-[#C92A2A] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>{errors.message}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              Préparer mon message
            </button>
          </form>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-[14px] bg-[#FAF7F2] border border-[#E6DEC8] space-y-3 text-xs text-[#5C534C]">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-bold text-[#212529]">Information sur les canaux de contact</p>
                  <p className="mt-1 leading-relaxed">
                    L’envoi de formulaire nécessite le raccordement du serveur d’e-mail de la
                    Boulangerie SAKER. Par ailleurs, aucun bouton WhatsApp n’est activé par défaut
                    tant que le numéro dédié WhatsApp Business n’est pas formellement confirmé.
                  </p>
                </div>
              </div>
            </div>

            {prepared && (
              <div className="p-5 rounded-[14px] bg-white border-2 border-[#212529] space-y-3">
                <p className="text-xs font-bold text-[#212529]">
                  Message préparé (envoi serveur à connecter — utilisez nos lignes téléphoniques ou
                  copiez votre texte) :
                </p>
                <pre className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-[11px] font-mono whitespace-pre-wrap text-[#212529]">
                  {buildMessageSummary()}
                </pre>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full py-2.5 px-3.5 rounded-[10px] bg-[#FAF7F2] hover:bg-[#F5EFE6] border border-[#E6DEC8] text-xs font-semibold text-[#212529] flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#099268]" aria-hidden="true" />
                      <span>Copié dans le presse-papiers</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" aria-hidden="true" />
                      <span>Copier mon message</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
