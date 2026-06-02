import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logoImg from "../assets/logo.jpg"; 

const ForgotPassword = () => {
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1); 
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(""); 
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch("http://localhost/appointsets/Backend/api/reset_password.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: 'send_otp',
                    email: formData.email
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage(data.message);
                setStep(2); 
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error("OTP delivery route network trace structural anomaly:", err);
            setError("Unable to communicate with endpoint configurations.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndReset = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch("http://localhost/appointsets/Backend/api/reset_password.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: 'verify_and_reset',
                    email: formData.email,
                    otp: formData.otp,
                    new_password: formData.newPassword
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage(data.message);
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error("Reset execution processing exception:", err);
            setError("Unable to process request modifications.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#b7e4d9] to-[#fefbe0] font-sans p-4">
            <div className="bg-[#B8CFEB] w-full max-w-[400px] p-10 rounded-[50px] shadow-2xl text-center">
                <div className="w-28 h-28 bg-white rounded-full mx-auto mb-8 flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden">
                    <img src={logoImg} alt="C'Smiles Logo" className="w-4/5 object-contain" />
                </div>

                <h2 className="text-2xl font-black text-gray-800 mb-6 tracking-tight">Reset Password</h2>

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="text-left">
                            <label className="block text-gray-700 text-xs mb-1 ml-4 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#1cb9d0] outline-none transition-all"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {error && <div className="text-red-500 text-sm font-semibold mt-2 animate-pulse">{error}</div>}
                        {message && <div className="text-green-600 text-sm font-semibold mt-2">{message}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#1cb9d0] text-white font-bold text-xl rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-lg mt-4 disabled:bg-gray-300"
                        >
                            {loading ? "Checking Account..." : "Send Verification OTP"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyAndReset} className="space-y-4">
                        <p className="text-xs text-gray-600 bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-2 text-left">
                            We have sent your OTP in your email: <b>{formData.email}</b>.
                        </p>

                        <div className="text-left">
                            <label className="block text-gray-700 text-xs mb-1 ml-4 uppercase tracking-wider">Enter 6-Digit OTP</label>
                            <input
                                type="text"
                                name="otp"
                                maxLength="6"
                                placeholder="123456"
                                className="w-full px-5 py-3 text-center tracking-[10px] text-lg font-bold rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#1cb9d0] outline-none transition-all"
                                value={formData.otp}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="text-left relative">
                            <label className="block text-gray-700 text-xs mb-1 ml-4 uppercase tracking-wider">New Password</label>
                            <input
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#1cb9d0] outline-none transition-all"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                            />
                            <span
                                className="absolute right-5 top-[34px] cursor-pointer text-lg select-none"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? "🙈" : "👁"}
                            </span>
                        </div>

                        <div className="text-left relative">
                            <label className="block text-gray-700 text-xs mb-1 ml-4 uppercase tracking-wider">Confirm Password</label>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#1cb9d0] outline-none transition-all"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <span
                                className="absolute right-5 top-[34px] cursor-pointer text-lg select-none"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? "🙈" : "👁"}
                            </span>
                        </div>

                        {error && <div className="text-red-500 text-sm font-semibold mt-2 animate-pulse">{error}</div>}
                        {message && <div className="text-green-600 text-sm font-semibold mt-2">{message}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#1cb9d0] text-white font-bold text-xl rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all shadow-lg mt-4 disabled:bg-gray-300"
                        >
                            {loading ? "Processing Update..." : "Verify & Change Password"}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setStep(1); setMessage(""); setError(""); }}
                            className="text-xs text-gray-600 hover:text-gray-800 font-semibold underline block mx-auto mt-2"
                        >
                            Change Email Address
                        </button>
                    </form>
                )}

                <div className="mt-8 text-gray-500 text-sm">
                    Remember your password? <Link to="/login" className="text-blue-500 font-bold hover:underline">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;