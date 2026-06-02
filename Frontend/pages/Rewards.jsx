import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import Layout from '../components/layout';

const Rewards = () => {
    const navigate = useNavigate(); // 2. Initialize navigate
    const [activeTab, setActiveTab] = useState('points');
    const [points, setPoints] = useState(0);
    const [services, setServices] = useState([]);
    const [userName, setUserName] = useState("Guest");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedName = localStorage.getItem("userName");
        if (storedName) setUserName(storedName);
        fetchPointsAndRewards();
    }, []);

    const fetchPointsAndRewards = async () => {
        try {
            const patient_id = localStorage.getItem("patient_id");

            const response = await fetch(
                `http://localhost/appointsets/Backend/api/get_points.php?patient_id=${patient_id}`
            );

            const data = await response.json();

            if (data.success) {
                setPoints(Number(data.points));
                setServices(data.rewards || []); // Dynamically updates template array from db
            }
        } catch (error) {
            console.error("Failed to fetch dashboard rewards configuration:", error);
        }
    };

    const handleOpenModal = (service) => {
        setSelectedService(service);
        setIsModalOpen(true);
    };

    const handleProcessRedeem = async () => {
        if (points < selectedService.price) return;

        setLoading(true);
        try {
            // Mock success logic
            setTimeout(() => {
                const newPoints = points - selectedService.price;
                setPoints(newPoints);
                
                // 3. LOGIC TO START BOOKING PROCESS
                // Save the redeemed service to localStorage so BookAppointment skips service selection
                localStorage.setItem("selectedService", selectedService.service_name);
                
                // Clear any old selection data to ensure a fresh start for the dentist/date
                localStorage.removeItem("selectedDentist");
                localStorage.removeItem("selectedDate");
                localStorage.removeItem("selectedTime");

                alert(`Redemption Successful! Now choosing a dentist for your ${selectedService.service_name}.`);
                
                setIsModalOpen(false);
                setLoading(false);

                // 4. Navigate to Step 1 (BookAppointment)
                // We add a query param so the page knows to focus on the Dentist selection
                navigate(
                    `/BookAppointment?redeemed_service=${encodeURIComponent(selectedService.service_name)}&points=${selectedService.price}`
                ); 
            }, 1000);

        } catch (error) {
            console.error("Redemption failed", error);
            setLoading(false);
        }
    };

    return (
        <Layout userName={userName}>
            <main className="max-w-4xl mx-auto p-10 bg-white rounded-[40px] shadow-2xl border border-gray-100 min-h-[600px]">
                
                <div className="flex justify-center gap-5 mb-12 bg-gray-50 p-2 rounded-full w-fit mx-auto shadow-inner">
                    <button 
                        onClick={() => setActiveTab('points')}
                        className={`px-10 py-4 rounded-full font-black text-lg transition-all ${activeTab === 'points' ? 'bg-[#a3e635] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Current Balance
                    </button>
                    <button 
                        onClick={() => setActiveTab('redeem')}
                        className={`px-10 py-4 rounded-full font-black text-lg transition-all ${activeTab === 'redeem' ? 'bg-[#a3e635] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Redeem Services
                    </button>
                </div>

                {activeTab === 'points' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
                        <h2 className="text-3xl font-black text-gray-800">Points Summary</h2>
                        <div className="w-16 h-1 bg-[#1cb9d0] mx-auto my-4 rounded-full"></div>
                        
                        <div className="mt-10 p-12 bg-[#fffcf0] rounded-[40px] border-4 border-dashed border-[#f1e5bc]">
                            <p className="text-gray-500 font-black tracking-widest uppercase text-sm">
                                {points > 0 ? "🎉 Amazing! You have earned:" : "You currently have:"}
                            </p>
                            <div className="text-8xl font-black text-gray-800 my-6">
                                {points} <span className="text-[#f39c12]">★</span>
                            </div>
                            <p className="text-xl font-bold text-gray-600">Total Reward Points</p>
                        </div>
                    </div>
                )}

                {activeTab === 'redeem' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-3xl font-black text-gray-800 text-center">Choose Your Reward</h2>
                        <div className="w-16 h-1 bg-[#1cb9d0] mx-auto my-4 rounded-full"></div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                            {services.map((service) => (
                                <div 
                                    key={service.id}
                                    onClick={() => handleOpenModal(service)}
                                    className="p-8 bg-gray-50 rounded-3xl border-2 border-transparent hover:border-[#1cb9d0] hover:bg-[#f0fbff] transition-all cursor-pointer group shadow-sm hover:shadow-md"
                                >
                                    <h3 className="text-2xl font-black text-gray-800 group-hover:text-[#a3e635]">{service.service_name}</h3>
                                    {service.description && (
                                        <p className="text-gray-500 text-sm mt-1 mb-2">{service.description}</p>
                                    )}
                                    <span className="mt-3 inline-block bg-[#ffeaa7] text-[#d35400] px-4 py-1 rounded-xl font-black text-sm">
                                        {service.price} ★ Required
                                    </span>
                                </div>
                            ))}
                            {services.length === 0 && (
                                <p className="text-center text-gray-400 col-span-2 font-bold py-8">No active rewards available at the moment.</p>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white p-10 rounded-[40px] w-full max-w-md shadow-2xl text-center animate-in zoom-in-95 duration-300">
                        <h2 className="text-3xl font-black text-gray-800">
                            {points >= selectedService?.price ? "Confirm Redemption?" : "Not Enough Points"}
                        </h2>
                        
                        <div className="my-6 py-3 px-8 bg-[#e1f1ee] text-[#1cb9d0] font-black rounded-full inline-block text-xl">
                            {selectedService?.service_name}
                        </div>

                        <div className="flex flex-col gap-4 mt-6">
                            {points >= selectedService?.price ? (
                                <button 
                                    onClick={handleProcessRedeem}
                                    disabled={loading}
                                    className="w-full py-5 bg-[#a3e635] text-white rounded-2xl font-black text-xl hover:brightness-105 active:scale-95 transition-all shadow-lg"
                                >
                                    {loading ? "Processing..." : "Confirm Redeem"}
                                </button>
                            ) : (
                                <p className="text-red-500 font-bold italic">Earn more points by completing appointments!</p>
                            )}
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 font-bold underline decoration-2 underline-offset-4"
                            >
                                Maybe later
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Rewards;