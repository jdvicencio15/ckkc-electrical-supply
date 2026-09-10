
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import authService from "../services/authService";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

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
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-10 text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-green-600/20 blur-3xl" />

        <div className="absolute -bottom-40 left-1/4 h-[32rem] w-[32rem] rounded-full bg-emerald-700/15 blur-3xl" />

        <div className="absolute right-[-10rem] top-1/4 h-[28rem] w-[28rem] rounded-full bg-green-500/10 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_35%)]" />
      </div>

      {/* Main Content */}
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_460px] lg:gap-20">

          {/* Left Side */}
          <div className="mx-auto w-full max-w-xl lg:mx-0">

            {/* Brand */}
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-green-400/30 bg-green-500/15 text-lg font-bold text-green-400 shadow-lg shadow-green-950/20">
                C
              </div>

              <div>
                <p className="text-lg font-semibold tracking-tight text-white">
                  CKKC Electrical Supply
                </p>

                <p className="text-xs text-slate-400">
                  Business Management System
                </p>
              </div>
            </div>

            {/* Welcome */}
            <div>
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
                Secure
                <span className="block text-green-400">
                  your account.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
                Create a new password to secure your CKKC Business Management
                System account.
              </p>
            </div>

            {/* Features */}
            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />

                <span className="text-sm text-slate-300">
                  Keep your account secure
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />

                <span className="text-sm text-slate-300">
                  Use a strong and unique password
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />

                <span className="text-sm text-slate-300">
                  Secure role-based access
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - Reset Password */}
          <div className="w-full">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">

              {/* Header */}
              <div className="mb-7">
                <h2 className="text-xl font-semibold text-white">
                  Reset your password
                </h2>

                <p className="mt-1.5 text-sm text-slate-400">
                  Enter your new password below.
                </p>
              </div>

              {/* Form */}
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
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  error={
                    password !== confirmPassword && confirmPassword
                      ? "Passwords do not match"
                      : ""
                  }
                />

                {message && (
                  <p className="rounded-lg border border-green-900/40 bg-green-950/30 p-3 text-sm text-green-400">
                    {message}
                  </p>
                )}

                {error && (
                  <p className="rounded-lg border border-red-900/40 bg-red-950/30 p-3 text-sm text-red-400">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  loading={loading}
                  fullWidth
                  className="!border-0 !bg-gradient-to-r !from-green-500 !to-emerald-500 !text-white shadow-lg shadow-green-950/30 transition-all hover:!from-green-400 hover:!to-emerald-400"
                >
                  Reset Password
                </Button>
              </form>

              {/* Back to Login */}
              <div className="mt-7 border-t border-white/10 pt-6 text-center">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="text-sm font-semibold text-green-400 transition-colors hover:text-green-300"
                >
                  Back to Sign In
                </button>
              </div>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-xs text-slate-500">
              © 2026 CKKC Electrical Supply. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
