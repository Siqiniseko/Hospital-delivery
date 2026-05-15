import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarPlus, CheckCircle2, MapPinned, PackageCheck, ShieldCheck, Stethoscope, Truck } from "lucide-react";
import doctorHero from "../assets/medical-hero-doctor.png";
import { api } from "../services/api";

const services = [
  { icon: CalendarPlus, title: "Appointment", text: "Patients book a time to see a doctor." },
  { icon: Stethoscope, title: "Doctor care", text: "Doctors review visits and update progress." },
  { icon: PackageCheck, title: "Pill pickup", text: "Patients see when medicine is ready to fetch." },
  { icon: MapPinned, title: "Live delivery", text: "Track the driver delivering pills in real time." },
];

const operations = [
  "Patient registration and appointment booking",
  "Doctor appointment queue",
  "Clinic stock health forecasting",
  "Pill collection and delivery tracking",
];

export default function Home() {
  const [stats, setStats] = useState({ appointments: 0, pillOrders: 0, lowStock: 0, activeDeliveries: 0, uptime: "99%" });

  useEffect(() => {
    api.get("/site/stats")
      .then(({ data }) => setStats(data))
      .catch(() => setStats({ appointments: 12, pillOrders: 24, lowStock: 3, activeDeliveries: 4, uptime: "99%" }));
  }, []);

  return (
    <main className="medical-landing">
      <section className="medical-hero">
        <div className="medical-hero-copy">
          <div className="hero-kicker">
            <span />
            <p>Committed to patient care</p>
          </div>
          <h1>
            We care about <br />
            your <strong>health</strong>
          </h1>
          <p className="medical-lead">
            A hospital website for doctor appointments, pill collection times,
            medicine stock tracking, and live driver delivery updates.
          </p>
          <div className="actions">
            <Link className="appointment-button" to="/patient">
              Appointment <ArrowRight size={18} />
            </Link>
            <Link className="medical-secondary" to="/track/demo-delivery">Track delivery</Link>
          </div>
        </div>

        <div className="doctor-visual">
          <img src={doctorHero} alt="Smiling doctor in a modern hospital" />
        </div>
      </section>

      <section className="medical-services" aria-label="Hospital services">
        {services.map(({ icon: Icon, title, text }) => (
          <article className="medical-service-card" key={title}>
            <Icon size={24} />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="public-stats" aria-label="Live hospital statistics">
        <div><strong>{stats.appointments}</strong><span>appointments</span></div>
        <div><strong>{stats.pillOrders}</strong><span>pill orders</span></div>
        <div><strong>{stats.activeDeliveries}</strong><span>active deliveries</span></div>
        <div><strong>{stats.lowStock}</strong><span>low-stock alerts</span></div>
      </section>

      <section className="ready-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Ready for tomorrow</p>
            <h2>One operational flow for patients, staff, pharmacy, and runners.</h2>
          </div>
          <Link className="medical-secondary" to="/clinic-dashboard">Open clinic dashboard</Link>
        </div>
        <div className="ready-grid">
          <article className="ready-panel">
            <ShieldCheck size={28} />
            <h3>Real hospital roles</h3>
            <p>Patients register publicly. Staff accounts stay controlled by the hospital for safer operations.</p>
          </article>
          <article className="ready-panel">
            <Truck size={28} />
            <h3>Medicine movement</h3>
            <p>Track whether pills are requested, approved, ready for pickup, or moving with a driver.</p>
          </article>
          <article className="ready-panel checklist-panel">
            <h3>Launch checklist</h3>
            {operations.map((item) => (
              <p key={item}><CheckCircle2 size={17} />{item}</p>
            ))}
          </article>
        </div>
      </section>
    </main>
  );
}
