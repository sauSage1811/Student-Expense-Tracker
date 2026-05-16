import React from 'react';
import { Menu, Bell, Sun, Moon, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Quản lý giao dịch',
  '/categories': 'Danh mục',
  '/budgets': 'Ngân sách',
  '/reports': 'Báo cáo & Thống kê',
  '/saving-tips': 'Gợi ý tiết kiệm',
  '/profile': 'Hồ sơ cá nhân',
};

const Header = ({ onMenuClick, onAddTransaction }) => {
  const { user, darkMode, toggleDarkMode } = useApp();
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Student Expense Tracker';

  return (
    <header className="bg-white border-b border-slate-100 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <Menu size={22} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-400 hidden md:block">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Add Transaction Quick Button */}
        {onAddTransaction && (
          <button
            onClick={onAddTransaction}
            className="hidden sm:flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus size={18} />
            Thêm giao dịch
          </button>
        )}

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          title={darkMode ? 'Chế độ sáng' : 'Chế độ tối'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* User avatar */}
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity">
          {user?.name?.charAt(0)?.toUpperCase() || 'S'}
        </div>
      </div>
    </header>
  );
};

export default Header;
