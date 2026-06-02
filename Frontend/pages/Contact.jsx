import React, { useState, useEffect } from 'react';
import Layout from '../components/layout';

const Contact = () => {
  const [userName, setUserName] = useState("Guest");
  const [formData, setFormData] = useState({
    sender_name: "",
    sender_email: "",
    message_text: ""
  });
  
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) setUserName(storedName);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: "", message: "" });

    try {
      const response = await fetch("http://localhost/appointsets/Backend/api/submit_inquiry.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAlert({ type: "success", message: data.message });
        setFormData({ sender_name: "", sender_email: "", message_text: "" }); // Reset on complete success
      } else {
        setAlert({ type: "error", message: data.message });
      }
    } catch (err) {
      console.error("Submission crash error:", err);
      setAlert({ type: "error", message: "Network connection breakdown. Please verify API endpoints." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout userName={userName}>
      <div className="flex justify-center items-start p-2 lg:p-6">
        <div className="bg-white w-full max-w-5xl p-8 lg:p-12 rounded-3xl shadow-md grid grid-cols-1 md:grid-cols-12 gap-12 border border-gray-100">
          
          {/* Interactive Input Form Column Section */}
          <div className="md:col-span-7">
            <h1 className="text-4xl font-black text-gray-800 mb-2">Get In Touch</h1>
            <p className="text-gray-500 mb-6 font-medium">Have questions about services, hours, or records? Message our desk directly.</p>
            <div className="h-[1px] bg-gray-200 w-full mb-8"></div>

            {alert.message && (
              <div className={`p-4 rounded-xl font-bold mb-6 border text-sm transition-all
                ${alert.type === 'success' 
                  ? 'bg-green-50 text-green-600 border-green-200' 
                  : 'bg-red-50 text-red-600 border-red-200'}`}
              >
                {alert.type === 'success' ? '✅' : '⚠️'} {alert.message}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div>
                <label className="block font-bold text-gray-700 mb-2 text-sm">Your Full Name</label>
                <input 
                  type="text" 
                  name="sender_name"
                  value={formData.sender_name}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 font-semibold focus:outline-none focus:border-[#1cb9d0] focus:bg-white transition-all shadow-inner" 
                  placeholder="e.g., Sarah Connor" 
                  required 
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2 text-sm">Email Address</label>
                <input 
                  type="email" 
                  name="sender_email"
                  value={formData.sender_email}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 font-semibold focus:outline-none focus:border-[#1cb9d0] focus:bg-white transition-all shadow-inner" 
                  placeholder="e.g., sarah@example.com" 
                  required 
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2 text-sm">How can we help you?</label>
                <textarea 
                  name="message_text"
                  value={formData.message_text}
                  onChange={handleInputChange}
                  className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-800 font-semibold focus:outline-none focus:border-[#1cb9d0] focus:bg-white transition-all h-36 resize-none shadow-inner" 
                  placeholder="Type your concerns or schedule queries here..." 
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="bg-[#1cb9d0] text-white px-10 py-4 rounded-full font-bold text-lg shadow-md hover:brightness-105 active:scale-95 disabled:opacity-50 transition-all"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* Right Sidebar Informational Panel Section */}
          <div className="md:col-span-5 flex flex-col gap-8 bg-gray-50 p-6 rounded-2xl border border-gray-200/60 shadow-inner">
            
            <div>
              <h2 className="text-xl font-black text-[#c5a043] flex items-center gap-2 mb-4">
                <span>📞</span> Contact Details
              </h2>
              <ul className="space-y-3 text-sm font-semibold text-gray-600">
                <li className="flex justify-between pb-2 border-b border-dashed border-gray-200">
                  <span>Mobile:</span> <span className="text-gray-800">0926 930 0966</span>
                </li>
                <li className="flex justify-between pb-2 border-b border-dashed border-gray-200 gap-4">
                  <span className="shrink-0">Address:</span> 
                  <span className="text-right text-gray-800 font-bold leading-relaxed">
                    Genesis Building, Main Road,<br />Bayan Luma 5, Imus, Cavite
                  </span>
                </li>
                <li className="flex justify-between pt-1">
                  <span>Map Location:</span>
                  <a 
                    href="https://www.google.com/maps/place/C-Smile+Dental+Clinic/@14.6563675,120.9917806,17z" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[#1cb9d0] hover:underline"
                  >
                    View Map Directions ➔
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#c5a043] flex items-center gap-2 mb-4">
                <span>🌐</span> Social Networks
              </h2>
              <ul className="space-y-3 text-sm font-semibold text-gray-600">
                <li className="flex justify-between pb-2 border-b border-dashed border-gray-200">
                  <span>Facebook Page:</span>
                  <a href="https://www.facebook.com/share/1H4nDmYo6D/" target="_blank" rel="noreferrer" className="text-[#1cb9d0] hover:underline">
                    C'smiles Dental Center
                  </a>
                </li>
                <li className="flex justify-between">
                  <span>Email:</span>
                  <a href="mailto:csmilesdentalcenter@gmail.com" className="text-[#1cb9d0] hover:underline">
                    csmilesdentalcenter@gmail.com
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#c5a043] flex items-center gap-2 mb-4">
                <span>⏰</span> Clinic Hours
              </h2>
              <ul className="space-y-3 text-sm font-semibold text-gray-600">
                <li className="flex justify-between pb-2 border-b border-dashed border-gray-200">
                  <span>Monday - Saturday:</span> <span className="text-gray-800">8:00 AM - 5:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Sunday:</span> <span className="text-red-500 font-black">Closed</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Contact;