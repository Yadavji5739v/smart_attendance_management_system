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
    <div className="animate-fade-in">
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.025em' }}>Faculty Dashboard</h1>
        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '16px' }}>Manage your subjects and orchestrate real-time attendance.</p>
      </div>

      <div className="responsive-dashboard-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: activeSession ? 'repeat(auto-fit, minmax(350px, 1fr))' : '1fr', 
        gap: '32px', 
        alignItems: 'start' 
      }}>
        
        {/* Subjects List */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700' }}>Your Subjects</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'hsla(0, 0%, 100%, 0.05)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
               <span style={{ fontSize: '12px', fontWeight: '700', color: 'hsl(var(--text-dim))', textTransform: 'uppercase' }}>Semester</span>
               <select 
                value={selSemester}
                onChange={(e) => setSelSemester(e.target.value)}
                style={{ 
                  background: 'transparent', color: '#fff', 
                  border: 'none', borderRadius: '4px', 
                  padding: '2px 4px', fontSize: '14px', fontWeight: '600',
                  outline: 'none', cursor: 'pointer'
                }}
               >
                 <option value="all">All</option>
                 {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>S{s}</option>)}
               </select>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {filteredSubjects.map(sub => (
              <div 
                key={sub.subject_id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '20px', 
                  background: 'hsla(var(--bg-accent), 0.4)', 
                  borderRadius: '16px', 
                  border: '1px solid var(--glass-border)', 
                  flexWrap: 'wrap', 
                  gap: '16px',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <div style={{ fontWeight: '800', fontSize: '18px', color: 'hsl(var(--primary))', letterSpacing: '-0.01em' }}>{sub.subject_code}</div>
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: '800',
                      padding: '3px 10px', 
                      borderRadius: '6px', 
                      background: 'hsla(var(--primary), 0.15)', 
                      color: 'hsl(var(--primary))',
                      textTransform: 'uppercase'
                    }}>Sem {sub.semester || '?'}</span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '500', color: 'hsl(var(--text-main))' }}>{sub.subject_name}</div>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => startSession(sub.subject_id)}
                  disabled={!!activeSession}
                  style={{ opacity: activeSession ? 0.3 : 1, width: 'auto', flexShrink: 0, padding: '10px 24px' }}
                >
                  <Play size={16} fill="currentColor" /> Start Session
                </button>
              </div>
            ))}
            {filteredSubjects.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--text-dim))', background: 'hsla(0,0%,100%,0.02)', borderRadius: '16px', border: '1px dashed var(--glass-border)' }}>
                No subjects allotted for this semester.
              </div>
            )}
          </div>
        </div>

        {/* Active Session Sidebar */}
        {activeSession && (
          <div className="glass-panel" style={{ padding: '32px', position: 'sticky', top: '24px', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '12px', height: '12px', background: 'hsl(var(--success))', borderRadius: '50%', boxShadow: '0 0 15px hsl(var(--success))', animation: 'pulse 2s infinite' }}></div>
                Live Session
              </h2>
              <button className="btn btn-danger" onClick={endSession} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '700' }}>
                <Square size={14} fill="currentColor" /> End
              </button>
            </div>

            <div style={{ 
              background: 'white', 
              padding: '24px', 
              borderRadius: '20px', 
              marginBottom: '32px', 
              textAlign: 'center',
              boxShadow: '0 20px 40px -12px rgba(0,0,0,0.5)'
            }}>
              {qrImage && <img src={qrImage} alt="QR Code" style={{ width: '100%', height: 'auto', borderRadius: '12px' }} />}
              <p style={{ color: '#64748b', fontSize: '12px', marginTop: '16px', fontWeight: '600' }}>Students can scan this code now</p>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Present Students</h3>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '16px', 
                fontWeight: '800', 
                color: 'hsl(var(--primary))',
                background: 'hsla(var(--primary), 0.1)',
                padding: '4px 12px',
                borderRadius: '8px'
              }}>
                <Users size={18} /> {liveAttendance.length}
              </div>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
              {liveAttendance.map((student, i) => (
                <div 
                  key={i} 
                  style={{ 
                    padding: '14px', 
                    background: 'hsla(0, 0%, 100%, 0.03)',
                    borderRadius: '12px',
                    marginBottom: '8px',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '14px',
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '10px', 
                    background: 'hsla(var(--primary), 0.15)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '14px',
                    fontWeight: '700',
                    color: 'hsl(var(--primary))'
                  }}>
                    {student.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{student.name}</div>
                    <div style={{ fontSize: '11px', color: 'hsl(var(--text-dim))' }}>
                      Marked at {new Date(student.scan_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {liveAttendance.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'hsl(var(--text-dim))', fontSize: '14px' }}>
                  <Users size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                  <p>Awaiting first scan...</p>
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
