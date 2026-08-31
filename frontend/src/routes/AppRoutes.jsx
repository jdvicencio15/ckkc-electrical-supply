import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";
import ResetPassword from "../pages/ResetPassword";

import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";
import AuthLayout from "../components/layout/AuthLayout";

import ProfileSettings from "../pages/ProfileSettings";

import RootRedirect from "./RootRedirect";
import ContactSupport from "../pages/ContactSupport";

import Products from "../pages/Products";
import Categories from "../pages/Categories";
import Sales from "../pages/Sales";
import Purchases from "../pages/Purchases";
import Inventory from "../pages/Inventory";
import Customers from "../pages/Customers";
import Suppliers from "../pages/Suppliers";
import Quotations from "../pages/Quotations";
import Invoices from "../pages/Invoices";
import Payments from "../pages/Payments";
import Accounting from "../pages/Accounting";
import Reports from "../pages/Reports";
import Users from "../pages/Users";
import RolesPermissions from "../pages/RolesPermissions";
import Settings from "../pages/Settings";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<RootRedirect />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>
        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/products" element={<Products />} />

            <Route path="/categories" element={<Categories />} />

            <Route path="/sales" element={<Sales />} />

            <Route path="/purchases" element={<Purchases />} />

            <Route path="/inventory" element={<Inventory />} />

            <Route path="/customers" element={<Customers />} />

            <Route path="/suppliers" element={<Suppliers />} />

            <Route path="/quotations" element={<Quotations />} />

            <Route path="/invoices" element={<Invoices />} />

            <Route path="/payments" element={<Payments />} />

            <Route path="/accounting" element={<Accounting />} />

            <Route path="/reports" element={<Reports />} />

            <Route path="/users" element={<Users />} />

            <Route path="/roles-permissions" element={<RolesPermissions />} />

            <Route path="/settings" element={<Settings />} />

            <Route path="/profile-settings" element={<ProfileSettings />} />

            <Route path="/contact-support" element={<ContactSupport />} />

            <Route path="/profile-settings" element={<ProfileSettings />} />

            <Route path="/contact-support" element={<ContactSupport />} />
          </Route>
        </Route>
        {/* 404 */}
        <Route path="*" element={<NotFound />} />;
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
