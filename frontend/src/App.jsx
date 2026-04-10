import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminBranches from './pages/admin/Branches';
import AdminSubjects from './pages/admin/Subjects';

// Faculty Pages
import FacultyDashboard from './pages/faculty/Dashboard';
import FacultyReports from './pages/faculty/Reports';
import FacultyQRGenerator from './pages/faculty/QRGenerator';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentScan from './pages/student/Scan';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return (
    <div className="app-container animate-fade-in">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

const App = () => {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to={`/${user.role}`} /> : <Login />} 
        />

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/branches" element={<AdminBranches />} />
          <Route path="/admin/subjects" element={<AdminSubjects />} />
        </Route>

        {/* Faculty Routes */}
        <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
          <Route path="/faculty" element={<FacultyDashboard />} />
          <Route path="/faculty/reports" element={<FacultyReports />} />
          <Route path="/faculty/qr-generator" element={<FacultyQRGenerator />} />
        </Route>

        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/scan" element={<StudentScan />} />
        </Route>

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
