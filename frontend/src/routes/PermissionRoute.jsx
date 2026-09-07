import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { hasPermission } from "../utils/permissions";

const PermissionRoute = ({
  module,
  action = "view",
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const allowed = hasPermission(
    user.role,
    module,
    action
  );

  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PermissionRoute;