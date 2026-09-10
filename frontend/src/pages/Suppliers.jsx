import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import supplierService from "../services/supplierService";
import SupplierModal from "../components/suppliers/SupplierModal";
import Toast from "../components/common/Toast";
import ConfirmModal from "../components/ui/ConfirmModal";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
const [searchParams] = useSearchParams();

  const [selectedSupplier, setSelectedSupplier] = useState(null);

 const [searchTerm, setSearchTerm] = useState(
  searchParams.get("search") || ""
);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

const [deletingSupplier, setDeletingSupplier] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState({
    type: "success",
    message: "",
  });

  // FETCH SUPPLIERS
  const fetchSuppliers = async () => {
    const response = await supplierService.getSuppliers();

    setSuppliers(response.suppliers || []);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchSuppliers();
      } catch (error) {
        console.error("Failed to load suppliers:", error);

        setToast({
          type: "error",
          message:
            error.response?.data?.message ||
            "Failed to load suppliers.",
        });
      } finally {
        setIsLoading(false);
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

  // CREATE SUPPLIER
  const handleCreateSupplier = async (supplierData) => {
    try {
      setFormLoading(true);

      await supplierService.createSupplier(supplierData);

      await fetchSuppliers();

      setIsModalOpen(false);
      setSelectedSupplier(null);

      setToast({
        type: "success",
        message: "Supplier created successfully.",
      });
    } catch (error) {
      console.error("Failed to create supplier:", error);

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to create supplier.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // UPDATE SUPPLIER
  const handleUpdateSupplier = async (supplierData) => {
    try {
      setFormLoading(true);

      await supplierService.updateSupplier(
        selectedSupplier._id,
        supplierData
      );

      await fetchSuppliers();

      setSelectedSupplier(null);
      setIsModalOpen(false);

      setToast({
        type: "success",
        message: "Supplier updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update supplier:", error);

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to update supplier.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // DELETE SUPPLIER
const handleDeleteSupplier = (supplier) => {
  setDeletingSupplier(supplier);
};

const handleConfirmDelete = async () => {
  if (!deletingSupplier) {
    return;
  }

  try {
    setDeleting(true);

    await supplierService.deleteSupplier(
      deletingSupplier._id,
    );

    await fetchSuppliers();

    setDeletingSupplier(null);

    setToast({
      type: "success",
      message: "Supplier deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Failed to delete supplier:",
      error,
    );

    setToast({
      type: "error",
      message:
        error.response?.data?.message ||
        "Failed to delete supplier.",
    });
  } finally {
    setDeleting(false);
  }
};

const handleCancelDelete = () => {
  if (deleting) {
    return;
  }

  setDeletingSupplier(null);
};

  // OPEN CREATE FORM
  const openCreateForm = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  // OPEN EDIT FORM
  const openEditForm = (supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  // CLOSE SUPPLIER FORM
  const closeSupplierForm = () => {
    if (formLoading) {
      return;
    }

    setIsModalOpen(false);
    setSelectedSupplier(null);
  };

  // CLOSE TOAST
  const closeToast = () => {
    setToast({
      type: "success",
      message: "",
    });
  };

  // FILTER SUPPLIERS
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        supplier.supplierCode?.toLowerCase().includes(search) ||
        supplier.name?.toLowerCase().includes(search) ||
        supplier.contactPerson?.toLowerCase().includes(search) ||
        supplier.email?.toLowerCase().includes(search) ||
        supplier.phone?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        supplier.status === statusFilter;

      const matchesType =
        typeFilter === "all" ||
        supplier.supplierType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [
    suppliers,
    searchTerm,
    statusFilter,
    typeFilter,
  ]);

  // STATUS STYLING
  const getStatusClasses = (status) => {
    if (status === "active") {
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }

    return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  };

  // SUPPLIER TYPE LABEL
  const getTypeLabel = (type) => {
    if (type === "international") {
      return "International";
    }

    return "Local";
  };

  return (
    <>
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={closeToast}
      />


      <ConfirmModal
  isOpen={!!deletingSupplier}
  onClose={handleCancelDelete}
  onConfirm={handleConfirmDelete}
  title="Delete Supplier"
  message={`Are you sure you want to delete "${
    deletingSupplier?.name || "this supplier"
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
              Suppliers
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage your suppliers and their account information.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
          >
            + Add Supplier
          </button>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row dark:border-slate-800 dark:bg-slate-900">
          <input
            type="search"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">All Types</option>
            <option value="local">Local</option>
            <option value="international">
              International
            </option>
          </select>
        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* SUPPLIERS TABLE */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3 font-semibold">
                    Supplier
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Contact
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Type
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      Loading suppliers...
                    </td>
                  </tr>
                ) : filteredSuppliers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      No suppliers found.
                    </td>
                  </tr>
                ) : (
                  [...filteredSuppliers]
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  .map((supplier) => (
                    <tr
                      key={supplier._id}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      {/* SUPPLIER */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {supplier.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {supplier.supplierCode}
                          </p>
                        </div>
                      </td>

                      {/* CONTACT */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-slate-700 dark:text-slate-300">
                            {supplier.contactPerson || "—"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {supplier.email ||
                              supplier.phone ||
                              "—"}
                          </p>
                        </div>
                      </td>

                      {/* TYPE */}
                      <td className="px-6 py-4">
                        <span className="text-slate-700 dark:text-slate-300">
                          {getTypeLabel(
                            supplier.supplierType
                          )}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                            supplier.status
                          )}`}
                        >
                          {supplier.status === "active"
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(supplier)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                            aria-label={`Edit ${supplier.name}`}
                          >
                            <FaEdit className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteSupplier(supplier)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                            aria-label={`Delete ${supplier.name}`}
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
              Showing {filteredSuppliers.length} of{" "}
              {suppliers.length} suppliers
            </p>
          </div>
        </div>

        {/* SUPPLIER MODAL */}
        {isModalOpen && (
          <SupplierModal
            supplier={selectedSupplier}
            onClose={closeSupplierForm}
            createSupplier={handleCreateSupplier}
            updateSupplier={(id, supplierData) =>
              handleUpdateSupplier(supplierData)
            }
            onSuccess={() => {}}
            submitting={formLoading}
          />
        )}
      </div>
    </>
  );
}

export default Suppliers;