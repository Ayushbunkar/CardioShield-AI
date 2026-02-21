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
    <div className="min-h-screen flex items-center justify-center bg-[#F5F1ED] px-4 py-10">
      
      <div className="w-full max-w-4xl bg-white border border-[#E8DFF5] rounded-2xl shadow-2xl p-6">
        
        <h2 className="text-3xl font-extrabold text-center mb-2 text-[#4A3B5C]">
          Contact CardioShield AI
        </h2>

        <p className="text-center text-[#6B5B7C] text-sm mb-6">
          Reach out for deployment partnerships, technical queries, or collaboration.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-[#4A3B5C]">

          <div className="grid md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-sm mb-1">
                <FaUser className="inline mr-2 text-[#8B7FCF]" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={contactData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[#F5F1ED] border border-[#E8DFF5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7FCF]"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                <FaEnvelope className="inline mr-2 text-[#B8A4C9]" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={contactData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[#F5F1ED] border border-[#E5D9F2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8A4C9]"
                placeholder="you@example.com"
              />
            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-sm mb-1">
                <FaPhone className="inline mr-2 text-[#8B7FCF]" />
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={contactData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[#F5F1ED] border border-[#E8DFF5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7FCF]"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                <FaEdit className="inline mr-2 text-[#B8A4C9]" />
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={contactData.subject}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-[#F5F1ED] border border-[#E5D9F2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8A4C9]"
                placeholder="Deployment / Partnership / Inquiry"
              />
            </div>

          </div>

          <div>
            <label className="block text-sm mb-1">
              <FaEdit className="inline mr-2 text-[#8B7FCF]" />
              Message
            </label>
            <textarea
              name="message"
              rows="3"
              value={contactData.message}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-[#F5F1ED] border border-[#E8DFF5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7FCF] resize-none"
              placeholder="Tell us about your inquiry..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#8B7FCF] hover:bg-[#7A6EBE] text-white font-semibold rounded-lg transition duration-300 flex items-center justify-center space-x-2 shadow-lg"
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

        <p className="text-xs text-center text-[#6B5B7C] mt-4">
          We respond within 24 hours. Secure & confidential communication.
        </p>

      </div>
    </div>
  );
};

export default ContactUs;