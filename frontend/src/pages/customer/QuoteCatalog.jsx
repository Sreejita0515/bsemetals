// frontend/src/pages/customer/QuoteCatalog.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingCart,
  IndianRupee,
  Loader2,
  ArrowRight,
  Package,
  Scale,
  Layers,
  CheckCircle2,
  Search
} from 'lucide-react';

export default function QuoteCatalog() {
  const { apiFetch } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [todayRate, setTodayRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({}); // { [productId]: quantity }
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const prodData = await apiFetch('/api/products');
      setProducts(prodData);

      const rateData = await apiFetch('/api/rates');
      if (rateData.todayRate) {
        setTodayRate(rateData.todayRate.ratePerKg);
      }
    } catch (err) {
      console.error('Catalog fetch fail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Load existing cart from storage if any
    const savedCart = localStorage.getItem('bsemetals_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        localStorage.removeItem('bsemetals_cart');
      }
    }
  }, []);

  // Sync cart to local storage
  const updateQuantity = (productId, qty) => {
    const newCart = { ...cart };
    const numQty = parseFloat(qty);

    if (isNaN(numQty) || numQty <= 0) {
      delete newCart[productId];
    } else {
      newCart[productId] = numQty;
    }

    setCart(newCart);
    localStorage.setItem('bsemetals_cart', JSON.stringify(newCart));
  };

  // Pricing snap formula: ratePerKg = product unitRate
  const getProductRate = (prod) => {
    return prod.unitRate || 0;
  };

  // Filter products by search query
  const filteredProducts = products.filter(prod => 
    prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (prod.category?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group filtered products by category name
  const productsByCategory = filteredProducts.reduce((groups, prod) => {
    const catName = prod.category?.name || 'Unassigned';
    if (!groups[catName]) {
      groups[catName] = [];
    }
    groups[catName].push(prod);
    return groups;
  }, {});

  // Compute overall summary stats
  const getSummaryStats = () => {
    let totalItems = 0;
    let grandTotal = 0;

    Object.keys(cart).forEach(id => {
      const prod = products.find(p => p.id === id);
      if (prod) {
        const rate = getProductRate(prod);
        const qty = cart[id];
        totalItems += 1;
        grandTotal += rate * qty;
      }
    });

    return { totalItems, grandTotal };
  };

  const handleProceed = () => {
    navigate('/quote/summary');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-copper-500 animate-spin" />
      </div>
    );
  }

  const { totalItems, grandTotal } = getSummaryStats();

  return (
    <div className="space-y-8 pb-24">

      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-copper-500/5 blur-2xl"></div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2.5">
            <ShoppingCart className="w-8 h-8 text-copper-500" />
            Metal Products Catalog
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 leading-relaxed max-w-xl">
            Input the quantity required in kg. The custom pricing system maps directly to the active category rates published by the administration.
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-slate-500">
          No products currently published in the catalog.
        </div>
      ) : (
        <div className="relative w-full mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search products or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 hover:border-slate-700 focus:border-copper-500 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition shadow-inner"
          />
        </div>
      )}

      {/* Categories blocks */}
      {Object.keys(productsByCategory).map((catName) => (
        <div key={catName} className="space-y-4">
          <h2 className="text-lg font-bold text-slate-300 flex items-center gap-2 border-b border-slate-900 pb-2">
            <Layers className="w-5 h-5 text-copper-500" />
            {catName}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsByCategory[catName].map((prod) => {
              const rate = getProductRate(prod);
              const qty = cart[prod.id] || '';
              const subtotal = rate * (parseFloat(qty) || 0);

              return (
                <div
                  key={prod.id}
                  className={`glass-panel rounded-2xl p-5 border transition duration-300 flex flex-col justify-between ${qty > 0 ? 'border-copper-500/30 bg-slate-900/80 shadow-copper-glow' : 'border-slate-850 hover:border-slate-800'
                    }`}
                >
                  <div>
                    {/* Item title */}
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-extrabold text-base text-slate-200">{prod.name}</h3>
                      <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-semibold px-2 py-0.5 rounded uppercase">
                        {prod.unit}
                      </span>
                    </div>

                    {/* Unit Price Snapshot */}
                    <div className="mt-4 bg-slate-950/40 rounded-xl p-3 border border-slate-900/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Unit Rate</span>
                      <span className="text-sm font-black text-slate-300">
                        ₹{rate.toFixed(2)} / kg
                      </span>
                    </div>
                  </div>

                  {/* Quantity & live subtotal math inputs */}
                  <div className="mt-5 space-y-3.5 pt-4 border-t border-slate-900/60">
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Quantity ({prod.unit})
                      </label>
                      <div className="relative max-w-[120px]">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={qty}
                          onChange={(e) => updateQuantity(prod.id, e.target.value)}
                          placeholder="0.0"
                          className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-copper-500 rounded-xl py-2 px-3 text-right text-sm text-slate-100 placeholder:text-slate-700 outline-none transition"
                        />
                      </div>
                    </div>

                    {parseFloat(qty) > 0 && (
                      <div className="flex items-center justify-between text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-900/40">
                        <span className="text-slate-500 font-semibold uppercase text-[9px]">Live Subtotal</span>
                        <span className="font-bold text-emerald-400 text-sm">
                          ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Disclaimers Block */}
      {products.length > 0 && (
        <div className="mt-6 mb-32 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-semibold flex items-start gap-2 max-w-3xl">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            * Note: 18% GST and Freight charges will be extra and are not included in the displayed estimated total. Final calculations will be provided on the actual invoice.
          </p>
        </div>
      )}

      {/* Floating overall stats banner */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-2xl w-[92%] glass-panel border-copper-500/30 rounded-2xl py-4 px-6 flex items-center justify-between shadow-2xl z-40 bg-slate-950/90 backdrop-blur-lg animate-in slide-in-from-bottom-6 duration-300">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-widest">
              Selected: {totalItems} {totalItems === 1 ? 'Product' : 'Products'}
            </span>
            <span className="text-lg font-black text-emerald-400 mt-0.5 block tracking-tight">
              ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <button
            onClick={handleProceed}
            className="btn-copper py-2.5 font-bold cursor-pointer"
          >
            Review Quote
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
