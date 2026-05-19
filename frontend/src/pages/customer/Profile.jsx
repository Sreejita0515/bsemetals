// frontend/src/pages/customer/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User, Building2, MapPin, Phone, Mail, BadgeCheck,
  Loader2, FileText, ShieldCheck
} from 'lucide-react';

export default function Profile() {
  const { apiFetch, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    companyName: '',
    companyAddress: '',
    gstin: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch this customer's profile (might fail if they registered when DB was broken)
        const profileData = await apiFetch('/api/users/profile');
        setProfile(profileData);
        if (profileData) {
          setEditForm({
            name: profileData.name || user?.name || '',
            phone: profileData.phone || '',
            companyName: profileData.companyName || '',
            companyAddress: profileData.companyAddress || '',
            gstin: profileData.gstin || ''
          });
        }
      } catch (err) {
        console.warn('Profile fetch warning (this is fine if user has no extended profile):', err.message);
      }

      try {
        // Fetch admin/company contact info
        const adminData = await apiFetch('/api/users/admin-info');
        setAdminInfo(adminData);
      } catch (err) {
        console.error('Admin info fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const InfoRow = ({ icon: Icon, label, value }) => (
    value ? (
      <div className="flex items-start gap-3 py-3 border-b border-slate-800/60 last:border-0">
        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5">{value}</p>
        </div>
      </div>
    ) : null
  );

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedProfile = await apiFetch('/api/users/profile', {
        method: 'POST',
        body: JSON.stringify({
          name: editForm.name,
          email: profile?.email || user?.email,
          phone: editForm.phone,
          companyName: editForm.companyName,
          companyAddress: editForm.companyAddress,
          gstin: editForm.gstin,
          role: profile?.role || user?.role || 'customer'
        })
      });
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <User className="w-7 h-7 text-amber-500" />
          My Profile
        </h1>
        <p className="text-sm text-slate-400 mt-1">Your account information and BSEMetals contact details.</p>
      </div>

      {/* My Details Card */}
      <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="font-bold text-slate-200">{profile?.name || user?.name || 'Customer'}</p>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                Customer Account
              </span>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-bold text-slate-100 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Full Name (Real Name)</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-amber-500 rounded-xl py-2 px-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-amber-500 rounded-xl py-2 px-4 text-sm text-slate-100 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">GSTIN</label>
                <input
                  type="text"
                  value={editForm.gstin}
                  onChange={(e) => setEditForm({...editForm, gstin: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-amber-500 rounded-xl py-2 px-4 text-sm text-slate-100 outline-none transition uppercase"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Company Name</label>
              <input
                type="text"
                value={editForm.companyName}
                onChange={(e) => setEditForm({...editForm, companyName: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-amber-500 rounded-xl py-2 px-4 text-sm text-slate-100 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Company Address</label>
              <textarea
                value={editForm.companyAddress}
                onChange={(e) => setEditForm({...editForm, companyAddress: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-amber-500 rounded-xl py-2 px-4 text-sm text-slate-100 outline-none transition resize-none"
                rows="2"
              ></textarea>
            </div>
            
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition cursor-pointer"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 text-sm font-bold text-amber-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-2">
            <InfoRow icon={Mail} label="Email Address" value={profile?.email || user?.email} />
            <InfoRow icon={Phone} label="Phone Number" value={profile?.phone} />
            <InfoRow icon={Building2} label="Company Name" value={profile?.companyName} />
            <InfoRow icon={MapPin} label="Company Address" value={profile?.companyAddress} />
            <InfoRow icon={FileText} label="GSTIN" value={profile?.gstin} />
          </div>
        )}
      </div>

      {/* BSEMetals Company / Admin Contact Card */}
      <div className="bg-slate-900/60 backdrop-blur border border-amber-500/20 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-amber-500/10 flex items-center gap-3 bg-amber-500/5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="font-bold text-amber-300">BSEMetals — Seller Contact</p>
            <p className="text-xs text-slate-400">Reach out for queries, invoices, or support</p>
          </div>
        </div>
        <div className="px-6 py-2">
          {adminInfo ? (
            <>
              <InfoRow icon={User} label="Contact Person" value={adminInfo.name} />
              <InfoRow icon={Mail} label="Email Address" value={adminInfo.email} />
              <InfoRow icon={Phone} label="Phone Number" value={adminInfo.phone} />
              <InfoRow icon={Building2} label="Company Name" value={adminInfo.companyName} />
              <InfoRow icon={MapPin} label="Company Address" value={adminInfo.companyAddress} />
              <InfoRow icon={BadgeCheck} label="GSTIN" value={adminInfo.gstin} />
            </>
          ) : (
            <div className="py-8 text-center text-slate-500 text-sm">
              Admin contact details not available. Please contact your administrator.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
