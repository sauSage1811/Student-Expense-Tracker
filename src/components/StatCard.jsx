import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  color = 'indigo',
  trend,
  trendLabel,
  subtitle,
  className = '',
}) => {
  const colorMap = {
    indigo: {
      bg: 'from-indigo-500 to-indigo-600',
      light: 'bg-indigo-50',
      text: 'text-indigo-600',
      iconBg: 'bg-indigo-100',
    },
    green: {
      bg: 'from-emerald-500 to-emerald-600',
      light: 'bg-emerald-50',
      text: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
    },
    red: {
      bg: 'from-red-500 to-rose-600',
      light: 'bg-red-50',
      text: 'text-red-600',
      iconBg: 'bg-red-100',
    },
    orange: {
      bg: 'from-orange-500 to-amber-600',
      light: 'bg-orange-50',
      text: 'text-orange-600',
      iconBg: 'bg-orange-100',
    },
    purple: {
      bg: 'from-purple-500 to-violet-600',
      light: 'bg-purple-50',
      text: 'text-purple-600',
      iconBg: 'bg-purple-100',
    },
    blue: {
      bg: 'from-blue-500 to-cyan-600',
      light: 'bg-blue-50',
      text: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
  };

  const c = colorMap[color] || colorMap.indigo;

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-soft card-hover border border-slate-100 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${c.iconBg}`}>
          {Icon && <Icon size={22} className={c.text} />}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
            ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div>
        <p className="text-sm text-slate-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
        {(subtitle || trendLabel) && (
          <p className="text-xs text-slate-400 mt-1">{trendLabel || subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
