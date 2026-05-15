import React, { useEffect, useState } from "react";
import { CalendarCheck, ClipboardList, RefreshCw, Stethoscope, UserRound } from "lucide-react";
import { api } from "../services/api";

const appointmentStatuses = ["pending", "approved", "completed", "cancelled"];

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setMessage("");
    try {
      const { data } = await api.get("/appointments");
      setAppointments(data);
    } catch {
      setMessage("Could not load doctor appointments. Please login as the doctor demo user.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateAppointment(id, status) {
    await api.patch(`/appointments/${id}`, { status });
    setMessage("Appointment updated.");
    load();
  }

  const todayAppointments = appointments.filter((item) => isToday(item.date));
  const pendingAppointments = appointments.filter((item) => item.status === "pending");

  return (
    <main className="dashboard">
      <header className="page-header">
        <div>
          <p className="eyebrow">Doctor portal</p>
          <h1>Patient appointments</h1>
        </div>
        <button className="secondary" onClick={load}><RefreshCw size={17} />Refresh</button>
      </header>

      {message && <p className="notice">{message}</p>}

      <section className="stats">
        <article className="metric card"><CalendarCheck size={24} /><span>Appointments</span><strong>{appointments.length}</strong></article>
        <article className="metric card"><ClipboardList size={24} /><span>Pending review</span><strong>{pendingAppointments.length}</strong></article>
        <article className="metric card"><Stethoscope size={24} /><span>Today</span><strong>{todayAppointments.length}</strong></article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <span className="icon-pill"><UserRound size={22} /></span>
          <div>
            <h2>Appointment queue</h2>
            <p className="muted">Review patient bookings and update consultation progress.</p>
          </div>
        </div>

        {loading ? <p className="empty">Loading appointments...</p> : appointments.length === 0 ? <p className="empty">No appointments booked yet.</p> : appointments.map((appointment) => (
          <article className="admin-work-item" key={appointment._id}>
            <div className="list-row">
              <div>
                <strong>{appointment.patient?.name || "Patient"}</strong>
                <span>{appointment.doctorName || "Assigned doctor"} - {new Date(appointment.date).toLocaleString()}</span>
                <span>{appointment.reason || "No reason supplied"}</span>
              </div>
              <span className="status">{formatStatus(appointment.status)}</span>
            </div>
            <label className="inline-control">Consultation status
              <select value={appointment.status} onChange={(event) => updateAppointment(appointment._id, event.target.value)}>
                {appointmentStatuses.map((status) => <option value={status} key={status}>{formatStatus(status)}</option>)}
              </select>
            </label>
          </article>
        ))}
      </section>
    </main>
  );
}

function isToday(value) {
  const date = new Date(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

function formatStatus(value) {
  return value.replaceAll("_", " ");
}
