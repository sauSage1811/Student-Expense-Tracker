import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Download, TrendingUp, TrendingDown, Wallet, Trophy, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';
import {
  filterByMonth, sumIncome, sumExpense,
  groupExpenseByCategory, getMonthlyTrend, getTop5Expenses,
  compareMonths,
} from '../utils/calculations.js';
import { CHART_COLORS } from '../data/mockData.js';
import { getCurrentMonthYear, getMonthName } from '../utils/dateHelpers.js';
import { formatDate } from '../utils/dateHelpers.js';

const Reports = () => {
  const { transactions, categories } = useApp();
  const { year, month } = getCurrentMonthYear();
  const [selectedMonth, setSelectedMonth] = useState(`${year}-${String(month + 1).padStart(2, '0')}`);

  const [selYear, selMonth] = selectedMonth.split('-').map(Number);
  const adjMonth = selMonth - 1;

  const thisMonthTxs = useMemo(() => filterByMonth(transactions, selYear, adjMonth), [transactions, selYear, adjMonth]);
  const totalIncome = sumIncome(thisMonthTxs);
  const totalExpense = sumExpense(thisMonthTxs);
  const balance = totalIncome - totalExpense;

  const pieData = useMemo(() => groupExpenseByCategory(thisMonthTxs), [thisMonthTxs]);
  const top5 = useMemo(() => getTop5Expenses(thisMonthTxs), [thisMonthTxs]);
  const trend = useMemo(() => getMonthlyTrend(transactions), [transactions]);
  const compare = useMemo(() => compareMonths(transactions), [transactions]);

  const mostCategory = pieData[0];

  const getCatColor = (name) => {
    const cat = categories.find(c => c.name === name);
    return cat?.color || CHART_COLORS[0];
  };

  const exportCSV = () => {
    const headers = ['Ngày,Loại,Danh mục,Số tiền,Phương thức,Ghi chú'];
    const rows = thisMonthTxs.map(tx =>
      `${formatDate(tx.date)},${tx.type === 'income' ? 'Thu nhập' : 'Chi tiêu'},${tx.category},${tx.amount},${tx.paymentMethod},"${tx.note || ''}"`
    );
    const csv = [...headers, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bao-cao-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const months = useMemo(() => {
    const set = new Set(transactions.map(t => t.date.slice(0, 7)));
    const cur = `${year}-${String(month + 1).padStart(2, '0')}`;
    set.add(cur);
    return [...set].sort().reverse();
  }, [transactions, year, month]);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Báo cáo & Thống kê</h2>
          <p className="text-sm text-slate-500">Phân tích chi tiết tài chính của bạn</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {months.map(m => {
              const [y, mo] = m.split('-');
              return <option key={m} value={m}>Tháng {parseInt(mo)}/{y}</option>;
            })}
          </select>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Xuất CSV</span>
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng thu nhập', value: totalIncome, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Tổng chi tiêu', value: totalExpense, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Số dư', value: balance, icon: Wallet, color: balance >= 0 ? 'text-indigo-600' : 'text-red-600', bg: balance >= 0 ? 'bg-indigo-50' : 'bg-red-50' },
          { label: 'Số giao dịch', value: thisMonthTxs.length, icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-50', noFormat: true },
        ].map(({ label, value, icon: Icon, color, bg, noFormat }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
            <p className={`text-xl font-bold ${color}`}>
              {noFormat ? value : formatCurrency(value)}
            </p>
          </div>
        ))}
      </div>

      {/* Compare last month */}
      <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">So sánh với tháng trước</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Thu nhập', thisVal: compare.thisIncome, lastVal: compare.lastIncome, change: compare.incomeChange, positive: compare.incomeChange >= 0 },
            { label: 'Chi tiêu', thisVal: compare.thisExpense, lastVal: compare.lastExpense, change: compare.expenseChange, positive: compare.expenseChange <= 0 },
          ].map(({ label, thisVal, lastVal, change, positive }) => (
            <div key={label} className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 mb-2">{label}</p>
              <p className="text-lg font-bold text-slate-800 mb-1">{formatCurrency(thisVal)}</p>
              <p className="text-xs text-slate-400 mb-2">Tháng trước: {formatCurrency(lastVal)}</p>
              {change !== 0 && (
                <div className={`flex items-center gap-1 text-xs font-semibold ${positive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {positive ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                  {Math.abs(change)}% so với tháng trước
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Most expensive category */}
      {mostCategory && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: getCatColor(mostCategory.name) + '20' }}>
              {categories.find(c => c.name === mostCategory.name)?.icon || '💰'}
            </div>
            <div>
              <p className="text-xs text-indigo-600 font-semibold mb-0.5">🏆 Danh mục chi nhiều nhất</p>
              <p className="font-bold text-slate-800">{mostCategory.name}</p>
              <p className="text-lg font-bold text-indigo-600">{formatCurrency(mostCategory.value)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie */}
        <ChartCard title="Chi tiêu theo danh mục">
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={getCatColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getCatColor(item.name) }} />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0}%</span>
                      <span className="font-semibold text-slate-700">{formatCurrency(item.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="text-center text-slate-400 py-10 text-sm">Chưa có dữ liệu</div>}
        </ChartCard>

        {/* Top 5 */}
        <ChartCard title="Top 5 khoản chi lớn nhất">
          {top5.length > 0 ? (
            <div className="space-y-3">
              {top5.map((tx, i) => {
                const cat = categories.find(c => c.name === tx.category);
                return (
                  <div key={tx.id} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: (cat?.color || '#6366f1') + '20' }}>
                      {cat?.icon || '💰'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{tx.category}</p>
                      <p className="text-xs text-slate-400 truncate">{tx.note || formatDate(tx.date)}</p>
                    </div>
                    <span className="text-sm font-bold text-red-500 flex-shrink-0">{formatCurrency(tx.amount)}</span>
                  </div>
                );
              })}
            </div>
          ) : <div className="text-center text-slate-400 py-10 text-sm">Chưa có dữ liệu</div>}
        </ChartCard>
      </div>

      {/* Trend chart */}
      <ChartCard title="Xu hướng thu/chi 6 tháng">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => {
              if (v >= 1000000) return (v / 1000000).toFixed(1) + 'tr';
              if (v >= 1000) return (v / 1000).toFixed(0) + 'k';
              return v;
            }} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Legend />
            <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Thu nhập" />
            <Bar dataKey="expense" fill="#f87171" radius={[6, 6, 0, 0]} name="Chi tiêu" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

export default Reports;
