// frontend/src/components/Layout.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  Layers, 
  Package, 
  FileText, 
  ShoppingCart, 
  LogOut, 
  User, 
  Menu, 
  X, 
  Activity,
  Layers2,
  Users,
  UserCircle,
  UserCircle2,
  Truck
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout, apiFetch, isMock, toggleDevMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  // Navigation Links based on User Role
  const navLinks = isAdmin 
    ? [
        { path: '/admin/categories', label: 'Main Categories', icon: Layers },
        { path: '/admin/products', label: 'Product Catalog', icon: Package },
        { path: '/admin/quotes', label: 'Quote Requests', icon: FileText },
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/profile', label: 'My Profile', icon: UserCircle2 },
      ]
    : [
        { path: '/quote', label: 'Product Catalog', icon: ShoppingCart },
        { path: '/customer/orders', label: 'Track Orders', icon: Truck },
        { path: '/profile', label: 'My Profile', icon: UserCircle },
      ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Banner for Mock mode */}
      {isMock && (
        <div className="bg-gradient-to-r from-amber-600/30 to-copper-600/30 border-b border-copper-500/20 py-1.5 px-4 text-center text-xs font-medium text-amber-300 flex items-center justify-center gap-2">
          <span>⚠️ Running in Developer Mode (Mock Auth & SQLite DB Active)</span>
          <button 
            onClick={toggleDevMode}
            className="underline hover:text-white transition cursor-pointer"
          >
            Switch to production Firebase
          </button>
        </div>
      )}

      {/* Main Header / Navigation */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-copper-600 flex items-center justify-center shadow-lg shadow-copper-900/30">
                <Layers2 className="w-6 h-6 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-wider text-gradient-copper">BSEMETALS</span>
                <span className="text-[10px] block text-slate-400 font-medium tracking-widest uppercase">Pricing Suite</span>
              </div>
            </div>

            {/* Desktop Nav Ticker & Links */}
            <div className="hidden md:flex items-center gap-8">
              
              {/* Links */}
              <nav className="flex items-center gap-1.5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-copper-500/10 text-copper-400 border border-copper-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Profile & Logout Desktop */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-3 pr-3 border-r border-slate-900">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-left">
                  <span className="text-xs block font-semibold text-slate-200 max-w-[120px] truncate">{user?.name}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block uppercase tracking-wider ${
                    isAdmin ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' : 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                  }`}>
                    {user?.role}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 p-2.5 rounded-xl transition duration-200 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="text-slate-300 hover:text-white p-1 bg-slate-900 border border-slate-800 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-900 bg-slate-950/95 py-4 px-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-900">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <span className="text-sm block font-bold text-slate-200">{user?.name}</span>
                <span className="text-xs block text-slate-400 truncate">{user?.email}</span>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-copper-500/10 text-copper-400 border border-copper-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full mt-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 py-3 rounded-xl text-sm font-semibold hover:bg-rose-500/25 transition duration-200 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Main Body Children Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} BSEMetals Pvt Ltd. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            Pricing Platform v1.0.0
          </span>
        </div>
      </footer>
    </div>
  );
}
