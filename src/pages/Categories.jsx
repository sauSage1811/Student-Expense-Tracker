import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, TrendingUp, TrendingDown, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import EmptyState from '../components/EmptyState.jsx';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981',
  '#3b82f6', '#f59e0b', '#06b6d4', '#a855f7', '#ef4444',
  '#84cc16', '#14b8a6', '#f43f5e', '#64748b',
];

const ICONS = ['🍜', '🏠', '🎓', '🚗', '🛍️', '🎮', '💊', '📚', '📦', '💝',
  '💼', '🏆', '♻️', '💰', '☕', '✈️', '🎵', '🍕', '💡', '🔧'];

const CategoryModal = ({ isOpen, onClose, editData, type }) => {
  const { addCategory, updateCategory } = useApp();
  const [form, setForm] = useState(
    editData || { name: '', type: type || 'expense', color: COLORS[0], icon: '📦' }
  );
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (editData) setForm(editData);
    else setForm({ name: '', type: type || 'expense', color: COLORS[0], icon: '📦' });
    setError('');
  }, [editData, isOpen, type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Vui lòng nhập tên danh mục'); return; }
    if (editData) updateCategory(editData.id, form);
    else addCategory(form);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">{editData ? 'Sửa danh mục' : 'Thêm danh mục'}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Type */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            {['expense', 'income'].map(t => (
              <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all
                  ${form.type === t ? (t === 'expense' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white') : 'text-slate-600'}`}>
                {t === 'expense' ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                {t === 'expense' ? 'Chi tiêu' : 'Thu nhập'}
              </button>
            ))}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên danh mục</label>
            <input type="text" value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setError(''); }}
              placeholder="Ví dụ: Ăn uống"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all
                ${error ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-400'}`} />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Icon</label>
            <div className="grid grid-cols-10 gap-1">
              {ICONS.map(icon => (
                <button key={icon} type="button" onClick={() => setForm(f => ({ ...f, icon }))}
                  className={`p-1.5 rounded-lg text-base transition-all ${form.icon === icon ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'hover:bg-slate-100'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Màu sắc</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button key={color} type="button" onClick={() => setForm(f => ({ ...f, color }))}
                  className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${form.color === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                  style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: form.color + '20' }}>
              {form.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{form.name || 'Tên danh mục'}</p>
              <p className="text-xs text-slate-400">{form.type === 'expense' ? 'Chi tiêu' : 'Thu nhập'}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50">Hủy</button>
            <button type="submit" className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors">
              {editData ? 'Cập nhật' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Categories = () => {
  const { categories, deleteCategory } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [activeTab, setActiveTab] = useState('expense');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = categories.filter(c => c.type === activeTab);
  const expenseCats = categories.filter(c => c.type === 'expense');
  const incomeCats = categories.filter(c => c.type === 'income');

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Danh mục</h2>
          <p className="text-sm text-slate-500">{expenseCats.length} chi tiêu · {incomeCats.length} thu nhập</p>
        </div>
        <button
          onClick={() => { setEditData(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Thêm danh mục</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-white rounded-xl border border-slate-100 shadow-soft w-fit">
        <button onClick={() => setActiveTab('expense')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all
            ${activeTab === 'expense' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
          <TrendingDown size={14} /> Chi tiêu ({expenseCats.length})
        </button>
        <button onClick={() => setActiveTab('income')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all
            ${activeTab === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
          <TrendingUp size={14} /> Thu nhập ({incomeCats.length})
        </button>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100 card-hover group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: cat.color + '20' }}>
                  {cat.icon}
                </div>
                {!cat.isDefault && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditData(cat); setShowModal(true); }}
                      className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-500 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => setDeleteConfirm(cat.id)}
                      className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              <p className="font-semibold text-slate-800 text-sm">{cat.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <p className="text-xs text-slate-400">{cat.isDefault ? 'Mặc định' : 'Tùy chỉnh'}</p>
              </div>
            </div>
          ))}

          {/* Add card */}
          <button
            onClick={() => { setEditData(null); setShowModal(true); }}
            className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
              <Plus size={24} className="text-slate-400 group-hover:text-indigo-500" />
            </div>
            <p className="text-sm font-medium text-slate-500 group-hover:text-indigo-600">Thêm mới</p>
          </button>
        </div>
      ) : (
        <EmptyState title="Chưa có danh mục" message="Thêm danh mục để phân loại giao dịch của bạn" />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in text-center">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Xóa danh mục?</h3>
            <p className="text-sm text-slate-500 mb-4">Các giao dịch liên quan sẽ không bị xóa.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50">Hủy</button>
              <button onClick={() => { deleteCategory(deleteConfirm); setDeleteConfirm(null); }}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600">Xóa</button>
            </div>
          </div>
        </div>
      )}

      <CategoryModal isOpen={showModal} onClose={() => { setShowModal(false); setEditData(null); }} editData={editData} type={activeTab} />
    </div>
  );
};

export default Categories;
