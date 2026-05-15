import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, LockKeyhole, ShieldCheck, UserPlus, UserRoundCheck } from "lucide-react";
import { api } from "../services/api";

const demoUsers = [
  { label: "Admin", email: "admin@hospital.com" },
  { label: "Doctor", email: "doctor@hospital.com" },
  { label: "Driver", email: "driver@hospital.com" },
  { label: "Patient", email: "patient@hospital.com" },
];

export default function Login() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("patient@hospital.com");
  const [password, setPassword] = useState("Password123!");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = mode === "register"
        ? { name, email, password, phone, address }
        : { email, password };
      const { data } = await api.post(mode === "register" ? "/auth/register" : "/auth/login", payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(rolePath(data.user.role));
    } catch (err) {
      setMessage(err.response?.data?.message || `${mode === "register" ? "Registration" : "Login"} failed. Start the backend and try again.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-welcome">
        <p className="hero-kicker text-only">Medical. secure portal</p>
        <h1>Welcome back to connected hospital care.</h1>
        <p>
          Sign in to manage appointments, pill requests, delivery tracking, and clinic stock operations.
          New public accounts are created for patients only.
        </p>
        <div className="auth-benefits">
          <span><CheckCircle2 size={18} />Book and manage doctor appointments</span>
          <span><CheckCircle2 size={18} />Track pill pickup and delivery progress</span>
          <span><CheckCircle2 size={18} />Protected staff and patient portals</span>
        </div>
      </section>

      <form className="auth-card" onSubmit={submit}>
        <div className="auth-card-header">
          <span className="auth-icon">{mode === "register" ? <UserPlus size={24} /> : <LockKeyhole size={24} />}</span>
          <div>
            <p className="eyebrow">Secure access</p>
            <h1>{mode === "register" ? "Create patient account" : "Sign in"}</h1>
            <p>{mode === "register" ? "Register as a patient to book appointments and request pills." : "Use your hospital account to continue."}</p>
          </div>
        </div>

        <div className="auth-tabs">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Login</button>
          <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Register patient</button>
        </div>

        {mode === "register" && (
          <>
            <label>
              Full name
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Patient full name" required />
            </label>
            <div className="auth-field-grid">
              <label>
                Phone
                <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="071 000 0000" />
              </label>
              <label>
                Address
                <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Durban, South Africa" />
              </label>
            </div>
          </>
        )}

        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required minLength={8} />
        </label>

        <button className="primary full-width" disabled={loading}>
          {loading ? "Please wait..." : mode === "register" ? "Create patient account" : "Login"}
        </button>
        {message && <p className="error">{message}</p>}

        <div className="auth-note">
          <ShieldCheck size={18} />
          <span>Only patients can create public accounts. Staff accounts are managed by hospital administration.</span>
        </div>

        <aside className="demo-panel compact-demo">
          <div className="panel-heading compact">
            <span className="icon-pill"><UserRoundCheck size={20} /></span>
            <div>
              <p className="eyebrow">Demo users</p>
              <h2>Password: Password123!</h2>
            </div>
          </div>
          <div className="demo-list">
            {demoUsers.map((user) => (
              <button
                className={email === user.email ? "demo-user active" : "demo-user"}
                type="button"
                key={user.email}
                onClick={() => {
                  setMode("login");
                  setEmail(user.email);
                }}
              >
                <span>{user.label}</span>
                <strong>{user.email}</strong>
              </button>
            ))}
          </div>
        </aside>
      </form>
    </main>
  );
}

function rolePath(role) {
  if (role === "admin") return "/admin";
  if (role === "doctor") return "/doctor";
  if (role === "driver") return "/driver";
  return "/patient";
}
