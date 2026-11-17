import React, { useEffect, useMemo, useState } from 'react';
import { Check, MessageSquarePlus, Star } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { Product } from '../data/catalog';
import { getDefaultReviewsForProduct, ProductReview } from '../data/reviews';

interface ProductReviewsSectionProps {
  product: Product;
}

const REVIEWS_STORAGE_KEY = 'boulangerie_saker_user_reviews_v1';

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ product }) => {
  const [userReviewsByProduct, setUserReviewsByProduct] = useState<Record<number, ProductReview[]>>(
    () => {
      try {
        const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    }
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [author, setAuthor] = useState('');
  const [agencyVisited, setAgencyVisited] = useState('Agence d’Akwa');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(userReviewsByProduct));
    } catch {
      // ignore storage errors
    }
  }, [userReviewsByProduct]);

  const allReviews = useMemo(() => {
    const base = getDefaultReviewsForProduct(product.id, product.name, product.category);
    const custom = userReviewsByProduct[product.id] || [];
    return [...custom, ...base];
  }, [product.id, product.name, product.category, userReviewsByProduct]);

  const averageRating = useMemo(() => {
    if (allReviews.length === 0) return 0;
    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / allReviews.length).toFixed(1));
  }, [allReviews]);

  const ratingCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of allReviews) {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[star] = (counts[star] || 0) + 1;
    }
    return counts;
  }, [allReviews]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim()) {
      setFormError('Veuillez indiquer votre prénom ou vos initiales.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 10) {
      setFormError('Veuillez rédiger un court retour d’au moins 10 caractères.');
      return;
    }

    const newReview: ProductReview = {
      id: `user-rev-${Date.now()}`,
      productId: product.id,
      author: author.trim(),
      agencyVisited,
      rating,
      date: 'À l’instant',
      comment: comment.trim(),
      contextTag: 'Avis déposé sur le site',
    };

    setUserReviewsByProduct((prev) => ({
      ...prev,
      [product.id]: [newReview, ...(prev[product.id] || [])],
    }));

    setAuthor('');
    setComment('');
    setRating(5);
    setFormError('');
    setIsFormOpen(false);
    setJustSubmitted(true);
    window.setTimeout(() => setJustSubmitted(false), 3500);
  };

  return (
    <section
      aria-labelledby="product-reviews-heading"
      className="bg-white rounded-[18px] border border-[#E6DEC8] p-5 sm:p-7 space-y-6"
    >
      {/* En-tête de la section Avis clients */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EFE9DC]">
        <div>
          <h2
            id="product-reviews-heading"
            className="text-lg sm:text-xl font-bold text-[#212529]"
          >
            Avis clients sur « {product.name} »
          </h2>
          <p className="text-xs text-[#5C534C] mt-0.5">
            Retours d’expérience en point de vente à Douala · Partagez votre avis après dégustation
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#FAF7F2] hover:bg-[#F5EFE6] border border-[#E6DEC8] text-xs font-semibold text-[#212529] transition-colors whitespace-nowrap self-start sm:self-auto min-h-[40px]"
        >
          <MessageSquarePlus className="w-4 h-4 text-[#E31E24] shrink-0" aria-hidden="true" />
          <span>{isFormOpen ? 'Fermer le formulaire' : 'Donner mon avis'}</span>
        </button>
      </div>

      {justSubmitted && (
        <div
          role="status"
          className="p-3.5 rounded-[10px] bg-[#E6FCF5] border border-[#099268]/30 flex items-center gap-2.5 text-xs font-semibold text-[#099268]"
        >
          <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Merci ! Votre retour sur « {product.name} » a bien été ajouté ci-dessous.</span>
        </div>
      )}

      {/* Formulaire d'ajout d'avis */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmitReview}
          className="p-4 sm:p-5 rounded-[14px] bg-[#FAF7F2] border border-[#E6DEC8] space-y-4"
        >
          <h3 className="text-sm font-bold text-[#212529] font-sans">
            Partager votre retour sur {product.name}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="review-author"
                className="block text-xs font-semibold text-[#212529] mb-1"
              >
                Prénom et initiale <span className="text-[#E31E24]">*</span>
              </label>
              <input
                id="review-author"
                type="text"
                maxLength={40}
                value={author}
                onChange={(e) => {
                  setAuthor(e.target.value);
                  if (formError) setFormError('');
                }}
                placeholder="Ex. Marc K."
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6DEC8] text-xs sm:text-sm text-[#212529] focus:outline-none focus:border-[#E31E24]"
              />
            </div>

            <div>
              <label
                htmlFor="review-agency"
                className="block text-xs font-semibold text-[#212529] mb-1"
              >
                Agence SAKER fréquentée
              </label>
              <select
                id="review-agency"
                value={agencyVisited}
                onChange={(e) => setAgencyVisited(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6DEC8] text-xs sm:text-sm text-[#212529] focus:outline-none focus:border-[#E31E24]"
              >
                {BRAND_CONFIG.agencies.map((a) => (
                  <option key={a.id} value={`Agence ${a.district.split(',')[0]}`}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-xs font-semibold text-[#212529] mb-1">
                Votre note <span className="text-[#E31E24]">*</span>
              </span>
              <div className="flex items-center gap-1.5 h-[38px]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    aria-label={`Noter ${star} sur 5`}
                    className="p-1 rounded hover:bg-white transition-colors"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'text-[#D9920B] fill-[#F5B316]'
                          : 'text-[#DCD3C6]'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-1.5 text-xs font-bold text-[#212529] tabular-price">
                  {rating}/5
                </span>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="review-comment"
              className="block text-xs font-semibold text-[#212529] mb-1"
            >
              Votre commentaire (goût, fraîcheur, accueil, conseil...) <span className="text-[#E31E24]">*</span>
            </label>
            <textarea
              id="review-comment"
              rows={3}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (formError) setFormError('');
              }}
              placeholder="Partagez votre ressenti honnête sur ce produit..."
              className="w-full px-3 py-2 rounded-lg bg-white border border-[#E6DEC8] text-xs sm:text-sm text-[#212529] focus:outline-none focus:border-[#E31E24]"
            />
          </div>

          {formError && <p className="text-xs text-[#C92A2A] font-medium">{formError}</p>}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#5C534C] hover:text-[#212529]"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#E31E24] hover:bg-[#C8161C] text-white text-xs font-semibold transition-colors"
            >
              Publier mon avis
            </button>
          </div>
        </form>
      )}

      {/* Synthèse de la note moyenne + Liste des retours */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Bloc Note Moyenne & Répartition */}
        <div className="lg:col-span-4 p-4 sm:p-5 rounded-[14px] bg-[#FAF7F2] border border-[#E6DEC8] space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <span className="block text-3xl sm:text-4xl font-bold text-[#212529] tabular-price leading-none">
                {averageRating.toFixed(1).replace('.', ',')}
              </span>
              <span className="text-[11px] text-[#868E96] mt-1 block">sur 5</span>
            </div>

            <div className="space-y-1">
              <div
                className="flex items-center gap-1"
                aria-label={`Note moyenne de ${averageRating} sur 5`}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRating)
                        ? 'text-[#D9920B] fill-[#F5B316]'
                        : 'text-[#DCD3C6]'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="text-xs font-semibold text-[#212529] tabular-price">
                Basé sur {allReviews.length} {allReviews.length > 1 ? 'retours' : 'retour'}
              </p>
            </div>
          </div>

          {/* Barres de répartition */}
          <div className="space-y-1.5 pt-2 border-t border-[#E6DEC8]">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star] || 0;
              const pct = allReviews.length > 0 ? Math.round((count / allReviews.length) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-12 text-[#5C534C] font-medium tabular-price whitespace-nowrap">
                    {star} {star > 1 ? 'étoiles' : 'étoile'}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-[#E6DEC8]/60 overflow-hidden">
                    <div
                      className="h-full bg-[#F5B316] rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-[11px] text-[#868E96] tabular-price">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Liste des retours textuels */}
        <div className="lg:col-span-8 divide-y divide-[#EFE9DC]">
          {allReviews.map((rev) => (
            <article key={rev.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Métadonnées sobres non encapsulées (Zero-Pill Discipline) */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="font-bold text-[#212529]">{rev.author}</span>
                  <span className="text-[#868E96]" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-[#5C534C] font-medium">{rev.agencyVisited}</span>
                  {rev.contextTag && (
                    <>
                      <span className="text-[#868E96]" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-[#868E96]">{rev.contextTag}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center gap-0.5"
                    aria-label={`Note : ${rev.rating} sur 5`}
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating
                            ? 'text-[#D9920B] fill-[#F5B316]'
                            : 'text-[#DCD3C6]'
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#868E96]">{rev.date}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#5C534C] leading-relaxed">{rev.comment}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
