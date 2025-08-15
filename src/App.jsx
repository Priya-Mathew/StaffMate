import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Login from './pages/Login';
import Signup from './pages/Signup';
import HRDashboard from './pages/HRDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';

function App() {
  const auth = useSelector(state => state.auth);

  // RequireAuth wrapper
  const RequireAuth = ({ children, allowedRoles }) => {
    if (!auth.token) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(auth.role)) return <Navigate to="/login" replace />;
    return children;
  };

  // Wrapper to pass location state to EmployeeDashboard
  const EmployeeWrapper = () => {
    const location = useLocation();
    return (
      <RequireAuth allowedRoles={['Employee']}>
        <EmployeeDashboard openProfile={location.state?.openProfile || false} />
      </RequireAuth>
    );
  };

  return (
    <Router>
      <Routes>
        {/* Login page */}
        <Route path="/login" element={<Login />} />
         <Route path="/signup" element={<Signup />} /> 
        {/* HR Dashboard */}
        <Route
          path="/hr"
          element={
            <RequireAuth allowedRoles={['HR']}>
              <HRDashboard />
            </RequireAuth>
          }
        />

        {/* Employee Dashboard */}
        <Route
          path="/employee"
          element={<EmployeeWrapper />}
        />

        {/* Catch-all redirects to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
