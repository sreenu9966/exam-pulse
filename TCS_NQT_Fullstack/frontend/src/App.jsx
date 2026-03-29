import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './features/user/LandingPage';
import LoginPage from './features/user/LoginPage';
import HomePage from './features/user/HomePage';
import ExamPage from './features/user/ExamPage';
import ResultsPage from './features/user/ResultsPage';
import AdminLogin from './features/admin/AdminLogin';
import AdminDashboard from './features/admin/AdminDashboard';
import Navbar from './components/Navbar';
import SupportWidget from './components/SupportWidget';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading" style={{color:'#e8eaf0'}}>Loading...</div>;
  return user ? children : <Navigate to="/" />;
}

function AdminRoute({ children }) {
  return sessionStorage.getItem('admin_token') ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage initialView="home" />} />
          <Route path="/login" element={<LandingPage initialView="login" />} />
          <Route path="/pricing" element={<LandingPage initialView="pricing" />} />
          <Route path="/user/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/user/exam" element={<ProtectedRoute><ExamPage /></ProtectedRoute>} />
          <Route path="/user/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <SupportWidget />
      </BrowserRouter>
    </AuthProvider>
  );
}
