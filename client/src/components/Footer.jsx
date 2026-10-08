export default function Footer() {
  return (
    <footer className="border-t border-aurelia-border">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-serif text-lg tracking-widest text-aurelia-goldLight">AURELIA</span>
        <p className="text-sm text-aurelia-muted">© 2026 Aurelia Grand Hotel. All rights reserved.</p>
        <div className="flex gap-6 text-sm text-aurelia-muted">
          <a href="#" className="hover:text-aurelia-text">Privacy</a>
          <a href="#" className="hover:text-aurelia-text">Terms</a>
          <a href="#" className="hover:text-aurelia-text">Contact</a>
        </div>
      </div>
    </footer>
  );
}
