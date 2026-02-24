import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import {
  Mail, Phone, Send, User, MessageSquare, Building2,
  Heart, MapPin, Clock, CheckCircle, Sparkles,
  ArrowRight, Shield, Loader2
} from "lucide-react";
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
  const [sent, setSent] = useState(false);
  const formRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    // Animate contact method cards on mount
    gsap.fromTo(
      cardsRef.current,
      { y: 50, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.6, 
        stagger: 0.15,
        ease: "power3.out"
      }
    );
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/public/contactus", contactData);
      toast.success(res.data.message);
      setSent(true);
      setContactData({ name: "", email: "", subject: "", message: "", phone: "" });
      
      // Reset after 5 seconds
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      toast.error(`Error: ${error.response?.status || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(139,127,207,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.1),transparent_50%)]" />
      
      {/* Floating Shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">Touch</span>
          </h1>
          
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Partnership inquiries, technical support, or just want to say hello? 
            We're here to help protect hearts together.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Left Side - Info */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Let's build something <span className="text-violet-400">amazing</span> together
              </h2>
              <p className="text-gray-400 leading-relaxed">
                CardioShield AI is committed to making cardiovascular screening accessible globally. 
                Whether you're a healthcare provider, researcher, or government organization, 
                we're excited to collaborate.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400" />
                What we can help with
              </h3>
              
              {[
                "Deployment partnerships for rural health centers",
                "Technical integration & API access",
                "Research collaborations & clinical validation",
                "Government & NGO screening programs",
                "Custom model calibration for populations"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{item}</span>
                </div>
              ))}
            </div>

            {/* Trust Badge */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-violet-500/10 to-pink-500/10 rounded-xl border border-violet-500/20">
              <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <p className="text-white font-medium">Secure & Confidential</p>
                <p className="text-gray-400 text-sm">Your data is protected with enterprise-grade security</p>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden">
              {/* Form Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
              
              {sent ? (
                /* Success State */
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative z-10 text-center py-12"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-400">We'll get back to you within 24 hours.</p>
                </motion.div>
              ) : (
                /* Form */
                <form ref={formRef} onSubmit={handleSubmit} className="relative z-10 space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <InputField
                      icon={User}
                      label="Full Name"
                      name="name"
                      value={contactData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                    <InputField
                      icon={Mail}
                      label="Email"
                      name="email"
                      type="email"
                      value={contactData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <InputField
                      icon={Phone}
                      label="Phone"
                      name="phone"
                      type="tel"
                      value={contactData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      required
                    />
                    <InputField
                      icon={Building2}
                      label="Subject"
                      name="subject"
                      value={contactData.subject}
                      onChange={handleChange}
                      placeholder="Partnership / Technical / Other"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <MessageSquare className="w-4 h-4 text-violet-400" />
                      Message
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      value={contactData.message}
                      onChange={handleChange}
                      required
                      placeholder="Tell us about your inquiry, project, or how we can help..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </motion.button>

                  <p className="text-center text-gray-500 text-xs flex items-center justify-center gap-2">
                    <Clock className="w-3 h-3" />
                    We typically respond within 24 hours
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Reusable Input Field Component
const InputField = ({ icon: Icon, label, name, type = "text", value, onChange, placeholder, required }) => (
  <div>
    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
      <Icon className="w-4 h-4 text-violet-400" />
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
    />
  </div>
);

export default ContactUs;
