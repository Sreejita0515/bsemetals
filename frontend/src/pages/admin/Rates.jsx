// frontend/src/pages/admin/Rates.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, 
  ArrowUpRight, 
  Calendar, 
  IndianRupee, 
  History, 
  Loader2, 
  CheckCircle2, 
  Edit3 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function Rates() {
  const { apiFetch } = useAuth();
  const [rates, setRates] = useState([]);
  const [todayRate, setTodayRate] = useState(null);
  const [inputRate, setInputRate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchRates = async () => {
    try {
      const data = await apiFetch('/api/rates');
      setRates(data.history);
      if (data.todayRate) {
        setTodayRate(data.todayRate);
        setInputRate(data.todayRate.ratePerKg.toString());
      } else {
        setTodayRate(null);
        setInputRate('');
      }
    } catch (err) {
      console.error('Rates fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleSetRate = async (e) => {
    e.preventDefault();
    if (!inputRate || isNaN(parseFloat(inputRate)) || parseFloat(inputRate) <= 0) {
      setFeedback({ type: 'error', message: 'Please enter a valid positive number.' });
      return;
    }

    setSubmitLoading(true);
    setFeedback(null);
    try {
      const response = await apiFetch('/api/rates', {
        method: 'POST',
        body: JSON.stringify({ ratePerKg: parseFloat(inputRate) }),
      });
      setFeedback({ type: 'success', message: response.message });
      await fetchRates();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update LME rate.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-copper-500 animate-spin" />
      </div>
    );
  }

  // Format historical rates for recharts
  const chartData = rates.map(r => ({
    name: new Date(r.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    price: r.ratePerKg
  }));

  return (
    <div className="space-y-8">
      
      {/* Page Title & Intro */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
          <TrendingUp className="w-8 h-8 text-copper-500" />
          LME Copper Rates
        </h1>
        <p className="text-slate-400 text-sm mt-1.5">
          Set the active daily market rate (₹/kg) and track copper price fluctuations over time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Set Rate Controller (Left Panel) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border-slate-800 relative overflow-hidden">
            
            {/* Tiny accent decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-copper-500/5 blur-xl"></div>
            
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-copper-500" />
              Update Base Rate
            </h2>

            {feedback && (
              <div className={`p-4 rounded-xl text-xs font-semibold mb-5 border ${
                feedback.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                {feedback.message}
              </div>
            )}

            {/* Active Display Badge */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 mb-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                  Today's Active Rate
                </span>
                <span className="text-2xl font-extrabold text-emerald-400 tracking-tight mt-1 block">
                  {todayRate ? `₹${todayRate.ratePerKg.toFixed(2)}` : 'Not Set'}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>

            <form onSubmit={handleSetRate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  LME COPPER RATE (₹ / KG)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={inputRate}
                    onChange={(e) => setInputRate(e.target.value)}
                    placeholder="750.00"
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-copper-500 rounded-xl py-3 pl-8 pr-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full btn-copper py-3 font-semibold cursor-pointer"
              >
                {submitLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Confirm & Publish
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Recharts Area Curve (Right Panel) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border-slate-800">
            <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-copper-500" />
              7-Day Pricing History
            </h2>

            {chartData.length > 0 ? (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCopper" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ea8416" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ea8416" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickLine={false} 
                      domain={['auto', 'auto']} 
                      tickFormatter={(v) => `₹${v}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#fbbf24', fontSize: '13px', fontWeight: 'bold' }}
                      formatter={(v) => [`₹${parseFloat(v).toFixed(2)}/kg`, 'LME Price']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#ea8416" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorCopper)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-slate-500 text-sm">
                No historical rate records available.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Historical Ledger Table */}
      <div className="glass-panel rounded-2xl p-6 border-slate-800">
        <h2 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
          <History className="w-5 h-5 text-copper-500" />
          LME History Log
        </h2>

        <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950">
          <table className="min-w-full divide-y divide-slate-900 text-left text-sm">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Effective Date</th>
                <th className="px-6 py-4">Rate (₹ / kg)</th>
                <th className="px-6 py-4">Recorded By</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {rates.slice().reverse().map((rate) => (
                <tr key={rate.id} className="hover:bg-slate-900/30 transition">
                  <td className="px-6 py-4 font-bold text-slate-200">
                    {new Date(rate.date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-emerald-400 font-extrabold text-base">
                    ₹{rate.ratePerKg.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs font-mono">
                    {rate.createdBy}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(rate.createdAt).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
              {rates.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-slate-500">
                    No LME Rate logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
