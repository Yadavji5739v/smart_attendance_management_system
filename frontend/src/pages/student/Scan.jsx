import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../../api';
import { CheckCircle, XCircle } from 'lucide-react';

const StudentScan = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    // Check if element exists before creating scanner
    const scannerElement = document.getElementById("reader");
    if (!scannerElement) return;

    let scanner;
    
    // Slight delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (document.getElementById("reader")) {
        try {
          scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
            /* verbose= */ false
          );
          
          scanner.render(onScanSuccess, onScanFailure);
        } catch (e) {
          console.error("Scanner init error", e);
        }
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scanner) {
        scanner.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, [scanning]);

  const onScanSuccess = async (decodedText, decodedResult) => {
    try {
      const data = JSON.parse(decodedText);
      if (data.session_id && data.token) {
        setScanning(false);
        // Ensure scanner is cleared completely internally via the component reload logic below
        markAttendance(data);
      } else {
        setError('Invalid QR format. Please scan a valid faculty QR code.');
      }
    } catch(e) {
      setError('Invalid QR Content.');
    }
  };

  const onScanFailure = (error) => {
    // Keep scanning
  };

  const markAttendance = async (data) => {
    try {
      const response = await api.post('/student/scan', {
        session_id: data.session_id,
        token: data.token
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
            <div id="reader" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', background: 'white' }}></div>
            {error && <div style={{ color: 'var(--danger)', marginTop: '16px', fontSize: '14px' }}>{error}</div>}
            <style>
              {`
                #reader__scan_region img { display: none !important; }
                #reader__dashboard_section_csr span { color: black !important; }
                #reader__dashboard_section_csr button { padding: 8px 16px; background: #6366F1; color: white; border: none; border-radius: 6px; cursor: pointer; }
              `}
            </style>
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
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--danger)', marginBottom: '12px' }}>Failed</h2>
                <p style={{ color: 'var(--text-muted)' }}>{scanResult?.message}</p>
              </>
            )}

            <button 
              className="btn btn-primary" 
              style={{ marginTop: '32px' }}
              onClick={() => {
                setScanResult(null);
                setError(null);
                setScanning(true);
              }}
            >
              Scan Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentScan;
