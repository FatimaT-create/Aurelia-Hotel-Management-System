import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { can } from "../utils/permissions";
import NotificationBell from "./NotificationBell";

const allLinks = [
  { to: "/admin", label: "Dashboard", icon: "📊", end: true, feature: "dashboard" },
  { to: "/admin/rooms", label: "Rooms", icon: "🛏️", feature: "rooms" },
  { to: "/admin/bookings", label: "Bookings", icon: "📖", feature: "bookings" },
  { to: "/admin/staff", label: "Staff & Guests", icon: "👥", feature: "staff" },
  { to: "/admin/housekeeping", label: "Housekeeping", icon: "🧹", feature: "housekeeping" },
  { to: "/admin/maintenance", label: "Maintenance", icon: "🔧", feature: "maintenance" },
  { to: "/admin/services", label: "Guest Requests", icon: "🛎️", feature: "services" },
  { to: "/admin/feedback", label: "Feedback", icon: "⭐", feature: "feedback" },
  { to: "/admin/settings", label: "Settings", icon: "⚙️", feature: "settings" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = allLinks.filter((l) => can(user.role, l.feature));

  return (
    <div className="min-h-screen flex bg-aurelia-bg">
      <aside className="w-64 shrink-0 border-r border-aurelia-border bg-aurelia-panel flex flex-col">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-aurelia-border">
          <div className="w-9 h-9 rounded-md bg-gold-gradient flex items-center justify-center font-serif font-bold text-aurelia-bg">
            A
          </div>
          <div>
            <p className="font-serif text-lg tracking-widest leading-none">AURELIA</p>
            <p className="text-xs text-aurelia-muted mt-1">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-gold-gradient text-aurelia-bg font-semibold"
                    : "text-aurelia-muted hover:text-aurelia-text hover:bg-aurelia-panelLight"
                }`
              }
            >
              <span>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-aurelia-border">
          <p className="text-sm text-aurelia-text">{user?.name}</p>
          <p className="text-xs text-aurelia-muted uppercase tracking-wide mt-1">{user?.role}</p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => navigate("/")}
              className="text-xs uppercase text-aurelia-muted hover:text-aurelia-text"
            >
              View Site
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="text-xs uppercase text-red-400 hover:text-red-300"
            >
              Log Out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="flex justify-end px-8 py-4 border-b border-aurelia-border">
          <NotificationBell />
        </div>
        <Outlet />
      </main>
    </div>
  );
}