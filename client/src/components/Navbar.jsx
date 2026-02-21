import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserMd, FaUserPlus } from "react-icons/fa";
import { Heart, LayoutDashboard, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isLogin, isAdmin, user, setUser, setIsLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("EventUser");
    setUser("");
    setIsLogin(false);
    navigate("/");
  };

  return (
    <nav className="bg-[#F5F1ED] shadow-md py-3 px-8 sticky top-0 z-50">
      
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              <span className="text-[#8B7FCF]">Cardio</span>
              <span className="text-[#4A3B5C]">Shield AI</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 text-[#6B5B7C] font-medium">
          
          <Link 
            to="/"
            className="hover:text-[#8B7FCF] transition duration-200 hover:scale-105"
          >
            Home
          </Link>

          <Link 
            to="/ai" 
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#8B7FCF] to-[#6B5B9A] text-white rounded-lg hover:shadow-lg transition duration-200 hover:scale-105"
          >
            <Heart className="w-4 h-4" />
            AI Assessment
          </Link>

          <Link 
            to="/about" 
            className="hover:text-[#8B7FCF] transition duration-200 hover:scale-105"
          >
            About Us
          </Link>

          <Link 
            to="/contact" 
            className="hover:text-[#8B7FCF] transition duration-200 hover:scale-105"
          >
            Contact Us
          </Link>

        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {isLogin ? (
            <>
              {/* User Info */}
              <div className="hidden md:flex items-center gap-2 text-[#6B5B7C]">
                <User className="w-4 h-4" />
                <span className="font-medium">{user?.fullName || 'User'}</span>
              </div>

              {/* Dashboard Button */}
              <Link 
                to={isAdmin ? "/admin" : "/dashboard"} 
                className="flex items-center gap-2 bg-[#8B7FCF] hover:bg-[#7A6EBE] text-white px-5 py-2.5 rounded-lg font-medium transition duration-200 shadow-sm hover:shadow-md"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-[#6B5B7C] hover:text-red-600 font-medium transition duration-200 px-4 py-2 rounded-lg hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="hidden md:flex items-center gap-2 text-[#6B5B7C] hover:text-[#8B7FCF] font-medium transition duration-200 px-4 py-2 rounded-lg hover:bg-[#E8DFF5]"
              >
                <FaUserMd className="text-lg" />
                Login
              </Link>

              <Link 
                to="/register" 
                className="flex items-center gap-2 bg-[#8B7FCF] hover:bg-[#7A6EBE] text-white px-5 py-2.5 rounded-lg font-medium transition duration-200 shadow-sm hover:shadow-md"
              >
                <FaUserPlus className="text-lg" />
                Register
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;