import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../utils/api";
import { formatDate } from "../utils/currency";

const TABS = [
  { key: "feedback", label: "Feedback" },
  { key: "maintenance", label: "Report an Issue" },
  { key: "service", label: "Request a Service" },
];

const SERVICE_TYPES = [
  { value: "room_service", label: "Room Service" },
  { value: "wake_up_call", label: "Wake-up Call" },
  { value: "transportation", label: "Transportation" },
  { value: "housekeeping_extra", label: "Extra Housekeeping" },
  { value: "other", label: "Other" },
];

const statusStyles = {
  pending: "bg-amber-900/40 text-amber-300 border-amber-700/50",
  reported: "bg-amber-900/40 text-amber-300 border-amber-700/50",
  in_progress: "bg-blue-900/40 text-blue-300 border-blue-700/50",
  completed: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50",
  resolved: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50",
  cancelled: "bg-red-900/40 text-red-300 border-red-700/50",
};

export default function Requests() {
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState(params.get("tab") || "feedback");
  const [bookings, setBookings] = useState({ upcoming: [], past: [] });
  const [bookingId, setBookingId] = useState(params.get("bookingId") || "");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [myFeedback, setMyFeedback] = useState([]);

  const [issue, setIssue] = useState("");
  const [priority, setPriority] = useState("medium");
  const [myMaintenance, setMyMaintenance] = useState([]);

  const [serviceType, setServiceType] = useState("room_service");
  const [details, setDetails] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [myServices, setMyServices] = useState([]);

  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const allBookings = useMemo(
    () => [...(bookings.upcoming || []), ...(bookings.past || [])],
    [bookings]
  );
  const completedBookings = allBookings.filter((b) => b.status === "completed");

  const loadAll = () => {
    api.get("/bookings/my").then((res) => setBookings(res.data));
    api.get("/feedback/my").then((res) => setMyFeedback(res.data));
    api.get("/maintenance/my").then((res) => setMyMaintenance(res.data));
    api.get("/services/my").then((res) => setMyServices(res.data));
  };

  useEffect(loadAll, []);

  const changeTab = (t) => {
    setTab(t);
    setParams({ tab: t, ...(bookingId ? { bookingId } : {}) });
  };

  const flash = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 4000);
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!bookingId) return flash("Pick a completed stay first.");
    setBusy(true);
    try {
      await api.post("/feedback", { bookingId, rating, comment });
      setComment("");
      flash("Thanks — your feedback has been submitted.");
      loadAll();
    } catch (err) {
      flash(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setBusy(false);
    }
  };

  const submitMaintenance = async (e) => {
    e.preventDefault();
    const booking = allBookings.find((b) => b._id === bookingId);
    if (!booking) return flash("Pick a stay so we know which room.");
    if (!issue.trim()) return flash("Describe the issue.");
    setBusy(true);
    try {
      await api.post("/maintenance", { roomId: booking.room._id, issue, priority });
      setIssue("");
      flash("Issue reported — our team has been notified.");
      loadAll();
    } catch (err) {
      flash(err.response?.data?.message || "Failed to report issue");
    } finally {
      setBusy(false);
    }
  };

  const submitService = async (e) => {
    e.preventDefault();
    if (!bookingId) return flash("Pick a stay first.");
    setBusy(true);
    try {
      await api.post("/services", {
        bookingId,
        type: serviceType,
        details,
        ...(scheduledFor && { scheduledFor }),
      });
      setDetails("");
      setScheduledFor("");
      flash("Request sent — our team will follow up.");
      loadAll();
    } catch (err) {
      flash(err.response?.data?.message || "Failed to send request");
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2 text-sm";

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="uppercase text-aurelia-gold text-sm tracking-wide">Guest Services</p>
      <h1 className="font-serif text-4xl mt-2">Feedback &amp; Requests</h1>
      <p className="text-aurelia-muted mt-3">
        Leave a review, report a maintenance issue, or request room service, a wake-up call
        or transportation for one of your stays.
      </p>

      <div className="flex gap-8 mt-10 border-b border-aurelia-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => changeTab(t.key)}
            className={`pb-3 text-sm uppercase tracking-wide ${
              tab === t.key ? "text-aurelia-gold border-b-2 border-aurelia-gold" : "text-aurelia-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {msg && (
        <div className="mt-6 bg-aurelia-panel border border-aurelia-gold/40 text-aurelia-goldLight rounded-md px-4 py-3 text-sm">
          {msg}
        </div>
      )}

      {tab === "feedback" && (
        <div className="mt-8 grid md:grid-cols-2 gap-10">
          <form onSubmit={submitFeedback} className="space-y-4">
            <div>
              <label className="text-xs uppercase text-aurelia-gold">Which stay?</label>
              <select
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select a completed stay</option>
                {completedBookings.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.room?.name} — {formatDate(b.checkIn)}
                  </option>
                ))}
              </select>
              {completedBookings.length === 0 && (
                <p className="text-xs text-aurelia-muted mt-2">
                  Feedback opens up once a stay is marked completed by the front desk.
                </p>
              )}
            </div>
            <div>
              <label className="text-xs uppercase text-aurelia-gold">Rating</label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setRating(n)}
                    className={`w-10 h-10 rounded-md border text-lg ${
                      n <= rating
                        ? "bg-gold-gradient border-transparent text-aurelia-bg"
                        : "border-aurelia-border text-aurelia-muted"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs uppercase text-aurelia-gold">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className={inputClass}
                placeholder="Tell us about your stay..."
              />
            </div>
            <button
              disabled={busy}
              className="bg-gold-gradient text-aurelia-bg font-semibold rounded-md px-6 py-3 uppercase text-sm disabled:opacity-50"
            >
              Submit Feedback
            </button>
          </form>

          <div>
            <p className="text-xs uppercase text-aurelia-gold mb-3">Your Reviews</p>
            <div className="space-y-3">
              {myFeedback.length === 0 && <p className="text-aurelia-muted text-sm">No reviews yet.</p>}
              {myFeedback.map((f) => (
                <div key={f._id} className="bg-aurelia-panel border border-aurelia-border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-aurelia-text">{f.room?.name}</span>
                    <span className="text-aurelia-gold text-sm">
                      {"★".repeat(f.rating)}
                      {"☆".repeat(5 - f.rating)}
                    </span>
                  </div>
                  {f.comment && <p className="text-aurelia-muted text-sm mt-2">{f.comment}</p>}
                  {f.staffResponse && (
                    <p className="text-xs text-aurelia-goldLight mt-2 border-t border-aurelia-border pt-2">
                      Management: {f.staffResponse}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "maintenance" && (
        <div className="mt-8 grid md:grid-cols-2 gap-10">
          <form onSubmit={submitMaintenance} className="space-y-4">
            <div>
              <label className="text-xs uppercase text-aurelia-gold">Which room?</label>
              <select
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select a stay</option>
                {allBookings.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.room?.name} — {formatDate(b.checkIn)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase text-aurelia-gold">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClass}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High — needs urgent attention</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase text-aurelia-gold">Describe the issue</label>
              <textarea
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                rows={4}
                className={inputClass}
                placeholder="e.g. AC not cooling, leaking faucet..."
              />
            </div>
            <button
              disabled={busy}
              className="bg-gold-gradient text-aurelia-bg font-semibold rounded-md px-6 py-3 uppercase text-sm disabled:opacity-50"
            >
              Report Issue
            </button>
          </form>

          <div>
            <p className="text-xs uppercase text-aurelia-gold mb-3">Your Reports</p>
            <div className="space-y-3">
              {myMaintenance.length === 0 && <p className="text-aurelia-muted text-sm">No reports yet.</p>}
              {myMaintenance.map((m) => (
                <div key={m._id} className="bg-aurelia-panel border border-aurelia-border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-aurelia-text">{m.room?.name}</span>
                    <span className={`text-xs uppercase px-2 py-1 rounded border ${statusStyles[m.status]}`}>
                      {m.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-aurelia-muted text-sm mt-2">{m.issue}</p>
                  {m.resolutionNotes && (
                    <p className="text-xs text-aurelia-goldLight mt-2 border-t border-aurelia-border pt-2">
                      Update: {m.resolutionNotes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "service" && (
        <div className="mt-8 grid md:grid-cols-2 gap-10">
          <form onSubmit={submitService} className="space-y-4">
            <div>
              <label className="text-xs uppercase text-aurelia-gold">Which stay?</label>
              <select
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className={inputClass}
              >
                <option value="">Select a stay</option>
                {allBookings.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.room?.name} — {formatDate(b.checkIn)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase text-aurelia-gold">Service</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className={inputClass}
              >
                {SERVICE_TYPES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            {(serviceType === "wake_up_call" || serviceType === "transportation") && (
              <div>
                <label className="text-xs uppercase text-aurelia-gold">
                  {serviceType === "wake_up_call" ? "Wake-up time" : "Pickup time"}
                </label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}
            <div>
              <label className="text-xs uppercase text-aurelia-gold">Details</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                className={inputClass}
                placeholder="Any specifics we should know..."
              />
            </div>
            <button
              disabled={busy}
              className="bg-gold-gradient text-aurelia-bg font-semibold rounded-md px-6 py-3 uppercase text-sm disabled:opacity-50"
            >
              Send Request
            </button>
          </form>

          <div>
            <p className="text-xs uppercase text-aurelia-gold mb-3">Your Requests</p>
            <div className="space-y-3">
              {myServices.length === 0 && <p className="text-aurelia-muted text-sm">No requests yet.</p>}
              {myServices.map((s) => (
                <div key={s._id} className="bg-aurelia-panel border border-aurelia-border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-aurelia-text">
                      {SERVICE_TYPES.find((t) => t.value === s.type)?.label || s.type}
                    </span>
                    <span className={`text-xs uppercase px-2 py-1 rounded border ${statusStyles[s.status]}`}>
                      {s.status.replace("_", " ")}
                    </span>
                  </div>
                  {s.details && <p className="text-aurelia-muted text-sm mt-2">{s.details}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
