
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import unitService from "../services/unitService";
import UnitForm from "../components/units/UnitForm";
import Toast from "../components/common/Toast";

function UnitCreate() {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState({
    type: "success",
    message: "",
  });

  const handleCreate = async (formData) => {
    try {
      setSubmitting(true);

      await unitService.createUnit(formData);

      setToast({
        type: "success",
        message: "Unit created successfully.",
      });

      setTimeout(() => {
        navigate("/units");
      }, 500);
    } catch (error) {
      console.error("Failed to create unit:", error);

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to create unit.",
      });
    } finally {
      setSubmitting(false);
    }
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
        <div>
          <button
            type="button"
            onClick={() => navigate("/units")}
            className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400"
          >
            ← Back to Units
          </button>

          <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
            Add Unit
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create a new unit of measurement.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <UnitForm
            onSubmit={handleCreate}
            onCancel={() => navigate("/units")}
            submitting={submitting}
          />
        </div>
      </div>
    </>
  );
}

export default UnitCreate;

