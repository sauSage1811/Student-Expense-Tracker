import React, { useState } from 'react';
import { User, Mail, Lock, Moon, Sun, Trash2, LogOut, Edit2, Save, AlertTriangle, X, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, updateUser, toggleDarkMode, darkMode, resetData, logout, showToast } = useApp();
  const navigate = useNavigate();

  const [editName, setEditName] = useState(false);
  const [nameVal, setNameVal] = useState(user?.name || '');
  const [changePw, setChangePw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSaveName = () => {
    if (!nameVal.trim()) return;
    updateUser({ name: nameVal.trim() });
    setEditName(false);
  };

  const handleChangePw = () => {
    setPwError('');
    if (pwForm.current !== user.password) { setPwError('Mật khẩu hiện tại không đúng'); return; }
    if (pwForm.newPw.length < 6) { setPwError('Mật khẩu mới tối thiểu 6 ký tự'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Mật khẩu xác nhận không khớp'); return; }
    updateUser({ password: pwForm.newPw });
    setChangePw(false);
    setPwForm({ current: '', newPw: '', confirm: '' });
  };

  const handleReset = () => {
    resetData();
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const Section = ({ title, children }) => (
    <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-50">
        <h3 className="font-bold text-slate-800">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Hồ sơ cá nhân</h2>
        <p className="text-sm text-slate-500">Quản lý thông tin tài khoản của bạn</p>
      </div>

      {/* Avatar & name */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white text-center">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-3 border-4 border-white/30">
          {user?.name?.charAt(0)?.toUpperCase() || 'S'}
        </div>
        <h3 className="text-xl font-bold">{user?.name}</h3>
        <p className="text-indigo-200 text-sm mt-0.5">{user?.email}</p>
        <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
          <span className="w-2 h-2 bg-emerald-400 rounded-full" />
          Đang hoạt động
        </div>
      </div>

      {/* Profile info */}
      <Section title="Thông tin cá nhân">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Họ và tên</label>
          {editName ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={nameVal}
                onChange={e => setNameVal(e.target.value)}
                className="flex-1 px-3 py-2.5 border border-indigo-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <button onClick={handleSaveName} className="px-3 py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors">
                <Save size={16} />
              </button>
              <button onClick={() => { setEditName(false); setNameVal(user?.name || ''); }}
                className="px-3 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-500">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2.5">
                <User size={16} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-800">{user?.name}</span>
              </div>
              <button onClick={() => { setEditName(true); setNameVal(user?.name || ''); }}
                className="p-1.5 hover:bg-white rounded-lg text-indigo-500 transition-colors">
                <Edit2 size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Email</label>
          <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl">
            <Mail size={16} className="text-slate-400" />
            <span className="text-sm text-slate-600">{user?.email}</span>
            <span className="ml-auto text-xs bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">Không thể đổi</span>
          </div>
        </div>
      </Section>

      {/* Password */}
      <Section title="Bảo mật">
        {!changePw ? (
          <button
            onClick={() => setChangePw(true)}
            className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <Lock size={16} />
            Đổi mật khẩu
          </button>
        ) : (
          <div className="space-y-3">
            {[
              { key: 'current', label: 'Mật khẩu hiện tại' },
              { key: 'newPw', label: 'Mật khẩu mới' },
              { key: 'confirm', label: 'Xác nhận mật khẩu mới' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={pwForm[key]}
                    onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 pr-10"
                    placeholder="••••••"
                  />
                  {key === 'current' && (
                    <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {pwError && <p className="text-red-500 text-xs">{pwError}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setChangePw(false); setPwError(''); setPwForm({ current: '', newPw: '', confirm: '' }); }}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 text-sm">
                Hủy
              </button>
              <button onClick={handleChangePw} className="flex-1 py-2.5 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 text-sm transition-colors">
                Cập nhật
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* Appearance */}
      <Section title="Giao diện">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={20} className="text-indigo-500" /> : <Sun size={20} className="text-amber-500" />}
            <div>
              <p className="text-sm font-medium text-slate-800">Chế độ {darkMode ? 'tối' : 'sáng'}</p>
              <p className="text-xs text-slate-400">Thay đổi giao diện ứng dụng</p>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${darkMode ? 'bg-indigo-500' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="Vùng nguy hiểm">
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <LogOut size={18} className="text-slate-500" />
            Đăng xuất
          </button>
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full flex items-center gap-3 p-3 border border-red-200 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={18} />
            Xóa toàn bộ dữ liệu
          </button>
        </div>
      </Section>

      {/* Version info */}
      <div className="text-center text-xs text-slate-400 pb-4">
        <p>Student Expense Tracker v1.0.0</p>
        <p className="mt-0.5">Dữ liệu lưu trữ tại Local Browser</p>
      </div>

      {/* Reset confirm modal */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmReset(false)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in text-center">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Xóa toàn bộ dữ liệu?</h3>
            <p className="text-sm text-slate-500 mb-5">Tất cả giao dịch, danh mục và ngân sách sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác!</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmReset(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50">Hủy</button>
              <button onClick={handleReset} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600">Xóa tất cả</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
