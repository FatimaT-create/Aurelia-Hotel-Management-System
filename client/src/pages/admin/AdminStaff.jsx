import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { can } from "../../utils/permissions";

const roles = ["guest", "receptionist", "housekeeping", "manager", "admin"];
const roleStyles = {
  guest: "bg-aurelia-panelLight text-aurelia-muted border-aurelia-border",
  receptionist: "bg-blue-900/40 text-blue-300 border-blue-700/50",
  housekeeping: "bg-amber-900/40 text-amber-300 border-amber-700/50",
  manager: "bg-purple-900/40 text-purple-300 border-purple-700/50",
  admin: "bg-gold-gradient text-aurelia-bg border-transparent font-semibold",
};

export default function AdminStaff() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const canEdit = can(currentUser.role, "roleChange"); // admin only

  const load = () => {
    setLoading(true);
    const query = roleFilter === "all" ? "" : `?role=${roleFilter}`;
    api
      .get(`/users${query}`)
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [roleFilter]);

  const changeRole = async (u, role) => {
    if (u._id === currentUser.id) return alert("You can't change your own role here.");
    await api.put(`/users/${u._id}/role`, { role });
    load();
  };

  const toggleActive = async (u) => {
    if (u._id === currentUser.id) return alert("You can't deactivate your own account.");
    await api.put(`/users/${u._id}/status`, { isActive: !u.isActive });
    load();
  };

  return (
    <div className="p-8 max-w-7xl">
      <p className="uppercase text-aurelia-gold text-sm tracking-wide">People</p>
      <h1 className="font-serif text-3xl mt-2 mb-8">Staff &amp; Guests</h1>
      {!canEdit && (
        <p className="text-xs text-aurelia-muted -mt-6 mb-6">
          View-only — only an admin can change roles or activate/deactivate accounts.
        </p>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        {["all", ...roles].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-4 py-2 rounded-md text-sm border capitalize ${
              roleFilter === r
                ? "bg-gold-gradient text-aurelia-bg font-semibold border-transparent"
                : "border-aurelia-border text-aurelia-muted hover:text-aurelia-text"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-aurelia-muted">Loading users...</p>
      ) : (
        <div className="bg-aurelia-panel border border-aurelia-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-aurelia-panelLight text-aurelia-muted uppercase text-xs">
              <tr>
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Loyalty / ID</th>
                <th className="text-left px-5 py-3">Role</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-aurelia-border">
                  <td className="px-5 py-4 text-aurelia-text">{u.name}</td>
                  <td className="px-5 py-4 text-aurelia-muted">{u.email}</td>
                  <td className="px-5 py-4 text-aurelia-muted">
                    {u.loyaltyId} {u.role === "guest" && <span className="block text-xs">{u.loyaltyTier} · {u.loyaltyPoints} pts</span>}
                  </td>
                  <td className="px-5 py-4">
                    {canEdit ? (
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u, e.target.value)}
                        className={`text-xs uppercase px-2 py-1 rounded border bg-transparent ${roleStyles[u.role]}`}
                      >
                        {roles.map((r) => (
                          <option key={r} value={r} className="bg-aurelia-panel text-aurelia-text">
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`text-xs uppercase px-2 py-1 rounded border ${roleStyles[u.role]}`}>
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs uppercase px-2 py-1 rounded border ${
                        u.isActive
                          ? "bg-emerald-900/40 text-emerald-300 border-emerald-700/50"
                          : "bg-red-900/40 text-red-300 border-red-700/50"
                      }`}
                    >
                      {u.isActive ? "active" : "disabled"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {canEdit && (
                      <button
                        onClick={() => toggleActive(u)}
                        className="text-xs uppercase text-aurelia-gold hover:underline"
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-aurelia-muted">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}