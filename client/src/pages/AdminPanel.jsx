import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Admin/Sidebar";
import Overview from "../components/Admin/Overview";
import Users from "../components/Admin/Users";
import Assessments from "../components/Admin/Assessments";
import AIMonitoring from "../components/Admin/AIMonitoring";
import Analytics from "../components/Admin/Analytics";
import ContactQueries from "../components/Admin/ContactQueries";
import Settings from "../components/Admin/Settings";

const AdminPannel = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");
  const { isLogin, isAdmin } = useAuth();

  useEffect(() => {
    if (!isLogin) {
      navigate("/login");
    }
  }, [isLogin, isAdmin, navigate]);

  return (
    <div className="flex">
      <Sidebar active={active} setActive={setActive} />
      <div className="flex-1 min-w-0 ml-64 overflow-y-auto">
        {active === "overview" && <Overview />}
        {active === "users" && <Users />}
        {active === "assessments" && <Assessments />}
        {active === "aiMonitoring" && <AIMonitoring />}
        {active === "analytics" && <Analytics />}
        {active === "queries" && <ContactQueries />}
        {active === "settings" && <Settings />}
      </div>
    </div>
  );
};

export default AdminPannel;