
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-lg text-center">
        {isAuthenticated ? (
          <>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.firstName} 👋
            </h1>

            <p className="mt-2 text-gray-600">
              You are logged in.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/dashboard">
                <Button fullWidth>
                  Go to Dashboard
                </Button>
              </Link>

              <Button
                variant="danger"
                onClick={logout}
                fullWidth
              >
                Logout
              </Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome 👋
            </h1>

            <p className="mt-2 text-gray-600">
              Please login to continue.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/login" className="sm:flex-1">
                <Button fullWidth>
                  Login
                </Button>
              </Link>

              <Link to="/register" className="sm:flex-1">
                <Button
                  variant="secondary"
                  fullWidth
                >
                  Register
                </Button>
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default Home;

