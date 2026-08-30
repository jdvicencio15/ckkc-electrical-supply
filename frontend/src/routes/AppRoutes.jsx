import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";
import ResetPassword from "../pages/ResetPassword";

import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";
import PublicLayout from "../components/layout/PublicLayout";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />
        </Route>

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />
          </Route>
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;