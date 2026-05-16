import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { DEFAULT_CATEGORIES } from '../data/mockData.js';
import { getTheme, setTheme } from '../utils/storage.js';

const AppContext = createContext(null);

const applyTheme = (theme) => {
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

const toAppUser = (authUser, profile) => ({
  id: authUser.id,
  email: authUser.email,
  name: profile?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Người dùng',
  avatar: null,
  createdAt: authUser.created_at,
});

const toAppTransaction = (row) => ({
  id: row.id,
  userId: row.user_id,
  type: row.type,
  amount: Number(row.amount),
  category: row.category,
  date: row.date,
  note: row.note || '',
  paymentMethod: row.payment_method || 'Tiền mặt',
});

const toAppCategory = (row) => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  type: row.type,
  color: row.color,
  icon: row.icon,
  isDefault: row.is_default,
});

const getErrorMessage = (error, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.') => {
  if (!error) return fallback;
  if (error.message?.includes('Invalid login credentials')) return 'Email hoặc mật khẩu không đúng.';
  if (error.message?.includes('User already registered')) return 'Email đã được sử dụng.';
  if (error.message?.includes('Email not confirmed')) return 'Email chưa được xác nhận.';
  return error.message || fallback;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState({ total: 0, categories: {} });
  const [settings] = useState({});
  const [darkMode, setDarkModeState] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = useCallback((type, message) => {
    const id = Date.now();
    setToast({ id, type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const ensureDefaultCategories = useCallback(async (userId) => {
    const { data: existing, error: countError } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (countError) throw countError;
    if (existing?.length) return;

    const rows = DEFAULT_CATEGORIES.map(cat => ({
      user_id: userId,
      name: cat.name,
      type: cat.type,
      color: cat.color,
      icon: cat.icon,
      is_default: true,
    }));

    const { error } = await supabase.from('categories').insert(rows);
    if (error) throw error;
  }, []);

  const loadUserData = useCallback(async (userId) => {
    await ensureDefaultCategories(userId);

    const [txResult, catResult, budgetResult] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('categories').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
      supabase.from('budgets').select('*').eq('user_id', userId).maybeSingle(),
    ]);

    if (txResult.error) throw txResult.error;
    if (catResult.error) throw catResult.error;
    if (budgetResult.error) throw budgetResult.error;

    setTransactions((txResult.data || []).map(toAppTransaction));
    setCategories((catResult.data || []).map(toAppCategory));
    setBudgets({
      total: Number(budgetResult.data?.total || 0),
      categories: budgetResult.data?.categories || {},
    });
  }, [ensureDefaultCategories]);

  const loadSessionUser = useCallback(async (authUser) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    const appUser = toAppUser(authUser, profile);
    setUser(appUser);
    await loadUserData(authUser.id);
    return appUser;
  }, [loadUserData]);

  useEffect(() => {
    const theme = getTheme();
    const isDark = theme === 'dark';
    setDarkModeState(isDark);
    applyTheme(theme);

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        try {
          await loadSessionUser(data.session.user);
        } catch (error) {
          showToast('error', getErrorMessage(error, 'Không tải được dữ liệu tài khoản. Hãy kiểm tra Supabase schema.'));
        }
      }
      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setTransactions([]);
        setCategories([]);
        setBudgets({ total: 0, categories: {} });
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [loadSessionUser, showToast]);

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) return { success: false, message: getErrorMessage(error) };

    try {
      await loadSessionUser(data.user);
      return { success: true };
    } catch (loadError) {
      return { success: false, message: getErrorMessage(loadError, 'Không tải được dữ liệu tài khoản.') };
    }
  }, [loadSessionUser]);

  const register = useCallback(async (name, email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { name } },
    });

    if (error) return { success: false, message: getErrorMessage(error) };
    if (!data.user) return { success: false, message: 'Không tạo được tài khoản.' };

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: data.user.id, name });

    if (profileError) return { success: false, message: getErrorMessage(profileError, 'Không tạo được hồ sơ tài khoản.') };

    if (!data.session) {
      return { success: true, needsEmailConfirmation: true };
    }

    try {
      await loadSessionUser(data.user);
      return { success: true };
    } catch (loadError) {
      return { success: false, message: getErrorMessage(loadError, 'Không tải được dữ liệu tài khoản.') };
    }
  }, [loadSessionUser]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTransactions([]);
    setCategories([]);
    setBudgets({ total: 0, categories: {} });
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/forgot-password`,
    });
    if (error) return { success: false, message: getErrorMessage(error) };
    return { success: true };
  }, []);

  const completePasswordReset = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, message: getErrorMessage(error) };
    return { success: true };
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!user?.email) return { success: false, message: 'Bạn chưa đăng nhập.' };

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (verifyError) return { success: false, message: 'Mật khẩu hiện tại không đúng.' };

    return completePasswordReset(newPassword);
  }, [completePasswordReset, user]);

  const addTransaction = useCallback(async (tx) => {
    if (!user) return null;
    const row = {
      user_id: user.id,
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      date: tx.date,
      note: tx.note || '',
      payment_method: tx.paymentMethod || 'Tiền mặt',
    };

    const { data, error } = await supabase.from('transactions').insert(row).select('*').single();
    if (error) {
      showToast('error', getErrorMessage(error, 'Không thêm được giao dịch.'));
      return null;
    }

    const newTx = toAppTransaction(data);
    setTransactions(prev => [newTx, ...prev]);
    showToast('success', 'Thêm giao dịch thành công!');
    return newTx;
  }, [showToast, user]);

  const updateTransaction = useCallback(async (id, updated) => {
    if (!user) return;
    const row = {
      type: updated.type,
      amount: updated.amount,
      category: updated.category,
      date: updated.date,
      note: updated.note || '',
      payment_method: updated.paymentMethod || 'Tiền mặt',
    };

    const { data, error } = await supabase
      .from('transactions')
      .update(row)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error) {
      showToast('error', getErrorMessage(error, 'Không cập nhật được giao dịch.'));
      return;
    }

    const nextTx = toAppTransaction(data);
    setTransactions(prev => prev.map(tx => tx.id === id ? nextTx : tx));
    showToast('success', 'Cập nhật giao dịch thành công!');
  }, [showToast, user]);

  const deleteTransaction = useCallback(async (id) => {
    if (!user) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id);
    if (error) {
      showToast('error', getErrorMessage(error, 'Không xóa được giao dịch.'));
      return;
    }

    setTransactions(prev => prev.filter(tx => tx.id !== id));
    showToast('success', 'Xóa giao dịch thành công!');
  }, [showToast, user]);

  const addCategory = useCallback(async (cat) => {
    if (!user) return;
    const row = {
      user_id: user.id,
      name: cat.name,
      type: cat.type,
      color: cat.color,
      icon: cat.icon,
      is_default: false,
    };

    const { data, error } = await supabase.from('categories').insert(row).select('*').single();
    if (error) {
      showToast('error', getErrorMessage(error, 'Không thêm được danh mục.'));
      return;
    }

    setCategories(prev => [...prev, toAppCategory(data)]);
    showToast('success', 'Thêm danh mục thành công!');
  }, [showToast, user]);

  const updateCategory = useCallback(async (id, updated) => {
    if (!user) return;
    const row = {
      name: updated.name,
      type: updated.type,
      color: updated.color,
      icon: updated.icon,
    };

    const { data, error } = await supabase
      .from('categories')
      .update(row)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error) {
      showToast('error', getErrorMessage(error, 'Không cập nhật được danh mục.'));
      return;
    }

    setCategories(prev => prev.map(cat => cat.id === id ? toAppCategory(data) : cat));
    showToast('success', 'Cập nhật danh mục thành công!');
  }, [showToast, user]);

  const deleteCategory = useCallback(async (id) => {
    if (!user) return;
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('is_default', false);

    if (error) {
      showToast('error', getErrorMessage(error, 'Không xóa được danh mục.'));
      return;
    }

    setCategories(prev => prev.filter(cat => cat.id !== id));
    showToast('success', 'Xóa danh mục thành công!');
  }, [showToast, user]);

  const updateBudgets = useCallback(async (newBudgets) => {
    if (!user) return;
    const row = {
      user_id: user.id,
      total: Number(newBudgets.total || 0),
      categories: newBudgets.categories || {},
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('budgets')
      .upsert(row)
      .select('*')
      .single();

    if (error) {
      showToast('error', getErrorMessage(error, 'Không lưu được ngân sách.'));
      return;
    }

    setBudgets({ total: Number(data.total || 0), categories: data.categories || {} });
    showToast('success', 'Cập nhật ngân sách thành công!');
  }, [showToast, user]);

  const updateUser = useCallback(async (updates) => {
    if (!user) return { success: false };

    if (updates.name) {
      const { error } = await supabase.from('profiles').upsert({ id: user.id, name: updates.name });
      if (error) {
        showToast('error', getErrorMessage(error, 'Không cập nhật được hồ sơ.'));
        return { success: false };
      }

      await supabase.auth.updateUser({ data: { name: updates.name } });
      setUser(prev => ({ ...prev, name: updates.name }));
      showToast('success', 'Cập nhật hồ sơ thành công!');
      return { success: true };
    }

    return { success: true };
  }, [showToast, user]);

  const toggleDarkMode = useCallback(() => {
    const newVal = !darkMode;
    const nextTheme = newVal ? 'dark' : 'light';
    setDarkModeState(newVal);
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, [darkMode]);

  const resetData = useCallback(async () => {
    if (!user) return;

    const [txResult, catResult, budgetResult] = await Promise.all([
      supabase.from('transactions').delete().eq('user_id', user.id),
      supabase.from('categories').delete().eq('user_id', user.id).eq('is_default', false),
      supabase.from('budgets').delete().eq('user_id', user.id),
    ]);

    const error = txResult.error || catResult.error || budgetResult.error;
    if (error) {
      showToast('error', getErrorMessage(error, 'Không xóa được dữ liệu.'));
      return;
    }

    setTransactions([]);
    setBudgets({ total: 0, categories: {} });
    await loadUserData(user.id);
    showToast('success', 'Đã xóa dữ liệu.');
  }, [loadUserData, showToast, user]);

  const value = {
    user, transactions, categories, budgets, settings, darkMode, toast,
    login, register, logout,
    requestPasswordReset, completePasswordReset, changePassword,
    addTransaction, updateTransaction, deleteTransaction,
    addCategory, updateCategory, deleteCategory,
    updateBudgets, updateUser,
    toggleDarkMode, resetData, showToast,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
