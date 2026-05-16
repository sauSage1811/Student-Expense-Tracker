import React, { useState, useMemo } from 'react';
import {
  Wallet, TrendingUp, TrendingDown, DollarSign, Plus,
  AlertTriangle, AlertCircle, CheckCircle, ArrowRight,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import { useApp } from '../context/AppContext.jsx';
import StatCard from '../components/StatCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import TransactionModal from '../components/TransactionModal.jsx';
import BudgetProgress from '../components/BudgetProgress.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatCurrency, formatCurrencyShort } from '../utils/formatCurrency.js';
import {
  filterByMonth, sumIncome, sumExpense, calcBudgetPercent,
  getBudgetAlertLevel, groupExpenseByCategory, groupByDay,
  getMonthlyTrend, analyzeSavings,
} from '../utils/calculations.js';
import { CHART_COLORS } from '../data/mockData.js';
import { getCurrentMonthYear, getMonthName } from '../utils/dateHelpers.js';

const RADIAN = Math.PI / 180;
const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Dashboard = () => {
  const { transactions, budgets, categories } = useApp();
  const [showModal, setShowModal] = useState(false);
  const { year, month } = getCurrentMonthYear();

  const thisMonthTxs = useMemo(() => filterByMonth(transactions, year, month), [transactions, year, month]);
  const totalIncome = useMemo(() => sumIncome(thisMonthTxs), [thisMonthTxs]);
  const totalExpense = useMemo(() => sumExpense(thisMonthTxs), [thisMonthTxs]);
  const balance = totalIncome - totalExpense;
  const budgetTotal = budgets.total || 0;
  const budgetPercent = calcBudgetPercent(totalExpense, budgetTotal);
  const alertLevel = getBudgetAlertLevel(budgetPercent);

  const pieData = useMemo(() => groupExpenseByCategory(thisMonthTxs), [thisMonthTxs]);
  const barData = useMemo(() => groupByDay(transactions, year, month).filter(d => d.income > 0 || d.expense > 0), [transactions, year, month]);
  const lineData = useMemo(() => getMonthlyTrend(transactions), [transactions]);
  const savingTips = useMemo(() => analyzeSavings(transactions, budgetTotal), [transactions, budgetTotal]);

  const recentTxs = useMemo(() =>
    [...thisMonthTxs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
    [thisMonthTxs]
  );

  const alertConfig = {
    safe: { color: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: CheckCircle, text: `Ngân sách ổn định (${budgetPercent}%)` },
    warning: { color: 'bg-yellow-50 border-yellow-200 text-yellow-700', icon: AlertTriangle, text: `Đã dùng ${budgetPercent}% ngân sách - Cần chú ý!` },
    danger: { color: 'bg-orange-50 border-orange-200 text-orange-700', icon: AlertTriangle, text: `Cảnh báo! Đã dùng ${budgetPercent}% ngân sách tháng` },
    over: { color: 'bg-red-50 border-red-200 text-red-700', icon: AlertCircle, text: `Đã vượt ngân sách ${formatCurrency(totalExpense - budgetTotal)}!` },
  };
  const alert = alertConfig[alertLevel];

  const getCatColor = (name) => {
    const cat = categories.find(c => c.name === name);
    return cat?.color || CHART_COLORS[0];
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Month header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {getMonthName(month)} {year}
          </h2>
          <p className="text-sm text-slate-500">Tổng quan tài chính của bạn</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Thêm giao dịch</span>
        </button>
      </div>

      {/* Budget Alert */}
      {budgetTotal > 0 && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${alert.color}`}>
          <alert.icon size={20} className="flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold">{alert.text}</p>
            <div className="mt-2 h-2 bg-white/60 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  alertLevel === 'over' ? 'bg-red-500' :
                  alertLevel === 'danger' ? 'bg-orange-500' :
                  alertLevel === 'warning' ? 'bg-yellow-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(budgetPercent, 100)}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-bold">{Math.min(budgetPercent, 100)}%</span>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Tổng thu nhập"
          value={formatCurrency(totalIncome)}
          icon={TrendingUp}
          color="green"
          subtitle={`${thisMonthTxs.filter(t => t.type === 'income').length} giao dịch`}
        />
        <StatCard
          title="Tổng chi tiêu"
          value={formatCurrency(totalExpense)}
          icon={TrendingDown}
          color="red"
          subtitle={`${thisMonthTxs.filter(t => t.type === 'expense').length} giao dịch`}
        />
        <StatCard
          title="Số dư"
          value={formatCurrency(balance)}
          icon={Wallet}
          color={balance >= 0 ? 'indigo' : 'red'}
          subtitle={balance >= 0 ? 'Dương 👍' : 'Âm ⚠️'}
        />
        <StatCard
          title="Ngân sách tháng"
          value={formatCurrency(budgetTotal)}
          icon={DollarSign}
          color="purple"
          subtitle={budgetTotal > 0 ? `Đã dùng ${budgetPercent}%` : 'Chưa thiết lập'}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pie chart */}
        <ChartCard title="Chi tiêu theo danh mục" subtitle={getMonthName(month)}>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={CustomLabel}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={getCatColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getCatColor(item.name) }} />
                      <span className="text-slate-600 truncate max-w-[100px]">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-700">{formatCurrencyShort(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState title="Chưa có chi tiêu" />
          )}
        </ChartCard>

        {/* Bar chart */}
        <ChartCard title="Chi tiêu theo ngày" subtitle={getMonthName(month)} className="lg:col-span-2">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} barSize={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatCurrencyShort(v)} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Thu nhập" />
                <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} name="Chi tiêu" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="Chưa có dữ liệu" />
          )}
        </ChartCard>
      </div>

      {/* Line chart */}
      <ChartCard title="Xu hướng thu/chi 6 tháng" subtitle="So sánh theo tháng">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatCurrencyShort(v)} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Thu nhập" />
            <Line type="monotone" dataKey="expense" stroke="#f87171" strokeWidth={2.5} dot={{ r: 4 }} name="Chi tiêu" />
            <Legend />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent transactions */}
        <ChartCard
          title="Giao dịch gần đây"
          action={
            <a href="/transactions" className="text-xs text-indigo-500 font-medium hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight size={14} />
            </a>
          }
        >
          {recentTxs.length > 0 ? (
            <div className="space-y-3">
              {recentTxs.map(tx => {
                const cat = categories.find(c => c.name === tx.category);
                return (
                  <div key={tx.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: (cat?.color || '#6366f1') + '20' }}>
                      {cat?.icon || '💰'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{tx.category}</p>
                      <p className="text-xs text-slate-400 truncate">{tx.note || '—'}</p>
                    </div>
                    <span className={`text-sm font-bold flex-shrink-0 ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="Chưa có giao dịch" />
          )}
        </ChartCard>

        {/* Saving tips */}
        <ChartCard title="Gợi ý tiết kiệm" subtitle="Phân tích chi tiêu của bạn">
          <div className="space-y-3">
            {savingTips.slice(0, 3).map((tip, i) => (
              <div key={i} className={`p-3 rounded-xl border text-sm
                ${tip.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                  tip.type === 'warning' ? 'bg-yellow-50 border-yellow-100 text-yellow-700' :
                  tip.type === 'danger' ? 'bg-red-50 border-red-100 text-red-700' :
                  'bg-blue-50 border-blue-100 text-blue-700'}`}>
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <span>{tip.icon}</span>
                  {tip.title}
                </div>
                <p className="text-xs opacity-90">{tip.message}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <TransactionModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default Dashboard;
