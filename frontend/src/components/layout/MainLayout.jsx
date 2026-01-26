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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenNotif={openNotif}
        />

        <main className="flex-1 min-h-screen">
          {/* Mobile Menu Button - Floating */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden fixed top-4 left-4 z-30 bg-indigo-600 text-white p-3 rounded-xl shadow-lg hover:bg-indigo-700 transition-all"
          >
            <IoMenu size={24} />
          </button>

          {/* Content Area */}
          <div className="p-4 sm:p-6 lg:p-8">
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
