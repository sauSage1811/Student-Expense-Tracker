import { startOfMonth, endOfMonth, subMonths } from '../utils/dateHelpers.js';

// Filter transactions by month
export const filterByMonth = (transactions, year, month) => {
  return transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
};

// Sum income
export const sumIncome = (transactions) =>
  transactions
    .filter(tx => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0);

// Sum expense
export const sumExpense = (transactions) =>
  transactions
    .filter(tx => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

// Balance
export const calcBalance = (transactions) =>
  sumIncome(transactions) - sumExpense(transactions);

// Budget usage percent
export const calcBudgetPercent = (expense, budget) => {
  if (!budget || budget <= 0) return 0;
  return Math.round((expense / budget) * 100);
};

// Budget alert level: 'safe' | 'warning' | 'danger' | 'over'
export const getBudgetAlertLevel = (percent) => {
  if (percent >= 100) return 'over';
  if (percent >= 90) return 'danger';
  if (percent >= 70) return 'warning';
  return 'safe';
};

// Group expenses by category
export const groupExpenseByCategory = (transactions) => {
  const expenses = transactions.filter(tx => tx.type === 'expense');
  const map = {};
  expenses.forEach(tx => {
    map[tx.category] = (map[tx.category] || 0) + tx.amount;
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

// Group by day (for bar chart)
export const groupByDay = (transactions, year, month) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    income: 0,
    expense: 0,
  }));

  transactions.forEach(tx => {
    const d = new Date(tx.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const dayIdx = d.getDate() - 1;
      if (tx.type === 'income') days[dayIdx].income += tx.amount;
      else days[dayIdx].expense += tx.amount;
    }
  });

  return days.map(d => ({ ...d, name: `${d.day}` }));
};

// Monthly trend (last 6 months)
export const getMonthlyTrend = (transactions) => {
  const now = new Date();
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const txs = filterByMonth(transactions, year, month);
    const monthNames = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6',
      'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
    result.push({
      name: monthNames[month],
      income: sumIncome(txs),
      expense: sumExpense(txs),
    });
  }
  return result;
};

// Top 5 expenses
export const getTop5Expenses = (transactions) => {
  return transactions
    .filter(tx => tx.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
};

// Compare this month vs last month
export const compareMonths = (transactions) => {
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const thisMonthTxs = filterByMonth(transactions, thisYear, thisMonth);
  const lastMonthTxs = filterByMonth(transactions, lastYear, lastMonth);

  const thisIncome = sumIncome(thisMonthTxs);
  const thisExpense = sumExpense(thisMonthTxs);
  const lastIncome = sumIncome(lastMonthTxs);
  const lastExpense = sumExpense(lastMonthTxs);

  const expenseChange = lastExpense === 0 ? 0 :
    Math.round(((thisExpense - lastExpense) / lastExpense) * 100);
  const incomeChange = lastIncome === 0 ? 0 :
    Math.round(((thisIncome - lastIncome) / lastIncome) * 100);

  return {
    thisIncome, thisExpense,
    lastIncome, lastExpense,
    expenseChange, incomeChange,
  };
};

// Saving tips analysis
export const analyzeSavings = (transactions, budget) => {
  const tips = [];
  const now = new Date();
  const thisMonthTxs = filterByMonth(transactions, now.getFullYear(), now.getMonth());
  const totalExpense = sumExpense(thisMonthTxs);
  const totalIncome = sumIncome(thisMonthTxs);
  const balance = totalIncome - totalExpense;

  // Food spending > 40%
  const foodCategories = ['Ăn uống'];
  const foodSpend = thisMonthTxs
    .filter(tx => tx.type === 'expense' && foodCategories.includes(tx.category))
    .reduce((a, t) => a + t.amount, 0);
  if (totalExpense > 0 && (foodSpend / totalExpense) > 0.4) {
    tips.push({
      type: 'warning',
      title: 'Chi phí ăn uống cao',
      message: `Ăn uống chiếm ${Math.round((foodSpend / totalExpense) * 100)}% tổng chi tiêu. Hãy thử nấu ăn tại nhà để tiết kiệm hơn!`,
      icon: '🍜',
    });
  }

  // Budget > 90%
  if (budget > 0) {
    const percent = calcBudgetPercent(totalExpense, budget);
    if (percent >= 90) {
      tips.push({
        type: 'danger',
        title: 'Gần vượt ngân sách',
        message: `Bạn đã dùng ${percent}% ngân sách tháng. Hãy cẩn thận với các khoản chi tiêu còn lại!`,
        icon: '⚠️',
      });
    }
  }

  // Positive balance
  if (balance > 0) {
    const savingAmount = Math.round(balance * 0.2);
    tips.push({
      type: 'success',
      title: 'Cơ hội tiết kiệm',
      message: `Bạn đang có số dư dương. Hãy để dành ít nhất ${new Intl.NumberFormat('vi-VN').format(savingAmount)}đ (20% số dư) vào quỹ tiết kiệm!`,
      icon: '💰',
    });
  }

  // Entertainment check
  const entertain = thisMonthTxs
    .filter(tx => tx.type === 'expense' && tx.category === 'Giải trí')
    .reduce((a, t) => a + t.amount, 0);
  if (totalExpense > 0 && (entertain / totalExpense) > 0.15) {
    tips.push({
      type: 'info',
      title: 'Giải trí nhiều',
      message: `Chi giải trí chiếm ${Math.round((entertain / totalExpense) * 100)}% tổng chi. Cân nhắc giảm bớt để có thêm tiền dự phòng!`,
      icon: '🎮',
    });
  }

  // Compare months
  const { expenseChange } = compareMonths(transactions);
  if (expenseChange > 20) {
    tips.push({
      type: 'warning',
      title: 'Chi tiêu tăng mạnh',
      message: `Chi tiêu tháng này tăng ${expenseChange}% so với tháng trước. Hãy xem lại các khoản chi để kiểm soát tốt hơn!`,
      icon: '📈',
    });
  }

  if (tips.length === 0) {
    tips.push({
      type: 'success',
      title: 'Tài chính ổn định',
      message: 'Bạn đang quản lý chi tiêu rất tốt! Hãy tiếp tục duy trì thói quen lành mạnh này.',
      icon: '🎉',
    });
  }

  return tips;
};
