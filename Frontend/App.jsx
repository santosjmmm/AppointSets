import { Routes, Route } from 'react-router-dom';
import Signup from './pages/signup';
import login from './pages/login';
import ForgotPassword from './pages/ForgotPassword';
import BookAppointment from './pages/BookAppointment';
import Step2 from './pages/Step2';
import Step3 from './pages/Step3'; 
import Step4 from './pages/Step4';
import Success from './pages/Success';
import Appointments from './pages/Appointments';
import Records from './pages/Records';
import Rewards from './pages/Rewards';
import Services from './pages/Services';
import AdminDashboard from './pages/AdminDashboard';
import AccountCreation from './pages/AccountCreation';
import PatientRecords from './pages/PatientRecords';
import ManageServices from './pages/ManageServices';
import ManagePeople from './pages/ManagePeople';
import StaffDashboard from './pages/StaffDashboard';
import AppCalendar from './pages/AppCalendar';
import StaffPatientRecord from './pages/StaffPatientRecord';
import StaffService from './pages/StaffService';
import Contact from './pages/Contact';

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />
      <Route path="/ForgotPassword" element={<ForgotPassword />} />

      {/* Appointment Booking Stepper */}
      <Route path="/BookAppointment" element={<BookAppointment />}/>
      <Route path="/Step2" element={<Step2 />} />
      <Route path="/Step3" element={<Step3 />} />
      <Route path="/Step4" element={<Step4 />} />
      <Route path="/success" element={<Success />} />
      <Route path="/Appointments" element={<Appointments />} />
      <Route path="/Records" element={<Records />} />
      <Route path="/Rewards" element={<Rewards />} />
      <Route path="/Services" element={<Services />} />
      <Route path="/AdminDashboard" element={<AdminDashboard />} />
      <Route path="/AccountCreation" element={<AccountCreation />} /> 
      <Route path="/PatientRecords" element={<PatientRecords />} />
      <Route path="/ManageServices" element={<ManageServices />} />
      <Route path="/ManagePeople" element={<ManagePeople />} />
      <Route path="/StaffDashboard" element={<StaffDashboard />} />
      <Route path="/AppCalendar" element={<AppCalendar />} />   
      <Route path="/StaffPatientRecord" element={<StaffPatientRecord />} /> 
      <Route path="/StaffService" element={<StaffService />} />
      <Route path="/Contact" element={<Contact />} /> 
    </Routes>
  );
}

export default App;
