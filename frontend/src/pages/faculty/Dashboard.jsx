import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Play, Square, Users } from 'lucide-react';

const FacultyDashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [selSemester, setSelSemester] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Session State
  const [activeSession, setActiveSession] = useState(null);
  const [qrImage, setQrImage] = useState('');
  const [liveAttendance, setLiveAttendance] = useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    let interval;
    if (activeSession) {
      fetchLiveAttendance(activeSession.session_id);
      interval = setInterval(() => {
        fetchLiveAttendance(activeSession.session_id);
      }, 3000); // Poll every 3 seconds
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/faculty/subjects');
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveAttendance = async (sessionId) => {
    try {
      const { data } = await api.get(`/faculty/sessions/${sessionId}/live`);
      setLiveAttendance(data);
    } catch (error) {
      console.error("Error fetching live attendance", error);
    }
  };

  const filteredSubjects = subjects.filter(sub => {
    if (selSemester === 'all') return true;
    return String(sub.semester) === String(selSemester);
  });

  const startSession = async (subjectId) => {
    try {
      const { data } = await api.post('/faculty/sessions', { subject_id: subjectId, duration_minutes: 5 });
      setActiveSession(data);
      
      const payload = JSON.stringify({ session_id: data.session_id, token: data.qr_token, expiry: data.expiry_time });
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(payload)}`;
      setQrImage(qrUrl);
      
    } catch (error) {
      alert('Error starting session');
    }
  };

  const endSession = async () => {
    if (!activeSession) return;
    try {
      await api.put(`/faculty/sessions/${activeSession.session_id}/end`);
      setActiveSession(null);
      setQrImage('');
      setLiveAttendance([]);
    } catch (error) {
      alert('Error ending session');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Faculty Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your subjects and attendance sessions.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: activeSession ? '1fr 350px' : '1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Subjects List */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '20px' }}>Your Subjects</h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Debug: Received {subjects.length} total subjects from server</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Filter by Semester:</span>
               <select 
                value={selSemester}
                onChange={(e) => setSelSemester(e.target.value)}
                style={{ 
                  background: 'rgba(0,0,0,0.3)', color: '#fff', 
                  border: '1px solid var(--border-glass)', borderRadius: '8px', 
                  padding: '4px 12px', fontSize: '14px' 
                }}
               >
                 <option value="all">All Semesters</option>
                 {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
               </select>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredSubjects.map(sub => (
              <div key={sub.subject_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontWeight: '600', fontSize: '16px', color: 'var(--primary)' }}>{sub.subject_code}</div>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>S{sub.semester || '?'}</span>
                  </div>
                  <div style={{ fontSize: '14px' }}>{sub.subject_name}</div>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => startSession(sub.subject_id)}
                  disabled={!!activeSession}
                  style={{ opacity: activeSession ? 0.5 : 1 }}
                >
                  <Play size={16} /> Start Session
                </button>
              </div>
            ))}
            {filteredSubjects.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No subjects allotted for this semester.</div>
            )}
          </div>
        </div>

        {/* Active Session Sidebar */}
        {activeSession && (
          <div className="glass-panel" style={{ padding: '24px', position: 'sticky', top: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 10px var(--success)' }}></div>
                Active Session
              </h2>
              <button className="btn btn-danger" onClick={endSession} style={{ padding: '6px 12px', fontSize: '12px' }}>
                <Square size={14} /> End
              </button>
            </div>

            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', marginBottom: '24px', textAlign: 'center' }}>
              {qrImage && <img src={qrImage} alt="QR Code" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />}
            </div>

            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Live Attendance</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '600', color: 'var(--primary)' }}>
                <Users size={16} /> {liveAttendance.length}
              </div>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {liveAttendance.map((student, i) => (
                <div key={i} style={{ padding: '10px', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                    {student.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '14px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{student.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(student.scan_time).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {liveAttendance.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Waiting for students...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;
