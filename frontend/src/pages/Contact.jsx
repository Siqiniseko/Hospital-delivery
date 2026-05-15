import React, { useState } from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { api } from "../services/api";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  async function submit(event) {
    event.preventDefault();
    setSent(false);
    setError("");
    try {
      await api.post("/site/contact", form);
      setSent(true);
      setForm({ name: "", email: "", message: "" });
    } catch {
      setError("Could not send through the API. Please try again when the backend is running.");
    }
  }

  return (
    <main className="content-page">
      <section className="content-hero contact-hero">
        <div>
          <p className="hero-kicker text-only">Contact us</p>
          <h1>Need help with appointments, pills, or delivery?</h1>
          <p>
            Reach the hospital team for patient support, medicine collection times,
            delivery tracking, or appointment questions.
          </p>
        </div>
      </section>

      <section className="contact-layout">
        <div className="contact-cards">
          <article className="contact-card">
            <Phone size={26} />
            <h3>Call us</h3>
            <p>01654.066.456</p>
          </article>
          <article className="contact-card">
            <Mail size={26} />
            <h3>Email</h3>
            <p>support@medicalhospital.com</p>
          </article>
          <article className="contact-card">
            <MapPin size={26} />
            <h3>Visit</h3>
            <p>City Hospital Pharmacy, Durban</p>
          </article>
        </div>

        <form className="panel contact-form" onSubmit={submit}>
          <div className="panel-heading">
            <span className="icon-pill"><Send size={22} /></span>
            <div>
              <p className="eyebrow">Send a message</p>
              <h2>Contact form</h2>
            </div>
          </div>
          <label>
            Full name
            <input placeholder="Your name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <label>
            Email
            <input type="email" placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label>
            Message
            <textarea placeholder="How can we help?" rows="5" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} required />
          </label>
          <button className="appointment-button">Send message</button>
          {sent && <p className="notice contact-confirmation">Message received. The hospital team will contact you shortly.</p>}
          {error && <p className="error contact-confirmation">{error}</p>}
        </form>
      </section>
    </main>
  );
}
