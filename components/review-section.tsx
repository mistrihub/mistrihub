"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import type { Review } from "@/types/worker";

export function ReviewSection({ workerId, reviews }: { workerId: string; reviews: Review[] }) {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitReview() {
    setMessage("");

    if (!hasSupabaseConfig || !supabase) {
      setMessage("Reviews are saved when Supabase is configured. This demo keeps the form visible for testing.");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      worker_id: workerId,
      customer_name: customerName || "LocalPro customer",
      rating,
      review_text: reviewText
    });
    setSubmitting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setCustomerName("");
    setRating(5);
    setReviewText("");
    setMessage("Review submitted. Thanks for helping other customers choose well.");
    router.refresh();
  }

  return (
    <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wide text-brand">Customer reviews</p>
        <h2 className="mt-2 text-2xl font-black text-ink">Share your experience</h2>
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Your name</span>
            <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="input mt-2" />
          </label>
          <div>
            <span className="text-sm font-bold text-slate-700">Rating</span>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-amber-500 transition hover:border-amber-400"
                  aria-label={`${value} star rating`}
                >
                  <Star className={`h-5 w-5 ${value <= rating ? "fill-current" : ""}`} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Review</span>
            <textarea
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              className="textarea mt-2"
              rows={4}
              placeholder="Was the worker punctual, professional, and helpful?"
            />
          </label>
          <button
            type="button"
            disabled={submitting}
            onClick={submitReview}
            className="h-11 w-full rounded-lg bg-brand text-sm font-bold text-white transition hover:bg-teal-800 disabled:opacity-70"
          >
            {submitting ? "Submitting..." : "Submit review"}
          </button>
          {message ? <p className="rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-700">{message}</p> : null}
        </div>
      </div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-slate-600">
            No reviews yet. Be the first customer to rate this worker.
          </div>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-ink">{review.customerName}</h3>
                  <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-sm font-bold text-amber-700">
                  <Star className="h-4 w-4 fill-current" aria-hidden="true" />
                  {review.rating}
                </span>
              </div>
              {review.reviewText ? <p className="mt-3 leading-7 text-slate-600">{review.reviewText}</p> : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
