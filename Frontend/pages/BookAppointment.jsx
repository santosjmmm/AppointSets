import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/layout';
import "../styles/layout.css";

const BookAppointment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Detect if a service was passed via URL (Redeemed or Rebooked)
  const urlService = searchParams.get('redeemed_service') || searchParams.get('service');

  const [formData, setFormData] = useState({ 
    service: urlService || '', 
    dentist: '' 
  });
  const [error, setError] = useState('');

  // Initialized as empty arrays so data loads purely from your PHP API
  const [services, setServices] = useState([]);
  const [dentists, setDentists] = useState([]);

  // Fetch available services and dentists from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost/appointsets/Backend/api/set_appointment.php"
        );

        const text = await response.text();

        console.log("RAW RESPONSE:");
        console.log(text);

        const data = JSON.parse(text);

        if (data.success) {
          setServices(data.services);
          setDentists(data.dentists);
        } else {
          console.error("API error status:", data.error);
        }
      } catch (err) {
        console.error("Database fetch failed:", err);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const redeemedPoints = searchParams.get("points");
  const isRedeemed = !!searchParams.get("redeemed_service");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.service || !formData.dentist) {
      setError("Please choose service and dentist");
    } else {
      setError('');
      localStorage.setItem("selectedService", formData.service);
      localStorage.setItem("selectedDentist", formData.dentist);
      
      if (isRedeemed) {
        localStorage.setItem("isReward", "true");
        localStorage.setItem("redeemedPoints", redeemedPoints);
        localStorage.setItem("redeemedService", formData.service);
      } else {
        localStorage.removeItem("isReward");
        localStorage.removeItem("redeemedPoints");
        localStorage.removeItem("redeemedService");
      }

      navigate('/Step2');
    }
  };

  return (
    <Layout>
      <form onSubmit={handleSubmit}>
        <div className="stepper-head">
          <span style={{ textDecoration: 'underline' }}>Select Service</span>
          <span className="inactive">Set date and time</span>
          <span className="inactive">Confirm details</span>
          <span className="inactive">Done</span>
        </div>

        {urlService && (
          <div style={{ background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold', fontSize: '0.9rem' }}>
            📍 Selected Service: {urlService} 
            <button 
              type="button" 
              onClick={() => { navigate('/BookAppointment'); setFormData({...formData, service: ''}); }}
              style={{ marginLeft: '10px', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: '#155724' }}
            >
              (Change)
            </button>
          </div>
        )}

        <h2>What's your plan today?</h2>
        <div className="divider"></div>
        <div className="pill-grid">
          {services.length === 0 ? (
            <p>Loading available services...</p>
          ) : (
            services.map(s => {
              const isLocked = urlService && urlService !== s;
              
              return (
                <label key={s} className={`pill-option ${isLocked ? 'locked' : ''}`} style={isLocked ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
                  <input 
                    type="radio" 
                    name="service" 
                    value={s} 
                    onChange={handleChange} 
                    checked={formData.service === s}
                    disabled={isLocked} 
                  />
                  <div className="pill-label">{s}</div>
                </label>
              );
            })
          )}
        </div>

        <h2>Who's your Dentist?</h2>
        <div className="divider"></div>
        <div className="dentist-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '70%' }}>
          {dentists.length === 0 ? (
            <p>Loading active dentists...</p>
          ) : (
            dentists.map(d => (
              <label key={d} className="pill-option">
                <input 
                  type="radio" 
                  name="dentist" 
                  value={d} 
                  onChange={handleChange} 
                  checked={formData.dentist === d}
                />
                <div className="pill-label">{d}</div>
              </label>
            ))
          )}
        </div>

        {error && <div className="error-box" style={{ display: 'block' }}>{error}</div>}

        <div className="footer-action">
          <button type="submit" className="next-btn">Next</button>
        </div>
      </form>
    </Layout>
  );
};

export default BookAppointment;