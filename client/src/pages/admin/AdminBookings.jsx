import { useEffect, useState } from "react";
import api from "../../utils/api";
import { formatPKR, formatDate } from "../../utils/currency";

const statusOptions = ["confirmed", "completed", "cancelled"];
const statusStyles = {
  confirmed: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50",
  completed: "bg-blue-900/40 text-blue-300 border-blue-700/50",
  cancelled: "bg-red-900/40 text-red-300 border-red-700/50",
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const query = filter === "all" ? "" : `?status=${filter}`;
    api
      .get(`/bookings${query}`)
      .then((res) => setBookings(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const updateStatus = async (booking, status) => {
    await api.put(`/bookings/${booking._id}/admin-status`, { status });
    load();
  };

  const visible = bookings.filter((b) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      b.bookingCode.toLowerCase().includes(q) ||
      b.user?.name?.toLowerCase().includes(q) ||
      b.room?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 max-w-7xl">
      <p className="uppercase text-aurelia-gold text-sm tracking-wide">Reservations</p>
      <h1 className="font-serif text-3xl mt-2 mb-8">Bookings</h1>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-3">
          {["all", ...statusOptions].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-md text-sm border capitalize ${
                filter === s
                  ? "bg-gold-gradient text-aurelia-bg font-semibold border-transparent"
                  : "border-aurelia-border text-aurelia-muted hover:text-aurelia-text"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search guest, room, or code..."
          className="bg-aurelia-panel border border-aurelia-border rounded-md px-3 py-2 text-sm w-64"
        />
      </div>

      {loading ? (
        <p className="text-aurelia-muted">Loading bookings...</p>
      ) : (
        <div className="bg-aurelia-panel border border-aurelia-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-aurelia-panelLight text-aurelia-muted uppercase text-xs">
              <tr>
                <th className="text-left px-5 py-3">Booking</th>
                <th className="text-left px-5 py-3">Guest</th>
                <th className="text-left px-5 py-3">Room</th>
                <th className="text-left px-5 py-3">Dates</th>
                <th className="text-left px-5 py-3">Total</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((b) => (
                <tr key={b._id} className="border-t border-aurelia-border">
                  <td className="px-5 py-4 text-aurelia-muted">{b.bookingCode}</td>
                  <td className="px-5 py-4">
                    <p className="text-aurelia-text">{b.user?.name}</p>
                    <p className="text-xs text-aurelia-muted">{b.user?.email}</p>
                  </td>
                  <td className="px-5 py-4 text-aurelia-text">
                    {b.room?.name} <span className="text-aurelia-muted">#{b.room?.roomNumber}</span>
                  </td>
                  <td className="px-5 py-4 text-aurelia-muted">
                    {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                    <span className="block text-xs">{b.nights} nights · {b.guests} guests</span>
                  </td>
                  <td className="px-5 py-4 text-aurelia-gold">{formatPKR(b.totalAmount)}</td>
                  <td className="px-5 py-4">
                    <select
                      value={b.status}
                      onChange={(e) => updateStatus(b, e.target.value)}
                      className={`text-xs uppercase px-2 py-1 rounded border bg-transparent ${statusStyles[b.status]}`}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s} className="bg-aurelia-panel text-aurelia-text">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-aurelia-muted">
                    No bookings match.
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
