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
  const [showModal, setShowModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [saving, setSaving] = useState(false);

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

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSaving(true);
    try {
      await apiFetch('/api/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: newCatName,
          copperContentPct: 0,
          makingChargePerKg: 0,
          marginPct: 0,
          unitRate: 0
        })
      });
      setShowModal(false);
      setNewCatName('');
      fetchData();
    } catch (err) {
      console.error('Failed to create category', err);
      alert('Error creating category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This will delete all associated products!`)) return;
    try {
      await apiFetch(`/api/categories/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert('Error deleting category');
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
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Layers className="w-8 h-8 text-copper-500" />
            Main Product Categories
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Manage your main metal categories like Copper, Aluminium, Zinc, etc.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-copper flex items-center gap-2 py-2.5 px-5 whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex gap-4 items-start shadow-inner">
        <div className="p-2.5 rounded-xl bg-copper-500/10 text-copper-500 border border-copper-500/15">
          <Info className="w-5 h-5" />
        </div>
        <div className="text-sm">
          <h3 className="font-bold text-slate-200">Organize Your Metals</h3>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Create high-level categories (e.g., "Aluminium", "Copper"). Pricing and specific items are managed under the Product Catalog tab.
          </p>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
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
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                    Status
                  </span>
                  <span className="text-xs font-black text-emerald-400 tracking-tight block">
                    Active
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition cursor-pointer"
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
            No metal categories found in the database.
          </div>
        )}
      </div>



      {/* Add Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-800/60 bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-copper-500" />
                Add New Metal Category
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCategory} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g., Aluminium, Zinc, Brass"
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-copper-500 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !newCatName.trim()}
                  className="flex-1 btn-copper py-2.5 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Add Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
