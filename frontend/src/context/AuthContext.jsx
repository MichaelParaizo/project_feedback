import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem("admin");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (jwt, adminData) => {
    localStorage.setItem("token", jwt);
    localStorage.setItem("admin", JSON.stringify(adminData));
    setToken(jwt);
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    setToken(null);
    setAdmin(null);
  };

  const value = {
    token,
    admin,
    login,
    logout,
    loading: false, // por enquanto não usamos loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
