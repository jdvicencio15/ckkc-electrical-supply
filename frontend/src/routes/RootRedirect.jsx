import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RootRedirect() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/login" replace />;
}

export default RootRedirect;