import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Navigation, RadioTower } from "lucide-react";
import { socket } from "../services/socket";

export default function DriverDashboard() {
  const [sharing, setSharing] = useState(false);
  const [deliveryId, setDeliveryId] = useState("demo-delivery");
  const [lastPing, setLastPing] = useState(null);
  const [position, setPosition] = useState({ lat: -29.8587, lng: 31.0218, eta: 12 });

  const trackingUrl = useMemo(() => `/track/${deliveryId || "demo-delivery"}`, [deliveryId]);

  useEffect(() => {
    if (!sharing) return undefined;

    const timer = setInterval(() => {
      setPosition((current) => {
        const next = {
          lat: current.lat + 0.0007,
          lng: current.lng + 0.0005,
          eta: Math.max(1, current.eta - 1),
        };
        socket.emit("driver-location", {
          deliveryId,
          driverId: "demo-driver",
          lat: next.lat,
          lng: next.lng,
          etaMinutes: next.eta,
        });
        setLastPing(new Date());
        return next;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [sharing, deliveryId]);

  return (
    <main className="dashboard">
      <header className="page-header">
        <div>
          <p className="eyebrow">Driver app</p>
          <h1>Live delivery broadcast</h1>
        </div>
        <span className={sharing ? "live-badge" : "status"}>{sharing ? "Broadcasting" : "Ready"}</span>
      </header>

      <div className="two">
        <section className="panel">
          <div className="panel-heading">
            <span className="icon-pill"><RadioTower size={22} /></span>
            <h2>Delivery session</h2>
          </div>
          <label>Delivery ID
            <input value={deliveryId} onChange={(event) => setDeliveryId(event.target.value)} />
          </label>
          <div className="button-row">
            <button className="primary" onClick={() => setSharing((value) => !value)}>
              <Navigation size={17} />{sharing ? "Stop sharing" : "Start live delivery"}
            </button>
            <Link className="secondary" to={trackingUrl}>Open tracking</Link>
          </div>
        </section>

        <section className="panel route-summary">
          <div className="panel-heading">
            <span className="icon-pill"><MapPin size={22} /></span>
            <h2>Current signal</h2>
          </div>
          <dl>
            <div><dt>Latitude</dt><dd>{position.lat.toFixed(5)}</dd></div>
            <div><dt>Longitude</dt><dd>{position.lng.toFixed(5)}</dd></div>
            <div><dt>ETA</dt><dd>{position.eta} min</dd></div>
            <div><dt>Last ping</dt><dd>{lastPing ? lastPing.toLocaleTimeString() : "Not sent yet"}</dd></div>
          </dl>
        </section>
      </div>
    </main>
  );
}
