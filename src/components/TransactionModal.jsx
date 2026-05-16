import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, CreditCard, MessageSquare, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { PAYMENT_METHODS } from '../data/mockData.js';
import { todayStr } from '../utils/dateHelpers.js';

const TransactionModal = ({ isOpen, onClose, editData = null }) => {
  const { categories, addTransaction, updateTransaction } = useApp();
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: '',
    date: todayStr(),
    note: '',
    paymentMethod: 'Tiền mặt',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setForm({
        type: editData.type,
        amount: editData.amount.toString(),
        category: editData.category,
        date: editData.date,
        note: editData.note || '',
        paymentMethod: editData.paymentMethod || 'Tiền mặt',
      });
    } else {
      setForm({
        type: 'expense',
        amount: '',
        category: '',
        date: todayStr(),
        note: '',
        paymentMethod: 'Tiền mặt',
      });
    }
    setErrors({});
  }, [editData, isOpen]);

  const filteredCats = categories.filter(c => c.type === form.type);

  const validate = () => {
    const errs = {};
    if (!form.amount || parseFloat(form.amount) <= 0)
      errs.amount = 'Số tiền phải lớn hơn 0';
    if (!form.category)
      errs.category = 'Vui lòng chọn danh mục';
    if (!form.date)
      errs.date = 'Vui lòng chọn ngày';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const data = {
      ...form,
      amount: parseFloat(form.amount),
    };

    if (editData) {
      updateTransaction(editData.id, data);
    } else {
      addTransaction(data);
    }
    onClose();
  };

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setForm(f => ({ ...f, amount: val }));
    if (errors.amount) setErrors(e => ({ ...e, amount: '' }));
  };

  const formatDisplayAmount = (val) => {
    if (!val) return '';
    return parseInt(val, 10).toLocaleString('vi-VN');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 modal-overlay">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="text-lg font-bold text-slate-800">
            {editData ? 'Sửa giao dịch' : 'Thêm giao dịch'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Type toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, type: 'expense', category: '' }))}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                ${form.type === 'expense' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-600 hover:text-red-500'}`}
            >
              <TrendingDown size={16} />
              Chi tiêu
            </button>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, type: 'income', category: '' }))}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                ${form.type === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 hover:text-emerald-500'}`}
            >
              <TrendingUp size={16} />
              Thu nhập
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Số tiền <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formatDisplayAmount(form.amount)}
                onChange={handleAmountChange}
                placeholder="0"
                className={`w-full px-4 py-3 border rounded-xl text-lg font-bold pr-12 focus:outline-none focus:ring-2 transition-all
                  ${errors.amount ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-400'}`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">đ</span>
            </div>
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Tag size={14} className="inline mr-1" />
              Danh mục <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {filteredCats.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { setForm(f => ({ ...f, category: cat.name })); setErrors(e => ({ ...e, category: '' })); }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-xs font-medium transition-all duration-150
                    ${form.category === cat.name
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'}`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-center leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Calendar size={14} className="inline mr-1" />
              Ngày <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.date}
              onChange={e => { setForm(f => ({ ...f, date: e.target.value })); setErrors(e => ({ ...e, date: '' })); }}
              max={todayStr()}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all
                ${errors.date ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-400'}`}
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>

          {/* Payment method */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <CreditCard size={14} className="inline mr-1" />
              Phương thức thanh toán
            </label>
            <select
              value={form.paymentMethod}
              onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all bg-white"
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <MessageSquare size={14} className="inline mr-1" />
              Ghi chú
            </label>
            <textarea
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Thêm ghi chú..."
              rows={2}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white transition-all shadow-sm hover:shadow-md
                ${form.type === 'expense'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-emerald-500 hover:bg-emerald-600'}`}
            >
              {editData ? 'Cập nhật' : 'Thêm giao dịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
