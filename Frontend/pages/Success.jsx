import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout';

const Success = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-12 rounded-[40px] shadow-sm border border-gray-100 text-center max-w-lg w-full">
          {/* Success Icon */}
          <div className="text-6xl mb-6">✅</div>
          
          {/* Success Message */}
          <h2 className="text-3xl font-black text-gray-800 mb-4">
            Your appointment has been set!
          </h2>
          <p className="text-gray-500 text-xl font-bold mb-10">
            Thank you!
          </p>

          {/* Confirm/Done Button */}
          <button 
            // 1. Changed path to /BookAppointment
            onClick={() => navigate("/BookAppointment")} 
            className="bg-[#1cb9d0] text-white px-20 py-4 rounded-full font-bold text-xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            Confirm
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Success;