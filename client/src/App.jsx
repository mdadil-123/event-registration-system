import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import EventsList from './pages/EventsList';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateEvent from './pages/CreateEvent';
import MyRegistrations from './pages/MyRegistrations';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', background: '#0b1120', color: '#f8fafc' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<EventsList />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/my-registrations" element={<MyRegistrations />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}