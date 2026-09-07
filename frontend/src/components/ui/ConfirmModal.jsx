import { FaExclamationTriangle } from "react-icons/fa";

import Button from "./Button";
import Modal from "./Modal";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to continue? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      title={title}
      size="sm"
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="mt-1 text-red-500">
            <FaExclamationTriangle />
          </div>

          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              {title}?
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;