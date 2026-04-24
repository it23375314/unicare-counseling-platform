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
import AppointmentHistory from './pages/counsellor/AppointmentHistory';

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

// ─── New Admin & Settings Pages (Merged from auth-module) ────────────────────
import UserManagement from './pages/admin/UserManagement';
import PlatformLogs from './pages/admin/PlatformLogs';
import SystemAnalytics from './pages/admin/SystemAnalytics';
import SystemConfig from './pages/admin/SystemConfig';
import Settings from './pages/Settings';

import ProtectedRoute from './components/ProtectedRoute';

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
                    
                    {/* Protected Booking Routes */}
                    <Route path="appointment/book/:counsellorId" element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <BookingFlow />
                      </ProtectedRoute>
                    } />
                    <Route path="appointment/payment" element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <Payment />
                      </ProtectedRoute>
                    } />
                    <Route path="dashboard" element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <StudentDashboard />
                      </ProtectedRoute>
                    } />

                    {/* ── Counsellor Management (UniCare Admin) ── */}
                    <Route path="admin/counsellors" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } />

                    {/* ── Counsellor Portal ── */}
                    <Route path="counsellor/dashboard" element={<Navigate to="/counsellor/availability" replace />} />
                    <Route path="counsellor/my-availability" element={<SavedAvailability />} />
                    <Route path="history" element={<AppointmentHistory />} />
                    <Route path="counsellor/availability" element={
                      <ProtectedRoute allowedRoles={['counsellor']}>
                        <CounsellorDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="counsellor/appointments" element={
                      <ProtectedRoute allowedRoles={['counsellor']}>
                        <CounsellorDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="counsellor/appointment/:id" element={
                      <ProtectedRoute allowedRoles={['counsellor']}>
                        <AppointmentProfile />
                      </ProtectedRoute>
                    } />
                    <Route path="counsellor/history" element={
                      <ProtectedRoute allowedRoles={['counsellor']}>
                        <CounsellorDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="counsellor/notes" element={
                      <ProtectedRoute allowedRoles={['counsellor']}>
                        <CounsellorDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="chat" element={
                      <ProtectedRoute allowedRoles={['counsellor', 'student']}>
                        <ChatUI />
                      </ProtectedRoute>
                    } />

                    {/* ── Wellness Module ── */}
                    <Route path="wellness-dashboard" element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <WellnessDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="wellness" element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <WellnessCenter />
                      </ProtectedRoute>
                    } />
                    <Route path="wellness/history" element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <GoalHistory />
                      </ProtectedRoute>
                    } />
                    <Route path="mood" element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <MoodSupportAssistant />
                      </ProtectedRoute>
                    } />
                    <Route path="mood/history" element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <MoodHistory />
                      </ProtectedRoute>
                    } />
                    <Route path="resources" element={<ResourceLibrary />} />
                    <Route path="resources/:id" element={<ResourceDetail />} />
                    <Route path="saved" element={
                      <ProtectedRoute allowedRoles={['student']}>
                        <SavedResources />
                      </ProtectedRoute>
                    } />

                    {/* ── Wellness Admin ── */}
                    <Route path="admin-dashboard" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <WellnessAdminDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="admin/resources" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminResourceList />
                      </ProtectedRoute>
                    } />
                    <Route path="admin/resources/add" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminAddResource />
                      </ProtectedRoute>
                    } />
                    <Route path="admin/resources/edit/:id" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminEditResource />
                      </ProtectedRoute>
                    } />

                    {/* ── New Admin & Settings (Merged) ── */}
                    <Route path="admin-users" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <UserManagement />
                      </ProtectedRoute>
                    } />
                    <Route path="admin-logs" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <PlatformLogs />
                      </ProtectedRoute>
                    } />
                    <Route path="admin-analytics" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <SystemAnalytics />
                      </ProtectedRoute>
                    } />
                    <Route path="system-config" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <SystemConfig />
                      </ProtectedRoute>
                    } />
                    <Route path="settings" element={<Settings />} />

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
