import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logoImg from "../assets/logo.jpg";

const Signup = () => {
  const navigate = useNavigate(); 
  
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    contact_num: '',
    address: '',
    email: '',
    password: '',
    confirm_password: ''
  });

  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Phase 1 Request Handler: Request Validation Code
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    setError('');
    setStatusMessage('');

    try {
      const response = await fetch("http://localhost/appointsets/Backend/api/signup.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          action: "send_signup_otp"
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsOtpSent(true);
        setStatusMessage(data.message || "Verification code has been dispatched!");
      } else {
        setError(data.message || "Failed to issue registration confirmation email token.");
      }
    } catch (err) {
      setError("Server connection fault. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Phase 2 Request Handler: Submit validation code and complete insertion
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please input the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch("http://localhost/appointsets/Backend/api/signup.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          otp: otp,
          action: "verify_and_register"
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Account Registered Safely!");
        navigate('/login');
      } else {
        setError(data.message || "Incorrect code entered.");
      }
    } catch (err) {
      setError("Connection failure while executing validation checklist query.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#b7e4d9] to-[#fefbe0] font-sans p-6">
      <div className="bg-[#B8CFEB] w-full max-w-[500px] p-8 md:p-10 rounded-[50px] shadow-2xl text-center">
        
        <div className="w-24 h-24 bg-white rounded-full mx-auto mb-6 flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden">
          <img src={logoImg} alt="Logo" className="w-4/5 object-contain" />
        </div>

        {statusMessage && <div className="bg-green-100 text-green-800 p-3 rounded-xl mb-4 text-sm font-semibold">{statusMessage}</div>}
        {error && <div className="bg-red-100 text-red-600 p-3 rounded-xl mb-4 text-sm font-semibold">{error}</div>}

        {!isOtpSent ? (
          /* REGULAR FORM CONTAINER INTERFACE BLOCK */
          <form onSubmit={handleRequestOtp} autoComplete="off" className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 text-left">
                <input 
                  type="text" name="full_name" placeholder="Full Name" 
                  className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#1cb9d0] outline-none"
                  value={formData.full_name} onChange={handleChange} required 
                />
              </div>
              <div className="text-left">
                <input 
                  type="number" name="age" placeholder="Age" min="3" 
                  className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#1cb9d0] outline-none"
                  value={formData.age} onChange={handleChange} required 
                />
              </div>
            </div>

            <div className="text-left">
              <input 
                type="tel" name="contact_num" placeholder="Contact Number" 
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#1cb9d0] outline-none"
                value={formData.contact_num} onChange={handleChange} required 
              />
            </div>

            <div className="text-left">
              <input 
                type="text" name="address" placeholder="Address" 
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#1cb9d0] outline-none"
                value={formData.address} onChange={handleChange} required 
              />
            </div>

            <div className="text-left">
              <input 
                type="email" name="email" placeholder="Email" 
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#1cb9d0] outline-none"
                value={formData.email} onChange={handleChange} required 
              />
            </div>

            <div className="text-left relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" placeholder="Password" 
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#1cb9d0] outline-none"
                value={formData.password} onChange={handleChange} required 
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer select-none" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "🙈" : "👁"}
              </span>
            </div>

            <div className="text-[10px] text-gray-600 flex justify-between px-2 text-left leading-tight">
              <p>• 8-12 Characters</p>
              <p>• Uppercase & Lowercase</p>
              <p>• Special Character</p>
            </div>

            <div className="text-left relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirm_password" placeholder="Confirm Password" 
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#1cb9d0] outline-none"
                value={formData.confirm_password} onChange={handleChange} required 
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer select-none" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? "🙈" : "👁"}
              </span>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-[#1cb9d0] text-white font-bold text-xl rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-lg mt-2 disabled:opacity-50">
              {loading ? "Sending OTP..." : "Get Verification Code"}
            </button>
          </form>
        ) : (
          /* OTP VERIFICATION VIEW PORTION */
          <form onSubmit={handleVerifyAndRegister} className="space-y-4">
            <div className="text-gray-700 text-sm mb-2">
              An email containing a 6-digit OTP code has been dispatched to <strong>{formData.email}</strong>. Enter it below to complete registration:
            </div>
            <div className="text-left">
              <input 
                type="text" 
                placeholder="Enter 6-digit OTP Code" 
                maxLength="6"
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 text-center tracking-[10px] text-xl font-bold border-none focus:ring-2 focus:ring-[#1cb9d0] outline-none"
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                required 
              />
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-[#1cb9d0] text-white font-bold text-xl rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-lg mt-2 disabled:opacity-50">
              {loading ? "Validating Account..." : "Verify & Complete Signup"}
            </button>

            <button type="button" onClick={() => setIsOtpSent(false)} className="text-sm text-gray-600 underline block mx-auto mt-2 hover:text-gray-800">
              Back to Form Edit
            </button>
          </form>
        )}

        <div className="mt-6 text-gray-600 text-sm">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;