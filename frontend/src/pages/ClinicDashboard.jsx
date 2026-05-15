import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Ambulance, BarChart3, CheckCircle2, MapPinned, MessageSquareText, PackagePlus, QrCode, Route, ShieldAlert } from "lucide-react";
import { api } from "../services/api";
import { clinicToMapPosition, DURBAN_CENTER, OSM_ATTRIBUTION, OSM_TILE_URL } from "../services/openStreetMap";

const initialClinics = [
  { id: "durban-central", name: "Durban Central Clinic", stock: 420, avgDailyUsage: 42, lat: 42, lng: 58 },
  { id: "umlazi", name: "Umlazi Clinic", stock: 96, avgDailyUsage: 28, lat: 68, lng: 34 },
  { id: "phoenix", name: "Phoenix Clinic", stock: 55, avgDailyUsage: 18, lat: 28, lng: 72 },
  { id: "pinetown", name: "Pinetown Clinic", stock: 240, avgDailyUsage: 22, lat: 50, lng: 20 },
];

export default function ClinicDashboard() {
  const [clinics, setClinics] = useState(initialClinics);
  const [form, setForm] = useState({ clinicId: "durban-central", stock: 420, avgDailyUsage: 42 });
  const [routePlan, setRoutePlan] = useState(null);
  const [smsLog, setSmsLog] = useState([]);
  const [missionDone, setMissionDone] = useState(false);
  const [transfer, setTransfer] = useState({ from: "durban-central", to: "umlazi", quantity: 60 });
  const [message, setMessage] = useState("");

  const enrichedClinics = useMemo(() => clinics.map(enrichClinic), [clinics]);
  const networkScore = Math.round(enrichedClinics.reduce((sum, clinic) => sum + clinic.score, 0) / enrichedClinics.length);
  const surplusClinics = enrichedClinics.filter((clinic) => clinic.status === "Healthy");
  const deficitClinics = enrichedClinics.filter((clinic) => clinic.status !== "Healthy");

  useEffect(() => {
    loadClinics();
  }, []);

  async function loadClinics() {
    try {
      const { data } = await api.get("/clinics");
      setClinics(data.clinics);
      if (data.clinics.length) {
        const selected = data.clinics.find((clinic) => clinic.id === form.clinicId) || data.clinics[0];
        setForm({ clinicId: selected.id, stock: selected.stock, avgDailyUsage: selected.avgDailyUsage });
      }
      setMessage("Live clinic API connected.");
    } catch {
      setMessage("Using local clinic data until the backend API is running.");
    }
  }

  async function updateStock(event) {
    event.preventDefault();
    try {
      const { data } = await api.patch(`/clinics/${form.clinicId}/stock`, {
        stock: Number(form.stock),
        avgDailyUsage: Number(form.avgDailyUsage),
      });
      setClinics((current) => current.map((clinic) => clinic.id === data.id ? data : clinic));
      setMessage("Clinic stock updated through API.");
    } catch {
      setClinics((current) => current.map((clinic) => clinic.id === form.clinicId
        ? { ...clinic, stock: Number(form.stock), avgDailyUsage: Number(form.avgDailyUsage) }
        : clinic));
      setMessage("Clinic stock updated locally. Start the backend to persist changes.");
    }
  }

  async function generateRoute() {
    const from = enrichedClinics.find((clinic) => clinic.id === transfer.from);
    const to = enrichedClinics.find((clinic) => clinic.id === transfer.to);
    const eta = Math.max(18, Math.round(Math.abs(from.lat - to.lat) + Math.abs(from.lng - to.lng)));
    setMissionDone(false);
    try {
      const { data } = await api.post("/clinics/redistributions", {
        fromClinic: transfer.from,
        toClinic: transfer.to,
        quantity: Number(transfer.quantity),
      });
      setRoutePlan(data);
      setMessage("Redistribution route created through API.");
    } catch {
      setRoutePlan({
        from,
        to,
        eta,
        quantity: Number(transfer.quantity),
        code: `MR-${from.id.slice(0, 3).toUpperCase()}-${to.id.slice(0, 3).toUpperCase()}-${transfer.quantity}`,
      });
      setMessage("Route generated locally. Start the backend to save missions.");
    }
  }

  async function sendSmsDemo() {
    if (!routePlan) return;
    const localMessages = [
      `SMS to runner: Collect ${routePlan.quantity} pill packs from ${routePlan.from.name}. Deliver to ${routePlan.to.name}. ETA ${routePlan.eta} min.`,
      `SMS to patients: Medicine stock is being restored at ${routePlan.to.name}. Please wait for pickup confirmation.`,
      `SMS to clinic: Runner assigned for ${routePlan.quantity} pill packs. QR mission code ${routePlan.code}.`,
    ];
    try {
      const { data } = await api.post(`/clinics/redistributions/${routePlan.id}/sms`);
      setSmsLog(data.smsLog);
      setRoutePlan(data.mission);
      setMessage("SMS alerts logged through API.");
    } catch {
      setSmsLog(localMessages);
      setMessage("SMS alerts generated locally. Start the backend to log them.");
    }
  }

  async function completeMission() {
    if (!routePlan || missionDone) return;
    try {
      const { data } = await api.post(`/clinics/redistributions/${routePlan.id}/complete`);
      setClinics(data.clinics);
      setRoutePlan(data.mission);
      setMissionDone(true);
      setMessage("Mission completed and inventories updated through API.");
    } catch {
      setClinics((current) => current.map((clinic) => {
        if (clinic.id === routePlan.from.id) return { ...clinic, stock: Math.max(0, clinic.stock - routePlan.quantity) };
        if (clinic.id === routePlan.to.id) return { ...clinic, stock: clinic.stock + routePlan.quantity };
        return clinic;
      }));
      setMissionDone(true);
      setMessage("Mission completed locally. Start the backend to persist inventory updates.");
    }
  }

  return (
    <main className="clinic-page">
      <section className="clinic-hero">
        <div>
          <p className="hero-kicker text-only">Clinic operations</p>
          <h1>Clinic stock rescue dashboard</h1>
          <p>Predict pill shortages, identify clinics in crisis, simulate redistribution, send SMS alerts, and complete delivery missions with QR verification.</p>
        </div>
        <div className="clinic-score">
          <span>Stock Health Score</span>
          <strong>{networkScore}%</strong>
          <p>{networkScore >= 75 ? "Network stable" : "Immediate redistribution needed"}</p>
        </div>
      </section>

      {message && <p className="notice clinic-api-notice">{message}</p>}

      <section className="clinic-grid">
        <form className="panel" onSubmit={updateStock}>
          <div className="panel-heading">
            <span className="icon-pill"><PackagePlus size={22} /></span>
            <div>
              <p className="eyebrow">Live stock form</p>
              <h2>Update clinic stock</h2>
            </div>
          </div>
          <label>Clinic
            <select value={form.clinicId} onChange={(event) => {
              const clinic = clinics.find((item) => item.id === event.target.value);
              setForm({ clinicId: clinic.id, stock: clinic.stock, avgDailyUsage: clinic.avgDailyUsage });
            }}>
              {clinics.map((clinic) => <option value={clinic.id} key={clinic.id}>{clinic.name}</option>)}
            </select>
          </label>
          <label>Current pill stock
            <input type="number" min="0" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} />
          </label>
          <label>Average daily usage
            <input type="number" min="1" value={form.avgDailyUsage} onChange={(event) => setForm({ ...form, avgDailyUsage: event.target.value })} />
          </label>
          <button className="appointment-button">Update stock</button>
        </form>

        <section className="panel">
          <div className="panel-heading">
            <span className="icon-pill"><ShieldAlert size={22} /></span>
            <div>
              <p className="eyebrow">AI forecast</p>
              <h2>Predicted days-to-stock-out</h2>
            </div>
          </div>
          <div className="forecast-list">
            {enrichedClinics.map((clinic) => (
              <article className="forecast-row" key={clinic.id}>
                <div>
                  <strong>{clinic.name}</strong>
                  <span>{clinic.stock} packs - {clinic.daysLeft} days left</span>
                </div>
                <span className={`risk-pill ${clinic.status.toLowerCase().replace(" ", "-")}`}>{clinic.status}</span>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="clinic-grid">
        <section className="panel heatmap-panel">
          <div className="panel-heading">
            <span className="icon-pill"><MapPinned size={22} /></span>
            <div>
              <p className="eyebrow">Crisis heatmap</p>
              <h2>Clinics in crisis</h2>
            </div>
          </div>
          <div className="clinic-heatmap osm-clinic-map">
            <MapContainer center={DURBAN_CENTER} zoom={10} className="clinic-osm-map">
              <TileLayer attribution={OSM_ATTRIBUTION} url={OSM_TILE_URL} />
              {enrichedClinics.map((clinic) => (
                <Marker position={clinicToMapPosition(clinic)} key={clinic.id}>
                  <Popup>
                    <strong>{clinic.name}</strong><br />
                    {clinic.stock} packs<br />
                    {clinic.daysLeft} days left<br />
                    Status: {clinic.status}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            {enrichedClinics.map((clinic) => (
              <button
                className={`heatmap-dot ${clinic.status.toLowerCase().replace(" ", "-")}`}
                style={{ left: `${clinic.lng}%`, top: `${clinic.lat}%` }}
                key={clinic.id}
                type="button"
                title={`${clinic.name}: ${clinic.status}`}
              >
                {clinic.daysLeft}
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <span className="icon-pill"><Route size={22} /></span>
            <div>
              <p className="eyebrow">Redistribution simulator</p>
              <h2>Move surplus stock</h2>
            </div>
          </div>
          <div className="simulator-grid">
            <label>Surplus clinic
              <select value={transfer.from} onChange={(event) => setTransfer({ ...transfer, from: event.target.value })}>
                {(surplusClinics.length ? surplusClinics : enrichedClinics).map((clinic) => <option value={clinic.id} key={clinic.id}>{clinic.name}</option>)}
              </select>
            </label>
            <label>Deficit clinic
              <select value={transfer.to} onChange={(event) => setTransfer({ ...transfer, to: event.target.value })}>
                {(deficitClinics.length ? deficitClinics : enrichedClinics).map((clinic) => <option value={clinic.id} key={clinic.id}>{clinic.name}</option>)}
              </select>
            </label>
            <label>Quantity
              <input type="number" min="1" value={transfer.quantity} onChange={(event) => setTransfer({ ...transfer, quantity: event.target.value })} />
            </label>
          </div>
          <button className="appointment-button" type="button" onClick={generateRoute}>Generate route & QR</button>
          {routePlan && (
            <div className="route-result">
              <Ambulance size={22} />
              <p><strong>{routePlan.from.name}</strong> to <strong>{routePlan.to.name}</strong></p>
              <span>{routePlan.quantity} packs - ETA {routePlan.eta} min</span>
            </div>
          )}
        </section>
      </section>

      <section className="clinic-grid">
        <section className="panel">
          <div className="panel-heading">
            <span className="icon-pill"><MessageSquareText size={22} /></span>
            <div>
              <p className="eyebrow">SMS alerts</p>
              <h2>Mock alerts</h2>
            </div>
          </div>
          <button className="medical-secondary" type="button" onClick={sendSmsDemo} disabled={!routePlan}>Send SMS alerts</button>
          <div className="sms-log">
            {smsLog.length === 0 ? <p className="empty">Generate a route, then send SMS alerts.</p> : smsLog.map((item) => <p key={item}>{item}</p>)}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <span className="icon-pill"><QrCode size={22} /></span>
            <div>
              <p className="eyebrow">QR mission code</p>
              <h2>Scan to complete mission</h2>
            </div>
          </div>
          {routePlan ? (
            <>
              <FakeQr code={routePlan.code} />
              <p className="muted">Mission code: {routePlan.code}</p>
              <button className="appointment-button" type="button" onClick={completeMission}>
                <CheckCircle2 size={18} />{missionDone ? "Mission completed" : "Scan QR & update inventory"}
              </button>
            </>
          ) : (
            <p className="empty">Generate a route to create a QR code.</p>
          )}
        </section>
      </section>

      <section className="panel clinic-summary">
        <BarChart3 size={24} />
        <div>
          <h2>Stock risk forecast</h2>
          <p>If stock is less than average daily usage x 7, the clinic is marked At Risk. If stock is less than average daily usage x 3, it is marked Crisis.</p>
        </div>
      </section>
    </main>
  );
}

function enrichClinic(clinic) {
  const daysLeft = Math.floor(clinic.stock / clinic.avgDailyUsage);
  const status = clinic.stock < clinic.avgDailyUsage * 3 ? "Crisis" : clinic.stock < clinic.avgDailyUsage * 7 ? "At Risk" : "Healthy";
  const score = Math.min(100, Math.round((daysLeft / 14) * 100));
  return { ...clinic, daysLeft, status, score };
}

function FakeQr({ code }) {
  const cells = Array.from({ length: 64 }, (_, index) => (code.charCodeAt(index % code.length) + index) % 3 !== 0);
  return (
    <div className="fake-qr" aria-label={`QR code ${code}`}>
      {cells.map((active, index) => <span className={active ? "active" : ""} key={index} />)}
    </div>
  );
}
