import React, { useEffect, useState, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

export default function EventsList() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const fetchEvents = async () => {
    try {
      const res = await API.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (eventId) => {
    if (!user) {
      setMessage({ text: 'Please sign in or register to reserve your ticket.', type: 'warn' });
      return;
    }
    try {
      const res = await API.post(`/events/${eventId}/register`);
      setMessage({ text: '🎉 Registration confirmed! View your pass in My Registrations.', type: 'success' });
      fetchEvents();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Registration failed', type: 'error' });
    }
  };

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.venue.toLowerCase().includes(search.toLowerCase()) ||
    e.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span style={{ 
          background: 'rgba(56, 189, 248, 0.1)', 
          color: '#38bdf8', 
          padding: '0.4rem 1rem', 
          borderRadius: '9999px', 
          fontSize: '0.85rem', 
          fontWeight: '600',
          border: '1px solid rgba(56, 189, 248, 0.2)'
        }}>
          ⚡ Live Tech Conferences & Hackathons
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f8fafc', marginTop: '1rem', marginBottom: '0.5rem' }}>
          Discover Industry-Leading Tech Events
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto 2rem auto' }}>
          Reserve seats for high-impact developer workshops, AI summits, and open-source hackathons.
        </p>

        {/* Dynamic Search Box */}
        <div style={{ maxWidth: '550px', margin: '0 auto', position: 'relative' }}>
          <input
            type="text"
            placeholder="🔍 Search events by topic, technology, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.9rem 1.25rem',
              borderRadius: '10px',
              border: '1px solid #334155',
              background: '#0f172a',
              color: '#f8fafc',
              fontSize: '1rem',
              outline: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          />
        </div>
      </div>

      {/* Notifications */}
      {message.text && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          textAlign: 'center',
          fontWeight: '600',
          background: message.type === 'success' ? '#064e3b' : message.type === 'warn' ? '#78350f' : '#7f1d1d',
          color: message.type === 'success' ? '#6ee7b7' : message.type === 'warn' ? '#fde68a' : '#fca5a5',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {message.text}
        </div>
      )}

      {/* Events Grid */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8' }}>Loading verified events...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.75rem' }}>
          {filteredEvents.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>
              No matching events found. Try a different search term.
            </div>
          ) : (
            filteredEvents.map((event) => {
              const seatsLeft = event.capacity - event.attendeeCount;
              const isFull = seatsLeft <= 0;
              const fillPct = Math.min(100, Math.round((event.attendeeCount / event.capacity) * 100));

              return (
                <div key={event._id} style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '14px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        fontWeight: '700',
                        color: '#38bdf8',
                        background: '#1e293b',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px'
                      }}>
                        Featured
                      </span>
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        color: isFull ? '#ef4444' : seatsLeft <= 5 ? '#f59e0b' : '#10b981'
                      }}>
                        {isFull ? 'Sold Out' : `${seatsLeft} seats left`}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', color: '#f8fafc', margin: '0 0 0.5rem 0', lineHeight: '1.4' }}>
                      {event.title}
                    </h3>

                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', minHeight: '60px' }}>
                      {event.description}
                    </p>

                    <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1rem', marginTop: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      <p style={{ margin: '0.35rem 0' }}>📍 <strong>Venue:</strong> {event.venue}</p>
                      <p style={{ margin: '0.35rem 0' }}>🗓️ <strong>Date:</strong> {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>

                    {/* Live Progress Bar */}
                    <div style={{ marginTop: '1.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.3rem' }}>
                        <span>Capacity ({event.attendeeCount} / {event.capacity})</span>
                        <span>{fillPct}% Filled</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${fillPct}%`,
                          height: '100%',
                          background: isFull ? '#ef4444' : fillPct > 80 ? '#f59e0b' : '#38bdf8',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isFull}
                    onClick={() => handleRegister(event._id)}
                    style={{
                      marginTop: '1.5rem',
                      width: '100%',
                      padding: '0.8rem',
                      background: isFull ? '#1e293b' : '#2563eb',
                      color: isFull ? '#64748b' : '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '0.95rem',
                      cursor: isFull ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isFull ? 'Capacity Reached' : 'Reserve Ticket (Free)'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}