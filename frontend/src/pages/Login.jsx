import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, UserRoundCheck } from "lucide-react";
import { api } from "../services/api";

const demoUsers = [
  { label: "Admin", email: "admin@hospital.com" },
  { label: "Driver", email: "driver@hospital.com" },
  { label: "Patient", email: "patient@hospital.com" },
];

export default function Login() {
  const [email, setEmail] = useState("admin@hospital.com");
  const [password, setPassword] = useState("Password123!");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(data.user.role === "admin" ? "/admin" : data.user.role === "driver" ? "/driver" : "/patient");
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed. Start the backend and seed the demo users.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="panel auth-panel" onSubmit={submit}>
        <div className="panel-heading">
          <span className="icon-pill"><LockKeyhole size={22} /></span>
          <div>
            <p className="eyebrow">Secure access</p>
            <h1>Sign in</h1>
          </div>
        </div>

        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
        </label>

        <button className="primary full-width" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
        {message && <p className="error">{message}</p>}
      </form>

      <aside className="panel demo-panel">
        <div className="panel-heading">
          <span className="icon-pill"><UserRoundCheck size={22} /></span>
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
              onClick={() => setEmail(user.email)}
            >
              <span>{user.label}</span>
              <strong>{user.email}</strong>
            </button>
          ))}
        </div>
      </aside>
    </main>
  );
}
