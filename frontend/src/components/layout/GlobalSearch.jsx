import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaBox,
  FaTags,
  FaUsers,
  FaBuilding,
  FaShoppingCart,
  FaTruck,
  FaFileAlt,
  FaFileInvoice,
  FaMoneyBillWave,
  FaCalculator,
} from "react-icons/fa";

import searchService from "../../services/searchService";

const resultConfig = {
  product: {
    label: "Products",
    icon: FaBox,
  },
  category: {
    label: "Categories",
    icon: FaTags,
  },
  customer: {
    label: "Customers",
    icon: FaUsers,
  },
  supplier: {
    label: "Suppliers",
    icon: FaBuilding,
  },
  sale: {
    label: "Sales",
    icon: FaShoppingCart,
  },
  purchase: {
    label: "Purchases",
    icon: FaTruck,
  },
  quotation: {
    label: "Quotations",
    icon: FaFileAlt,
  },
  invoice: {
    label: "Invoices",
    icon: FaFileInvoice,
  },
  payment: {
    label: "Payments",
    icon: FaMoneyBillWave,
  },
  account: {
    label: "Accounting",
    icon: FaCalculator,
  },
};

function GlobalSearch() {
  const navigate = useNavigate();

  const wrapperRef = useRef(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // =====================================================
  // SEARCH
  // =====================================================

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setShowResults(true);
        setActiveIndex(-1);

        const data =
          await searchService.search(trimmedQuery);

        setResults(data?.results || []);
      } catch (error) {
        console.error(
          "Global search failed:",
          error
        );

        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // =====================================================
  // CLICK OUTSIDE
  // =====================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =====================================================
  // NAVIGATE
  // =====================================================

  const openResult = (result) => {
    if (!result?.path) {
      return;
    }

    setQuery("");
    setResults([]);
    setShowResults(false);
    setActiveIndex(-1);

    navigate(result.path);
  };

  // =====================================================
  // KEYBOARD NAVIGATION
  // =====================================================

  const handleKeyDown = (event) => {
    if (!showResults || results.length === 0) {
      if (event.key === "Escape") {
        setShowResults(false);
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveIndex((current) =>
        current < results.length - 1
          ? current + 1
          : 0
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveIndex((current) =>
        current > 0
          ? current - 1
          : results.length - 1
      );
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (
        activeIndex >= 0 &&
        results[activeIndex]
      ) {
        openResult(results[activeIndex]);
      }
    }

    if (event.key === "Escape") {
      setShowResults(false);
      setActiveIndex(-1);
    }
  };

  // =====================================================
  // GROUP RESULTS
  // =====================================================

  const groupedResults = results.reduce(
    (groups, result) => {
      if (!groups[result.type]) {
        groups[result.type] = [];
      }

      groups[result.type].push(result);

      return groups;
    },
    {}
  );

  return (
    <div
      ref={wrapperRef}
      className="relative w-96"
    >
      {/* Search Input */}

      <FaSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

      <input
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setShowResults(true);
        }}
        onFocus={() => {
          if (query.trim().length >= 2) {
            setShowResults(true);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search products, invoices, customers..."
        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-green-500 dark:focus:bg-slate-800"
      />

      {/* Results */}

      {showResults && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-12 z-50 max-h-[28rem] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">

          {/* Loading */}

          {loading && (
            <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Searching...
            </div>
          )}

          {/* Empty */}

          {!loading &&
            results.length === 0 && (
              <div className="px-4 py-8 text-center">
                <FaSearch className="mx-auto h-5 w-5 text-slate-300 dark:text-slate-600" />

                <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  No results found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Try a different search term.
                </p>
              </div>
            )}

          {/* Results */}

          {!loading &&
            Object.entries(groupedResults).map(
              ([type, items]) => {
                const config =
                  resultConfig[type];

                if (!config) {
                  return null;
                }

                const Icon = config.icon;

                return (
                  <div key={type}>
                    <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-500">
                      {config.label}
                    </div>

                    {items.map((result) => {
                      const index =
                        results.indexOf(result);

                      const isActive =
                        index === activeIndex;

                      return (
                        <button
                          key={`${result.type}-${result.path}`}
                          type="button"
                          onClick={() =>
                            openResult(result)
                          }
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                            isActive
                              ? "bg-green-50 dark:bg-green-950/30"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400">
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {result.label}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                              {result.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              }
            )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;