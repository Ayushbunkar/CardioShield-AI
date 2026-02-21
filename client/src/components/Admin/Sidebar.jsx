// import React from "react";
// import {
//   FaTachometerAlt,
//   FaBoxes,
//   FaUsers,
//   FaCalendarCheck,
//   FaQuestionCircle,
//   FaCommentDots,
//   FaSignOutAlt,
// } from "react-icons/fa";
// import { FaTent } from "react-icons/fa6";
// import { GiCook } from "react-icons/gi";
// import api from "../../config/api";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";

// const Sidebar = ({ active, setActive }) => {
//   const { setUser, setIsLogin, setIsAdmin } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     const res = await api.get("/auth/logout");
//     setUser("");
//     sessionStorage.removeItem("EventUser");
//     setIsLogin(false);
//     setIsAdmin(false);
//     navigate("/");
//   };

//   return (
//     <>
//       <div className="w-100 bg-gradient-to-b from-[#fbe8d3] to-[#fff3e0] border-r border-[#c49b63] min-h-[87vh] p-6 flex flex-col justify-between shadow-xl">
//         <div>
//           <div className="border-b-2 border-[#c49b63] pb-4 h-fit text-center">
//             <span className="text-2xl font-bold text-[#8b1f1f] font-serif">
//               Admin Dashboard
//             </span>
//           </div>

//           <div className="py-6 px-2">
//             <ul className="grid gap-3 h-130 overflow-y-auto scrollbar-hide">
//               {[
//                 { key: "overview", label: "Overview", icon: <FaTachometerAlt className="text-xl" /> },
//                 { key: "banquetHall", label: "Banquet Hall", icon: <FaTent className="text-xl" /> },
//                 { key: "cateringService", label: "Catering Service", icon: <GiCook className="text-xl" /> },
//                 { key: "customers", label: "Customers", icon: <FaUsers className="text-xl" /> },
//                 { key: "bookings", label: "Bookings", icon: <FaCalendarCheck className="text-xl" /> },
//                 { key: "cusQueries", label: "Customer Queries", icon: <FaQuestionCircle className="text-xl" /> },
//                 { key: "cusFeedback", label: "Customer Feedback", icon: <FaCommentDots className="text-xl" /> },
//               ].map((item) => (
//                 <li
//                   key={item.key}
//                   className={`flex items-center gap-3 border border-[#c49b63] p-4 rounded-xl text-lg font-medium cursor-pointer transition-all duration-300 hover:bg-[#fce7d3] hover:text-[#8b1f1f] hover:shadow-md hover:scale-105 ${
//                     active === item.key
//                       ? "bg-[#fce7d3] text-[#8b1f1f] shadow-md scale-105"
//                       : ""
//                   }`}
//                   onClick={() => setActive(item.key)}
//                 >
//                   {item.icon} {item.label}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>

//         <div>
//           <button
//             className="text-lg text-[#8b1f1f] font-semibold w-full border-2 border-[#c49b63] p-4 rounded-xl flex gap-3 items-center justify-center hover:bg-[#8b1f1f] hover:text-white hover:border-[#8b1f1f] transition-all duration-300 hover:shadow-lg bg-[#fce7d3]"
//             onClick={handleLogout}
//           >
//             Logout <FaSignOutAlt className="text-xl" />
//           </button>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Sidebar;


