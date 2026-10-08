import { useEffect, useState } from "react";
import api from "../../utils/api";

const statusOptions = ["available", "occupied", "cleaning", "maintenance"];
const statusStyles = {
  available: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50",
  occupied: "bg-red-900/40 text-red-300 border-red-700/50",
  cleaning: "bg-amber-900/40 text-amber-300 border-amber-700/50",
  maintenance: "bg-slate-800/60 text-slate-300 border-slate-600/50",
};

// Housekeeping staff can only see rooms and flip their status —
// no pricing, no editing, no guest data. Matches the "Housekeeping
// Management" requirement: view room status, mark cleaning done,
// flag maintenance issues.
export default function AdminHousekeeping() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = () => {
    setLoading(true);
    api
      .get("/rooms")
      .then((res) => setRooms(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const changeStatus = async (room, status) => {
    await api.put(`/rooms/${room._id}/status`, { status });
    load();
  };

  const visible = filter === "all" ? rooms : rooms.filter((r) => r.status === filter);

  return (
    <div className="p-8 max-w-5xl">
      <p className="uppercase text-aurelia-gold text-sm tracking-wide">Housekeeping</p>
      <h1 className="font-serif text-3xl mt-2 mb-8">Room Status</h1>

      <div className="flex gap-3 mb-6">
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

      {loading ? (
        <p className="text-aurelia-muted">Loading rooms...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((room) => (
            <div key={room._id} className="bg-aurelia-panel border border-aurelia-border rounded-lg p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-serif text-lg text-aurelia-text">{room.name}</p>
                  <p className="text-xs text-aurelia-muted mt-1">
                    #{room.roomNumber} · Floor {room.floor}
                  </p>
                </div>
                <span className="text-xs uppercase text-aurelia-muted border border-aurelia-border rounded px-2 py-1">
                  {room.type}
                </span>
              </div>

              <label className="text-xs uppercase text-aurelia-gold block mt-4 mb-2">Status</label>
              <select
                value={room.status}
                onChange={(e) => changeStatus(room, e.target.value)}
                className={`w-full text-sm px-3 py-2 rounded-md border bg-transparent ${statusStyles[room.status]}`}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s} className="bg-aurelia-panel text-aurelia-text">
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {visible.length === 0 && (
            <p className="text-aurelia-muted col-span-full text-center py-10">No rooms match this filter.</p>
          )}
        </div>
      )}
    </div>
  );
}