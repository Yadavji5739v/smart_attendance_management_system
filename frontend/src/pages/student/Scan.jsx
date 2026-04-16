import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

const StudentScan = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(true);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!scanning) return;

    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        
        // Force backward camera (environment)
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          onScanFailure
        );
      } catch (err) {
        console.error("Scanner start error:", err);
        setError("Could not access camera. Please ensure permissions are granted.");
      }
    };

    // Slight delay to ensure DOM element is ready
    const timer = setTimeout(startScanner, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Error stopping scanner:", err));
      }
    };
  }, [scanning]);

  const onScanSuccess = async (decodedText) => {
    try {
      const data = JSON.parse(decodedText);
      if (data.session_id && data.token) {
        // Stop scanning immediately
        if (scannerRef.current) {
          await scannerRef.current.stop();
        }
        setScanning(false);
        markAttendance(data);
      } else {
        setError('Invalid QR format. Please scan a valid faculty QR code.');
      }
    } catch(e) {
      setError('Invalid QR Content.');
    }
  };

  const onScanFailure = (error) => {
    // Expected behavior, we don't need to log every failure
  };

  const getGeoLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        const options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          (err) => {
            console.error("Geo error:", err);
            reject(new Error('Please enable location access and ensure you have a clear GPS signal to mark attendance'));
          },
          options
        );
      }
    });
  };

  const getDeviceId = () => {
    let deviceId = localStorage.getItem('attendance_device_id');
    if (!deviceId) {
      deviceId = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('attendance_device_id', deviceId);
    }
    return deviceId;
  };

  const markAttendance = async (data) => {
    try {
      setScanResult({ success: false, message: 'Verifying location...' });
      
      let coords = { latitude: null, longitude: null };
      try {
        coords = await getGeoLocation();
      } catch (geoErr) {
        setScanResult({ success: false, message: geoErr.message });
        return;
      }

      const deviceId = getDeviceId();

      const response = await api.post('/student/scan', {
        session_id: data.session_id,
        token: data.token,
        latitude: coords.latitude,
        longitude: coords.longitude,
        device_id: deviceId
      });
      setScanResult({ success: true, message: response.data.message });
    } catch (err) {
      setScanResult({ success: false, message: err.response?.data?.message || 'Failed to mark attendance' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '40px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Scan QR Code</h1>
        <p style={{ color: 'var(--text-muted)' }}>Scan the QR code presented by your faculty to mark attendance.</p>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        
        {scanning ? (
          <div>
            <div id="reader" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', background: '#000' }}></div>
            {error && (
              <div style={{ 
                color: 'var(--danger)', 
                marginTop: '16px', 
                fontSize: '14px',
                padding: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '8px'
              }}>
                {error}
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '40px 0', animation: 'fadeIn 0.5s ease' }}>
            {scanResult?.success ? (
              <>
                <div style={{ display: 'inline-flex', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--success)' }}>
                  <CheckCircle size={48} />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)', marginBottom: '12px' }}>Success!</h2>
                <p style={{ color: 'var(--text-muted)' }}>{scanResult.message}</p>
              </>
            ) : (
              <>
                <div style={{ display: 'inline-flex', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--danger)' }}>
                  <XCircle size={48} />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--danger)', marginBottom: '12px' }}>{scanResult ? 'Failed' : 'Processing...'}</h2>
                <p style={{ color: 'var(--text-muted)' }}>{scanResult?.message || 'Please wait...'}</p>
              </>
            )}

            <button 
              className="btn btn-primary" 
              style={{ marginTop: '32px', width: '100%' }}
              onClick={() => navigate('/student')}
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentScan;

