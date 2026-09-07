import {
  FaCheck,
  FaEdit,
  FaPowerOff,
} from "react-icons/fa";

function UserTable({
  users = [],
  loading = false,
  onEdit,
  onToggleStatus,
}) {
  const roleStyles = {
    owner:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",

    admin:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",

    sales:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",

    purchasing:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",

    accounting:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  };

  const formatRole = (role) => {
    if (!role) {
      return "-";
    }

    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-PH",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-6 py-3 font-semibold">
                User
              </th>

              <th className="px-6 py-3 font-semibold">
                Email
              </th>

              <th className="px-6 py-3 font-semibold">
                Role
              </th>

              <th className="px-6 py-3 font-semibold">
                Status
              </th>

              <th className="px-6 py-3 font-semibold">
                Last Login
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
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                 key={user._id || user.id}
                  className="border-t border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                >
                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        {user.firstName?.charAt(0)}
                        {user.lastName?.charAt(0)}
                      </div>

                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {user.firstName}{" "}
                          {user.lastName}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {user.email}
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        roleStyles[user.role] ||
                        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {formatRole(user.role)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Last Login */}
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {formatDate(user.lastLogin)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => onEdit(user)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-green-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-green-400"
                        title="Edit User"
                      >
                        <FaEdit />
                      </button>

                      {/* Activate / Deactivate */}
                      <button
                        type="button"
                        onClick={() =>
                          onToggleStatus(user)
                        }
                        className={`rounded-lg p-2 transition ${
                          user.isActive
                            ? "text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                            : "text-slate-500 hover:bg-green-50 hover:text-green-600 dark:text-slate-400 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                        }`}
                        title={
                          user.isActive
                            ? "Deactivate User"
                            : "Activate User"
                        }
                      >
                        {user.isActive ? (
                          <FaPowerOff />
                        ) : (
                          <FaCheck />
                        )}
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
          Showing {users.length}{" "}
          {users.length === 1 ? "user" : "users"}
        </p>
      </div>
    </div>
  );
}

export default UserTable;