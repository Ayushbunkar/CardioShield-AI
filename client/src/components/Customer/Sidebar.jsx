import React from "react";
import {
  FaTachometerAlt,
  FaUser,
  FaCalendarCheck,
  FaLifeRing,
  FaCommentDots,
  FaSignOutAlt,
  FaHeartbeat,
} from "react-icons/fa";
import api from "../../config/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ active, setActive }) => {
  const { setUser, setIsLogin, setIsAdmin, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const res = await api.get("/auth/logout");
    setUser("");
    localStorage.removeItem("EventUser");
    sessionStorage.removeItem("EventUser");
    setIsLogin(false);
    setIsAdmin(false);
    navigate("/");
  };

  const getActiveClass = (key) =>
    active === key
      ? "bg-[#8B7FCF] text-white shadow-md scale-105"
      : "";

  return (
    <div className="w-100 bg-gradient-to-b from-[#F5F1ED] to-white border-r border-[#E8DFF5] min-h-[87vh] p-6 flex flex-col justify-between shadow-xl">
      <div>
        <div className="border-b-2 border-[#E8DFF5] pb-4 h-fit text-center">
          <span className="text-2xl font-bold text-[#4A3B5C] font-serif">
            {user.fullName.split(" ")[0]}'s Dashboard
          </span>
        </div>

        <div className="py-8 px-2">
          <ul className="grid gap-3">
            {[
              { key: "overview", icon: <FaTachometerAlt />, label: "Overview" },
              { key: "aihealth", icon: <FaHeartbeat />, label: "AI Health" },
              { key: "profile", icon: <FaUser />, label: "Profile" },
              { key: "bookings", icon: <FaCalendarCheck />, label: "Bookings" },
              { key: "support", icon: <FaLifeRing />, label: "Support" },
              { key: "feedback", icon: <FaCommentDots />, label: "Feedback" },
            ].map((item) => (
              <li
                key={item.key}
                className={`flex items-center gap-3 border border-[#E8DFF5] p-4 rounded-xl text-lg font-medium cursor-pointer transition-all duration-300 hover:bg-[#8B7FCF] hover:text-white hover:shadow-md hover:scale-105 text-[#4A3B5C] ${getActiveClass(item.key)}`}
                onClick={() => setActive(item.key)}
              >
                <span className="text-xl">{item.icon}</span> {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <button
          className="text-lg text-[#4A3B5C] font-semibold w-full border-2 border-[#E8DFF5] p-4 rounded-xl flex gap-3 items-center justify-center hover:bg-[#B8A4C9] hover:text-white hover:border-[#B8A4C9] transition-all duration-300 hover:shadow-lg bg-white"
          onClick={handleLogout}
        >
          Logout
          <FaSignOutAlt className="text-xl" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
