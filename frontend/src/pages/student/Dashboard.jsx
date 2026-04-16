import React, { useState, useEffect } from 'react';
import api from '../../api';
import { AlertCircle, CheckCircle, TrendingUp, Calendar, BookOpen, UserCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/student/detailed-attendance');
      setData(res.data);
    } catch (error) {
      console.error("Failed to load dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading detailed report...</div>;
  if (!data) return <div className="p-8 text-center text-danger">Error loading data.</div>;

  const COLORS = ['hsl(var(--primary))', 'hsla(var(--primary), 0.2)'];
  const pieData = [
    { name: 'Present', value: data.summary.totalPresent },
    { name: 'Absent', value: data.summary.totalLectures - data.summary.totalPresent }
  ];

  const barData = data.subjectStats.map(s => ({
    name: s.subject_code,
    percentage: s.percentage
  }));

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.025em' }}>Student Attendance</h1>
        <p style={{ color: 'hsl(var(--text-muted))' }}>Track your academic presence across the current semester.</p>
      </div>

      {/* Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Attendance Percentage</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: data.summary.overallPercentage >= 75 ? 'hsl(var(--success))' : 'hsl(var(--danger))' }}>{data.summary.overallPercentage}%</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'hsla(var(--secondary), 0.1)', color: 'hsl(var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={28} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Total Lectures</div>
            <div style={{ fontSize: '28px', fontWeight: '800' }}>{data.summary.totalLectures}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)', color: 'rgb(16, 185, 129)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={28} />
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Total Present</div>
            <div style={{ fontSize: '28px', fontWeight: '800' }}>{data.summary.totalPresent}</div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Attendance Distribution</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--bg-secondary))', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>Subject Performance (%)</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke="hsl(var(--text-dim))" fontSize={12} />
                <YAxis stroke="hsl(var(--text-dim))" fontSize={12} domain={[0, 100]} />
                <Tooltip cursor={{fill: 'hsla(var(--primary), 0.05)'}} contentStyle={{ background: 'hsl(var(--bg-secondary))', border: '1px solid var(--glass-border)', borderRadius: '8px' }} />
                <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Attendance Matrix Table */}
      <div className="glass-panel" style={{ padding: '32px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Calendar size={20} color="hsl(var(--primary))" />
          <h2 style={{ fontSize: '22px', fontWeight: '700' }}>Detailed Attendance Matrix</h2>
        </div>

        <div className="matrix-table-container">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Date</th>
                {data.subjectStats.map(sub => (
                  <th key={sub.subject_id}>
                    <div className="matrix-subject-name" style={{ fontSize: '14px' }}>{sub.subject_name}</div>
                    <div className="matrix-subject-code" style={{ fontSize: '10px', color: 'hsl(var(--text-dim))', fontWeight: '400' }}>{sub.subject_code}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Aggregate Row: Overall Percentage */}
              <tr className="matrix-row-summary">
                <td>Overall Percentage (%)</td>
                {data.subjectStats.map(sub => (
                  <td key={sub.subject_id} style={{ color: sub.percentage >= 75 ? 'hsl(var(--success))' : 'hsl(var(--danger))' }}>
                    {sub.percentage}%
                  </td>
                ))}
              </tr>
              {/* Aggregate Row: Total Present */}
              <tr className="matrix-row-summary">
                <td>Total Present</td>
                {data.subjectStats.map(sub => (
                  <td key={sub.subject_id}>{sub.present}</td>
                ))}
              </tr>
              {/* Aggregate Row: Total Absent */}
              <tr className="matrix-row-summary">
                <td>Total Absent</td>
                {data.subjectStats.map(sub => (
                  <td key={sub.subject_id}>{sub.absent}</td>
                ))}
              </tr>
              {/* Aggregate Row: Total Lectures */}
              <tr className="matrix-row-summary">
                <td>Total Lectures</td>
                {data.subjectStats.map(sub => (
                  <td key={sub.subject_id}>{sub.total}</td>
                ))}
              </tr>

              {/* Daily Data Rows */}
              {data.matrix.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: '600' }}>{row.date}</td>
                  {data.subjectStats.map(sub => {
                    const status = row.subjects[sub.subject_id];
                    return (
                      <td key={sub.subject_id}>
                        {status === 'P' && <div className="status-indicator status-p">P</div>}
                        {status === 'A' && <div className="status-indicator status-a">A</div>}
                        {!status && <div className="status-none">--</div>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
