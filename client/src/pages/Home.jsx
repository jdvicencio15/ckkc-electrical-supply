import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {

  const {
    user,
    isAuthenticated,
    logout
  } = useAuth();

  console.log("USER DATA:", user);

  return (
    <div>

      {isAuthenticated ? (
        <>
          <h1>
            Welcome, {user?.firstName} 👋
          </h1>

          <p>
            You are logged in.
          </p>


          <Link to="/dashboard">
            Go to Dashboard
          </Link>


          <button
            onClick={logout}
          >
            Logout
          </button>

        </>
      ) : (
        <>

          <h1>
            Welcome 👋
          </h1>

          <p>
            Please login to continue.
          </p>


          <Link to="/login">
            Login
          </Link>


          <Link to="/register">
            Register
          </Link>

        </>
      )}

    </div>
  );
}

export default Home;