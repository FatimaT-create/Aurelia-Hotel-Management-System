import { useEffect, useState } from "react";
import api from "../../utils/api";

export default function AdminSettings() {
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/settings").then((res) => setForm(res.data));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const { data } = await api.put("/settings", form);
    setForm(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!form) return <div className="p-8 text-aurelia-muted">Loading settings...</div>;

  const field = (label, key, type = "text") => (
    <div>
      <label className="text-xs uppercase text-aurelia-gold">{label}</label>
      <input
        type={type}
        value={form[key] ?? ""}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2 text-sm"
      />
    </div>
  );

  return (
    <div className="p-8 max-w-2xl">
      <p className="uppercase text-aurelia-gold text-sm tracking-wide">System Administration</p>
      <h1 className="font-serif text-3xl mt-2 mb-8">System Settings</h1>

      <form onSubmit={save} className="space-y-5 bg-aurelia-panel border border-aurelia-border rounded-lg p-6">
        {field("Hotel Name", "hotelName")}
        {field("Contact Email", "contactEmail", "email")}
        {field("Contact Phone", "contactPhone")}
        <div className="grid grid-cols-2 gap-4">
          {field("Check-in Time", "checkInTime")}
          {field("Check-out Time", "checkOutTime")}
        </div>
        {field("Tax Rate (%)", "taxRatePercent", "number")}
        {field("Currency Code", "currency")}
        <div>
          <label className="text-xs uppercase text-aurelia-gold">Cancellation Policy</label>
          <textarea
            value={form.cancellationPolicy ?? ""}
            onChange={(e) => setForm({ ...form, cancellationPolicy: e.target.value })}
            rows={3}
            className="mt-2 w-full bg-aurelia-bg border border-aurelia-border rounded-md px-3 py-2 text-sm"
          />
        </div>

        <button className="bg-gold-gradient text-aurelia-bg font-semibold rounded-md px-6 py-3 uppercase text-sm">
          Save Settings
        </button>
        {saved && <span className="ml-4 text-emerald-400 text-sm">Saved.</span>}
      </form>
    </div>
  );
}
