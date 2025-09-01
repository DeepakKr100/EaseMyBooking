import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";

export default function Header() {
  const token = localStorage.getItem("authToken");
  const name  = localStorage.getItem("userName");
  const role  = localStorage.getItem("userRole");

  return (
    <header className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
      <Link to="/" className="font-bold">EaseMyBooking</Link>
      <nav className="space-x-4">
        <Link to="/places">Places</Link>
        {token ? (
          <>
            {(role === "Owner" || role === "Admin") && <Link to="/dashboard">Dashboard</Link>}
            <span className="opacity-80">Hi, {name}</span>
            <LogoutButton />
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="bg-white/10 px-3 py-1 rounded">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
