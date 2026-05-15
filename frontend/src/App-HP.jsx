import React from "react";
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Cross, LogIn, LogOut, Mail, MapPin, Phone } from "lucide-react";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Blog from "./pages/Blog.jsx";
import Contact from "./pages/Contact.jsx";
import ClinicDashboard from "./pages/ClinicDashboard.jsx";
import Login from "./pages/Login.jsx";
import PatientDashboard from "./pages/PatientDashboard.jsx";
import DriverDashboard from "./pages/DriverDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import TrackDelivery from "./pages/TrackDelivery.jsx";

function getSession() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return { token, user };
}

function Nav() {
  const navigate = useNavigate();
  const { user } = getSession();

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <nav className="nav">
      <Link to="/" className="brand" aria-label="Medical home">
        <span className="brand-mark"><Cross size={26} /></span>
        <span>Medical.</span>
      </Link>
      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/blog">Blog</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact Us</NavLink>
        {user?.role === "admin" && <NavLink to="/clinic-dashboard">Clinic Dashboard</NavLink>}
        {user ? (
          <>
            <NavLink to={rolePath(user.role)}>{user.role} portal</NavLink>
            <button className="icon-button" onClick={logout} title="Log out" aria-label="Log out">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <Link className="login-link" to="/login"><LogIn size={17} />Login</Link>
        )}
      </div>
    </nav>
  );
}

function ProtectedRoute({ children, roles }) {
  const location = useLocation();
  const { token, user } = getSession();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <AccessDenied user={user} />;
  }

  return children;
}

function AccessDenied({ user }) {
  return (
    <main className="access-page">
      <section className="panel access-panel">
        <p className="eyebrow">Authentication required</p>
        <h1>Access denied</h1>
        <p>You are signed in as <strong>{user.role}</strong>. This page is for another hospital role.</p>
        <Link className="appointment-button" to={rolePath(user.role)}>Open my portal</Link>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/patient" element={<ProtectedRoute roles={["patient"]}><PatientDashboard /></ProtectedRoute>} />
        <Route path="/doctor" element={<ProtectedRoute roles={["doctor", "admin"]}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/driver" element={<ProtectedRoute roles={["driver", "admin"]}><DriverDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/clinic-dashboard" element={<ProtectedRoute roles={["admin"]}><ClinicDashboard /></ProtectedRoute>} />
        <Route path="/track/:deliveryId" element={<ProtectedRoute roles={["patient", "driver", "admin"]}><TrackDelivery /></ProtectedRoute>} />
      </Routes>
      <Footer />
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Link to="/" className="footer-brand">
          <span className="brand-mark"><Cross size={22} /></span>
          <span>Medical.</span>
        </Link>
        <p>Hospital appointment booking, pill stock monitoring, pickup scheduling, and live delivery tracking.</p>
      </div>
      <div>
        <h3>Contact</h3>
        <p><Phone size={16} />01654.066.456</p>
        <p><Mail size={16} />support@medicalhospital.com</p>
        <p><MapPin size={16} />City Hospital Pharmacy, Durban</p>
      </div>
      <div>
        <h3>Quick access</h3>
        <Link to="/login">Patient login</Link>
        <Link to="/clinic-dashboard">Clinic dashboard</Link>
        <Link to="/track/demo-delivery">Track delivery</Link>
      </div>
    </footer>
  );
}

function rolePath(role) {
  if (role === "admin") return "/admin";
  if (role === "doctor") return "/doctor";
  if (role === "driver") return "/driver";
  return "/patient";
}
