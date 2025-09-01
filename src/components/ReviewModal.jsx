import { useState } from "react";
import { addReview } from "../services/reviews";
import { toast } from "react-hot-toast"; // NEW

export default function ReviewModal({ open, onClose, placeId, placeName, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!comment || comment.trim().length < 10) {
      toast.error("Comment must be at least 10 characters.");
      return;
    }
    try {
      setLoading(true);
      await toast.promise(
        addReview(placeId, Number(rating), comment.trim()),
        {
          loading: "Submitting your review…",
          success: "Thanks! Your review has been added.",
          error: (err) => err?.response?.data || "Failed to add review.",
        }
      );
      setComment("");
      setRating(5);
      onClose?.();
      onSuccess?.(); // refresh reviews
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4">
      <div className="bg-base-100 w-full max-w-md rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Write a Review {placeName ? `for ${placeName}` : ""}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <form className="grid gap-3" onSubmit={submit}>
          <div>
            <label className="label"><span className="label-text">Rating</span></label>
            <select className="select select-bordered w-full"
                    value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Good</option>
              <option value={3}>3 - Average</option>
              <option value={2}>2 - Poor</option>
              <option value={1}>1 - Terrible</option>
            </select>
          </div>
          <div>
            <label className="label"><span className="label-text">Comment</span></label>
            <textarea className="textarea textarea-bordered w-full min-h-28"
                      placeholder="Share details about your experience (min 10 chars)"
                      value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
          <button className={`btn btn-primary ${loading ? "loading" : ""}`} disabled={loading}>
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}