import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";

function Navbar() {
  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  return (
    <nav className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link
          to="/"
          className="text-xl font-bold text-slate-900 dark:text-white"
        >
          CKKC Electrical Supply
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-slate-600 dark:text-slate-400 sm:block">
                Hi, {user?.firstName}
              </span>

              <Link to="/dashboard">
                <Button size="sm">
                  Dashboard
                </Button>
              </Link>

              <Button
                variant="danger"
                size="sm"
                onClick={logout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/">
                <Button
                  variant="secondary"
                  size="sm"
                >
                  Login
                </Button>
              </Link>

              <Link to="/register">
                <Button size="sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;