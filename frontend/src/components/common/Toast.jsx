
function Toast({ type = "success", message, onClose }) {
  if (!message) {
    return null;
  }

  const styles = {
    success:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400",

    error:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400",

    warning:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400",

    info:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-400",
  };

  return (
    <div className="fixed right-6 top-6 z-[100] max-w-sm">
      <div
        className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${
          styles[type] || styles.success
        }`}
      >
        <div className="flex-1 text-sm font-medium">
          {message}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-lg leading-none opacity-60 transition hover:opacity-100"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default Toast;

