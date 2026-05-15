import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Map } from "lucide-react";
import { socket } from "../services/socket";

export default function LiveAdminMap() {
  const [drivers, setDrivers] = useState({});

  useEffect(() => {
    socket.on("admin-driver-move", (payload) => {
      setDrivers((previous) => ({ ...previous, [payload.driverId || payload.deliveryId]: payload }));
    });
    return () => socket.off("admin-driver-move");
  }, []);

  const activeDrivers = Object.values(drivers);

  return (
    <section className="panel map-panel">
      <div className="panel-heading">
        <span className="icon-pill"><Map size={22} /></span>
        <div>
          <h2>Live driver control map</h2>
          <p className="muted">{activeDrivers.length ? `${activeDrivers.length} active driver signal` : "Start the driver demo to see movement here."}</p>
        </div>
      </div>
      <MapContainer center={[-29.8587, 31.0218]} zoom={12} className="map smallmap">
        <TileLayer attribution="OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {activeDrivers.map((driver) => (
          <Marker key={`${driver.driverId || "driver"}-${driver.deliveryId}`} position={[driver.lat, driver.lng]}>
            <Popup>{driver.driverId || "Driver"} - ETA {driver.etaMinutes} min</Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  );
}
