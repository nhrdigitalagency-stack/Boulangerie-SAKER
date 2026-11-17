import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
  FileText,
  Info,
  Phone,
  Printer,
  ShoppingBag,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { formatPriceFCFA } from '../data/catalog';
import { useStore } from '../context/StoreContext';

interface CheckoutPageProps {
  onBackToShop: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBackToShop }) => {
  const { cartItems, totalQuantity, subtotal } = useStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [receptionMode, setReceptionMode] = useState<'pickup' | 'delivery_request'>('pickup');
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>(BRAND_CONFIG.agencies[1].id);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryLandmark, setDeliveryLandmark] = useState('');
  const [desiredDate, setDesiredDate] = useState('');
  const [comments, setComments] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPrepared, setIsPrepared] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const selectedAgency =
    BRAND_CONFIG.agencies.find((a) => a.id === selectedAgencyId) || BRAND_CONFIG.agencies[0];

  const hasEventCake = cartItems.some((item) => item.product.isCustomizableCake);

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!fullName.trim()) {
      nextErrors.fullName = 'Veuillez renseigner votre nom complet.';
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) {
      nextErrors.phone = 'Veuillez indiquer un numéro de téléphone valide (ex. 695 94 46 64).';
    }
    if (receptionMode === 'delivery_request' && !deliveryAddress.trim()) {
      nextErrors.deliveryAddress =
        'Veuillez préciser le quartier et l’adresse souhaités à Douala.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmitPreparation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsPrepared(true);
  };

  const buildPlainTextSummary = () => {
    const lines = [
      '=== FICHE DE PRÉPARATION DE COMMANDE — BOULANGERIE SAKER ===',
      '(Document préparatoire non transmis automatiquement — à confirmer auprès de la boulangerie)',
      '',
      `Client : ${fullName.trim()}`,
      `Téléphone : ${phone.trim()}`,
      email.trim() ? `E-mail : ${email.trim()}` : null,
      `Mode souhaité : ${
        receptionMode === 'pickup'
          ? `Retrait souhaité — ${selectedAgency.name} (${selectedAgency.phone})`
          : `Demande de livraison à domicile (à confirmer) — ${deliveryAddress.trim()}${
              deliveryLandmark.trim() ? ` (Repère : ${deliveryLandmark.trim()})` : ''
            }`
      }`,
      desiredDate ? `Date souhaitée : ${desiredDate}` : null,
      comments.trim() ? `Commentaire : ${comments.trim()}` : null,
      '',
      '--- ARTICLES SÉLECTIONNÉS ---',
      ...cartItems.map((item) => {
        const customText = item.customization
          ? ` [Personnalisation à confirmer : ${[
              item.customization.cakeMessage ? `Message "${item.customization.cakeMessage}"` : '',
              item.customization.desiredDate ? `Date ${item.customization.desiredDate}` : '',
              item.customization.additionalNotes || '',
            ]
              .filter(Boolean)
              .join(', ')}]`
          : '';
        return `- ${item.quantity}x ${item.product.name} (${formatPriceFCFA(
          item.product.price
        )}) = ${formatPriceFCFA(item.product.price * item.quantity)}${customText}`;
      }),
      '',
      `Sous-total produits (${totalQuantity} art.) : ${formatPriceFCFA(subtotal)} (Code devise : XAF)`,
      'Frais de livraison éventuels : À confirmer par la boulangerie',
      'Statut : Préparation locale — En attente de confirmation téléphonique avec Boulangerie SAKER',
    ].filter((l) => l !== null);

    return lines.join('\n');
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainTextSummary());
      setCopiedSummary(true);
      window.setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      // Fallback
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-white rounded-[16px] border border-[#E6DEC8] p-10 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#F5EFE6] border border-[#E6DEC8] flex items-center justify-center mx-auto text-[#868E96]">
          <ShoppingBag className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#212529]">
          Votre panier est vide
        </h1>
        <p className="text-xs sm:text-sm text-[#5C534C] max-w-md mx-auto">
          Sélectionnez vos pains, viennoiseries ou pâtisseries dans notre catalogue avant de
          préparer votre commande.
        </p>
        <button
          type="button"
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] text-white text-xs sm:text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Retourner à la boutique</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête & Retour */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#212529] hover:text-[#E31E24] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Continuer mes achats</span>
        </button>
        <span className="text-xs text-[#868E96]">
          Devise de référence : <strong>FCFA (XAF)</strong>
        </span>
      </div>

      {/* Bandeau d'information honnête sur l'état de l'intégration serveur */}
      <div className="p-4 rounded-[14px] bg-[#FEF8E8] border border-[#D9920B]/40 flex items-start gap-3 text-xs text-[#5C534C]">
        <Info className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-bold text-[#212529]">
            Mode Préparation de commande (aucun paiement simulé)
          </p>
          <p className="leading-relaxed">
            Cette interface prépare votre récapitulatif détaillé à partir des tarifs officiels en
            FCFA. La soumission directe à l’API privée d’encaissement WooCommerce n’étant pas
            connectée dans cet environnement, <strong>aucune transaction bancaire ou Mobile Money
            n’est simulée</strong>. Votre récapitulatif vous permet de finaliser immédiatement votre
            commande par téléphone auprès de l’agence SAKER de votre choix.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Colonne Formulaire de préparation */}
        <form
          onSubmit={handleSubmitPreparation}
          noValidate
          className="lg:col-span-7 bg-white rounded-[16px] border border-[#E6DEC8] p-5 sm:p-7 space-y-6"
        >
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#212529]">
              Préparer ma commande
            </h1>
            <p className="text-xs text-[#5C534C] mt-1">
              Renseignez vos coordonnées et le mode de réception souhaité pour générer votre fiche
              récapitulative.
            </p>
          </div>

          {/* 1. Coordonnées du client */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-bold text-[#212529] pb-1 border-b border-[#EFE9DC] w-full">
              1. Vos coordonnées
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="checkout-fullname"
                  className="block text-xs font-semibold text-[#212529] mb-1"
                >
                  Nom et prénom <span className="text-[#E31E24]">*</span>
                </label>
                <input
                  id="checkout-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors({ ...errors, fullName: '' });
                  }}
                  placeholder="Ex. Jean-Paul Kamga"
                  aria-invalid={Boolean(errors.fullName)}
                  className={`w-full px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] border text-xs sm:text-sm text-[#212529] focus:outline-none ${
                    errors.fullName
                      ? 'border-[#C92A2A] bg-[#FFF5F5]'
                      : 'border-[#E6DEC8] focus:border-[#E31E24]'
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
                  htmlFor="checkout-phone"
                  className="block text-xs font-semibold text-[#212529] mb-1"
                >
                  Téléphone (+237) <span className="text-[#E31E24]">*</span>
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                  placeholder="Ex. 695 94 46 64"
                  aria-invalid={Boolean(errors.phone)}
                  className={`w-full px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] border text-xs sm:text-sm text-[#212529] focus:outline-none ${
                    errors.phone
                      ? 'border-[#C92A2A] bg-[#FFF5F5]'
                      : 'border-[#E6DEC8] focus:border-[#E31E24]'
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
                htmlFor="checkout-email"
                className="block text-xs font-semibold text-[#212529] mb-1"
              >
                Adresse e-mail <span className="text-[#868E96] font-normal">(facultatif)</span>
              </label>
              <input
                id="checkout-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex. client@exemple.cm"
                className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs sm:text-sm text-[#212529] focus:outline-none focus:border-[#E31E24]"
              />
            </div>
          </fieldset>

          {/* 2. Mode de réception */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-bold text-[#212529] pb-1 border-b border-[#EFE9DC] w-full">
              2. Mode de réception souhaité (à confirmer)
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`cursor-pointer rounded-[12px] border p-3.5 flex flex-col gap-1 transition-colors ${
                  receptionMode === 'pickup'
                    ? 'bg-[#FFF4F6] border-[#E31E24]'
                    : 'bg-[#FAF7F2] border-[#E6DEC8] hover:border-[#D4C5AE]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="receptionMode"
                    value="pickup"
                    checked={receptionMode === 'pickup'}
                    onChange={() => setReceptionMode('pickup')}
                    className="accent-[#E31E24]"
                  />
                  <span className="text-xs font-bold text-[#212529]">
                    Retrait en agence SAKER (Douala)
                  </span>
                </div>
                <span className="text-[11px] text-[#5C534C] pl-5">
                  Choisissez l’une des agences SAKER répertoriées sur la page Contact officielle.
                </span>
              </label>

              <label
                className={`cursor-pointer rounded-[12px] border p-3.5 flex flex-col gap-1 transition-colors ${
                  receptionMode === 'delivery_request'
                    ? 'bg-[#FFF4F6] border-[#E31E24]'
                    : 'bg-[#FAF7F2] border-[#E6DEC8] hover:border-[#D4C5AE]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="receptionMode"
                    value="delivery_request"
                    checked={receptionMode === 'delivery_request'}
                    onChange={() => setReceptionMode('delivery_request')}
                    className="accent-[#E31E24]"
                  />
                  <span className="text-xs font-bold text-[#212529]">
                    Demande de livraison à domicile
                  </span>
                </div>
                <span className="text-[11px] text-[#5C534C] pl-5">
                  Attestée sur le site pour les gâteaux de mariage et d’anniversaire ; soumise à
                  confirmation pour les autres produits.
                </span>
              </label>
            </div>

            {receptionMode === 'pickup' ? (
              <div className="space-y-2">
                <label
                  htmlFor="checkout-agency"
                  className="block text-xs font-semibold text-[#212529]"
                >
                  Point de vente souhaité (disponibilité à confirmer auprès de l’agence)
                </label>
                <select
                  id="checkout-agency"
                  value={selectedAgencyId}
                  onChange={(e) => setSelectedAgencyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs sm:text-sm font-medium text-[#212529] focus:outline-none focus:border-[#E31E24]"
                >
                  {BRAND_CONFIG.agencies.map((agency) => (
                    <option key={agency.id} value={agency.id}>
                      {agency.name} — Tél : {agency.phone}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#868E96]">
                  Note : la boîte postale <em>BP : 2754 Douala</em> est une adresse postale
                  administrative et non une adresse de retrait.
                </p>
              </div>
            ) : (
              <div className="space-y-3 p-3.5 rounded-[12px] bg-[#FAF7F2] border border-[#E6DEC8]">
                {!hasEventCake && (
                  <p className="text-[11px] text-[#B45309] bg-[#FEF8E8] p-2.5 rounded-lg border border-[#D9920B]/30">
                    <strong>Précision importante :</strong> Le site officiel mentionne la livraison
                    à domicile spécifiquement pour les <em>gâteaux de mariage et d’anniversaire</em>.
                    Pour une commande courante de boulangerie, veuillez vérifier la faisabilité par
                    téléphone avec nos équipes.
                  </p>
                )}

                <div>
                  <label
                    htmlFor="checkout-address"
                    className="block text-xs font-semibold text-[#212529] mb-1"
                  >
                    Quartier et adresse à Douala <span className="text-[#E31E24]">*</span>
                  </label>
                  <input
                    id="checkout-address"
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => {
                      setDeliveryAddress(e.target.value);
                      if (errors.deliveryAddress) setErrors({ ...errors, deliveryAddress: '' });
                    }}
                    placeholder="Ex. Bonapriso, Rue Njo-Njo"
                    aria-invalid={Boolean(errors.deliveryAddress)}
                    className={`w-full px-3.5 py-2 rounded-lg bg-white border text-xs sm:text-sm text-[#212529] focus:outline-none ${
                      errors.deliveryAddress
                        ? 'border-[#C92A2A]'
                        : 'border-[#E6DEC8] focus:border-[#E31E24]'
                    }`}
                  />
                  {errors.deliveryAddress && (
                    <p className="mt-1 text-[11px] text-[#C92A2A]">{errors.deliveryAddress}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-landmark"
                    className="block text-xs font-semibold text-[#212529] mb-1"
                  >
                    Point de repère précis
                  </label>
                  <input
                    id="checkout-landmark"
                    type="text"
                    value={deliveryLandmark}
                    onChange={(e) => setDeliveryLandmark(e.target.value)}
                    placeholder="Ex. En face de la pharmacie, immeuble beige..."
                    className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#E6DEC8] text-xs sm:text-sm text-[#212529] focus:outline-none focus:border-[#E31E24]"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="checkout-date"
                  className="block text-xs font-semibold text-[#212529] mb-1"
                >
                  Date souhaitée <span className="text-[#868E96] font-normal">(si pertinente)</span>
                </label>
                <input
                  id="checkout-date"
                  type="date"
                  value={desiredDate}
                  onChange={(e) => setDesiredDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs sm:text-sm text-[#212529] focus:outline-none focus:border-[#E31E24]"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-comments"
                  className="block text-xs font-semibold text-[#212529] mb-1"
                >
                  Commentaire ou instruction
                </label>
                <input
                  id="checkout-comments"
                  type="text"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Heure souhaitée, précisions..."
                  className="w-full px-3.5 py-2 rounded-[10px] bg-[#FAF7F2] border border-[#E6DEC8] text-xs sm:text-sm text-[#212529] focus:outline-none focus:border-[#E31E24]"
                />
              </div>
            </div>
          </fieldset>

          {/* 3. Modalités de règlement (Information transparente sans collecte bancaire) */}
          <div className="space-y-2.5 p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E6DEC8]">
            <h2 className="text-xs font-bold text-[#212529] font-sans">
              3. Modalités de paiement (options à confirmer / configurer)
            </h2>
            <p className="text-xs text-[#5C534C] leading-relaxed">
              Aucune donnée bancaire n’est collectée sur cette page. Les modes de règlement
              (règlement en agence au retrait, Orange Money, MTN Mobile Money en XAF ou paiement à la
              livraison pour les gâteaux d’événement) doivent être confirmés avec la boulangerie ou
              activés via une passerelle marchand certifiée côté serveur.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-5 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] text-white text-sm font-semibold transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Générer ma fiche de préparation de commande</span>
          </button>
        </form>

        {/* Colonne Récapitulatif & Fiche préparatoire */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-[16px] border border-[#E6DEC8] p-5 sm:p-6 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-[#212529] font-sans">
              Récapitulatif des articles ({totalQuantity})
            </h2>

            <div className="divide-y divide-[#EFE9DC] max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
              {cartItems.map((item) => (
                <div key={item.lineId} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[#212529]">
                      {item.quantity} × {item.product.name}
                    </p>
                    <p className="text-[11px] text-[#868E96] tabular-price">
                      {formatPriceFCFA(item.product.price)} / unité
                    </p>
                    {item.customization && (
                      <p className="text-[11px] text-[#B45309]">
                        Personnalisation demandée (à confirmer)
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-[#212529] tabular-price whitespace-nowrap">
                    {formatPriceFCFA(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E6DEC8] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#5C534C]">
                <span>Sous-total produits (XAF)</span>
                <span className="font-semibold text-[#212529] tabular-price">
                  {formatPriceFCFA(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#5C534C]">
                <span>Frais de livraison éventuels</span>
                <span className="font-medium text-[#5C534C]">
                  Calculés / confirmés par la boulangerie
                </span>
              </div>
              <div className="pt-2 border-t border-[#E6DEC8] flex items-baseline justify-between">
                <span className="text-sm font-bold text-[#212529]">
                  Total produits (hors livraison)
                </span>
                <span className="text-lg font-bold text-[#E31E24] tabular-price">
                  {formatPriceFCFA(subtotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Fiche de préparation générée */}
          {isPrepared && (
            <div
              role="region"
              aria-label="Fiche de préparation de commande générée"
              className="bg-white rounded-[16px] border-2 border-[#212529] p-5 sm:p-6 space-y-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-[#B45309] uppercase tracking-wider">
                    Préparation de commande (Non transmise automatiquement)
                  </span>
                  <h3 className="text-base font-bold text-[#212529] mt-0.5 font-sans">
                    Votre récapitulatif est prêt à être communiqué
                  </h3>
                </div>
              </div>

              <pre className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#E6DEC8] text-[11px] text-[#212529] whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                {buildPlainTextSummary()}
              </pre>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="py-2.5 px-3.5 rounded-[10px] bg-[#FAF7F2] hover:bg-[#F5EFE6] border border-[#E6DEC8] text-xs font-semibold text-[#212529] flex items-center justify-center gap-2 transition-colors"
                >
                  {copiedSummary ? (
                    <>
                      <Check className="w-4 h-4 text-[#099268]" aria-hidden="true" />
                      <span>Récapitulatif copié</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" aria-hidden="true" />
                      <span>Copier le récapitulatif</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2.5 px-3.5 rounded-[10px] bg-[#FAF7F2] hover:bg-[#F5EFE6] border border-[#E6DEC8] text-xs font-semibold text-[#212529] flex items-center justify-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4" aria-hidden="true" />
                  <span>Imprimer / Enregistrer PDF</span>
                </button>
              </div>

              <div className="pt-2 border-t border-[#EFE9DC] space-y-2">
                <p className="text-xs font-semibold text-[#212529]">
                  Finalisez par appel téléphonique direct :
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href={`tel:${selectedAgency.phoneClean}`}
                    className="flex-1 py-2.5 px-4 rounded-[10px] bg-[#E31E24] hover:bg-[#C8161C] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Appeler {selectedAgency.name.replace('Boulangerie ', '')}</span>
                  </a>
                  <a
                    href="tel:+237695944664"
                    className="py-2.5 px-4 rounded-[10px] bg-[#212529] hover:bg-[#343A40] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors tabular-price"
                  >
                    <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Siège : 695 94 46 64</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
