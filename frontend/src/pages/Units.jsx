
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FaEdit,
  FaPlus,
  FaTrash,
  FaToggleOff,
  FaToggleOn,
} from "react-icons/fa";

import unitService from "../services/unitService";
import Toast from "../components/common/Toast";
import ConfirmModal from "../components/ui/ConfirmModal";
import { useAuth } from "../context/AuthContext";

function Units() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(null);

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );

  const [selectedStatus, setSelectedStatus] = useState("all");

  const [deletingUnit, setDeletingUnit] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState({
    type: "success",
    message: "",
  });

  const canManageUnits =
    user?.role === "owner" || user?.role === "admin";

  const loadUnits = async () => {
    const response = await unitService.getUnits();

    setUnits(response.units || []);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadUnits();
      } catch (error) {
        console.error("Failed to load units:", error);

        setToast({
          type: "error",
          message: "Failed to load units.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  const filteredUnits = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return units.filter((unit) => {
      const matchesSearch =
        unit.code?.toLowerCase().includes(search) ||
        unit.name?.toLowerCase().includes(search) ||
        unit.description?.toLowerCase().includes(search);

      const matchesStatus =
        selectedStatus === "all" ||
        unit.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [units, searchTerm, selectedStatus]);

  const handleToggleStatus = async (unit) => {
    if (!canManageUnits) {
      return;
    }

    const nextStatus =
      unit.status === "active" ? "inactive" : "active";

    try {
      setStatusLoading(unit._id);

      await unitService.updateUnit(unit._id, {
        status: nextStatus,
      });

      await loadUnits();

      setToast({
        type: "success",
        message: `Unit ${
          nextStatus === "active"
            ? "activated"
            : "deactivated"
        } successfully.`,
      });
    } catch (error) {
      console.error("Failed to update unit status:", error);

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to update unit status.",
      });
    } finally {
      setStatusLoading(null);
    }
  };

  const handleDelete = (unit) => {
    setDeletingUnit(unit);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUnit) {
      return;
    }

    try {
      setDeleting(true);

      await unitService.deleteUnit(deletingUnit._id);

      await loadUnits();

      setDeletingUnit(null);

      setToast({
        type: "success",
        message: "Unit deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete unit:", error);

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to delete unit.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (deleting) {
      return;
    }

    setDeletingUnit(null);
  };

  const closeToast = () => {
    setToast({
      type: "success",
      message: "",
    });
  };

  return (
    <>
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={closeToast}
      />

      <ConfirmModal
        isOpen={!!deletingUnit}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Unit"
        message={`Are you sure you want to delete "${
          deletingUnit?.code || "this unit"
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
      />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Units
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage product units of measurement.
            </p>
          </div>

          {canManageUnits && (
            <Link
              to="/units/new"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <FaPlus className="h-3.5 w-3.5" />
              Add Unit
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search units..."
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />

            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value)
              }
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Units Table */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading units...
            </p>
          ) : filteredUnits.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No units found.
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Try adjusting your search or filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    <th className="pb-3 font-medium">
                      Code
                    </th>

                    <th className="pb-3 font-medium">
                      Name
                    </th>

                    <th className="pb-3 font-medium">
                      Description
                    </th>

                    <th className="pb-3 font-medium">
                      Status
                    </th>

                    <th className="pb-3 font-medium">
                      Created
                    </th>

                    {canManageUnits && (
                      <th className="pb-3 text-right font-medium">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {filteredUnits.map((unit) => (
                    <tr
                      key={unit._id}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                    >
                      <td className="py-4">
                        <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {unit.code}
                        </span>
                      </td>

                      <td className="py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                        {unit.name}
                      </td>

                      <td className="py-4">
                        <p className="max-w-md truncate text-sm text-slate-600 dark:text-slate-400">
                          {unit.description || "No description"}
                        </p>
                      </td>

                      <td className="py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            unit.status === "active"
                              ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {unit.status === "active"
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="py-4 text-sm text-slate-500 dark:text-slate-400">
                        {unit.createdAt
                          ? new Date(
                              unit.createdAt,
                            ).toLocaleDateString(
                              "en-PH",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )
                          : "—"}
                      </td>

                      {canManageUnits && (
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {/* Edit */}
                            <Link
                              to={`/units/${unit._id}/edit`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                              aria-label={`Edit ${unit.name}`}
                              title="Edit"
                            >
                              <FaEdit className="h-3.5 w-3.5" />
                            </Link>

                            {/* Toggle Status */}
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleStatus(unit)
                              }
                              disabled={
                                statusLoading === unit._id
                              }
                              className={`flex h-8 w-8 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                unit.status === "active"
                                  ? "text-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:hover:bg-green-950/30"
                                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                              }`}
                              aria-label={`${
                                unit.status === "active"
                                  ? "Deactivate"
                                  : "Activate"
                              } ${unit.name}`}
                              title={
                                unit.status === "active"
                                  ? "Deactivate"
                                  : "Activate"
                              }
                            >
                              {unit.status === "active" ? (
                                <FaToggleOn className="h-4 w-4" />
                              ) : (
                                <FaToggleOff className="h-4 w-4" />
                              )}
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(unit)
                              }
                              disabled={
                                statusLoading === unit._id
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
                              aria-label={`Delete ${unit.name}`}
                              title="Delete"
                            >
                              <FaTrash className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Units;

