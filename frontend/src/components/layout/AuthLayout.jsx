import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}

export default AuthLayout;