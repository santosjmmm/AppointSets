import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../components/StaffLayout";

const StaffDashboard = () => {
  const navigate = useNavigate();
  
  // Account classification state for runtime dashboard contextual headers
  const [userType, setUserType] = useState(() => localStorage.getItem("userType") || "staff");
  
  // Dashboard states
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [allAppointments, setAllAppointments] = useState([]); // Keeps track of full data log arrays
  const [loading, setLoading] = useState(true);
  
  // Tracks which log subset is actively viewed in the table matrix ("All", "Completed", "Incomplete")
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    const structuralType = localStorage.getItem("userType");
    if (structuralType) setUserType(structuralType);

    const fetchDashboardData = async () => {
      try {
        const res = await fetch("http://localhost/appointsets/Backend/api/dashboard_stats.php");
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          // Store historical records cache from updated backend field key name
          setAllAppointments(data.all_appointments || []);
        }
      } catch (err) {
        console.error("Failed to load operational analytics metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed": return "bg-[#e1f7e7] text-[#2ecc71]";
      case "Cancelled": return "bg-[#ffebee] text-[#e74c3c]";
      default: return "bg-[#fff4e5] text-[#f39c12]"; // Map standard Incomplete flags
    }
  };

  // Computes row visual array metrics strictly based on the filter card selected
  const displayedAppointments = allAppointments.filter((appointment) => {
    if (filterType === "All") return true;
    if (filterType === "Completed") return appointment.status === "Completed";
    if (filterType === "Incomplete") return appointment.status === "Incomplete";
    return true;
  });

  return (
    <StaffLayout>
      <main className="bg-white w-full max-w-[950px] p-8 md:p-12 rounded-[30px] shadow-xl align-self-start">
        {/* Dynamic Context Header greeting mapping */}
        <h1 className="text-3xl font-bold text-gray-800 capitalize mb-2">
          Welcome, {userType === "dentist" ? "Dentist" : "Staff"}!
        </h1>
        <div className="h-[1px] bg-gray-200 w-full mb-8"></div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-semibold text-lg">
            Aggregating platform status records...
          </div>
        ) : (
          <>
            {/* Analytics Counter Grid layout structure */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              
              {/* Total Appointments Metric */}
              <div 
                onClick={() => setFilterType("All")}
                className={`p-6 rounded-2xl flex items-center border shadow-sm cursor-pointer transform transition-all hover:-translate-y-1 ${
                  filterType === "All" ? "border-[#1cb9d0] bg-[#f0fbfd]" : "border-gray-100 bg-white"
                }`}
              >
                <div className="text-4xl mr-4">📅</div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Appointments</h3>
                  <p className="text-2xl font-extrabold text-gray-800 mt-1">{stats.total}</p>
                </div>
              </div>

              {/* Completed Metric Card */}
              <div 
                onClick={() => setFilterType("Completed")}
                className={`p-6 rounded-2xl flex items-center border shadow-sm cursor-pointer transform transition-all hover:-translate-y-1 ${
                  filterType === "Completed" ? "border-[#2ecc71] bg-[#f1fcf4]" : "border-gray-100 bg-white"
                }`}
              >
                <div className="text-4xl mr-4">✅</div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</h3>
                  <p className="text-2xl font-extrabold text-gray-800 mt-1">{stats.completed}</p>
                </div>
              </div>

              {/* Pending / Incomplete Metric Card */}
              <div 
                onClick={() => setFilterType("Incomplete")}
                className={`p-6 rounded-2xl flex items-center border shadow-sm cursor-pointer transform transition-all hover:-translate-y-1 ${
                  filterType === "Incomplete" ? "border-[#f39c12] bg-[#fffbf4]" : "border-gray-100 bg-white"
                }`}
              >
                <div className="text-4xl mr-4">⏳</div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</h3>
                  <p className="text-2xl font-extrabold text-gray-800 mt-1">{stats.pending}</p>
                </div>
              </div>
            </div>

            {/* Recent Log Table Card Layout */}
            <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[#c5a043] text-lg font-bold">
                  {filterType === "All" ? "Total" : filterType} Appointments Log
                </h2>
                {filterType !== "All" && (
                  <button 
                    onClick={() => setFilterType("All")}
                    className="text-xs font-bold text-gray-400 hover:text-gray-600 underline bg-transparent border-none cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500 font-semibold">
                      <th className="pb-3 pt-2">Patient/Client</th>
                      <th className="pb-3 pt-2">Date Scheduled</th>
                      <th className="pb-3 pt-2">Status</th>
                      <th className="pb-3 pt-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedAppointments.length > 0 ? (
                      displayedAppointments.map((row) => (
                        <tr key={row.appointment_id} className="border-b border-gray-100 text-gray-700 font-medium hover:bg-gray-50/40 transition-colors">
                          <td className="py-4 text-gray-900 font-bold">{row.patient_name}</td>
                          <td className="py-4 text-gray-500">{row.formatted_date}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${getStatusClass(row.status)}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="py-4">
                            <button
                              onClick={() => navigate(`/StaffPatientRecord?search=${encodeURIComponent(row.patient_name)}`)}
                              className="bg-[#1cb9d0] text-white py-1.5 px-4 rounded-xl text-xs font-bold shadow-sm hover:brightness-105 active:scale-[0.98] transition-all"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-gray-400 font-medium">
                          No {filterType.toLowerCase()} appointment logs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </StaffLayout>
  );
};

export default StaffDashboard;