import { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";

import auditTrailService from "../services/auditTrailService";
import Toast from "../components/common/Toast";

import { useAuth } from "../context/AuthContext";
import { hasPermission } from "../utils/permissions";

function AuditTrails() {
  const { user } = useAuth();

  const canView = hasPermission(user?.role, "auditTrails", "view");

  const [auditTrails, setAuditTrails] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [entity, setEntity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [selectedAudit, setSelectedAudit] = useState(null);

  const [toast, setToast] = useState({
    type: "success",
    message: "",
  });

  // =========================
  // LOAD AUDIT TRAILS
  // =========================

  const loadAuditTrails = async () => {
    try {
      setLoading(true);

      const response = await auditTrailService.getAuditTrails({
        page,
        limit: 20,
        action: action || undefined,
        entity: entity || undefined,
        search: search.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      setAuditTrails(response.data || []);

      setPagination(
        response.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      );
    } catch (error) {
      console.error("Failed to load audit trails:", error);

      setAuditTrails([]);

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to load audit trails.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL / FILTER LOAD
  // =========================

  useEffect(() => {
    if (!canView) {
      setLoading(false);
      return;
    }

    loadAuditTrails();
  }, [
    canView,
    page,
    action,
    entity,
    startDate,
    endDate,
  ]);

  // =========================
  // SEARCH DEBOUNCE
  // =========================

  useEffect(() => {
    if (!canView) {
      return;
    }

    const timer = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
        return;
      }

      loadAuditTrails();
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // =========================
  // TOAST AUTO CLOSE
  // =========================

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

  // =========================
  // FILTER HANDLERS
  // =========================

  const handleActionChange = (value) => {
    setAction(value);
    setPage(1);
  };

  const handleEntityChange = (value) => {
    setEntity(value);
    setPage(1);
  };

  const handleStartDateChange = (value) => {
    setStartDate(value);
    setPage(1);
  };

  const handleEndDateChange = (value) => {
    setEndDate(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setAction("");
    setEntity("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const closeToast = () => {
    setToast({
      type: "success",
      message: "",
    });
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString();
  };

  // =========================
  // ACTION BADGE
  // =========================

  const getActionClass = (auditAction) => {
    switch (auditAction) {
      case "CREATE":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

      case "UPDATE":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";

      case "DELETE":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  // =========================
  // PERMISSION
  // =========================

  if (!canView) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
        You do not have permission to view audit trails.
      </div>
    );
  }

  return (
    <>
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={closeToast}
      />

      <div className="space-y-6">

        {/* =========================
            PAGE HEADER
        ========================= */}

        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Audit Trails
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor user activities and changes made throughout the system.
          </p>
        </div>

        {/* =========================
            FILTERS
        ========================= */}

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">

            {/* Search */}

            <input
              type="search"
              placeholder="Search audit trails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />

            {/* Action */}

            <select
              value={action}
              onChange={(e) => handleActionChange(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
            </select>

            {/* Entity */}

            <select
              value={entity}
              onChange={(e) => handleEntityChange(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="">All Entities</option>
              <option value="Customer">Customer</option>
              <option value="Supplier">Supplier</option>
              <option value="Product">Product</option>
              <option value="Quotation">Quotation</option>
              <option value="ClientPO">Client PO</option>
              <option value="Sale">Sale</option>
              <option value="Invoice">Invoice</option>
              <option value="Payment">Payment</option>
              <option value="SupplierPO">Supplier PO</option>
              <option value="Purchase">Purchase</option>
              <option value="Expense">Expense</option>
              <option value="User">User</option>
              <option value="Settings">Settings</option>
            </select>

            {/* Clear */}

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Clear Filters
            </button>
          </div>

          {/* Dates */}

          <div className="mt-4 grid gap-3 md:grid-cols-2">

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  handleStartDateChange(e.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) =>
                  handleEndDateChange(e.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              />
            </div>

          </div>
        </div>

        {/* =========================
            AUDIT TABLE
        ========================= */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] text-left text-sm">

              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">

                <tr>

                  <th className="px-6 py-3 font-semibold">
                    Date
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    User
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Action
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Entity
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Description
                  </th>

                  <th className="px-6 py-3 text-right font-semibold">
                    Details
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (
                  <tr>

                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      Loading audit trails...
                    </td>

                  </tr>
                ) : auditTrails.length === 0 ? (
                  <tr>

                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      No audit records found.
                    </td>

                  </tr>
                ) : (
                  auditTrails.map((audit) => (
                    <tr
                      key={audit._id}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >

                      {/* Date */}

                      <td className="px-6 py-4 whitespace-nowrap">

                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {formatDate(audit.createdAt)}
                        </p>

                      </td>

                      {/* User */}

                      <td className="px-6 py-4">

                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {audit.userName || "Unknown"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {audit.userRole || "—"}
                        </p>

                      </td>

                      {/* Action */}

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getActionClass(
                            audit.action,
                          )}`}
                        >
                          {audit.action || "—"}
                        </span>

                      </td>

                      {/* Entity */}

                      <td className="px-6 py-4">

                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {audit.entity || "—"}
                        </p>

                        {audit.documentNumber && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {audit.documentNumber}
                          </p>
                        )}

                      </td>

                      {/* Description */}

                      <td className="max-w-md px-6 py-4">

                        <p className="truncate text-slate-600 dark:text-slate-300">
                          {audit.description || "—"}
                        </p>

                      </td>

                      {/* Details */}

                      <td className="px-6 py-4 text-right">

                        <button
                          type="button"
                          onClick={() => setSelectedAudit(audit)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                          aria-label="View audit details"
                        >
                          <FaEye className="h-3.5 w-3.5" />
                        </button>

                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

          {/* =========================
              PAGINATION
          ========================= */}

          <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {auditTrails.length} of{" "}
              {pagination.total} records
            </p>

            <div className="flex items-center gap-2">

              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() =>
                  setPage((current) => current - 1)
                }
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Previous
              </button>

              <span className="text-xs text-slate-500 dark:text-slate-400">
                Page {pagination.page} of{" "}
                {pagination.totalPages || 1}
              </span>

              <button
                type="button"
                disabled={
                  page >= pagination.totalPages ||
                  loading ||
                  pagination.totalPages === 0
                }
                onClick={() =>
                  setPage((current) => current + 1)
                }
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Next
              </button>

            </div>

          </div>

        </div>

        {/* =========================
            AUDIT DETAIL MODAL
        ========================= */}

        {selectedAudit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">

              {/* Header */}

              <div className="flex items-start justify-between gap-4">

                <div>

                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Audit Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {selectedAudit.description || "No description"}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAudit(null)}
                  className="rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Close
                </button>

              </div>

              {/* Metadata */}

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    User
                  </p>

                  <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                    {selectedAudit.userName || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Email
                  </p>

                  <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                    {selectedAudit.userEmail || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Role
                  </p>

                  <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                    {selectedAudit.userRole || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Action
                  </p>

                  <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getActionClass(
                      selectedAudit.action,
                    )}`}
                  >
                    {selectedAudit.action || "—"}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Entity
                  </p>

                  <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                    {selectedAudit.entity || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Document Number
                  </p>

                  <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                    {selectedAudit.documentNumber || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Date
                  </p>

                  <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                    {formatDate(selectedAudit.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    IP Address
                  </p>

                  <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                    {selectedAudit.ipAddress || "—"}
                  </p>
                </div>

                <div className="md:col-span-2 lg:col-span-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Entity ID
                  </p>

                  <p className="mt-1 break-all text-sm text-slate-900 dark:text-slate-100">
                    {selectedAudit.entityId || "—"}
                  </p>
                </div>

              </div>

              {/* User Agent */}

              <div className="mt-4">

                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  User Agent
                </p>

                <p className="mt-1 break-all rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {selectedAudit.userAgent || "—"}
                </p>

              </div>

              {/* Before / After */}

              {(selectedAudit.before ||
                selectedAudit.after) && (
                <div className="mt-6 grid gap-4 lg:grid-cols-2">

                  <div>

                    <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Before
                    </h3>

                    <pre className="max-h-96 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-100">
                      {selectedAudit.before
                        ? JSON.stringify(
                            selectedAudit.before,
                            null,
                            2,
                          )
                        : "No previous state"}
                    </pre>

                  </div>

                  <div>

                    <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      After
                    </h3>

                    <pre className="max-h-96 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-100">
                      {selectedAudit.after
                        ? JSON.stringify(
                            selectedAudit.after,
                            null,
                            2,
                          )
                        : "No new state"}
                    </pre>

                  </div>

                </div>
              )}

              {/* Metadata */}

              {selectedAudit.metadata && (
                <div className="mt-6">

                  <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Additional Metadata
                  </h3>

                  <pre className="max-h-64 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-100">
                    {JSON.stringify(
                      selectedAudit.metadata,
                      null,
                      2,
                    )}
                  </pre>

                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default AuditTrails;