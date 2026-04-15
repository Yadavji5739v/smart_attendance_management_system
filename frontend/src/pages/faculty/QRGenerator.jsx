import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { Zap, Users } from 'lucide-react';

const FacultyQRGenerator = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [duration, setDuration] = useState(5);
  const [qrData, setQrData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [liveAttendance, setLiveAttendance] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    clearInterval(timerRef.current);
    if (timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  useEffect(() => {
    clearInterval(pollRef.current);
    if (!qrData) return;
    const fetchAttendance = () =>
      api.get(`/qr/session/${qrData.session_id}`)
        .then(r => setLiveAttendance(r.data))
        .catch(console.error);
    fetchAttendance();
    pollRef.current = setInterval(fetchAttendance, 4000);
    return () => clearInterval(pollRef.current);
  }, [qrData]);

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/faculty/subjects');
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubject(data[0].subject_id);
      }
    } catch (error) {
      console.error('Error fetching subjects', error);
    }
  };

  const getGeoLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position.coords),
          (err) => reject(new Error('Please enable location access to start a session')),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      }
    });
  };

  const generateQR = async () => {
    if (!selectedSubject) {
      setError('Please select a subject first');
      return;
    }
    setError('');
    setGenerating(true);
    try {
      let coords = { latitude: null, longitude: null };
      try {
        coords = await getGeoLocation();
      } catch (geoErr) {
        setError(geoErr.message);
        setGenerating(false);
        return;
      }

      const { data } = await api.post('/faculty/sessions', {
        subject_id: selectedSubject,
        duration_minutes: duration,
        latitude: coords.latitude,
        longitude: coords.longitude
      });
      
      const payload = JSON.stringify({
        session_id: data.session_id,
        token: data.qr_token,
        expiry: data.expiry_time
      });
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(payload)}`;
      
      setQrData({
        ...data,
        qr_image: qrUrl
      });
      setTimeLeft(duration * 60);
      setLiveAttendance([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate QR');
    } finally {
      setGenerating(false);
    }
  };

  const stopQR = async () => {
    if (!qrData) return;
    try {
      await api.put(`/faculty/sessions/${qrData.session_id}/end`);
      setQrData(null);
      setTimeLeft(0);
      setLiveAttendance([]);
    } catch (error) {
      console.error('Error stopping QR', error);
    }
  };

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const presentCount = liveAttendance.filter(r => r.status === 'present').length;
  const totalCount = liveAttendance.length;

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Generate QR Code</h1>
        <p style={{ color: 'var(--text-muted)' }}>Create attendance QR codes for your classes.</p>
      </div>

      {/* Controls */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Subject</label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.2)',
                color: '#fff',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '14px'
              }}
            >
              <option value="">-- Select Subject --</option>
              {subjects.map(s => (
                <option key={s.subject_id} value={s.subject_id}>
                  {s.subject_code} - {s.subject_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>QR Valid For</label>
            <select
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.2)',
                color: '#fff',
                border: '1px solid var(--border-glass)',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '14px'
              }}
            >
              <option value={3}>3 minutes</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
            </select>
          </div>

          <button
            onClick={generateQR}
            disabled={generating || !selectedSubject}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: generating || !selectedSubject ? 0.5 : 1,
              justifySelf: 'end'
            }}
          >
            <Zap size={16} />
            {generating ? 'Generating...' : 'Generate QR'}
          </button>
        </div>
        {error && (
          <div style={{
            marginTop: '12px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Main Content */}
      {qrData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* QR Code Card */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>Show this QR to students</p>
              <div style={{ background: 'white', padding: '16px', borderRadius: '12px', display: 'inline-block' }}>
                <img
                  src={qrData.qr_image}
                  alt="QR Code"
                  style={{ width: '260px', height: '260px', display: 'block', borderRadius: '8px' }}
                />
              </div>
            </div>

            {/* Timer */}
            <div
              style={{
                marginTop: '20px',
                padding: '16px',
                borderRadius: '12px',
                textAlign: 'center',
                background: timeLeft > 60 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `2px solid ${timeLeft > 60 ? 'var(--success)' : '#ef4444'}`
              }}
            >
              <div style={{ fontSize: '36px', fontWeight: '800', color: timeLeft > 60 ? 'var(--success)' : '#ef4444' }}>
                {fmt(timeLeft)}
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                {timeLeft > 0 ? 'Time remaining' : '⚠️ QR Expired'}
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '20px' }}>
              <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--success)' }}>{presentCount}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Present</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#ef4444' }}>{totalCount - presentCount}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Absent</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>
                  {totalCount > 0 ? Math.round(presentCount / totalCount * 100) : 0}%
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Rate</div>
              </div>
            </div>

            <button
              onClick={stopQR}
              className="btn btn-danger"
              style={{ width: '100%', marginTop: '20px' }}
            >
              Stop QR Code
            </button>
          </div>

          {/* Live Attendance Card */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Live Attendance</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--success)' }}>
                <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', animation: 'pulse 1s infinite' }}></div>
                LIVE
              </div>
            </div>

            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {liveAttendance.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <Users size={40} style={{ opacity: 0.5, marginBottom: '12px' }} />
                  <p>Waiting for students to scan...</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {liveAttendance.map((student, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '8px'
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: student.status === 'present' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: student.status === 'present' ? 'var(--success)' : '#ef4444',
                          flexShrink: 0
                        }}
                      >
                        {student.status === 'present' ? '✓' : '✗'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {student.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {student.enrollment_no}
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>
                        {student.scan_time ? new Date(student.scan_time).toLocaleTimeString() : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyQRGenerator;
