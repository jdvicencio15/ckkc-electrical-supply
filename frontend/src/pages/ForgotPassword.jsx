import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await authService.forgotPassword(email);

      setMessage(response.message);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Card className="w-full">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Forgot your password?
          </h1>

          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-slate-400">
            Enter your email address and we'll help you reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            Send Reset Link
          </Button>
        </form>

        {message && (
          <p className="mt-4 rounded-lg border border-green-100 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-400">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 border-t border-gray-100 pt-6 text-center dark:border-slate-800">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm font-semibold text-green-600 transition-colors hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
          >
            Back to Sign In
          </button>
        </div>
      </Card>
    </div>
  );
}

export default ForgotPassword;