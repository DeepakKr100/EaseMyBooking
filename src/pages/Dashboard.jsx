// pages/Dashboard.jsx (rudimentary example for Owner)
import { useEffect, useState } from 'react';
import { api } from '../services/api';
function Dashboard() {
  const [places, setPlaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      // get all places, then filter owned places client-side, or better: have an API endpoint /owners/me/places
      const res = await api.get('/Places');
      const ownerPlaces = res.data.filter(p => p.ownerId); // ownerId is set and current user would filter by id
      setPlaces(ownerPlaces);
      // get bookings for each place
      let allBookings = [];
      for(let place of ownerPlaces) {
        let resB = await api.get(`/Bookings/place/${place.placeId}`);
        allBookings = allBookings.concat(resB.data);
      }
      setBookings(allBookings);
    };
    fetchData();
  }, []);
  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Owner Dashboard</h2>
      <h3 className="text-xl">Your Places:</h3>
      <ul>
        {places.map(p => <li key={p.placeId}>{p.name} ({p.location}) - {p.price}</li>)}
      </ul>
      <h3 className="text-xl mt-4">Recent Bookings for Your Places:</h3>
      <ul>
        {bookings.map(b => (
          <li key={b.bookingId}>
            {b.place?.name} – {b.user?.name} booked {b.quantity} for {new Date(b.visitDate).toDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default Dashboard;
