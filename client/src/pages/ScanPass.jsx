import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import API from '../api';

export default function ScanPass() {
  const [scanResult, setScanResult] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 5
    });

    scanner.render(
      async (result) => {
        try {
          const parsed = JSON.parse(result);
          setScanResult(parsed);
          
          // Verify ticket on backend
          const res = await API.post('/events/verify-ticket', { ticketId: parsed.ticketId });
          setMessage(`✅ Pass Verified! Attendee: ${res.data.userName}`);
        } catch (err) {
          setMessage('❌ Invalid QR Code or Expired Pass');
        }
      },
      (error) => {
        // Continuous scanning
      }
    );

    return () => scanner.clear();
  }, []);

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'center', color: '#fff' }}>
      <h2>Organizer Pass Verification</h2>
      <div id="reader" style={{ background: '#fff', borderRadius: '12px', padding: '10px' }}></div>
      {message && <p style={{ fontSize: '1.2rem', marginTop: '1rem', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}