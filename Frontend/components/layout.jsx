import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // ✅ Imported useLocation and Link
import '../styles/layout.css';
import logoImg from '../assets/logo.jpg'; 

const Layout = ({ children }) => {
  const location = useLocation(); // ✅ Hook to track current URL pathing matches
  const [displayName, setDisplayName] = useState('Guest');

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setDisplayName(storedName);
    }
  }, []);

  // ✅ Array definition matching AdminLayout navigation mechanics
  const navItems = [
    { name: 'Book Appointment', path: '/BookAppointment', icon: '📋' },
    { name: 'Appointments', path: '/appointments', icon: '📅' },
    { name: 'Records', path: '/records', icon: '📂' },
    { name: 'Reward Points', path: '/rewards', icon: '🪙' },
  ];

  return (
    <div className="page-wrapper">
      <header>
        <div className="brand">
          <div className="logo-circle">
            <img src={logoImg} alt="C'Smiles Logo" />
          </div>
          <div className="clinic-title">C'Smiles<span>Dental Center</span></div>
        </div>
        <nav>
          <a href="/BookAppointment">Home</a>
          <a href="/Services">Services</a>
          <a href="Contact">Contact</a>
          <a href="/login" onClick={() => localStorage.clear()} className="logout-link">Log out</a>
        </nav>
      </header>

      <aside>
        <div className="user-section">
          <div className="user-name">{displayName}</div>
          <div className="avatar-circle">
            {/* Dynamic avatar letter fallback matching AdminLayout logic */}
            {displayName ? displayName.charAt(0).toUpperCase() : '👤'}
          </div>
        </div>
        
        {/* ✅ Dynamic Sidebar Mapping with active state checks */}
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span>{item.icon}</span> {item.name}
          </Link>
        ))}
      </aside>

      <div className="main-content-area">
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Layout;