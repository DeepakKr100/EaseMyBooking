import { formatCurrency } from "../utils/format";
import MapLink from "./MapLink"; // NEW

export default function BookingCard({ booking, onPayNow, onWriteReview }) {
  const date = new Date(booking.visitDate);
  const total = (booking.place?.price ?? 0) * booking.quantity;

  const thumb =
    booking.placeThumbUrl ||
    booking.place?.thumbnailUrl ||
    booking.place?.imageUrl ||
    "";

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex items-stretch gap-4">
          <div className="flex-1 min-w-0 ">
            <h4 className="card-title truncate">
              {booking.place?.name ?? "Place"}
            </h4>
            <div className="flex flex-row justify-between">
              <div>
                <div className="text-sm opacity-70">{date.toDateString()}</div>
                <div className="text-sm">Tickets: {booking.quantity}</div>
                <div className="text-sm">Total: {formatCurrency(total)}</div>

                <div className="mt-2 flex items-center gap-3 flex-wrap">
                  {booking.paymentConfirmed ? (
                    <span className="badge badge-success">Paid</span>
                  ) : (
                    <>
                      <span className="badge badge-error">Payment Pending</span>
                      {onPayNow && (
                        <button
                          className="btn btn-xs btn-primary"
                          onClick={() => onPayNow(booking)}
                        >
                          Pay Now
                        </button>
                      )}
                    </>
                  )}

                  {onWriteReview && (
                    <button
                      className="btn btn-link btn-xs px-0"
                      onClick={() =>
                        onWriteReview({
                          placeId: booking.place?.placeId ?? booking.placeId,
                          placeName: booking.place?.name ?? "Place",
                        })
                      }
                    >
                      Write Review
                    </button>
                  )}
                </div>
              </div>
              {/* NEW: Maps link */}
              <MapLink url={booking.place?.googleMapsUrl} className="text-lg btn-md" />
            </div>
          </div>

          <div className="w-40 h-28 md:w-64 md:h-40 rounded-lg overflow-hidden bg-base-300 shrink-0">
            {thumb ? (
              <img src={thumb} alt={booking.place?.name ?? "Place"} className="w-full h-full object-cover" loading="lazy"/>
            ) : (
              <div className="w-full h-full grid place-items-center text-xs opacity-60">No Image</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
