import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaLinkedin, FaTwitter, FaGithub, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#4A3B5C] to-[#6B5B7C] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <FaHeart className="text-2xl text-[#E8DFF5]" />
              <h3 className="text-xl font-bold">CardioShield AI</h3>
            </div>
            <p className="text-sm text-gray-300">
              AI-Powered Cardiovascular Risk Assessment Platform for proactive heart health management.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition">About Us</Link>
              </li>
              <li>
                <Link to="/ai" className="text-gray-300 hover:text-white transition">AI Assessment</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition">Dashboard</Link>
              </li>
              <li>
                <Link to="/reports" className="text-gray-300 hover:text-white transition">Reports</Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">Terms of Service</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold pb-10 mb-4">Get In Touch</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-300">
                <FaEnvelope />
                <span>CardioShieldAi@gmail.com</span>
              </li>
              <li className="text-gray-300">
                Secure & HIPAA Compliant
              </li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-300 hover:text-white transition">
                <FaLinkedin className="text-xl" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                <FaTwitter className="text-xl" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                <FaGithub className="text-xl" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-600 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} CardioShield AI. All rights reserved. | Healthcare Technology Solution</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
