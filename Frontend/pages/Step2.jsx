import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/layout';

const Step2 = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Guest");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [period, setPeriod] = useState("AM");
  const [error, setError] = useState("");
  
  // Track booked database slots dynamically
  const [bookedSlots, setBookedSlots] = useState({}); 

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Get current date context cleanly without hours interference
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const timeSlots = {
    AM: ["8:00", "9:00", "10:30"],
    PM: ["1:00", "2:00", "3:30"]
  };
  
  const totalSlotsPerDay = timeSlots.AM.length + timeSlots.PM.length; // 6 slots total

  // 1. Core verification check on mount
  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);

    const isRebook = searchParams.get('rebook') === 'true';
    const serviceParam = searchParams.get('service');
    const dentistParam = searchParams.get('dentist');

    if (isRebook && serviceParam && dentistParam) {
      localStorage.setItem("selectedService", decodeURIComponent(serviceParam));
      localStorage.setItem("selectedDentist", decodeURIComponent(dentistParam));
    }

    if (!localStorage.getItem("selectedService")) {
      navigate("/BookAppointment");
    }
  }, [navigate, searchParams]);

  // 2. Fetch booked dates and hours from the DB whenever the visible month/year changes
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const displayMonth = currentMonth + 1;
        const response = await fetch(
          `http://localhost/appointsets/Backend/api/get_booked_slots.php?month=${displayMonth}&year=${currentYear}`
        );
        const data = await response.json();
        if (data.success) {
          setBookedSlots(data.bookings); // Expected structure: {"2026-05-20": ["9:00 AM", "2:00 PM"]}
        }
      } catch (err) {
        console.error("Failed to load appointment blocks:", err);
      }
    };
    fetchBookings();
  }, [currentMonth, currentYear]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
    setSelectedTime("");
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
    setSelectedTime("");
  };

  const handleDateClick = (dateString, isPast, isSunday, isFullyBooked) => {
    if (isPast || isSunday || isFullyBooked) return;
    setSelectedDate(dateString);
    setSelectedTime(""); // Reset selected hour slot when swapping dates
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setError("Please choose preferred date and time");
    } else {
      localStorage.setItem("selectedDate", selectedDate);
      localStorage.setItem("selectedTime", selectedTime);
      navigate("/Step3");
    }
  };

  return (
    <Layout userName={userName}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-between items-center pb-4 border-b-4 border-gray-100 gap-5 mb-10 overflow-hidden">
          <span className="text-[#c5a043] font-extrabold text-lg opacity-30">Select Service</span>
          <span className="text-[#c5a043] font-extrabold text-lg border-b-2 border-[#c5a043]">Set date and time</span>
          <span className="text-[#c5a043] font-extrabold text-lg opacity-30">Confirm details</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Calendar Section */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">What's your plan date?</h2>
            <div className="h-[1px] bg-gray-300 w-full mb-6"></div>
            
            <div className="bg-gray-50 p-6 rounded-3xl shadow-inner border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <button type="button" onClick={handlePrevMonth} className="text-2xl font-bold text-[#c5a043]">◀</button>
                <h3 className="text-xl font-black">{monthNames[currentMonth]} {currentYear}</h3>
                <button type="button" onClick={handleNextMonth} className="text-2xl font-bold text-[#c5a043]">▶</button>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center font-bold text-gray-500 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {[...Array(firstDayOfMonth)].map((_, i) => <div key={`empty-${i}`} />)}
                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = selectedDate === dateString;
                  
                  const targetDate = new Date(currentYear, currentMonth, day);
                  const isSunday = targetDate.getDay() === 0;
                  const isPast = targetDate < today;

                  // Normalize formatting checks when scanning full calendar blocks
                  const dayBookings = bookedSlots[dateString] || [];
                  const isFullyBooked = dayBookings.length >= totalSlotsPerDay;

                  return (
                    <div
                      key={day}
                      onClick={() => handleDateClick(dateString, isPast, isSunday, isFullyBooked)}
                      className={`py-3 rounded-xl font-bold transition-all text-center relative
                        ${isPast || isSunday
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-40' 
                          : isFullyBooked
                            ? 'bg-red-100 text-red-400 border border-red-300 cursor-not-allowed line-through'
                            : isSelected 
                              ? 'bg-gradient-to-b from-[#faffd1] to-[#e1e9b7] border-2 border-[#c5a043] translate-y-1 shadow-inner cursor-pointer' 
                              : 'bg-white hover:bg-gray-100 shadow-sm border-2 border-transparent cursor-pointer'}`}
                      title={isFullyBooked ? "Fully Booked" : ""}
                    >
                      {day}
                      {isFullyBooked && !isPast && !isSunday && (
                        <span className="absolute bottom-0 left-0 right-0 text-[9px] text-red-600 font-extrabold leading-none pb-0.5">Full</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Fully Booked Status Notification Banner */}
            {selectedDate && (bookedSlots[selectedDate] || []).length >= totalSlotsPerDay && (
              <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-xl font-bold border border-red-200 text-center">
                ⚠️ Selected day ({selectedDate}) is fully booked. Please select another day.
              </div>
            )}
          </div>

          {/* Time Picker Section */}
          <div className="w-full lg:w-[350px]">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Set your Time</h2>
            <div className="h-[1px] bg-gray-300 w-full mb-6"></div>

            <div className="flex justify-center gap-4 mb-8">
              {['AM', 'PM'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setPeriod(p); setSelectedTime(""); }}
                  className={`px-8 py-2 rounded-full font-black transition-all border-2 
                    ${period === p ? 'bg-[#a3e635] text-white border-transparent' : 'bg-gray-100 border-gray-200 text-gray-700'}`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {timeSlots[period].map(t => {
                const fullTime = `${t} ${period}`;
                const isSelected = selectedTime === fullTime;
                
                // Read hour conflicts from current date selection
                const dayBookings = bookedSlots[selectedDate] || [];
                
                // 💡 UPDATED LOGIC: Compares cleansed, clean strings directly matching our PHP transformation output
                const isHourTaken = dayBookings.some(bookedTime => {
                  const cleanedBooked = bookedTime.replace(/\s+/g, '').toLowerCase();
                  const cleanedTarget = fullTime.replace(/\s+/g, '').toLowerCase();
                  return cleanedBooked === cleanedTarget;
                });

                return (
                  <button
                    key={t}
                    type="button"
                    disabled={!selectedDate || isHourTaken}
                    onClick={() => { setSelectedTime(fullTime); setError(""); }}
                    className={`py-4 rounded-full text-center font-extrabold transition-all shadow-md w-full
                      ${!selectedDate 
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none border border-dashed'
                        : isHourTaken
                          ? 'bg-red-200 text-red-500 cursor-not-allowed opacity-60 line-through'
                          : isSelected 
                            ? 'bg-gradient-to-b from-[#faffd1] to-[#e1e9b7] border-2 border-[#c5a043] translate-y-1' 
                            : 'bg-[#e0e0e0] border-2 border-transparent text-gray-700 hover:bg-gray-300'}`}
                  >
                    {t} {isHourTaken ? "(Booked)" : ""}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-[#ffe5e5] text-[#d8000c] p-4 rounded-xl text-center font-bold border border-[#ffb3b3]">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center pt-5">
          <button type="button" onClick={() => navigate("/BookAppointment")} className="bg-[#1cb9d0] text-white px-16 py-4 rounded-full font-bold text-xl shadow-lg hover:brightness-110 active:scale-95 transition-all">
            Prev
          </button>
          <button type="submit" className="bg-[#1cb9d0] text-white px-16 py-4 rounded-full font-bold text-xl shadow-lg hover:brightness-110 active:scale-95 transition-all">
            Next
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default Step2;