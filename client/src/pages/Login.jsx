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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-red-950 px-4">

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-800/70 backdrop-blur-xl border border-cyan-500/20 shadow-2xl rounded-2xl p-8">

        {/* Heading */}
        <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-red-400 to-cyan-400 bg-clip-text text-transparent">
          CardioShield AI
        </h2>

        <p className="text-center text-gray-400 text-sm mb-6">
          Secure Access to Cardiovascular Risk Intelligence Platform
        </p>

        {/* Form */}
        <form className="space-y-5" onSubmit={formSubmitKro}>

          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-300">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              placeholder="doctor@cardioshield.ai"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              placeholder="••••••••"
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
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* Register Link */}
          <div className="text-center text-gray-400 text-sm mt-4">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-cyan-400 font-medium hover:text-cyan-300"
            >
              Register
            </Link>
          </div>

        </form>

        {/* Footer */}
        <div className="mt-6 text-xs text-center text-gray-500">
          HIPAA-aware • Secure Authentication • Encrypted Session
        </div>

      </div>
    </div>
  );
};

export default Login;