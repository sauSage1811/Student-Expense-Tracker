import React from 'react';

const ChartCard = ({ title, subtitle, children, className = '', action }) => {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-soft border border-slate-100 ${className}`}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
};

export default ChartCard;
