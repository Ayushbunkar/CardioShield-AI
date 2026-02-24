import React, { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Palette,
  Save,
  CheckCircle,
  Mail,
  Key,
  Globe,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const SERVER = "http://localhost:4500";

const SectionCard = ({ title, icon: Icon, children }) => (
  <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-5">
    <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
      <Icon size={16} className="text-purple-400" /> {title}
    </h2>
    {children}
  </div>
);

const Settings = () => {
  const { user, setUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  /* Profile editing state */
  const [profile, setProfile] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  /* Password */
  const [pw, setPw] = useState({ current: "", newPw: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");

  /* Notification prefs (local only) */
  const [notifs, setNotifs] = useState({
    emailAlerts: true,
    highRiskAlerts: true,
    weeklyReport: false,
  });

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      const res = await axios.put(
        `${SERVER}/user/update`,
        {
          fullName: profile.fullName,
          phone: profile.phone,
        },
        { withCredentials: true }
      );
      if (res.data?.data) {
        setUser(res.data.data);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPwMsg("");
    if (pw.newPw !== pw.confirm) {
      setPwMsg("New passwords do not match");
      return;
    }
    if (pw.newPw.length < 6) {
      setPwMsg("Password must be at least 6 characters");
      return;
    }
    try {
      await axios.put(
        `${SERVER}/user/change-password`,
        { currentPassword: pw.current, newPassword: pw.newPw },
        { withCredentials: true }
      );
      setPwMsg("Password changed successfully!");
      setPw({ current: "", newPw: "", confirm: "" });
    } catch (e) {
      setPwMsg(e?.response?.data?.message || "Failed to change password");
    }
  };

  const inputCls =
    "w-full bg-white/5 border border-purple-900/30 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50";

  return (
    <div className="h-[100vh] overflow-y-auto bg-[#0b0614] px-5 pb-5">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0b0614] pt-5 pb-3">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-500 text-sm">
          Manage your profile, security, and preferences
        </p>
      </div>

      <div className="relative z-0">
      {/* Success Banner */}
      {saved && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mb-4 text-sm text-emerald-300">
          <CheckCircle size={16} /> Profile updated successfully
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Profile */}
        <SectionCard title="Profile Information" icon={User}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, fullName: e.target.value }))
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className={`${inputCls} opacity-50 cursor-not-allowed`}
              />
              <p className="text-[10px] text-gray-600 mt-1">
                Email cannot be changed
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Phone</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, phone: e.target.value }))
                }
                className={inputCls}
              />
            </div>
            <button
              onClick={handleProfileSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-lg text-sm text-white transition"
            >
              <Save size={14} />
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </SectionCard>

        {/* Change Password */}
        <SectionCard title="Change Password" icon={Key}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Current Password
              </label>
              <input
                type="password"
                value={pw.current}
                onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
                className={inputCls}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                New Password
              </label>
              <input
                type="password"
                value={pw.newPw}
                onChange={(e) => setPw((p) => ({ ...p, newPw: e.target.value }))}
                className={inputCls}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Confirm New Password
              </label>
              <input
                type="password"
                value={pw.confirm}
                onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
                className={inputCls}
                placeholder="••••••••"
              />
            </div>
            {pwMsg && (
              <p
                className={`text-xs ${
                  pwMsg.includes("success") ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {pwMsg}
              </p>
            )}
            <button
              onClick={handlePasswordChange}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm text-white transition"
            >
              <Shield size={14} /> Update Password
            </button>
          </div>
        </SectionCard>

        {/* Notification Preferences */}
        <SectionCard title="Notifications" icon={Bell}>
          <div className="space-y-3">
            {[
              {
                key: "emailAlerts",
                label: "Email Alerts",
                desc: "Receive email notifications for critical events",
              },
              {
                key: "highRiskAlerts",
                label: "High-Risk Alerts",
                desc: "Get notified when a patient is flagged high risk",
              },
              {
                key: "weeklyReport",
                label: "Weekly Summary",
                desc: "Receive a weekly analytics summary email",
              },
            ].map((n) => (
              <div
                key={n.key}
                className="flex items-center justify-between bg-white/[0.03] rounded-lg px-4 py-3"
              >
                <div>
                  <p className="text-sm text-white">{n.label}</p>
                  <p className="text-[10px] text-gray-500">{n.desc}</p>
                </div>
                <button
                  onClick={() =>
                    setNotifs((prev) => ({
                      ...prev,
                      [n.key]: !prev[n.key],
                    }))
                  }
                  className={`w-10 h-5 rounded-full transition-colors relative ${
                    notifs[n.key] ? "bg-purple-500" : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      notifs[n.key] ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* System Info */}
        <SectionCard title="System Information" icon={Globe}>
          <div className="space-y-2">
            {[
              ["App Version", "1.0.0"],
              ["Backend Server", "http://localhost:4500"],
              ["AI Backend", "http://localhost:5001"],
              ["Database", "MongoDB Atlas"],
              ["Auth Method", "JWT (Cookie-based)"],
              ["Admin Role", user?.role || "Admin"],
            ].map(([k, v], i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-2"
              >
                <span className="text-xs text-gray-400">{k}</span>
                <span className="text-xs text-white font-medium">{v}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
      </div>
    </div>
  );
};

export default Settings;
