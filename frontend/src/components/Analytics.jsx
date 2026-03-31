const BACKEND = import.meta.env.VITE_API_URL || '';
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import axios from "axios";
import Navbar from "./Navbar";

const H = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const COLORS = ["#1565C0", "#00897B", "#E65100", "#6A1B9A", "#2E7D32"];

export default function Analytics() {
  const [tab,         setTab]         = useState("summary");
  const [summary,     setSummary]     = useState([]);
  const [defaulters,  setDefaulters]  = useState([]);
  const [branchData,  setBranchData]  = useState([]);
  const [branches,    setBranches]    = useState([]);
  const [selBranch,   setSelBranch]   = useState("all");
  const [selSemester, setSelSemester] = useState("all");
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const h = { headers: H() };
    Promise.all([
      axios.get(`${BACKEND}/api/analytics/student-summary`, h),
      axios.get(`${BACKEND}/api/analytics/defaulters?threshold=75`, h),
      axios.get(`${BACKEND}/api/analytics/branch`, h),
      axios.get(`${BACKEND}/api/analytics/branches`, h),
    ]).then(([s, d, b, br]) => {
      setSummary(s.data);
      setDefaulters(d.data);
      setBranchData(b.data);
      setBranches(br.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Deduplicate summary by subject_code (take max attendance)
  const dedupedSummary = Object.values(
    summary.reduce((acc, s) => {
      const key = s.subject_code;
      if (!acc[key] || (s.attendance_pct||0) > (acc[key].attendance_pct||0))
        acc[key] = s;
      return acc;
    }, {})
  );

  // Filter summary by branch
  const filteredSummary = dedupedSummary.filter(s => {
    if (selBranch === "all") return true;
    return s.branch_name === selBranch;
  });

  // Filter defaulters
  const filteredDefaulters = defaulters.filter(d => {
    const branchOk   = selBranch === "all" || d.branch_name === selBranch;
    const semOk      = selSemester === "all" || String(d.semester) === selSemester;
    return branchOk && semOk;
  });

  const semesters = ["all", "1","2","3","4","5","6","7","8"];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F5F7FA" }}>
      <Navbar />
      <div style={{ textAlign:"center", padding:80, color:"#90A4AE", fontSize:18 }}>
        Loading analytics...
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#F5F7FA" }}>
      <Navbar />
      <div style={S.page}>
        <h2 style={S.heading}>Attendance Analytics</h2>

        {/* Tabs */}
        <div style={S.tabBar}>
          {[
            { key:"summary",    label:"📊 Attendance Summary" },
            { key:"defaulters", label:"⚠ Defaulters"          },
            { key:"branch",     label:"🏫 Branch Analytics"   },
          ].map(t => (
            <button key={t.key}
              style={{ ...S.tab, ...(tab===t.key ? S.activeTab : {}) }}
              onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={S.filterRow}>
          <div style={S.filterGroup}>
            <label style={S.filterLabel}>Branch</label>
            <select style={S.select} value={selBranch}
              onChange={e => setSelBranch(e.target.value)}>
              <option value="all">All Branches</option>
              {branches.map(b => (
                <option key={b.branch_id} value={b.branch_name}>
                  {b.branch_name}
                </option>
              ))}
            </select>
          </div>
          <div style={S.filterGroup}>
            <label style={S.filterLabel}>Semester</label>
            <select style={S.select} value={selSemester}
              onChange={e => setSelSemester(e.target.value)}>
              {semesters.map(s => (
                <option key={s} value={s}>
                  {s === "all" ? "All Semesters" : `Semester ${s}`}
                </option>
              ))}
            </select>
          </div>
          <div style={S.filterGroup}>
            <label style={S.filterLabel}>&nbsp;</label>
            <button style={S.resetBtn}
              onClick={() => { setSelBranch("all"); setSelSemester("all"); }}>
              Reset Filters
            </button>
          </div>
        </div>

        {/* ── SUMMARY TAB ── */}
        {tab === "summary" && (
          <div>
            <div style={S.statRow}>
              {[
                { label:"Subjects",      value: filteredSummary.length,          color:"#1565C0" },
                { label:"Avg Attendance",
                  value: filteredSummary.length
                    ? (filteredSummary.reduce((a,s)=>a+(s.attendance_pct||0),0)
                        / filteredSummary.length).toFixed(1)+"%"
                    : "0%",                                                       color:"#2E7D32" },
                { label:"Below 75%",
                  value: filteredSummary.filter(s=>(s.attendance_pct||0)<75).length, color:"#B71C1C" },
                { label:"Total Classes",
                  value: filteredSummary.reduce((a,s)=>a+(s.total_classes||0),0), color:"#6A1B9A" },
              ].map((st,i) => (
                <div key={i} style={{ ...S.statCard, borderTop:`4px solid ${st.color}` }}>
                  <span style={{ fontSize:32, fontWeight:800, color:st.color }}>{st.value}</span>
                  <span style={{ fontSize:12, color:"#90A4AE", marginTop:4 }}>{st.label}</span>
                </div>
              ))}
            </div>

            <div style={S.chartCard}>
              <h3 style={S.chartTitle}>Subject-wise Attendance %</h3>
              {filteredSummary.length === 0
                ? <p style={{ color:"#90A4AE", textAlign:"center", padding:40 }}>
                    No data — select a different branch or check database
                  </p>
                : <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={filteredSummary}
                      margin={{ top:10, right:20, left:0, bottom:60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                      <XAxis dataKey="subject_code"
                        tick={{ fontSize:11, fill:"#90A4AE" }}
                        angle={-30} textAnchor="end" interval={0} />
                      <YAxis domain={[0,100]}
                        tickFormatter={v=>`${v}%`}
                        tick={{ fontSize:12, fill:"#90A4AE" }} />
                      <Tooltip
                        formatter={(v,n,p) => [`${v}%`, p.payload.subject_name]} />
                      <Bar dataKey="attendance_pct" radius={[6,6,0,0]}>
                        {filteredSummary.map((s,i) => (
                          <Cell key={i}
                            fill={(s.attendance_pct||0)>=75 ? "#1565C0" : "#B71C1C"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
              }
            </div>

            <div style={S.cardGrid}>
              {filteredSummary.map((s,i) => {
                const pct = s.attendance_pct || 0;
                const ok  = pct >= 75;
                return (
                  <div key={i} style={{
                    ...S.subCard,
                    borderLeft:`4px solid ${ok ? "#2E7D32" : "#B71C1C"}`
                  }}>
                    <p style={{ margin:0, fontWeight:700, color:"#0D1B2A", fontSize:14 }}>
                      {s.subject_name}
                    </p>
                    <p style={{ margin:"2px 0 4px", color:"#90A4AE", fontSize:11 }}>
                      {s.subject_code}
                      {s.branch_name && ` · ${s.branch_name}`}
                    </p>
                    <p style={{ margin:0, fontSize:30, fontWeight:800,
                      color: ok ? "#2E7D32" : "#B71C1C" }}>{pct}%</p>
                    <p style={{ margin:"4px 0 0", color:"#90A4AE", fontSize:12 }}>
                      {s.present_count} / {s.total_classes} classes
                    </p>
                    {!ok && <span style={S.warnBadge}>⚠ Below 75%</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── DEFAULTERS TAB ── */}
        {tab === "defaulters" && (
          <div style={S.chartCard}>
            <h3 style={S.chartTitle}>
              Students Below 75%
              <span style={{ fontSize:13, fontWeight:400, color:"#90A4AE", marginLeft:10 }}>
                ({filteredDefaulters.length} records)
              </span>
            </h3>
            <table style={S.table}>
              <thead>
                <tr style={{ background:"#B71C1C" }}>
                  {["#","Name","Branch","Subject","Attendance","Status"].map(h=>(
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDefaulters.length === 0
                  ? <tr><td colSpan={6}
                      style={{ ...S.td, textAlign:"center", color:"#90A4AE", padding:40 }}>
                      🎉 No defaulters found!
                    </td></tr>
                  : filteredDefaulters.map((d,i) => (
                    <tr key={i} style={{ background: i%2===0 ? "#FFF8F8":"#fff" }}>
                      <td style={S.td}>{i+1}</td>
                      <td style={S.td}>{d.name}</td>
                      <td style={S.td}>{d.branch_name}</td>
                      <td style={S.td}>{d.subject_name}</td>
                      <td style={S.td}>
                        <span style={{ fontWeight:700,
                          color:(d.pct||0)<65?"#B71C1C":"#E65100" }}>
                          {d.pct||0}%
                        </span>
                      </td>
                      <td style={S.td}>
                        <span style={{
                          padding:"3px 10px", borderRadius:20,
                          fontSize:11, fontWeight:700,
                          background:(d.pct||0)<65?"#FFEBEE":"#FFF3E0",
                          color:(d.pct||0)<65?"#B71C1C":"#E65100"
                        }}>
                          {(d.pct||0)<65?"Detained":"Warning"}
                        </span>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}

        {/* ── BRANCH TAB ── */}
        {tab === "branch" && (
          <div>
            {/* Branch cards */}
            <div style={S.statRow}>
              {branchData.map((b,i) => (
                <div key={i} style={{ ...S.statCard, borderTop:`4px solid ${COLORS[i]}` }}>
                  <span style={{ fontSize:13, fontWeight:700, color:"#0D1B2A" }}>
                    {b.branch_name}
                  </span>
                  <span style={{ fontSize:28, fontWeight:800, color:COLORS[i], margin:"8px 0 4px" }}>
                    {b.avg_attendance||0}%
                  </span>
                  <span style={{ fontSize:12, color:"#90A4AE" }}>
                    {b.total_students} students
                  </span>
                </div>
              ))}
            </div>

            <div style={S.branchRow}>
              {/* Pie */}
              <div style={{ ...S.chartCard, flex:1 }}>
                <h3 style={S.chartTitle}>Branch-wise Avg Attendance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={branchData.map(b=>({
                            ...b,
                            avg_attendance: b.avg_attendance||0
                          }))}
                      dataKey="avg_attendance" nameKey="branch_name"
                      cx="50%" cy="50%" outerRadius={110}
                      label={({name,value})=>`${name.split(' ')[0]}: ${value}%`}>
                      {branchData.map((_,i) => (
                        <Cell key={i} fill={COLORS[i%COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={v=>[`${v}%`,"Avg Attendance"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar - students */}
              <div style={{ ...S.chartCard, flex:1 }}>
                <h3 style={S.chartTitle}>Students per Branch</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={branchData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                    <XAxis dataKey="branch_name"
                      tick={{ fontSize:10, fill:"#90A4AE" }}
                      angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize:12, fill:"#90A4AE" }} />
                    <Tooltip />
                    <Bar dataKey="total_students" fill="#00897B"
                      radius={[6,6,0,0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>

                <table style={{ ...S.table, marginTop:16 }}>
                  <thead>
                    <tr style={{ background:"#1565C0" }}>
                      <th style={S.th}>Branch</th>
                      <th style={S.th}>Department</th>
                      <th style={S.th}>Students</th>
                      <th style={S.th}>Avg Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branchData.map((b,i) => (
                      <tr key={i} style={{ background:i%2===0?"#F5F7FA":"#fff" }}>
                        <td style={S.td}>{b.branch_name}</td>
                        <td style={S.td}>{b.department}</td>
                        <td style={S.td}>{b.total_students}</td>
                        <td style={S.td}>
                          <span style={{ fontWeight:700,
                            color:(b.avg_attendance||0)>=75?"#2E7D32":"#B71C1C" }}>
                            {b.avg_attendance||0}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  page:      { padding:"28px 32px", maxWidth:1200, margin:"0 auto" },
  heading:   { color:"#0D1B2A", fontSize:24, marginBottom:20 },
  tabBar:    { display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" },
  tab:       { padding:"9px 20px", borderRadius:8, border:"1px solid #DDE3EA",
               background:"#fff", cursor:"pointer", fontSize:13, color:"#37474F" },
  activeTab: { background:"#1565C0", color:"#fff", border:"1px solid #1565C0", fontWeight:700 },
  filterRow: { display:"flex", gap:16, marginBottom:24, flexWrap:"wrap",
               background:"#fff", padding:"16px 20px", borderRadius:12,
               boxShadow:"0 2px 12px rgba(0,0,0,0.07)" },
  filterGroup:{ display:"flex", flexDirection:"column", gap:4 },
  filterLabel:{ fontSize:12, fontWeight:600, color:"#37474F" },
  select:    { padding:"8px 12px", borderRadius:8, border:"1px solid #DDE3EA",
               fontSize:13, minWidth:180, background:"#fff" },
  resetBtn:  { padding:"8px 16px", borderRadius:8, border:"1px solid #DDE3EA",
               background:"#F5F7FA", cursor:"pointer", fontSize:13 },
  statRow:   { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",
               gap:16, marginBottom:24 },
  statCard:  { background:"#fff", borderRadius:12, padding:"20px 20px 16px",
               boxShadow:"0 2px 12px rgba(0,0,0,0.07)",
               display:"flex", flexDirection:"column" },
  chartCard: { background:"#fff", borderRadius:16, padding:24,
               boxShadow:"0 4px 20px rgba(0,0,0,0.08)", marginBottom:24 },
  chartTitle:{ color:"#0D1B2A", fontSize:16, margin:"0 0 16px" },
  cardGrid:  { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:16 },
  subCard:   { background:"#fff", borderRadius:12, padding:16,
               boxShadow:"0 2px 12px rgba(0,0,0,0.07)" },
  warnBadge: { display:"inline-block", marginTop:8, fontSize:11,
               color:"#B71C1C", background:"#FFEBEE", padding:"2px 8px", borderRadius:12 },
  table:     { width:"100%", borderCollapse:"collapse" },
  th:        { padding:"10px 16px", color:"#fff", textAlign:"left", fontSize:13 },
  td:        { padding:"10px 16px", fontSize:13, color:"#37474F",
               borderBottom:"1px solid #F0F4FA" },
  branchRow: { display:"flex", gap:24, flexWrap:"wrap" },
};
