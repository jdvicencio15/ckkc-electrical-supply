import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;