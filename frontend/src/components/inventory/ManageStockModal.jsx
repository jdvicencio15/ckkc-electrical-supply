
import { useState } from "react";
import inventoryMovementService from "../../services/inventoryMovementService";

const ManageStockModal = ({ product, onClose, onSuccess }) => {
  const [quantity, setQuantity] = useState(product.currentStock ?? 0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const newStock = Number(quantity);

    if (!Number.isFinite(newStock) || newStock < 0) {
      setError("Stock quantity must be 0 or greater.");
      return;
    }

    setLoading(true);

    try {
      const response =
        await inventoryMovementService.createInventoryMovement({
          productId: product._id,
          type: "ADJUSTMENT",
          quantity: newStock,
          referenceType: "ADJUSTMENT",
          notes: notes.trim(),
        });

      if (!response.success) {
        throw new Error(
          response.message || "Failed to adjust stock."
        );
      }

      onSuccess(response.movement);
      onClose();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to adjust stock."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Manage Stock
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Adjust the current stock quantity for this product.
          </p>
        </div>

        {/* Product Information */}
        <div className="mb-5 rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
          <p className="font-medium text-slate-900 dark:text-white">
            {product.name}
          </p>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            SKU: {product.sku}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current Stock
              </p>

              <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                {product.currentStock ?? 0} {product.unit}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Minimum Stock
              </p>

              <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                {product.minimumStock ?? 0} {product.unit}
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Adjustment */}
          <div className="mb-4">
            <label
              htmlFor="stockQuantity"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              New Stock
            </label>

            <input
              id="stockQuantity"
              type="number"
              min="0"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              disabled={loading}
            />

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Enter the actual stock quantity.
            </p>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label
              htmlFor="stockNotes"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Notes
            </label>

            <textarea
              id="stockNotes"
              rows="3"
              maxLength="500"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for stock adjustment..."
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageStockModal;
