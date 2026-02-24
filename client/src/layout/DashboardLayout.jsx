import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/Admin/AdminSidebar';

/**
 * DashboardLayout - Admin Dashboard wrapper with fixed sidebar
 * Provides consistent layout across all admin pages with:
 * - Fixed left sidebar (sticky)
 * - Independent scrolling content area
 * - Route protection (admin only)
 * - Modern medical theme styling
 */
const DashboardLayout = ({ children, activeNav }) => {
  const navigate = useNavigate();
  const { isLogin, isAdmin, user } = useAuth();

  // Route protection - redirect if not admin
  useEffect(() => {
    if (!isLogin) {
      navigate('/login');
    } else if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [isLogin, isAdmin, navigate]);

  // Don't render if not authenticated as admin
  if (!isLogin || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8B7FCF] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex">
      {/* Fixed Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 z-50">
        <AdminSidebar activeNav={activeNav} />
      </aside>

      {/* Main Content Area - scrolls independently */}
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
