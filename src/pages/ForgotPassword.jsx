import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const ForgotPassword = () => {
  const { user, requestPasswordReset, completePasswordReset } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const isRecoveryMode = useMemo(() => {
    const params = `${window.location.search}${window.location.hash}`;
    return params.includes('type=recovery') || Boolean(user);
  }, [user]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !/\S+@\S+\.\S+/.test(normalizedEmail)) {
      setMessage({ type: 'error', text: 'Vui lòng nhập email hợp lệ.' });
      return;
    }

    setLoading(true);
    const result = await requestPasswordReset(normalizedEmail);
    setLoading(false);

    if (!result.success) {
      setMessage({ type: 'error', text: result.message });
      return;
    }

    setMessage({
      type: 'success',
      text: 'Đã gửi email đặt lại mật khẩu. Vui lòng mở link trong email để tạo mật khẩu mới.',
    });
  };

  const handleCompleteReset = async (e) => {
    e.preventDefault();

    if (!form.password || form.password.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' });
      return;
    }
    if (form.password !== form.confirm) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    setLoading(true);
    const result = await completePasswordReset(form.password);
    setLoading(false);

    if (!result.success) {
      setMessage({ type: 'error', text: result.message });
      return;
    }

    setMessage({ type: 'success', text: 'Đã đổi mật khẩu. Bạn có thể đăng nhập bằng mật khẩu mới.' });
    setTimeout(() => navigate('/login'), 900);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                <GraduationCap size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Quên mật khẩu</h1>
              <p className="text-slate-500 text-sm mt-1">
                {isRecoveryMode ? 'Tạo mật khẩu mới cho tài khoản của bạn' : 'Nhận email đặt lại mật khẩu'}
              </p>
            </div>

            {message.text && (
              <div className={`${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'} border text-sm px-4 py-3 rounded-xl mb-4 animate-fade-in`}>
                {message.text}
              </div>
            )}

            {isRecoveryMode ? (
              <form onSubmit={handleCompleteReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu mới</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full pl-11 pr-12 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                    <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={form.confirm}
                      onChange={e => setForm(prev => ({ ...prev, confirm: e.target.value }))}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><KeyRound size={18} /> Đổi mật khẩu</>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Mail size={18} /> Gửi email đặt lại</>}
                </button>
              </form>
            )}

            <p className="text-center text-sm text-slate-500 mt-5">
              Nhớ mật khẩu?{' '}
              <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
