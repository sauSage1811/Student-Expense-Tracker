import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency.js';

const BudgetProgress = ({ label, spent, budget, showAlert = true }) => {
  if (!budget || budget <= 0) return null;

  const percent = Math.min(Math.round((spent / budget) * 100), 100);
  const isOver = spent > budget;
  const actualPercent = Math.round((spent / budget) * 100);

  const getBarColor = () => {
    if (isOver || actualPercent >= 100) return 'bg-red-500';
    if (actualPercent >= 90) return 'bg-orange-500';
    if (actualPercent >= 70) return 'bg-yellow-500';
    return 'bg-indigo-500';
  };

  const getAlertInfo = () => {
    if (isOver || actualPercent >= 100) return {
      icon: AlertCircle,
      text: `Vượt ngân sách ${formatCurrency(spent - budget)}!`,
      cls: 'text-red-600 bg-red-50',
    };
    if (actualPercent >= 90) return {
      icon: AlertTriangle,
      text: `Cảnh báo! Đã dùng ${actualPercent}% ngân sách`,
      cls: 'text-orange-600 bg-orange-50',
    };
    if (actualPercent >= 70) return {
      icon: Info,
      text: `Đã dùng ${actualPercent}% ngân sách`,
      cls: 'text-yellow-600 bg-yellow-50',
    };
    return null;
  };

  const alert = getAlertInfo();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className={`font-semibold ${isOver ? 'text-red-600' : 'text-slate-600'}`}>
          {formatCurrency(spent)} / {formatCurrency(budget)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${getBarColor()}`}
          style={{ width: `${percent}%` }}
        />
        {actualPercent >= 70 && actualPercent < 100 && (
          <div
            className="absolute top-0 h-full w-0.5 bg-yellow-400 opacity-70"
            style={{ left: '70%' }}
          />
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{actualPercent}% đã dùng</span>
        <span>Còn lại: {formatCurrency(Math.max(budget - spent, 0))}</span>
      </div>

      {showAlert && alert && (
        <div className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium ${alert.cls}`}>
          <alert.icon size={14} />
          {alert.text}
        </div>
      )}
    </div>
  );
};

export default BudgetProgress;
