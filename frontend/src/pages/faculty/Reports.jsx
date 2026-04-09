import React, { useState, useEffect } from 'react';
import api from '../../api';
import { FileDown, RefreshCw, PieChart as PieChartIcon } from 'lucide-react';
import { DistributionPieChart } from '../../components/analytics/AnalyticsCharts';

const FacultyReports = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [reportData, setReportData] = useState([]);
  const [analytics, setAnalytics] = useState({ distribution: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
    fetchAnalytics();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/faculty/subjects');
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubject(data[0].subject_id);
        fetchReport(data[0].subject_id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching subjects", error);
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get('/analytics/faculty/overview');
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching faculty analytics", error);
    }
  };

  const fetchReport = async (subjectId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/faculty/reports/${subjectId}`);
      setReportData(data);
    } catch (error) {
      console.error("Error fetching report", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (e) => {
    const subId = e.target.value;
    setSelectedSubject(subId);
    fetchReport(subId);
  };

  if (loading && subjects.length === 0) return <div>Loading reports...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Attendance Reports</h1>
          <p style={{ color: 'var(--text-muted)' }}>View detailed attendance metrics and distribution.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <select 
            className="input-field" 
            style={{ width: '200px', background: 'var(--bg-secondary)' }}
            value={selectedSubject}
            onChange={handleSubjectChange}
          >
            {subjects.map(sub => (
              <option key={sub.subject_id} value={sub.subject_id}>{sub.subject_code} - {sub.subject_name}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => fetchReport(selectedSubject)}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', marginBottom: '32px' }}>
        
        {/* Reports Table */}
        <div className="glass-panel table-container" style={{ margin: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Attended</th>
                <th>Total</th>
                <th>Percentage</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map(student => (
                <tr key={student.user_id}>
                  <td style={{ fontWeight: 500 }}>{student.name}</td>
                  <td>{student.attended}</td>
                  <td>{student.total_sessions}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${student.percentage}%`,
                          background: student.percentage >= 75 ? 'var(--success)' : student.percentage >= 50 ? 'var(--warning)' : 'var(--danger)'
                        }}></div>
                      </div>
                      <span style={{ fontSize: '13px', width: '40px', textAlign: 'right' }}>{student.percentage}%</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
                      background: student.percentage >= 75 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: student.percentage >= 75 ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {student.percentage >= 75 ? 'GOOD' : 'SHORT'}
                    </span>
                  </td>
                </tr>
              ))}
              {reportData.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>No attendance data found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Analytics Sidebar */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <PieChartIcon size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Distribution</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '20px' }}>
            Student attendance brackets for this subject.
          </p>
          <DistributionPieChart data={analytics.distribution} />
        </div>

      </div>
    </div>
  );
};

export default FacultyReports;
