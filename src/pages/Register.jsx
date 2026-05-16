import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, User, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const TextField = ({
  name,
  label,
  value,
  error,
  icon: Icon,
  onChange,
  type = 'text',
  placeholder,
}) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <div className="relative">
      <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type={type}
        value={value}
        onChange={e => onChange(name, e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all
          ${error ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-400'}`}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Register = () => {
  const { register } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleFieldChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Vui lòng nhập họ tên';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) nextErrors.email = 'Email không hợp lệ';
    if (!form.password || form.password.length < 6) nextErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (form.password !== form.confirm) nextErrors.confirm = 'Mật khẩu xác nhận không khớp';
    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    const result = register(form.name.trim(), form.email.trim(), form.password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors({ email: result.message });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500" />
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
                <GraduationCap size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">Tạo tài khoản mới</h1>
              <p className="text-slate-500 text-sm mt-1">Bắt đầu quản lý tài chính cá nhân</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                name="name"
                label="Họ và tên"
                value={form.name}
                error={errors.name}
                placeholder="Nguyễn Văn A"
                icon={User}
                onChange={handleFieldChange}
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                value={form.email}
                error={errors.email}
                placeholder="email@example.com"
                icon={Mail}
                onChange={handleFieldChange}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => handleFieldChange('password', e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className={`w-full pl-11 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all
                      ${errors.password ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-200 focus:border-indigo-400'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(prev => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <TextField
                name="confirm"
                label="Xác nhận mật khẩu"
                type="password"
                value={form.confirm}
                error={errors.confirm}
                placeholder="Nhập lại mật khẩu"
                icon={Lock}
                onChange={handleFieldChange}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus size={18} />
                    Đăng ký
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-5">
              Đã có tài khoản?{' '}
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

export default Register;
