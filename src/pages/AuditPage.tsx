import React from 'react';
import { CheckCircle2, FileCheck2, HelpCircle, ShieldAlert, ArrowRightLeft } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { SEO_REDIRECT_PLAN } from '../data/catalog';

export const AuditPage: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* En-tête Audit & Fiabilité */}
      <section className="bg-white rounded-[18px] border border-[#E6DEC8] p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#E31E24]">
          <FileCheck2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Audit technique, Charte graphique &amp; Plan de migration SEO</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#212529]">
          Audit du site source &amp; traçabilité des données
        </h1>
        <p className="text-xs sm:text-sm text-[#5C534C] max-w-3xl leading-relaxed">
          Ce document synthétise les vérifications effectuées sur{' '}
          <span className="font-mono text-xs">boulangeriesaker.com</span>,{' '}
          <span className="font-mono text-xs">/a-propos/</span>,{' '}
          <span className="font-mono text-xs">/contactez-nous/</span> et l’API publique WooCommerce
          Store (<span className="font-mono text-xs">/wp-json/wc/store/v1/products</span>).
        </p>
      </section>

      {/* Palette et Charte Graphique Vérifiées */}
      <section className="bg-white rounded-[16px] border border-[#E6DEC8] p-6 space-y-4">
        <h2 className="text-lg font-bold text-[#212529]">
          Charte graphique &amp; valeurs hexadécimales vérifiées
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { name: 'Rouge Logo SAKER', hex: '#E31E24', source: 'logo-boulangerie-saker-1.png' },
            { name: 'Rouge Thème Primary', hex: '#EF233C', source: 'base.css (--color-primary)' },
            { name: 'Rouge Sombre', hex: '#D81D33', source: 'base.css (--color-primary-dark)' },
            { name: 'Blé Doré Logo', hex: '#F5B316', source: 'Épi de blé logo & bannière' },
            { name: 'Brun Croûte Pain', hex: '#2A1810', source: 'maquette-web-PAIN-SAKER.png' },
            { name: 'Texte Principal', hex: '#212529', source: 'base.css (--color-text-primary)' },
          ].map((col) => (
            <div
              key={col.hex}
              className="p-3 rounded-[12px] bg-[#FAF7F2] border border-[#E6DEC8] space-y-2"
            >
              <div
                className="w-full h-10 rounded-lg border border-black/10"
                style={{ backgroundColor: col.hex }}
              />
              <div>
                <p className="text-xs font-bold text-[#212529]">{col.name}</p>
                <p className="text-xs font-mono text-[#E31E24] font-semibold">{col.hex}</p>
                <p className="text-[10px] text-[#868E96] mt-0.5">{col.source}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-[#5C534C] pt-2 border-t border-[#EFE9DC] space-y-1">
          <p>
            <strong>Typographie officielle identifiée :</strong>{' '}
            {BRAND_CONFIG.fontsVerified.officialSiteFont}.
          </p>
          <p>
            <strong>Typographie de titrage associée :</strong>{' '}
            {BRAND_CONFIG.fontsVerified.complementaryDisplayFont}.
          </p>
        </div>
      </section>

      {/* Distinction A / B / C */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* A. Informations vérifiées */}
        <section className="bg-white rounded-[16px] border border-[#E6DEC8] p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#099268]">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>A. Données vérifiées sur le site source</span>
          </div>
          <ul className="space-y-2 text-xs text-[#5C534C] list-disc pl-4 leading-relaxed">
            <li>
              <strong>Logos officiels :</strong>{' '}
              <span className="font-mono text-[11px]">logo-boulangerie-saker-1.png</span> et{' '}
              <span className="font-mono text-[11px]">boulangerie-saker.png</span> conservés sans
              déformation.
            </li>
            <li>
              <strong>Catalogue complet :</strong> 22 produits actifs dans WooCommerce (les 17
              produits de référence + 5 produits additionnels présents sur le site :{' '}
              <em>Sablé coco, Sablé d’or, Beignet fourré, Entremet Vanille, Entremet en hauteur</em>
              ) avec leurs photos PNG officielles.
            </li>
            <li>
              <strong>5 catégories actives :</strong> Panification (4), Pâtisserie fraîche (8),
              Autres viennoiserie (8), Pâte à brioche (1), Pâte feuilletée (1).
            </li>
            <li>
              <strong>Histoire &amp; Services :</strong> Fondation en 1990 à Bepanda par M.
              TSHOUONGANG Élie Saker, label 2006, 6 valeurs, 5 services (traiteur, gâteaux
              mariage/anniversaire avec livraison dédiée, salles de fêtes, salons de thé, glaciers).
            </li>
            <li>
              <strong>Contacts &amp; Agences :</strong> Standard 695 94 46 64 / 683 35 52 62, BP
              2754 Douala, Salle de fête d’Akwa et 8 agences de quartier avec leurs numéros.
            </li>
          </ul>
        </section>

        {/* B. Informations manquantes ou ambiguës */}
        <section className="bg-white rounded-[16px] border border-[#E6DEC8] p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#B45309]">
            <HelpCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>B. Éléments à confirmer avant publication</span>
          </div>
          <ul className="space-y-2 text-xs text-[#5C534C] list-disc pl-4 leading-relaxed">
            <li>
              <strong>Doublon Vanille/Fraise :</strong> Les références #3042 (
              <em>Entremet Vanille fraise</em> à 8 000 FCFA) et #3069 (
              <em>Entremet Vanille &amp; fraise</em> à 15 000 FCFA) sont conservées séparément ; le
              nombre exact de parts de chaque format doit être précisé.
            </li>
            <li>
              <strong>Glaces SAKER :</strong> Mentionnées dans les services et menus mais sans
              fiches produits dans WooCommerce (aucun produit fictif n’a été inventé).
            </li>
            <li>
              <strong>Horaires &amp; E-mail :</strong> L’horaire « 00:00 Am – 23:59 Pm » et
              l’adresse <span className="font-mono text-[11px]">contact@boulangerie-saker.cm</span>{' '}
              relevés dans le pied de page doivent être validés par agence.
            </li>
            <li>
              <strong>Chiffres historiques :</strong> Les mentions de « 9 unités (2011–2019) » et
              « près de 40 % de parts de marché » sont attribuées au récit historique et nécessitent
              une validation avant d’être présentées comme statistiques actuelles.
            </li>
            <li>
              <strong>Liens « Mimosa » et « Paaf » :</strong> Présents dans le menu source sous « Nos
              partenaires » ; à documenter avant publication.
            </li>
          </ul>
        </section>

        {/* C. Contenus parasites exclus */}
        <section className="bg-white rounded-[16px] border border-[#E6DEC8] p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C92A2A]">
            <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>C. Contenus parasites &amp; erreurs exclus</span>
          </div>
          <ul className="space-y-2 text-xs text-[#5C534C] list-disc pl-4 leading-relaxed">
            <li>
              <strong>Thème automobile « Partdo » :</strong> Exclusion complète des slugs d’huiles
              moteur (<em>Shell Rotella, Pennzoil, Mobil 1</em>), de pneus (<em>Pirelli, Nexen</em>)
              et de pièces de freinage (<em>R1 Concepts, Right Stuff Brake Rotor</em>).
            </li>
            <li>
              <strong>Promotions fictives du thème :</strong> Exclusion du bandeau de démonstration
              « -10% FREE15FIRST », de la mention anglaise « On Sale This Week » et du champ « Que
              recherchez-vous dans Partdo? ».
            </li>
            <li>
              <strong>Ressources cassées :</strong> Exclusion du logo cassé pointant vers{' '}
              <span className="font-mono text-[11px]">http://localhost/partdo/...</span>.
            </li>
            <li>
              <strong>Avis de démo :</strong> Les notes « 1 examen » héritées du modèle d’origine
              ont été exclues des cartes produits.
            </li>
          </ul>
        </section>
      </div>

      {/* Plan de Redirections 301 SEO */}
      <section className="bg-white rounded-[16px] border border-[#E6DEC8] p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#E31E24]">
              <ArrowRightLeft className="w-4 h-4" aria-hidden="true" />
              <span>Plan de migration SEO (21 redirections 301 + 1 slug conservé)</span>
            </div>
            <h2 className="text-lg font-bold text-[#212529] mt-0.5">
              Table de correspondance des URLs produits (Anciens slugs Partdo → Slugs SAKER)
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto border border-[#E6DEC8] rounded-[12px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E6DEC8] text-[#212529]">
                <th className="py-2.5 px-3 font-bold">Produit</th>
                <th className="py-2.5 px-3 font-bold">Ancienne URL (à rediriger en 301)</th>
                <th className="py-2.5 px-3 font-bold">Nouvelle URL propre</th>
                <th className="py-2.5 px-3 font-bold">Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DC]">
              {SEO_REDIRECT_PLAN.map((r) => (
                <tr key={r.oldPath} className="hover:bg-[#FAF7F2]/60">
                  <td className="py-2 px-3 font-semibold text-[#212529] whitespace-nowrap">
                    {r.productName}
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] text-[#C92A2A]">{r.oldPath}</td>
                  <td className="py-2 px-3 font-mono text-[11px] text-[#099268] font-semibold">
                    {r.newPath}
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px] font-bold text-[#212529]">
                    {r.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
