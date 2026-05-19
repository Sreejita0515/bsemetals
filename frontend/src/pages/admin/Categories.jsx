// frontend/src/pages/admin/Categories.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  Info, 
  HelpCircle, 
  Loader2, 
  IndianRupee, 
  Percent, 
  Activity, 
  X 
} from 'lucide-react';

export default function Categories() {
  const { apiFetch } = useAuth();
  const [categories, setCategories] = useState([]);
  const [todayRate, setTodayRate] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [unitRate, setUnitRate] = useState('');
  
  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchData = async () => {
    try {
      const catData = await apiFetch('/api/categories');
      setCategories(catData);

      const rateData = await apiFetch('/api/rates');
      if (rateData.todayRate) {
        setTodayRate(rateData.todayRate.ratePerKg);
      }
    } catch (err) {
      console.error('Categories fetch fail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setUnitRate('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setIsEditing(true);
    setEditingId(cat.id);
    setName(cat.name);
    setUnitRate((cat.unitRate || 0).toString());
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !unitRate) {
      setFormError('Please fill in all fields.');
      return;
    }

    const rateVal = parseFloat(unitRate);

    if (rateVal < 0) {
      setFormError('Please enter a valid positive number for the rate.');
      return;
    }

    setSubmitLoading(true);
    setFormError('');

    try {
      const body = {
        name,
        copperContentPct: 0,
        makingChargePerKg: 0,
        marginPct: 0,
        unitRate: rateVal
      };

      if (isEditing) {
        await apiFetch(`/api/categories/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(body)
        });
      } else {
        await apiFetch('/api/categories', {
          method: 'POST',
          body: JSON.stringify(body)
        });
      }

      setModalOpen(false);
      await fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to save category.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? Deleting it will delete all products under it!')) {
      return;
    }

    try {
      await apiFetch(`/api/categories/${id}`, {
        method: 'DELETE'
      });
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  // Preview pricing based on today's LME rate
  const calculatePreviewRate = (cat) => {
    return cat.unitRate || 0;
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
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Layers className="w-8 h-8 text-copper-500" />
            Product Categories
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Manage category attributes and fine-tune making charges, copper content ratios, and margin percentages.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-copper py-3 self-start cursor-pointer font-bold"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          Create Category
        </button>
      </div>

      {/* Pricing Formula Explainer Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex gap-4 items-start shadow-inner">
        <div className="p-2.5 rounded-xl bg-copper-500/10 text-copper-500 border border-copper-500/15">
          <Info className="w-5 h-5" />
        </div>
        <div className="text-sm">
          <h3 className="font-bold text-slate-200">Manual Pricing Mode</h3>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            The system uses direct manual rates for each category. Set the flat price per kg directly for customers to see.
          </p>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const previewRate = calculatePreviewRate(cat);
          return (
            <div key={cat.id} className="glass-panel rounded-2xl p-6 relative flex flex-col justify-between border-slate-800 group hover:border-copper-500/40 transition duration-300">
              
              <div>
                {/* Title */}
                <h3 className="font-bold text-lg text-slate-200 group-hover:text-copper-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                  Category ID: {cat.id.slice(0, 8)}...
                </p>
              </div>

              {/* Dynamic Preview */}
              <div className="mt-5 bg-slate-950/60 rounded-xl p-4 border border-slate-900 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                    Fixed Category Rate
                  </span>
                  <span className="text-base font-black text-emerald-400 tracking-tight block mt-0.5">
                    ₹{previewRate.toFixed(2)}/kg
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-900/60">
                <button
                  onClick={() => openEditModal(cat)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold hover:text-white transition cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Parameters
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
        {categories.length === 0 && (
          <div className="col-span-full glass-panel rounded-2xl p-12 text-center text-slate-500">
            No copper categories created. Click "Create Category" to build one!
          </div>
        )}
      </div>

      {/* CRUD Overlay Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-copper-500" />
              {isEditing ? 'Modify Category' : 'Create Category'}
            </h2>

            {formError && (
              <div className="mb-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Electrical Wire (99.9% Copper)"
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-copper-500 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Unit Rate (₹ / kg)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={unitRate}
                    onChange={(e) => setUnitRate(e.target.value)}
                    placeholder="850.00"
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-copper-500 rounded-xl py-2.5 pl-8 pr-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full btn-copper py-3 mt-4 font-semibold cursor-pointer"
              >
                {submitLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isEditing ? 'Save Category Changes' : 'Create Category'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
