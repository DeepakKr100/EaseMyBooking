import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/format";

export default function PlaceCard({ place }) {
  const firstImage =
    (place.images && place.images.length > 0 && place.images[0].url) ||
    place.imageUrl ||
    "";

  const hasRating = typeof place.averageRating === "number" && place.reviewCount != null;

  return (
    <div className="card bg-base-100 shadow-md">
      <figure className="aspect-[16/9] bg-base-300">
        {firstImage ? (
          <img src={firstImage} alt={place.name} className="w-full h-full object-cover"/>
        ) : (
          <div className="w-full h-full grid place-items-center text-sm opacity-60">No Image</div>
        )}
      </figure>
      <div className="card-body">
        <h3 className="card-title">{place.name}</h3>
        <p className="line-clamp-2">{place.description}</p>

        {/* NEW: rating */}
        <div className="text-sm flex items-center gap-2 mt-1">
          {hasRating ? (
            <>
              <span className="opacity-90">⭐ {place.averageRating?.toFixed(1)}</span>
              <span className="opacity-60">({place.reviewCount})</span>
            </>
          ) : (
            <span className="opacity-60">No ratings yet</span>
          )}
        </div>

        <p className="text-sm opacity-70">{place.location} • {place.timings}</p>
        <div className="card-actions justify-between items-center mt-2">
          <span className="font-semibold">{formatCurrency(place.price)}</span>
          <Link to={`/places/${place.placeId}`} className="btn btn-primary btn-sm">View</Link>
        </div>
      </div>
    </div>
  );
}
