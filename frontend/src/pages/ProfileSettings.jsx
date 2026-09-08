import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import userService from "../services/userService";
import toast from "react-hot-toast";

function PasswordInput({
  label,
  name,
  value,
  onChange,
  required = false,
  showPassword,
  onToggle,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-11 text-base text-slate-900 outline-none transition
            placeholder:text-slate-400
            focus:border-green-500 focus:ring-2 focus:ring-green-100
            dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100
            dark:placeholder:text-slate-500
            dark:focus:border-green-500 dark:focus:ring-green-950"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <FaEyeSlash className="h-4 w-4" />
          ) : (
            <FaEye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function ProfileSettings() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  const [savingProfile, setSavingProfile] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [changingPassword, setChangingPassword] = useState(false);

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    try {
      setChangingPassword(true);

      await userService.changeMyPassword(passwordData);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswordForm(false);

      toast.success("Password changed successfully.");
    } catch (error) {
      console.error("Failed to change password:", error);

      toast.error(
        error.response?.data?.message || "Failed to change password.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    try {
      setSavingProfile(true);

      const response = await userService.updateMyProfile(formData);

      updateUser(response.user);

      setFormData({
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        email: response.user.email,
      });

      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error("Failed to update profile:", error);

      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Profile Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your account information and security settings.
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <form onSubmit={handleProfileSubmit}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Profile Information
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Update your personal account information.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              label="First Name"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />

            <Input
              label="Last Name"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />

            <div className="md:col-span-2">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Security */}
      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Security
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your account password and security.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Password
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Change your account password.
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowPasswordForm((current) => !current)}
          >
            {showPasswordForm ? "Cancel" : "Change Password"}
          </Button>
        </div>

        {showPasswordForm && (
          <form
            onSubmit={handlePasswordSubmit}
            className="mt-5 space-y-5 border-t border-slate-200 pt-5 dark:border-slate-700"
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <PasswordInput
                label="Current Password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                showPassword={showPasswords.currentPassword}
                onToggle={() => togglePasswordVisibility("currentPassword")}
              />

              <div />

              <PasswordInput
                label="New Password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                showPassword={showPasswords.newPassword}
                onToggle={() => togglePasswordVisibility("newPassword")}
              />

              <PasswordInput
                label="Confirm New Password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                showPassword={showPasswords.confirmPassword}
                onToggle={() => togglePasswordVisibility("confirmPassword")}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? "Changing..." : "Update Password"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

export default ProfileSettings;
