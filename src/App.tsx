import React, { useState, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

// Import pages
import LandingPage from './components/pages/LandingPage';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import StudentDashboard from './components/pages/student/StudentDashboard';
import StudentProfile from './components/pages/student/StudentProfile';
import ProgramRecommendations from './components/pages/student/ProgramRecommendations';
import SearchPrograms from './components/pages/student/SearchPrograms';
import ProgramDetail from './components/pages/student/ProgramDetail';
import SavedPrograms from './components/pages/student/SavedPrograms';
import RecommendationHistory from './components/pages/student/RecommendationHistory';
import StudentHelp from './components/pages/student/StudentHelp';
import AccountSettings from './components/pages/student/AccountSettings';
import AdminLogin from './components/pages/admin/AdminLogin';
import AdminDashboard from './components/pages/admin/AdminDashboard';
import ProgramManagement from './components/pages/admin/ProgramManagement';
import UserManagement from './components/pages/admin/UserManagement';
import ContentManagement from './components/pages/admin/ContentManagement';

// Context for authentication
interface AuthContextType {
  user: { id: string; role: 'student' | 'admin'; name: string } | null;
  login: (role: 'student' | 'admin', userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

function App() {
  const [user, setUser] = useState<{ id: string; role: 'student' | 'admin'; name: string } | null>(null);

  const login = (role: 'student' | 'admin', userData: any) => {
    setUser({
      id: userData.id || '1',
      role,
      name: userData.name || (role === 'admin' ? 'Admin User' : 'John Doe'),
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ user, login, logout }}>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-base">
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Student Routes */}
            <Route path="/student/*" element={
              user?.role === 'student' ? <StudentRoutes /> : <Navigate to="/login" />
            } />

            {/* Admin Routes */}
            <Route path="/admin/*" element={
              user?.role === 'admin' ? <AdminRoutes /> : <Navigate to="/admin/login" />
            } />

            {/* Redirect based on user role */}
            <Route path="/dashboard" element={
              user?.role === 'student' ? <Navigate to="/student/dashboard" /> :
              user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> :
              <Navigate to="/" />
            } />

            {/* Catch-all route for undefined paths */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </div>
        </Router>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}

function StudentRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/profile" element={<StudentProfile />} />
      <Route path="/recommendations" element={<ProgramRecommendations />} />
      <Route path="/search" element={<SearchPrograms />} />
      <Route path="/program/:id" element={<ProgramDetail />} />
      <Route path="/saved" element={<SavedPrograms />} />
      <Route path="/history" element={<RecommendationHistory />} />
      <Route path="/help" element={<StudentHelp />} />
      <Route path="/settings" element={<AccountSettings />} />
      <Route path="/" element={<Navigate to="/student/dashboard" />} />
      <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
    </Routes>
  );
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/programs" element={<ProgramManagement />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/content" element={<ContentManagement />} />
      <Route path="/" element={<Navigate to="/admin/dashboard" />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

export default App;