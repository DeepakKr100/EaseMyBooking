import { useEffect, useState } from "react";
import { api } from "../services/api";
import BookingCard from "../components/BookingCard";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { loadRazorpay } from "../utils/loadRazorpay";
import ReviewModal from "../components/ReviewModal";
import { toast } from "react-hot-toast"; // keep named import as in your file

export default function VisitorDashboard() {
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [reviewFor, setReviewFor] = useState({ open: false, placeId: null, placeName: "" });

  // ---- date helpers ----
  const startOfDay = (d) => {
    const t = new Date(d);
    t.setHours(0, 0, 0, 0);
    return t;
  };
  const today = startOfDay(new Date());
  const visitDay = (b) => startOfDay(b.visitDate);
  const isToday = (b) => visitDay(b).getTime() === today.getTime();
  const isPast = (b) => visitDay(b) < today;
  const isPaid = (b) => !!b.paymentConfirmed;

  const load = async () => {
    try {
      const { data } = await api.get("/Bookings/my");
      const up = [], pa = [];
      for (const b of data) {
        if (isPast(b)) pa.push(b);
        else up.push(b); // includes today & future
      }
      setUpcoming(up);
      setPast(pa);
    } catch (e) {
      if (e?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
      } else {
        console.error(e);
      }
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePayNow = async (booking) => {
    try {
      await loadRazorpay();

      const publicKey = (process.env.REACT_APP_RAZORPAY_KEY || "").trim();
      if (!publicKey) {
        toast.error("Razorpay key missing in .env");
        return;
      }

      const { data } = await api.post("/Bookings", {
        placeId: booking.placeId,
        visitDate: booking.visitDate,
        quantity: booking.quantity,
      });

      const { bookingId, orderId, amount, currency } = data;

      const rz = new window.Razorpay({
        key: publicKey,
        amount,
        currency,
        name: "Ease My Booking",
        description: `Booking #${bookingId} - ${booking.place?.name ?? ""}`,
        order_id: orderId,
        handler: async (resp) => {
          await api.post("/Bookings/verifyPayment", {
            bookingId,
            orderId: resp.razorpay_order_id,
            paymentId: resp.razorpay_payment_id,
            signature: resp.razorpay_signature,
          });
          await load();
          toast.success("Payment successful! Booking confirmed.", { duration: 3000 });
        },
      });

      rz.open();
    } catch (e) {
      if (e?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }
      toast.error(e?.response?.data || "Payment init failed", { duration: 3000 });
    }
  };

  // Past + paid → can review
  const isPastPaid = (b) => isPast(b) && isPaid(b);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">My Bookings</h2>

      {/* UPCOMING (includes today & future) */}
      <h3 className="text-xl font-semibold mb-2">Upcoming</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {upcoming.length === 0 ? (
          <div className="opacity-70">No upcoming bookings.</div>
        ) : (
          upcoming.map((b) => (
            <BookingCard
              key={b.bookingId}
              booking={b}
              onPayNow={handlePayNow}
              // Show review button ONLY if it's today's booking AND paid
              onWriteReview={
                isToday(b) && isPaid(b)
                  ? ({ placeId, placeName }) =>
                      setReviewFor({ open: true, placeId, placeName })
                  : undefined
              }
            />
          ))
        )}
      </div>

      {/* PAST */}
      <h3 className="text-xl font-semibold mt-6 mb-2">Past</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {past.length === 0 ? (
          <div className="opacity-70">No past bookings.</div>
        ) : (
          past.map((b) => (
            <BookingCard
              key={b.bookingId}
              booking={b}
              onWriteReview={
                isPastPaid(b)
                  ? ({ placeId, placeName }) =>
                      setReviewFor({ open: true, placeId, placeName })
                  : undefined
              }
            />
          ))
        )}
      </div>

      <ReviewModal
        open={reviewFor.open}
        onClose={() => setReviewFor({ open: false, placeId: null, placeName: "" })}
        placeId={reviewFor.placeId}
        placeName={reviewFor.placeName}
        onSuccess={load}
      />
    </div>
  );
}