import React from "react";
import {
  FaTachometerAlt,
  FaBoxes,
  FaUsers,
  FaCalendarCheck,
  FaQuestionCircle,
  FaCommentDots,
  FaSignOutAlt,
} from "react-icons/fa";
import { FaTent } from "react-icons/fa6";
import { GiCook } from "react-icons/gi";
import api from "../../config/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ active, setActive }) => {
  const { setUser, setIsLogin, setIsAdmin } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    const res = await api.get("/auth/logout");
    setUser("");
    sessionStorage.removeItem("EventUser");
    setIsLogin(false);
    setIsAdmin(false);
    navigate("/");
  };

  return (
    <>
      <div className="w-100 bg-gradient-to-b from-[#fbe8d3] to-[#fff3e0] border-r border-[#c49b63] min-h-[87vh] p-4 flex flex-col justify-between shadow-lg">
        <div>
          <div className="border-b-2 border-[#c49b63] pb-4 h-fit text-center">
            <span className="text-2xl font-bold text-[#8b1f1f] font-serif">
              Admin Dashboard
            </span>
          </div>

          <div className="py-4 px-2">
            <ul className="grid gap-3 h-100 overflow-y-auto scrollbar-hide">
              <li
                className={`flex items-center gap-3 border border-[#c49b63] p-4 rounded-xl text-lg font-medium cursor-pointer transition-all duration-300 hover:bg-[#fce7d3] hover:text-[#8b1f1f] hover:shadow-md hover:scale-105 ${
                  active === "overview" &&
                  "bg-[#fce7d3] text-[#8b1f1f] shadow-md scale-105"
                }`}
                onClick={() => setActive("overview")}
              >
                <FaTachometerAlt className="text-xl" /> Overview
              </li>
              <li
                className={`flex items-center gap-3 border border-[#c49b63] p-4 rounded-xl text-lg font-medium cursor-pointer transition-all duration-300 hover:bg-[#fce7d3] hover:text-[#8b1f1f] hover:shadow-md hover:scale-105 ${
                  active === "banquetHall" &&
                  "bg-[#fce7d3] text-[#8b1f1f] shadow-md scale-105"
                }`}
                onClick={() => setActive("banquetHall")}
              >
                <FaTent className="text-xl" /> Banquet Hall
              </li>
              <li
                className={`flex items-center gap-3 border border-[#c49b63] p-4 rounded-xl text-lg font-medium cursor-pointer transition-all duration-300 hover:bg-[#fce7d3] hover:text-[#8b1f1f] hover:shadow-md hover:scale-105 ${
                  active === "cateringService" &&
                  "bg-[#fce7d3] text-[#8b1f1f] shadow-md scale-105"
                }`}
                onClick={() => setActive("cateringService")}
              >
                <GiCook className="text-xl" /> Catering Service
              </li>
              <li
                className={`flex items-center gap-3 border border-[#c49b63] p-4 rounded-xl text-lg font-medium cursor-pointer transition-all duration-300 hover:bg-[#fce7d3] hover:text-[#8b1f1f] hover:shadow-md hover:scale-105 ${
                  active === "customers" &&
                  "bg-[#fce7d3] text-[#8b1f1f] shadow-md scale-105"
                }`}
                onClick={() => setActive("customers")}
              >
                <FaUsers className="text-xl" /> Customers
              </li>
              <li
                className={`flex items-center gap-3 border border-[#c49b63] p-4 rounded-xl text-lg font-medium cursor-pointer transition-all duration-300 hover:bg-[#fce7d3] hover:text-[#8b1f1f] hover:shadow-md hover:scale-105 ${
                  active === "bookings" &&
                  "bg-[#fce7d3] text-[#8b1f1f] shadow-md scale-105"
                }`}
                onClick={() => setActive("bookings")}
              >
                <FaCalendarCheck className="text-xl" /> Bookings
              </li>
              <li
                className={`flex items-center gap-3 border border-[#c49b63] p-4 rounded-xl text-lg font-medium cursor-pointer transition-all duration-300 hover:bg-[#fce7d3] hover:text-[#8b1f1f] hover:shadow-md hover:scale-105 ${
                  active === "cusQueries" &&
                  "bg-[#fce7d3] text-[#8b1f1f] shadow-md scale-105"
                }`}
                onClick={() => setActive("cusQueries")}
              >
                <FaQuestionCircle className="text-xl" /> Customer Queries
              </li>
              <li
                className={`flex items-center gap-3 border border-[#c49b63] p-4 rounded-xl text-lg font-medium cursor-pointer transition-all duration-300 hover:bg-[#fce7d3] hover:text-[#8b1f1f] hover:shadow-md hover:scale-105 ${
                  active === "cusFeedback" &&
                  "bg-[#fce7d3] text-[#8b1f1f] shadow-md scale-105"
                }`}
                onClick={() => setActive("cusFeedback")}
              >
                <FaCommentDots className="text-xl" /> Customer Feedback
              </li>
            </ul>
          </div>
        </div>
        <div>
          <button
            className="text-lg text-[#8b1f1f] font-semibold w-full border-2 border-[#c49b63] p-4 rounded-xl flex gap-3 items-center justify-center hover:bg-[#8b1f1f] hover:text-white hover:border-[#8b1f1f] transition-all duration-300 hover:shadow-lg bg-[#fce7d3]"
            onClick={handleLogout}
          >
            Logout
            <FaSignOutAlt className="text-xl" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
