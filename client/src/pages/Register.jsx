import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";
import api from "../config/api";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const [width, height] = useWindowSize();

  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !registerData.fullName ||
      !registerData.email ||
      !registerData.phone ||
      !registerData.password
    ) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/register", registerData);

      toast.success(res.data.message || "Registration Successful");

      setRegisterData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
      });

      // Show celebration
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        navigate("/login");
      }, 3000);

    } catch (error) {
      toast.error(
        `Error: ${error.response?.status || ""} ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showConfetti && <Confetti width={width} height={height} />}

      <div className="min-h-screen flex items-center justify-center bg-[#F5F1ED] px-4">

        {/* Register Card */}
        <div className="w-full mt-16 max-w-lg bg-white border border-[#E8DFF5] shadow-2xl rounded-2xl p-2">

          {/* Heading */}
          <h2 className="text-3xl font-bold text-center mb-2 text-[#4A3B5C]">
            Create CardioShield Account
          </h2>

          <p className="text-center text-[#6B5B7C] text-sm mb-6">
            Join the AI-Powered Cardiovascular Risk Platform
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Full Name */}
            <div>
              <label className="block mb-1 text-sm font-medium text-[#4A3B5C]">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={registerData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-[#F5F1ED] border border-[#E8DFF5] text-[#4A3B5C] placeholder-[#6B5B7C] focus:outline-none focus:ring-2 focus:ring-[#8B7FCF] transition"
                placeholder="Dr. John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 text-sm font-medium text-[#4A3B5C]">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-[#F5F1ED] border border-[#E8DFF5] text-[#4A3B5C] placeholder-[#6B5B7C] focus:outline-none focus:ring-2 focus:ring-[#8B7FCF] transition"
                placeholder="doctor@cardioshield.ai"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-1 text-sm font-medium text-[#4A3B5C]">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={registerData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-[#F5F1ED] border border-[#E8DFF5] text-[#4A3B5C] placeholder-[#6B5B7C] focus:outline-none focus:ring-2 focus:ring-[#8B7FCF] transition"
                placeholder="+91 9876543210"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1 text-sm font-medium text-[#4A3B5C]">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={registerData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-[#F5F1ED] border border-[#E8DFF5] text-[#4A3B5C] placeholder-[#6B5B7C] focus:outline-none focus:ring-2 focus:ring-[#8B7FCF] transition"
                placeholder="Create a secure password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg bg-[#8B7FCF] hover:bg-[#7A6EBE] text-white font-semibold shadow-lg transition-all duration-300 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Creating Account..." : "Register"}
            </button>

            {/* Login Link */}
            <div className="text-center text-[#6B5B7C] text-sm mt-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#8B7FCF] font-medium hover:text-[#7A6EBE]"
              >
                Sign In
              </Link>
            </div>

          </form>

          {/* Footer */}
          <div className="mt-6 text-xs text-center text-[#6B5B7C]">
            Secure Registration • Encrypted Data • Healthcare Compliance Ready
          </div>

        </div>
      </div>
    </>
  );
};

export default Register;