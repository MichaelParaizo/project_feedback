import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Páginas
import App from "../App";                     // fluxo do cliente
import LoginPage from "../pages/admin/LoginPage";
import Dashboard from "../pages/admin/Dashboard";

// Rota protegida do admin
function PrivateRoute({ children }) {
  const { token } = useAuth();

  // Se não estiver logado → volta para login
  if (!token) return <Navigate to="/admin/login" replace />;

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* CLIENTE */}
        <Route path="/" element={<App />} />

        {/* LOGIN ADMIN */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* DASHBOARD ADMIN */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
