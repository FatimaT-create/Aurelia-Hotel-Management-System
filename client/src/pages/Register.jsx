import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await register(form);
    if (res.success) navigate("/");
    else setError(res.message);
  };

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <h1 className="font-serif text-3xl text-center">Join Aurelia</h1>
      <p className="text-aurelia-muted text-center mt-2 text-sm">
        Create a guest account to start booking and earning loyalty points.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div>
          <label className="text-xs uppercase text-aurelia-gold">Full Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-2 w-full bg-aurelia-panel border border-aurelia-border rounded-md px-3 py-3"
          />
        </div>
        <div>
          <label className="text-xs uppercase text-aurelia-gold">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-2 w-full bg-aurelia-panel border border-aurelia-border rounded-md px-3 py-3"
          />
        </div>
        <div>
          <label className="text-xs uppercase text-aurelia-gold">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-2 w-full bg-aurelia-panel border border-aurelia-border rounded-md px-3 py-3"
          />
        </div>
        <div>
          <label className="text-xs uppercase text-aurelia-gold">Password</label>
          <input
            required
            minLength={6}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-2 w-full bg-aurelia-panel border border-aurelia-border rounded-md px-3 py-3"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold-gradient text-aurelia-bg font-semibold uppercase tracking-wide rounded-md py-3"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-aurelia-muted mt-6">
        Already a member?{" "}
        <Link to="/login" className="text-aurelia-gold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
