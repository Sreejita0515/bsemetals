// frontend/src/pages/admin/Quotes.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  User, 
  Briefcase, 
  Phone, 
  Mail, 
  Calendar, 
  Check, 
  Send, 
  Clock, 
  Loader2, 
  Layers, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  IndianRupee,
  Search,
  Upload,
  FileCheck
} from 'lucide-react';

export default function Quotes() {
  const { apiFetch } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, SENT, ACCEPTED
  const [searchQuery, setSearchQuery] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(null);
  const [uploading, setUploading] = useState(null);

  const fetchQuotes = async () => {
    try {
      const data = await apiFetch('/api/quotes');
      setQuotes(data);
    } catch (err) {
      console.error('Quotes fetch fail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleUpdateStatus = async (quoteId, newStatus) => {
    setStatusUpdateLoading(quoteId);
    try {
      await apiFetch(`/api/quotes/${quoteId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchQuotes();
    } catch (err) {
      alert(err.message || 'Failed to update quote status');
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  const handleUploadInvoice = async (quoteId, file) => {
    if (!file) return;
    setUploading(quoteId);
    
    const formData = new FormData();
    formData.append('invoice', file);

    try {
      // Must use native fetch because apiFetch currently stringifies bodies that are plain objects, 
      // but fetch handles FormData natively without Content-Type (it sets boundary).
      const token = localStorage.getItem('bsemetals_token');
      const response = await fetch(`http://localhost:5000/api/quotes/${quoteId}/invoice`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!response.ok) throw new Error('Failed to upload invoice');
      await fetchQuotes();
      alert('Invoice uploaded successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(null);
    }
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredQuotes = quotes.filter(q => {
    const matchesFilter = filter === 'ALL' || q.status === filter;
    if (!matchesFilter) return false;
    
    if (searchQuery.trim() !== '') {
      const qStr = searchQuery.toLowerCase();
      const num = q.orderNumber?.toLowerCase() || '';
      const cname = q.customerName?.toLowerCase() || '';
      const comp = q.company?.toLowerCase() || '';
      return num.includes(qStr) || cname.includes(qStr) || comp.includes(qStr);
    }
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            PENDING
          </span>
        );
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Send className="w-3.5 h-3.5" />
            SENT TO CLIENT
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Check className="w-3.5 h-3.5" />
            ACCEPTED
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-copper-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <FileText className="w-8 h-8 text-copper-500" />
            Quote Requests Ledger
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Review and adjust order statuses of client quote requests submitted from the product catalog.
          </p>
        </div>

        {/* State filters */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 self-start">
          {['ALL', 'PENDING', 'SENT', 'ACCEPTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                filter === status
                  ? 'bg-copper-600 text-white shadow shadow-copper-900/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search by Order ID, Customer Name, or Company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-copper-500 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
        />
      </div>

      {/* Quote ledger list */}
      <div className="space-y-4">
        {filteredQuotes.map((quote) => {
          const isExpanded = expandedId === quote.id;
          const totalVal = calculateTotal(quote.items);
          return (
            <div 
              key={quote.id} 
              className={`glass-panel rounded-2xl border transition duration-300 ${
                isExpanded ? 'border-copper-500/30 shadow-copper-glow-lg' : 'border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              
              {/* Expandable summary header */}
              <div 
                onClick={() => toggleExpand(quote.id)}
                className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 cursor-pointer select-none"
              >
                
                {/* Meta details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-300">
                      {quote.orderNumber || `Quote #${quote.id.slice(0, 8).toUpperCase()}`}
                    </span>
                    {getStatusBadge(quote.status)}
                  </div>
                  
                  <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2 mt-1">
                    {quote.company}
                  </h3>
                  <div className="flex items-center gap-4 text-slate-400 text-xs mt-1">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-500" /> {quote.customerName}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-500" /> {new Date(quote.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                {/* Subtotals & Quick statuses */}
                <div className="flex flex-wrap items-center gap-6">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Total Value</span>
                    <span className="text-xl font-black text-emerald-400 tracking-tight">₹{totalVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  {/* Expand toggle icon */}
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-slate-200">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>

              </div>

              {/* Collapsible detail content sheet */}
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-slate-900 pt-6 space-y-6 bg-slate-950/30 rounded-b-2xl">
                  
                  {/* Contact cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    <div className="bg-slate-950 p-4 border border-slate-900 rounded-xl space-y-2">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Client Representative</span>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                        <User className="w-4 h-4 text-copper-500" />
                        {quote.customerName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                        <Briefcase className="w-4 h-4 text-slate-500" />
                        {quote.company}
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 border border-slate-900 rounded-xl space-y-2">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Communication Channels</span>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                        <Phone className="w-4 h-4 text-copper-500" />
                        {quote.phone}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Mail className="w-4 h-4 text-slate-500" />
                        {quote.email}
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 border border-slate-900 rounded-xl space-y-2">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Corporate Profile</span>
                      <div className="flex items-start gap-2 text-xs font-semibold text-slate-200">
                        <span className="text-copper-500 font-bold mt-0.5">GSTIN:</span>
                        {quote.userProfile?.gstin || <span className="text-slate-600 italic">Not Provided</span>}
                      </div>
                      <div className="flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
                        <span className="text-slate-500 font-bold mt-0.5">ADDR:</span>
                        {quote.userProfile?.companyAddress || <span className="text-slate-600 italic">Not Provided</span>}
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 border border-slate-900 rounded-xl flex flex-col justify-between">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Update Status Action</span>
                      
                      {statusUpdateLoading === quote.id ? (
                        <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
                          <Loader2 className="w-4 h-4 animate-spin text-copper-500" />
                          Saving status...
                        </div>
                      ) : (
                        <div className="flex gap-2 mt-2">
                          {quote.status !== 'PENDING' && (
                            <button
                              onClick={() => handleUpdateStatus(quote.id, 'PENDING')}
                              className="px-2.5 py-1 text-[10px] font-bold bg-slate-900 border border-slate-800 hover:border-amber-500/20 hover:bg-amber-500/5 text-amber-500 rounded-lg transition cursor-pointer"
                            >
                              Move Pending
                            </button>
                          )}
                          {quote.status !== 'SENT' && (
                            <button
                              onClick={() => handleUpdateStatus(quote.id, 'SENT')}
                              className="px-2.5 py-1 text-[10px] font-bold bg-slate-900 border border-slate-800 hover:border-blue-500/20 hover:bg-blue-500/5 text-blue-400 rounded-lg transition cursor-pointer"
                            >
                              Mark Sent
                            </button>
                          )}
                          {quote.status !== 'ACCEPTED' && (
                            <button
                              onClick={() => handleUpdateStatus(quote.id, 'ACCEPTED')}
                              className="px-2.5 py-1 text-[10px] font-bold bg-slate-900 border border-slate-800 hover:border-emerald-500/20 hover:bg-emerald-500/5 text-emerald-400 rounded-lg transition cursor-pointer"
                            >
                              Accept Order
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Invoice Section */}
                    <div className="bg-slate-950 p-4 border border-slate-900 rounded-xl flex flex-col justify-between">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Invoice</span>
                      
                      {quote.invoiceUrl ? (
                        <a 
                          href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${quote.invoiceUrl}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition"
                        >
                          <FileCheck className="w-4 h-4" /> View Uploaded Invoice
                        </a>
                      ) : (
                        <div className="relative">
                          <input 
                            type="file" 
                            id={`invoice-upload-${quote.id}`}
                            className="hidden"
                            accept=".pdf,image/*"
                            onChange={(e) => handleUploadInvoice(quote.id, e.target.files[0])}
                          />
                          <label 
                            htmlFor={`invoice-upload-${quote.id}`}
                            className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold border rounded-lg transition cursor-pointer ${
                              uploading === quote.id 
                                ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-900 border-slate-800 hover:border-copper-500/40 text-slate-300 hover:text-copper-400'
                            }`}
                          >
                            {uploading === quote.id ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                            ) : (
                              <><Upload className="w-4 h-4" /> Upload Proper Invoice</>
                            )}
                          </label>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Itemized pricing breakdown table */}
                  <div className="border border-slate-900 rounded-xl overflow-hidden bg-slate-950">
                    <table className="min-w-full divide-y divide-slate-900 text-left text-xs">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-[9px] tracking-wider font-bold">
                        <tr>
                          <th className="px-5 py-3.5">Product Item</th>
                          <th className="px-5 py-3.5">Formula Category</th>
                          <th className="px-5 py-3.5 text-right">Snapshotted Rate (₹ / kg)</th>
                          <th className="px-5 py-3.5 text-right">Quantity Required</th>
                          <th className="px-5 py-3.5 text-right">Subtotal Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {quote.items.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-900/10">
                            <td className="px-5 py-3.5 font-bold text-slate-200">
                              {item.product?.name}
                            </td>
                            <td className="px-5 py-3.5 text-slate-400">
                              {item.product?.category?.name || 'Unlinked'}
                            </td>
                            <td className="px-5 py-3.5 text-right font-semibold text-slate-300">
                              ₹{item.rateSnapshot.toFixed(2)}
                            </td>
                            <td className="px-5 py-3.5 text-right font-bold text-slate-200">
                              {item.quantity} {item.product?.unit || 'kg'}
                            </td>
                            <td className="px-5 py-3.5 text-right font-black text-emerald-400">
                              ₹{item.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

            </div>
          );
        })}
        {filteredQuotes.length === 0 && (
          <div className="glass-panel rounded-2xl p-12 text-center text-slate-500">
            No quote requests found matching the active filter.
          </div>
        )}
      </div>

    </div>
  );
}
