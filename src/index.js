import React from "react";
 import ReactDOM from "react-dom/client";
 import { BrowserRouter } from "react-router-dom";
 import App from "./App";
 import "./index.css";
 import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

 const root = ReactDOM.createRoot(document.getElementById("root"));
 root.render(
   <React.StrictMode>
     <BrowserRouter>
       <AuthProvider>
        <App />
        <Toaster
          position="top-center"
          containerStyle={{
            top: "50%",
            transform: "translateY(-50%)",
          }}
          toastOptions={{
            duration: 3000,
            className:
             "bg-base-100 text-base-content rounded-lg shadow-lg border border-base-300",
            success: {
              iconTheme: { primary: "#22c55e", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#fff" },
            },
          }}
        />
       </AuthProvider>
     </BrowserRouter>
   </React.StrictMode>
 );