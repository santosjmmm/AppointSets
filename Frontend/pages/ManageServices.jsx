import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";

const ManageServices = () => {
  const [activeTab, setActiveTab] = useState("regular");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    service_name: "",
    description: "",
    price: "",
    duration: "",
    service_type: "regular",
    points_required: "",
    service_image: null,
  });

  const [status, setStatus] = useState({ type: "", message: "" });

  const fetchServices = async () => {
    try {
      const response = await axios.get(
        "http://localhost/appointsets/Backend/api/manage_services.php"
      );

      if (Array.isArray(response.data)) {
        setServices(response.data);
      } else if (response.data.success) {
        setServices(response.data.services);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setStatus({ type: "error", message: "Failed to load services from database." });
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, service_type: activeTab }));
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "service_image") {
      setFormData({ ...formData, service_image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      data.append("action", editingId ? "update" : "add");
      if (editingId) data.append("service_id", editingId);

      const response = await axios.post(
        "http://localhost/appointsets/Backend/api/manage_services.php",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        setStatus({ type: "success", message: response.data.message });
        setFormData({
          service_name: "",
          description: "",
          price: "",
          duration: "",
          service_type: activeTab,
          points_required: "",
          service_image: null,
        });
        setEditingId(null);
        fetchServices();
      } else {
        setStatus({ type: "error", message: response.data.message });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Connection error." });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingId(service.service_id);
    setActiveTab(service.service_type);
    setFormData({
      service_name: service.service_name,
      description: service.description,
      price: service.service_type === "regular" ? service.price : "",
      duration: service.duration,
      service_type: service.service_type,
      points_required: service.service_type === "points" ? service.price : "",
      service_image: null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleStatus = async (id, currentStatus, type) => {
    try {
      await axios.post(
        "http://localhost/appointsets/Backend/api/manage_services.php",
        { 
          action: "toggle_status", 
          service_id: id, 
          current_status: currentStatus,
          service_type: type 
        }
      );
      fetchServices();
    } catch (error) {
      console.error("Toggle error:", error);
    }
  };

  const filteredServices = services.filter(
    (service) => service.service_type === activeTab
  );

  return (
    <AdminLayout>
      <div className="service-wrapper">
        <div className="service-header">
          <h2>Manage Services</h2>
          <p>Manage Regular and Reward Point Services</p>
        </div>

        {status.message && (
          <div className={`alert-pill ${status.type}`}>{status.message}</div>
        )}

        <div className="type-selector-modern">
          <div className="type-option">
            <input type="radio" checked={activeTab === "regular"} onChange={() => setActiveTab("regular")} id="regular" />
            <label htmlFor="regular" className="selector-label">🦷 Regular Services</label>
          </div>
          <div className="type-option">
            <input type="radio" checked={activeTab === "points"} onChange={() => setActiveTab("points")} id="points" />
            <label htmlFor="points" className="selector-label">🎁 Reward Services</label>
          </div>
        </div>

        <div className="services-list-container">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <div key={service.service_id} className={`service-row-card ${service.status?.toLowerCase() === "unavailable" || service.status?.toLowerCase() === "deactive" ? "status-unavailable" : ""}`}>
                <div className="row-image-box">
                  <img 
                    src={`/uploads/${service.service_image}`} 
                    alt={service.service_name} 
                    onError={(e) => e.target.src = '/default-service.png'} 
                  />
                </div>
                <div className="row-details">
                  <div className="row-main-info">
                    <h3>{service.service_name}</h3>
                    <p className="row-desc">{service.description}</p>
                    <div className="row-meta">
                      <span className="row-price">
                        {service.service_type === "regular" ? `₱${service.price}` : `${service.price} Points`}
                      </span>
                      <span className="row-duration">⏱ {service.duration}</span>
                    </div>
                  </div>
                  <div className="row-actions">
                    <button className="row-edit-btn" onClick={() => handleEdit(service)}>Edit</button>
                    <button 
                      className={service.status?.toLowerCase() === "available" || service.status?.toLowerCase() === "active" ? "row-avail-btn" : "row-unavail-btn"}
                      onClick={() => toggleStatus(service.service_id, service.status, service.service_type)}
                    >
                      {service.status || "Available"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", color: "#999" }}>No services found for this category.</p>
          )}
        </div>

        <div className="add-service-form-container">
          <form onSubmit={handleSubmit} className="styled-form-inline">
            <h3 style={{ color: "#7ba29b", marginBottom: "15px" }}>
              {editingId ? "Update Service" : `+ Add New ${activeTab === 'regular' ? 'Service' : 'Reward'}`}
            </h3>
            <div className="form-grid-modern">
              <input type="text" name="service_name" placeholder="Service Name" value={formData.service_name} onChange={handleChange} required />
              <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
              <input 
                type="number" 
                name={activeTab === "regular" ? "price" : "points_required"} 
                placeholder={activeTab === "regular" ? "Price" : "Points Required"} 
                value={activeTab === "regular" ? formData.price : formData.points_required} 
                onChange={handleChange} 
                required 
              />
              <input type="text" name="duration" placeholder="Duration (e.g. 01:00:00)" value={formData.duration} onChange={handleChange} required />
              <input type="file" name="service_image" onChange={handleChange} className="file-input-custom" />
              <button type="submit" className="row-add-btn">
                {loading ? "Saving..." : editingId ? "Update Service" : "Add Service"}
              </button>
            </div>
          </form>
        </div>

        <style>{`
          .service-wrapper { max-width: 1000px; margin: auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
          .service-header { text-align: center; margin-bottom: 30px; }
          .service-header h2 { color: #c5a043; font-size: 2.2rem; margin-bottom: 5px; }
          
          .type-selector-modern { display: flex; gap: 15px; margin-bottom: 30px; }
          .type-option { flex: 1; }
          .type-option input { display: none; }
          .selector-label { display: block; text-align: center; padding: 12px; border-radius: 10px; border: 2px solid #e1f1ee; cursor: pointer; font-weight: 700; transition: 0.3s; background: #fff; }
          .type-option input:checked + .selector-label { border-color: #c5a043; background: #e1f1ee; color: #4a789c; }

          .services-list-container { display: flex; flex-direction: column; gap: 15px; margin-bottom: 40px; }
          .service-row-card { display: flex; background: white; border: 1px solid #e1f1ee; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
          .status-unavailable { opacity: 0.6; border-color: #f8d7da; }
          
          .row-image-box { width: 180px; min-width: 180px; height: 120px; background: #f0f0f0; }
          .row-image-box img { width: 100%; height: 100%; object-fit: cover; }
          
          .row-details { flex: 1; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; }
          .row-main-info h3 { margin: 0; color: #444; font-size: 1.15rem; }
          .row-desc { color: #888; font-size: 0.85rem; margin: 4px 0; }
          .row-meta { display: flex; gap: 15px; align-items: center; margin-top: 5px; }
          .row-price { color: #1cb9d0; font-weight: 800; }
          .row-duration { color: #aaa; font-size: 0.8rem; }

          .row-actions { display: flex; gap: 8px; }
          .row-edit-btn, .row-avail-btn, .row-unavail-btn { padding: 6px 15px; border: none; border-radius: 18px; color: white; font-weight: bold; cursor: pointer; font-size: 0.85rem; }
          .row-edit-btn { background: #1cb9d0; }
          .row-avail-btn { background: #2ecc71; }
          .row-unavail-btn { background: #e74c3c; }

          .add-service-form-container { background: #fff; padding: 25px; border-radius: 15px; border: 1px solid #eee; box-shadow: 0 -5px 15px rgba(0,0,0,0.02); }
          .form-grid-modern { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .form-grid-modern input { padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
          .file-input-custom { grid-column: span 2; background: #f9f9f9; }
          .row-add-btn { background: #c5a043; color: white; border: none; border-radius: 6px; padding: 12px; font-weight: bold; cursor: pointer; grid-column: span 2; margin-top: 10px; }

          .alert-pill { padding: 10px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: bold; }
          .success { background: #d4edda; color: #155724; }
          .error { background: #f8d7da; color: #721c24; }
        `}</style>
      </div>
    </AdminLayout>
  );
};

export default ManageServices;