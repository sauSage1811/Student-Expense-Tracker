// Format currency to VND
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + 'đ';
};

// Short format for large numbers
export const formatCurrencyShort = (amount) => {
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1) + 'tr';
  }
  if (amount >= 1_000) {
    return (amount / 1_000).toFixed(0) + 'k';
  }
  return amount + 'đ';
};

// Parse currency string back to number
export const parseCurrency = (str) => {
  if (!str) return 0;
  return parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
};
