import { useState } from "react";
import authService from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useSettings } from "../context/SettingsContext";

function Register() {
  const { businessName, systemName } = useSettings();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      await authService.register(formData);

      toast.success("Account created successfully!");

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
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
               {systemName?.charAt(0)?.toUpperCase() || "A"}
              </div>

              <div>
                <p className="text-lg font-semibold tracking-tight text-white">
                 {businessName}
                </p>

                <p className="text-xs text-slate-400">
                  Business Management System
                </p>
              </div>
            </div>

            {/* Welcome */}
            <div>
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
                Create
                <span className="block text-green-400">
                  your account.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
               Create your account and get access to the
{businessName} Business Management System.
              </p>
            </div>

            {/* Features */}
            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />

                <span className="text-sm text-slate-300">
                  Manage sales, purchasing and inventory
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />

                <span className="text-sm text-slate-300">
                  Monitor business and financial activity
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

          {/* Right Side - Register */}
          <div className="w-full">
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">

              {/* Header */}
              <div className="mb-7">
                <h2 className="text-xl font-semibold text-white">
                  Create your account
                </h2>

                <p className="mt-1.5 text-sm text-slate-400">
                Register an account to access the {systemName} system.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="First Name"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  required
                />

                <Input
                  label="Last Name"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                />

                <Button
                  type="submit"
                  loading={loading}
                  fullWidth
                  className="!border-0 !bg-gradient-to-r !from-green-500 !to-emerald-500 !text-white shadow-lg shadow-green-950/30 transition-all hover:!from-green-400 hover:!to-emerald-400"
                >
                  Create Account
                </Button>
              </form>

              {/* Login */}
              <div className="mt-7 border-t border-white/10 pt-6 text-center">
                <p className="text-sm text-slate-400">
                  Already have an account?{" "}
                  <Link
                    to="/"
                    className="font-semibold text-green-400 transition-colors hover:text-green-300"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-xs text-slate-500">
             © {new Date().getFullYear()} {businessName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;