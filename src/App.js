import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Places from "./pages/Places";
import PlaceDetails from "./pages/PlaceDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VisitorDashboard from "./pages/VisitorDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerPlaceForm from "./pages/OwnerPlaceForm";
import OwnerPlaceBookings from "./pages/OwnerPlaceBookings";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Common/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function App() {
  const { token, user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Navbar />
      <main className="flex-1 mx-auto px-4 py-6 w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/places" element={<Places />} />
          <Route path="/places/:id" element={<PlaceDetails />} />

          <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={token ? <Navigate to="/" replace /> : <Register />} />

          {/* Visitor dashboard */}
          <Route
            path="/dashboard/visitor"
            element={
              <ProtectedRoute role="Visitor">
                <VisitorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Owner dashboard */}
          <Route
            path="/dashboard/owner"
            element={
              <ProtectedRoute role="Owner">
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/places/new"
            element={
              <ProtectedRoute role="Owner">
                <OwnerPlaceForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/places/:placeId/edit"
            element={
              <ProtectedRoute role="Owner">
                <OwnerPlaceForm edit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/places/:placeId/bookings"
            element={
              <ProtectedRoute role="Owner">
                <OwnerPlaceBookings />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* dev role checker */}
      {/* <pre className="text-xs opacity-60">{JSON.stringify({token, user}, null, 2)}</pre> */}
    </div>
  );
}

export default App;
