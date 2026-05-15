import React, { useEffect, useState } from "react";
import { CalendarPlus, Clock, PackageCheck, Pill, RefreshCw, Truck } from "lucide-react";
import { api } from "../services/api";

const statusOrder = ["requested", "approved", "preparing", "ready", "out_for_delivery", "collected", "delivered"];

function EmptyState({ children }) {
  return <p className="empty">{children}</p>;
}

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [appointmentForm, setAppointmentForm] = useState({
    doctorName: "Dr Mkhize",
    reason: "Check-up",
    date: "",
  });
  const [pillForm, setPillForm] = useState({
    pillName: "Paracetamol",
    dosage: "500mg",
    quantity: 20,
    deliveryType: "collection",
    collectionDate: "",
  });

  async function load() {
    setLoading(true);
    try {
      const [appointmentsResponse, ordersResponse] = await Promise.all([
        api.get("/appointments/mine"),
        api.get("/pills/orders/mine"),
      ]);
      setAppointments(appointmentsResponse.data);
      setOrders(ordersResponse.data);
    } catch {
      setMessage("Could not load patient data. Please login as the patient demo user.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createAppointment(event) {
    event.preventDefault();
    await api.post("/appointments", appointmentForm);
    setMessage("Appointment booked. The hospital can now approve it.");
    load();
  }

  async function createPillOrder(event) {
    event.preventDefault();
    await api.post("/pills/orders", pillForm);
    setMessage("Pill request submitted. Track approval and collection below.");
    load();
  }

  return (
    <main className="dashboard">
      <header className="page-header">
        <div>
          <p className="eyebrow">Patient portal</p>
          <h1>Appointments and pill tracking</h1>
        </div>
        <button className="secondary" onClick={load}><RefreshCw size={17} />Refresh</button>
      </header>

      {message && <p className="notice">{message}</p>}

      <section className="stats">
        <article className="metric card"><CalendarPlus size={24} /><span>Appointments</span><strong>{appointments.length}</strong></article>
        <article className="metric card"><Pill size={24} /><span>Pill requests</span><strong>{orders.length}</strong></article>
        <article className="metric card"><Clock size={24} /><span>Next pickup</span><strong>{nextCollectionLabel(orders)}</strong></article>
      </section>

      <div className="two">
        <form className="panel" onSubmit={createAppointment}>
          <div className="panel-heading">
            <span className="icon-pill"><CalendarPlus size={22} /></span>
            <h2>Book doctor appointment</h2>
          </div>
          <label>Doctor
            <input value={appointmentForm.doctorName} onChange={(event) => setAppointmentForm({ ...appointmentForm, doctorName: event.target.value })} required />
          </label>
          <label>Reason
            <input value={appointmentForm.reason} onChange={(event) => setAppointmentForm({ ...appointmentForm, reason: event.target.value })} required />
          </label>
          <label>Date and time
            <input type="datetime-local" value={appointmentForm.date} onChange={(event) => setAppointmentForm({ ...appointmentForm, date: event.target.value })} required />
          </label>
          <button className="primary">Book appointment</button>
        </form>

        <form className="panel" onSubmit={createPillOrder}>
          <div className="panel-heading">
            <span className="icon-pill"><Pill size={22} /></span>
            <h2>Request pills</h2>
          </div>
          <label>Medicine
            <input value={pillForm.pillName} onChange={(event) => setPillForm({ ...pillForm, pillName: event.target.value })} required />
          </label>
          <label>Dosage
            <input value={pillForm.dosage} onChange={(event) => setPillForm({ ...pillForm, dosage: event.target.value })} required />
          </label>
          <label>Quantity
            <input type="number" min="1" value={pillForm.quantity} onChange={(event) => setPillForm({ ...pillForm, quantity: Number(event.target.value) })} required />
          </label>
          <label>How will you receive it?
            <select value={pillForm.deliveryType} onChange={(event) => setPillForm({ ...pillForm, deliveryType: event.target.value })}>
              <option value="collection">I will fetch at the hospital</option>
              <option value="delivery">Deliver to my address</option>
            </select>
          </label>
          <label>{pillForm.deliveryType === "collection" ? "Fetch date and time" : "Preferred delivery date and time"}
            <input type="datetime-local" value={pillForm.collectionDate} onChange={(event) => setPillForm({ ...pillForm, collectionDate: event.target.value })} required />
          </label>
          <button className="primary">Submit request</button>
        </form>
      </div>

      <section className="data-grid">
        <div className="panel">
          <h2>My appointments</h2>
          {loading ? <EmptyState>Loading appointments...</EmptyState> : appointments.length === 0 ? <EmptyState>No appointments yet.</EmptyState> : appointments.map((item) => (
            <div className="list-row" key={item._id}>
              <div>
                <strong>{item.doctorName}</strong>
                <span>{new Date(item.date).toLocaleString()} - {item.reason}</span>
              </div>
              <span className="status">{formatStatus(item.status)}</span>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="panel-heading compact">
            <span className="icon-pill"><PackageCheck size={22} /></span>
            <div>
              <h2>My pill tracking</h2>
              <p className="muted">See approval, preparation, pickup, or delivery progress.</p>
            </div>
          </div>
          {loading ? <EmptyState>Loading orders...</EmptyState> : orders.length === 0 ? <EmptyState>No pill requests yet.</EmptyState> : orders.map((item) => (
            <article className="order-card" key={item._id}>
              <div className="list-row">
                <div>
                  <strong>{item.pillName}</strong>
                  <span>{item.dosage} x {item.quantity}</span>
                </div>
                <span className="status">{formatStatus(item.status)}</span>
              </div>
              <div className="timeline">
                {timelineSteps(item.deliveryType).map((step) => (
                  <span className={statusReached(item.status, step) ? "done" : ""} key={step}>{formatStatus(step)}</span>
                ))}
              </div>
              <p className="collection-note">
                {item.deliveryType === "delivery" ? <Truck size={17} /> : <Clock size={17} />}
                {item.deliveryType === "delivery" ? "Expected delivery" : "Fetch at hospital"}: {formatDateTime(item.collectionDate)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function timelineSteps(deliveryType) {
  return ["requested", "approved", "preparing", "ready", deliveryType === "delivery" ? "delivered" : "collected"];
}

function formatDateTime(value) {
  if (!value) return "Waiting for hospital confirmation";
  return new Date(value).toLocaleString();
}

function formatStatus(value) {
  return value.replaceAll("_", " ");
}

function statusReached(current, step) {
  return statusOrder.indexOf(current) >= statusOrder.indexOf(step);
}

function nextCollectionLabel(orders) {
  const next = orders
    .filter((order) => order.collectionDate && !["collected", "delivered", "cancelled"].includes(order.status))
    .sort((a, b) => new Date(a.collectionDate) - new Date(b.collectionDate))[0];
  if (!next) return "None";
  return new Date(next.collectionDate).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
