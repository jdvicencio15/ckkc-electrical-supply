function Products() {
  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Products
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your electrical supply products.
        </p>
      </div>

      {/* Products Content */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Products will appear here.
        </p>
      </div>

    </div>
  );
}

export default Products;