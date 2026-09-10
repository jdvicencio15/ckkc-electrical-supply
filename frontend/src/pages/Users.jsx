import { useEffect, useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa";
import toast from "react-hot-toast";

import userService from "../services/userService";

import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";

import UserModal from "../components/users/UserModal";
import UserTable from "../components/users/UserTable";

function Users() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isUserModalOpen, setIsUserModalOpen] =
    useState(false);

  const [editingUser, setEditingUser] = useState(null);

  const [statusUser, setStatusUser] = useState(null);

  // =========================
  // Load Users
  // =========================
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await userService.getUsers();

      setUsers(response.data || []);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // =========================
  // Search + Filters
  // =========================
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchValue = search
        .toLowerCase()
        .trim();

      const fullName =
        `${user.firstName || ""} ${user.lastName || ""}`
          .toLowerCase();

      const email =
        user.email?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        fullName.includes(searchValue) ||
        email.includes(searchValue);

      const matchesRole =
        !roleFilter ||
        user.role === roleFilter;

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active" &&
          user.isActive === true) ||
        (statusFilter === "inactive" &&
          user.isActive === false);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  // =========================
  // Add User
  // =========================
  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  // =========================
  // Edit User
  // =========================
const handleEditUser = (user) => {
  setEditingUser(user);
  setIsUserModalOpen(true);
};

  const getUserId = (user) => user?._id || user?.id;

  // =========================
  // Create / Update User
  // =========================
  const handleSubmitUser = async (formData) => {
    try {
      setSubmitting(true);

      if (editingUser) {
        const response =
  await userService.updateUser(
    getUserId(editingUser),
    formData
  );

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            getUserId(user) === getUserId(editingUser)
              ? {
                  ...user,
                  ...response.user,
                }
              : user
          )
        );

        toast.success(
          response.message ||
            "User updated successfully."
        );
      } else {
        const response =
          await userService.createUser(
            formData
          );

        setUsers((prevUsers) => [
          response.user,
          ...prevUsers,
        ]);

        toast.success(
          response.message ||
            "User created successfully."
        );
      }

      setIsUserModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error(
        "Failed to save user:",
        error
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // Toggle Status
  // =========================
  const handleToggleStatus = (user) => {
    setStatusUser(user);
  };

  // =========================
  // Confirm Status Change
  // =========================
  const confirmToggleStatus = async () => {
    if (!statusUser) {
      return;
    }

    try {
      setSubmitting(true);

      const newStatus =
        !statusUser.isActive;

      const response =
        await userService.updateUserStatus(
           getUserId(statusUser),
          newStatus
        );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
        getUserId(user) === getUserId(statusUser)
            ? {
                ...user,
                isActive:
                  response.user.isActive,
              }
            : user
        )
      );

      toast.success(
        response.message ||
          (newStatus
            ? "User activated successfully."
            : "User deactivated successfully.")
      );

      setStatusUser(null);
    } catch (error) {
      console.error(
        "Failed to update user status:",
        error
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // Render
  // =========================
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Users
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage system users and their
            access.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleAddUser}
          className="sm:w-auto"
        >
          <FaPlus className="text-xs" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row">
        {/* Search */}
        <input
          type="search"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search users..."
          className="min-h-11 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-green-500 dark:focus:ring-green-950"
        />

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value)
          }
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-green-500 dark:focus:ring-green-950"
        >
          <option value="">
            All Roles
          </option>

          <option value="owner">
            Owner
          </option>

          <option value="admin">
            Admin
          </option>

          <option value="sales">
            Sales
          </option>

          <option value="purchasing">
            Purchasing
          </option>

          <option value="accounting">
            Accounting
          </option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-green-500 dark:focus:ring-green-950"
        >
          <option value="">
            All Status
          </option>

          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>
        </select>
      </div>

      {/* Users Table */}
      <UserTable
        users={[...filteredUsers].sort(
    (a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
  )}
        loading={loading}
        onEdit={handleEditUser}
        onToggleStatus={handleToggleStatus}
      />

      {/* Add / Edit User Modal */}
      {isUserModalOpen && (
        <UserModal
          user={editingUser}
          onSubmit={handleSubmitUser}
          onClose={() => {
            if (!submitting) {
              setIsUserModalOpen(false);
              setEditingUser(null);
            }
          }}
          submitting={submitting}
        />
      )}

      {/* Activate / Deactivate Confirmation */}
      <ConfirmModal
        isOpen={!!statusUser}
        onClose={() => {
          if (!submitting) {
            setStatusUser(null);
          }
        }}
        onConfirm={confirmToggleStatus}
        title={
          statusUser?.isActive
            ? "Deactivate User"
            : "Activate User"
        }
        message={
          statusUser?.isActive
            ? `Are you sure you want to deactivate ${statusUser?.firstName} ${statusUser?.lastName}? They will no longer be able to log in.`
            : `Are you sure you want to activate ${statusUser?.firstName} ${statusUser?.lastName}? They will be able to log in again.`
        }
        confirmText={
          statusUser?.isActive
            ? "Deactivate"
            : "Activate"
        }
        cancelText="Cancel"
        loading={submitting}
      />
    </div>
  );
}

export default Users;