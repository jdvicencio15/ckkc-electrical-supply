
function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
  disabled = false,
  required = false,
  error = "",
  className = "",
}) {
  return (
    <div>
      {label && (
        <label
          htmlFor={name}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full min-h-11 rounded-lg border border-gray-300 px-4 py-2.5 text-base outline-none transition
          focus:border-blue-500 focus:ring-2 focus:ring-blue-200
          disabled:cursor-not-allowed disabled:bg-gray-100
          ${error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}
          ${className}
        `}
      />

      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;

