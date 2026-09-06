import { useEffect, useState } from "react";
import { FaBook, FaPlus, FaExclamationTriangle } from "react-icons/fa";

import JournalEntryForm from "../../components/accounting/JournalEntryForm";
import JournalEntryTable from "../../components/accounting/JournalEntryTable";
import accountingApi from "../../api/accountingApi";
import Button from "../../components/ui/Button";
import JournalEntryDetails from "../../components/accounting/JournalEntryDetails";

import Modal from "../../components/ui/Modal";

function JournalEntries() {
  const [journalEntries, setJournalEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [viewingEntry, setViewingEntry] = useState(null);

  const [deletingEntry, setDeletingEntry] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [journalResponse, accountsResponse] = await Promise.all([
        accountingApi.getJournalEntries(),
        accountingApi.getAccounts(),
      ]);

      setJournalEntries(journalResponse?.data || journalResponse || []);

      setAccounts(accountsResponse?.data || accountsResponse || []);
    } catch (err) {
      console.error("Failed to fetch accounting data:", err);

      setError(
        err?.response?.data?.message || "Failed to load journal entries.",
      );
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const handleOpenCreate = () => {
    setEditingEntry(null);
    setShowForm(true);
    setError("");
  };

  const handleOpenEdit = (journalEntry) => {
    setEditingEntry(journalEntry);
    setShowForm(true);
    setError("");
  };

  const handleCloseForm = () => {
    if (submitting) {
      return;
    }

    setShowForm(false);
    setEditingEntry(null);
  };

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      setError("");

      if (editingEntry) {
        await accountingApi.updateJournalEntry(editingEntry._id, payload);

        showSuccess("Journal entry updated successfully.");
      } else {
        await accountingApi.createJournalEntry(payload);

        showSuccess("Journal entry created successfully.");
      }

      setShowForm(false);
      setEditingEntry(null);

      await fetchData();
    } catch (err) {
      console.error("Failed to save journal entry:", err);

      const message =
        err?.response?.data?.message || "Failed to save journal entry.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

 const handleDelete = (journalEntry) => {
  setDeletingEntry(journalEntry);
};

  const handleConfirmDelete = async () => {
  if (!deletingEntry) return;

  try {
    setDeleting(true);
    setError("");

    await accountingApi.deleteJournalEntry(
      deletingEntry._id
    );

    await fetchData();

    setDeletingEntry(null);

    showSuccess("Journal entry deleted successfully.");
  } catch (err) {
    console.error(err);

    setError(
      err.response?.data?.message ||
        "Failed to delete journal entry."
    );
  } finally {
    setDeleting(false);
  }
};

  const handleCancelDelete = () => {
  if (deleting) return;

  setDeletingEntry(null);
};

  const handleView = (journalEntry) => {
    setViewingEntry(journalEntry);
  };

  const handleCloseView = () => {
    setViewingEntry(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <FaBook className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Journal Entries
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Record and manage accounting journal entries.
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={handleOpenCreate}
          disabled={loading}
        >
          <FaPlus className="mr-2 h-3.5 w-3.5" />
          Add Journal Entry
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/20">
          <FaExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              Something went wrong
            </p>

            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Success */}
      {successMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/50 dark:bg-green-950/20">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            {successMessage}
          </p>
        </div>
      )}

      {/* Empty COA warning */}
      {!loading &&
        accounts.filter((account) => account.isActive).length === 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 dark:border-amber-900/50 dark:bg-amber-950/20">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              No active accounts are available.
            </p>

            <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
              Create at least two active accounts in Chart of Accounts before
              recording a journal entry.
            </p>
          </div>
        )}

      {/* Table */}
      <JournalEntryTable
        journalEntries={journalEntries}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Form Modal */}
      {showForm && (
        <JournalEntryForm
          journalEntry={editingEntry}
          accounts={accounts}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
          submitting={submitting}
        />
      )}

     {viewingEntry && (
  <JournalEntryDetails
    journalEntry={viewingEntry}
    onClose={handleCloseView}
  />
)}

{deletingEntry && (
  <Modal
    isOpen={true}
    onClose={deleting ? undefined : handleCancelDelete}
    title="Delete Journal Entry"
    size="sm"
  >
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="mt-1 text-red-500">
          <FaExclamationTriangle />
        </div>

        <div>
          <p className="font-medium text-slate-900 dark:text-white">
            Delete this journal entry?
          </p>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              {deletingEntry.reference ||
                "this journal entry"}
            </span>
            ? This action cannot be undone.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={handleCancelDelete}
          disabled={deleting}
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="danger"
          onClick={handleConfirmDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  </Modal>
      )}
    </div>
  );
}

export default JournalEntries;
