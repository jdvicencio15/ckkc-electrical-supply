import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";

import categoryService from "../services/categoryService";
import CategoryForm from "../components/categories/CategoryForm";
import Toast from "../components/common/Toast";
import { useAuth } from "../context/AuthContext";

function Categories() {
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [toast, setToast] = useState({
    type: "success",
    message: "",
  });

  const canManageCategories = user?.role === "owner" || user?.role === "admin";

  const loadCategories = async () => {
    const response = await categoryService.getCategories();

    setCategories(response.categories || []);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadCategories();
      } catch (error) {
        console.error("Failed to load categories:", error);

        setToast({
          type: "error",
          message: "Failed to load categories.",
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

  const filteredCategories = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        category.name?.toLowerCase().includes(search) ||
        category.description?.toLowerCase().includes(search);

      const matchesStatus =
        selectedStatus === "all" || category.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, selectedStatus]);

  const handleCreate = async (formData) => {
    try {
      setFormLoading(true);

      await categoryService.createCategory(formData);

      await loadCategories();

      setShowForm(false);

      setToast({
        type: "success",
        message: "Category created successfully.",
      });
    } catch (error) {
      console.error("Failed to create category:", error);

      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to create category.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      setFormLoading(true);

      await categoryService.updateCategory(editingCategory._id, formData);

      await loadCategories();

      setEditingCategory(null);
      setShowForm(false);

      setToast({
        type: "success",
        message: "Category updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update category:", error);

      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to update category.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(`Delete category "${category.name}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await categoryService.deleteCategory(category._id);

      await loadCategories();

      setToast({
        type: "success",
        message: "Category deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete category:", error);

      setToast({
        type: "error",
        message: error.response?.data?.message || "Failed to delete category.",
      });
    }
  };

  const openCreateForm = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const openEditForm = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const closeForm = () => {
    if (formLoading) {
      return;
    }

    setShowForm(false);
    setEditingCategory(null);
  };

  const closeToast = () => {
    setToast({
      type: "success",
      message: "",
    });
  };

  return (
    <>
      <Toast type={toast.type} message={toast.message} onClose={closeToast} />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Categories
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage your product categories.
            </p>
          </div>

          {canManageCategories && (
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <FaPlus className="h-3.5 w-3.5" />
              Add Category
            </button>
          )}
        </div>

        {/* Category Form */}
        {showForm && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {editingCategory
                  ? "Update the category information."
                  : "Create a new product category."}
              </p>
            </div>

            <CategoryForm
              category={editingCategory}
              onSubmit={editingCategory ? handleUpdate : handleCreate}
              onCancel={closeForm}
              submitting={formLoading}
            />
          </div>
        )}

        {/* Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search categories..."
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />

            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Categories Table */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading categories...
            </p>
          ) : filteredCategories.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No categories found.
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Try adjusting your search or filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    <th className="pb-3 font-medium">Name</th>

                    <th className="pb-3 font-medium">Description</th>

                    <th className="pb-3 font-medium">Status</th>

                    <th className="pb-3 font-medium">Created</th>

                    {canManageCategories && (
                      <th className="pb-3 text-right font-medium">Actions</th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {filteredCategories.map((category) => (
                    <tr
                      key={category._id}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                    >
                      <td className="py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                        {category.name}
                      </td>

                      <td className="py-4">
                        <p className="max-w-md truncate text-sm text-slate-600 dark:text-slate-400">
                          {category.description || "No description"}
                        </p>
                      </td>

                      <td className="py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            category.status === "active"
                              ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {category.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="py-4 text-sm text-slate-500 dark:text-slate-400">
                        {category.createdAt
                          ? new Date(category.createdAt).toLocaleDateString(
                              "en-PH",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )
                          : "—"}
                      </td>

                      {canManageCategories && (
                        <td className="py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditForm(category)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                              aria-label={`Edit ${category.name}`}
                            >
                              <FaEdit className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(category)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                              aria-label={`Delete ${category.name}`}
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

export default Categories;
