import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import BookingCard from "../components/BookingCard";
import { formatPKR } from "../utils/currency";
import { useAuth } from "../context/AuthContext";

export default function MyBookings() {
  const [data, setData] = useState({ stats: {}, upcoming: [], past: [] });
  const [tab, setTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modifyTarget, setModifyTarget] = useState(null);
  const [dates, setDates] = useState({ checkIn: "", checkOut: "" });
  const [invoiceTarget, setInvoiceTarget] = useState(null);
  const [invoiceMsg, setInvoiceMsg] = useState("");
  const [taxRatePercent, setTaxRatePercent] = useState(0);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/settings")
      .then((res) => setTaxRatePercent(res.data.taxRatePercent || 0))
      .catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    setError("");
    api
      .get("/bookings/my")
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          logout();
          navigate("/login");
          return;
        }
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load bookings. Is the backend server running?"
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (booking) => {
    if (!confirm("Cancel this booking?")) return;
    await api.put(`/bookings/${booking._id}/cancel`);
    load();
  };

  const openModify = (booking) => {
    setModifyTarget(booking);
    setDates({
      checkIn: booking.checkIn.slice(0, 10),
      checkOut: booking.checkOut.slice(0, 10),
    });
  };

  const submitModify = async (e) => {
    e.preventDefault();
    await api.put(`/bookings/${modifyTarget._id}`, dates);
    setModifyTarget(null);
    load();
  };

  const goRequests = (tab, booking) => navigate(`/requests?tab=${tab}&bookingId=${booking._id}`);

  const emailInvoice = async () => {
    setInvoiceMsg("Sending...");
    try {
      const { data } = await api.post(`/bookings/${invoiceTarget._id}/email-invoice`);
      setInvoiceMsg(
        data.sent
          ? "Invoice emailed successfully."
          : "Email isn't configured on the server yet — check the server console for the invoice."
      );
    } catch (err) {
      setInvoiceMsg(err.response?.data?.message || "Failed to email invoice.");
    }
  };

  const stats = [
    ["totalStays", "Total Stays"],
    ["upcomingCount", "Upcoming"],
    ["nightsStayed", "Nights Stayed"],
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <p className="uppercase text-aurelia-gold text-sm tracking-wide">Your History</p>
      <h1 className="font-serif text-4xl mt-2">My Bookings</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
        {stats.map(([key, label]) => (
          <div key={key} className="bg-aurelia-panel border border-aurelia-border rounded-lg p-6 text-center">
            <p className="font-serif text-3xl text-aurelia-gold">{data.stats?.[key] ?? 0}</p>
            <p className="text-aurelia-muted text-xs uppercase tracking-wide mt-2">{label}</p>
          </div>
        ))}
        <div className="bg-aurelia-panel border border-aurelia-border rounded-lg p-6 text-center">
          <p className="font-serif text-3xl text-aurelia-gold">{formatPKR(data.stats?.totalSpent ?? 0)}</p>
          <p className="text-aurelia-muted text-xs uppercase tracking-wide mt-2">Total Spent</p>
        </div>
      </div>

      <div className="flex gap-8 mt-10 border-b border-aurelia-border">
        <button
          onClick={() => setTab("upcoming")}
          className={`pb-3 text-sm uppercase tracking-wide ${
            tab === "upcoming" ? "text-aurelia-gold border-b-2 border-aurelia-gold" : "text-aurelia-muted"
          }`}
        >
          Upcoming ({data.upcoming?.length ?? 0})
        </button>
        <button
          onClick={() => setTab("past")}
          className={`pb-3 text-sm uppercase tracking-wide ${
            tab === "past" ? "text-aurelia-gold border-b-2 border-aurelia-gold" : "text-aurelia-muted"
          }`}
        >
          Past ({data.past?.length ?? 0})
        </button>
      </div>

      <div className="mt-8 space-y-6">
        {loading ? (
          <p className="text-aurelia-muted">Loading bookings...</p>
        ) : error ? (
          <div>
            <p className="text-red-400">{error}</p>
            <button
              onClick={load}
              className="mt-4 border border-aurelia-border rounded-md px-4 py-2 text-sm uppercase hover:border-aurelia-gold"
            >
              Retry
            </button>
          </div>
        ) : (data[tab] ?? []).length === 0 ? (
          <p className="text-aurelia-muted">No bookings here yet.</p>
        ) : (
          data[tab].map((b) => (
            <BookingCard
              key={b._id}
              booking={b}
              onModify={tab === "upcoming" ? openModify : undefined}
              onCancel={tab === "upcoming" ? handleCancel : undefined}
              onInvoice={setInvoiceTarget}
              onFeedback={(booking) => goRequests("feedback", booking)}
              onService={(booking) => goRequests("service", booking)}
              onIssue={(booking) => goRequests("maintenance", booking)}
            />
          ))
        )}
      </div>

      {modifyTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-aurelia-panel border border-aurelia-border rounded-lg max-w-sm w-full p-6">
            <h3 className="font-serif text-xl mb-4">Modify Dates</h3>
            <form onSubmit={submitModify} className="space-y-4">
              <div>
                <label className="text-xs uppercase text-aurelia-gold">Check-in</label>
                <input
                  type="date"
                  value={dates.checkIn}
                  onChange={(e) => setDates({ ...dates, checkIn: e.target.value })}
                  className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="text-xs uppercase text-aurelia-gold">Check-out</label>
                <input
                  type="date"
                  value={dates.checkOut}
                  onChange={(e) => setDates({ ...dates, checkOut: e.target.value })}
                  className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModifyTarget(null)}
                  className="flex-1 border border-aurelia-border rounded-md py-3 uppercase text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gold-gradient text-aurelia-bg font-semibold rounded-md py-3 uppercase text-sm"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {invoiceTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-aurelia-panel border border-aurelia-border rounded-lg max-w-sm w-full p-6">
            <h3 className="font-serif text-xl mb-4">Invoice — {invoiceTarget.bookingCode}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-aurelia-muted">Room</span>
                <span>{invoiceTarget.room?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-aurelia-muted">Rate / night</span>
                <span>{formatPKR(invoiceTarget.pricePerNight)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-aurelia-muted">Nights</span>
                <span>{invoiceTarget.nights}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-aurelia-muted">Subtotal</span>
                <span>{formatPKR(invoiceTarget.totalAmount)}</span>
              </div>
              {taxRatePercent > 0 && (
                <div className="flex justify-between">
                  <span className="text-aurelia-muted">Tax ({taxRatePercent}%)</span>
                  <span>{formatPKR(Math.round((invoiceTarget.totalAmount * taxRatePercent) / 100))}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-aurelia-border pt-2 mt-2 text-aurelia-gold font-semibold">
                <span>Total</span>
                <span>
                  {formatPKR(
                    invoiceTarget.totalAmount +
                      Math.round((invoiceTarget.totalAmount * taxRatePercent) / 100)
                  )}
                </span>
              </div>
            </div>

            {invoiceMsg && <p className="text-xs text-aurelia-goldLight mt-4">{invoiceMsg}</p>}

            <div className="flex gap-3 pt-6">
              <button
                onClick={() => {
                  setInvoiceTarget(null);
                  setInvoiceMsg("");
                }}
                className="flex-1 border border-aurelia-border rounded-md py-3 uppercase text-sm"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 border border-aurelia-gold/40 text-aurelia-goldLight rounded-md py-3 uppercase text-sm hover:border-aurelia-gold"
              >
                Print
              </button>
              <button
                onClick={emailInvoice}
                className="flex-1 bg-gold-gradient text-aurelia-bg font-semibold rounded-md py-3 uppercase text-sm"
              >
                Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
