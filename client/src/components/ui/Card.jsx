
function Card({
  children,
  title,
  className = "",
}) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}
    >
      {title && (
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          {title}
        </h2>
      )}

      {children}
    </div>
  );
}

export default Card;
