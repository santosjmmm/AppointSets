import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Line, Doughnut } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('patients'); 

  useEffect(() => {
    fetch("http://localhost/appointsets/Backend/api/get_admin_stats.php")
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(res => {
        if (res.error) {
          console.error("Backend runtime error message:", res.error);
        }
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  const handleExportPDF = () => {
    if (!data) return;
    setIsExporting(true);

    try {
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const timestamp = new Date().toLocaleString();

      doc.setFillColor(28, 185, 208);
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.text("C'Smiles Dental Center", 14, 18);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(12);
      doc.text("Executive Analytics & Dashboard Overview Report", 14, 26);
      doc.setFontSize(10);
      doc.text(`Generated: ${timestamp} | Compiled by: ${data?.admin_name || 'Admin'}`, 14, 33);

      doc.setTextColor(45, 55, 72);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.text("1. Core Business Performance Metrics", 14, 52);

      const summaryHeaders = [["Operational KPI Metric Indicator", "Reported Volume / Contextual Value"]];
      const summaryRows = [
        ["Total Registered Patients Base", `${data?.total_patients || 0} Patients`],
        ["Today's Scheduling Bookings Queue", `${data?.today_appointments || 0} Scheduled`],
        ["Accumulated Operational Gross Revenue", `PHP ${Number(data?.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`],
        ["Pending Request Status Count", `${data?.pending_appointments || 0} System Records`]
      ];

      const renderTable = doc.autoTable || doc.jsPDF?.API?.autoTable;
      
      if (typeof renderTable === 'function') {
        renderTable.call(doc, {
          startY: 56,
          head: summaryHeaders,
          body: summaryRows,
          theme: 'striped',
          headStyles: { fillColor: [45, 55, 72], fontStyle: 'bold' },
          styles: { font: 'Helvetica', fontSize: 10, cellPadding: 4 },
          margin: { left: 14, right: 14 }
        });
      } else {
        let lineY = 60;
        summaryRows.forEach(([metric, val]) => {
          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(10);
          doc.text(`${metric}:`, 14, lineY);
          doc.text(val, 120, lineY);
          lineY += 8;
        });
        doc.lastAutoTable = { finalY: lineY };
      }

      const currentY = (doc.lastAutoTable?.finalY || 100) + 12;
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.text("2. Service Distribution Profile Matrix", 14, currentY);

      const serviceLabels = data?.chart_data?.labels || [];
      const serviceCounts = data?.chart_data?.counts || [];
      
      const distributionHeaders = [["Identified Dental Medical Service Offering", "Relative Metric Session Count Volume"]];
      const distributionRows = serviceLabels.map((label, index) => [
        label,
        `${serviceCounts[index] || 0} Treatments Provided`
      ]);

      if (distributionRows.length === 0) {
        distributionRows.push(["No service deployment profile stats logs returned", "0"]);
      }

      if (typeof renderTable === 'function') {
        renderTable.call(doc, {
          startY: currentY + 4,
          head: distributionHeaders,
          body: distributionRows,
          theme: 'grid',
          headStyles: { fillColor: [197, 160, 67], fontStyle: 'bold' }, 
          styles: { font: 'Helvetica', fontSize: 10, cellPadding: 4 },
          margin: { left: 14, right: 14 }
        });
      }

      doc.save(`Dental_Dashboard_Report_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (error) {
      console.error("PDF generation layout failure execution:", error);
      alert(`Export Failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <div className="loading-state">Loading Analytics...</div>;
  if (!data) return <div className="error-state">Check backend connection.</div>;

  const patientDetailsList = data?.recent_patients_list || [];
  const bookingDetailsList = data?.today_bookings_list || [];
  const pendingDetailsList = data?.pending_bookings_list || [];

  return (
    <AdminLayout>
      <div className="dashboard-full-container">
        
        {/* Header Section */}
        <header className="dashboard-header">
          <div className="header-info">
            <h1>Dashboard Overview</h1>
            <p>Welcome back, {data?.admin_name ? data.admin_name.split(' ')[0] : 'Admin'}!</p>
          </div>
          <div className="header-btns">
            <button 
              className="btn-export" 
              onClick={handleExportPDF} 
              disabled={isExporting}
              style={{ opacity: isExporting ? 0.7 : 1, cursor: isExporting ? 'not-allowed' : 'pointer' }}
            >
              {isExporting ? "Generating PDF..." : "Export Data"}
            </button>
          </div>
        </header>

        {/* Clickable Card Grid */}
        <section className="stats-row">
          <StatBox 
            title="Total Patients" 
            value={data?.total_patients || 0} 
            icon="👥" 
            color="#1cb9d0" 
            isActive={activeTab === 'patients'}
            onClick={() => setActiveTab('patients')}
          />
          <StatBox 
            title="Today's Bookings" 
            value={data?.today_appointments || 0} 
            icon="📅" 
            color="#2ecc71" 
            isActive={activeTab === 'bookings'}
            onClick={() => setActiveTab('bookings')}
          />
          <StatBox 
            title="Revenue" 
            value={`₱${Number(data?.revenue || 0).toLocaleString()}`} 
            icon="💰" 
            color="#f1c40f" 
            isActive={activeTab === 'revenue'}
            onClick={() => setActiveTab('revenue')}
          />
          <StatBox 
            title="Pending" 
            value={data?.pending_appointments || 0} 
            icon="⏳" 
            color="#e74c3c" 
            isActive={activeTab === 'pending'}
            onClick={() => setActiveTab('pending')}
          />
        </section>

        {/* Charts Section */}
        <div className="charts-grid">
          <div className="chart-wrapper line-chart-area">
            <div className="chart-header">
              <h3>Appointment Trends</h3>
            </div>
            <div className="chart-canvas">
              <Line 
                options={{ 
                  maintainAspectRatio: false,
                  responsive: true,
                  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                }}
                data={{
                  labels: data?.trend_data?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                  datasets: [{
                    label: 'Appointments',
                    data: data?.trend_data?.counts || [0, 0, 0, 0, 0, 0],
                    borderColor: '#1cb9d0',
                    backgroundColor: 'rgba(28, 185, 208, 0.1)',
                    fill: true,
                    tension: 0.4
                  }]
                }} 
              />
            </div>
          </div>

          <div className="chart-wrapper doughnut-area">
            <div className="chart-header">
              <h3>Service Distribution</h3>
            </div>
            <div className="chart-canvas">
              <Doughnut 
                data={{
                  labels: data?.chart_data?.labels && data.chart_data.labels.length > 0 ? data.chart_data.labels : ["No Records"],
                  datasets: [{
                    data: data?.chart_data?.counts && data.chart_data.counts.length > 0 ? data.chart_data.counts : [0],
                    backgroundColor: ['#c5a043', '#1cb9d0', '#3498db', '#2ecc71', '#9b59b6']
                  }]
                }}
                options={{ 
                  plugins: { legend: { position: 'bottom' } }, 
                  maintainAspectRatio: false,
                  responsive: true
                }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Context Breakdown Tables */}
        <div className="interactive-breakdown-wrapper">
          {activeTab === 'patients' && (
            <div className="data-table-card">
              <h3>Total Registered Patient Records Overview</h3>
              <table className="breakdown-table">
                <thead>
                  <tr>
                    <th>Patient System ID</th>
                    <th>Full Legal Name</th>
                    <th>Contact Phone Number</th>
                    <th>Registration Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patientDetailsList.length > 0 ? (
                    patientDetailsList.map((p, idx) => (
                      <tr key={idx}>
                        <td><span className="badge badge-gray">P-{String(p.id || 0).padStart(3, '0')}</span></td>
                        <td><strong>{p.name}</strong></td>
                        <td>{p.contact || 'N/A'}</td>
                        <td><span className="badge badge-blue">{p.status || 'Active Card'}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No registered patient accounts located in backend base.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="data-table-card">
              <h3>Today's Confirmed Scheduled Appointments Queue</h3>
              <table className="breakdown-table">
                <thead>
                  <tr>
                    <th>Scheduled Time Slot</th>
                    <th>Patient Reference</th>
                    <th>Treatment Operations</th>
                    {/* MODIFIED HEADER NAME */}
                    <th>Assigned Dentist</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingDetailsList.length > 0 ? (
                    bookingDetailsList.map((b, idx) => (
                      <tr key={idx}>
                        <td><span className="badge badge-green">{b.time}</span></td>
                        <td><strong>{b.patient}</strong></td>
                        <td>{b.service}</td>
                        {/* MODIFIED CELL MAPPING */}
                        <td><span className="badge badge-blue">{b.dentist}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No calendar items scheduled for today.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="data-table-card">
              <h3>Financial Statements Gross Collection Summary</h3>
              <div className="revenue-summary-view">
                <div className="revenue-metric-box">
                  <span>Gross Processed Accounts Layer</span>
                  <h2>₱{Number(data?.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                  <p>Aggregated matching all ledger payment fields captured cleanly from backend SQL layer execution statements logs.</p>
                </div>
              </div>
            </div>
          )}

{activeTab === 'pending' && (
  <div className="data-table-card">
    <h3>Upcoming & Future Scheduled Appointments</h3>
    <table className="breakdown-table">
      <thead>
        <tr>
          <th>Inbound Receipt Date</th>
          <th>Requested Registrant</th>
          <th>Intended Procedure Category</th>
          {/* UPDATED HEADER LABEL */}
          <th>Assigned Dentist</th>
        </tr>
      </thead>
      <tbody>
        {pendingDetailsList.length > 0 ? (
          pendingDetailsList.map((p, idx) => (
            <tr key={idx}>
              <td>{p.requestDate}</td>
              <td><strong>{p.patient}</strong></td>
              <td>{p.service}</td>
              {/* UPDATED FIELD DATA CELL MAPPING */}
              <td><span className="badge badge-blue">{p.dentist}</span></td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
              No incoming system pending evaluation requests items.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)}
        </div>
      </div>

      <style>{`
        .dashboard-full-container { width: 100%; display: flex; flex-direction: column; gap: 25px; padding: 10px 0; }
        .dashboard-header { display: flex; justify-content: space-between; align-items: center; padding: 0 5px; }
        .header-info h1 { font-size: 2.2rem; font-weight: 800; color: #2d3748; margin: 0; }
        .header-info p { color: #718096; margin: 5px 0 0 0; }
        .header-btns { display: flex; gap: 12px; }
        .btn-export { padding: 12px 24px; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; transition: transform 0.2s; background: #c5a043; color: white; }
        .btn-export:hover { transform: translateY(-2px); }
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; width: 100%; }
        .charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; width: 100%; }
        .chart-wrapper { background: white; border-radius: 24px; padding: 30px; border: 1px solid #edf2f7; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
        .chart-header { display: flex; justify-content: space-between; margin-bottom: 25px; }
        .chart-canvas { height: 450px; width: 100%; }
        .interactive-breakdown-wrapper { width: 100%; margin-top: 5px; }
        .data-table-card { background: white; border-radius: 24px; padding: 30px; border: 1px solid #edf2f7; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
        .data-table-card h3 { margin-top: 0; margin-bottom: 20px; font-size: 1.3rem; color: #2d3748; font-weight: 800; }
        .breakdown-table { width: 100%; border-collapse: collapse; text-align: left; }
        .breakdown-table th { background-color: #f7fafc; padding: 14px; color: #718096; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; border-bottom: 2px solid #edf2f7; }
        .breakdown-table td { padding: 16px 14px; border-bottom: 1px solid #edf2f7; color: #4a5568; font-size: 0.95rem; }
        .breakdown-table tr:last-child td { border-bottom: none; }
        .badge { padding: 4px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: 700; }
        .badge-gray { background-color: #edf2f7; color: #4a5568; }
        .badge-blue { background-color: #ebf8ff; color: #2b6cb0; }
        .badge-green { background-color: #f0fff4; color: #2f855a; }
        .badge-gold { background-color: #fefcbf; color: #744210; }
        .revenue-summary-view { padding: 10px 0; }
        .revenue-metric-box { background: #fffdf5; border: 1px dashed #f6e05e; padding: 24px; border-radius: 16px; max-width: 500px; }
        .revenue-metric-box span { font-size: 0.85rem; color: #b7791f; font-weight: 700; text-transform: uppercase; }
        .revenue-metric-box h2 { font-size: 2.5rem; color: #744210; margin: 8px 0; font-weight: 900; }
        .revenue-metric-box p { color: #a0aec0; font-size: 0.85rem; margin: 0; line-height: 1.4; }
        @media (max-width: 1400px) { .stats-row { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); } }
        @media (max-width: 1100px) { .charts-grid { grid-template-columns: 1fr; } .chart-canvas { height: 350px; } }
      `}</style>
    </AdminLayout>
  );
};

const StatBox = ({ title, value, icon, color, isActive, onClick }) => (
  <div 
    className={`stat-card ${isActive ? 'active-card-glow' : ''}`} 
    onClick={onClick}
    style={{ borderColor: isActive ? color : '#edf2f7', borderWidth: isActive ? '2px' : '1px' }}
  >
    <div className="stat-content">
      <span className="stat-label">{title}</span>
      <h2 className="stat-number">{value}</h2>
    </div>
    <div className="stat-icon-circle" style={{ backgroundColor: `${color}15`, color: color }}>
      {icon}
    </div>
    <style>{`
      .stat-card { background: white; padding: 30px; border-radius: 24px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #edf2f7; cursor: pointer; transition: all 0.2s ease-in-out; }
      .stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.05); }
      .active-card-glow { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); background-color: #fcfdfe; }
      .stat-label { color: #a0aec0; font-size: 0.9rem; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; display: block; }
      .stat-number { font-size: 2.2rem; color: #2d3748; margin: 0; font-weight: 900; }
      .stat-icon-circle { width: 65px; height: 65px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; }
    `}</style>
  </div>
);

export default AdminDashboard;