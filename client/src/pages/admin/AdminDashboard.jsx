import { useEffect, useState } from "react";
import api from "../../utils/api";
import { formatPKR, formatDate } from "../../utils/currency";
import StatCard from "../../components/StatCard";

const statusStyles = {
  confirmed: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50",
  completed: "bg-blue-900/40 text-blue-300 border-blue-700/50",
  cancelled: "bg-red-900/40 text-red-300 border-red-700/50",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-aurelia-muted">Loading dashboard...</div>;
  if (error) return <div className="p-10 text-red-400">{error}</div>;

  const maxTypeRevenue = Math.max(1, ...Object.values(stats.revenueByType));

  return (
    <div className="p-8 max-w-7xl">
      <p className="uppercase text-aurelia-gold text-sm tracking-wide">Overview</p>
      <h1 className="font-serif text-3xl mt-2 mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard label="Total Revenue" value={formatPKR(stats.totalRevenue)} />
        <StatCard label="Total Bookings" value={stats.totalBookings} />
        <StatCard
          label="Occupancy Rate"
          value={`${stats.occupancyRate}%`}
          sub={`${stats.occupiedRooms} of ${stats.totalRooms} rooms`}
        />
        <StatCard label="Total Guests" value={stats.totalGuests} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Booking status breakdown */}
        <div className="bg-aurelia-panel border border-aurelia-border rounded-lg p-6">
          <h2 className="font-serif text-lg mb-5">Bookings by Status</h2>
          <div className="space-y-4">
            {Object.entries(stats.bookingsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span
                  className={`text-xs uppercase px-2 py-1 rounded border ${statusStyles[status]}`}
                >
                  {status}
                </span>
                <span className="font-serif text-xl">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by room type */}
        <div className="bg-aurelia-panel border border-aurelia-border rounded-lg p-6">
          <h2 className="font-serif text-lg mb-5">Revenue by Room Type</h2>
          <div className="space-y-4">
            {Object.entries(stats.revenueByType).map(([type, revenue]) => (
              <div key={type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-aurelia-text">{type}</span>
                  <span className="text-aurelia-gold">{formatPKR(revenue)}</span>
                </div>
                <div className="h-2 bg-aurelia-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-gradient rounded-full"
                    style={{ width: `${(revenue / maxTypeRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(stats.revenueByType).length === 0 && (
              <p className="text-aurelia-muted text-sm">No revenue yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent bookings feed */}
      <div className="bg-aurelia-panel border border-aurelia-border rounded-lg p-6 mt-6">
        <h2 className="font-serif text-lg mb-5">Recent Bookings</h2>
        <div className="space-y-3">
          {stats.recentBookings.map((b) => (
            <div
              key={b._id}
              className="flex items-center justify-between border-b border-aurelia-border last:border-0 pb-3 last:pb-0"
            >
              <div>
                <p className="text-sm text-aurelia-text">
                  {b.user?.name} — {b.room?.name}
                </p>
                <p className="text-xs text-aurelia-muted mt-1">
                  {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {b.bookingCode}
                </p>
              </div>
              <div className="text-right">
                <p className="text-aurelia-gold text-sm font-semibold">{formatPKR(b.totalAmount)}</p>
                <span
                  className={`inline-block mt-1 text-xs uppercase px-2 py-0.5 rounded border ${statusStyles[b.status]}`}
                >
                  {b.status}
                </span>
              </div>
            </div>
          ))}
          {stats.recentBookings.length === 0 && (
            <p className="text-aurelia-muted text-sm">No bookings yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
