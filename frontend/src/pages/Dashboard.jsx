import { useAuth } from "../context/AuthContext";

import ManagementDashboard from "../components/dashboard/ManagementDashboard";
import SalesDashboard from "../components/dashboard/SalesDashboard";
import PurchasingDashboard from "../components/dashboard/PurchasingDashboard";
import AccountingDashboard from "../components/dashboard/AccountingDashboard";

function Dashboard() {
  const { user } = useAuth();

  switch (user?.role) {
    case "sales":
      return <SalesDashboard />;

    case "purchasing":
      return <PurchasingDashboard />;

    case "accounting":
      return <AccountingDashboard />;

    case "owner":
    case "admin":
    default:
      return <ManagementDashboard />;
  }
}

export default Dashboard;