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
        navigate("/login");
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card>
        <h1 className="mb-2 text-2xl font-bold">
          Reset Password
        </h1>

        <p className="mb-6 text-sm text-gray-600">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {message}
            </p>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
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

export default ResetPassword;

