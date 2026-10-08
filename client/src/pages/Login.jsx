import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await login(form.email, form.password);
    if (res.success) navigate("/");
    else setError(res.message);
  };

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <h1 className="font-serif text-3xl text-center">Welcome Back</h1>
      <p className="text-aurelia-muted text-center mt-2 text-sm">
        Sign in to manage your reservations at Aurelia.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div>
          <label className="text-xs uppercase text-aurelia-gold">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-2 w-full bg-aurelia-panel border border-aurelia-border rounded-md px-3 py-3"
            placeholder="james.harlow@email.com"
          />
        </div>
        <div>
          <label className="text-xs uppercase text-aurelia-gold">Password</label>
          <input
            required
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-2 w-full bg-aurelia-panel border border-aurelia-border rounded-md px-3 py-3"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold-gradient text-aurelia-bg font-semibold uppercase tracking-wide rounded-md py-3"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-aurelia-muted mt-6">
        New to Aurelia?{" "}
        <Link to="/register" className="text-aurelia-gold hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
