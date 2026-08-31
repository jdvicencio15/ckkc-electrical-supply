import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

function ProfileSettings() {
  const { user } = useAuth();

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
            defaultValue={user?.firstName || ""}
          />

          <Input
            label="Last Name"
            type="text"
            name="lastName"
            defaultValue={user?.lastName || ""}
          />

          <div className="md:col-span-2">
            <Input
              label="Email Address"
              type="email"
              name="email"
              defaultValue={user?.email || ""}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button>
            Save Changes
          </Button>
        </div>
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

          <Button variant="secondary">
            Change Password
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default ProfileSettings;