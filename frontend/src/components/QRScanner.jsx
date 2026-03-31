const BACKEND = import.meta.env.VITE_API_URL || '';
import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import Navbar from "./Navbar";

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function QRScanner() {
  const [status,    setStatus]    = useState("idle"); // idle | scanning | success | error
  const [message,   setMessage]   = useState("");
  const [summary,   setSummary]   = useState([]);
  const scannerRef = useRef(null);

  // Load student's own attendance summary
  useEffect(() => {
    axios.get(`${BACKEND}/api/analytics/student-summary`, { headers: headers() })
      .then(r => setSummary(r.data))
      .catch(console.error);
  }, []);

  // Start QR scanner
  const startScanner = () => {
    setStatus("scanning");
    setMessage("");

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner("qr-reader", {
        fps: 10,
        qrbox: { width: 260, height: 260 },
        rememberLastUsedCamera: true,
      });

      scanner.render(
        async (decodedText) => {
          scanner.clear();
          await handleScan(decodedText);
        },
        (err) => console.warn(err)
      );

      scannerRef.current = scanner;
    }, 100);
  };

  const stopScanner = () => {
    scannerRef.current?.clear().catch(() => {});
    setStatus("idle");
  };

  const handleScan = async (rawText) => {
    try {
      const payload = JSON.parse(rawText);
      const { session_id, token, expiry } = payload;

      // Client-side expiry check
      if (new Date() > new Date(expiry)) {
        setStatus("error");
        setMessage("This QR code has expired. Ask your faculty to regenerate a new one.");
        return;
      }

      const { data } = await axios.post(
        "/api/qr/mark-attendance",
        { session_id, token },
        { headers: headers() }
      );

      setStatus("success");
      setMessage(data.message);

      // Refresh attendance summary
      axios.get("/api/analytics/student-summary", { headers: headers() })
        .then(r => setSummary(r.data));

    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Could not mark attendance. Try again.");
    }
  };

  const reset = () => {
    setStatus("idle");
    setMessage("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F7FA" }}>
      <Navbar />

      <div style={styles.page}>
        <div style={styles.grid}>

          {/* Left — Scanner */}
          <div style={styles.scanCard}>
            <h2 style={styles.heading}>Mark Your Attendance</h2>
            <p style={styles.sub}>Scan the QR code shown by your faculty</p>

            {/* IDLE state */}
            {status === "idle" && (
              <div style={styles.idleBox}>
                <div style={styles.qrPlaceholder}>📷</div>
                <p style={{ color: "#90A4AE", marginBottom: 20 }}>
                  Camera is off. Click below to start scanning.
                </p>
                <button style={styles.scanBtn} onClick={startScanner}>
                  Start QR Scanner
                </button>
              </div>
            )}

            {/* SCANNING state */}
            {status === "scanning" && (
              <div>
                <div id="qr-reader" style={{ width: "100%" }} />
                <button style={styles.cancelBtn} onClick={stopScanner}>
                  Cancel
                </button>
              </div>
            )}

            {/* SUCCESS state */}
            {status === "success" && (
              <div style={styles.resultBox("#E8F5E9", "#2E7D32")}>
                <div style={{ fontSize: 64 }}>✅</div>
                <h3 style={{ color: "#2E7D32", margin: "12px 0 8px" }}>
                  Attendance Marked!
                </h3>
                <p style={{ color: "#555", margin: "0 0 20px" }}>{message}</p>
                <button style={styles.scanBtn} onClick={reset}>Scan Again</button>
              </div>
            )}

            {/* ERROR state */}
            {status === "error" && (
              <div style={styles.resultBox("#FFEBEE", "#B71C1C")}>
                <div style={{ fontSize: 64 }}>❌</div>
                <h3 style={{ color: "#B71C1C", margin: "12px 0 8px" }}>
                  Failed
                </h3>
                <p style={{ color: "#555", margin: "0 0 20px" }}>{message}</p>
                <button style={styles.scanBtn} onClick={startScanner}>Try Again</button>
              </div>
            )}
          </div>

          {/* Right — Attendance Summary */}
          <div style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>My Attendance Summary</h3>
            {summary.length === 0 && (
              <p style={{ color: "#90A4AE", fontSize: 13 }}>No records yet.</p>
            )}
            {summary.map((s, i) => {
              const pct = s.attendance_pct || 0;
              const safe = pct >= 75;
              return (
                <div key={i} style={{
                  ...styles.subjectRow,
                  borderLeft: `4px solid ${safe ? "#2E7D32" : "#B71C1C"}`
                }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: "#0D1B2A", fontSize: 14 }}>
                      {s.subject_name}
                    </p>
                    <p style={{ margin: "2px 0 0", color: "#90A4AE", fontSize: 12 }}>
                      {s.subject_code} · {s.present_count}/{s.total_classes} classes
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{
                      fontSize: 22, fontWeight: 800,
                      color: safe ? "#2E7D32" : "#B71C1C"
                    }}>
                      {pct}%
                    </span>
                    {!safe && (
                      <p style={{ margin: "2px 0 0", color: "#B71C1C", fontSize: 11 }}>
                        ⚠ Below 75%
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Overall stat */}
            {summary.length > 0 && (() => {
              const overall = (
                summary.reduce((a, s) => a + (s.attendance_pct || 0), 0) / summary.length
              ).toFixed(1);
              return (
                <div style={styles.overallBox}>
                  <span style={{ color: "#90A4AE", fontSize: 13 }}>Overall Average</span>
                  <span style={{
                    fontSize: 28, fontWeight: 800,
                    color: overall >= 75 ? "#2E7D32" : "#B71C1C"
                  }}>
                    {overall}%
                  </span>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "28px 32px", maxWidth: 1100, margin: "0 auto" },
  grid: { display: "flex", gap: 24, flexWrap: "wrap" },
  scanCard: {
    background: "#fff", borderRadius: 16, padding: 28,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    flex: "0 0 360px", minWidth: 300
  },
  heading: { color: "#0D1B2A", fontSize: 22, margin: "0 0 6px" },
  sub: { color: "#90A4AE", fontSize: 13, marginBottom: 24 },
  idleBox: { textAlign: "center", padding: "20px 0" },
  qrPlaceholder: { fontSize: 72, marginBottom: 16 },
  scanBtn: {
    padding: "12px 32px", background: "#1565C0", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 15,
    fontWeight: 700, cursor: "pointer", width: "100%"
  },
  cancelBtn: {
    marginTop: 12, padding: "10px 20px", background: "#ECEFF1",
    color: "#37474F", border: "none", borderRadius: 8,
    fontSize: 14, cursor: "pointer", width: "100%"
  },
  resultBox: (bg, color) => ({
    textAlign: "center", padding: "24px 16px",
    background: bg, borderRadius: 12
  }),
  summaryCard: {
    background: "#fff", borderRadius: 16, padding: 28,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)", flex: 1, minWidth: 280
  },
  summaryTitle: { color: "#0D1B2A", fontSize: 18, margin: "0 0 20px" },
  subjectRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 14px", background: "#F5F7FA", borderRadius: 8,
    marginBottom: 10
  },
  overallBox: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginTop: 16, padding: "14px 16px", background: "#EEF2F7", borderRadius: 10
  }
};
