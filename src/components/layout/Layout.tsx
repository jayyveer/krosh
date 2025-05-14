import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import TopNavbar from './TopNavbar';
import Sidebar from './Sidebar';
import BottomTabs from './BottomTabs';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile and set sidebar state accordingly
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile); // Open on desktop, closed on mobile
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    // Only close sidebar on mobile
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNavbar toggleSidebar={toggleSidebar} />

      <div className="flex flex-1 relative">
        <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />

        <main className="flex-1 pb-16 md:pb-0 pt-16 overflow-auto">
          <div className="container mx-auto px-4 py-0 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Tabs for Mobile Only */}
      <div className="md:hidden">
        <BottomTabs />
      </div>
    </div>
  );
};

export default Layout;