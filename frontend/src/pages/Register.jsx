import { useState } from "react";
import authService from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

function Register() {
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
    <div className="w-full max-w-md">
      <Card className="w-full">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Create your account
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Register an account to access the CKKC system.
          </p>
        </div>

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
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-6 text-center dark:border-slate-800">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/"
              className="font-semibold text-green-600 transition-colors hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default Register;