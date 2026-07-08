import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { canAccess } from "../utils/permisos";

export default function ProtectedRoute({ children, permission }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p style={{ padding: "2rem", textAlign: "center" }}>Cargando...</p>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permission && !canAccess(user.rol, permission)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
