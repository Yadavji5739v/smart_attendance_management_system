import React, { useState, useEffect } from 'react';
import api from '../../api';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { AttendanceTrendChart } from '../../components/analytics/AnalyticsCharts';

const StudentDashboard = () => {
  const [summary, setSummary] = useState([]);
  const [analytics, setAnalytics] = useState({ trend: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const summaryRes = await api.get('/student/dashboard');
      setSummary(summaryRes.data);

      const analyticsRes = await api.get('/analytics/student/my');
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error("Failed to load dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>My Attendance</h1>
        <p style={{ color: 'var(--text-muted)' }}>Overview of your current semester attendance.</p>
      </div>

      {summary.some(s => s.percentage < 75 && s.total_sessions > 0) && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', 
          padding: '16px 20px', borderRadius: '12px', marginBottom: '32px',
          display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--danger)'
        }}>
          <AlertCircle size={24} />
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Attention Required</h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Your attendance is below 75% in one or more subjects. Please ensure you attend regular classes.</p>
          </div>
        </div>
      )}

      {/* Analytics Section */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <TrendingUp size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Overall Attendance Trend</h3>
        </div>
        <AttendanceTrendChart data={analytics.trend || []} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {summary.map(sub => (
          <div key={sub.subject_id} className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '4px' }}>{sub.subject_code}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{sub.subject_name}</h3>
              </div>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '12px', 
                background: sub.percentage >= 75 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                color: sub.percentage >= 75 ? 'var(--success)' : 'var(--danger)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {sub.percentage >= 75 ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                <span style={{ fontWeight: '600', color: sub.percentage >= 75 ? 'var(--primary)' : 'var(--danger)' }}>
                  {sub.percentage}%
                </span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', width: `${sub.percentage}%`, 
                  background: sub.percentage >= 75 ? 'linear-gradient(90deg, var(--primary), var(--secondary))' : 'var(--danger)',
                  transition: 'width 1s ease-in-out'
                }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-muted)' }}>
              <div>Attended: <span style={{ color: 'white', fontWeight: '500' }}>{sub.attended}</span></div>
              <div>Total: <span style={{ color: 'white', fontWeight: '500' }}>{sub.total_sessions}</span></div>
            </div>
          </div>
        ))}
        {summary.length === 0 && (
          <div style={{ color: 'var(--text-muted)' }}>No subjects registered.</div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
