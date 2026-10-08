import { useEffect, useState } from "react";
import api from "../../utils/api";
import { formatDate } from "../../utils/currency";

export default function AdminFeedback() {
  const [data, setData] = useState({ feedback: [], avgRating: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [replyDrafts, setReplyDrafts] = useState({});

  const load = () => {
    setLoading(true);
    api
      .get("/feedback")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const sendReply = async (id) => {
    const staffResponse = replyDrafts[id];
    if (!staffResponse?.trim()) return;
    await api.put(`/feedback/${id}/respond`, { staffResponse });
    setReplyDrafts((d) => ({ ...d, [id]: "" }));
    load();
  };

  return (
    <div className="p-8 max-w-4xl">
      <p className="uppercase text-aurelia-gold text-sm tracking-wide">Guest Feedback</p>
      <h1 className="font-serif text-3xl mt-2 mb-2">Reviews &amp; Ratings</h1>
      <p className="text-aurelia-muted text-sm mb-8">
        {data.count} review{data.count === 1 ? "" : "s"} · average {data.avgRating} / 5
      </p>

      {loading ? (
        <p className="text-aurelia-muted">Loading feedback...</p>
      ) : data.feedback.length === 0 ? (
        <p className="text-aurelia-muted">No feedback submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {data.feedback.map((f) => (
            <div key={f._id} className="bg-aurelia-panel border border-aurelia-border rounded-lg p-5">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <p className="text-aurelia-text">
                    {f.user?.name}{" "}
                    <span className="text-aurelia-muted text-xs">({f.user?.email})</span>
                  </p>
                  <p className="text-xs text-aurelia-muted mt-1">
                    {f.room?.name} · {formatDate(f.createdAt)}
                  </p>
                </div>
                <span className="text-aurelia-gold">
                  {"★".repeat(f.rating)}
                  {"☆".repeat(5 - f.rating)}
                </span>
              </div>
              {f.comment && <p className="text-sm text-aurelia-text mt-3">{f.comment}</p>}

              {f.staffResponse ? (
                <p className="text-xs text-aurelia-goldLight mt-3 border-t border-aurelia-border pt-3">
                  Your response: {f.staffResponse}
                </p>
              ) : (
                <div className="flex gap-2 mt-4">
                  <input
                    value={replyDrafts[f._id] || ""}
                    onChange={(e) => setReplyDrafts((d) => ({ ...d, [f._id]: e.target.value }))}
                    placeholder="Reply to this review..."
                    className="flex-1 bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => sendReply(f._id)}
                    className="border border-aurelia-gold/40 text-aurelia-goldLight rounded-md px-4 text-sm uppercase hover:border-aurelia-gold"
                  >
                    Reply
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
