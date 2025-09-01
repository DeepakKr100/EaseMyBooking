// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";

// export default function LogoutButton({ className = "btn" }) {
//   const { logout } = useAuth();
//   const navigate = useNavigate();
//   return (
//     <button
//       className={className}
//       onClick={() => {
//         logout();
//         navigate("/");
//       }}
//     >
//       Logout
//     </button>
//   );
// }


import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast"; // NEW

export default function LogoutButton({ className = "btn" }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <button
      className={className}
      onClick={() => {
        logout();
        toast.success("Logged out successfully. See you soon!"); // NEW
        navigate("/");
      }}
      type="button"
    >
      Logout
    </button>
  );
}