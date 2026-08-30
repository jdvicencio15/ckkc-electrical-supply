function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  error = "",
  className = "",
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`min-h-11 w-full rounded-lg border bg-white px-4 py-2.5 text-base text-slate-900 outline-none transition
          focus:border-green-500 focus:ring-2 focus:ring-green-100
          disabled:cursor-not-allowed disabled:bg-slate-100
          dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100
          dark:focus:border-green-500 dark:focus:ring-green-950
          dark:disabled:bg-slate-800
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-100 dark:border-red-500 dark:focus:ring-red-950"
              : "border-slate-300"
          }
          ${className}
        `}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default Select;