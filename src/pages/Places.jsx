import { useEffect, useState } from "react";
import { api } from "../services/api";
import PlaceCard from "../components/PlaceCard";
import toast from "react-hot-toast";

export default function Places() {
  const [places, setPlaces] = useState([]);
  const [q, setQ] = useState("");
  const [max, setMax] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const params = {};
    if (q) params.location = q;
    if (max) params.maxPrice = max;

    setLoading(true);
    try {
      const res = await api.get("/Places", { params });
      setPlaces(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load places:", err);
      setPlaces([]); // keep UI stable
      //alert(err?.response?.data ?? "Unable to load places right now.");
      toast.error(err?.response?.data ?? "Unable to load places right now.", { duration: 3000 });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input className="input input-bordered" placeholder="Location"
               value={q} onChange={e => setQ(e.target.value)} />
        <input className="input input-bordered" placeholder="Max price"
               value={max} onChange={e => setMax(e.target.value)} />
        <button className="btn btn-primary" onClick={load}>Search</button>
      </div>

      {loading ? (
        <div className="opacity-70">Loading places…</div>
      ) : places.length === 0 ? (
        <div className="opacity-70">No places found.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {places.map(p => <PlaceCard key={p.placeId} place={p} />)}
        </div>
      )}
    </div>
  );
}
