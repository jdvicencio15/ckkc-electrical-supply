import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
    const response = await authService.forgotPassword(email);

      setResetToken(response.resetToken);
      setMessage(response.message);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = async () => {
    await navigator.clipboard.writeText(resetToken);
    setMessage("Reset token copied!");
  };

  const handleContinue = () => {
    navigate("/reset-password");
  };

  return (
    <div>
      <h1>Forgot Password?</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">
            Email Address
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading
            ? "Generating..."
            : "Send Reset Token"}
        </button>
      </form>

      {message && (
        <p>{message}</p>
      )}

      {error && (
        <p>{error}</p>
      )}

      {resetToken && (
        <div>
          <p>Reset Token:</p>

          <input
            type="text"
            value={resetToken}
            readOnly
          />

          <button
            type="button"
            onClick={handleCopyToken}
          >
            Copy Token
          </button>

          <button
            type="button"
            onClick={handleContinue}
          >
            Continue to Reset Password
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => navigate("/login")}
      >
        Back to Login
      </button>
    </div>
  );
}

export default ForgotPassword;