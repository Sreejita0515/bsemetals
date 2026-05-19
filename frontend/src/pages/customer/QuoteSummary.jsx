// frontend/src/pages/customer/QuoteSummary.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FileText, 
  ArrowLeft, 
  Send, 
  User, 
  Briefcase, 
  Phone, 
  Mail, 
  Loader2, 
  CheckCircle, 
  Trash2, 
  IndianRupee,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuoteSummary() {
  const { user, apiFetch } = useAuth();
  const navigate = useNavigate();

  const [cart, setCart] = useState({});
  const [products, setProducts] = useState([]);
  const [todayRate, setTodayRate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [company, setCompany] = useState(user?.companyName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.companyAddress || '');

  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fetchData = async () => {
    try {
      const prodData = await apiFetch('/api/products');
      setProducts(prodData);

      const rateData = await apiFetch('/api/rates');
      if (rateData.todayRate) {
        setTodayRate(rateData.todayRate.ratePerKg);
      }
    } catch (err) {
      console.error('Checkout fetch fail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const savedCart = localStorage.getItem('bsemetals_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        localStorage.removeItem('bsemetals_cart');
      }
    }
  }, []);

  const getProductRate = (prod) => {
    return prod.unitRate || 0;
  };

  const getCartItemsList = () => {
    return Object.keys(cart).map(id => {
      const prod = products.find(p => p.id === id);
      if (!prod) return null;
      const rate = getProductRate(prod);
      const qty = cart[id];
      return {
        productId: id,
        name: prod.name,
        unit: prod.unit,
        rate,
        quantity: qty,
        subtotal: rate * qty
      };
    }).filter(Boolean);
  };

  const cartItems = getCartItemsList();
  const grandTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      setCart({});
      localStorage.removeItem('bsemetals_cart');
    }
  };

  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    if (!customerName || !company || !phone || !email || !address) {
      setFormError('Please fill in all contact and shipping information fields.');
      return;
    }
    if (cartItems.length === 0) {
      setFormError('Your cart is empty. Please add products to request a quote.');
      return;
    }

    setSubmitLoading(true);
    setFormError('');

    try {
      const itemsPayload = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      await apiFetch('/api/quotes', {
        method: 'POST',
        body: JSON.stringify({
          customerName,
          company,
          phone,
          email,
          address,
          items: itemsPayload
        })
      });

      // Clear local cart
      setCart({});
      localStorage.removeItem('bsemetals_cart');
      setIsSuccess(true);
      
      // Confetti celebration trigger!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ea8416', '#fbbf24', '#f5ab3e', '#733110', '#10b981']
      });
      
    } catch (err) {
      setFormError(err.message || 'Failed to submit quote request.');
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

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 px-4 space-y-6">
        <div className="inline-flex w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 items-center justify-center shadow-lg shadow-emerald-950/20">
          <CheckCircle className="w-10 h-10 stroke-[2.2]" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">Request Submitted!</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Your quote request has been transmitted successfully. Our admin team will evaluate today's pricing metrics and send your quote sheet shortly.
          </p>
        </div>

        <div className="pt-4 flex justify-center gap-3">
          <Link
            to="/quote"
            className="btn-copper py-3 px-6 font-bold cursor-pointer"
          >
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div>
        <Link 
          to="/quote" 
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-copper-400 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
          <FileText className="w-8 h-8 text-copper-500" />
          Review Quote Request
        </h1>
        <p className="text-slate-400 text-sm mt-1.5">
          Review selected products, quantities, and input corporate details to submit your quote.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Listing (Left Pane) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border-slate-800 space-y-6">
            
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-200">Selected Products</h2>
              {cartItems.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Selection
                </button>
              )}
            </div>

            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.productId} className="bg-slate-950/60 p-4 border border-slate-900 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">{item.name}</h4>
                    <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                      Rate: ₹{item.rate.toFixed(2)}/kg
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-300 block font-semibold">
                      {item.quantity} {item.unit}
                    </span>
                    <span className="text-sm font-black text-emerald-400 block mt-0.5">
                      ₹{item.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}

              {cartItems.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-sm">
                  Your cart is empty. Go back to the{' '}
                  <Link to="/quote" className="text-copper-400 hover:underline">
                    Product Catalog
                  </Link>{' '}
                  to pick items.
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <>
                <div className="pt-6 border-t border-slate-900 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Estimated Summary Total
                  </span>
                  <span className="text-2xl font-black text-emerald-450 tracking-tight">
                    ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-semibold">
                  <p>
                    * Note: 18% GST and Freight charges will be extra and are not included in this estimate.
                  </p>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Corporate contact Details Form (Right Pane) */}
        <div className="lg:col-span-1">
          <div className="glass-panel rounded-2xl p-6 border-slate-800">
            <h2 className="text-lg font-bold text-slate-200 mb-6">Contact & Shipping Details</h2>
            
            {formError && (
              <div className="mb-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitQuote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Contact Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-550" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Rajesh Patel"
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-copper-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-700 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Company Name</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-550" />
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Alpha Electricals Pvt Ltd"
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-copper-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-700 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-550" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-copper-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-700 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-550" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rajesh@alphaelec.com"
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-copper-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-700 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Shipping Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-550" />
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Industrial Estate, Phase 1, Mumbai, Maharashtra 400001"
                    rows="3"
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-copper-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-700 outline-none transition resize-none"
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitLoading || cartItems.length === 0}
                className="w-full btn-copper py-3.5 mt-4 font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Submit Quote Request
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
