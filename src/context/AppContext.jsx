import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCurrentUser, setCurrentUser, getUsers, saveUsers, logoutUser,
  getTransactions, saveTransactions, getCategories, saveCategories,
  getBudgets, saveBudgets, getSettings, saveSettings, getDarkMode, setDarkMode, clearAllData,
} from '../utils/storage.js';
import { DEFAULT_CATEGORIES } from '../data/mockData.js';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [settings, setSettingsState] = useState({});
  const [darkMode, setDarkModeState] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize data
  useEffect(() => {
    const dm = getDarkMode();
    setDarkModeState(dm);
    if (dm) document.documentElement.classList.add('dark');

    // Load current user
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadUserData(currentUser.id);
    }
    setLoading(false);
  }, []);

  const loadUserData = (userId) => {
    const txs = getTransactions();
    const userTxs = txs.filter(t => t.userId === userId);
    setTransactions(userTxs);

    const cats = getCategories();
    const userCats = cats.filter(c => c.userId === userId || c.isDefault);
    if (cats.filter(c => c.isDefault).length === 0) {
      const defaultWithDefault = DEFAULT_CATEGORIES.map(c => ({ ...c, isDefault: true }));
      saveCategories([...cats, ...defaultWithDefault]);
      setCategories(defaultWithDefault);
    } else {
      setCategories(userCats);
    }

    const buds = getBudgets();
    const userBuds = buds[userId];
    setBudgets(userBuds || { total: 0, categories: {} });

    const sett = getSettings();
    setSettingsState(sett[userId] || {});
  };

  // Auth
  const login = useCallback((email, password) => {
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) return { success: false, message: 'Email hoặc mật khẩu không đúng!' };
    setCurrentUser(found);
    setUser(found);
    loadUserData(found.id);
    return { success: true };
  }, []);

  const register = useCallback((name, email, password) => {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email đã được sử dụng!' };
    }
    const newUser = {
      id: `user-${Date.now()}`,
      name, email, password,
      avatar: null,
      createdAt: new Date().toISOString(),
    };
    saveUsers([...users, newUser]);
    setCurrentUser(newUser);
    setUser(newUser);
    loadUserData(newUser.id);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
    setTransactions([]);
    setCategories([]);
    setBudgets({});
  }, []);

  // Transactions
  const addTransaction = useCallback((tx) => {
    const newTx = { ...tx, id: `tx-${Date.now()}`, userId: user.id };
    const allTxs = getTransactions();
    saveTransactions([...allTxs, newTx]);
    setTransactions(prev => [...prev, newTx]);
    showToast('success', 'Thêm giao dịch thành công!');
    return newTx;
  }, [user]);

  const updateTransaction = useCallback((id, updated) => {
    const allTxs = getTransactions();
    const idx = allTxs.findIndex(t => t.id === id);
    if (idx === -1) return;
    allTxs[idx] = { ...allTxs[idx], ...updated };
    saveTransactions(allTxs);
    setTransactions(allTxs.filter(t => t.userId === user.id));
    showToast('success', 'Cập nhật giao dịch thành công!');
  }, [user]);

  const deleteTransaction = useCallback((id) => {
    const allTxs = getTransactions().filter(t => t.id !== id);
    saveTransactions(allTxs);
    setTransactions(allTxs.filter(t => t.userId === user.id));
    showToast('success', 'Xóa giao dịch thành công!');
  }, [user]);

  // Categories
  const addCategory = useCallback((cat) => {
    const newCat = { ...cat, id: `cat-${Date.now()}`, userId: user.id, isDefault: false };
    const allCats = getCategories();
    saveCategories([...allCats, newCat]);
    setCategories(prev => [...prev, newCat]);
    showToast('success', 'Thêm danh mục thành công!');
  }, [user]);

  const updateCategory = useCallback((id, updated) => {
    const allCats = getCategories();
    const idx = allCats.findIndex(c => c.id === id);
    if (idx === -1) return;
    allCats[idx] = { ...allCats[idx], ...updated };
    saveCategories(allCats);
    setCategories(allCats.filter(c => c.userId === user.id || c.isDefault));
    showToast('success', 'Cập nhật danh mục thành công!');
  }, [user]);

  const deleteCategory = useCallback((id) => {
    const allCats = getCategories().filter(c => c.id !== id);
    saveCategories(allCats);
    setCategories(allCats.filter(c => c.userId === user.id || c.isDefault));
    showToast('success', 'Xóa danh mục thành công!');
  }, [user]);

  // Budgets
  const updateBudgets = useCallback((newBudgets) => {
    const allBuds = getBudgets();
    allBuds[user.id] = newBudgets;
    saveBudgets(allBuds);
    setBudgets(newBudgets);
    showToast('success', 'Cập nhật ngân sách thành công!');
  }, [user]);

  // Profile update
  const updateUser = useCallback((updates) => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx === -1) return { success: false };
    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
    setCurrentUser(users[idx]);
    setUser(users[idx]);
    showToast('success', 'Cập nhật hồ sơ thành công!');
    return { success: true };
  }, [user]);

  // Dark mode
  const toggleDarkMode = useCallback(() => {
    const newVal = !darkMode;
    setDarkModeState(newVal);
    setDarkMode(newVal);
    if (newVal) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Clear all data
  const resetData = useCallback(() => {
    clearAllData();
    logout();
  }, [logout]);

  // Toast notifications
  const showToast = (type, message) => {
    const id = Date.now();
    setToast({ id, type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const value = {
    user, transactions, categories, budgets, settings, darkMode, toast,
    login, register, logout,
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
