import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// ─── UniCare Context Providers ─────────────────────────────────────────────────
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { CounsellorProvider } from './context/CounsellorContext';
import { SessionNoteProvider } from './context/SessionNoteContext';
import { ChatProvider } from './context/ChatContext';

// ─── Config (axios interceptor for unified API port) ──────────────────────────
import './config/api';

// ─── Shared Layout & Utilities ────────────────────────────────────────────────
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';

// ─── UniCare Core Pages ────────────────────────────────────────────────────────
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import FindCounsellor from './pages/appointment/FindCounsellor';
import BookingFlow from './pages/appointment/BookingFlow';
import Payment from './pages/appointment/Payment';
import StudentDashboard from './pages/appointment/StudentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import CounsellorDashboard from './pages/counsellor/CounsellorDashboard';
import AppointmentProfile from './pages/counsellor/AppointmentProfile';
import ChatUI from './pages/counsellor/ChatUI';
import SavedAvailability from './pages/counsellor/SavedAvailability';

// ─── Auth Pages (from Wellness module) ────────────────────────────────────────
import Login from './pages/Login';
import Register from './pages/Register';

// ─── Wellness Module Pages ─────────────────────────────────────────────────────
import WellnessDashboard from './pages/WellnessDashboard';
import WellnessCenter from './pages/WellnessCenter';
import GoalHistory from './pages/GoalHistory';
import MoodSupportAssistant from './pages/MoodSupportAssistant';
import MoodHistory from './pages/MoodHistory';
import ResourceLibrary from './pages/ResourceLibrary';
import ResourceDetail from './pages/ResourceDetail';
import SavedResources from './pages/SavedResources';

// ─── Wellness Admin Pages ──────────────────────────────────────────────────────
import WellnessAdminDashboard from './pages/WellnessAdminDashboard';
import AdminResourceList from './pages/AdminResourceList';
import AdminAddResource from './pages/AdminAddResource';
import AdminEditResource from './pages/AdminEditResource';

function App() {
  return (
    <ToastProvider>
      <Toaster position="top-right" />
      <AuthProvider>
        <CounsellorProvider>
          <BookingProvider>
            <SessionNoteProvider>
              <ChatProvider>
                <Router>
                  <ScrollToTop />
                  <Routes>

                  {/* ── Main Layout (Navbar + Footer) ── */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="about" element={<AboutUs />} />

                    {/* ── Appointment & Payment ── */}
                    <Route path="appointment/counsellors" element={<FindCounsellor />} />
                    <Route path="appointment/book/:counsellorId" element={<BookingFlow />} />
                    <Route path="appointment/payment" element={<Payment />} />
                    <Route path="dashboard" element={<StudentDashboard />} />

                    {/* ── Counsellor Management (UniCare Admin) ── */}
                    <Route path="admin/counsellors" element={<AdminDashboard />} />

                    {/* ── Counsellor Portal ── */}
                    <Route path="counsellor/dashboard" element={<Navigate to="/counsellor/availability" replace />} />
                    <Route path="counsellor/availability" element={<CounsellorDashboard />} />
                    <Route path="counsellor/my-availability" element={<SavedAvailability />} />
                    <Route path="counsellor/appointments" element={<CounsellorDashboard />} />
                    <Route path="counsellor/appointment/:id" element={<AppointmentProfile />} />
                    <Route path="counsellor/history" element={<CounsellorDashboard />} />
                    <Route path="counsellor/notes" element={<CounsellorDashboard />} />
                    <Route path="chat" element={<ChatUI />} />

                    {/* ── Wellness Module ── */}
                    <Route path="wellness-dashboard" element={<WellnessDashboard />} />
                    <Route path="wellness" element={<WellnessCenter />} />
                    <Route path="wellness/history" element={<GoalHistory />} />
                    <Route path="mood" element={<MoodSupportAssistant />} />
                    <Route path="mood/history" element={<MoodHistory />} />
                    <Route path="resources" element={<ResourceLibrary />} />
                    <Route path="resources/:id" element={<ResourceDetail />} />
                    <Route path="saved" element={<SavedResources />} />

                    {/* ── Wellness Admin ── */}
                    <Route path="admin-dashboard" element={<WellnessAdminDashboard />} />
                    <Route path="admin/resources" element={<AdminResourceList />} />
                    <Route path="admin/resources/add" element={<AdminAddResource />} />
                    <Route path="admin/resources/edit/:id" element={<AdminEditResource />} />
                  </Route>

                  {/* ── Standalone Auth Pages (no Layout) ── */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* ── Fallback ── */}
                  <Route path="*" element={<Navigate to="/" />} />

                </Routes>
              </Router>
            </ChatProvider>
          </SessionNoteProvider>
          </BookingProvider>
        </CounsellorProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
