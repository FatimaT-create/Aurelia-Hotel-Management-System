import { useEffect, useState } from "react";
import api from "../../utils/api";
import { formatDate } from "../../utils/currency";

const STATUSES = ["reported", "in_progress", "resolved"];
const statusStyles = {
  reported: "bg-amber-900/40 text-amber-300 border-amber-700/50",
  in_progress: "bg-blue-900/40 text-blue-300 border-blue-700/50",
  resolved: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50",
};
const priorityStyles = {
  low: "text-aurelia-muted",
  medium: "text-amber-300",
  high: "text-red-400 font-semibold",
};

export default function AdminMaintenance() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [notes, setNotes] = useState({});

  const load = () => {
    setLoading(true);
    api
      .get("/maintenance")
      .then((res) => setRequests(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    await api.put(`/maintenance/${id}/status`, { status, resolutionNotes: notes[id] });
    load();
  };

  const visible = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  return (
    <div className="p-8 max-w-5xl">
      <p className="uppercase text-aurelia-gold text-sm tracking-wide">Maintenance</p>
      <h1 className="font-serif text-3xl mt-2 mb-8">Maintenance Requests</h1>

      <div className="flex gap-3 mb-6">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-md text-sm border capitalize ${
              filter === s
                ? "bg-gold-gradient text-aurelia-bg font-semibold border-transparent"
                : "border-aurelia-border text-aurelia-muted hover:text-aurelia-text"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-aurelia-muted">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="text-aurelia-muted">No maintenance requests here.</p>
      ) : (
        <div className="space-y-4">
          {visible.map((r) => (
            <div key={r._id} className="bg-aurelia-panel border border-aurelia-border rounded-lg p-5">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <p className="text-aurelia-text">
                    {r.room?.name} <span className="text-aurelia-muted text-xs">#{r.room?.roomNumber}</span>
                  </p>
                  <p className="text-xs text-aurelia-muted mt-1">
                    Reported by {r.reportedBy?.name} ({r.reportedBy?.role}) · {formatDate(r.createdAt)}
                  </p>
                </div>
                <span className={`text-xs uppercase px-2 py-1 rounded border ${statusStyles[r.status]}`}>
                  {r.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm text-aurelia-text mt-3">{r.issue}</p>
              <p className={`text-xs uppercase mt-2 ${priorityStyles[r.priority]}`}>{r.priority} priority</p>

              {r.status !== "resolved" && (
                <div className="flex gap-2 mt-4">
                  <input
                    value={notes[r._id] ?? r.resolutionNotes ?? ""}
                    onChange={(e) => setNotes((n) => ({ ...n, [r._id]: e.target.value }))}
                    placeholder="Resolution note (optional)"
                    className="flex-1 bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2 text-sm"
                  />
                  {r.status === "reported" && (
                    <button
                      onClick={() => updateStatus(r._id, "in_progress")}
                      className="border border-aurelia-border rounded-md px-4 text-sm uppercase hover:border-aurelia-gold"
                    >
                      Start
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(r._id, "resolved")}
                    className="bg-gold-gradient text-aurelia-bg font-semibold rounded-md px-4 text-sm uppercase"
                  >
                    Resolve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
