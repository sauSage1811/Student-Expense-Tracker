import React, { useMemo } from 'react';
import { Lightbulb, TrendingDown, TrendingUp, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { analyzeSavings, filterByMonth, sumIncome, sumExpense, groupExpenseByCategory, compareMonths } from '../utils/calculations.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { getCurrentMonthYear } from '../utils/dateHelpers.js';

const tipStyles = {
  success: {
    bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
    border: 'border-emerald-200',
    icon: CheckCircle,
    iconColor: 'text-emerald-500',
    titleColor: 'text-emerald-800',
    textColor: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    badgeText: 'Tích cực',
  },
  warning: {
    bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
    border: 'border-yellow-200',
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
    titleColor: 'text-yellow-800',
    textColor: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-700',
    badgeText: 'Cảnh báo',
  },
  danger: {
    bg: 'bg-gradient-to-r from-red-50 to-rose-50',
    border: 'border-red-200',
    icon: AlertCircle,
    iconColor: 'text-red-500',
    titleColor: 'text-red-800',
    textColor: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    badgeText: 'Nguy hiểm',
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    border: 'border-blue-200',
    icon: Info,
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800',
    textColor: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    badgeText: 'Gợi ý',
  },
};

const SavingTips = () => {
  const { transactions, budgets } = useApp();
  const { year, month } = getCurrentMonthYear();

  const thisMonthTxs = useMemo(() => filterByMonth(transactions, year, month), [transactions, year, month]);
  const totalIncome = sumIncome(thisMonthTxs);
  const totalExpense = sumExpense(thisMonthTxs);
  const balance = totalIncome - totalExpense;

  const tips = useMemo(() => analyzeSavings(transactions, budgets.total), [transactions, budgets.total]);
  const catData = useMemo(() => groupExpenseByCategory(thisMonthTxs), [thisMonthTxs]);
  const compare = useMemo(() => compareMonths(transactions), [transactions]);

  const generalTips = [
    { icon: '🍳', title: 'Nấu ăn tại nhà', desc: 'Tiết kiệm 30-50% chi phí ăn uống so với ăn ngoài hàng ngày' },
    { icon: '🚴', title: 'Đi xe đạp hoặc đi bộ', desc: 'Tiết kiệm xăng xe và có lợi cho sức khỏe' },
    { icon: '📱', title: 'Dùng app tiết kiệm', desc: 'Tìm mã giảm giá trước khi mua sắm online' },
    { icon: '📚', title: 'Thư viện trường', desc: 'Mượn sách thay vì mua để tiết kiệm chi phí học tập' },
    { icon: '☕', title: 'Pha cà phê tại nhà', desc: 'Tiết kiệm 20.000-50.000đ mỗi ly so với quán cà phê' },
    { icon: '🎁', title: 'Quy tắc 24 giờ', desc: 'Chờ 24h trước khi mua đồ không cần thiết để tránh mua sắm bốc đồng' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Gợi ý tiết kiệm</h2>
        <p className="text-sm text-slate-500">Phân tích dựa trên dữ liệu chi tiêu của bạn</p>
      </div>

      {/* Overview mini */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-soft border border-slate-100 text-center">
          <TrendingUp size={20} className="text-emerald-500 mx-auto mb-1" />
          <p className="text-xs text-slate-500">Thu nhập</p>
          <p className="text-sm font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-soft border border-slate-100 text-center">
          <TrendingDown size={20} className="text-red-500 mx-auto mb-1" />
          <p className="text-xs text-slate-500">Chi tiêu</p>
          <p className="text-sm font-bold text-red-500">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-soft border border-slate-100 text-center">
          <Lightbulb size={20} className="text-indigo-500 mx-auto mb-1" />
          <p className="text-xs text-slate-500">Số dư</p>
          <p className={`text-sm font-bold ${balance >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>{formatCurrency(balance)}</p>
        </div>
      </div>

      {/* Personalized tips */}
      <div>
        <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
          <span className="w-2 h-5 bg-indigo-500 rounded-full" />
          Phân tích cá nhân
        </h3>
        <div className="space-y-3">
          {tips.map((tip, i) => {
            const style = tipStyles[tip.type] || tipStyles.info;
            return (
              <div key={i} className={`rounded-2xl border p-5 ${style.bg} ${style.border} animate-fade-in`} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">{tip.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h4 className={`font-bold text-sm ${style.titleColor}`}>{tip.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.badge}`}>{style.badgeText}</span>
                    </div>
                    <p className={`text-sm ${style.textColor} leading-relaxed`}>{tip.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spending breakdown */}
      {catData.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-slate-100">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-5 bg-purple-500 rounded-full" />
            Phân bổ chi tiêu
          </h3>
          <div className="space-y-3">
            {catData.map((item, i) => {
              const pct = totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0;
              const isHigh = pct > 40;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${isHigh ? 'text-orange-600' : 'text-slate-500'}`}>{pct}%</span>
                      <span className="font-semibold text-slate-700">{formatCurrency(item.value)}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${isHigh ? 'bg-orange-400' : 'bg-indigo-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* General tips */}
      <div>
        <h3 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
          <span className="w-2 h-5 bg-emerald-500 rounded-full" />
          Mẹo tiết kiệm cho sinh viên
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {generalTips.map((tip, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 shadow-soft flex items-start gap-3 card-hover">
              <span className="text-2xl">{tip.icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-800 mb-0.5">{tip.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavingTips;
