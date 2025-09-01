import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div className="text-center py-24">
      <h2 className="text-3xl font-bold mb-2">404 — Not Found</h2>
      <p className="mb-4">The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary">Go Home</Link>
    </div>
  );
}
