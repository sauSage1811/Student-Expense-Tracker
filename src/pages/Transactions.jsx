import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Filter, Trash2, Edit2, TrendingUp, TrendingDown,
  ChevronDown, X, AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import TransactionModal from '../components/TransactionModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate } from '../utils/dateHelpers.js';

const Transactions = () => {
  const { transactions, categories, deleteTransaction } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const months = useMemo(() => {
    const set = new Set(transactions.map(t => t.date.slice(0, 7)));
    return [...set].sort().reverse();
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions
      .filter(tx => {
        const matchType = filterType === 'all' || tx.type === filterType;
        const matchCat = filterCat === 'all' || tx.category === filterCat;
        const matchMonth = filterMonth === 'all' || tx.date.startsWith(filterMonth);
        const matchSearch = !search ||
          tx.category.toLowerCase().includes(search.toLowerCase()) ||
          (tx.note || '').toLowerCase().includes(search.toLowerCase());
        return matchType && matchCat && matchMonth && matchSearch;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filterType, filterCat, filterMonth, search]);

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);

  const handleEdit = (tx) => {
    setEditData(tx);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    deleteTransaction(id);
    setDeleteConfirm(null);
  };

  const clearFilters = () => {
    setSearch('');
    setFilterType('all');
    setFilterCat('all');
    setFilterMonth('all');
  };

  const hasFilters = filterType !== 'all' || filterCat !== 'all' || filterMonth !== 'all' || search;

  const getCat = (name) => categories.find(c => c.name === name);

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Giao dịch</h2>
          <p className="text-sm text-slate-500">{filtered.length} giao dịch</p>
        </div>
        <button
          onClick={() => { setEditData(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Thêm giao dịch</span>
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-emerald-600" />
            <span className="text-xs text-emerald-600 font-medium">Tổng thu</span>
          </div>
          <p className="text-xl font-bold text-emerald-700">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} className="text-red-600" />
            <span className="text-xs text-red-600 font-medium">Tổng chi</span>
          </div>
          <p className="text-xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm giao dịch..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            />
          </div>
          <button
            onClick={() => setShowFilters(s => !s)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors
              ${showFilters || hasFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Lọc</span>
            {hasFilters && <span className="w-2 h-2 bg-indigo-500 rounded-full" />}
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
            >
              <option value="all">Tất cả loại</option>
              <option value="income">Thu nhập</option>
              <option value="expense">Chi tiêu</option>
            </select>
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
            >
              <option value="all">Tất cả danh mục</option>
              {categories
                .filter(c => filterType === 'all' || c.type === filterType)
                .map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
            <select
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
            >
              <option value="all">Tất cả tháng</option>
              {months.map(m => {
                const [y, mo] = m.split('-');
                return <option key={m} value={m}>Tháng {parseInt(mo)}/{y}</option>;
              })}
            </select>
          </div>
        )}
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
        {filtered.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {filtered.map(tx => {
              const cat = getCat(tx.category);
              return (
                <div key={tx.id} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors group">
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: (cat?.color || '#6366f1') + '20' }}
                  >
                    {cat?.icon || '💰'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800 truncate">{tx.category}</p>
                      <span className={`hidden sm:inline text-xs px-2 py-0.5 rounded-full font-medium
                        ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {tx.type === 'income' ? 'Thu' : 'Chi'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{tx.note || tx.paymentMethod} • {formatDate(tx.date)}</p>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <p className="text-xs text-slate-400">{tx.paymentMethod}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(tx)}
                      className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-500 transition-colors"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(tx.id)}
                      className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Không có giao dịch nào"
            message="Thêm giao dịch mới hoặc thay đổi bộ lọc để xem dữ liệu"
            action={
              <button
                onClick={() => { setEditData(null); setShowModal(true); }}
                className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors"
              >
                <Plus size={16} /> Thêm giao dịch
              </button>
            }
          />
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in">
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Xóa giao dịch?</h3>
              <p className="text-sm text-slate-500 mt-1">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50">Hủy</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors">Xóa</button>
            </div>
          </div>
        </div>
      )}

      <TransactionModal isOpen={showModal} onClose={() => { setShowModal(false); setEditData(null); }} editData={editData} />
    </div>
  );
};

export default Transactions;
