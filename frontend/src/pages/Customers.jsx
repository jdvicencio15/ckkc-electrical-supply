
import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import customerService from "../services/customerService";
import CustomerForm from "../components/customers/CustomerForm";
import Toast from "../components/common/Toast";

function Customers() {
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [toast, setToast] = useState({
    type: "success",
    message: "",
  });

  const loadCustomers = async () => {
    const response = await customerService.getCustomers();

    setCustomers(response.customers || []);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadCustomers();
      } catch (error) {
        console.error("Failed to load customers:", error);

        setToast({
          type: "error",
          message:
            error.response?.data?.message ||
            "Failed to load customers.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!toast.message) {
      return;
    }

    const timer = setTimeout(() => {
      setToast({
        type: "success",
        message: "",
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  const handleCreate = async (formData) => {
    try {
      setFormLoading(true);

      await customerService.createCustomer(formData);

      await loadCustomers();

      setShowCustomerForm(false);

      setToast({
        type: "success",
        message: "Customer created successfully.",
      });
    } catch (error) {
      console.error("Failed to create customer:", error);

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to create customer.",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      setFormLoading(true);

      await customerService.updateCustomer(
        editingCustomer._id,
        formData,
      );

      await loadCustomers();

      setEditingCustomer(null);
      setShowCustomerForm(false);

      setToast({
        type: "success",
        message: "Customer updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update customer:", error);

      setToast({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to update customer.",
      });
    } finally {
      setFormLoading(false);
    }
  };


const handleDelete = async (customer) => {
  const confirmed = window.confirm(
    `Delete customer "${customer.name}"?`,
  );

  if (!confirmed) {
    return;
  }

  try {
    await customerService.deleteCustomer(customer._id);

    await loadCustomers();

    setToast({
      type: "success",
      message: "Customer deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete customer:", error);

    setToast({
      type: "error",
      message:
        error.response?.data?.message ||
        "Failed to delete customer.",
    });
  }
};







  const openCreateForm = () => {
    setEditingCustomer(null);
    setShowCustomerForm(true);
  };

  const openEditForm = (customer) => {
    setEditingCustomer(customer);
    setShowCustomerForm(true);
  };

  const closeCustomerForm = () => {
    if (formLoading) {
      return;
    }

    setShowCustomerForm(false);
    setEditingCustomer(null);
  };

  const closeToast = () => {
    setToast({
      type: "success",
      message: "",
    });
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        customer.customerCode?.toLowerCase().includes(search) ||
        customer.name?.toLowerCase().includes(search) ||
        customer.contactPerson?.toLowerCase().includes(search) ||
        customer.email?.toLowerCase().includes(search) ||
        customer.phone?.toLowerCase().includes(search);

      const matchesStatus =
        selectedStatus === "all" ||
        customer.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, selectedStatus]);

  return (
    <>
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={closeToast}
      />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Customers
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage your customers and their account information.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
          >
            + Add Customer
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row dark:border-slate-800 dark:bg-slate-900">
          <input
            type="search"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-green-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Customers Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3 font-semibold">
                    Customer
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Contact
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Total Orders
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Total Purchases
                  </th>

                  <th className="px-6 py-3 font-semibold">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      Loading customers...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer._id}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {customer.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {customer.customerCode}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="text-slate-700 dark:text-slate-300">
                            {customer.contactPerson || "—"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {customer.email || customer.phone || "—"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                        {customer.totalOrders ?? 0}
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                        ₱
                        {Number(
                          customer.totalPurchases ?? 0
                        ).toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            customer.status === "active"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {customer.status === "active"
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">

<div className="flex justify-end gap-2">
  <button
    type="button"
    onClick={() => openEditForm(customer)}
    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
    aria-label={`Edit ${customer.name}`}
  >
    <FaEdit className="h-3.5 w-3.5" />
  </button>

  <button
    type="button"
    onClick={() => handleDelete(customer)}
    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
    aria-label={`Delete ${customer.name}`}
  >
    <FaTrash className="h-3.5 w-3.5" />
  </button>
</div>


                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-6 py-3 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredCustomers.length} of{" "}
              {customers.length} customers
            </p>
          </div>
        </div>

        {/* Customer Form */}
        {showCustomerForm && (
          <CustomerForm
            customer={editingCustomer}
            onSubmit={
              editingCustomer
                ? handleUpdate
                : handleCreate
            }
            onClose={closeCustomerForm}
            submitting={formLoading}
          />
        )}
      </div>
    </>
  );
}

export default Customers;

