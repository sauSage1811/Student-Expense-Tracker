import React, { useState, useMemo } from 'react';
import { Save, Target, AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import BudgetProgress from '../components/BudgetProgress.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';
import { filterByMonth, sumExpense, calcBudgetPercent } from '../utils/calculations.js';
import { getCurrentMonthYear, getMonthName } from '../utils/dateHelpers.js';

const Budgets = () => {
  const { budgets, updateBudgets, categories, transactions } = useApp();
  const { year, month } = getCurrentMonthYear();
  const [form, setForm] = useState(() => ({
    total: budgets.total || 0,
    categories: { ...budgets.categories } || {},
  }));
  const [saved, setSaved] = useState(false);

  const thisMonthTxs = useMemo(() => filterByMonth(transactions, year, month), [transactions, year, month]);
  const expenseCats = categories.filter(c => c.type === 'expense');

  const getSpentForCat = (catName) =>
    thisMonthTxs.filter(t => t.type === 'expense' && t.category === catName).reduce((a, t) => a + t.amount, 0);

  const totalSpent = sumExpense(thisMonthTxs);
  const overallPercent = calcBudgetPercent(totalSpent, form.total);

  const handleSave = () => {
    updateBudgets({ total: Number(form.total), categories: form.categories });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const setBudgetCat = (catName, val) => {
    setForm(f => ({
      ...f,
      categories: { ...f.categories, [catName]: Number(val) || 0 },
    }));
  };

  const alertLevel = overallPercent >= 100 ? 'over' : overallPercent >= 90 ? 'danger' : overallPercent >= 70 ? 'warning' : 'safe';
  const alertInfo = {
    safe: { icon: CheckCircle, cls: 'bg-emerald-50 border-emerald-200 text-emerald-700', text: 'Ngân sách ổn định' },
    warning: { icon: AlertTriangle, cls: 'bg-yellow-50 border-yellow-200 text-yellow-700', text: `Đã dùng ${overallPercent}% - Cần chú ý!` },
    danger: { icon: AlertTriangle, cls: 'bg-orange-50 border-orange-200 text-orange-700', text: `Nguy hiểm! Đã dùng ${overallPercent}% ngân sách` },
    over: { icon: AlertCircle, cls: 'bg-red-50 border-red-200 text-red-700', text: `Vượt ngân sách ${formatCurrency(totalSpent - form.total)}!` },
  }[alertLevel];

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Ngân sách tháng</h2>
          <p className="text-sm text-slate-500">{getMonthName(month)} {year}</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm
            ${saved ? 'bg-emerald-500 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white hover:shadow-md'}`}
        >
          {saved ? <><CheckCircle size={18} /> Đã lưu!</> : <><Save size={18} /> Lưu ngân sách</>}
        </button>
      </div>

      {/* Total budget card */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Target size={22} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Tổng ngân sách tháng</h3>
            <p className="text-xs text-slate-400">Tổng số tiền bạn có thể chi trong tháng</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Số tiền ngân sách</label>
          <div className="relative">
            <input
              type="number"
              value={form.total || ''}
              onChange={e => setForm(f => ({ ...f, total: e.target.value }))}
              placeholder="0"
              min="0"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">đ</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{form.total > 0 ? formatCurrency(Number(form.total)) : 'Chưa thiết lập'}</p>
        </div>

        {/* Overall progress */}
        {form.total > 0 && (
          <>
            <div className={`flex items-center gap-2 p-3 rounded-xl border mb-4 ${alertInfo.cls}`}>
              <alertInfo.icon size={18} className="flex-shrink-0" />
              <span className="text-sm font-medium">{alertInfo.text}</span>
            </div>
            <BudgetProgress label="Tổng chi tiêu" spent={totalSpent} budget={Number(form.total)} showAlert={false} />
          </>
        )}

        {/* Quick presets */}
        <div className="mt-4">
          <p className="text-xs text-slate-400 mb-2 font-medium">Ngân sách gợi ý cho sinh viên:</p>
          <div className="flex flex-wrap gap-2">
            {[2000000, 3000000, 3500000, 5000000].map(v => (
              <button key={v} onClick={() => setForm(f => ({ ...f, total: v }))}
                className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors">
                {formatCurrency(v)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category budgets */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-1">Ngân sách theo danh mục</h3>
        <p className="text-xs text-slate-400 mb-5">Thiết lập giới hạn chi tiêu cho từng danh mục</p>

        <div className="space-y-6">
          {expenseCats.map(cat => {
            const spent = getSpentForCat(cat.name);
            const budget = Number(form.categories[cat.name] || 0);
            return (
              <div key={cat.id} className="border border-slate-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: cat.color + '20' }}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{cat.name}</p>
                    <p className="text-xs text-slate-400">Đã chi: {formatCurrency(spent)}</p>
                  </div>
                  <div className="relative w-36">
                    <input
                      type="number"
                      value={form.categories[cat.name] || ''}
                      onChange={e => setBudgetCat(cat.name, e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 pr-6"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">đ</span>
                  </div>
                </div>
                {budget > 0 && (
                  <BudgetProgress label="" spent={spent} budget={budget} showAlert />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold mb-1">Mẹo quản lý ngân sách:</p>
            <ul className="space-y-0.5 text-xs opacity-90">
              <li>• Quy tắc 50/30/20: 50% nhu cầu thiết yếu, 30% giải trí, 20% tiết kiệm</li>
              <li>• Cảnh báo xuất hiện khi đạt 70%, 90% và vượt 100%</li>
              <li>• Đặt ngân sách thực tế để theo dõi hiệu quả hơn</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budgets;
