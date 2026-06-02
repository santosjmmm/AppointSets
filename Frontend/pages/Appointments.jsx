import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout';

// Modal component defined outside to prevent focus loss and typing issues
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[1000] p-4" onClick={onClose}>
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

const Appointments = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState({});
    const [selectedApt, setSelectedApt] = useState(null);
    const [modalState, setModalState] = useState({ details: false, confirm: false });
    const [cancelReason, setCancelReason] = useState("");
    const [loading, setLoading] = useState(true);

    // Robust Time Formatter (Fixes the PM issue)
    const formatTime = (timeString) => {
        if (!timeString) return "";
        const parts = timeString.split(':');
        let hour = parseInt(parts[0], 10);
        const minutes = parts[1];
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12;
        return `${hour}:${minutes} ${ampm}`;
    };

    // Date Formatter for the Modal
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const patientId = localStorage.getItem("patient_id");

        try {
            const response = await fetch(`http://localhost/appointsets/Backend/api/get_appointments.php?patient_id=${patientId}&month=${month}&year=${year}`);
            const data = await response.json();
            
            const organized = {};
            if (Array.isArray(data)) {
                data.forEach(apt => {
                    const day = parseInt(apt.date.split('-')[2], 10);
                    if (!organized[day]) organized[day] = [];
                    organized[day].push(apt);
                });
            }
            setAppointments(organized);
        } catch (error) {
            console.error("Error fetching appointments:", error);
        } finally {
            setLoading(false);
        }
    }, [currentDate]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleCancelSubmit = async () => {
        if (!selectedApt) return;
        
        try {
            const response = await fetch("http://localhost/appointsets/Backend/api/cancel_appointment.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    appointment_id: selectedApt.appointment_id,
                    reason: cancelReason,
                    patient_id: localStorage.getItem("patient_id") 
                })
            });
            
            const data = await response.json();
            if (data.success) {
                setModalState({ details: false, confirm: false });
                setSelectedApt(null);
                setCancelReason("");
                fetchAppointments(); 
                alert("Appointment canceled successfully.");
            }
        } catch (error) {
            alert("Error connecting to server.");
        }
    };

    const changeMonth = (offset) => {
        const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
        setCurrentDate(nextDate);
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayIdx = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const monthName = currentDate.toLocaleString('default', { month: 'long' }).toUpperCase();

    return (
        <Layout>
            <main className="max-w-5xl mx-auto p-6 bg-white rounded-[30px] shadow-sm border border-gray-100 relative">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-black text-gray-800">Your Appointments</h1>
                    <div className="flex items-center gap-6">
                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#1cb9d0] font-bold text-2xl">◀</button>
                        <div className="text-center min-w-[150px]">
                            <div className="text-2xl font-black text-gray-800">{monthName}</div>
                            <div className="text-gray-700 font-bold">{currentDate.getFullYear()}</div>
                        </div>
                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#1cb9d0] font-bold text-2xl">▶</button>
                    </div>
                </header>

                <div className="overflow-hidden rounded-2xl border border-gray-100">
                    <table className="w-full border-collapse table-fixed bg-white">
                        <thead>
                            <tr className="bg-gray-50">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <th key={d} className="p-4 uppercase text-xs font-black text-gray-700 tracking-widest border-b">{d}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {renderCalendarGrid(firstDayIdx, daysInMonth, appointments, (apt) => {
                                setSelectedApt(apt);
                                setModalState({ details: true, confirm: false });
                            }, formatTime)}
                        </tbody>
                    </table>
                </div>
                {loading && <div className="absolute inset-0 bg-white/50 flex justify-center items-center font-bold text-[#1cb9d0]">Loading...</div>}
            </main>

            {/* DETAILS MODAL */}
            <Modal isOpen={modalState.details} onClose={() => setModalState({ ...modalState, details: false })}>
                <h2 className="text-2xl font-black mb-6 text-gray-800">Appointment Details</h2>
                <div className="space-y-4 mb-8 text-lg">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-700 font-bold">Service</span>
                        <span className="font-black text-gray-800">{selectedApt?.service_name}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-700 font-bold">Dentist</span>
                        <span className="font-black text-gray-800">{selectedApt?.dentist_name}</span>
                    </div>
                    {/* ADDED DATE ROW */}
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-700 font-bold">Date</span>
                        <span className="font-black text-gray-800">{formatDate(selectedApt?.date)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-700 font-bold">Time</span>
                        <span className="font-black text-gray-800">{formatTime(selectedApt?.time)}</span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setModalState({ ...modalState, details: false })} className="bg-gray-100 text-gray-700 flex-1 py-4 rounded-2xl font-black">Close</button>
                    <button onClick={() => setModalState({ details: false, confirm: true })} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex-1 py-4 rounded-2xl font-black transition-all">Cancel</button>
                </div>
            </Modal>

            {/* CONFIRMATION MODAL */}
            <Modal isOpen={modalState.confirm} onClose={() => setModalState({ ...modalState, confirm: false })}>
                <h2 className="text-2xl font-black mb-4 text-gray-800">Cancel Appointment?</h2>
                <p className="text-gray-700 mb-4 font-bold">Please let us know why you are canceling:</p>
                <textarea 
                    className="w-full border-2 border-gray-100 p-4 rounded-2xl h-32 mb-6 focus:border-[#1cb9d0] outline-none transition-all font-bold" 
                    placeholder="Reason..." 
                    value={cancelReason} 
                    onChange={(e) => setCancelReason(e.target.value)} 
                />
                <div className="flex gap-4">
                    <button onClick={() => setModalState({ details: true, confirm: false })} className="bg-gray-100 text-gray-700 flex-1 py-4 rounded-2xl font-black">Back</button>
                    <button onClick={handleCancelSubmit} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex-1 py-4 rounded-2xl font-black transition-all">Confirm Cancel</button>
                </div>
            </Modal>
        </Layout>
    );
};

function renderCalendarGrid(firstDayIdx, daysInMonth, appointments, onAptClick, formatTime) {
    const totalSlots = [];
    for (let i = 0; i < firstDayIdx; i++) totalSlots.push(null);
    for (let i = 1; i <= daysInMonth; i++) totalSlots.push(i);

    const rows = [];
    let cells = [];

    totalSlots.forEach((day, index) => {
        cells.push(
            <td key={index} className="border border-gray-50 h-32 p-2 align-top transition-colors hover:bg-gray-50/50">
                {day && (
                    <>
                        <div className="text-gray-700 font-black text-sm mb-1">{day}</div>
                        <div className="space-y-1">
                            {appointments[day]?.map((apt, i) => (
                                <div key={i} onClick={() => onAptClick(apt)} className="bg-[#e0f7fa] text-[10px] p-2 rounded-lg border-l-4 border-[#1cb9d0] cursor-pointer hover:brightness-95 transition-all group">
                                    <div className="font-black text-[#159fb3] truncate">{apt.service_name}</div>
                                    <div className="text-gray-700 font-bold">{formatTime(apt.time)}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </td>
        );

        if ((index + 1) % 7 === 0 || index === totalSlots.length - 1) {
            while (cells.length < 7) {
                cells.push(<td key={`empty-end-${cells.length}`} className="border border-gray-50 h-32"></td>);
            }
            rows.push(<tr key={`row-${index}`}>{cells}</tr>);
            cells = [];
        }
    });
    return rows;
}

export default Appointments;