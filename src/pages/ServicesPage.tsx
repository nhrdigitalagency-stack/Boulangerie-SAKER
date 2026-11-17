import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Check,
  Copy,
  Info,
  Phone,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { ProductImage } from '../components/ProductImage';

interface ServicesPageProps {
  initialServiceId?: string;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ initialServiceId }) => {
  const { siteContent } = useSiteData();
  const servicesList = siteContent.servicesPage.services;

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialServiceId || servicesList[0]?.id || ''
  );
  const [eventDate, setEventDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [quotePrepared, setQuotePrepared] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialServiceId) {
      setSelectedServiceId(initialServiceId);
    }
  }, [initialServiceId]);

  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setQuotePrepared(false);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const selectedService =
    servicesList.find((s) => s.id === selectedServiceId) || servicesList[0];

  const handlePrepareQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!fullName.trim()) {
      nextErrors.fullName = 'Veuillez indiquer votre nom complet.';
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) {
      nextErrors.phone = 'Veuillez indiquer un numéro de téléphone joignable.';
    }
    if (!message.trim()) {
      nextErrors.message = 'Veuillez préciser votre demande ou votre événement.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setQuotePrepared(true);
  };

  const buildQuoteText = () => {
    return [
      '=== DEMANDE D’INFORMATIONS / DEVIS — BOULANGERIE SAKER ===',
      '(Préparation locale — envoi e-mail à connecter côté serveur)',
      '',
      `Service concerné : ${selectedService.title}`,
      eventDate ? `Date souhaitée : ${eventDate}` : 'Date souhaitée : À définir',
      guestCount.trim() ? `Nombre de personnes estimé : ${guestCount.trim()}` : null,
      `Nom & Prénom : ${fullName.trim()}`,
      `Téléphone : ${phone.trim()}`,
      email.trim() ? `E-mail : ${email.trim()}` : null,
      '',
      'Détails de la demande :',
      message.trim(),
    ]
      .filter(Boolean)
      .join('\n');
  };

  const handleCopyQuote = async () => {
    try {
      await navigator.clipboard.writeText(buildQuoteText());
      setCopiedQuote(true);
      window.setTimeout(() => setCopiedQuote(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-10">
      {/* En-tête de la page Services */}
      <section className="bg-white rounded-[18px] border border-[#E6DEC8] p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#E31E24]">
          <UtensilsCrossed className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Services officiels Boulangerie SAKER à Douala</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#212529]">
          {siteContent.servicesPage.pageTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#5C534C] max-w-3xl leading-relaxed">
          {siteContent.servicesPage.pageIntro}
        </p>
      </section>

      {/* Liste détaillée des services vérifiés */}
      <section aria-label="Liste des services SAKER" className="space-y-5">
        {servicesList.map((srv, idx) => (
          <article
            key={srv.id}
            className="group bg-white rounded-[16px] border border-[#E6DEC8] hover:border-[#D4C5AE] hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(42,24,16,0.08)] transition-all duration-200 p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
          >
            <div className="md:col-span-4 lg:col-span-3 aspect-[4/3] rounded-[12px] bg-[#F5EFE6] border border-[#E6DEC8] overflow-hidden">
              <ProductImage
                src={srv.image}
                alt={srv.title}
                className="w-full h-full p-4"
                imgClassName="transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </div>

            <div className="md:col-span-8 lg:col-span-9 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#E31E24]">
                  0{idx + 1}. {srv.shortTitle}
                </span>
                {srv.deliveryNote && (
                  <span className="text-[11px] font-semibold text-[#099268]">
                    {srv.deliveryNote}
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-[#212529] group-hover:text-[#E31E24] transition-colors">
                {srv.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#5C534C] leading-relaxed">{srv.description}</p>

              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {srv.highlights.map((h, i) => (
                  <li
                    key={i}
                    className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] hover:border-[#E31E24]/30 transition-colors text-[11px] text-[#212529] font-medium leading-snug"
                  >
                    {h}
                  </li>
                ))}
              </ul>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectService(srv.id)}
                  className="group/btn inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] text-white text-xs font-semibold transition-all hover:shadow-md"
                >
                  <span>{srv.ctaLabel}</span>
                  <ArrowRight
                    className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1"
                    aria-hidden="true"
                  />
                </button>

                <a
                  href="tel:+237695944664"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] hover:bg-[#F5EFE6] border border-[#E6DEC8] hover:border-[#D4C5AE] text-xs font-semibold text-[#212529] transition-all tabular-price"
                >
                  <Phone className="w-3.5 h-3.5 text-[#E31E24]" aria-hidden="true" />
                  <span>Appeler le 695 94 46 64</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Formulaire de demande de devis / informations */}
      <section
        ref={formRef}
        aria-labelledby="service-quote-heading"
        className="bg-white rounded-[18px] border border-[#E6DEC8] p-6 sm:p-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onSubmit={handlePrepareQuote} noValidate className="lg:col-span-7 space-y-5">
            <div>
              <h2 id="service-quote-heading" className="text-xl sm:text-2xl font-bold text-[#212529]">
                Demander un devis ou des informations
              </h2>
              <p className="text-xs sm:text-sm text-[#5C534C] mt-1">
                Préparez votre demande pour le service sélectionné. Sans serveur d’envoi SMTP
                connecté, votre demande est mise en forme localement et accompagnée de nos numéros
                directs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label
                  htmlFor="quote-service"
                  className="block text-xs font-semibold text-[#212529] mb-1"
                >
                  Service concerné <span className="text-[#E31E24]">*</span>
                </label>
                <select
                  id="quote-service"
                  value={selectedServiceId}
                  onChange={(e) => {
                    setSelectedServiceId(e.target.value);
                    setQuotePrepared(false);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs sm:text-sm font-semibold text-[#212529] focus:outline-none focus:border-[#E31E24]"
                >
                  {servicesList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="quote-date"
                  className="block text-xs font-semibold text-[#212529] mb-1"
                >
                  Date souhaitée de l’événement
                </label>
                <div className="relative">
                  <Calendar
                    className="w-3.5 h-3.5 text-[#868E96] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="quote-date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs sm:text-sm text-[#212529] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="quote-guests"
                  className="block text-xs font-semibold text-[#212529] mb-1"
                >
                  Nombre de personnes <span className="text-[#868E96] font-normal">(si pertinent)</span>
                </label>
                <div className="relative">
                  <Users
                    className="w-3.5 h-3.5 text-[#868E96] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="quote-guests"
                    type="text"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    placeholder="Ex. 50 convives"
                    className="w-full pl-9 pr-3 py-2.5 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs sm:text-sm text-[#212529] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="quote-name"
                  className="block text-xs font-semibold text-[#212529] mb-1"
                >
                  Nom et prénom <span className="text-[#E31E24]">*</span>
                </label>
                <input
                  id="quote-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors({ ...errors, fullName: '' });
                  }}
                  placeholder="Votre nom complet"
                  className={`w-full px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] border text-xs sm:text-sm text-[#212529] focus:outline-none ${
                    errors.fullName ? 'border-[#C92A2A]' : 'border-[#E6DEC8] focus:border-[#E31E24]'
                  }`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-[11px] text-[#C92A2A] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="quote-phone"
                  className="block text-xs font-semibold text-[#212529] mb-1"
                >
                  Téléphone (+237) <span className="text-[#E31E24]">*</span>
                </label>
                <input
                  id="quote-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                  placeholder="Ex. 695 94 46 64"
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

              <div className="sm:col-span-2">
                <label
                  htmlFor="quote-email"
                  className="block text-xs font-semibold text-[#212529] mb-1"
                >
                  E-mail <span className="text-[#868E96] font-normal">(facultatif)</span>
                </label>
                <input
                  id="quote-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse e-mail"
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs sm:text-sm text-[#212529] focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="quote-message"
                  className="block text-xs font-semibold text-[#212529] mb-1"
                >
                  Votre message et précisions sur l’événement <span className="text-[#E31E24]">*</span>
                </label>
                <textarea
                  id="quote-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors({ ...errors, message: '' });
                  }}
                  placeholder="Précisez le type de cérémonie (mariage, anniversaire, colloque, soutenance...), vos besoins traiteur ou salle de fête..."
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
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              Préparer ma demande de devis
            </button>
          </form>

          {/* Colonne d'état & Contact téléphonique réel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-[14px] bg-[#FAF7F2] border border-[#E6DEC8] space-y-3">
              <div className="flex items-start gap-2.5">
                <Info className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-bold text-[#212529] font-sans">
                    État de l’envoi de formulaire
                  </h3>
                  <p className="text-xs text-[#5C534C] leading-relaxed mt-1">
                    Conformément aux exigences de transparence technique, aucun message « Message
                    envoyé » n’est simulé tant qu’un connecteur d’e-mail ou CRM serveur n’est pas
                    branché. Utilisez nos lignes téléphoniques officielles ci-dessous pour une
                    prise en charge immédiate.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E6DEC8] space-y-2 text-xs">
                <p className="font-semibold text-[#212529]">
                  Contact direct — Salle de fête d’Akwa &amp; Service Traiteur :
                </p>
                <a
                  href="tel:+237695944664"
                  className="w-full py-2.5 px-4 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] text-white font-semibold flex items-center justify-center gap-2 transition-colors tabular-price"
                >
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Appeler le 695 94 46 64</span>
                </a>
                <a
                  href="tel:+237683355262"
                  className="w-full py-2.5 px-4 rounded-[10px] bg-white hover:bg-[#F5EFE6] border border-[#E6DEC8] text-[#212529] font-semibold flex items-center justify-center gap-2 transition-colors tabular-price"
                >
                  <Phone className="w-3.5 h-3.5 text-[#E31E24]" aria-hidden="true" />
                  <span>Appeler le 683 35 52 62</span>
                </a>
              </div>
            </div>

            {quotePrepared && (
              <div className="p-5 rounded-[14px] bg-white border-2 border-[#212529] space-y-3">
                <p className="text-xs font-bold text-[#212529]">
                  Synthèse de votre demande de devis (à communiquer — envoi serveur à connecter) :
                </p>
                <pre className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-[11px] font-mono whitespace-pre-wrap text-[#212529]">
                  {buildQuoteText()}
                </pre>
                <button
                  type="button"
                  onClick={handleCopyQuote}
                  className="w-full py-2.5 px-3.5 rounded-[10px] bg-[#FAF7F2] hover:bg-[#F5EFE6] border border-[#E6DEC8] text-xs font-semibold text-[#212529] flex items-center justify-center gap-2"
                >
                  {copiedQuote ? (
                    <>
                      <Check className="w-4 h-4 text-[#099268]" aria-hidden="true" />
                      <span>Demande copiée dans le presse-papiers</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" aria-hidden="true" />
                      <span>Copier le texte de ma demande</span>
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
