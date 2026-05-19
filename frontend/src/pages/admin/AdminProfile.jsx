// frontend/src/pages/admin/AdminProfile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck, Building2, MapPin, Phone, Mail, FileText,
  Loader2, BadgeCheck, User
} from 'lucide-react';

export default function AdminProfile() {
  const { apiFetch, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiFetch('/api/users/profile');
        setProfile(data);
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
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
      <div className="flex items-start gap-3 py-3.5 border-b border-slate-800/60 last:border-0">
        <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="text-sm font-semibold text-slate-200 mt-0.5 break-all">{value}</p>
        </div>
      </div>
    ) : null
  );

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-amber-500" />
          Admin Profile
        </h1>
        <p className="text-sm text-slate-400 mt-1">Your administrator account details visible to customers.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center gap-4 bg-slate-900/40">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <p className="font-bold text-lg text-slate-100">{profile?.name || user?.name || 'Administrator'}</p>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
              <BadgeCheck className="w-3 h-3" /> Administrator
            </span>
          </div>
        </div>

        {/* Info Rows */}
        <div className="px-6 py-2">
          <InfoRow icon={Mail} label="Email Address" value={profile?.email || user?.email} />
          <InfoRow icon={Phone} label="Phone Number" value={profile?.phone} />
          <InfoRow icon={Building2} label="Company Name" value={profile?.companyName} />
          <InfoRow icon={MapPin} label="Company Address" value={profile?.companyAddress} />
          <InfoRow icon={FileText} label="GSTIN" value={profile?.gstin} />
        </div>
      </div>

      {/* Info box */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-400/80 text-xs font-medium flex items-start gap-2">
        <User className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>This information is visible to customers on their profile page so they can contact BSEMetals for queries, invoices, or support.</p>
      </div>
    </div>
  );
}
