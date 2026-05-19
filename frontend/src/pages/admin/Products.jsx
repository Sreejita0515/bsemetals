// frontend/src/pages/admin/Products.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  Tag, 
  Settings, 
  Layers, 
  X 
} from 'lucide-react';

export default function Products() {
  const { apiFetch } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unit, setUnit] = useState('kg');

  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchData = async () => {
    try {
      const prodData = await apiFetch('/api/products');
      setProducts(prodData);

      const catData = await apiFetch('/api/categories');
      setCategories(catData);
    } catch (err) {
      console.error('Products fetch fail:', err);
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
    setCategoryId(categories[0]?.id || '');
    setUnit('kg');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (prod) => {
    setIsEditing(true);
    setEditingId(prod.id);
    setName(prod.name);
    setCategoryId(prod.categoryId);
    setUnit(prod.unit);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !categoryId || !unit) {
      setFormError('Please fill in all fields.');
      return;
    }

    setSubmitLoading(true);
    setFormError('');

    try {
      const body = { name, categoryId, unit };

      if (isEditing) {
        await apiFetch(`/api/products/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(body)
        });
      } else {
        await apiFetch('/api/products', {
          method: 'POST',
          body: JSON.stringify(body)
        });
      }

      setModalOpen(false);
      await fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to save product.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await apiFetch(`/api/products/${id}`, {
        method: 'DELETE'
      });
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
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
            <Package className="w-8 h-8 text-copper-500" />
            Products Catalog
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Create and manage specific copper product items, mapping them to their parent formula categories.
          </p>
        </div>
        <button
          onClick={openAddModal}
          disabled={categories.length === 0}
          className="btn-copper py-3 self-start cursor-pointer font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          Create Product
        </button>
      </div>

      {categories.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl text-amber-400 text-sm">
          ⚠️ <strong>Required:</strong> Please create at least one Product Category first before defining individual products.
        </div>
      )}

      {/* Products Table */}
      <div className="glass-panel rounded-2xl p-6 border-slate-800">
        <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950">
          <table className="min-w-full divide-y divide-slate-900 text-left text-sm">
            <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Parent Category</th>
                <th className="px-6 py-4">Measurement Unit</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {products.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-900/30 transition">
                  <td className="px-6 py-4 font-bold text-slate-200">
                    {prod.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-copper-500/10 border border-copper-500/20 text-copper-400">
                      <Layers className="w-3 h-3" />
                      {prod.category?.name || 'Unassigned'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-400 text-xs uppercase font-mono">
                    {prod.unit}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(prod.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500">
                    No products listed. Add items to expand catalog.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Overlay Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel border-slate-800 rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-copper-500" />
              {isEditing ? 'Modify Product Specifications' : 'Define New Product'}
            </h2>

            {formError && (
              <div className="mb-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold animate-shake">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. House Wire 1.5 sq mm"
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-copper-500 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Parent Category Mapping</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-copper-500 rounded-xl py-2.5 px-4 text-sm text-slate-100 outline-none transition cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} (Copper: {cat.copperContentPct}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Pricing Measurement Unit</label>
                <select
                  required
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-copper-500 rounded-xl py-2.5 px-4 text-sm text-slate-100 outline-none transition cursor-pointer"
                >
                  <option value="kg">kg (Kilogram)</option>
                  <option value="ton">ton (Metric Ton)</option>
                  <option value="piece">piece</option>
                </select>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Note: Pricing formulas process base values in standard kg metrics.
                </span>
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full btn-copper py-3 mt-4 font-semibold cursor-pointer"
              >
                {submitLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isEditing ? 'Save Product Changes' : 'Create Product Entry'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
