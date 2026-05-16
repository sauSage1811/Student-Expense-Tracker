const STORAGE_KEYS = {
  THEME: 'set_theme',
};

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

export const getTheme = () => get(STORAGE_KEYS.THEME) || 'light';
export const setTheme = (val) => set(STORAGE_KEYS.THEME, val);
