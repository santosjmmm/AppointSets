import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout"; 

// 1. ADD THIS IMPORT FOR THE ICONS:
import { 
  Search, 
  Eye, 
  Edit2, 
  ToggleLeft, 
  ToggleRight, 
  X, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Award, 
  ShieldAlert 
} from "lucide-react";

const ManagePeople = () => {
  // Master data storage separated by schema partitions
  const [dataGroup, setDataGroup] = useState({ patients: [], staff: [], dentists: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('patients'); // 'patients' | 'staff' | 'dentists'
  const [searchTerm, setSearchTerm] = useState('');

  // Modals Controller
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost/appointsets/Backend/api/manage_people.php');
      if (response.data.success) {
        setDataGroup(response.data.data);
      }
    } catch (error) {
      console.error("Error gathering user groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const response = await axios.post('http://localhost/appointsets/Backend/api/manage_people.php', {
        action: 'toggle_status',
        role_type: activeTab.slice(0, -1), // strips 's' to pass 'patient', 'staff', 'dentist'
        id: id,
        status: nextStatus
      });
      if (response.data.success) fetchData();
    } catch (error) {
      console.error("Failed toggling target status flags:", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost/appointsets/Backend/api/manage_people.php', {
        action: 'update_user',
        role_type: activeTab.slice(0, -1),
        ...editUser
      });
      if (response.data.success) {
        setEditUser(null);
        fetchData();
      }
    } catch (error) {
      console.error("Failed executing structural record shift updating:", error);
    }
  };

  // Safe Extraction helper context paths
  const currentList = dataGroup[activeTab] || [];
  
  const filteredList = currentList.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.patient_id || u.staff_id || u.dentist_id)?.toString().includes(searchTerm)
  );

  return (
    <AdminLayout>
      <div style={{ padding: '35px', background: '#f6faf9', minHeight: '100%', overflowY: 'auto' }}>
        
        {/* Banner header title */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2.2rem', color: '#334155', margin: '0 0 6px 0', fontWeight: '700' }}>Manage System Accounts</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>Overview, track, edit records, or configure active access clearances across database tables.</p>
        </div>

        {/* Dynamic Category Switcher Tabs */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', borderBottom: '2px solid #e2e8f0', paddingBottom: '1px' }}>
          {[
            { id: 'patients', label: `Patients (${dataGroup.patients.length})` },
            { id: 'staff', label: `Clinic Staff (${dataGroup.staff.length})` },
            { id: 'dentists', label: `Dentists (${dataGroup.dentists.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
              style={{
                padding: '12px 24px',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                border: 'none',
                background: 'transparent',
                color: activeTab === tab.id ? '#c5a043' : '#64748b',
                borderBottom: activeTab === tab.id ? '3px solid #c5a043' : '3px solid transparent',
                transition: 'all 0.2s ease',
                marginBottom: '-2px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Real-time Query Input Field */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '420px', marginBottom: '20px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '11px 15px 11px 42px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
          />
        </div>

        {/* Master Render Datatable View Grid */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', overflowX: 'auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>Fetching table registers...</div>
          ) : filteredList.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>No accounts found in this directory partition.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '16px 20px', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', width: '10%' }}>ID</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', width: '25%' }}>Full Name / Email</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', width: '15%' }}>Contact Number</th>
                  
                  {/* Dynamic Column Header Adaptations */}
                  {activeTab === 'patients' && <th style={{ padding: '16px 20px', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', width: '20%' }}>Age & Address</th>}
                  {activeTab === 'patients' && <th style={{ padding: '16px 20px', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', width: '15%' }}>Loyalty Points</th>}
                  {activeTab === 'dentists' && <th style={{ padding: '16px 20px', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', width: '25%' }}>Availability Schedule</th>}
                  {activeTab !== 'patients' && <th style={{ padding: '16px 20px', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', width: '15%' }}>Status State</th>}
                  
                  <th style={{ padding: '16px 20px', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', textAlign: 'center', width: '15%' }}>Management</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((user) => {
                  const uniqueId = user.patient_id || user.staff_id || user.dentist_id;
                  return (
                    <tr key={uniqueId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 20px', color: '#475569', fontSize: '0.9rem', fontWeight: '700' }}>#{uniqueId}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>{user.name}</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', wordBreak: 'break-all' }}>{user.email}</div>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#334155', fontSize: '0.9rem' }}>{user.contact_num || 'None'}</td>
                      
                      {/* Dynamic row injections */}
                      {activeTab === 'patients' && (
                        <td style={{ padding: '16px 20px', color: '#475569', fontSize: '0.85rem' }}>
                          <div><strong>Age:</strong> {user.age}</div>
                          <div style={{ color: '#78889b', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.address}</div>
                        </td>
                      )}
                      {activeTab === 'patients' && (
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', display: 'inline-block' }}>
                            ⭐ {user.points} pts
                          </span>
                        </td>
                      )}
                      {activeTab === 'dentists' && (
                        <td style={{ padding: '16px 20px', color: '#475569', fontSize: '0.8rem', maxWidth: '200px' }}>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.avail || 'Not Scheduled'}</div>
                        </td>
                      )}
                      {activeTab !== 'patients' && (
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ 
                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '5px',
                            background: user.status === 'Active' ? '#e6f4ea' : '#fce8e6',
                            color: user.status === 'Active' ? '#137333' : '#c5221f'
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: user.status === 'Active' ? '#137333' : '#c5221f' }}></span>
                            {user.status || 'Active'}
                          </span>
                        </td>
                      )}

                      {/* FIXED: Added a layout wrapper to prevent overlap and wrapping issues */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap' }}>
                          <button title="View Detail Profile" onClick={() => setViewUser(user)} style={{ border: 'none', background: '#f1f5f9', padding: '8px', borderRadius: '6px', cursor: 'pointer', color: '#475569', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={15} /></button>
                          <button title="Edit Record Columns" onClick={() => setEditUser({ ...user, id: uniqueId })} style={{ border: 'none', background: '#f1f5f9', padding: '8px', borderRadius: '6px', cursor: 'pointer', color: '#2563eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Edit2 size={15} /></button>
                          {activeTab !== 'patients' && (
                            <button title="Toggle System Active Guard" onClick={() => handleToggleStatus(uniqueId, user.status)} style={{ border: 'none', background: 'transparent', padding: '2px', cursor: 'pointer', color: user.status === 'Active' ? '#137333' : '#94a3b8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                              {user.status === 'Active' ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ========================================================
            VIEW DETAILS SHEET MODAL OVERLAY
            ======================================================== */}
        {viewUser && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <div style={{ background: '#2c3e50', padding: '18px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Card Overview</h3>
                <X size={20} style={{ cursor: 'pointer' }} onClick={() => setViewUser(null)} />
              </div>
              <div style={{ padding: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: '700', color: '#475569' }}>
                    {viewUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 3px 0', color: '#1e293b', fontSize: '1.1rem' }}>{viewUser.name}</h4>
                    <span style={{ padding: '2px 6px', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>Role Scope: {activeTab.toUpperCase()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#334155' }}><Mail size={16} style={{ color: '#64748b' }} /> <span>{viewUser.email}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#334155' }}><Phone size={16} style={{ color: '#64748b' }} /> <span>{viewUser.contact_num || 'Unassigned'}</span></div>
                  
                  {activeTab === 'patients' && <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#334155' }}><Calendar size={16} style={{ color: '#64748b' }} /> <span>Patient Age Account: <strong>{viewUser.age} yrs old</strong></span></div>}
                  {activeTab === 'patients' && <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#334155' }}><MapPin size={16} style={{ color: '#64748b' }} /> <span>{viewUser.address}</span></div>}
                  {activeTab === 'patients' && <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#334155' }}><Award size={16} style={{ color: '#64748b' }} /> <span>Current Point Credits: <strong>{viewUser.points} points</strong></span></div>}
                  {activeTab === 'dentists' && <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: '#334155' }}><ShieldAlert size={16} style={{ color: '#64748b', marginTop: '3px' }} /> <span><strong>Clinic Schedule:</strong> <br/> <small style={{color: '#64748b'}}>{viewUser.avail || 'None listed'}</small></span></div>}
                </div>
                <button onClick={() => setViewUser(null)} style={{ width: '100%', marginTop: '25px', padding: '11px', background: '#2c3e50', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>Close Window</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            EDIT STRUCTURAL FORM MODAL OVERLAY
            ======================================================== */}
        {editUser && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <div style={{ background: '#2c3e50', padding: '18px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Modify Account Attributes</h3>
                <X size={20} style={{ cursor: 'pointer' }} onClick={() => setEditUser(null)} />
              </div>
              <form onSubmit={handleUpdate} style={{ padding: '25px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Full Name Identity</label>
                    <input type="text" value={editUser.name || ''} onChange={e => setEditUser({...editUser, name: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Email Index</label>
                    <input type="email" value={editUser.email || ''} onChange={e => setEditUser({...editUser, email: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Contact Number</label>
                    <input type="text" value={editUser.contact_num || ''} onChange={e => setEditUser({...editUser, contact_num: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                  </div>

                  {/* Schema variations injected parameters inside Edit form contexts */}
                  {activeTab === 'patients' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Age</label>
                        <input type="number" value={editUser.age || ''} onChange={e => setEditUser({...editUser, age: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Loyalty Points</label>
                        <input type="number" value={editUser.points || 0} onChange={e => setEditUser({...editUser, points: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                      </div>
                    </div>
                  )}
                  {activeTab === 'patients' && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Address Location</label>
                      <input type="text" value={editUser.address || ''} onChange={e => setEditUser({...editUser, address: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                    </div>
                  )}
                  {activeTab === 'dentists' && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Availability Days</label>
                      <input type="text" value={editUser.avail || ''} onChange={e => setEditUser({...editUser, avail: e.target.value})} placeholder="e.g. Monday,Tuesday,Wednesday" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }} />
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setEditUser(null)} style={{ padding: '10px 18px', background: '#f1f5f9', border: 'none', borderRadius: '6px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 18px', background: '#2563eb', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Save Metrics</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default ManagePeople;