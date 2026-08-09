
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");
    setError("");
    setResetToken("");

    try {
      const response = await authService.forgotPassword(email);

      setResetToken(response.resetToken);
      setMessage(response.message);
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = async () => {
    await navigator.clipboard.writeText(resetToken);
    setMessage("Reset token copied!");
  };

  const handleContinue = () => {
    navigate(`/reset-password/${resetToken}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card
        title="Forgot Password?"
        className="w-full max-w-md"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <Button
            type="submit"
            loading={loading}
            fullWidth
          >
            Send Reset Token
          </Button>
        </form>

        {message && (
          <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {resetToken && (
          <div className="mt-5 space-y-3">
            <Input
              label="Reset Token"
              type="text"
              name="resetToken"
              value={resetToken}
              disabled
            />

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={handleCopyToken}
            >
              Copy Token
            </Button>

            <Button
              type="button"
              fullWidth
              onClick={handleContinue}
            >
              Continue to Reset Password
            </Button>
          </div>
        )}

        <div className="mt-5 text-center">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => navigate("/login")}
          >
            Back to Login
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default ForgotPassword;

