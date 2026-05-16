# 🎓 Student Expense Tracker

> Ứng dụng quản lý chi tiêu cá nhân thông minh dành cho sinh viên

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 📖 Giới thiệu

**Student Expense Tracker** là ứng dụng web giúp sinh viên theo dõi thu nhập, chi tiêu, đặt ngân sách tháng, xem biểu đồ thống kê và nhận gợi ý tiết kiệm thông minh — tất cả chạy ngay trên trình duyệt, không cần backend hay cài đặt phức tạp.

---

## 🛠️ Công nghệ sử dụng

| Công nghệ | Mục đích |
|-----------|----------|
| **React 18** | UI Framework |
| **Vite 6** | Build tool, dev server |
| **Tailwind CSS v4** | Styling |
| **React Router DOM v7** | Client-side routing |
| **Recharts** | Biểu đồ (pie, bar, line) |
| **Lucide React** | Icons |
| **LocalStorage** | Lưu dữ liệu người dùng |

---

## ✨ Chức năng chính

| Trang | Chức năng |
|-------|-----------|
| 🔑 **Login / Register** | Đăng nhập, đăng ký, tài khoản demo |
| 📊 **Dashboard** | Thống kê tổng quan, biểu đồ, cảnh báo ngân sách |
| 💰 **Transactions** | Thêm/sửa/xóa giao dịch, tìm kiếm, lọc |
| 🏷️ **Categories** | Quản lý danh mục thu/chi, tùy chỉnh màu & icon |
| 🎯 **Budgets** | Đặt ngân sách tháng, theo dõi % sử dụng, cảnh báo |
| 📈 **Reports** | Thống kê chi tiết, so sánh tháng, xuất CSV |
| 💡 **Saving Tips** | Gợi ý tiết kiệm dựa trên dữ liệu thực |
| 👤 **Profile** | Hồ sơ, đổi mật khẩu, dark mode, xóa dữ liệu |

---

## 🚀 Chạy trên máy local

### Yêu cầu
- Node.js >= 18
- npm >= 9

### Cài đặt và chạy

```bash
# Clone project
git clone https://github.com/your-username/student-expense-tracker.git
cd student-expense-tracker

# Cài dependencies
npm install

# Chạy dev server
npm run dev
```

Mở trình duyệt tại: **http://localhost:5173**

### Build production

```bash
npm run build
```

Thư mục `dist/` sẽ được tạo ra.

---

## ☁️ Deploy lên Vercel

### Cách 1: Deploy tự động (khuyên dùng)

1. Push code lên GitHub
2. Vào [vercel.com](https://vercel.com) → **Add New Project**
3. **Import** repository từ GitHub
4. Cấu hình:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Bấm **Deploy** ✅

### Cách 2: Deploy qua Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

> ⚡ **Không cần** file `.env`, database hay backend — app chạy hoàn toàn phía client!

---

## 🔑 Tài khoản demo

| Thông tin | Giá trị |
|-----------|---------|
| **Email** | `student@example.com` |
| **Password** | `123456` |

Tài khoản demo đã có sẵn **dữ liệu mẫu** bao gồm:
- Thu nhập: Gia đình gửi (3.000.000đ), Lương làm thêm (1.200.000đ), Học bổng (500.000đ)
- Chi tiêu: Tiền trọ, ăn uống, đi lại, học tập, giải trí, mua sắm
- Ngân sách tháng: 3.500.000đ

---

## 📁 Cấu trúc project

```
student-expense-tracker/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/          # UI Components dùng chung
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   ├── Header.jsx       # Top header
│   │   ├── StatCard.jsx     # Thẻ thống kê
│   │   ├── TransactionModal.jsx  # Modal thêm/sửa giao dịch
│   │   ├── BudgetProgress.jsx    # Progress bar ngân sách
│   │   ├── ChartCard.jsx    # Wrapper cho biểu đồ
│   │   ├── EmptyState.jsx   # Empty state component
│   │   └── Toast.jsx        # Thông báo toast
│   ├── context/
│   │   └── AppContext.jsx   # Global state (auth, data, settings)
│   ├── data/
│   │   └── mockData.js      # Dữ liệu mẫu & constants
│   ├── layouts/
│   │   └── AppLayout.jsx    # Layout chính với sidebar
│   ├── pages/               # Các trang ứng dụng
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Transactions.jsx
│   │   ├── Categories.jsx
│   │   ├── Budgets.jsx
│   │   ├── Reports.jsx
│   │   ├── SavingTips.jsx
│   │   └── Profile.jsx
│   ├── utils/
│   │   ├── formatCurrency.js  # Format tiền VND
│   │   ├── storage.js         # LocalStorage helpers
│   │   ├── calculations.js    # Tính toán tài chính
│   │   └── dateHelpers.js     # Xử lý ngày tháng
│   ├── App.jsx              # Routes & providers
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles + Tailwind
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## 💡 Ghi chú kỹ thuật

- **Dữ liệu**: Toàn bộ lưu trong `localStorage` của trình duyệt. Dữ liệu chỉ tồn tại trên thiết bị hiện tại.
- **Phiên bản tương lai**: Có thể kết nối backend Node.js/Express + MySQL bằng cách thay thế các hàm trong `utils/storage.js` bằng API calls.
- **Cảnh báo ngân sách**: Tự động hiển thị khi đạt 70%, 90% và vượt 100%.
- **Xuất báo cáo**: Hỗ trợ xuất CSV với encoding UTF-8 (hỗ trợ tiếng Việt).

---

## 📝 License

MIT — Free to use and modify!
