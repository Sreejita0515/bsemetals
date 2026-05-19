// frontend/src/pages/admin/Users.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users as UsersIcon, UserPlus, Building2, Loader2, X, Shield, KeyRound, Mail, Lock, User, BadgeCheck } from 'lucide-react';

export default function Users() {
  const { apiFetch } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    companyName: '',
    gstin: '',
    adminSecretKey: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/users');
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'customer', companyName: '', gstin: '', adminSecretKey: '' });
    setSubmitError('');
    setSubmitSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      await apiFetch('/api/users/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setSubmitSuccess(`Account for ${formData.name} created successfully!`);
      resetForm();
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setSubmitError(err.message || 'Failed to register user');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-200 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all duration-200 placeholder:text-slate-600";
  const labelClass = "block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-amber-500" />
            User Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage customer and admin accounts.</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); resetForm(); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all duration-200 shadow-lg shadow-amber-900/30"
        >
          {showForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Register New User'}
        </button>
      </div>

      {/* Success Banner */}
      {submitSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium flex items-center gap-3">
          <BadgeCheck className="w-5 h-5 flex-shrink-0" />
          {submitSuccess}
        </div>
      )}

      {/* Registration Form */}
      {showForm && (
        <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl p-6 max-w-2xl">
          <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-500" />
            Register New Account
          </h2>

          {submitError && (
            <div className="mb-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Toggle */}
            <div className="flex gap-3 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'customer', adminSecretKey: '' })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  formData.role === 'customer'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <User className="w-4 h-4" /> Customer
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'admin' })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  formData.role === 'admin'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Shield className="w-4 h-4" /> Administrator
              </button>
            </div>

            {/* Name + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> Full Name *</span>
                </label>
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="e.g. Rajesh Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email Address *</span>
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="e.g. rajesh@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Password *</span>
              </label>
              <input
                required
                type="password"
                name="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Company Name + GSTIN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Company Name *</span>
                </label>
                <input
                  required
                  type="text"
                  name="companyName"
                  placeholder="e.g. Alpha Electricals Pvt Ltd"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>GSTIN *</label>
                <input
                  required
                  type="text"
                  name="gstin"
                  placeholder="e.g. 22AAAAA0000A1Z5"
                  value={formData.gstin}
                  onChange={handleChange}
                  className={inputClass}
                  maxLength={15}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>

            {/* Admin Secret Key (only for admin role) */}
            {formData.role === 'admin' && (
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <label className={labelClass}>
                  <span className="flex items-center gap-1.5 text-amber-400"><KeyRound className="w-3 h-3" /> Admin Secret Key *</span>
                </label>
                <input
                  required
                  type="password"
                  name="adminSecretKey"
                  placeholder="Enter the admin authorization key"
                  value={formData.adminSecretKey}
                  onChange={handleChange}
                  className={inputClass + ' border-amber-500/30'}
                />
                <p className="text-xs text-amber-500/70 mt-1.5">Required to authorize new administrator accounts.</p>
              </div>
            )}

            {/* Submit */}
            <div className="pt-2 flex justify-end">
              <button
                disabled={submitting}
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold text-sm transition-all duration-200 shadow-lg shadow-amber-900/30"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {submitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-300">All Registered Users</span>
          <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">{users.length} total</span>
        </div>

        {error && <div className="p-4 text-rose-400 text-sm">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800">
                <th className="py-3.5 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="py-3.5 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="py-3.5 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Company</th>
                <th className="py-3.5 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">GSTIN</th>
                <th className="py-3.5 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-slate-500">No users registered yet.</td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.uid} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-slate-200">{u.name}</td>
                    <td className="py-4 px-6 text-sm text-slate-400">{u.email}</td>
                    <td className="py-4 px-6 text-sm text-slate-400">
                      {u.companyName ? (
                        <span className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-amber-500" />
                          {u.companyName}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-400 font-mono">
                      {u.gstin || '-'}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
