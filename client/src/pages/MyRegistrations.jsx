import React, { useEffect, useState } from 'react';
import API from '../api';
import { QRCodeSVG } from 'qrcode.react';

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  const fetchRegistrations = async () => {
    try {
      const res = await API.get('/events/my/registrations');
      setRegistrations(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCancelRegistration = async (registrationId, eventId, eventTitle) => {
    const confirmCancel = window.confirm(`Are you sure you want to cancel your pass for "${eventTitle || 'this event'}"?`);
    if (!confirmCancel) return;

    // Pehle ticket/registration ID se call karein, agar na ho toh eventId use karein
    const targetId = registrationId || eventId;
    if (!targetId) {
      setStatusMessage({ text: 'Unable to identify ticket ID for cancellation.', type: 'error' });
      return;
    }

    try {
      // 1st attempt: direct parameterized delete
      await API.delete(`/events/${targetId}`);
      setStatusMessage({ text: 'Ticket cancelled successfully. Seat released.', type: 'success' });
      fetchRegistrations();
    } catch (err) {
      // 2nd attempt fallback: with /cancel suffix
      try {
        await API.delete(`/events/${targetId}/cancel`);
        setStatusMessage({ text: 'Ticket cancelled successfully. Seat released.', type: 'success' });
        fetchRegistrations();
      } catch (fallbackErr) {
        console.error('Cancel API Error:', fallbackErr.response || fallbackErr);
        setStatusMessage({ 
          text: fallbackErr.response?.data?.message || err.response?.data?.message || 'Failed to cancel ticket.', 
          type: 'error' 
        });
      }
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getGoogleCalendarUrl = (event) => {
    if (!event) return '#';
    const title = encodeURIComponent(event.title || 'Tech Event');
    const details = encodeURIComponent(event.description || '');
    const location = encodeURIComponent(event.venue || '');
    
    const startDate = event.date ? new Date(event.date).toISOString().replace(/-|:|\.\d\d\d/g, "") : '';
    const endDate = event.date ? new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "") : '';
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startDate}/${endDate}`;
  };

  if (loading) return <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '3rem' }}>Loading your tickets...</p>;

  return (
    <div style={{ maxWidth: '950px', margin: '2rem auto', padding: '0 1.5rem', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>My Event Passes</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>Scan QR code at event desk for live verification</p>
        </div>
        {registrations.length > 0 && (
          <button 
            onClick={handlePrint}
            style={{
              padding: '0.6rem 1.2rem',
              background: '#0284c7',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🖨️ Print Passes
          </button>
        )}
      </div>

      {/* Alert banner */}
      {statusMessage.text && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          textAlign: 'center',
          fontWeight: '600',
          background: statusMessage.type === 'success' ? '#064e3b' : '#7f1d1d',
          color: statusMessage.type === 'success' ? '#6ee7b7' : '#fca5a5',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {statusMessage.text}
        </div>
      )}

      {registrations.length === 0 ? (
        <div style={{ textAlign: 'center', background: '#0f172a', padding: '3.5rem 1rem', borderRadius: '12px', border: '1px solid #1e293b' }}>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0 }}>You have not reserved tickets for any events yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {registrations.map((reg) => {
            const currentEvent = reg.event || {};
            const eventId = currentEvent._id || (typeof reg.event === 'string' ? reg.event : '');
            const formattedRegTime = formatDateTime(reg.createdAt);
            const formattedEventTime = formatDateTime(currentEvent.date);

            const qrDataPayload = JSON.stringify({
              pass: "VERIFIED_EVENT_PASS",
              ticketId: reg._id,
              event: currentEvent.title || "N/A",
              venue: currentEvent.venue || "N/A",
              eventDate: formattedEventTime,
              bookedAt: formattedRegTime
            }, null, 2);

            return (
              <div 
                key={reg._id} 
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}
              >
                {/* Left Ticket Info */}
                <div style={{ flex: '1 1 58%', padding: '1.5rem', borderRight: '2px dashed #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      ● CONFIRMED REGISTRATION
                    </span>
                    <a
                      href={getGoogleCalendarUrl(currentEvent)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.8rem',
                        color: '#38bdf8',
                        textDecoration: 'none',
                        background: '#1e293b',
                        padding: '0.35rem 0.7rem',
                        borderRadius: '4px',
                        border: '1px solid #334155',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      📅 Add to Calendar
                    </a>
                  </div>

                  <h3 style={{ fontSize: '1.35rem', margin: '0.75rem 0 0.5rem 0', color: '#f8fafc' }}>
                    {currentEvent.title || 'Untitled Event'}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                    {currentEvent.description || 'No description provided.'}
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem', fontSize: '0.875rem', color: '#cbd5e1' }}>
                    <p style={{ margin: 0 }}>📍 <strong>Venue:</strong> {currentEvent.venue || 'TBA'}</p>
                    <p style={{ margin: 0 }}>🗓️ <strong>Date:</strong> {formattedEventTime}</p>
                  </div>

                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid #1e293b', paddingTop: '1rem' }}>
                    <button
                      onClick={() => handleCancelRegistration(reg._id, eventId, currentEvent.title)}
                      style={{
                        background: 'transparent',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      ✕ Cancel Registration
                    </button>
                  </div>
                </div>

                {/* Right Ticket Stub with Real QR Code */}
                <div style={{
                  flex: '1 1 32%',
                  background: '#1e293b',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    TICKET ID
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#38bdf8', margin: '0.4rem 0 0.75rem 0', fontFamily: 'monospace' }}>
                    {reg._id.slice(-8).toUpperCase()}
                  </div>

                  <div style={{
                    background: '#ffffff',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
                  }}>
                    <QRCodeSVG 
                      value={qrDataPayload}
                      size={110}
                      level="M"
                    />
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem', lineHeight: '1.4' }}>
                    Registered on: <br />
                    <span style={{ color: '#cbd5e1', fontWeight: '600' }}>
                      {formattedRegTime}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}