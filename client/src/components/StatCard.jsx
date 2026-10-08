export default function StatCard({ label, value, sub, accent = "text-aurelia-gold" }) {
  return (
    <div className="bg-aurelia-panel border border-aurelia-border rounded-lg p-6">
      <p className="text-xs uppercase tracking-wide text-aurelia-muted">{label}</p>
      <p className={`font-serif text-3xl mt-2 ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-aurelia-muted mt-1">{sub}</p>}
    </div>
  );
}
