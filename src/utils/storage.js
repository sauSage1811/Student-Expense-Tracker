const STORAGE_KEYS = {
  USER: 'set_user',
  USERS: 'set_users',
  TRANSACTIONS: 'set_transactions',
  CATEGORIES: 'set_categories',
  BUDGETS: 'set_budgets',
  SETTINGS: 'set_settings',
  DARK_MODE: 'set_dark_mode',
  THEME: 'set_theme',
};

// Generic storage helpers
const get = (key) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
};

const set = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

const remove = (key) => {
  localStorage.removeItem(key);
};

// User auth
export const getCurrentUser = () => get(STORAGE_KEYS.USER);
export const setCurrentUser = (user) => set(STORAGE_KEYS.USER, user);
export const logoutUser = () => remove(STORAGE_KEYS.USER);

export const getUsers = () => get(STORAGE_KEYS.USERS) || [];
export const saveUsers = (users) => set(STORAGE_KEYS.USERS, users);

// Transactions
export const getTransactions = () => get(STORAGE_KEYS.TRANSACTIONS) || [];
export const saveTransactions = (txs) => set(STORAGE_KEYS.TRANSACTIONS, txs);

// Categories
export const getCategories = () => get(STORAGE_KEYS.CATEGORIES) || [];
export const saveCategories = (cats) => set(STORAGE_KEYS.CATEGORIES, cats);

// Budgets
export const getBudgets = () => get(STORAGE_KEYS.BUDGETS) || {};
export const saveBudgets = (budgets) => set(STORAGE_KEYS.BUDGETS, budgets);

// Settings
export const getSettings = () => get(STORAGE_KEYS.SETTINGS) || {};
export const saveSettings = (s) => set(STORAGE_KEYS.SETTINGS, s);

// Dark mode
export const getDarkMode = () => get(STORAGE_KEYS.DARK_MODE) || false;
export const setDarkMode = (val) => set(STORAGE_KEYS.DARK_MODE, val);
export const getTheme = () => get(STORAGE_KEYS.THEME) || 'light';
export const setTheme = (val) => set(STORAGE_KEYS.THEME, val);

// Clear all app data
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => remove(key));
};

export { STORAGE_KEYS };
