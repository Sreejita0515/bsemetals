// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-sans">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-copper-500 animate-spin"></div>
          <Loader2 className="w-6 h-6 text-copper-500 animate-pulse absolute" />
        </div>
        <span className="mt-4 text-xs font-semibold text-slate-400 tracking-widest uppercase animate-pulse">
          Validating Security...
        </span>
      </div>
    );
  }

  // 1. Unauthenticated check
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Authorized check
  if (requiredRole && user.role !== requiredRole) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/products" replace />;
    } else {
      return <Navigate to="/quote" replace />;
    }
  }

  return children;
}
