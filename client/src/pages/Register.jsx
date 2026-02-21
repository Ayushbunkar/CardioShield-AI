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

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-red-950 px-4">

        {/* Register Card */}
        <div className="w-full mt-16 max-w-lg bg-slate-800/70 backdrop-blur-xl border border-cyan-500/20 shadow-2xl rounded-2xl p-2">

          {/* Heading */}
          <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-red-400 to-cyan-400 bg-clip-text text-transparent">
            Create CardioShield Account
          </h2>

          <p className="text-center text-gray-400 text-sm mb-6">
            Join the AI-Powered Cardiovascular Risk Platform
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Full Name */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={registerData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                placeholder="Dr. John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={registerData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                placeholder="doctor@cardioshield.ai"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={registerData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                placeholder="+91 9876543210"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={registerData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                placeholder="Create a secure password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg bg-gradient-to-r from-red-500 to-cyan-500 text-white font-semibold shadow-lg transition-all duration-300 ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"
              }`}
            >
              {loading ? "Creating Account..." : "Register"}
            </button>

            {/* Login Link */}
            <div className="text-center text-gray-400 text-sm mt-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-cyan-400 font-medium hover:text-cyan-300"
              >
                Sign In
              </Link>
            </div>

          </form>

          {/* Footer */}
          <div className="mt-6 text-xs text-center text-gray-500">
            Secure Registration • Encrypted Data • Healthcare Compliance Ready
          </div>

        </div>
      </div>
    </>
  );
};

export default Register;