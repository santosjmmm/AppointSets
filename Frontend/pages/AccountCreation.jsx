import React, { useState } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout'; 

const AccountCreation = () => {
  const [formData, setFormData] = useState({
    role: 'dentist',
    name: '',
    age: '',
    contact: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: '' // Added confirmPassword state
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    // 1. Age Validation
    if (parseInt(formData.age) < 18) {
      setStatus({ type: 'error', message: 'Employee must be 18 years or older.' });
      setLoading(false);
      return;
    }

    // 2. Password Match Validation
    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match. Please try again.' });
      setLoading(false);
      return;
    }

    try {
      // We exclude confirmPassword when sending to the backend
      const { confirmPassword, ...submitData } = formData;
      const response = await axios.post('http://localhost/appointsets/Backend/api/create_account.php', submitData);
      
      if (response.data.success) {
        setStatus({ type: 'success', message: `Account for ${formData.name} created successfully!` });
        setFormData({ role: 'dentist', name: '', age: '', contact: '', address: '', email: '', password: '', confirmPassword: '' });
      } else {
        setStatus({ type: 'error', message: response.data.message || 'Error creating account.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Connection to server failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="registration-wrapper">
        <div className="registration-header">
          <h2>Employee Registration</h2>
          <p>Add a new professional to the C'SMILES team</p>
        </div>
        
        {status.message && (
          <div className={`alert-pill ${status.type}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="styled-form">
          {/* Role Selection */}
          <div className="type-selector-modern">
            <div className="type-option">
              <input type="radio" name="role" id="dentist" value="dentist" checked={formData.role === 'dentist'} onChange={handleChange} />
              <label htmlFor="dentist" className="selector-label"><span className="icon">🦷</span> Dentist</label>
            </div>
            <div className="type-option">
              <input type="radio" name="role" id="staff" value="staff" checked={formData.role === 'staff'} onChange={handleChange} />
              <label htmlFor="staff" className="selector-label"><span className="icon">📋</span> Receptionist</label>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group full">
              <label>Full Name</label>
              <input type="text" name="name" className="custom-input" placeholder="e.g. Juan Dela Cruz" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Age</label>
              <input type="number" name="age" className="custom-input" min="18" placeholder="18+" value={formData.age} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Contact Number</label>
              <input type="text" name="contact" className="custom-input" placeholder="09xx xxx xxxx" value={formData.contact} onChange={handleChange} required />
            </div>

            <div className="form-group full">
              <label>Address</label>
              <input type="text" name="address" className="custom-input" placeholder="Home or Office Address" value={formData.address} onChange={handleChange} required />
            </div>

            <div className="form-group full">
              <label>Email Address</label>
              <input type="email" name="email" className="custom-input" placeholder="name@example.com" value={formData.email} onChange={handleChange} required />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  className="custom-input" 
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleChange}
                  required 
                />
                <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)} tabIndex="-1">
                  {showPassword ? '🐵' : '🙈'}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="password-input-wrapper">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword" 
                  className="custom-input" 
                  placeholder="••••••••" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required 
                />
                <button type="button" className="password-toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex="-1">
                  {showConfirmPassword ? '🐵' : '🙈'}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-submit-gold" disabled={loading}>
            {loading ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>

        <style>{`
          /* ... all previous styles ... */
          .registration-wrapper { width: 100%; max-width: 700px; margin: 0 auto; }
          .registration-header { text-align: center; margin-bottom: 30px; }
          .registration-header h2 { color: #c5a043; font-size: 2.2rem; font-weight: 800; margin-bottom: 5px; }
          .registration-header p { color: #7f8c8d; font-size: 1rem; }
          .type-selector-modern { display: flex; gap: 20px; margin-bottom: 30px; }
          .type-option { flex: 1; }
          .type-option input { display: none; }
          .selector-label { display: flex; flex-direction: column; align-items: center; padding: 15px; background: #f8fbfb; border: 2px solid #e1f1ee; border-radius: 15px; cursor: pointer; font-weight: 700; color: #4a789c; transition: all 0.3s ease; }
          .selector-label .icon { font-size: 1.5rem; margin-bottom: 5px; }
          .type-option input:checked + .selector-label { background: #e1f1ee; border-color: #c5a043; color: #2c3e50; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
          .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .form-group.full { grid-column: span 2; }
          .form-group label { display: block; font-weight: 700; font-size: 0.85rem; color: #555; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
          .custom-input { width: 100%; padding: 14px 18px; border: 1px solid #e0e0e0; border-radius: 12px; font-size: 1rem; background: #fafafa; transition: 0.3s; box-sizing: border-box; }
          .custom-input:focus { outline: none; border-color: #c5a043; background: white; box-shadow: 0 0 0 4px rgba(197, 160, 67, 0.1); }
          .password-input-wrapper { position: relative; display: flex; align-items: center; }
          .password-input-wrapper .custom-input { padding-right: 50px; }
          .password-toggle-btn { position: absolute; right: 12px; background: none; border: none; cursor: pointer; font-size: 1.4rem; padding: 0; display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease; }
          .btn-submit-gold { width: 100%; padding: 16px; background: #c5a043; color: white; border: none; border-radius: 12px; font-weight: 800; font-size: 1.1rem; cursor: pointer; transition: 0.3s; text-transform: uppercase; letter-spacing: 1px; }
          .btn-submit-gold:hover { background: #b08d3a; transform: translateY(-1px); box-shadow: 0 10px 20px rgba(197, 160, 67, 0.2); }
          .alert-pill { padding: 14px; border-radius: 12px; margin-bottom: 25px; text-align: center; font-weight: 700; }
          .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
          .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        `}</style>
      </div>
    </AdminLayout>
  );
};

export default AccountCreation;