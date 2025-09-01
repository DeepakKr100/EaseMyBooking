import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useParams } from "react-router-dom";

export default function OwnerPlaceBookings() {
  const { placeId } = useParams();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/Bookings/place/${placeId}`);
      setBookings(data);
    })();
  }, [placeId]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">Bookings for Place #{placeId}</h2>
      {bookings.length === 0 ? (
        <div className="opacity-70">No bookings yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Visitor</th>
                <th>Visit Date</th>
                <th>Qty</th>
                <th>Paid</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.bookingId}>
                  <td>{b.bookingId}</td>
                  <td>{b.user?.name || b.userId}</td>
                  <td>{new Date(b.visitDate).toLocaleDateString()}</td>
                  <td>{b.quantity}</td>
                  <td>{b.paymentConfirmed ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
