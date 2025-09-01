import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { formatCurrency } from "../utils/format";
import { useAuth } from "../context/AuthContext";
 
export default function OwnerDashboard() {
  const [places, setPlaces] = useState([]);
  const [stats, setStats] = useState({});
  const navigate = useNavigate();
  const { logout } = useAuth();
 
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/Places/my");
        setPlaces(data);
 
        for (const p of data) {
          const res = await api.get(`/Bookings/place/${p.placeId}`);
          const bookings = res.data;
          const totalBookings = bookings.length;
          const revenue = bookings
            .filter(b => b.paymentConfirmed)
            .reduce((sum, b) => sum + p.price * b.quantity, 0);
 
          setStats(prev => ({
            ...prev,
            [p.placeId]: { totalBookings, revenue }
          }));
        }
      } catch (e) {
        if (e?.response?.status === 401) {
          logout();
          navigate("/login", { replace: true });
        } else {
          console.error(e);
        }
      }
    })();
  }, []);
 
  // Aggregate totals
  const totalVisitors = Object.values(stats).reduce((sum, s) => sum + s.totalBookings, 0);
  const totalRevenue = Object.values(stats).reduce((sum, s) => sum + s.revenue, 0);
 
  return (
<div>
<div className="flex items-center justify-between mb-3">
<h2 className="text-2xl font-bold">Owner Dashboard</h2>
<Link to="/owner/places/new" className="btn btn-primary">+ Add Place</Link>
</div>
 
      {/* Stylish Summary Card */}
<div className="card bg-base-100 shadow-xl mb-6">
<div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
<h3 className="text-lg font-semibold text-gray-600">Total Visitors</h3>
<p className="text-3xl font-bold text-primary">{totalVisitors}</p>
</div>
<div>
<h3 className="text-lg font-semibold text-gray-600">Total Revenue</h3>
<p className="text-3xl font-bold text-success">{formatCurrency(totalRevenue)}</p>
</div>
</div>
</div>
 
      {/* Places List */}
      {places.length === 0 ? (
<div className="opacity-70">You have not added any places yet.</div>
      ) : (
<div className="space-y-3">
    <h1 className="text-xl font-semibold text-gray-600">Places</h1>
          {places.map(p => {
            const s = stats[p.placeId] || { totalBookings: 0, revenue: 0 };
            return (
<div key={p.placeId} className="card bg-base-100 shadow">
<div className="card-body grid gap-2 md:grid-cols-[1fr_auto]">
<div>
<h3 className="card-title">{p.name}</h3>
<div className="opacity-70">{p.location} • {p.timings}</div>
<div className="text-sm mt-1">{p.description}</div>
<div className="mt-2 text-sm">
<strong>Bookings:</strong> {s.totalBookings} &nbsp;|&nbsp;
<strong>Revenue:</strong> {formatCurrency(s.revenue)}
</div>
</div>
<div className="flex gap-2 justify-end items-center flex-col">
<button className="btn" onClick={() => navigate(`/owner/places/${p.placeId}/bookings`)}>View Bookings</button>
<button className="btn btn-secondary" onClick={() => navigate(`/owner/places/${p.placeId}/edit`)}>Edit Place</button>
</div>
</div>
</div>
            );
          })}
</div>
      )}
</div>
  );
}