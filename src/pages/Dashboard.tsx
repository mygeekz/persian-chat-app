import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { useAppContext } from '@/context/AppContext';

const Dashboard = () => {
  const { state } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <TopBar onToggleSidebar={handleToggleSidebar} />
      
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
        
        <main className="flex-1 p-6 transition-all duration-300">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <h1 className="text-4xl font-bold mb-4 text-foreground">
                سلام! داشبورد
              </h1>
              <p className="text-xl text-muted-foreground">
                به سیستم مدیریت خوش آمدید
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;