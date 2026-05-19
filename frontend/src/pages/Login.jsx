// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Loader2, ShieldCheck, UserCheck, Layers2, ArrowRight } from 'lucide-react';

export default function Login({ initialType = 'customer' }) {
  const { login, signup, isMock, toggleDevMode } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loginType, setLoginType] = useState(initialType);
  const [adminSecret, setAdminSecret] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in email and password.');
      return;
    }
    
    if (!isLogin && loginType === 'customer' && !name) {
      setError('Please fill in your name for registration.');
      return;
    }

    if (loginType === 'admin' && !adminSecret) {
      setError('Admin secret key is required.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const loggedUser = isLogin 
        ? await login(email, password, loginType, adminSecret) 
        : await signup({ email, password, name, phone, companyName, companyAddress, gstin }, loginType, adminSecret);
      // Role redirection
      if (loggedUser.role === 'admin') {
        navigate('/admin/categories');
      } else {
        navigate('/quote');
      }
    } catch (err) {
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Mock Developer Quick Login triggers
  const handleQuickLogin = async (role) => {
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login('demo@bsemetals.com', 'demopass', role);
      if (loggedUser.role === 'admin') {
        navigate('/admin/categories');
      } else {
        navigate('/quote');
      }
    } catch (err) {
      setError('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center relative px-4 overflow-hidden">
      
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-copper-600/10 blur-[120px] animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: '-4s' }}></div>

      {/* Main Glassmorphic Wrapper */}
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 shadow-2xl relative z-10 border-slate-800">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-copper-600 items-center justify-center shadow-lg shadow-copper-900/40 mb-3.5">
            <Layers2 className="w-8 h-8 text-slate-950 stroke-[2.5]" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gradient-copper">BSEMETALS</h2>
          <p className="text-xs text-slate-400 font-semibold tracking-widest uppercase mt-1">COPPER PRICING ENGINE</p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
            {error}
          </div>
        )}

        {/* Customer / Admin Toggle */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => setLoginType('customer')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-200 cursor-pointer ${
              loginType === 'customer' ? 'bg-copper-600 text-white shadow-lg shadow-copper-900/40' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Customer
          </button>
          <button
            type="button"
            onClick={() => setLoginType('admin')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-200 cursor-pointer ${
              loginType === 'admin' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Full Name *</label>
                <div className="relative">
                  <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rajesh Patel"
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-copper-500 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Alpha Electricals"
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-copper-500 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">GSTIN *</label>
                  <input
                    type="text"
                    required
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    placeholder="22AAAAA0000A1Z5"
                    maxLength={15}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-copper-500 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Company Address</label>
                <input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="123 Industrial Area, Mumbai"
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-copper-500 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition duration-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-copper-500 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition duration-200"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-copper-500 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-copper-500 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition duration-200"
              />
            </div>
          </div>

          {loginType === 'admin' && (
            <div>
              <label className="block text-xs font-semibold text-amber-500 uppercase tracking-widest mb-2">Secret Admin Key</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-amber-500/70" />
                <input
                  type="password"
                  required
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  placeholder="Enter admin secret key..."
                  className="w-full bg-slate-950 border border-amber-500/30 hover:border-amber-500/60 focus:border-amber-500 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition duration-200"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-copper py-3.5 mt-2 cursor-pointer font-bold"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Sign Up'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-copper-500 hover:text-copper-400 font-bold transition underline cursor-pointer"
          >
            {isLogin ? 'Register now' : 'Sign In here'}
          </button>
        </div>

        {/* Dev Mode toggle footer */}
        <div className="mt-6 text-center">
          <button
            onClick={toggleDevMode}
            className="text-[10px] text-slate-500 hover:text-slate-400 underline font-semibold transition"
          >
            {isMock ? 'Connect to Production Firebase SDK' : 'Enable Developer Mock Offline Mode'}
          </button>
        </div>

      </div>
    </div>
  );
}
