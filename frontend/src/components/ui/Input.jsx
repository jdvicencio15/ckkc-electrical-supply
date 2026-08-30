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
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
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
        className={`min-h-11 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-base text-slate-900 outline-none transition
          placeholder:text-slate-400
          focus:border-green-500 focus:ring-2 focus:ring-green-100
          disabled:cursor-not-allowed disabled:bg-slate-100
          dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100
          dark:placeholder:text-slate-500
          dark:focus:border-green-500 dark:focus:ring-green-950
          dark:disabled:bg-slate-800
          ${error ? "border-red-500 focus:border-red-500 focus:ring-red-100 dark:border-red-500 dark:focus:ring-red-950" : ""}
          ${className}
        `}
      />

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;