import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createAppTheme } from './theme';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRegistration from './pages/AdminRegistration';
import AdminDashboard from './pages/AdminDashboard';
import VerificationPending from './pages/VerificationPending';
import Dashboard from './pages/Dashboard';
import ProductTracking from './pages/ProductTracking';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import CreateAdmin from './pages/CreateAdmin';
import ProductDetails from './pages/ProductDetails';
import ProductTimeline from './pages/ProductTimeline';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  
  // Check if user is logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if user has required role
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }
  
  // Redirect unverified business users to pending page
  if (user.role !== 'admin' && 
      ['manufacturer', 'supplier', 'distributor'].includes(user.role) && 
      user.verificationStatus === 'pending') {
    return <Navigate to="/verification-pending" />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { user, darkMode } = useAuth();
  
  // Create theme based on dark mode preference
  const theme = useMemo(() => createAppTheme(darkMode), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-admin" element={<CreateAdmin />} />
        <Route path="/verification-pending" element={<VerificationPending />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products/track" element={<ProductTracking />} />
          <Route path="products" element={<Products />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="products/:id/timeline" element={<ProductTimeline />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="settings" element={<Settings />} />
          {/* Removed quality-dashboard route as it's no longer needed */}
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute requiredRole="admin">
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminRegistration />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
