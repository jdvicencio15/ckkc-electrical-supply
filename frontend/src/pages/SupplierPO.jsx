import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaEdit, FaTrash, FaEye, FaRocket } from "react-icons/fa";

import supplierPOService from "../services/supplierPOService";

import Toast from "../components/common/Toast";
import ConfirmModal from "../components/ui/ConfirmModal";

import SupplierPOForm from "../components/supplierPO/SupplierPOForm";
import SupplierPOView from "../components/supplierPO/SupplierPOView";

import { useSettings } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";
import { hasPermission } from "../utils/permissions";
import { formatCurrency } from "../utils/currency";

function SupplierPO() {
  const { user } = useAuth();
  const { settings } = useSettings();

  const [searchParams] = useSearchParams();

  // ================================
  // PERMISSIONS
  // ================================

  const canViewSupplierPO = hasPermission(user?.role, "supplierPO", "view");

  const canCreateSupplierPO = hasPermission(user?.role, "supplierPO", "create");

  const canEditSupplierPO = hasPermission(user?.role, "supplierPO", "edit");

  const canDeleteSupplierPO = hasPermission(user?.role, "supplierPO", "delete");

  const canReleaseSupplierPO = hasPermission(
    user?.role,
    "supplierPO",
    "release",
  );

  // ================================
  // DATA
  // ================================

  const [supplierPOs, setSupplierPOs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [releasingSupplierPO, setReleasingSupplierPO] = useState(null);
  const [releasing, setReleasing] = useState(false);

  // ================================
  // FILTERS
  // ================================

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );

  const [selectedSupplier, setSelectedSupplier] = useState("all");

  const [selectedStatus, setSelectedStatus] = useState("all");

  const [selectedDate, setSelectedDate] = useState("");

  // ================================
  // MODALS
  // ================================

  const [showSupplierPOForm, setShowSupplierPOForm] = useState(false);

  const [editingSupplierPO, setEditingSupplierPO] = useState(null);

  const [viewingSupplierPO, setViewingSupplierPO] = useState(null);

  const [deletingSupplierPO, setDeletingSupplierPO] = useState(null);

  const [deleting, setDeleting] = useState(false);

  // ================================
  // TOAST
  // ================================

  const [toast, setToast] = useState({
    type: "success",
    message: "",
  });

  // ================================
  // LOAD SUPPLIER POS
  // ================================

  const loadSupplierPOs = async () => {
    const response = await supplierPOService.getSupplierPOs();

    setSupplierPOs(response.supplierPOs || []);
  };

  // ================================
  // INITIAL LOAD
  // ================================

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadSupplierPOs();
      } catch (error) {
        console.error("Failed to load Supplier POs:", error);

        setToast({
          type: "error",
          message:
            error.response?.data?.message || "Failed to load Supplier POs.",
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
  // CREATE / UPDATE
  // ================================

  const handleSubmit = async (formData) => {
    try {
      setFormLoading(true);

      if (editingSupplierPO) {
        await supplierPOService.updateSupplierPO(
          editingSupplierPO._id,
          formData,
        );

        setToast({
          type: "success",
          message: "Supplier PO updated successfully.",
        });
      } else {
        await supplierPOService.createSupplierPO(formData);

        setToast({
          type: "success",
          message: "Supplier PO created successfully.",
        });
      }

      await loadSupplierPOs();

      setShowSupplierPOForm(false);
      setEditingSupplierPO(null);
    } catch (error) {
      console.error(
        editingSupplierPO
          ? "Failed to update Supplier PO:"
          : "Failed to create Supplier PO:",
        error,
      );

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          (editingSupplierPO
            ? "Failed to update Supplier PO."
            : "Failed to create Supplier PO."),
      });
    } finally {
      setFormLoading(false);
    }
  };

  // ================================
  // CREATE
  // ================================

  const openCreateForm = () => {
    setEditingSupplierPO(null);
    setShowSupplierPOForm(true);
  };

  // ================================
  // EDIT
  // ================================

  const openEditForm = (supplierPO) => {
    setEditingSupplierPO(supplierPO);
    setShowSupplierPOForm(true);
  };

  // ================================
  // VIEW
  // ================================

  const openView = async (supplierPO) => {
    try {
      const response = await supplierPOService.getSupplierPOById(
        supplierPO._id,
      );

      setViewingSupplierPO(response.supplierPO || response.data || response);
    } catch (error) {
      console.error("Failed to load Supplier PO:", error);

      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to load Supplier PO.",
      });
    }
  };

  // ================================
  // RELEASE SUPPLIER PO
  // ================================

  const handleReleaseSupplierPO = (supplierPO) => {
    if (!supplierPO?._id) {
      return;
    }

    setReleasingSupplierPO(supplierPO);
  };

  const handleConfirmRelease = async () => {
    if (!releasingSupplierPO) {
      return;
    }

    try {
      setReleasing(true);

      await supplierPOService.releaseSupplierPO(releasingSupplierPO._id);

      await loadSupplierPOs();

      setReleasingSupplierPO(null);

      setToast({
        type: "success",
        message: "Supplier PO released successfully.",
      });
    } catch (error) {
      console.error("Failed to release Supplier PO:", error);

      setToast({
        type: "error",
        message:
          error.response?.data?.message || "Failed to release Supplier PO.",
      });
    } finally {
      setReleasing(false);
    }
  };

  const handleCancelRelease = () => {
    if (releasing) {
      return;
    }

    setReleasingSupplierPO(null);
  };

  const closeSupplierPOView = () => {
    setViewingSupplierPO(null);
  };

  // ================================
  // CLOSE FORM
  // ================================

  const closeSupplierPOForm = () => {
    if (formLoading) {
      return;
    }

    setShowSupplierPOForm(false);
    setEditingSupplierPO(null);
  };

  // ================================
  // DELETE
  // ================================

  const handleDelete = (supplierPO) => {
    setDeletingSupplierPO(supplierPO);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSupplierPO) {
      return;
    }

    try {
      setDeleting(true);

      await supplierPOService.deleteSupplierPO(deletingSupplierPO._id);

      await loadSupplierPOs();

      setDeletingSupplierPO(null);

      setToast({
        type: "success",
        message: "Supplier PO deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete Supplier PO:", error);

      setToast({
        type: "error",
        message:
          error.response?.data?.message || "Failed to delete Supplier PO.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (deleting) {
      return;
    }

    setDeletingSupplierPO(null);
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
  // FILTER
  // ================================

  const filteredSupplierPOs = useMemo(() => {
    return supplierPOs.filter((supplierPO) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        supplierPO.poNumber?.toLowerCase().includes(search) ||
        supplierPO.supplierId?.name?.toLowerCase().includes(search) ||
        supplierPO.supplierId?.supplierCode?.toLowerCase().includes(search);

      const matchesSupplier =
        selectedSupplier === "all" ||
        supplierPO.supplierId?._id === selectedSupplier;

      const matchesStatus =
        selectedStatus === "all" || supplierPO.status === selectedStatus;

      const matchesDate =
        !selectedDate || supplierPO.supplierPODate?.startsWith(selectedDate);

      return matchesSearch && matchesSupplier && matchesStatus && matchesDate;
    });
  }, [supplierPOs, searchTerm, selectedSupplier, selectedStatus, selectedDate]);

  // ================================
  // STATUS
  // ================================

  const getStatusClass = (status) => {
    switch (status) {
      case "draft":
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";

      case "sent":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";

      case "confirmed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

      case "received":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";

      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400";

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

  // ================================
  // TERMINAL STATE
  // ================================

  const isTerminalSupplierPO = (status) => {
    return ["received", "cancelled"].includes(status);
  };

  // ================================
  // RENDER
  // ================================

  return (
    <>
      {/* TOAST */}

      <Toast type={toast.type} message={toast.message} onClose={closeToast} />

      {/* DELETE CONFIRMATION */}

      <ConfirmModal
        isOpen={!!releasingSupplierPO}
        onClose={handleCancelRelease}
        onConfirm={handleConfirmRelease}
        title="Release Supplier PO"
        message={`Are you sure you want to release "${
          releasingSupplierPO?.poNumber || "this Supplier PO"
        }"? This will mark the Supplier PO as Sent.`}
        confirmText="Release"
        cancelText="Cancel"
        loading={releasing}
        loadingText="Releasing..."
      />

      <div className="space-y-6">
        {/* ================================
            HEADER
        ================================= */}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Supplier Purchase Orders
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Create and manage supplier purchase orders.
            </p>
          </div>

          {canCreateSupplierPO && (
            <button
              type="button"
              onClick={openCreateForm}
              className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              + New Supplier PO
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
            placeholder="Search Supplier POs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          {/* SUPPLIER */}

          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">All Suppliers</option>

            {[
              ...new Map(
                supplierPOs
                  .filter((supplierPO) => supplierPO.supplierId)
                  .map((supplierPO) => [
                    supplierPO.supplierId._id,
                    supplierPO.supplierId,
                  ]),
              ).values(),
            ].map((supplier) => (
              <option key={supplier._id} value={supplier._id}>
                {supplier.name}
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
            <option value="sent">Sent</option>
            <option value="confirmed">Confirmed</option>
            <option value="received">Received</option>
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
            TABLE
        ================================= */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3 font-semibold">Supplier PO No.</th>

                  <th className="px-6 py-3 font-semibold">Supplier</th>

                  <th className="px-6 py-3 font-semibold">Client PO</th>

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
                      colSpan="8"
                      className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      Loading Supplier POs...
                    </td>
                  </tr>
                ) : filteredSupplierPOs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      No Supplier POs found.
                    </td>
                  </tr>
                ) : (
                  [...filteredSupplierPOs]
                    .sort((a, b) => {
                      const sequenceA = Number(a.poNumber?.split("-").pop());

                      const sequenceB = Number(b.poNumber?.split("-").pop());

                      return sequenceB - sequenceA;
                    })
                    .map((supplierPO) => (
                      <tr
                        key={supplierPO._id}
                        className="border-t border-slate-100 dark:border-slate-800"
                      >
                        {/* PO NUMBER */}

                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {supplierPO.poNumber || "—"}
                          </p>
                        </td>

                        {/* SUPPLIER */}

                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {supplierPO.supplierId?.name || "—"}
                        </td>

                        {/* CLIENT PO */}

                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {supplierPO.relatedClientPOId?.poNumber || "—"}
                        </td>

                        {/* ITEMS */}

                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {supplierPO.items?.length || 0}
                        </td>

                        {/* TOTAL */}

                        <td className="px-6 py-4 text-right font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(
                            supplierPO.totalAmount || 0,
                            settings?.currency,
                          )}
                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                              supplierPO.status,
                            )}`}
                          >
                            {formatStatus(supplierPO.status)}
                          </span>
                        </td>

                        {/* DATE */}

                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {supplierPO.supplierPODate
                            ? new Date(
                                supplierPO.supplierPODate,
                              ).toLocaleDateString("en-PH")
                            : "—"}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            {/* VIEW */}

                            {canViewSupplierPO && (
                              <button
                                type="button"
                                onClick={() => openView(supplierPO)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                aria-label={`View ${supplierPO.poNumber}`}
                              >
                                <FaEye className="h-3.5 w-3.5" />
                              </button>
                            )}

                            {/* RELEASE */}

                            {canReleaseSupplierPO &&
                              supplierPO.status === "draft" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleReleaseSupplierPO(supplierPO)
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-green-600 transition hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-950/30"
                                  aria-label={`Release ${supplierPO.poNumber}`}
                                  title="Release Supplier PO"
                                >
                                  <FaRocket className="h-3.5 w-3.5" />
                                </button>
                              )}

                            {/* EDIT */}

                           {canEditSupplierPO &&
  supplierPO.status === "draft" && (
                                <button
                                  type="button"
                                  onClick={() => openEditForm(supplierPO)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                  aria-label={`Edit ${supplierPO.poNumber}`}
                                >
                                  <FaEdit className="h-3.5 w-3.5" />
                                </button>
                              )}

                            {/* DELETE */}

                            {canDeleteSupplierPO &&
                              supplierPO.status === "draft" && (
                                <button
                                  type="button"
                                  onClick={() => handleDelete(supplierPO)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                                  aria-label={`Delete ${supplierPO.poNumber}`}
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
              Showing {filteredSupplierPOs.length} of {supplierPOs.length}{" "}
              Supplier POs
            </p>
          </div>
        </div>

        {/* ================================
            FORM
        ================================= */}

        {showSupplierPOForm && (
          <SupplierPOForm
            initialData={editingSupplierPO}
            onSubmit={handleSubmit}
            onClose={closeSupplierPOForm}
            submitting={formLoading}
          />
        )}

        {/* ================================
            VIEW
        ================================= */}

        {viewingSupplierPO && (
          <SupplierPOView
            supplierPO={viewingSupplierPO}
            onClose={closeSupplierPOView}
          />
        )}
      </div>
    </>
  );
}

export default SupplierPO;
