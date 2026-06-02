import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoImg from "../assets/logo.jpg";

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Dynamic state for the admin name
  const [adminName, setAdminName] = useState("ADMIN");

  useEffect(() => {
    // Logic to retrieve the name from your system/localStorage
    const savedName = localStorage.getItem('userName') || "John Michael Santos"; 
    setAdminName(savedName);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/AdminDashboard', icon: '📊' },
    { name: 'Add Employee', path: '/AccountCreation', icon: '👤' },
    { name: 'Patient Records', path: '/PatientRecords', icon: '📋' },
    { name: 'Manage Services', path: '/ManageServices', icon: '🦷' },
    { name: 'Manage People', path: '/ManagePeople', icon: '💼' },
  ];

  return (
    <div className="admin-layout-root">
      
      {/* --- Fixed Header --- */}
      <header className="main-header">
        <div className="brand">
          <div className="logo-circle">
            <img src={logoImg} alt="Clinic Logo" />
          </div>
          <div className="clinic-title">
            C'SMILES
            <span>Admin Panel</span>
          </div>
        </div>
        <nav>
          <button onClick={handleLogout} className="logout-link">
            LOG OUT
          </button>
        </nav>
      </header>

      <div className="layout-body">
        {/* --- Fixed Sidebar --- */}
        <aside className="seamless-sidebar">
          <div className="user-section">
            {/* Displaying the dynamic name */}
            <div className="user-name" style={{ textTransform: 'uppercase' }}>
              {adminName}
            </div>
            <div className="avatar-circle">
              {adminName.charAt(0)}
            </div>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* --- Main Content --- */}
        <div className="main-content-area">
          <main className="content-card">
            {children}
          </main>
        </div>
      </div>

      <style>{`
        :root {
          --bg-gradient: linear-gradient(180deg, #b7e4d9 0%, #fefbe0 100%);
          --sidebar-bg: #e1f1ee;
          --text-gold: #c5a043;
          --sidebar-width: 280px;
          --header-height: 120px;
        }

        .admin-layout-root {
          margin: 0;
          font-family: 'Segoe UI', Tahoma, sans-serif;
          background: var(--bg-gradient);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          color: #333;
        }

        .main-header { 
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 60px;
          height: var(--header-height);
          position: fixed; 
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.2); 
          border-bottom: 1px solid rgba(255,255,255,0.2);
        }

        .brand { display: flex; align-items: center; gap: 20px; }
        .logo-circle { 
          height: 85px; width: 85px; border-radius: 50%; 
          background: white; display: flex; align-items: center; 
          justify-content: center; box-shadow: 0 4px 8px rgba(0,0,0,0.1); 
          overflow: hidden; border: 2px solid white; 
        }
        .logo-circle img { width: 100%; height: 100%; object-fit: contain; }
        .clinic-title { color: var(--text-gold); font-size: 2.4rem; font-weight: 800; line-height: 0.8; }
        .clinic-title span { display: block; font-size: 0.9rem; letter-spacing: 2px; text-transform: uppercase; border-top: 1px solid var(--text-gold); padding-top: 3px; margin-top: 5px; }
        .logout-link { background: none; border: none; color: var(--text-gold); font-weight: bold; font-size: 1.2rem; cursor: pointer; }

        .layout-body {
          display: flex;
          flex: 1;
          margin-top: var(--header-height);
        }

        .seamless-sidebar { 
          position: fixed;
          left: 0;
          top: calc(var(--header-height) + 30px); 
          background-color: var(--sidebar-bg);
          width: var(--sidebar-width);
          height: 500px;
          border-radius: 0 40px 40px 0;
          box-shadow: 5px 0 15px rgba(0, 0, 0, 0.05);
          z-index: 10;
          padding-top: 20px;
        }

        .user-section { display: flex; align-items: center; justify-content: space-between; padding: 0 25px 20px; border-bottom: 2px solid rgba(0, 0, 0, 0.08); margin-bottom: 20px; }
        .user-name { font-weight: 700; font-size: 1rem; color: #4a789c; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .avatar-circle { width: 45px; height: 45px; border-radius: 50%; background: #4a789c; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.4rem; font-weight: bold; }

        .nav-item { display: flex; align-items: center; padding: 18px 30px; gap: 15px; font-weight: 600; text-decoration: none; color: #555; transition: 0.3s; }
        .nav-item.active { background: rgba(255,255,255,0.4); font-weight: 800; color: #000; }
        .nav-item:hover { background: rgba(255, 255, 255, 0.2); }

        .main-content-area { 
          flex: 1; 
          display: flex; 
          justify-content: center; 
          margin-left: var(--sidebar-width); 
          padding: 40px; 
        }

        .content-card { 
          background: white; 
          width: 100%; 
          padding: 40px; 
          border-radius: 30px; 
          box-shadow: 0 15px 40px rgba(0,0,0,0.06); 
          min-height: calc(100vh - var(--header-height) - 80px);
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;