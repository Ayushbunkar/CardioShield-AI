import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { User, Mail, Phone, MapPin, Save, CheckCircle } from "lucide-react";

const SERVER = "http://localhost:4500";

const Profile = () => {
  const { user, setUser, isLogin } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    gender: user?.gender || "N/A",
    age: user?.age || "",
    occupation: user?.occupation || "",
    address: user?.address || "",
    city: user?.city || "",
    district: user?.district || "",
    state: user?.state || "",
    smokingStatus: user?.smokingStatus || "N/A",
    familyHistory: user?.familyHistory || "",
  });

  useEffect(() => {
    if (!isLogin) navigate("/login");
  }, [isLogin, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await axios.put(
        `${SERVER}/user/update`,
        form,
        { withCredentials: true }
      );
      if (res.data?.data) {
        setUser(res.data.data);
      }
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 disabled:bg-gray-50 disabled:text-gray-400";

  return (
    <div>
      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4 text-sm text-green-700">
          <CheckCircle size={16} /> Profile updated successfully
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Avatar & Name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold">
            {user?.fullName?.charAt(0) || "U"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {user?.fullName || "User"}
            </h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="ml-auto px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition"
          >
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Full Name", name: "fullName", icon: User },
            { label: "Phone", name: "phone", icon: Phone },
            { label: "Age", name: "age", type: "number" },
            { label: "Occupation", name: "occupation" },
            { label: "Address", name: "address", icon: MapPin },
            { label: "City", name: "city" },
            { label: "District", name: "district" },
            { label: "State", name: "state" },
          ].map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.name}>
                <label className="text-xs text-gray-500 mb-1 block">
                  {field.label}
                </label>
                <input
                  type={field.type || "text"}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  disabled={!editing}
                  className={inputCls}
                />
              </div>
            );
          })}

          {/* Gender */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              disabled={!editing}
              className={inputCls}
            >
              <option value="N/A">N/A</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Smoking */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Smoking Status
            </label>
            <select
              name="smokingStatus"
              value={form.smokingStatus}
              onChange={handleChange}
              disabled={!editing}
              className={inputCls}
            >
              <option value="N/A">N/A</option>
              <option value="Never">Never</option>
              <option value="Former">Former</option>
              <option value="Current">Current</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          {/* Family History */}
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">
              Family History of Heart Disease
            </label>
            <textarea
              name="familyHistory"
              value={form.familyHistory}
              onChange={handleChange}
              disabled={!editing}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder="e.g., Father had heart attack at age 55"
            />
          </div>
        </div>

        {/* Save */}
        {editing && (
          <div className="flex justify-end mt-5">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50 transition"
            >
              <Save size={14} />
              {loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
