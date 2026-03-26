// src/components/Navbar.jsx
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const roleColor = {
    admin:   "#6A1B9A",
    faculty: "#1565C0",
    student: "#2E7D32",
  }[user.role] || "#37474F";

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <span style={styles.logo}>📋 SmartAttendance</span>

        {/* Nav links based on role */}
        {user.role === "faculty" && (
          <>
            <button style={navBtn(location.pathname === "/faculty")}
              onClick={() => navigate("/faculty")}>Generate QR</button>
            <button style={navBtn(location.pathname === "/analytics")}
              onClick={() => navigate("/analytics")}>Analytics</button>
          </>
        )}
        {user.role === "student" && (
          <>
            <button style={navBtn(location.pathname === "/student")}
              onClick={() => navigate("/student")}>Scan QR</button>
            <button style={navBtn(location.pathname === "/analytics")}
              onClick={() => navigate("/analytics")}>My Attendance</button>
          </>
        )}
        {user.role === "admin" && (
          <>
            <button style={navBtn(location.pathname === "/faculty")}
              onClick={() => navigate("/faculty")}>QR Panel</button>
            <button style={navBtn(location.pathname === "/analytics")}
              onClick={() => navigate("/analytics")}>Analytics</button>
          </>
        )}
      </div>

      <div style={styles.right}>
        <span style={{ ...styles.roleBadge, background: roleColor }}>
          {user.role?.toUpperCase()}
        </span>
        <span style={styles.name}>{user.name}</span>
        <button style={styles.logoutBtn} onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}

const navBtn = (active) => ({
  background: active ? "#1565C0" : "transparent",
  color: active ? "#fff" : "#90A4AE",
  border: "none", borderRadius: 6,
  padding: "6px 14px", fontSize: 13,
  cursor: "pointer", fontWeight: active ? 700 : 400,
  marginLeft: 4
});

const styles = {
  nav: {
    background: "#0D1B2A", padding: "0 28px", height: 56,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    position: "sticky", top: 0, zIndex: 100,
    boxShadow: "0 2px 12px rgba(0,0,0,0.3)"
  },
  left: { display: "flex", alignItems: "center", gap: 4 },
  right: { display: "flex", alignItems: "center", gap: 12 },
  logo: { color: "#fff", fontWeight: 700, fontSize: 16, marginRight: 16 },
  roleBadge: {
    color: "#fff", fontSize: 10, fontWeight: 700,
    padding: "3px 8px", borderRadius: 12
  },
  name: { color: "#B0BEC5", fontSize: 13 },
  logoutBtn: {
    background: "transparent", border: "1px solid #37474F",
    color: "#90A4AE", borderRadius: 6, padding: "5px 12px",
    fontSize: 12, cursor: "pointer"
  }
};
