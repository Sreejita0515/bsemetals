// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Rates from './pages/admin/Rates';
import Categories from './pages/admin/Categories';
import Products from './pages/admin/Products';
import Quotes from './pages/admin/Quotes';
import QuoteCatalog from './pages/customer/QuoteCatalog';
import QuoteSummary from './pages/customer/QuoteSummary';

function AppRoutes() {
  return (
    <Routes>
      {/* Shared Auth Route */}
      <Route path="/login" element={<Login />} />

      {/* Admin Dashboard Protected Routes */}
      <Route 
        path="/admin/rates" 
        element={
          <ProtectedRoute requiredRole="admin">
            <Layout>
              <Rates />
            </Layout>
          </ProtectedRoute>
        } 
      />
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
