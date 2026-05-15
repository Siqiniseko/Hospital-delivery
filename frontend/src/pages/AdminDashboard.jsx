import { useEffect, useState } from "react";
import { Boxes, CalendarDays, ClipboardList, RefreshCw } from "lucide-react";
import { api } from "../services/api";
import LiveAdminMap from "../components/LiveAdminMap.jsx";

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
            <div className="list-row" key={order._id}>
              <div>
                <strong>{order.pillName}</strong>
                <span>{order.patient?.name || "Patient"} - {order.dosage} x {order.quantity}</span>
              </div>
              <span className="status">{order.status}</span>
            </div>
          ))}
        </div>

        <div className="panel">
          <h2>Low stock alerts</h2>
          {loading ? <p className="empty">Loading inventory...</p> : lowStock.length === 0 ? <p className="empty">Stock levels look healthy.</p> : lowStock.map((item) => (
            <div className="list-row danger" key={item._id}>
              <div>
                <strong>{item.pillName}</strong>
                <span>{item.supplier || "No supplier listed"}</span>
              </div>
              <span className="status">{item.stock} left</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
