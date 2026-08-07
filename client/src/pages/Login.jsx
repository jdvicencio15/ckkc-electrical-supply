import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";


function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submit clicked");

    const credentials = {
      email,
      password,
      rememberMe,
    };

    console.log(credentials);

    try {
      const response = await login(credentials);

      console.log("Login success:", response);

      navigate("/dashboard");
    } catch (error) {
       setError(
    error.response?.data?.message ||
    "Login failed"
  );
    }
  };

 return (
  <div>
    <h1>Login</h1>

    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>



      <div>
        <label>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember me
        </label>
      </div>

         {/* ERROR MESSAGE DITO */}
  {error && (
    <p className="text-red-500">
      {error}
    </p>
       )}


      <button type="submit">
        Login
       </button>

        <Link to="/forgot-password">
        Forgot Password?
       </Link>

    </form>
  </div>
);
}
export default Login;
