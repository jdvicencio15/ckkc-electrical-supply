import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import quotationService from "../services/quotationService";
import Toast from "../components/common/Toast";
import QuotationForm from "../components/quotations/QuotationForm";
import ConfirmModal from "../components/ui/ConfirmModal";

function Quotations() {
  const [quotations, setQuotations] = useState([]);

  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

const [searchTerm, setSearchTerm] = useState(
  searchParams.get("search") || ""
);
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const [showQuotationForm, setShowQuotationForm] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);

  const [deletingQuotation, setDeletingQuotation] = useState(null);
const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState({
    type: "success",
    message: "",
  });

  // LOAD QUOTATIONS
  const loadQuotations = async () => {
    const response = await quotationService.getQuotations();

    setQuotations(response.quotations || []);
  };

  // INITIAL LOAD
  useEffect(() => {
    const loadData = async () => {
      try {
        await loadQuotations();
      } catch (error) {
        console.error("Failed to load quotations:", error);

        setToast({
          type: "error",
          message:
            error.response?.data?.message ||
            "Failed to load quotations.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // AUTO CLOSE TOAST
  useEffect(() => {
    if (!toast.message) {
      return;
    }

    const timer = setTimeout(() => {
      setToast({
        type: "success",
        message: "",
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  // CREATE / UPDATE QUOTATION
  const handleSubmit = async (formData) => {
    try {
      setFormLoading(true);

      if (editingQuotation) {
        await quotationService.updateQuotation(
          editingQuotation._id,
          formData
        );

        setToast({
          type: "success",
          message: "Quotation updated successfully.",
        });
      } else {
        await quotationService.createQuotation(formData);

        setToast({
          type: "success",
          message: "Quotation created successfully.",
        });
      }

      await loadQuotations();

      setShowQuotationForm(false);
      setEditingQuotation(null);
    } catch (error) {
      console.error(
        editingQuotation
          ? "Failed to update quotation:"
          : "Failed to create quotation:",
        error
      );

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          (editingQuotation
            ? "Failed to update quotation."
            : "Failed to create quotation."),
      });
    } finally {
      setFormLoading(false);
    }
  };

  // OPEN CREATE FORM
  const openCreateForm = () => {
    setEditingQuotation(null);
    setShowQuotationForm(true);
  };

  // OPEN EDIT FORM
  const openEditForm = (quotation) => {
    setEditingQuotation(quotation);
    setShowQuotationForm(true);
  };

  // CLOSE FORM
  const closeQuotationForm = () => {
    if (formLoading) {
      return;
    }

    setShowQuotationForm(false);
    setEditingQuotation(null);
  };

  // DELETE QUOTATION
const handleDelete = (quotation) => {
  setDeletingQuotation(quotation);
};

const handleConfirmDelete = async () => {
  if (!deletingQuotation) {
    return;
  }

  try {
    setDeleting(true);

    await quotationService.deleteQuotation(
      deletingQuotation._id,
    );

    await loadQuotations();

    setDeletingQuotation(null);

    setToast({
      type: "success",
      message: "Quotation deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Failed to delete quotation:",
      error,
    );

    setToast({
      type: "error",
      message:
        error.response?.data?.message ||
        "Failed to delete quotation.",
    });
  } finally {
    setDeleting(false);
  }
};

const handleCancelDelete = () => {
  if (deleting) {
    return;
  }

  setDeletingQuotation(null);
};
  // CLOSE TOAST
  const closeToast = () => {
    setToast({
      type: "success",
      message: "",
    });
  };

  // FILTER QUOTATIONS
  const filteredQuotations = useMemo(() => {
    return quotations.filter((quotation) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        quotation.quotationNumber
          ?.toLowerCase()
          .includes(search) ||
        quotation.customerId?.name
          ?.toLowerCase()
          .includes(search) ||
        quotation.customerId?.customerCode
          ?.toLowerCase()
          .includes(search);

      const matchesCustomer =
        selectedCustomer === "all" ||
        quotation.customerId?._id === selectedCustomer;

      const matchesStatus =
        selectedStatus === "all" ||
        quotation.status === selectedStatus;

      const matchesDate =
        !selectedDate ||
        quotation.quotationDate?.startsWith(selectedDate);

      return (
        matchesSearch &&
        matchesCustomer &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    quotations,
    searchTerm,
    selectedCustomer,
    selectedStatus,
    selectedDate,
  ]);

  return (
    <>
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={closeToast}
      />

      <ConfirmModal
  isOpen={!!deletingQuotation}
  onClose={handleCancelDelete}
  onConfirm={handleConfirmDelete}
  title="Delete Quotation"
  message={`Are you sure you want to delete quotation "${
    deletingQuotation?.quotationNumber ||
    "this quotation"
  }"? This action cannot be undone.`}
  confirmText="Delete"
  cancelText="Cancel"
  loading={deleting}
  loadingText="Deleting..."
/>


      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Quotations
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Create and manage customer quotations.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
          >
            + New Quotation
          </button>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row dark:border-slate-800 dark:bg-slate-900">
          <input
            type="search"
            placeholder="Search quotations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <select
            value={selectedCustomer}
            onChange={(e) =>
              setSelectedCustomer(e.target.value)
            }
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">All Customers</option>

            {[
              ...new Map(
                quotations
                  .filter(
                    (quotation) => quotation.customerId
                  )
                  .map((quotation) => [
                    quotation.customerId._id,
                    quotation.customerId,
                  ])
              ).values(),
            ].map((customer) => (
              <option
                key={customer._id}
                value={customer._id}
              >
                {customer.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value)
            }
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) =>
              setSelectedDate(e.target.value)
            }
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          />
        </div>

        {/* QUOTATIONS TABLE */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3 font-semibold">
                    Quotation No.
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Customer
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Items
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Total
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Quotation Date
                  </th>

                  <th className="px-6 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      Loading quotations...
                    </td>
                  </tr>
                ) : filteredQuotations.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      No quotations found.
                    </td>
                  </tr>
                ) : (
                 [...filteredQuotations]
  .sort((a, b) => {
    const sequenceA = Number(a.quotationNumber?.split("-").pop());
    const sequenceB = Number(b.quotationNumber?.split("-").pop());

    return sequenceB - sequenceA;
  })
  .map((quotation) => (
                    <tr
                      key={quotation._id}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      {/* QUOTATION NUMBER */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {quotation.quotationNumber}
                        </p>
                      </td>

                      {/* CUSTOMER */}
                     <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {quotation.customerId?.name || "—"}
                      </td>

                      {/* ITEMS */}
                     <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {quotation.items?.length || 0}
                      </td>

                      {/* TOTAL */}
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                        ₱
                        {Number(
                          quotation.total || 0
                        ).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            quotation.status === "draft"
                              ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              : quotation.status === "sent"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : quotation.status === "accepted"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : quotation.status === "rejected"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : quotation.status === "expired"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {quotation.status
                            ? quotation.status
                                .charAt(0)
                                .toUpperCase() +
                              quotation.status.slice(1)
                            : "—"}
                        </span>
                      </td>

                      {/* DATE */}
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {quotation.quotationDate
                          ? new Date(
                              quotation.quotationDate
                            ).toLocaleDateString("en-PH")
                          : "—"}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(quotation)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                            aria-label={`Edit ${quotation.quotationNumber}`}
                          >
                            <FaEdit className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(quotation)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                            aria-label={`Delete ${quotation.quotationNumber}`}
                          >
                            <FaTrash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="border-t border-slate-200 px-6 py-3 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredQuotations.length} of{" "}
              {quotations.length} quotations
            </p>
          </div>
        </div>

        {/* QUOTATION FORM */}
        {showQuotationForm && (
          <QuotationForm
            initialData={editingQuotation}
            onSubmit={handleSubmit}
            onClose={closeQuotationForm}
            submitting={formLoading}
          />
        )}
      </div>
    </>
  );
}

export default Quotations;