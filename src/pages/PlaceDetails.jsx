import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/format";
import { loadRazorpay } from "../utils/loadRazorpay";
import ReviewModal from "../components/ReviewModal";
import MapLink from "../components/MapLink";
import { toast } from "react-hot-toast";

function todayYMD() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function toMidnight(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default function PlaceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [place, setPlace] = useState(null);
  const [visitDate, setVisitDate] = useState(todayYMD());
  const [quantity, setQuantity] = useState(1);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  // review eligibility
  const [canWriteReview, setCanWriteReview] = useState(false);
  const [hasUpcomingBooking, setHasUpcomingBooking] = useState(false);

  const minDate = useMemo(() => todayYMD(), []);

  const fetchPlace = async () => {
    const { data } = await api.get(`/Places/${id}`);
    data.images = (data.images || []).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    setPlace(data);
    setIdx(0);
  };

  const evaluateReviewEligibility = async () => {
    if (!token || user?.role !== "Visitor") {
      setCanWriteReview(false);
      setHasUpcomingBooking(false);
      return;
    }
    try {
      const { data: bookings } = await api.get("/Bookings/my");
      const pid = Number(id);
      const today = toMidnight(new Date());

      const mine = bookings.filter(
        (b) => (b.placeId === pid || b.place?.placeId === pid)
      );

      const eligible = mine.some(
        (b) => b.paymentConfirmed && toMidnight(new Date(b.visitDate)) < today
      );
      const upcoming = mine.some(
        (b) => toMidnight(new Date(b.visitDate)) >= today
      );

      setCanWriteReview(eligible);
      setHasUpcomingBooking(upcoming && !eligible);
    } catch {
      // ignore; keep defaults
    }
  };

  useEffect(() => {
    fetchPlace();
    evaluateReviewEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const images = place?.images?.length
    ? place.images.map((i) => i.url)
    : place?.imageUrl
    ? [place.imageUrl]
    : [];

  const next = () => setIdx((i) => (i + 1) % Math.max(images.length || 1, 1));
  const prev = () => setIdx((i) => (i - 1 + Math.max(images.length || 1, 1)) % Math.max(images.length || 1, 1));

  const handleBook = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate("/login");
      return;
    }

    // Guard: reject past dates even if user hacks the DOM
    const selected = toMidnight(new Date(visitDate));
    const today = toMidnight(new Date());
    if (selected < today) {
      toast.error("Please choose today or a future date.");
      return;
    }

    try {
      await loadRazorpay();
      const publicKey = (process.env.REACT_APP_RAZORPAY_KEY || "").trim();
      if (!publicKey) {
        toast.error("Razorpay key not found.");
        return;
      }

      // Create booking + order
      const { data } = await toast.promise(
        api.post("/Bookings", {
          placeId: Number(id),
          visitDate,
          quantity: Number(quantity),
        }),
        {
          loading: "Creating booking…",
          success: "Booking created. Opening payment…",
          error: (err) => err?.response?.data || "Booking failed.",
        }
      );

      const { bookingId, orderId, amount, currency } = data;

      const options = {
        key: publicKey,
        amount,
        currency,
        name: "Ease My Booking",
        description: `Booking #${bookingId} - ${place.name}`,
        order_id: orderId,
        handler: async (resp) => {
          await toast.promise(
            api.post("/Bookings/verifyPayment", {
              bookingId,
              orderId: resp.razorpay_order_id,
              paymentId: resp.razorpay_payment_id,
              signature: resp.razorpay_signature,
            }),
            {
              loading: "Verifying payment…",
              success: "Payment successful! Booking confirmed.",
              error: (err) => err?.response?.data || "Payment verification failed.",
            }
          );
          navigate("/dashboard/visitor");
        },
        prefill: { name: user?.name, email: "" },
        theme: { color: "#3b82f6" },
        modal: {
          ondismiss: () => toast("Payment window closed."),
        },
      };
      const rz = new window.Razorpay(options);
      rz.open();
    } catch (e2) {
      toast.error(e2?.response?.data || "Could not start payment.");
    }
  };

  if (!place) return <div>Loading...</div>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* LEFT: info & gallery */}
      <div className="bg-base-100 rounded-xl shadow p-4">
        <div className="relative aspect-[16/9] bg-base-300 rounded mb-4 overflow-hidden">
          {images.length > 0 ? (
            <>
              <img
                key={images[idx]}
                src={images[idx]}
                alt={`${place.name} ${idx + 1}/${images.length}`}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    className="btn btn-circle btn-sm absolute left-2 top-1/2 -translate-y-1/2"
                    onClick={prev}
                    type="button"
                  >
                    ❮
                  </button>
                  <button
                    className="btn btn-circle btn-sm absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={next}
                    type="button"
                  >
                    ❯
                  </button>
                  <div className="absolute bottom-2 left-0 right-0 text-center text-xs opacity-80">
                    {idx + 1} / {images.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="grid place-items-center h-full opacity-60">No Image</div>
          )}
        </div>

        <h2 className="text-2xl font-bold">{place.name}</h2>
        <p className="mt-2">{place.description}</p>
        <div className="flex flex-row justify-between">
          <div className="mt-3 text-sm opacity-90 space-y-1">
            <div>Location: {place.location}</div>
            <div>Timings: {place.timings}</div>
            <div>Price: {formatCurrency(place.price)}</div>
          </div>
          {place.googleMapsUrl && (
            <div className="pt-1">
              <MapLink url={place.googleMapsUrl} className="btn btn-lg" />
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: booking + reviews */}
      <div className="bg-base-100 rounded-xl shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold">Book Tickets</h3>
        </div>

        <form className="space-y-3" onSubmit={handleBook}>
          <div>
            <label className="label">
              <span className="label-text">Visit Date</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              required
              min={minDate}               // ← block past dates in picker
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Quantity</span>
            </label>
            <input
              type="number"
              min="1"
              className="input input-bordered w-full"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <button className="btn btn-primary w-full" type="submit">
            Book & Pay
          </button>
        </form>

        <div className="flex items-center justify-between mt-6 mb-2">
          <h4 className="text-lg font-semibold">Reviews</h4>
          <MapLink url={place.googleMapsUrl} className="btn btn-ghost btn-lg" />
        </div>
        <div className="divider my-2" />

        {/* Only show button if visitor has a PAID, PAST booking for this place */}
        {token && canWriteReview && (
          <div className="mb-3">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setReviewOpen(true)}
              type="button"
            >
              Write a Review
            </button>
          </div>
        )}

        {/* Hint when there is an upcoming booking (and no eligible past one yet) */}
        {token && hasUpcomingBooking && !canWriteReview && (
          <div className="mb-3 text-xs opacity-70">
            You can write a review after your visit.
          </div>
        )}

        <div className="space-y-3 max-h-64 overflow-auto">
          {(place.reviews || []).length === 0 ? (
            <div className="opacity-60 text-sm">No reviews yet.</div>
          ) : (
            place.reviews.map((r) => (
              <div key={r.reviewId} className="border rounded p-2">
                <div className="font-semibold">Rating: {r.rating}/5</div>
                <div className="text-sm opacity-70">
                  {new Date(r.createdAt).toLocaleString()}
                </div>
                <div className="mt-1">{r.comment}</div>
                <div className="text-xs opacity-70 mt-1">
                  by {r.user?.name || "Visitor"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        placeId={Number(id)}
        placeName={place.name}
        onSuccess={() => {
          fetchPlace();
          evaluateReviewEligibility();
        }}
      />
    </div>
  );
}
