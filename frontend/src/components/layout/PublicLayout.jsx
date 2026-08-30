import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function PublicLayout() {
  return (
   <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default PublicLayout;