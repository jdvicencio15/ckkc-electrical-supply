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
      className={`animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 ${sizes[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export default Spinner;