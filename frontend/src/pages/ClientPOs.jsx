import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

import clientPOService from "../services/clientPOService";
import Toast from "../components/common/Toast";
import ConfirmModal from "../components/ui/ConfirmModal";
import ClientPOForm from "../components/clientPO/ClientPOForm";
import { useSettings } from "../context/SettingsContext";
import { formatCurrency } from "../utils/currency";

import { hasPermission } from "../utils/permissions";
import { useAuth } from "../context/AuthContext";

function ClientPO() {
  const { user } = useAuth();

  const canViewClientPO = hasPermission(user?.role, "clientPO", "view");

  const canCreateClientPO = hasPermission(user?.role, "clientPO", "create");

  const canEditClientPO = hasPermission(user?.role, "clientPO", "edit");

  const canDeleteClientPO = hasPermission(user?.role, "clientPO", "delete");

  const [clientPOs, setClientPOs] = useState([]);

  const { settings } = useSettings();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );

  const [selectedCustomer, setSelectedCustomer] = useState("all");

  const [selectedStatus, setSelectedStatus] = useState("all");

  const [selectedDate, setSelectedDate] = useState("");

  const [showClientPOForm, setShowClientPOForm] = useState(false);

  const [editingClientPO, setEditingClientPO] = useState(null);

  const [deletingClientPO, setDeletingClientPO] = useState(null);

  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState({
    type: "success",
    message: "",
  });

  // ================================
  // LOAD CLIENT POS
  // ================================

  const loadClientPOs = async () => {
    const response = await clientPOService.getClientPOs();

    setClientPOs(response.clientPOs || []);
  };

  // ================================
  // INITIAL LOAD
  // ================================

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadClientPOs();
      } catch (error) {
        console.error("Failed to load Client POs:", error);

        setToast({
          type: "error",
          message:
            error.response?.data?.message || "Failed to load Client POs.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ================================
  // AUTO CLOSE TOAST
  // ================================

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

  // ================================
  // CREATE / UPDATE CLIENT PO
  // ================================

  const handleSubmit = async (formData) => {
    try {
      setFormLoading(true);

      if (editingClientPO) {
        await clientPOService.updateClientPO(editingClientPO._id, formData);

        setToast({
          type: "success",
          message: "Client PO updated successfully.",
        });
      } else {
        await clientPOService.createClientPO(formData);

        setToast({
          type: "success",
          message: "Client PO created successfully.",
        });
      }

      await loadClientPOs();

      setShowClientPOForm(false);
      setEditingClientPO(null);
    } catch (error) {
      console.error(
        editingClientPO
          ? "Failed to update Client PO:"
          : "Failed to create Client PO:",
        error,
      );

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          (editingClientPO
            ? "Failed to update Client PO."
            : "Failed to create Client PO."),
      });
    } finally {
      setFormLoading(false);
    }
  };

  // ================================
  // OPEN CREATE FORM
  // ================================

  const openCreateForm = () => {
    setEditingClientPO(null);
    setShowClientPOForm(true);
  };

  // ================================
  // OPEN EDIT FORM
  // ================================

  const openEditForm = (clientPO) => {
    setEditingClientPO(clientPO);
    setShowClientPOForm(true);
  };

  // ================================
  // CLOSE FORM
  // ================================

  const closeClientPOForm = () => {
    if (formLoading) {
      return;
    }

    setShowClientPOForm(false);
    setEditingClientPO(null);
  };

  // ================================
  // DELETE CLIENT PO
  // ================================

  const handleDelete = (clientPO) => {
    setDeletingClientPO(clientPO);
  };

  const handleConfirmDelete = async () => {
    if (!deletingClientPO) {
      return;
    }

    try {
      setDeleting(true);

      await clientPOService.deleteClientPO(deletingClientPO._id);

      await loadClientPOs();

      setDeletingClientPO(null);

      setToast({
        type: "success",
        message: "Client PO deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete Client PO:", error);

      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to delete Client PO.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (deleting) {
      return;
    }

    setDeletingClientPO(null);
  };

  // ================================
  // CLOSE TOAST
  // ================================

  const closeToast = () => {
    setToast({
      type: "success",
      message: "",
    });
  };

  // ================================
  // FILTER CLIENT POS
  // ================================

  const filteredClientPOs = useMemo(() => {
    return clientPOs.filter((clientPO) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        clientPO.poNumber?.toLowerCase().includes(search) ||
        clientPO.customerId?.name?.toLowerCase().includes(search) ||
        clientPO.customerId?.customerCode?.toLowerCase().includes(search);

      const matchesCustomer =
        selectedCustomer === "all" ||
        clientPO.customerId?._id === selectedCustomer;

      const matchesStatus =
        selectedStatus === "all" || clientPO.status === selectedStatus;

      const matchesDate =
        !selectedDate || clientPO.poDate?.startsWith(selectedDate);

      return matchesSearch && matchesCustomer && matchesStatus && matchesDate;
    });
  }, [clientPOs, searchTerm, selectedCustomer, selectedStatus, selectedDate]);

  // ================================
  // STATUS STYLING
  // ================================

  const getStatusClass = (status) => {
    switch (status) {
      case "draft":
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";

      case "received":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";

      case "confirmed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

      case "partially_fulfilled":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";

      case "fulfilled":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const formatStatus = (status) => {
    if (!status) {
      return "—";
    }

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const isTerminalClientPO = (status) => {
  return ["fulfilled", "cancelled"].includes(status);
};


  return (
    <>
      {/* TOAST */}
      <Toast type={toast.type} message={toast.message} onClose={closeToast} />

      {/* DELETE CONFIRMATION */}
      <ConfirmModal
        isOpen={!!deletingClientPO}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Client PO"
        message={`Are you sure you want to delete Client PO "${
          deletingClientPO?.poNumber || "this Client PO"
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
        loadingText="Deleting..."
      />

      <div className="space-y-6">
        {/* ================================
            PAGE HEADER
        ================================= */}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Client Purchase Orders
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Create and manage customer purchase orders.
            </p>
          </div>

          {canCreateClientPO && (
            <button
              type="button"
              onClick={openCreateForm}
              className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              + New Client PO
            </button>
          )}
        </div>

        {/* ================================
            FILTERS
        ================================= */}

        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row dark:border-slate-800 dark:bg-slate-900">
          {/* SEARCH */}

          <input
            type="search"
            placeholder="Search Client POs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          {/* CUSTOMER */}

          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">All Customers</option>

            {[
              ...new Map(
                clientPOs
                  .filter((clientPO) => clientPO.customerId)
                  .map((clientPO) => [
                    clientPO.customerId._id,
                    clientPO.customerId,
                  ]),
              ).values(),
            ].map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.name}
              </option>
            ))}
          </select>

          {/* STATUS */}

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="received">Received</option>
            <option value="processing">Processing</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* DATE */}

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          />
        </div>

        {/* ================================
            CLIENT PO TABLE
        ================================= */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3 font-semibold">Client PO No.</th>

                  <th className="px-6 py-3 font-semibold">Customer</th>

                  <th className="px-6 py-3 font-semibold">Items</th>

                  <th className="px-6 py-3 text-right font-semibold">Total</th>

                  <th className="px-6 py-3 font-semibold">Status</th>

                  <th className="px-6 py-3 font-semibold">PO Date</th>

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
                      Loading Client POs...
                    </td>
                  </tr>
                ) : filteredClientPOs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      No Client POs found.
                    </td>
                  </tr>
                ) : (
                  [...filteredClientPOs]
                    .sort((a, b) => {
                      const sequenceA = Number(a.poNumber?.split("-").pop());

                      const sequenceB = Number(b.poNumber?.split("-").pop());

                      return sequenceB - sequenceA;
                    })
                    .map((clientPO) => (
                      <tr
                        key={clientPO._id}
                        className="border-t border-slate-100 dark:border-slate-800"
                      >
                        {/* PO NUMBER */}

                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {clientPO.poNumber || "—"}
                          </p>
                        </td>

                        {/* CUSTOMER */}

                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {clientPO.customerId?.name || "—"}
                        </td>

                        {/* ITEMS */}

                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {clientPO.items?.length || 0}
                        </td>

                        {/* TOTAL */}

                        <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(
                            clientPO.totalAmount || clientPO.total || 0,
                            settings?.currency,
                          )}
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                              clientPO.status,
                            )}`}
                          >
                            {formatStatus(clientPO.status)}
                          </span>
                        </td>

                        {/* DATE */}

                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {clientPO.poDate
                            ? new Date(clientPO.poDate).toLocaleDateString(
                                "en-PH",
                              )
                            : "—"}
                        </td>

                       {/* ACTIONS */}

<td className="px-6 py-4">
  <div className="flex justify-end gap-2">

    {/* VIEW — always available */}
    {canViewClientPO && (
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        aria-label={`View ${clientPO.poNumber}`}
      >
        <FaEye className="h-3.5 w-3.5" />
      </button>
    )}

    {/* EDIT — hidden for terminal Client POs */}
    {canEditClientPO &&
      !isTerminalClientPO(clientPO.status) && (
        <button
          type="button"
          onClick={() => openEditForm(clientPO)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label={`Edit ${clientPO.poNumber}`}
        >
          <FaEdit className="h-3.5 w-3.5" />
        </button>
      )}

    {/* DELETE — hidden for terminal Client POs */}
    {canDeleteClientPO &&
      !isTerminalClientPO(clientPO.status) && (
        <button
          type="button"
          onClick={() => handleDelete(clientPO)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
          aria-label={`Delete ${clientPO.poNumber}`}
        >
          <FaTrash className="h-3.5 w-3.5" />
        </button>
      )}

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
              Showing {filteredClientPOs.length} of {clientPOs.length} Client
              POs
            </p>
          </div>
        </div>

        {/* ================================
            CLIENT PO FORM
        ================================= */}

        {showClientPOForm && (
          <ClientPOForm
            initialData={editingClientPO}
            onSubmit={handleSubmit}
            onClose={closeClientPOForm}
            submitting={formLoading}
          />
        )}
      </div>
    </>
  );
}

export default ClientPO;
