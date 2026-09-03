
import { useEffect, useMemo, useState } from "react";

import productService from "../services/productService";
import categoryService from "../services/categoryService";
import ManageStockModal from "../components/inventory/ManageStockModal";
import Toast from "../components/common/Toast";

function Inventory() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStockStatus, setSelectedStockStatus] =
    useState("all");

  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadProducts = async () => {
    const response = await productService.getProducts();

    setProducts(response.products || []);
  };

  const loadCategories = async () => {
    const response = await categoryService.getCategories();

    setCategories(response.categories || []);
  };

  const loadInventory = async () => {
    try {
      await Promise.all([
        loadProducts(),
        loadCategories(),
      ]);
    } catch (error) {
      console.error(
        "Failed to load inventory:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

const [toast, setToast] = useState({
  type: "success",
  message: "",
});

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


  const closeToast = () => {
  setToast({
    type: "success",
    message: "",
  });
};



  useEffect(() => {
    loadInventory();
  }, []);

  const getStockStatus = (product) => {
    const currentStock = product.currentStock ?? 0;
    const minimumStock = product.minimumStock ?? 0;

    if (currentStock === 0) {
      return "out";
    }

    if (currentStock <= minimumStock) {
      return "low";
    }

    return "in";
  };

  const inventorySummary = useMemo(() => {
    return products.reduce(
      (summary, product) => {
        const stockStatus = getStockStatus(product);

        summary.total += 1;

        if (stockStatus === "in") {
          summary.inStock += 1;
        }

        if (stockStatus === "low") {
          summary.lowStock += 1;
        }

        if (stockStatus === "out") {
          summary.outOfStock += 1;
        }

        return summary;
      },
      {
        total: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
      }
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return products.filter((product) => {
      const matchesSearch =
        product.sku?.toLowerCase().includes(search) ||
        product.name?.toLowerCase().includes(search) ||
        product.description
          ?.toLowerCase()
          .includes(search);

      const matchesCategory =
        selectedCategory === "all" ||
        product.categoryId?._id === selectedCategory;

      const matchesStockStatus =
        selectedStockStatus === "all" ||
        getStockStatus(product) === selectedStockStatus;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStockStatus
      );
    });
  }, [
    products,
    searchTerm,
    selectedCategory,
    selectedStockStatus,
  ]);

  const handleManageStock = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseManageStock = () => {
    setSelectedProduct(null);
  };

const handleStockSuccess = async () => {
  await loadProducts();

  setSelectedProduct(null);

  setToast({
    type: "success",
    message: "Stock adjusted successfully.",
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Inventory
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Monitor stock levels and manage your inventory.
        </p>
      </div>

      {/* Inventory Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Products
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {inventorySummary.total}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            In Stock
          </p>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {inventorySummary.inStock}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Low Stock
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-500">
            {inventorySummary.lowStock}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Out of Stock
          </p>

          <p className="mt-2 text-2xl font-bold text-red-500">
            {inventorySummary.outOfStock}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row dark:border-slate-800 dark:bg-slate-900">
        <input
          type="search"
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
          placeholder="Search products..."
          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />

        <select
          value={selectedCategory}
          onChange={(event) =>
            setSelectedCategory(event.target.value)
          }
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
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
          value={selectedStockStatus}
          onChange={(event) =>
            setSelectedStockStatus(event.target.value)
          }
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        >
          <option value="all">
            All Stock Status
          </option>

          <option value="in">
            In Stock
          </option>

          <option value="low">
            Low Stock
          </option>

          <option value="out">
            Out of Stock
          </option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading inventory...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No inventory records found.
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-3 font-semibold">
                      Product
                    </th>

                    <th className="px-6 py-3 font-semibold">
                      SKU
                    </th>

                    <th className="px-6 py-3 font-semibold">
                      Category
                    </th>

                    <th className="px-6 py-3 font-semibold">
                      Stock
                    </th>

                    <th className="px-6 py-3 font-semibold">
                      Reorder Level
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
                  {filteredProducts.map((product) => {
                    const stockStatus =
                      getStockStatus(product);

                    return (
                      <tr
                        key={product._id}
                        className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {product.name}
                          </p>

                          {product.description && (
                            <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500 dark:text-slate-400">
                              {product.description}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                          {product.sku}
                        </td>

                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {product.categoryId?.name ||
                            "Uncategorized"}
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {product.currentStock ?? 0}
                          </span>

                          <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">
                            {product.unit}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {product.minimumStock ?? 0}
                        </td>

                        <td className="px-6 py-4">
                          {stockStatus === "in" && (
                            <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400">
                              In Stock
                            </span>
                          )}

                          {stockStatus === "low" && (
                            <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                              Low Stock
                            </span>
                          )}

                          {stockStatus === "out" && (
                            <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-400">
                              Out of Stock
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              handleManageStock(product)
                            }
                            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                          >
                            Manage Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 px-6 py-3 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "inventory record"
                  : "inventory records"}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Manage Stock Modal */}
      {selectedProduct && (
        <ManageStockModal
          product={selectedProduct}
          onClose={handleCloseManageStock}
          onSuccess={handleStockSuccess}
        />
      )}
      </div>
       </>
  );
}

export default Inventory;

