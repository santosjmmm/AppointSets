import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout';

const Step3 = () => {
  const navigate = useNavigate();
  const [appointmentData, setAppointmentData] = useState({
    service: '', dentist: '', date: '', time: ''
  });

  // Start with empty state instead of mock data
  const [patient, setPatient] = useState({
    name: '', age: '', address: '', contact_num: '', email: ''
  });

  useEffect(() => {
    // 1. Retrieve IDs and Appointment data from LocalStorage
    const patientId = localStorage.getItem("patient_id");
    const service = localStorage.getItem("selectedService");
    const dentist = localStorage.getItem("selectedDentist");
    const date = localStorage.getItem("selectedDate");
    const time = localStorage.getItem("selectedTime");

    if (!service || !date || !patientId) {
      navigate("/BookAppointment");
      return;
    }

    // 2. Fetch Patient Data from Database
    fetch(`http://localhost/appointsets/Backend/api/get_profile.php?patient_id=${patientId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setPatient(data);
        }
      })
      .catch(err => console.error("Error fetching profile:", err));

    // 3. Set Appointment Summary
    setAppointmentData({
      service,
      dentist,
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      time
    });
  }, [navigate]);

  // Generic handler for handling patient information changes
  const handleInputChange = (key, value) => {
    setPatient(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNext = () => {
    // Optional: You can save the updated patient details back to localStorage 
    // or send a POST request to your backend here before navigating to Step 4
    localStorage.setItem("updatedPatient", JSON.stringify(patient));
    navigate("/Step4");
  };

  // Fields configuration array
  const fields = [
    { label: 'Name', value: patient.name, isEditable: true, key: 'name' },
    { label: 'Age', value: patient.age, isEditable: true, key: 'age' },
    { label: 'Address', value: patient.address, isEditable: true, key: 'address' },
    { label: 'Contact No', value: patient.contact_num, isEditable: true, key: 'contact_num' },
    { label: 'Email', value: patient.email, isEditable: true, key: 'email' },
    { label: 'Service', value: appointmentData.service, isEditable: false },
    { label: 'Dentist', value: appointmentData.dentist, isEditable: false },
    { label: 'Date', value: appointmentData.date, isEditable: false },
    { label: 'Time', value: appointmentData.time, isEditable: false },
  ];

  return (
    <Layout>
      <main>
        {/* Stepper Head */}
        <div className="flex justify-between items-center pb-4 border-b-4 border-gray-100 gap-5 mb-10 overflow-hidden">
          <span className="text-[#c5a043] font-extrabold text-lg opacity-30">Select Service</span>
          <span className="text-[#c5a043] font-extrabold text-lg opacity-30">Set date and time</span>
          <span className="text-[#c5a043] font-extrabold text-lg border-b-2 border-[#c5a043]">Confirm your details</span>
          <span className="text-[#c5a043] font-extrabold text-lg opacity-30">Done</span>
        </div>

        <div className="max-w-2xl mx-auto bg-white p-8 rounded-[30px] shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field, index) => (
              <div key={index} className="flex flex-col">
                <label className="text-gray-500 font-bold mb-1 ml-2">{field.label}:</label>
                <input 
                  type="text" 
                  value={field.value || ''} 
                  readOnly={!field.isEditable} 
                  onChange={(e) => field.isEditable && handleInputChange(field.key, e.target.value)}
                  className={`border-none rounded-full py-3 px-6 font-bold outline-none transition-all ${
                    field.isEditable 
                      ? "bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#1cb9d0] text-gray-800" 
                      : "bg-[#fdf2f2] text-gray-500 cursor-not-allowed"
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-10">
            <button onClick={() => navigate("/Step2")} className="bg-[#1cb9d0] text-white px-16 py-4 rounded-full font-bold text-xl shadow-lg hover:brightness-110 active:scale-95 transition-all">Prev</button>
            <button onClick={handleNext} className="bg-[#1cb9d0] text-white px-16 py-4 rounded-full font-bold text-xl shadow-lg hover:brightness-110 active:scale-95 transition-all">Next</button>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Step3;