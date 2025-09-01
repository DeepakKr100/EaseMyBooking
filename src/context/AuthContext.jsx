import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("authToken") || "");
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (token) localStorage.setItem("authToken", token);
    else localStorage.removeItem("authToken");
  }, [token]);

  const login = (tokenVal, userObj) => {
    setToken(tokenVal);
    setUser(userObj);
    localStorage.setItem("authToken", tokenVal);
    localStorage.setItem("user", JSON.stringify(userObj));
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  };

  const value = useMemo(() => ({ token, user, login, logout }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
