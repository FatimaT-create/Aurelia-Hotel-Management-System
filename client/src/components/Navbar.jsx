import { NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { isStaff, ROLE_LANDING } from "../utils/permissions";

const navLinkClass = ({ isActive }) =>
  `text-sm tracking-wide uppercase transition-colors ${
    isActive ? "text-aurelia-gold border-b-2 border-aurelia-gold pb-1" : "text-aurelia-muted hover:text-aurelia-text"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-aurelia-bg/95 backdrop-blur border-b border-aurelia-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-gold-gradient flex items-center justify-center font-serif font-bold text-aurelia-bg">
            A
          </div>
          <span className="font-serif text-xl tracking-widest text-aurelia-text">AURELIA</span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-10">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/rooms" className={navLinkClass}>
            Rooms
          </NavLink>
          <NavLink to="/bookings" className={navLinkClass}>
            My Bookings
          </NavLink>
        </nav>

        {user ? (
          <div className="flex items-center gap-3">
            {isStaff(user.role) && (
              <button
                onClick={() => navigate(ROLE_LANDING[user.role] || "/admin")}
                className="text-xs uppercase tracking-wide border border-aurelia-gold/40 rounded-md px-3 py-1.5 text-aurelia-goldLight hover:border-aurelia-gold"
              >
                Admin Console
              </button>
            )}

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 border border-aurelia-gold/40 rounded-full pl-1.5 pr-4 py-1.5 hover:border-aurelia-gold transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center text-xs font-bold text-aurelia-bg">
                  {user.initials || user.name?.slice(0, 2).toUpperCase()}
                </span>
                <span className="text-sm text-aurelia-goldLight">{user.name}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-aurelia-panel border border-aurelia-border rounded-md shadow-lg overflow-hidden">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-aurelia-text hover:bg-aurelia-panelLight"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/bookings");
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-aurelia-text hover:bg-aurelia-panelLight"
                  >
                    My Bookings
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/requests");
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-aurelia-text hover:bg-aurelia-panelLight"
                  >
                    Feedback &amp; Requests
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-950/40 border-t border-aurelia-border"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="text-sm uppercase tracking-wide text-aurelia-bg bg-gold-gradient px-4 py-2 rounded-md font-semibold"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}