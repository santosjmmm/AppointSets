import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import StaffLayout from "../components/StaffLayout";

const StaffPatientRecord = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State hooks
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [patientsList, setPatientsList] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync state with incoming deep link calendar navigation references
  const initialSearch = searchParams.get("search");

  // Fetch the primary listing registry
  const fetchPatients = async (query = "") => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost/appointsets/Backend/api/patient_records.php?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setPatientsList(data.patients || []);
        setSelectedPatient(null); // Clear selected if viewing entire list context
      }
    } catch (err) {
      console.error("Error connecting to patient registry API:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific historic treatment cards
  const fetchPatientProfile = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost/appointsets/Backend/api/patient_records.php?patient_id=${id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedPatient(data.profile);
        setTreatmentHistory(data.history || []);
      }
    } catch (err) {
      console.error("Error retrieving historical profile logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger search indexing behaviors
  useEffect(() => {
    if (initialSearch) {
      fetchPatients(initialSearch);
    } else {
      fetchPatients("");
    }
  }, [initialSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ search: searchQuery });
    fetchPatients(searchQuery);
  };

  const handleClearView = () => {
    setSearchQuery("");
    setSearchParams({});
    fetchPatients("");
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Completed": return "bg-[#e1f7e7] text-[#2ecc71]";
      case "Cancelled": return "bg-[#ffebee] text-[#e74c3c]";
      default: return "bg-[#fff4e5] text-[#f39c12]";
    }
  };

  return (
    <StaffLayout>
      <main className="bg-white w-full max-w-[950px] p-8 md:p-12 rounded-[30px] shadow-xl align-self-start">
        
        {/* VIEW MODE A: SINGLE PATIENT DETAILED FILE VIEW */}
        {selectedPatient ? (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Patient Profile</h1>
            <div className="h-[1px] bg-gray-200 w-full mb-6"></div>

            {/* Profile Info Summary Card */}
            <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl mb-8 shadow-sm border-l-4 border-[#c5a043]">
              <h2 className="text-[#c5a043] text-xl font-bold mb-3">{selectedPatient.name}</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Email Address:</strong> {selectedPatient.email}</p>
                <p><strong>Contact Info Line:</strong> {selectedPatient.contact_num}</p>
              </div>
            </div>

            {/* Historical Table Log Tracker Grid */}
            <h2 className="text-lg font-bold text-gray-700 mb-4">Treatment History</h2>
            {loading ? (
              <div className="text-center py-10 text-gray-400 font-semibold">Pulling medical history file...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b-2 border-gray-100 bg-gray-50 text-gray-600 font-semibold text-sm">
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Booked Service</th>
                      <th className="p-3">Assigned Dentist</th>
                      <th className="p-3">Status</th>
                      {/* ✅ NEW: Table Header Segment */}
                      <th className="p-3 max-w-[200px]">Notes / Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treatmentHistory.length > 0 ? (
                      treatmentHistory.map((log, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors text-sm text-gray-700">
                          <td className="p-3">
                            <strong className="text-gray-900 block">{log.formatted_date}</strong>
                            <span className="text-xs text-gray-400">{log.formatted_time}</span>
                          </td>
                          <td className="p-3">{log.service_name}</td>
                          <td className="p-3">{log.dentist_name}</td>
                          <td className="p-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${getStatusBadgeClass(log.status)}`}>
                              {log.status}
                            </span>
                          </td>
                          {/* ✅ NEW: Notes Data Column with fallback visualization logic */}
                          <td className="p-3 max-w-[200px] break-words text-xs text-gray-500 font-normal">
                            {log.notes && log.notes.trim() !== "" ? (
                              log.notes
                            ) : (
                              <span className="italic text-gray-300">No notes recorded</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        {/* ✅ MODIFIED: Shifted colSpan parameters count up from 4 to 5 to avoid table alignment breaks */}
                        <td colSpan="5" className="text-center p-8 text-gray-400 font-medium">
                          No previous treatment history logs available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <button onClick={handleClearView} className="mt-8 text-[#1cb9d0] font-bold text-sm hover:underline flex items-center gap-1">
              &larr; Back to Patient Index
            </button>
          </div>
        ) : (
          
          /* VIEW MODE B: COMPREHENSIVE REGISTRY REGISTRATION SEARCH ARCHIVE */
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Search Patient Records</h1>
            <div className="h-[1px] bg-gray-200 w-full mb-6"></div>

            {/* Live Parameter Submission Input form bar */}
            <form onSubmit={handleSearchSubmit} className="mb-6">
              <input
                type="text"
                className="w-full p-4 rounded-xl border border-gray-200 text-base outline-none transition-all shadow-sm focus:ring-2 focus:ring-[#1cb9d0]"
                placeholder="Search by patient name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {loading ? (
              <div className="text-center py-12 text-gray-400 font-semibold">Scanning file entries...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b-2 border-gray-100 bg-gray-50 text-gray-600 font-semibold text-sm">
                      <th className="p-4">Patient Name</th>
                      <th className="p-4">Email Contact</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientsList.length > 0 ? (
                      patientsList.map((patient) => (
                        <tr key={patient.patient_id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors text-sm text-gray-700">
                          <td className="p-4 font-bold text-gray-900">{patient.name}</td>
                          <td className="p-4 text-gray-500">{patient.email}</td>
                          <td className="p-4">
                            <button
                              onClick={() => fetchPatientProfile(patient.patient_id)}
                              className="text-[#1cb9d0] font-bold hover:underline bg-transparent border-none cursor-pointer text-sm"
                            >
                              View Treatment History
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center p-8 text-gray-400 font-medium">
                          No records found matching that criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </StaffLayout>
  );
};

export default StaffPatientRecord;