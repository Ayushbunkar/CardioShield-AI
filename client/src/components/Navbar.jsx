import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-[#F5F1ED] shadow-sm py-4 px-8">
      
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
        <div className="hidden md:flex items-center gap-8 text-[#6B5B7C] font-medium">
          
          <Link 
            to="/banquets" 
            className="hover:text-[#8B7FCF] transition duration-200"
          >
            Banquet Halls
          </Link>

          <Link 
            to="/catering" 
            className="hover:text-[#8B7FCF] transition duration-200"
          >
            Catering
          </Link>

          <Link 
            to="/about" 
            className="hover:text-[#8B7FCF] transition duration-200"
          >
            Success Stories
          </Link>

          <Link 
            to="/about" 
            className="hover:text-[#8B7FCF] transition duration-200"
          >
            About Us
          </Link>

          <Link 
            to="/contact" 
            className="hover:text-[#8B7FCF] transition duration-200"
          >
            Contact
          </Link>

        </div>

        {/* CTA Button */}
        <Link 
          to="/login" 
          className="bg-[#8B7FCF] hover:bg-[#7A6EBE] text-white px-6 py-2.5 rounded-lg font-medium transition duration-200 shadow-sm"
        >
          Need Help?
        </Link>

      </div>
    </nav>
  );
};

export default Navbar;