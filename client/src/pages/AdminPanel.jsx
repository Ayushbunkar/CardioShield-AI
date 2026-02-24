import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Overview from "../components/Admin/Overview";
import Users from "../components/Admin/Users";
import Assessments from "../components/Admin/Assessments";
import AIMonitoring from "../components/Admin/AIMonitoring";
import Analytics from "../components/Admin/Analytics";
import ContactQueries from "../components/Admin/ContactQueries";
import { HeartPulse, LayoutDashboard, Users as UsersIcon, Activity, Brain, BarChart3, MessageSquare } from "lucide-react";

const AdminPannel = () => {
  const navigate = useNavigate();
  const { isLogin, isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    if (!isLogin) {
      navigate("/login");
    }
  }, [isLogin, isAdmin, navigate]);

  const sections = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: UsersIcon },
    { id: "assessments", label: "Assessments", icon: Activity },
    { id: "aiMonitoring", label: "AI Monitoring", icon: Brain },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "queries", label: "Contact Queries", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#0f0a1a]">
      {/* Header */}
      <div className="bg-[#0f0a1a] border-b border-purple-900/30 px-6 py-4 sticky top-14 z-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <HeartPulse size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">CardioShield Admin</h1>
                <p className="text-purple-400 text-xs">Dashboard Management</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-purple-600 text-white"
                      : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon size={16} />
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto">
        {activeSection === "overview" && <Overview />}
        {activeSection === "users" && <Users />}
        {activeSection === "assessments" && <Assessments />}
        {activeSection === "aiMonitoring" && <AIMonitoring />}
        {activeSection === "analytics" && <Analytics />}
        {activeSection === "queries" && <ContactQueries />}
      </div>
    </div>
  );
};

export default AdminPannel;