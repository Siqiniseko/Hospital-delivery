import React, { useEffect, useState } from "react";
import { Boxes, CalendarDays, ClipboardList, RefreshCw } from "lucide-react";
import { api } from "../services/api";
import LiveAdminMap from "../components/LiveAdminMap.jsx";

const appointmentStatuses = ["pending", "approved", "completed", "cancelled"];
const pillStatuses = ["requested", "approved", "preparing", "ready", "out_for_delivery", "collected", "delivered", "cancelled"];

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setMessage("");
    try {
      const [appointmentsResponse, ordersResponse, inventoryResponse] = await Promise.all([
        api.get("/appointments"),
        api.get("/pills/orders"),
        api.get("/pills/inventory"),
      ]);
      setAppointments(appointmentsResponse.data);
      setOrders(ordersResponse.data);
      setInventory(inventoryResponse.data);
    } catch {
      setMessage("Could not load admin data. Please login as the admin demo user.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const lowStock = inventory.filter((item) => item.stock <= item.lowStockThreshold);

  async function updateAppointment(id, status) {
    await api.patch(`/appointments/${id}`, { status });
    setMessage("Appointment status updated.");
    load();
  }

  async function updateOrder(id, status) {
    await api.patch(`/pills/orders/${id}`, { status });
    setMessage("Pill order status updated.");
    load();
  }

  return (
    <main className="dashboard">
      <header className="page-header">
        <div>
          <p className="eyebrow">Admin control room</p>
          <h1>Hospital delivery operations</h1>
        </div>
        <button className="secondary" onClick={load}><RefreshCw size={17} />Refresh</button>
      </header>

      {message && <p className="notice">{message}</p>}

      <section className="stats">
        <article className="metric card"><CalendarDays size={24} /><span>Appointments</span><strong>{appointments.length}</strong></article>
        <article className="metric card"><ClipboardList size={24} /><span>Pill orders</span><strong>{orders.length}</strong></article>
        <article className="metric card"><Boxes size={24} /><span>Inventory items</span><strong>{inventory.length}</strong></article>
      </section>

      <LiveAdminMap />

      <section className="data-grid">
        <div className="panel">
          <h2>Recent pill orders</h2>
          {loading ? <p className="empty">Loading orders...</p> : orders.length === 0 ? <p className="empty">No orders yet.</p> : orders.slice(0, 6).map((order) => (
            <article className="admin-work-item" key={order._id}>
              <div className="list-row">
                <div>
                  <strong>{order.pillName}</strong>
                  <span>{order.patient?.name || "Patient"} - {order.dosage} x {order.quantity}</span>
                  <span>{order.deliveryType === "delivery" ? "Delivery" : "Hospital pickup"}: {formatDateTime(order.collectionDate)}</span>
                </div>
                <span className="status">{formatStatus(order.status)}</span>
              </div>
              <label className="inline-control">Update pill status
                <select value={order.status} onChange={(event) => updateOrder(order._id, event.target.value)}>
                  {pillStatuses.map((status) => <option value={status} key={status}>{formatStatus(status)}</option>)}
                </select>
              </label>
            </article>
          ))}
        </div>

        <div className="panel">
          <h2>Doctor appointments</h2>
          {loading ? <p className="empty">Loading appointments...</p> : appointments.length === 0 ? <p className="empty">No appointments yet.</p> : appointments.slice(0, 6).map((appointment) => (
            <article className="admin-work-item" key={appointment._id}>
              <div className="list-row">
                <div>
                  <strong>{appointment.doctorName}</strong>
                  <span>{appointment.patient?.name || "Patient"} - {new Date(appointment.date).toLocaleString()}</span>
                  <span>{appointment.reason}</span>
                </div>
                <span className="status">{formatStatus(appointment.status)}</span>
              </div>
              <label className="inline-control">Update appointment
                <select value={appointment.status} onChange={(event) => updateAppointment(appointment._id, event.target.value)}>
                  {appointmentStatuses.map((status) => <option value={status} key={status}>{formatStatus(status)}</option>)}
                </select>
              </label>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Pharmacy stock</h2>
        {loading ? <p className="empty">Loading inventory...</p> : lowStock.length === 0 ? <p className="empty">Stock levels look healthy.</p> : lowStock.map((item) => (
          <div className="list-row danger" key={item._id}>
            <div>
              <strong>{item.pillName}</strong>
              <span>{item.supplier || "No supplier listed"}</span>
            </div>
            <span className="status">{item.stock} left</span>
          </div>
        ))}
      </section>
    </main>
  );
}

function formatDateTime(value) {
  if (!value) return "Not scheduled yet";
  return new Date(value).toLocaleString();
}

function formatStatus(value) {
  return value.replaceAll("_", " ");
}
