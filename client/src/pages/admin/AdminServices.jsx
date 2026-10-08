import { useEffect, useState } from "react";
import api from "../../utils/api";
import { formatDate } from "../../utils/currency";

const LABELS = {
  room_service: "Room Service",
  wake_up_call: "Wake-up Call",
  transportation: "Transportation",
  housekeeping_extra: "Extra Housekeeping",
  other: "Other",
};
const STATUSES = ["pending", "in_progress", "completed", "cancelled"];
const statusStyles = {
  pending: "bg-amber-900/40 text-amber-300 border-amber-700/50",
  in_progress: "bg-blue-900/40 text-blue-300 border-blue-700/50",
  completed: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50",
  cancelled: "bg-red-900/40 text-red-300 border-red-700/50",
};

export default function AdminServices() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = () => {
    setLoading(true);
    api
      .get("/services")
      .then((res) => setRequests(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    await api.put(`/services/${id}/status`, { status });
    load();
  };

  const visible = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  return (
    <div className="p-8 max-w-5xl">
      <p className="uppercase text-aurelia-gold text-sm tracking-wide">Guest Services</p>
      <h1 className="font-serif text-3xl mt-2 mb-8">Service Requests</h1>

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
        <p className="text-aurelia-muted">No requests here.</p>
      ) : (
        <div className="space-y-4">
          {visible.map((r) => (
            <div key={r._id} className="bg-aurelia-panel border border-aurelia-border rounded-lg p-5">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <p className="text-aurelia-text">{LABELS[r.type] || r.type}</p>
                  <p className="text-xs text-aurelia-muted mt-1">
                    {r.user?.name} · {r.booking?.bookingCode} · {formatDate(r.createdAt)}
                    {r.scheduledFor && ` · for ${new Date(r.scheduledFor).toLocaleString("en-PK")}`}
                  </p>
                </div>
                <span className={`text-xs uppercase px-2 py-1 rounded border ${statusStyles[r.status]}`}>
                  {r.status.replace("_", " ")}
                </span>
              </div>
              {r.details && <p className="text-sm text-aurelia-text mt-3">{r.details}</p>}

              {r.status === "pending" && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => updateStatus(r._id, "in_progress")}
                    className="border border-aurelia-border rounded-md px-4 py-2 text-sm uppercase hover:border-aurelia-gold"
                  >
                    Start
                  </button>
                  <button
                    onClick={() => updateStatus(r._id, "completed")}
                    className="bg-gold-gradient text-aurelia-bg font-semibold rounded-md px-4 py-2 text-sm uppercase"
                  >
                    Mark Completed
                  </button>
                </div>
              )}
              {r.status === "in_progress" && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => updateStatus(r._id, "completed")}
                    className="bg-gold-gradient text-aurelia-bg font-semibold rounded-md px-4 py-2 text-sm uppercase"
                  >
                    Mark Completed
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
