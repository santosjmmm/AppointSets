import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const PatientRecords = () => {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Fetch patients on initial load
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async (query = '') => {
    setLoading(true);
    try {
      // FIXED: Removed extra single quotes inside the backticks
      const response = await axios.get(`http://localhost/appointsets/Backend/api/get_patientRecords.php?search=${query}`);
      
      // Ensure we are setting an array even if the response is empty
      setPatients(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients(searchQuery);
  };

  return (
    <AdminLayout>
      <div className="records-container">
        {!selectedPatient ? (
          /* LIST VIEW */
          <div className="list-view fade-in">
            <div className="records-top">
              <h2>Patient Records</h2>
              <form className="search-box" onSubmit={handleSearch}>
                <input 
                  type="text" 
                  placeholder="Search name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">Search</button>
              </form>
            </div>

            <div className="record-list">
              {loading ? (
                <p className="status-text">Loading records...</p>
              ) : patients.length > 0 ? (
                patients.map((patient) => (
                  <div key={patient.patient_id} className="record-item">
                    <div className="patient-info">
                      <span className="p-name">{patient.name}</span>
                      <span className="p-age">{patient.age} Years Old</span>
                    </div>
                    <button 
                      className="see-more-btn" 
                      onClick={() => setSelectedPatient(patient)}
                    >
                      See More Details
                    </button>
                  </div>
                ))
              ) : (
                <p className="status-text">No patient records found.</p>
              )}
            </div>
          </div>
        ) : (
          /* DETAILS VIEW */
          <div className="details-view fade-in">
            <button className="back-btn" onClick={() => setSelectedPatient(null)}>
              ⬅ Back to List
            </button>
            <div className="details-card">
              <h2 className="det-header">Patient Profile</h2>
              <div className="details-grid">
                <div className="det-row"><strong>Name:</strong> <span>{selectedPatient.name}</span></div>
                <div className="det-row"><strong>Age:</strong> <span>{selectedPatient.age} Years Old</span></div>
                <div className="det-row"><strong>Address:</strong> <span>{selectedPatient.address}</span></div>
                <div className="det-row"><strong>Contact No:</strong> <span>{selectedPatient.contact_num}</span></div>
                <div className="det-row"><strong>Email:</strong> <span>{selectedPatient.email}</span></div>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .records-container { width: 100%; max-width: 950px; margin: 0 auto; }
          .fade-in { animation: fadeIn 0.3s ease-in-out; }
          .records-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
          .records-top h2 { font-size: 2.2rem; color: #c5a043; font-weight: 800; }
          .search-box { display: flex; gap: 10px; }
          .search-box input { padding: 12px 18px; border: 1px solid #e0e0e0; border-radius: 10px; width: 250px; background: #fafafa; transition: 0.3s; }
          .search-box input:focus { outline: none; border-color: #c5a043; background: white; box-shadow: 0 0 0 4px rgba(197, 160, 67, 0.1); }
          .search-box button { padding: 10px 25px; background: #1cb9d0; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 700; transition: 0.3s; }
          .record-list { display: flex; flex-direction: column; gap: 15px; }
          .record-item { display: flex; justify-content: space-between; align-items: center; background: #fdfdfd; padding: 20px 30px; border-radius: 15px; border-left: 6px solid #1cb9d0; box-shadow: 0 4px 15px rgba(0,0,0,0.03); transition: 0.3s; }
          .patient-info { display: flex; gap: 40px; flex: 1; }
          .p-name { width: 250px; font-weight: 700; color: #2c3e50; font-size: 1.1rem; }
          .p-age { color: #7f8c8d; font-weight: 600; }
          .see-more-btn { background: #f1f2f6; color: #4a789c; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 700; transition: 0.3s; }
          .back-btn { background: none; border: none; color: #7f8c8d; font-weight: 700; cursor: pointer; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
          .details-card { background: #f9fbfb; padding: 40px; border-radius: 20px; border: 1px solid #e1f1ee; }
          .det-header { color: #c5a043; margin-bottom: 25px; border-bottom: 2px solid #e1f1ee; padding-bottom: 15px; font-size: 1.8rem; }
          .det-row { display: grid; grid-template-columns: 150px 1fr; font-size: 1.1rem; margin-bottom: 10px; }
          .det-row strong { color: #4a789c; }
          .status-text { text-align: center; color: #888; padding: 40px; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    </AdminLayout>
  );
};

export default PatientRecords;