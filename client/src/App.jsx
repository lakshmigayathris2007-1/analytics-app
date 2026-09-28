import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CircularProgress, Box } from '@mui/material';
import { loadMe } from './features/authSlice';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Import from './pages/Import';
import Reports from './pages/Reports';
import Users from './pages/Users';

function Protected({ roles, children }) {
  const { token, user } = useSelector(s => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (!user) return <Box sx={{ display: 'grid', placeItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector(s => s.auth);
  useEffect(() => { if (token && !user) dispatch(loadMe()); }, [token, user, dispatch]);
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" /> : <Auth mode="login" />} />
      <Route path="/register" element={token ? <Navigate to="/" /> : <Auth mode="register" />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/import" element={<Protected roles={['admin', 'analyst']}><Import /></Protected>} />
        <Route path="/users" element={<Protected roles={['admin']}><Users /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
