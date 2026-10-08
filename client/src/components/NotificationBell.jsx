import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ notifications: [], unreadCount: 0 });
  const ref = useRef(null);
  const navigate = useNavigate();

  const load = () => {
    api
      .get("/notifications")
      .then((res) => setData(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const openNotification = async (n) => {
    if (!n.read) await api.put(`/notifications/${n._id}/read`);
    setOpen(false);
    load();
    if (n.link) navigate(n.link);
  };

  const markAllRead = async () => {
    await api.put("/notifications/read-all");
    load();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 rounded-full border border-aurelia-border flex items-center justify-center text-aurelia-muted hover:text-aurelia-text hover:border-aurelia-gold"
      >
        🔔
        {data.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {data.unreadCount > 9 ? "9+" : data.unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-aurelia-panel border border-aurelia-border rounded-md shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-aurelia-border">
            <span className="text-sm text-aurelia-text">Notifications</span>
            {data.unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-aurelia-goldLight hover:underline">
                Mark all read
              </button>
            )}
          </div>
          {data.notifications.length === 0 ? (
            <p className="text-aurelia-muted text-sm px-4 py-6 text-center">No notifications yet.</p>
          ) : (
            data.notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => openNotification(n)}
                className={`w-full text-left px-4 py-3 text-sm border-b border-aurelia-border last:border-0 hover:bg-aurelia-panelLight ${
                  n.read ? "text-aurelia-muted" : "text-aurelia-text"
                }`}
              >
                {!n.read && <span className="inline-block w-1.5 h-1.5 rounded-full bg-aurelia-gold mr-2" />}
                {n.message}
                <div className="text-[10px] text-aurelia-muted mt-1">
                  {new Date(n.createdAt).toLocaleString("en-PK")}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
