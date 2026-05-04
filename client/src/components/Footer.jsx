import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaHeart, FaLinkedin, FaGithub, FaEnvelope, FaShieldAlt, FaLock } from 'react-icons/fa';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef(null);
  const borderRef = useRef(null);
  const columnsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Top border animation
      gsap.from(borderRef.current, {
        scaleX: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
      });

      // Columns stagger animation
      gsap.from(columnsRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const quickLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About Us' },
    { to: '/ai', label: 'AI Assessment' },
    { to: '/contact', label: 'Contact' },
  ];

  const features = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/reports', label: 'Reports' },
    { label: 'Multi-Model AI', href: '#' },
    { label: 'SHAP Explainability', href: '#' },
  ];

  const legal = [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'HIPAA Compliance', href: '#' },
    { label: 'Data Security', href: '#' },
  ];

  return (
    <footer ref={footerRef} className="relative bg-[#4A3B5C] text-white overflow-hidden">
      {/* Animated Top Border */}
      <div
        ref={borderRef}
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B7FCF] via-[#E8DFF5] to-[#8B7FCF] origin-left"
      ></div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-40 h-40 border border-white rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 border border-white rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white rounded-full"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Section */}
          <div
            ref={(el) => (columnsRef.current[0] = el)}
            className="lg:col-span-2"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#8B7FCF] to-[#E8DFF5] rounded-xl flex items-center justify-center">
                <FaHeart className="text-lg text-white" />
              </div>
              <h3 className="text-2xl font-bold">CardioShield AI</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-sm">
              AI-Powered Cardiovascular Risk Assessment Platform. Leveraging ensemble machine learning models with explainable AI for proactive heart health management.
            </p>

            {/* Trust Badges */}
            <div className="flex gap-4 mb-6">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <FaShieldAlt className="text-[#8B7FCF]" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <FaLock className="text-[#8B7FCF]" />
                <span>SOC 2 Certified</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { icon: FaGithub, href: 'https://github.com/Ayushbunkar' },
                { icon: FaLinkedin, href: 'https://www.linkedin.com/in/ayush-bunkar-56519a398/' },
                { icon: FaEnvelope, href: 'mailto:ayushbunkar100@gmail.com' },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 hover:bg-[#8B7FCF] rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <social.icon className="text-lg" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div ref={(el) => (columnsRef.current[1] = el)}>
            <h4 className="text-lg font-semibold mb-5 text-white">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    to={link.to}
                    className="text-gray-300 hover:text-[#E8DFF5] transition-colors duration-300 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-[#8B7FCF] rounded-full group-hover:scale-150 transition-transform duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div ref={(el) => (columnsRef.current[2] = el)}>
            <h4 className="text-lg font-semibold mb-5 text-white">Features</h4>
            <ul className="space-y-3">
              {features.map((link, idx) => (
                <li key={idx}>
                  {link.to ? (
                    <Link
                      to={link.to}
                      className="text-gray-300 hover:text-[#E8DFF5] transition-colors duration-300 text-sm flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-[#8B7FCF] rounded-full group-hover:scale-150 transition-transform duration-300"></span>
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-[#E8DFF5] transition-colors duration-300 text-sm flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-[#8B7FCF] rounded-full group-hover:scale-150 transition-transform duration-300"></span>
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Contact */}
          <div ref={(el) => (columnsRef.current[3] = el)}>
            <h4 className="text-lg font-semibold mb-5 text-white">Legal</h4>
            <ul className="space-y-3 mb-6">
              {legal.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-[#E8DFF5] transition-colors duration-300 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-[#8B7FCF] rounded-full group-hover:scale-150 transition-transform duration-300"></span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Email */}
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <FaEnvelope className="text-[#8B7FCF]" />
              <a href="mailto:ayushbunkar100@gmail.com" className="hover:text-[#E8DFF5] transition-colors duration-300">
                ayushbunkar100@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2026 CardioShield. Built for preventive healthcare innovation.
            </p>
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                All Systems Operational
              </span>
              <span>v2.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;