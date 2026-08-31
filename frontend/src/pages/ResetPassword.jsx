import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import authService from "../services/authService";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (loading) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword({
        token,
        password,
        confirmPassword,
      });

      setMessage(response.message);

      setTimeout(() => {
        navigate("/");
      }, 2000);
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
            Reset your password
          </h1>

          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-slate-400">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="New Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your new password"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            placeholder="Confirm your new password"
            required
            error={
              password !== confirmPassword &&
              confirmPassword
                ? "Passwords do not match"
                : ""
            }
          />

          {message && (
            <p className="rounded-lg border border-green-100 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-400">
              {message}
            </p>
          )}

          {error && (
            <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </p>
          )}

          <Button
            type="submit"
            loading={loading}
            fullWidth
          >
            Reset Password
          </Button>
        </form>

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

export default ResetPassword;