import { useEffect, useState } from "react";
import { CalendarPlus, Pill, RefreshCw } from "lucide-react";
import { api } from "../services/api";

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
    deliveryType: "delivery",
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
    setMessage("Appointment booked.");
    load();
  }

  async function createPillOrder(event) {
    event.preventDefault();
    await api.post("/pills/orders", pillForm);
    setMessage("Pill request submitted.");
    load();
  }

  return (
    <main className="dashboard">
      <header className="page-header">
        <div>
          <p className="eyebrow">Patient portal</p>
          <h1>Appointments and medicine requests</h1>
        </div>
        <button className="secondary" onClick={load}><RefreshCw size={17} />Refresh</button>
      </header>

      {message && <p className="notice">{message}</p>}

      <div className="two">
        <form className="panel" onSubmit={createAppointment}>
          <div className="panel-heading">
            <span className="icon-pill"><CalendarPlus size={22} /></span>
            <h2>Book appointment</h2>
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
                <span>{new Date(item.date).toLocaleString()}</span>
              </div>
              <span className="status">{item.status}</span>
            </div>
          ))}
        </div>

        <div className="panel">
          <h2>My pill orders</h2>
          {loading ? <EmptyState>Loading orders...</EmptyState> : orders.length === 0 ? <EmptyState>No pill requests yet.</EmptyState> : orders.map((item) => (
            <div className="list-row" key={item._id}>
              <div>
                <strong>{item.pillName}</strong>
                <span>{item.dosage} x {item.quantity}</span>
              </div>
              <span className="status">{item.status}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
