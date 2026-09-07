import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import chartOfAccountsService from "../../services/chartOfAccountsService";
import ChartOfAccountsForm from "../../components/accounting/ChartOfAccountsForm";
import ChartOfAccountsTable from "../../components/accounting/ChartOfAccountsTable";
import Toast from "../../components/common/Toast";
import ConfirmModal from "../../components/ui/ConfirmModal";

function ChartOfAccounts() {
  const [searchParams] = useSearchParams();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

 const [searchTerm, setSearchTerm] = useState(
  searchParams.get("search") || ""
);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const [deactivatingAccount, setDeactivatingAccount] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const [toast, setToast] = useState({
    type: "success",
    message: "",
  });

  // =========================
  // Load Accounts
  // =========================
  const loadAccounts = async () => {
    const response = await chartOfAccountsService.getAccounts();

    setAccounts(response.data || []);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadAccounts();
      } catch (error) {
        console.error("Failed to load accounts:", error);

        setToast({
          type: "error",
          message:
            error.response?.data?.message ||
            "Failed to load accounts.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // =========================
  // Toast Auto Close
  // =========================
  useEffect(() => {
    if (!toast.message) return;

    const timer = setTimeout(() => {
      setToast({
        type: "success",
        message: "",
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  // =========================
  // Create Account
  // =========================
  const handleCreate = async (formData) => {
    try {
      setFormLoading(true);

      await chartOfAccountsService.createAccount(formData);

      await loadAccounts();

      setShowAccountForm(false);

      setToast({
        type: "success",
        message: "Account created successfully.",
      });
    } catch (error) {
      console.error("Failed to create account:", error);

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to create account.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // =========================
  // Update Account
  // =========================
  const handleUpdate = async (formData) => {
    try {
      setFormLoading(true);

      await chartOfAccountsService.updateAccount(
        editingAccount._id,
        formData
      );

      await loadAccounts();

      setEditingAccount(null);
      setShowAccountForm(false);

      setToast({
        type: "success",
        message: "Account updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update account:", error);

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to update account.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // =========================
  // Deactivate Account
  // =========================
 const handleDelete = (account) => {
  setDeactivatingAccount(account);
};

const handleConfirmDelete = async () => {
  if (!deactivatingAccount) {
    return;
  }

  try {
    setDeactivating(true);

    await chartOfAccountsService.deleteAccount(
      deactivatingAccount._id
    );

    await loadAccounts();

    setDeactivatingAccount(null);

    setToast({
      type: "success",
      message: "Account deactivated successfully.",
    });
  } catch (error) {
    console.error(
      "Failed to deactivate account:",
      error
    );

    setToast({
      type: "error",
      message:
        error.response?.data?.message ||
        "Failed to deactivate account.",
    });
  } finally {
    setDeactivating(false);
  }
};

const handleCancelDelete = () => {
  if (deactivating) {
    return;
  }

  setDeactivatingAccount(null);
};

  // =========================
  // Form Controls
  // =========================
  const openCreateForm = () => {
    setEditingAccount(null);
    setShowAccountForm(true);
  };

  const openEditForm = (account) => {
    setEditingAccount(account);
    setShowAccountForm(true);
  };

  const closeAccountForm = () => {
    if (formLoading) return;

    setShowAccountForm(false);
    setEditingAccount(null);
  };

  const closeToast = () => {
    setToast({
      type: "success",
      message: "",
    });
  };

  // =========================
  // Filtering
  // =========================
  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        account.accountCode
          ?.toLowerCase()
          .includes(search) ||
        account.accountName
          ?.toLowerCase()
          .includes(search) ||
        account.description
          ?.toLowerCase()
          .includes(search);

      const matchesType =
        selectedType === "all" ||
        account.accountType === selectedType;

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" &&
          account.isActive) ||
        (selectedStatus === "inactive" &&
          !account.isActive);

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    accounts,
    searchTerm,
    selectedType,
    selectedStatus,
  ]);

  return (
    <>
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={closeToast}
      />


      <ConfirmModal
  isOpen={!!deactivatingAccount}
  onClose={handleCancelDelete}
  onConfirm={handleConfirmDelete}
  title="Deactivate Account"
  message={`Are you sure you want to deactivate "${
    deactivatingAccount?.accountName || "this account"
  }"?`}
  confirmText="Deactivate"
  cancelText="Cancel"
  loading={deactivating}
  loadingText="Deactivating..."
/>

      <div className="space-y-6">
        {/* =========================
            Header
        ========================= */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Chart of Accounts
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage your company's accounting
              accounts and account structure.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
          >
            + Add Account
          </button>
        </div>

        {/* =========================
            Filters
        ========================= */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row dark:border-slate-800 dark:bg-slate-900">
          <input
            type="search"
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <select
            value={selectedType}
            onChange={(e) =>
              setSelectedType(e.target.value)
            }
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">All Types</option>
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
            <option value="equity">Equity</option>
            <option value="revenue">Revenue</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value)
            }
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* =========================
            Table
        ========================= */}
        <ChartOfAccountsTable
          accounts={filteredAccounts}
          loading={loading}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />

        {/* =========================
            Form
        ========================= */}
        {showAccountForm && (
          <ChartOfAccountsForm
            account={editingAccount}
            accounts={accounts}
            onSubmit={
              editingAccount
                ? handleUpdate
                : handleCreate
            }
            onClose={closeAccountForm}
            submitting={formLoading}
          />
        )}
      </div>
    </>
  );
}

export default ChartOfAccounts;