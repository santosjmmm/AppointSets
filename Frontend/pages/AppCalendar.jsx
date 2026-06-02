import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StaffLayout from "../components/StaffLayout";

const AppCalendar = () => {
  const navigate = useNavigate();
  const today = new Date();

  // State Management
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [appointments, setAppointments] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [modalStatus, setModalStatus] = useState("Incomplete");
  // ✅ NEW: State to track input notes text area mapping
  const [appointmentNotes, setAppointmentNotes] = useState("");

  // Fetch target month logs
  const fetchAppointments = async (month, year) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost/appointsets/Backend/api/calendar.php?month=${month}&year=${year}`);
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments || {});
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(currentMonth, currentYear);
  }, [currentMonth, currentYear]);

  // Pagination Mechanics
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Status submission processing
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedApt) return;

    try {
      const res = await fetch("http://localhost/appointsets/Backend/api/calendar.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_id: selectedApt.appointment_id,
          status: modalStatus,
          notes: appointmentNotes, // ✅ MODIFIED: Notes included in transaction payload parameters
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedApt(null);
        setAppointmentNotes(""); // Clear state cache context upon successful submission
        fetchAppointments(currentMonth, currentYear); // Refresh data map grid
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const getMonthDetails = (month, year) => {
    const firstDayIndex = new Date(year, month - 1, 1).getDay();
    const totalDays = new Date(year, month, 0).getDate();
    const monthName = new Date(year, month - 1, 1).toLocaleString("en-US", { month: "long" }).toUpperCase();
    return { firstDayIndex, totalDays, monthName };
  };

  const { firstDayIndex, totalDays, monthName } = getMonthDetails(currentMonth, currentYear);

  // Generate matrix array slots matching a standard calendar layout grid map
  const gridCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    gridCells.push({ type: "empty" });
  }
  for (let day = 1; day <= totalDays; day++) {
    gridCells.push({ type: "day", dayNum: day });
  }

  // Group items row-by-row into sequences of 7 elements
  const rows = [];
  let currentRow = [];
  gridCells.forEach((cell, idx) => {
    currentRow.push(cell);
    if (currentRow.length === 7 || idx === gridCells.length - 1) {
      while (currentRow.length < 7) currentRow.push({ type: "empty" });
      rows.push(currentRow);
      currentRow = [];
    }
  });

  const getStatusStyles = (status) => {
    switch (status) {
      case "Completed": return "bg-[#e1f7e7] border-l-[#2ecc71] text-[#1b5e20]";
      case "Cancelled": return "bg-[#ffebee] border-l-[#e74c3c] text-[#b71c1c]";
      default: return "bg-[#fff4e5] border-l-[#f39c12] text-[#856404]";
    }
  };

  return (
    <StaffLayout>
      <main className="bg-white w-full max-w-[950px] p-8 md:p-12 rounded-[30px] shadow-xl align-self-start">
        {/* Navigation Banner Header */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={handlePrevMonth} className="text-[#1cb9d0] font-bold hover:opacity-80 transition-opacity">
            ◀ Prev Month
          </button>
          <h2 className="text-2xl font-bold text-[#333] tracking-wide">
            {monthName} {currentYear}
          </h2>
          <button onClick={handleNextMonth} className="text-[#1cb9d0] font-bold hover:opacity-80 transition-opacity">
            Next Month ▶
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 font-semibold text-gray-400 text-lg">Loading schedule logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed min-w-[600px]">
              <thead>
                <tr className="bg-gray-50">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <th key={day} className="text-[#c5a043] p-3 border border-gray-100 font-semibold text-sm">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="h-28 border border-gray-100 p-1.5 vertical-top align-top">
                        {cell.type === "day" && (
                          <div className="flex flex-col h-full">
                            <span className="text-gray-300 font-bold text-xs mb-1 block">{cell.dayNum}</span>
                            <div className="flex-1 overflow-y-auto space-y-1 max-h-[80px] custom-scrollbar">
                              {appointments[cell.dayNum]?.map((apt) => (
                                <div
                                  key={apt.appointment_id}
                                  onClick={() => {
                                    setSelectedApt(apt);
                                    setModalStatus(apt.status);
                                    // Populate textarea with historical notes data string if available
                                    setAppointmentNotes(apt.notes || "");
                                  }}
                                  className={`p-1.5 rounded-md text-[10px] leading-tight cursor-pointer font-medium border-l-4 transition-transform hover:scale-[1.02] truncate shadow-sm ${getStatusStyles(apt.status)}`}
                                >
                                  <strong className="block truncate">{apt.patient_name}</strong>
                                  <span>{apt.formatted_time}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal Overlay Viewport Context */}
      {selectedApt && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 rounded-[25px] w-full max-w-[380px] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-[#c5a043] text-xl font-bold mb-4 truncate">{selectedApt.patient_name}</h3>
            
            <div className="bg-gray-50 p-4 rounded-2xl mb-4 border-l-4 border-[#c5a043] text-sm text-gray-600 space-y-1">
              <p><strong>Service:</strong> {selectedApt.service_name}</p>
              <p><strong>Doctor:</strong> {selectedApt.dentist_name}</p>
              <p><strong>Time:</strong> {selectedApt.formatted_time}</p>
            </div>

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Appointment Status</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:ring-2 focus:ring-[#1cb9d0]"
                >
                  <option value="Incomplete">Incomplete</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* ✅ NEW: Appointment Notes Input Container Section Layer */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Clinical / Operational Notes</label>
                <textarea
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  placeholder="Enter medical remarks, procedure updates, or reason for cancellation here..."
                  rows="3"
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:ring-2 focus:ring-[#1cb9d0] placeholder:text-gray-300"
                />
              </div>

              <button type="submit" className="w-full bg-[#1cb9d0] text-white py-3 rounded-xl font-bold hover:brightness-105 active:scale-[0.99] transition-all shadow-md">
                Update Status & Save Notes
              </button>
            </form>

            <button
              onClick={() => navigate(`/StaffPatientRecord?search=${encodeURIComponent(selectedApt.patient_name)}`)}
              className="block text-center w-full mt-4 text-[#1cb9d0] font-bold text-xs hover:underline"
            >
              View Full Patient Profile ➜
            </button>

            <button
              onClick={() => {
                setSelectedApt(null);
                setAppointmentNotes("");
              }}
              className="w-full text-center text-gray-400 font-semibold text-xs mt-4 hover:text-gray-600 transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </StaffLayout>
  );
};

export default AppCalendar;