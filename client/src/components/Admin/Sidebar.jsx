import React from "react";
import {
  LayoutDashboard,
  Users,
  Activity,
  Brain,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  HeartPulse,
  Shield,
  Stethoscope,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "assessments", label: "Assessments", icon: Activity },
  { id: "aiMonitoring", label: "AI Monitoring", icon: Brain },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "queries", label: "Contact Queries", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
];

const Sidebar = ({ active, setActive }) => {
  const { user, setUser, setIsLogin, setIsAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:4500/auth/logout",
        {},
        { withCredentials: true }
      );
    } catch {
      /* ignore */
    }
    setUser("");
    setIsLogin(false);
    setIsAdmin(false);
    sessionStorage.removeItem("EventUser");
    navigate("/login");
  };

  return (
    <aside className="w-64 h-[calc(100vh-56px)] fixed top-[56px] left-0 bg-[#0f0a1a] border-r border-purple-900/30 flex flex-col justify-between z-40">
      {/* Logo */}
      <div>
        <div className="flex items-center gap-2 px-5 py-5 border-b border-purple-900/30">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <HeartPulse size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">
              CardioShield
            </h1>
            <p className="text-purple-400 text-[10px]">Admin Dashboard</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="mt-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
          
          {/* AI Assessment Link - Separate Route */}
          <Link
            to="/admin/ai-assessment"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-purple-500/30"
          >
            <Stethoscope size={18} />
            AI Assessment
          </Link>
        </nav>
      </div>

      {/* Bottom User / Logout */}
      <div className="px-3 pb-2">
        <div className="border-t border-purple-900/30 pt-2 mb-1">
          <div className="flex items-center gap-3 px-3 mb-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.fullName?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.fullName || "Admin"}
              </p>
              <p className="text-gray-500 text-[10px] truncate">
                {user?.email || "admin@cardioshield.ai"}
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/30"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
