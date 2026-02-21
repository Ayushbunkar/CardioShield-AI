import React, { useState } from "react";
import {
  FaEnvelope,
  FaPhone,
  FaPaperPlane,
  FaUser,
  FaEdit,
} from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../config/api";

const ContactUs = () => {
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/public/contactus", contactData);
      toast.success(res.data.message);
      setContactData({
        name: "",
        email: "",
        subject: "",
        message: "",
        phone: "",
      });
    } catch (error) {
      toast.error(
        `Error : ${error.response?.status || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-red-950 px-4">
      
      <div className="w-full max-w-4xl bg-slate-800/60 backdrop-blur-md border border-cyan-500/20 rounded-2xl shadow-2xl p-6">
        
        <h2 className="text-3xl font-extrabold text-center mb-2 bg-gradient-to-r from-red-400 to-cyan-400 bg-clip-text text-transparent">
          Contact CardioShield AI
        </h2>

        <p className="text-center text-gray-400 text-sm mb-6">
          Reach out for deployment partnerships, technical queries, or collaboration.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-gray-300">

          <div className="grid md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-sm mb-1">
                <FaUser className="inline mr-2 text-cyan-400" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={contactData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                <FaEnvelope className="inline mr-2 text-red-400" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={contactData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-red-500/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="you@example.com"
              />
            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-sm mb-1">
                <FaPhone className="inline mr-2 text-cyan-400" />
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={contactData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                <FaEdit className="inline mr-2 text-red-400" />
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={contactData.subject}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-red-500/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Deployment / Partnership / Inquiry"
              />
            </div>

          </div>

          <div>
            <label className="block text-sm mb-1">
              <FaEdit className="inline mr-2 text-cyan-400" />
              Message
            </label>
            <textarea
              name="message"
              rows="3"
              value={contactData.message}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-slate-900 border border-cyan-500/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              placeholder="Tell us about your inquiry..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-red-500 to-cyan-500 text-white font-semibold rounded-lg hover:scale-[1.02] transition duration-300 flex items-center justify-center space-x-2 shadow-lg"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <FaPaperPlane />
                <span>Send Message</span>
              </>
            )}
          </button>

        </form>

        <p className="text-xs text-center text-gray-500 mt-4">
          We respond within 24 hours. Secure & confidential communication.
        </p>

      </div>
    </div>
  );
};

export default ContactUs;