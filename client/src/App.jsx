import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';

import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import GrievancesPage from './pages/GrievancesPage.jsx';
import CreateGrievancePage from './pages/CreateGrievancePage.jsx';
import GrievanceDetailPage from './pages/GrievanceDetailPage.jsx';



import ResourcesPage from './pages/ResourcesPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

import StoriesPage from './pages/StoriesPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import AdminGrievancesPage from './pages/admin/AdminGrievancesPage.jsx';

import ProfilePage from './pages/ProfilePage.jsx';
import AdminSettingsPage from './pages/admin/AdminSettingsPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';

import LandingPage from './pages/LandingPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import AllIssuesPage from './pages/AllIssuesPage.jsx';
import MessagesPage from './pages/MessagesPage.jsx';
import AdminInboxPage from './pages/admin/AdminInboxPage.jsx';
import StudentInboxPage from './pages/StudentInboxPage.jsx';


const PlaceholderPage = ({ title }) => (
  <div className="p-8">
    <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">{title}</div>
    <div className="text-sm text-gray-400 mt-1">Coming in the next phase!</div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { fontSize: '13px', borderRadius: '10px' },
              }}
            />
            <Routes>
              {/* Public */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/all-issues" element={
                <ProtectedRoute requiredRole="Student">
                  <AllIssuesPage />
                </ProtectedRoute>
              } />
              <Route path="/all-issues/:id" element={
                <ProtectedRoute requiredRole="Student">
                  <GrievanceDetailPage />
                </ProtectedRoute>
              } />

              {/* Student routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute requiredRole="Student"><StudentDashboard /></ProtectedRoute>
              } />
              <Route path="/grievances" element={
                <ProtectedRoute requiredRole="Student"><GrievancesPage /></ProtectedRoute>
              } />
              <Route path="/grievances/new" element={
                <ProtectedRoute requiredRole="Student"><CreateGrievancePage /></ProtectedRoute>
              } />
              <Route path="/grievances/:id" element={
                <ProtectedRoute requiredRole="Student"><GrievanceDetailPage /></ProtectedRoute>
              } />
              <Route path="/resources" element={
                <ProtectedRoute requiredRole="Student"><ResourcesPage /></ProtectedRoute>
              } />
              <Route path="/stories" element={
                <ProtectedRoute requiredRole="Student"><StoriesPage /></ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute requiredRole="Student">
                  <NotificationsPage />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute requiredRole="Student"><AnalyticsPage /></ProtectedRoute>
              } />
              <Route path="/messages/:grievanceId" element={
                <ProtectedRoute requiredRole="Student">
                  <MessagesPage />
                </ProtectedRoute>
              } />
              {/* Student messages inbox */}
              <Route path="/messages" element={
                <ProtectedRoute requiredRole="Student">
                  <StudentInboxPage />
                </ProtectedRoute>
              } />

              {/* Student private message chat */}
              <Route path="/messages/:grievanceId" element={
                <ProtectedRoute requiredRole="Student">
                  <MessagesPage />
                </ProtectedRoute>
              } />

              {/* Student profile */}
              <Route path="/profile" element={
                <ProtectedRoute requiredRole="Student">
                  <ProfilePage />
                </ProtectedRoute>
              } />

              {/* Admin routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="Admin"><AdminDashboard /></ProtectedRoute>
              } />
              <Route path="/admin/grievances" element={
                <ProtectedRoute requiredRole="Admin"><AdminGrievancesPage /></ProtectedRoute>
              } />
              <Route path="/admin/grievances/:id" element={
                <ProtectedRoute requiredRole="Admin"><GrievanceDetailPage /></ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute requiredRole="Admin"><AnalyticsPage /></ProtectedRoute>
              } />
              <Route path="/admin/inbox" element={
                <ProtectedRoute requiredRole="Admin">
                  <AdminInboxPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/messages/:grievanceId" element={
                <ProtectedRoute requiredRole="Admin">
                  <MessagesPage />
                </ProtectedRoute>
              } />
              {/* Admin users */}
              <Route path="/admin/users" element={
                <ProtectedRoute requiredRole="Admin">
                  <AdminUsersPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/resources" element={
                <ProtectedRoute requiredRole="Admin"><ResourcesPage /></ProtectedRoute>
              } />
              <Route path="/admin/stories" element={
                <ProtectedRoute requiredRole="Admin"><StoriesPage /></ProtectedRoute>
              } />


              <Route path="/admin/notifications" element={
                <ProtectedRoute requiredRole="Admin">
                  <NotificationsPage />
                </ProtectedRoute>
              } />


              {/* Admin settings */}
              <Route path="/admin/settings" element={
                <ProtectedRoute requiredRole="Admin">
                  <AdminSettingsPage />
                </ProtectedRoute>
              } />

              <Route path="/" element={<LandingPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;