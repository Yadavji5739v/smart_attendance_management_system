const API = import.meta.env.VITE_API_URL;
import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post("/api/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      // Redirect based on role
      if (data.user.role === "student")       window.location.href = "/student";
      else if (data.user.role === "faculty")  window.location.href = "/faculty";
      else                                    window.location.href = "/analytics";
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo area */}
        <div style={styles.logoBox}>
          <span style={styles.logoIcon}>📋</span>
        </div>
        <h2 style={styles.title}>Smart Attendance</h2>
        <p style={styles.subtitle}>Sign in to continue</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              style={styles.input}
              type="email"
              placeholder="you@college.edu"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
            type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p style={styles.hint}>
          Faculty / Student / Admin — use your college email
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh", display: "flex", alignItems: "center",
    justifyContent: "center", background: "#0D1B2A"
  },
  card: {
    background: "#fff", borderRadius: 16, padding: "40px 36px",
    width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.4)"
  },
  logoBox: {
    textAlign: "center", marginBottom: 12
  },
  logoIcon: { fontSize: 48 },
  title: { textAlign: "center", color: "#0D1B2A", margin: "0 0 4px", fontSize: 24 },
  subtitle: { textAlign: "center", color: "#90A4AE", marginBottom: 28, fontSize: 14 },
  field: { marginBottom: 18 },
  label: { display: "block", marginBottom: 6, color: "#37474F", fontWeight: 600, fontSize: 13 },
  input: {
    width: "100%", padding: "11px 13px", border: "1px solid #DDE3EA",
    borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none"
  },
  button: {
    width: "100%", padding: 13, background: "#1565C0", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700,
    cursor: "pointer", marginTop: 4
  },
  error: {
    background: "#FFEBEE", color: "#B71C1C", padding: "10px 14px",
    borderRadius: 8, marginBottom: 16, fontSize: 13
  },
  hint: { textAlign: "center", color: "#B0BEC5", fontSize: 12, marginTop: 20 }
};
