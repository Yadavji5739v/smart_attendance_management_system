const BACKEND = import.meta.env.VITE_API_URL || '';
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Navbar from "./Navbar";

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function QRGenerator() {
  const [subjects,          setSubjects]          = useState([]);
  const [selectedSubject,   setSelectedSubject]   = useState("");
  const [duration,          setDuration]          = useState(5);
  const [qrData,            setQrData]            = useState(null);
  const [timeLeft,          setTimeLeft]          = useState(0);
  const [liveAttendance,    setLiveAttendance]    = useState([]);
  const [generating,        setGenerating]        = useState(false);
  const [error,             setError]             = useState("");
  const timerRef = useRef(null);
  const pollRef  = useRef(null);

  // Load subjects assigned to this faculty
  useEffect(() => {
    axios.get(`${BACKEND}/api/attendance/subjects`, { headers: headers() })
      .then(r => setSubjects(r.data))
      .catch(() => {
        // fallback mock if endpoint not yet built
        setSubjects([
          { subject_id: 1, subject_name: "Data Structures", subject_code: "CS301" },
          { subject_id: 2, subject_name: "Operating Systems", subject_code: "CS302" },
        ]);
      });
  }, []);

  // Countdown timer
  useEffect(() => {
    clearInterval(timerRef.current);
    if (timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  // Poll live attendance every 4 seconds
  useEffect(() => {
    clearInterval(pollRef.current);
    if (!qrData) return;
    const fetchAttendance = () =>
      axios.get(`/api/qr/session/${qrData.session_id}`, { headers: headers() })
        .then(r => setLiveAttendance(r.data))
        .catch(console.error);
    fetchAttendance();
    pollRef.current = setInterval(fetchAttendance, 4000);
    return () => clearInterval(pollRef.current);
  }, [qrData]);

  const generateQR = async () => {
    if (!selectedSubject) return setError("Please select a subject first");
    setError("");
    setGenerating(true);
    try {
      const { data } = await axios.post(
        "/api/qr/generate",
        { subject_id: selectedSubject, duration_minutes: duration },
        { headers: headers() }
      );
      setQrData(data);
      setTimeLeft(duration * 60);
      setLiveAttendance([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate QR");
    } finally {
      setGenerating(false);
    }
  };

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const presentCount = liveAttendance.filter(r => r.status === "present").length;
  const totalCount   = liveAttendance.length;

  return (
    <div style={{ minHeight: "100vh", background: "#F5F7FA" }}>
      <Navbar />

      <div style={styles.page}>
        <h2 style={styles.heading}>Generate Attendance QR Code</h2>

        {/* Controls */}
        <div style={styles.controlCard}>
          <div style={styles.controlRow}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Subject</label>
              <select style={styles.select} value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}>
                <option value="">-- Select Subject --</option>
                {subjects.map(s => (
                  <option key={s.subject_id} value={s.subject_id}>
                    {s.subject_name} ({s.subject_code})
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>QR Valid For</label>
              <select style={styles.select} value={duration}
                onChange={e => setDuration(Number(e.target.value))}>
                <option value={3}>3 minutes</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button style={styles.genBtn} onClick={generateQR} disabled={generating}>
                {generating ? "Generating..." : "⚡ Generate QR"}
              </button>
            </div>
          </div>
          {error && <div style={styles.error}>{error}</div>}
        </div>

        {/* Main content */}
        {qrData && (
          <div style={styles.mainRow}>

            {/* QR Card */}
            <div style={styles.qrCard}>
              <p style={styles.qrLabel}>Show this QR to students</p>
              <img src={qrData.qr_image} alt="QR Code" style={styles.qrImg} />

              {/* Timer */}
              <div style={{
                ...styles.timerBox,
                background: timeLeft > 60 ? "#E8F5E9" : "#FFEBEE",
                border: `2px solid ${timeLeft > 60 ? "#2E7D32" : "#B71C1C"}`
              }}>
                <span style={{
                  fontSize: 36, fontWeight: 800,
                  color: timeLeft > 60 ? "#2E7D32" : "#B71C1C"
                }}>{fmt(timeLeft)}</span>
                <p style={{ margin: 0, fontSize: 12, color: "#90A4AE" }}>
                  {timeLeft > 0 ? "Time remaining" : "⚠ QR Expired"}
                </p>
              </div>

              {/* Stats */}
              <div style={styles.statsRow}>
                <div style={styles.statBox}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: "#2E7D32" }}>
                    {presentCount}
                  </span>
                  <span style={{ fontSize: 12, color: "#90A4AE" }}>Present</span>
                </div>
                <div style={styles.statBox}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: "#B71C1C" }}>
                    {totalCount - presentCount}
                  </span>
                  <span style={{ fontSize: 12, color: "#90A4AE" }}>Absent</span>
                </div>
                <div style={styles.statBox}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: "#1565C0" }}>
                    {totalCount > 0 ? Math.round(presentCount / totalCount * 100) : 0}%
                  </span>
                  <span style={{ fontSize: 12, color: "#90A4AE" }}>Rate</span>
                </div>
              </div>
            </div>

            {/* Live Attendance Table */}
            <div style={styles.tableCard}>
              <div style={styles.tableHeader}>
                <h3 style={{ margin: 0, color: "#0D1B2A" }}>
                  Live Attendance
                </h3>
                <span style={styles.liveDot}>● LIVE</span>
              </div>

              <table style={styles.table}>
                <thead>
                  <tr style={{ background: "#1565C0" }}>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Enrollment</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Scan Time</th>
                  </tr>
                </thead>
                <tbody>
                  {liveAttendance.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ ...styles.td, textAlign: "center", color: "#90A4AE" }}>
                        Waiting for students to scan...
                      </td>
                    </tr>
                  )}
                  {liveAttendance.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#F5F7FA" : "#fff" }}>
                      <td style={styles.td}>{i + 1}</td>
                      <td style={styles.td}>{row.enrollment_no}</td>
                      <td style={styles.td}>{row.name}</td>
                      <td style={styles.td}>
                        <span style={{
                          padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                          background: row.status === "present" ? "#E8F5E9" : "#FFEBEE",
                          color: row.status === "present" ? "#2E7D32" : "#B71C1C"
                        }}>
                          {row.status === "present" ? "✓ Present" : "✗ Absent"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {row.scan_time
                          ? new Date(row.scan_time).toLocaleTimeString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "28px 32px", maxWidth: 1200, margin: "0 auto" },
  heading: { color: "#0D1B2A", fontSize: 24, marginBottom: 20 },
  controlCard: {
    background: "#fff", borderRadius: 12, padding: "20px 24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)", marginBottom: 28
  },
  controlRow: { display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-end" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6, minWidth: 200 },
  label: { fontSize: 13, fontWeight: 600, color: "#37474F" },
  select: {
    padding: "10px 13px", borderRadius: 8, border: "1px solid #DDE3EA",
    fontSize: 14, background: "#fff"
  },
  genBtn: {
    padding: "10px 24px", background: "#1565C0", color: "#fff",
    border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14,
    cursor: "pointer", whiteSpace: "nowrap"
  },
  error: {
    marginTop: 12, background: "#FFEBEE", color: "#B71C1C",
    padding: "10px 14px", borderRadius: 8, fontSize: 13
  },
  mainRow: { display: "flex", gap: 24, flexWrap: "wrap" },
  qrCard: {
    background: "#fff", borderRadius: 16, padding: 24,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)", minWidth: 290, flex: "0 0 auto"
  },
  qrLabel: { textAlign: "center", color: "#90A4AE", fontSize: 13, marginTop: 0 },
  qrImg: { width: 260, height: 260, display: "block", margin: "0 auto" },
  timerBox: {
    marginTop: 16, padding: "14px 20px", borderRadius: 12,
    textAlign: "center"
  },
  statsRow: { display: "flex", justifyContent: "space-around", marginTop: 16 },
  statBox: { display: "flex", flexDirection: "column", alignItems: "center" },
  tableCard: {
    background: "#fff", borderRadius: 16, padding: 24,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)", flex: 1, minWidth: 360
  },
  tableHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16
  },
  liveDot: { color: "#2E7D32", fontWeight: 700, fontSize: 12, animation: "pulse 1s infinite" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "10px 12px", color: "#fff", textAlign: "left", fontSize: 13 },
  td: { padding: "10px 12px", fontSize: 13, color: "#37474F", borderBottom: "1px solid #EEF2F7" },
};
