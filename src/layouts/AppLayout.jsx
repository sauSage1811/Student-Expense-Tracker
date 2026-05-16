import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar, { MobileSidebar } from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import Toast from '../components/Toast.jsx';
import TransactionModal from '../components/TransactionModal.jsx';

const AppLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 flex-shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuClick={() => setMobileSidebarOpen(true)}
          onAddTransaction={() => setShowQuickAdd(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global toast */}
      <Toast />

      {/* Quick add modal */}
      <TransactionModal isOpen={showQuickAdd} onClose={() => setShowQuickAdd(false)} />
    </div>
  );
};

export default AppLayout;
