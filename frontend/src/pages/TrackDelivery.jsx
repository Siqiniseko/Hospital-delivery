import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Clock, MapPinned } from "lucide-react";
import { socket } from "../services/socket";

function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 14);
  }, [map, position]);
  return null;
}

export default function TrackDelivery() {
  const { deliveryId } = useParams();
  const [position, setPosition] = useState([-29.8587, 31.0218]);
  const [eta, setEta] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    socket.emit("join-delivery", { deliveryId });
    socket.on("driver-move", (data) => {
      setPosition([data.lat, data.lng]);
      setEta(data.etaMinutes);
      setLastUpdate(new Date());
    });

    return () => socket.off("driver-move");
  }, [deliveryId]);

  return (
    <main className="dashboard">
      <header className="page-header">
        <div>
          <p className="eyebrow">Live tracking</p>
          <h1>Delivery {deliveryId}</h1>
        </div>
        <div className="tracking-meta">
          <span><Clock size={17} />{eta ? `${eta} min ETA` : "Waiting for driver"}</span>
          <span><MapPinned size={17} />{lastUpdate ? lastUpdate.toLocaleTimeString() : "No ping yet"}</span>
        </div>
      </header>

      <section className="panel map-panel">
        <MapContainer center={position} zoom={14} className="map">
          <TileLayer attribution="OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={position}><Popup>Driver location</Popup></Marker>
          <Recenter position={position} />
        </MapContainer>
      </section>
    </main>
  );
}
