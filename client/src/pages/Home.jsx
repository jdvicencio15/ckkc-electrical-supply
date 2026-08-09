import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {isAuthenticated ? (
        <>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.firstName} 👋
          </h1>

          <p className="mt-2 text-gray-600">You are logged in.</p>

          <div className="mt-4 flex gap-3">
            <Link to="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>

            <Button variant="danger" onClick={logout}>
              Logout
            </Button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-gray-900">Welcome 👋</h1>

          <p className="mt-2 text-gray-600">Please login to continue.</p>

          <div className="mt-4 flex gap-3">
            <Link to="/login">
              <Button>Login</Button>
            </Link>

            <Link to="/register">
              <Button variant="secondary">Register</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
