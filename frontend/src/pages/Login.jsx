import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    const credentials = {
      email,
      password,
      rememberMe,
    };

    try {
      await login(credentials);

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-green-600 text-xl font-bold text-white shadow-sm">
            C
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            CKKC Electrical Supply
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            Business Management System
          </p>
        </div>

        {/* Login Card */}
        <Card className="w-full">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Welcome back
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Sign in to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />

                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-green-600 transition-colors hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              >
                Forgot Password?
              </Link>
            </div>

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
              Sign In
            </Button>
          </form>

          {/* Register */}
          <div className="mt-6 border-t border-gray-100 pt-6 text-center dark:border-slate-800">
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-green-600 transition-colors hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              >
                Create an account
              </Link>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400 dark:text-slate-500">
          © 2026 CKKC Electrical Supply. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;