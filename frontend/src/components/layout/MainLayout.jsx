import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { IoMenu } from 'react-icons/io5';
import NotificationModal from './NotificationModal';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const openNotif = () => {
    setIsNotifOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenNotif={openNotif}
        />

        <main className="flex-1 min-h-screen flex flex-col">
          {/* Content Area */}
          <div className="flex-1 p-4 sm:p-6 lg:p-10">
            <Outlet />
          </div>
        </main>
      </div>

      <NotificationModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />
    </div>
  );
};

export default MainLayout;
