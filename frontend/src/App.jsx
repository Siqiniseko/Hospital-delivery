import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { Activity, Ambulance, LayoutDashboard, LogIn, LogOut, MapPinned, UserRound } from "lucide-react";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import PatientDashboard from "./pages/PatientDashboard.jsx";
import DriverDashboard from "./pages/DriverDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import TrackDelivery from "./pages/TrackDelivery.jsx";

function Nav() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <nav className="nav">
      <Link to="/" className="brand" aria-label="MedRoute home">
        <span className="brand-mark"><Activity size={22} /></span>
        <span>MedRoute</span>
      </Link>
      <div className="nav-links">
        <NavLink to="/patient"><UserRound size={17} />Patient</NavLink>
        <NavLink to="/driver"><Ambulance size={17} />Driver</NavLink>
        <NavLink to="/admin"><LayoutDashboard size={17} />Admin</NavLink>
        <NavLink to="/track/demo-delivery"><MapPinned size={17} />Track</NavLink>
        {user ? (
          <button className="icon-button" onClick={logout} title="Log out" aria-label="Log out">
            <LogOut size={18} />
          </button>
        ) : (
          <Link className="login-link" to="/login"><LogIn size={17} />Login</Link>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/driver" element={<DriverDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/track/:deliveryId" element={<TrackDelivery />} />
      </Routes>
    </>
  );
}
