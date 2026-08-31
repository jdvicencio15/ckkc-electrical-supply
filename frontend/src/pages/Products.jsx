import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";

import productService from "../services/productService";
import categoryService from "../services/categoryService";
import ProductForm from "../components/products/ProductForm";
import Toast from "../components/common/Toast";
import { useAuth } from "../context/AuthContext";

function Products() {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [toast, setToast] = useState({
    type: "success",
    message: "",
  });

  const canManageProducts =
    user?.role === "owner" ||
    user?.role === "admin" ||
    user?.role === "purchasing";

  const loadProducts = async () => {
    const response = await productService.getProducts();

    setProducts(response.products || []);
  };

  const loadCategories = async () => {
    const response = await categoryService.getCategories();

    setCategories(response.categories || []);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([loadProducts(), loadCategories()]);
      } catch (error) {
        console.error("Failed to load products:", error);

        setToast({
          type: "error",
          message: "Failed to load products.",
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

  const filteredProducts = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        product.sku?.toLowerCase().includes(search) ||
        product.name?.toLowerCase().includes(search) ||
        product.description?.toLowerCase().includes(search);

      const matchesCategory =
        selectedCategory === "all" ||
        product.categoryId?._id === selectedCategory;

      const matchesStatus =
        selectedStatus === "all" ||
        product.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [
    products,
    searchTerm,
    selectedCategory,
    selectedStatus,
  ]);

  const handleCreate = async (formData) => {
    try {
      setFormLoading(true);

      await productService.createProduct(formData);

      await loadProducts();

      setShowForm(false);

      setToast({
        type: "success",
        message: "Product created successfully.",
      });
    } catch (error) {
      console.error("Failed to create product:", error);

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to create product.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      setFormLoading(true);

      await productService.updateProduct(
        editingProduct._id,
        formData,
      );

      await loadProducts();

      setEditingProduct(null);
      setShowForm(false);

      setToast({
        type: "success",
        message: "Product updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update product:", error);

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to update product.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Delete product "${product.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await productService.deleteProduct(product._id);

      await loadProducts();

      setToast({
        type: "success",
        message: "Product deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete product:", error);

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to delete product.",
      });
    }
  };

  const openCreateForm = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const closeForm = () => {
    if (formLoading) {
      return;
    }

    setShowForm(false);
    setEditingProduct(null);
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

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Products
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage your electrical supply products.
            </p>
          </div>

          {canManageProducts && (
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <FaPlus className="h-3.5 w-3.5" />
              Add Product
            </button>
          )}
        </div>

        {/* Product Form */}
        {showForm && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {editingProduct
                  ? "Edit Product"
                  : "Add Product"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {editingProduct
                  ? "Update the product information."
                  : "Create a new product."}
              </p>
            </div>

            <ProductForm
              categories={categories}
              product={editingProduct}
              onSubmit={
                editingProduct
                  ? handleUpdate
                  : handleCreate
              }
              onCancel={closeForm}
              submitting={formLoading}
            />
          </div>
        )}

        {/* Filters */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="Search SKU, name, description..."
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />

            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value)
              }
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category._id}
                  value={category._id}
                >
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value)
              }
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading products...
            </p>
          ) : filteredProducts.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No products found.
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Try adjusting your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    <th className="pb-3 font-medium">
                      SKU
                    </th>

                    <th className="pb-3 font-medium">
                      Product
                    </th>

                    <th className="pb-3 font-medium">
                      Category
                    </th>

                    <th className="pb-3 font-medium">
                      Unit
                    </th>

                    <th className="pb-3 font-medium">
                      Min Stock
                    </th>

                    <th className="pb-3 font-medium">
                      Current Stock
                    </th>

                    <th className="pb-3 font-medium">
                      Status
                    </th>

                    {canManageProducts && (
                      <th className="pb-3 text-right font-medium">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => {
                    const lowStock =
                      product.currentStock <=
                      product.minimumStock;

                    return (
                      <tr
                        key={product._id}
                        className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                      >
                        <td className="py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                          {product.sku}
                        </td>

                        <td className="py-4">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {product.name}
                          </p>

                          {product.description && (
                            <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500 dark:text-slate-400">
                              {product.description}
                            </p>
                          )}
                        </td>

                        <td className="py-4 text-sm text-slate-600 dark:text-slate-400">
                          {product.categoryId?.name ||
                            "Uncategorized"}
                        </td>

                        <td className="py-4 text-sm text-slate-600 dark:text-slate-400">
                          {product.unit}
                        </td>

                        <td className="py-4 text-sm text-slate-600 dark:text-slate-400">
                          {product.minimumStock}
                        </td>

                        <td className="py-4">
                          <span
                            className={`text-sm font-semibold ${
                              lowStock
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-slate-900 dark:text-slate-100"
                            }`}
                          >
                            {product.currentStock}
                          </span>

                          {lowStock && (
                            <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                              Low
                            </span>
                          )}
                        </td>

                        <td className="py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              product.status === "active"
                                ? "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {product.status === "active"
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        {canManageProducts && (
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditForm(product)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                aria-label={`Edit ${product.name}`}
                              >
                                <FaEdit className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(product)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                                aria-label={`Delete ${product.name}`}
                              >
                                <FaTrash className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Products;