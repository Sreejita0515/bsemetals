// frontend/src/pages/customer/OrderTracking.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Package, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  FileText, 
  ArrowRight,
  Truck,
  X,
  MapPin,
  Building,
  User,
  Phone,
  Mail,
  Download
} from 'lucide-react';

export default function OrderTracking() {
  const { apiFetch } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);

  const fetchQuotes = async () => {
    try {
      const data = await apiFetch('/api/quotes');
      setQuotes(data);
    } catch (err) {
      console.error('Error fetching quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'PENDING':
        return {
          icon: Clock,
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          label: 'Request Pending',
          desc: 'Waiting for admin to send quote.'
        };
      case 'SENT':
        return {
          icon: FileText,
          color: 'text-sky-400',
          bg: 'bg-sky-500/10',
          border: 'border-sky-500/20',
          label: 'Quote Sent',
          desc: 'Admin has sent the quote for your review.'
        };
      case 'ACCEPTED':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          label: 'Quote Accepted',
          desc: 'Order confirmed and processing.'
        };
      default:
        return {
          icon: Package,
          color: 'text-slate-400',
          bg: 'bg-slate-500/10',
          border: 'border-slate-500/20',
          label: status,
          desc: 'Status unknown.'
        };
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
            <Truck className="w-8 h-8 text-copper-500" />
            Track Orders
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Monitor the status of your quote requests and accepted orders.
          </p>
        </div>
      </div>

      {quotes.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-500 border-slate-800">
          You have no active orders or quote requests.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotes.map((quote) => {
            const statusInfo = getStatusInfo(quote.status);
            const StatusIcon = statusInfo.icon;
            
            // Calculate total items and grand total for display
            const totalItems = quote.items.reduce((sum, item) => sum + item.quantity, 0);
            const grandTotal = quote.items.reduce((sum, item) => sum + item.subtotal, 0);

            return (
              <div key={quote.id} className="glass-panel rounded-2xl p-6 border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                      {quote.orderNumber || `ID: ${quote.id.substring(0, 8)}`}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(quote.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <div className={`p-4 rounded-xl flex items-start gap-3 ${statusInfo.bg} ${statusInfo.border} border mb-6`}>
                    <StatusIcon className={`w-5 h-5 shrink-0 ${statusInfo.color}`} />
                    <div>
                      <h3 className={`text-sm font-bold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </h3>
                      <p className={`text-[10px] mt-1 ${statusInfo.color} opacity-80`}>
                        {statusInfo.desc}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Order Summary</h4>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-300">Total Weight:</span>
                      <span className="font-bold text-slate-200">{totalItems} kg</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-300">Estimated Value:</span>
                      <span className="font-black text-emerald-400">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedQuote(quote)}
                  className="w-full btn-copper py-2.5 font-semibold text-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
            onClick={() => setSelectedQuote(null)}
          ></div>
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Order Details</h2>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mt-1">{selectedQuote.orderNumber || `ID: ${selectedQuote.id}`}</p>
              </div>
              <button 
                onClick={() => setSelectedQuote(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-8">
              {/* Status Header */}
              <div className={`p-4 rounded-xl flex items-center justify-between border ${getStatusInfo(selectedQuote.status).bg} ${getStatusInfo(selectedQuote.status).border}`}>
                <div className="flex items-center gap-3">
                  {React.createElement(getStatusInfo(selectedQuote.status).icon, { className: `w-6 h-6 ${getStatusInfo(selectedQuote.status).color}` })}
                  <div>
                    <h3 className={`font-bold ${getStatusInfo(selectedQuote.status).color}`}>{getStatusInfo(selectedQuote.status).label}</h3>
                    <p className={`text-xs ${getStatusInfo(selectedQuote.status).color} opacity-80`}>{getStatusInfo(selectedQuote.status).desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Date</p>
                  <p className="text-sm font-medium text-slate-200">{new Date(selectedQuote.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-2">Contact Info</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3 text-slate-300">
                      <User className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <span>{selectedQuote.customerName}</span>
                    </div>
                    <div className="flex items-start gap-3 text-slate-300">
                      <Building className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <span>{selectedQuote.company}</span>
                    </div>
                    <div className="flex items-start gap-3 text-slate-300">
                      <Phone className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <span>{selectedQuote.phone}</span>
                    </div>
                    <div className="flex items-start gap-3 text-slate-300">
                      <Mail className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <span>{selectedQuote.email}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-2">Shipping Details</h4>
                  <div className="flex items-start gap-3 text-sm text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                    <span className="whitespace-pre-line">{selectedQuote.address || 'No address provided'}</span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-2">Order Items</h4>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-950/50 text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-semibold tracking-wider">Product</th>
                        <th className="px-4 py-3 font-semibold tracking-wider text-right">Quantity</th>
                        <th className="px-4 py-3 font-semibold tracking-wider text-right">Rate</th>
                        <th className="px-4 py-3 font-semibold tracking-wider text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {selectedQuote.items.map(item => (
                        <tr key={item.id} className="hover:bg-slate-800/30 transition">
                          <td className="px-4 py-3 font-medium text-slate-200">{item.product.name}</td>
                          <td className="px-4 py-3 text-right text-slate-300">{item.quantity} kg</td>
                          <td className="px-4 py-3 text-right font-mono text-slate-400">₹{item.rateSnapshot.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-medium text-emerald-400">₹{item.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="bg-slate-950/50 rounded-xl p-5 border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400">Total Weight</span>
                  <span className="text-slate-200 font-bold">{selectedQuote.items.reduce((sum, i) => sum + i.quantity, 0)} kg</span>
                </div>
                <div className="flex justify-between items-center text-lg mt-4 pt-4 border-t border-slate-800">
                  <span className="text-slate-300 font-bold">Estimated Total</span>
                  <span className="text-emerald-400 font-black tracking-tight">₹{selectedQuote.items.reduce((sum, i) => sum + i.subtotal, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <p className="text-amber-500/80 text-xs mt-3 text-right">* Excludes 18% GST and Freight charges</p>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
              <div>
                {selectedQuote.invoiceUrl && (
                  <a 
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${selectedQuote.invoiceUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 font-bold rounded-xl transition"
                  >
                    <Download className="w-4 h-4" /> Download Final Invoice
                  </a>
                )}
              </div>
              <button 
                onClick={() => setSelectedQuote(null)}
                className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
