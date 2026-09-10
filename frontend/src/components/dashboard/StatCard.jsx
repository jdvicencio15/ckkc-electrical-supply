function StatCard({
  title,
  value,
  icon: Icon,
  description,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {value}
          </h3>

          {description && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>

        {Icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
            <Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;