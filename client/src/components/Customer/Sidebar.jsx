import React from "react";
import {
  FaTachometerAlt,
  FaUser,
  FaCalendarCheck,
  FaLifeRing,
  FaCommentDots,
  FaSignOutAlt,
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
    sessionStorage.removeItem("EventUser");
    setIsLogin(false);
    setIsAdmin(false);
    navigate("/");
  };

  const getActiveClass = (key) =>
    active === key
      ? "bg-gradient-to-r from-[#8b1f1f] to-[#c49b63] text-white shadow-md scale-105"
      : "";

  return (
    <div className="w-100 bg-gradient-to-b from-[#fff3e0] to-[#fbe8d3] border-r border-[#c49b63] min-h-[87vh] p-6 flex flex-col justify-between shadow-xl">
      <div>
        <div className="border-b-2 border-[#c49b63] pb-4 h-fit text-center">
          <span className="text-2xl font-bold text-[#8b1f1f] font-serif">
            {user.fullName.split(" ")[0]}'s Dashboard
          </span>
        </div>

        <div className="py-8 px-2">
          <ul className="grid gap-3">
            {[
              { key: "overview", icon: <FaTachometerAlt />, label: "Overview" },
              { key: "profile", icon: <FaUser />, label: "Profile" },
              { key: "bookings", icon: <FaCalendarCheck />, label: "Bookings" },
              { key: "support", icon: <FaLifeRing />, label: "Support" },
              { key: "feedback", icon: <FaCommentDots />, label: "Feedback" },
            ].map((item) => (
              <li
                key={item.key}
                className={`flex items-center gap-3 border border-[#c49b63] p-4 rounded-xl text-lg font-medium cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-[#8b1f1f] hover:to-[#c49b63] hover:text-white hover:shadow-md hover:scale-105 text-[#5e2c04] ${getActiveClass(item.key)}`}
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
          className="text-lg text-[#8b1f1f] font-semibold w-full border-2 border-[#c49b63] p-4 rounded-xl flex gap-3 items-center justify-center hover:bg-[#8b1f1f] hover:text-white hover:border-[#8b1f1f] transition-all duration-300 hover:shadow-lg bg-[#fbe8d3]"
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
