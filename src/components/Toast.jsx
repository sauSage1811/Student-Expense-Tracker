import React from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-yellow-500',
};

const Toast = () => {
  const { toast } = useApp();
  if (!toast) return null;

  const Icon = iconMap[toast.type] || Info;

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-fade-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-white shadow-xl min-w-[260px] ${colorMap[toast.type] || colorMap.info}`}>
        <Icon size={20} className="flex-shrink-0" />
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
    </div>
  );
};

export default Toast;
