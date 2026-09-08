
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import unitService from "../services/unitService";
import UnitForm from "../components/units/UnitForm";
import Toast from "../components/common/Toast";

function UnitEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [unit, setUnit] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [toast, setToast] = useState({
    type: "success",
    message: "",
  });

  useEffect(() => {
    const loadUnit = async () => {
      try {
        setLoading(true);

        const response = await unitService.getUnitById(id);

        setUnit(response.unit);
      } catch (error) {
        console.error("Failed to load unit:", error);

        setToast({
          type: "error",
          message:
            error.response?.data?.message ||
            "Failed to load unit.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUnit();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      setSubmitting(true);

      await unitService.updateUnit(id, formData);

      setToast({
        type: "success",
        message: "Unit updated successfully.",
      });

      setTimeout(() => {
        navigate("/units");
      }, 500);
    } catch (error) {
      console.error("Failed to update unit:", error);

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to update unit.",
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
            Edit Unit
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Update the unit information.
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading unit...
            </p>
          </div>
        ) : !unit ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="py-8 text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Unit not found.
              </p>

              <button
                type="button"
                onClick={() => navigate("/units")}
                className="mt-4 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
              >
                Back to Units
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <UnitForm
              unit={unit}
              onSubmit={handleUpdate}
              onCancel={() => navigate("/units")}
              submitting={submitting}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default UnitEdit;

