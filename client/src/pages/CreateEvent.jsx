import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    capacity: 50,
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/events', formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1.5rem', background: '#1e293b', borderRadius: '8px', color: '#fff' }}>
      <h2 style={{ marginBottom: '1rem' }}>Create New Event</h2>
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Event Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Description</label>
          <textarea
            required
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Date & Time</label>
          <input
            type="datetime-local"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Venue / Meeting Link</label>
          <input
            type="text"
            required
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Capacity</label>
          <input
            type="number"
            min="1"
            required
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
          />
        </div>
        <button
          type="submit"
          style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Publish Event
        </button>
      </form>
    </div>
  );
}