function Spinner({
  size = "md",
  className = "",
}) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  };

  return (
    <div
      className={`animate-spin rounded-full border-4 border-slate-200 border-t-green-600 dark:border-slate-700 dark:border-t-green-400 ${sizes[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export default Spinner;