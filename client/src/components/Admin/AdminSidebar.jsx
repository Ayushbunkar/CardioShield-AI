import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Activity,
  Brain,
  BarChart3,
  Settings,
  LogOut,
  HeartPulse,
  Shield,
  Stethoscope,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../config/api";

/**
 * AdminSidebar - Fixed sidebar for admin dashboard
 * 
 * Navigation items:
 * - Dashboard (Overview)
 * - Users
 * - Assessments
 * - AI Assessment (prediction page)
 * - Analytics
 * - Settings
 * - Logout
 */

const navItems = [
  { 
    id: "dashboard", 
    label: "Dashboard", 
    icon: LayoutDashboard, 
    href: "/admin",
    description: "Overview & Stats"
  },
  { 
    id: "users", 
    label: "Users", 
    icon: Users, 
    href: "/admin/users",
    description: "User Management"
  },
  { 
    id: "assessments", 
    label: "Assessments", 
    icon: Activity, 
    href: "/admin/assessments",
    description: "All Risk Assessments"
  },
  { 
    id: "ai-assessment", 
    label: "AI Assessment", 
    icon: Brain, 
    href: "/admin/ai-assessment",
    description: "AI Prediction Tool"
  },
  { 
    id: "analytics", 
    label: "Analytics", 
    icon: BarChart3, 
    href: "/admin/analytics",
    description: "Reports & Insights"
  },
  { 
    id: "settings", 
    label: "Settings", 
    icon: Settings, 
    href: "/admin/settings",
    description: "System Configuration"
  },
];

const AdminSidebar = ({ activeNav }) => {
  const { user, setUser, setIsLogin, setIsAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await api.get("/auth/logout");
    } catch {
      /* ignore */
    }
    setUser(null);
    setIsLogin(false);
    setIsAdmin(false);
    sessionStorage.removeItem("EventUser");
    navigate("/login");
  };

  // Determine active nav item
  const getIsActive = (item) => {
    if (activeNav) return activeNav === item.id;
    return location.pathname === item.href || 
           (item.href !== '/admin' && location.pathname.startsWith(item.href));
  };

  return (
    <aside className="h-full bg-gradient-to-b from-[#0f0a1a] to-[#1a1225] border-r border-purple-900/30 flex flex-col shadow-xl">
      {/* Logo Header */}
      <div className="px-5 py-6 border-b border-purple-900/30">
        <Link to="/admin" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/30 transition-shadow">
            <HeartPulse size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight flex items-center gap-1">
              CardioShield
              <Shield size={14} className="text-purple-400" />
            </h1>
            <p className="text-purple-400/80 text-xs font-medium">Admin Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-3">
          <span className="text-purple-500/60 text-xs font-semibold uppercase tracking-wider">
            Main Menu
          </span>
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = getIsActive(item);
          
          return (
            <Link
              key={item.id}
              to={item.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-purple-600/30 to-pink-600/20 text-white border border-purple-500/40 shadow-lg shadow-purple-500/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <div className={`p-2 rounded-lg transition-colors ${
                isActive 
                  ? "bg-purple-500/20" 
                  : "bg-white/5 group-hover:bg-purple-500/10"
              }`}>
                <Icon size={18} className={isActive ? "text-purple-300" : ""} />
              </div>
              <div className="flex-1">
                <span className="block">{item.label}</span>
                <span className={`text-[10px] ${isActive ? 'text-purple-300/70' : 'text-gray-500'}`}>
                  {item.description}
                </span>
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* AI Health Status */}
      <div className="px-4 py-3 mx-3 mb-3 rounded-xl bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-green-400 text-xs font-medium">AI System Online</span>
        </div>
        <p className="text-gray-500 text-[10px] mt-1">LightGBM Model v2.0</p>
      </div>

      {/* User Profile & Logout */}
      <div className="border-t border-purple-900/30 p-4">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
            {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.fullName || "Admin"}
            </p>
            <p className="text-gray-500 text-xs truncate">
              {user?.email || "admin@cardioshield.ai"}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 transition-all duration-200"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
