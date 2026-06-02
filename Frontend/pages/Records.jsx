import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout';

const Records = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    // Time Formatter (12-hour format)
    const formatTime = (timeString) => {
        if (!timeString) return "";
        const parts = timeString.split(':');
        let hour = parseInt(parts[0], 10);
        const minutes = parts[1];
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        return `${hour}:${minutes} ${ampm}`;
    };

    // Date Formatter
    const formatDate = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString(undefined, { 
            year: 'numeric', month: 'long', day: 'numeric' 
        });
    };

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        const patientId = localStorage.getItem("patient_id");
        try {
            const response = await fetch(`http://localhost/appointsets/Backend/api/get_records.php?patient_id=${patientId}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setRecords(data);
            }
        } catch (error) {
            console.error("Error fetching records:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

   const handleRebook = () => {
    if (!selectedRecord) return;
    
    // Encode strings to handle spaces and special characters safely
    const service = encodeURIComponent(selectedRecord.service_name);
    const dentist = encodeURIComponent(selectedRecord.dentist_name);
    
    // Navigate to step 2 with the data in the URL
    navigate(`/step2?rebook=true&service=${service}&dentist=${dentist}`);
};

    return (
        <Layout>
            <main className="max-w-5xl mx-auto p-6 bg-white rounded-[30px] shadow-sm border border-gray-100 relative">
                <header className="mb-8">
                    <h1 className="text-4xl font-black text-gray-800">Records</h1>
                    <p className="text-gray-500 font-bold mt-2">Your completed dental history</p>
                    <div className="h-1 w-20 bg-[#1cb9d0] mt-4 rounded-full"></div>
                </header>

                {loading ? (
                    <div className="py-20 text-center font-bold text-[#1cb9d0]">Loading records...</div>
                ) : records.length > 0 ? (
                    <div className="grid gap-4">
                        {records.map((record, index) => (
                            <div key={index} className="flex justify-between items-center p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#1cb9d0] transition-all group">
                                <div>
                                    <h3 className="text-xl font-black text-gray-800">{record.dentist_name}</h3>
                                    <p className="text-[#1cb9d0] font-bold">{record.service_name}</p>
                                    <p className="text-gray-500 text-sm font-medium">{formatDate(record.date)}</p>
                                </div>
                                <button 
                                    onClick={() => { setSelectedRecord(record); setIsModalOpen(true); }}
                                    className="bg-white text-gray-700 px-6 py-3 rounded-xl font-black shadow-sm border border-[#a3e635]-200 group-hover:bg-[#a3e635] group-hover:text-white group-hover:border-[#a3e635] transition-all"
                                >
                                    See details
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <p className="text-gray-400 text-xl font-bold">No completed medical records found yet.</p>
                    </div>
                )}
            </main>

            {/* DETAILS MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[1000] p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-black mb-6 text-gray-800">Record Details</h2>
                        <div className="space-y-4 mb-8 text-lg">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-700 font-bold">Dentist</span>
                                <span className="font-black text-gray-800">{selectedRecord?.dentist_name}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-700 font-bold">Service</span>
                                <span className="font-black text-gray-800">{selectedRecord?.service_name}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-700 font-bold">Completed</span>
                                <span className="font-black text-gray-800">{formatDate(selectedRecord?.date)}</span>
                            </div>
                            <div className="border-b pb-2">
                                <span className="text-gray-700 font-bold block mb-1">Remarks</span>
                                <p className="text-gray-600 italic text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {selectedRecord?.notes || "No specific remarks provided."}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={handleRebook} className="bg-[#1cb9d0] text-white flex-1 py-4 rounded-2xl font-black shadow-lg shadow-cyan-100 hover:brightness-105 transition-all">Rebook</button>
                            <button onClick={() => setIsModalOpen(false)} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex-1 py-4 rounded-2xl font-black transition-all">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Records;