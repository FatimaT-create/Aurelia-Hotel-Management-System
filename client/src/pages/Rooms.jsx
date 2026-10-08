import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import RoomCard from "../components/RoomCard";
import { useAuth } from "../context/AuthContext";
import { formatPKR } from "../utils/currency";

const types = ["All", "Standard", "Deluxe", "Suite", "Presidential"];

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [type, setType] = useState("All");
  const [sort, setSort] = useState("price_asc");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // room being booked
  const [form, setForm] = useState({ checkIn: "", checkOut: "", guests: 2 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchRooms = () => {
    setLoading(true);
    api
      .get(`/rooms?type=${type}&sort=${sort}`)
      .then((res) => setRooms(res.data))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  };

  useEffect(fetchRooms, [type, sort]);

  useEffect(() => {
    if (location.state?.checkIn) {
      setForm((f) => ({ ...f, ...location.state }));
    }
  }, [location.state]);

  const openReserve = (room) => {
    if (!user) return navigate("/login");
    setError("");
    setModal(room);
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/bookings", {
        roomId: modal._id,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: form.guests,
      });
      setModal(null);
      navigate("/bookings");
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const nights =
    form.checkIn && form.checkOut
      ? Math.max(0, Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000))
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <p className="uppercase text-aurelia-gold text-sm tracking-wide">Browse</p>
      <h1 className="font-serif text-4xl mt-2">Rooms &amp; Suites</h1>

      <div className="flex flex-wrap items-center justify-between gap-4 mt-8">
        <div className="flex flex-wrap gap-3">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-md text-sm border ${
                type === t
                  ? "bg-gold-gradient text-aurelia-bg font-semibold border-transparent"
                  : "border-aurelia-border text-aurelia-muted hover:text-aurelia-text"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-aurelia-panel border border-aurelia-border rounded-md px-3 py-2 text-sm"
        >
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>

      {loading ? (
        <p className="text-aurelia-muted mt-10">Loading rooms...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {rooms.map((room) => (
            <RoomCard key={room._id} room={room} onReserve={openReserve} />
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-aurelia-panel border border-aurelia-border rounded-lg max-w-md w-full p-6">
            <h3 className="font-serif text-2xl mb-1">{modal.name}</h3>
            <p className="text-aurelia-muted text-sm mb-6">
              {formatPKR(modal.pricePerNight)} /night · Room #{modal.roomNumber}
            </p>

            <form onSubmit={submitBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase text-aurelia-gold">Check-in</label>
                  <input
                    required
                    type="date"
                    value={form.checkIn}
                    onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                    className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase text-aurelia-gold">Check-out</label>
                  <input
                    required
                    type="date"
                    value={form.checkOut}
                    onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                    className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs uppercase text-aurelia-gold">Guests</label>
                <select
                  value={form.guests}
                  onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
                  className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2"
                >
                  {Array.from({ length: modal.capacity }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} Guest{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {nights > 0 && (
                <div className="flex justify-between text-sm border-t border-aurelia-border pt-3">
                  <span className="text-aurelia-muted">
                    {nights} night{nights > 1 ? "s" : ""} × {formatPKR(modal.pricePerNight)}
                  </span>
                  <span className="text-aurelia-gold font-semibold">
                    {formatPKR(nights * modal.pricePerNight)}
                  </span>
                </div>
              )}

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="flex-1 border border-aurelia-border rounded-md py-3 uppercase text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gold-gradient text-aurelia-bg font-semibold rounded-md py-3 uppercase text-sm"
                >
                  {submitting ? "Booking..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
