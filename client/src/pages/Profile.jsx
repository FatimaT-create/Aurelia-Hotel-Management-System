import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { formatPKR } from "../utils/currency";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const { setUser, logout } = useAuth();
  const navigate = useNavigate();

  const load = () => {
    setError("");
    api
      .get("/users/me")
      .then((res) => {
        setProfile(res.data);
        setForm({ name: res.data.name, phone: res.data.phone });
      })
      .catch((err) => {
        const status = err.response?.status;
        if (status === 401) {
          // Token missing/expired/invalid — send back to login
          logout();
          navigate("/login");
          return;
        }
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load profile. Is the backend server running?"
        );
      });
  };

  useEffect(load, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    const { data } = await api.put("/users/me", form);
    setEditing(false);
    setUser((u) => ({ ...u, name: data.name }));
    load();
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-red-400">{error}</p>
        <button
          onClick={load}
          className="mt-4 border border-aurelia-border rounded-md px-4 py-2 text-sm uppercase hover:border-aurelia-gold"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!profile) return <div className="max-w-4xl mx-auto px-6 py-16 text-aurelia-muted">Loading profile...</div>;

  const tierMax = profile.currentTierMin + (profile.pointsToNext || 0) + (profile.loyaltyPoints - profile.currentTierMin);
  const progressPct = profile.nextTier
    ? Math.min(
        100,
        ((profile.loyaltyPoints - profile.currentTierMin) /
          (profile.loyaltyPoints + profile.pointsToNext - profile.currentTierMin)) *
          100
      )
    : 100;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="uppercase text-aurelia-gold text-sm tracking-wide">Account</p>
      <h1 className="font-serif text-4xl mt-2">Guest Profile</h1>

      <div className="bg-aurelia-panel border border-aurelia-border rounded-lg mt-8">
        <div className="flex items-center gap-4 p-6 border-b border-aurelia-border">
          <div className="w-16 h-16 rounded-md bg-gold-gradient flex items-center justify-center font-serif text-2xl font-bold text-aurelia-bg">
            {profile.initials}
          </div>
          <div>
            <h2 className="font-serif text-2xl">{profile.name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs border border-aurelia-gold/40 text-aurelia-goldLight rounded px-2 py-1 uppercase">
                {profile.loyaltyTier} Member
              </span>
              <span className="text-aurelia-muted text-sm">{profile.loyaltyId}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="uppercase text-xs tracking-wide text-aurelia-gold">Personal Information</p>
            <button
              onClick={() => setEditing((v) => !v)}
              className="text-xs uppercase border border-aurelia-border rounded px-3 py-1.5 hover:border-aurelia-gold"
            >
              {editing ? "Close" : "Edit Profile"}
            </button>
          </div>

          {editing ? (
            <form onSubmit={saveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase text-aurelia-muted">Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="text-xs uppercase text-aurelia-muted">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="sm:col-span-2 bg-gold-gradient text-aurelia-bg font-semibold rounded-md py-3 uppercase text-sm"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase text-aurelia-muted">Full Name</p>
                <p className="mt-1">{profile.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-aurelia-muted">Email Address</p>
                <p className="mt-1">{profile.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-aurelia-muted">Phone</p>
                <p className="mt-1">{profile.phone || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-aurelia-muted">Loyalty ID</p>
                <p className="mt-1">{profile.loyaltyId}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-aurelia-muted">Member Since</p>
                <p className="mt-1">
                  {new Date(profile.memberSince).toLocaleDateString("en-PK", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-aurelia-muted">Tier</p>
                <p className="mt-1">{profile.loyaltyTier}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-aurelia-panel border border-aurelia-border rounded-lg mt-6 p-6">
        <div className="flex items-center justify-between">
          <p className="uppercase text-xs tracking-wide text-aurelia-gold">Loyalty Status</p>
          <span className="text-xs border border-aurelia-gold/40 text-aurelia-goldLight rounded px-2 py-1 uppercase">
            {profile.loyaltyTier}
          </span>
        </div>

        <div className="flex items-end justify-between mt-4">
          <p className="font-serif text-3xl">{profile.loyaltyPoints.toLocaleString()} Points</p>
          {profile.nextTier && (
            <p className="text-aurelia-muted text-sm">
              {profile.pointsToNext.toLocaleString()} pts to {profile.nextTier}
            </p>
          )}
        </div>

        <div className="h-2 bg-aurelia-bg rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-gold-gradient rounded-full" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-aurelia-border text-center">
          <div>
            <p className="font-serif text-2xl text-aurelia-gold">{profile.loyaltyStats.stays}</p>
            <p className="text-xs uppercase text-aurelia-muted mt-1">Stays</p>
          </div>
          <div>
            <p className="font-serif text-2xl text-aurelia-gold">{profile.loyaltyStats.nights}</p>
            <p className="text-xs uppercase text-aurelia-muted mt-1">Nights</p>
          </div>
          <div>
            <p className="font-serif text-2xl text-aurelia-gold">{formatPKR(profile.loyaltyStats.earned)}</p>
            <p className="text-xs uppercase text-aurelia-muted mt-1">Earned</p>
          </div>
        </div>
      </div>
    </div>
  );
}