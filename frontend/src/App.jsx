// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Categories from './pages/admin/Categories';
import Products from './pages/admin/Products';
import Quotes from './pages/admin/Quotes';
import Users from './pages/admin/Users';
import AdminProfile from './pages/admin/AdminProfile';
import QuoteCatalog from './pages/customer/QuoteCatalog';
import QuoteSummary from './pages/customer/QuoteSummary';
import OrderTracking from './pages/customer/OrderTracking';
import Profile from './pages/customer/Profile';

function AppRoutes() {
  return (
    <Routes>
      {/* Shared Auth Route */}
      <Route path="/login" element={<Login initialType="customer" />} />
      <Route path="/admin/login" element={<Login initialType="admin" />} />
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

      {/* Admin Dashboard Protected Routes */}
      <Route 
        path="/admin/categories" 
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <Categories />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/products" 
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <Products />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/quotes" 
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <Quotes />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <Users />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/profile" 
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <AdminProfile />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Customer Protected Routes */}
      <Route 
        path="/quote" 
        element={
          <ProtectedRoute requiredRole="customer">
            <Layout>
              <QuoteCatalog />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/quote/summary" 
        element={
          <ProtectedRoute requiredRole="customer">
            <Layout>
              <QuoteSummary />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/customer/orders" 
        element={
          <ProtectedRoute requiredRole="customer">
            <Layout>
              <OrderTracking />
            </Layout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute requiredRole="customer">
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* Fallback Catch All - Redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
