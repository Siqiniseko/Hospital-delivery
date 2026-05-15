import { Link } from "react-router-dom";
import { CalendarPlus, MapPinned, PackageCheck, ShieldCheck } from "lucide-react";

const features = [
  { icon: ShieldCheck, title: "Role-based portals", text: "Separate patient, driver, and admin workflows protected by JWT login." },
  { icon: CalendarPlus, title: "Care requests", text: "Patients can book appointments and request medicine delivery from one place." },
  { icon: PackageCheck, title: "Stock oversight", text: "Admins can review orders, inventory levels, and low-stock alerts." },
  { icon: MapPinned, title: "Live tracking", text: "Drivers broadcast location updates for patient and admin maps in real time." },
];

export default function Home() {
  return (
    <main className="home">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Hospital delivery operations</p>
          <h1>MedRoute</h1>
          <p className="lead">
            A complete Level 3 hospital medicine delivery website with patient requests,
            admin control, driver tracking, and secure authentication.
          </p>
          <div className="actions">
            <Link className="primary" to="/login">Sign in</Link>
            <Link className="secondary" to="/track/demo-delivery">Track demo delivery</Link>
          </div>
        </div>

        <div className="operation-board" aria-label="Live operations overview">
          <div className="route-card">
            <div>
              <span className="status-dot" />
              <p className="muted small">Active route</p>
              <h2>Durban Central</h2>
            </div>
            <strong>ETA 12 min</strong>
          </div>
          <div className="route-line">
            <span />
            <span />
            <span />
          </div>
          <div className="board-grid">
            <div><strong>24</strong><span>Orders today</span></div>
            <div><strong>8</strong><span>Drivers online</span></div>
            <div><strong>3</strong><span>Low stock items</span></div>
            <div><strong>99%</strong><span>Route uptime</span></div>
          </div>
        </div>
      </section>

      <section className="feature-grid" aria-label="Platform features">
        {features.map(({ icon: Icon, title, text }) => (
          <article className="card feature-card" key={title}>
            <Icon size={24} />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
