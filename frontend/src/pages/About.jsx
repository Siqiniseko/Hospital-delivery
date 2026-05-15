import React from "react";
import { Link } from "react-router-dom";
import { Activity, CalendarCheck, HeartPulse, PackageCheck, ShieldCheck, Truck } from "lucide-react";

const values = [
  { icon: CalendarCheck, title: "Coordinated care", text: "Patients, doctors, pharmacy staff, drivers, and administrators work from one connected system." },
  { icon: PackageCheck, title: "Medicine visibility", text: "Pill requests can be approved, prepared, marked ready, collected, or delivered with clear status updates." },
  { icon: Truck, title: "Delivery confidence", text: "Live driver tracking helps patients and staff know where medicine deliveries are at every step." },
];

export default function About() {
  return (
    <main className="content-page">
      <section className="content-hero about-hero">
        <div>
          <p className="hero-kicker text-only">About Medical.</p>
          <h1>Connected hospital care from appointment to medicine handover.</h1>
          <p>
            Medical. is built for a modern hospital workflow: patients book appointments,
            doctors manage consultations, pharmacy teams track pill readiness, and drivers
            deliver medication with live location updates.
          </p>
          <Link className="appointment-button" to="/patient">Book appointment</Link>
        </div>
      </section>

      <section className="about-grid">
        <article className="about-story">
          <p className="eyebrow">Our mission</p>
          <h2>Make medicine access simpler, safer, and easier to follow.</h2>
          <p>
            A patient should not have to guess when pills are ready or whether a delivery
            driver is on the way. This website keeps the hospital journey visible from
            the first appointment request through collection or delivery.
          </p>
        </article>

        <aside className="about-stat-panel">
          <div><strong>4</strong><span>role-based portals</span></div>
          <div><strong>24/7</strong><span>delivery visibility</span></div>
          <div><strong>1</strong><span>connected care flow</span></div>
        </aside>
      </section>

      <section className="value-grid">
        {values.map(({ icon: Icon, title, text }) => (
          <article className="medical-service-card" key={title}>
            <Icon size={26} />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="care-strip">
        <HeartPulse size={30} />
        <div>
          <h2>Designed for patients, doctors, pharmacy, drivers, and admin teams.</h2>
          <p>Every page supports the hospital delivery system you requested: appointment booking, pill tracking, pickup dates, and driver tracking.</p>
        </div>
        <Activity size={30} />
        <ShieldCheck size={30} />
      </section>
    </main>
  );
}
