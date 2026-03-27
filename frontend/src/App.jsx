import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { BookingProvider } from "./context/BookingContext";
import { AuthProvider } from "./context/AuthContext";
import { CounsellorProvider } from "./context/CounsellorContext";
import { SessionNoteProvider } from "./context/SessionNoteContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import FindCounsellor from "./pages/appointment/FindCounsellor";
import BookingFlow from "./pages/appointment/BookingFlow";
import Payment from "./pages/appointment/Payment";
import StudentDashboard from "./pages/appointment/StudentDashboard";

// New Module Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import CounsellorDashboard from "./pages/counsellor/CounsellorDashboard";
import AppointmentProfile from "./pages/counsellor/AppointmentProfile";
import ChatUI from "./pages/counsellor/ChatUI";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CounsellorProvider>
          <BookingProvider>
            <SessionNoteProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="about" element={<AboutUs />} />
                    
                    {/* Appointment & Payment Module Routes */}
                    <Route path="appointment/counsellors" element={<FindCounsellor />} />
                    <Route path="appointment/book/:counsellorId" element={<BookingFlow />} />
                    <Route path="appointment/payment" element={<Payment />} />
                    <Route path="dashboard" element={<StudentDashboard />} />

                    {/* New Session Management Module Routes */}
                    <Route path="admin/counsellors" element={<AdminDashboard />} />
                    
                    {/* Direct Paths for Counsellor */}
                    <Route path="counsellor/dashboard" element={<Navigate to="/counsellor/availability" replace />} />
                    <Route path="counsellor/availability" element={<CounsellorDashboard />} />
                    <Route path="counsellor/appointments" element={<CounsellorDashboard />} />
                    <Route path="counsellor/appointment/:id" element={<AppointmentProfile />} />
                    <Route path="counsellor/history" element={<CounsellorDashboard />} />
                    <Route path="counsellor/notes" element={<CounsellorDashboard />} />
                    
                    <Route path="chat" element={<ChatUI />} />
                  </Route>
                </Routes>
              </Router>
            </SessionNoteProvider>
          </BookingProvider>
        </CounsellorProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;