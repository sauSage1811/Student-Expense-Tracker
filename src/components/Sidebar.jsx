import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, Tag, Target,
  BarChart3, Lightbulb, User, LogOut, X, Menu,
  GraduationCap, ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Giao dịch' },
  { to: '/categories', icon: Tag, label: 'Danh mục' },
  { to: '/budgets', icon: Target, label: 'Ngân sách' },
  { to: '/reports', icon: BarChart3, label: 'Báo cáo' },
  { to: '/saving-tips', icon: Lightbulb, label: 'Gợi ý tiết kiệm' },
  { to: '/profile', icon: User, label: 'Hồ sơ' },
];

const Sidebar = ({ mobile = false, onClose }) => {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group
    ${isActive
      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
      : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
    }`;

  return (
    <div className={`flex flex-col h-full bg-white border-r border-slate-100 ${mobile ? '' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 leading-tight">Student</h1>
            <p className="text-xs text-indigo-500 font-semibold">Expense Tracker</p>
          </div>
        </div>
        {mobile && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <X size={20} />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || 'Sinh viên'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={linkClass} onClick={mobile ? onClose : undefined}>
            <Icon size={20} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium transition-all duration-200"
        >
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export const MobileSidebar = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-72 h-full shadow-2xl animate-slide-in">
        <Sidebar mobile onClose={onClose} />
      </div>
    </div>
  );
};

export default Sidebar;
