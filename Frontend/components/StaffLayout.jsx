import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoImg from "../assets/logo.jpg";

const StaffLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
// Change your state initializers to read directly from localStorage immediately:
const [userName, setUserName] = useState(() => localStorage.getItem("userName") || "Loading...");
const [userType, setUserType] = useState(() => localStorage.getItem("userType") || "staff");

useEffect(() => {
  const storedName = localStorage.getItem("userName");
  const storedType = localStorage.getItem("userType");
  
  if (storedName) setUserName(storedName);
  if (storedType) setUserType(storedType);
}, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const menuItems = [
    { path: "/StaffDashboard", label: "Dashboard", icon: "💼" },
    { path: "/AppCalendar", label: "Appointments", icon: "📅" },
    { path: "/StaffPatientRecord", label: "Patient Records", icon: "📋" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans text-[#333] bg-gradient-to-b from-[#b7e4d9] to-[#fefbe0]">
      {/* Global Header */}
      <header className="flex justify-between items-center px-10 h-20 bg-transparent z-20 sticky top-0 backdrop-blur-sm">
        <div className="flex items-center gap-[15px]">
          <div className="h-[85px] w-[85px] rounded-full bg-white flex items-center justify-center shadow-md overflow-hidden border-2 border-white">
            <img src={logoImg} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="text-[#c5a043] text-[2.6rem] font-bold uppercase leading-[0.8]">
            c'smiles
            <span className="block text-[1rem] tracking-[2px] capitalize border-t border-[#c5a043] pt-0.5 mt-0.5">
              Dental Center
            </span>
          </div>
        </div>
        <nav className="flex gap-[25px]">
          <Link to="/StaffDashboard" className="text-[#c5a043] font-bold text-[1.2rem] hover:opacity-80 transition-opacity">
            Home
          </Link>
          <Link to="/StaffService" className="text-[#c5a043] font-bold text-[1.2rem] hover:opacity-80 transition-opacity">
            Services
          </Link>
          <button onClick={handleLogout} className="text-[#c5a043] font-bold text-[1.2rem] hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer">
            Log out
          </button>
        </nav>
      </header>

      <div className="flex flex-1 relative">
        {/* Fixed Rounded Sidebar */}
        <aside className="fixed left-0 top-[110px] w-[280px] h-[calc(100vh-110px)] bg-[#e1f1ee] rounded-r-[40px] shadow-sm z-10 pt-2.5 px-4">
          <div className="flex items-center justify-between px-4 pb-5 border-b-2 border-black/10 mb-5">
            <div className="flex flex-col truncate max-w-[200px]">
              <span className="font-bold text-[1.1rem] text-[#c5a043] truncate">{userName}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{userType}</span>
            </div>
            <span className="text-[1.6rem]">👤</span>
          </div>

          <nav>
            <ul className="space-y-1 p-0 m-0 list-none">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-[15px] py-3 text-[14px] font-semibold rounded-[12px] transition-all duration-300 no-underline ${
                        isActive
                          ? "bg-white text-black shadow-md"
                          : "text-[#555] hover:bg-white/50"
                      }`}
                    >
                      <span className="text-[16px]">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Workspace Display Area */}
        <div className="flex-1 ml-[280px] p-10 flex justify-center items-start">
          {children}
        </div>
      </div>
    </div>
  );
};

export default StaffLayout;