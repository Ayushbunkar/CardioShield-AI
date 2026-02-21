import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../config/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { setUser, setIsLogin, setIsAdmin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const formSubmitKro = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      toast.success(res.data.message || "Login Successful");

      // Reset form
      setEmail("");
      setPassword("");

      // Set auth context
      setUser(res.data.data);
      setIsLogin(true);

      if (res.data.data.role === "Admin") {
        setIsAdmin(true);
        navigate("/adminpanel");
      } else {
        setIsAdmin(false);
        navigate("/dashboard");
      }

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
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1ED] px-4">

      {/* Login Card */}
      <div className="w-full max-w-md bg-white border border-[#E8DFF5] shadow-2xl rounded-2xl p-8">

        {/* Heading */}
        <h2 className="text-3xl font-bold text-center mb-2 text-[#4A3B5C]">
          CardioShield AI
        </h2>

        <p className="text-center text-[#6B5B7C] text-sm mb-6">
          Secure Access to Cardiovascular Risk Intelligence Platform
        </p>

        {/* Form */}
        <form className="space-y-5" onSubmit={formSubmitKro}>

          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-[#4A3B5C]">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-[#F5F1ED] border border-[#E8DFF5] text-[#4A3B5C] placeholder-[#6B5B7C] focus:outline-none focus:ring-2 focus:ring-[#8B7FCF] transition"
              placeholder="doctor@cardioshield.ai"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-sm font-medium text-[#4A3B5C]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-[#F5F1ED] border border-[#E8DFF5] text-[#4A3B5C] placeholder-[#6B5B7C] focus:outline-none focus:ring-2 focus:ring-[#8B7FCF] transition"
              placeholder="••••••••"
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
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* Register Link */}
          <div className="text-center text-[#6B5B7C] text-sm mt-4">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#8B7FCF] font-medium hover:text-[#7A6EBE]"
            >
              Register
            </Link>
          </div>

        </form>

        {/* Footer */}
        <div className="mt-6 text-xs text-center text-[#6B5B7C]">
          HIPAA-aware • Secure Authentication • Encrypted Session
        </div>

      </div>
    </div>
  );
};

export default Login;