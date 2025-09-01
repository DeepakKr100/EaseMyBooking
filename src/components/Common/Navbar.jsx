import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex-1">
          <Link to="/" className="text-xl font-bold">Ease My Booking</Link>
        </div>
        <div className="flex items-center gap-3">
          <NavLink to="/places" className="btn btn-ghost btn-sm">Places</NavLink>

          {!user && (
            <>
              <NavLink to="/login" className="btn btn-sm">Login</NavLink>
              <NavLink to="/register" className="btn btn-outline btn-sm">Register</NavLink>
            </>
          )}

          {user?.role === "Visitor" && (
            <NavLink to="/dashboard/visitor" className="btn btn-ghost btn-sm">My Dashboard</NavLink>
          )}
          {user?.role === "Owner" && (
            <NavLink to="/dashboard/owner" className="btn btn-ghost btn-sm">Owner Dashboard</NavLink>
          )}

          {user && <LogoutButton className="btn btn-error btn-sm text-white" />}
        </div>
      </div>
    </div>
  );
}
