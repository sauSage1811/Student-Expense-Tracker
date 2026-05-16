import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title = 'Chưa có dữ liệu', message = '', action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
      <Icon size={32} className="text-slate-400" />
    </div>
    <h3 className="text-base font-semibold text-slate-600 mb-1">{title}</h3>
    {message && <p className="text-sm text-slate-400 mb-4 max-w-xs">{message}</p>}
    {action && <div>{action}</div>}
  </div>
);

export default EmptyState;
