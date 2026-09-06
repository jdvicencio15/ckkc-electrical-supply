function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "lg",
}) {
  if (!isOpen) {
    return null;
  }

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    "2xl": "max-w-5xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${sizeClasses[size] || sizeClasses.lg} max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h2>
          )}

          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-slate-400 transition hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export default Modal;