import { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import Select from "../ui/Select";

const initialForm = {
  supplierId: "",
  productId: "",
  unitCost: "",
  effectiveFrom: "",
  status: "active",
};

const SupplierPricingForm = ({
  supplierPricing = null,
  suppliers = [],
  products = [],
  onSubmit,
  onClose,
  submitting = false,
}) => {
  const isEditing = Boolean(supplierPricing);

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (supplierPricing) {
      setFormData({
        supplierId: supplierPricing.supplierId?._id || supplierPricing.supplierId || "",
        productId: supplierPricing.productId?._id || supplierPricing.productId || "",
        unitCost:
          supplierPricing.unitCost !== undefined
            ? String(supplierPricing.unitCost)
            : "",
        effectiveFrom: supplierPricing.effectiveFrom
          ? new Date(supplierPricing.effectiveFrom)
              .toISOString()
              .split("T")[0]
          : "",
        status: supplierPricing.status || "active",
      });

      return;
    }

    setFormData({
      ...initialForm,
      effectiveFrom: new Date().toISOString().split("T")[0],
    });
  }, [supplierPricing]);

  const supplierOptions = useMemo(() => {
    return suppliers
      .filter((supplier) => supplier.status === "active")
      .map((supplier) => ({
        value: supplier._id,
        label: `${supplier.supplierCode} — ${supplier.name}`,
      }));
  }, [suppliers]);

  const productOptions = useMemo(() => {
    return products
      .filter((product) => product.status === "active")
      .map((product) => ({
        value: product._id,
        label: `${product.sku} — ${product.name}`,
      }));
  }, [products]);

  const selectedProduct = useMemo(() => {
    return products.find(
      (product) => product._id === formData.productId,
    );
  }, [products, formData.productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      supplierId: formData.supplierId,
      productId: formData.productId,
      unitCost: Number(formData.unitCost),
      effectiveFrom: formData.effectiveFrom || undefined,
      status: formData.status,
    });
  };

  return (
    <Modal
      isOpen
      onClose={submitting ? undefined : onClose}
      title={isEditing ? "Edit Supplier Pricing" : "Add Supplier Pricing"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Supplier"
          name="supplierId"
          value={formData.supplierId}
          onChange={handleChange}
          options={supplierOptions}
          placeholder="Select supplier"
          disabled={submitting}
          required
        />

        <Select
          label="Product"
          name="productId"
          value={formData.productId}
          onChange={handleChange}
          options={productOptions}
          placeholder="Select product"
          disabled={submitting}
          required
        />

        {selectedProduct && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Product Cost
            </p>

            <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
              ₱
              {Number(selectedProduct.productCost || 0).toLocaleString(
                "en-PH",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              )}
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Baseline product cost. This is separate from the supplier-specific cost.
            </p>
          </div>
        )}

        <Input
          label="Unit Cost"
          name="unitCost"
          type="number"
          value={formData.unitCost}
          onChange={handleChange}
          placeholder="0.00"
          disabled={submitting}
          required
          min="0"
          step="0.01"
        />

        <Input
          label="Effective From"
          name="effectiveFrom"
          type="date"
          value={formData.effectiveFrom}
          onChange={handleChange}
          disabled={submitting}
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          disabled={submitting}
          options={[
            {
              value: "active",
              label: "Active",
            },
            {
              value: "inactive",
              label: "Inactive",
            },
          ]}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={submitting}
            disabled={submitting}
          >
            {isEditing ? "Update Pricing" : "Save Pricing"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SupplierPricingForm;