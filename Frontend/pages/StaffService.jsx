import React, { useState, useEffect } from 'react';
import StaffLayout from '../components/StaffLayout';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from the PHP API
    fetch("http://localhost/appointsets/Backend/api/get_services.php")
      .then(response => response.json())
      .then(data => {
        const servicesData = data.services ? data.services : data;
        setServices(servicesData);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching services:", error);
        setLoading(false);
      });
  }, []);

  // ✅ MODIFIED: Swapped page navigation logic out for the restricted alert notification hook
  const handleBookNow = () => {
    alert("For Patient Only");
  };

  return (
    <StaffLayout>
      <div className="services-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <h1 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '30px', marginTop: '0', color: '#c5a043' }}>
          Our Services
        </h1>

        <div className="services-list" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '25px', 
          overflowY: 'auto', 
          paddingRight: '15px', 
          paddingBottom: '20px' 
        }}>
          {loading ? (
            <p style={{ textAlign: 'center', gridColumn: 'span 2' }}>Loading services...</p>
          ) : services.length > 0 ? (
            services.map((service) => {
              // Check if status is explicitly Unavailable or Deactive
              const isUnavailable = service.status?.toLowerCase() === 'unavailable' || service.status?.toLowerCase() === 'deactive';

              const imageUrl = service.service_image 
                ? `/uploads/${service.service_image}` 
                : 'https://via.placeholder.com/130?text=No+Image';

              return (
                <div key={service.service_id} className="service-item" style={{
                  display: 'flex',
                  background: 'white',
                  borderRadius: '15px',
                  padding: '20px',
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.2s ease',
                  alignItems: 'flex-start',
                  gap: '20px',
                  opacity: isUnavailable ? 0.7 : 1,
                  backgroundColor: isUnavailable ? '#f4f6f6' : 'white'
                }}>
                  {/* Service Image Wrapper */}
                  <div 
                    style={{
                      width: '130px',
                      height: '130px',
                      backgroundImage: `url(${imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: '12px',
                      flexShrink: 0,
                      backgroundColor: '#eee',
                      position: 'relative',
                      filter: isUnavailable ? 'grayscale(100%)' : 'none'
                    }}
                  >
                    {isUnavailable && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.6)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: '800',
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        textAlign: 'center',
                        padding: '8px',
                        lineHeight: '1.3'
                      }}>
                        Temporarily Not Available
                      </div>
                    )}
                  </div>

                  {/* Service Details Box */}
                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px' }}>
                    <div className="service-info">
                      <h3 style={{ 
                        margin: '0 0 5px 0', 
                        textTransform: 'uppercase', 
                        fontSize: '1.1rem', 
                        color: isUnavailable ? '#7f8c8d' : '#333',
                        textDecoration: isUnavailable ? 'line-through' : 'none'
                      }}>
                        {service.service_name}
                      </h3>
                      <p style={{ margin: '0 0 10px 0', color: isUnavailable ? '#95a5a6' : '#666', fontSize: '0.85rem', lineHeight: '1.4' }}>
                        {service.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: isUnavailable ? '#7f8c8d' : '#2a7a6e' }}>
                        ₱{Number(service.price).toLocaleString()}
                      </div>
                      
                      <button 
                        // ✅ MODIFIED: Removed the parameter payload since we are skipping database routing hooks here
                        onClick={() => !isUnavailable && handleBookNow()}
                        disabled={isUnavailable}
                        className={`book-btn ${isUnavailable ? 'disabled' : ''}`}
                        style={{
                          backgroundColor: isUnavailable ? '#bdc3c7' : '#a3e635',
                          color: isUnavailable ? '#7f8c8d' : 'white',
                          border: 'none',
                          padding: '10px 18px',
                          borderRadius: '40px',
                          fontWeight: 'bold',
                          cursor: isUnavailable ? 'not-allowed' : 'pointer',
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          transition: '0.2s'
                        }}
                      >
                        {isUnavailable ? 'Not Available' : 'Book Now'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ textAlign: 'center', gridColumn: 'span 2' }}>No services currently available.</p>
          )}
        </div>
      </div>
    </StaffLayout>
  );
};

export default Services;