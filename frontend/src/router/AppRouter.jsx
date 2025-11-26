import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/admin/LoginPage";
import { useAuth } from "../context/AuthContext";
import App from "../App";

function PrivateRoute({ children }) {
  const { token } = useAuth();

  if (!token) return <Navigate to="/admin/login" />;

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* CLIENTE - fluxo atual */}
        <Route path="/" element={<App />} />

        {/* LOGIN ADMIN */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* DASHBOARD ADMIN */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <div className="text-white p-20">Dashboard em construção...</div>
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
