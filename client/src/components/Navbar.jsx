import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Dropdown ke bahar kahin bhi click karne par dropdown close ho jaye
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem 2rem',
      background: '#0f172a',
      color: '#ffffff',
      borderBottom: '1px solid #1e293b'
    }}>
      <Link to="/" style={{ color: '#38bdf8', fontSize: '1.25rem', fontWeight: 'bold', textDecoration: 'none' }}>
        EventRegistration
      </Link>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#f1f5f9', textDecoration: 'none' }}>Events</Link>
        
        {user ? (
          <>
            <Link to="/my-registrations" style={{ color: '#f1f5f9', textDecoration: 'none' }}>
              My Registrations
            </Link>
            
            {(user.role === 'organizer' || user.role === 'admin') && (
              <Link to="/create-event" style={{ color: '#38bdf8', fontWeight: 'bold', textDecoration: 'none' }}>
                + Create Event
              </Link>
            )}

            {/* User Profile Dropdown Button */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: '#1e293b',
                  color: '#38bdf8',
                  border: '1px solid #334155',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}
              >
                <span>👤 {user.name}</span>
                <span style={{ 
                  fontSize: '0.7rem', 
                  transition: 'transform 0.2s ease',
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' 
                }}>
                  ▼
                </span>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.45)',
                  minWidth: '160px',
                  zIndex: 1000,
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    padding: '0.65rem 1rem', 
                    borderBottom: '1px solid #1e293b', 
                    fontSize: '0.75rem', 
                    color: '#94a3b8' 
                  }}>
                    Role: <strong style={{ color: '#38bdf8', textTransform: 'capitalize' }}>{user.role || 'user'}</strong>
                  </div>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.65rem 1rem',
                      background: 'transparent',
                      color: '#f87171',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#1e293b'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#f1f5f9', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: '#f1f5f9', textDecoration: 'none' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}