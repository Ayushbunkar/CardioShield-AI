import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaUserTie, FaUsers, FaGithub, FaLinkedin, FaEnvelope, FaArrowRight } from 'react-icons/fa';

import ayushImg from '../images/ayush.png';
import kaustubhImg from '../images/kaustubh.png';
import lalitImg from '../images/lalit.jpeg';
import mansiImg from '../images/mansi.jpeg';
import placeholderImg from '../images/IMG-20260224-WA0007.png';

gsap.registerPlugin(ScrollTrigger);

const Team = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const cardsRef = useRef([]);

  const teamMembers = [
    {
      id: 1,
      name: "Ayush Bunkar",
      role: "AI & ML Engineer",
      photo: ayushImg,
      isLeader: true,
      github: "https://github.com/Ayushbunkar",
      linkedin: "https://www.linkedin.com/in/ayush-bunkar-56519a398/",
      email: "mailto:ayushbunkar100@gmail.com"
    },
    {
      id: 2,
      name: "Kaustubh Soni",
      role: "Frontend Developer",
      photo: kaustubhImg,
      isLeader: false,
      github: "https://github.com/be-kaus",
      linkedin: "https://www.linkedin.com/in/kaustubh-soni-b7584a326/",
      email: "mailto:kaustubh@cardioshield.ai"
    },
    {
      id: 3,
      name: "Lalit Pawar",
      role: "Backend Developer",
      photo: lalitImg,
      isLeader: false,
      github: "https://github.com/lalit1251",
      linkedin: "https://www.linkedin.com/in/lalit-pawar-1251l",
      email: "lalitmuskan5@gmail.com"
    },
    {
      id: 4,
      name: "Mansi Pandagre",
      role: "Research & Documentation Lead",
      photo: mansiImg,
      isLeader: false,
      github: "https://github.com/mansipandagre",
      linkedin: "https://www.linkedin.com/in/mansi-pandagre-9045a12a4/",
      email: "mansipandagre@gmail.com"
    }
  ];

  const getEmailHref = (email) => {
    if (!email) return '#';
    const raw = email.startsWith('mailto:') ? email.replace(/^mailto:/, '') : email;
    return raw.includes('@')
      ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(raw)}`
      : email;
  };

  useEffect(() => {
    const ctx = gsap.context(() => {

      if (headerRef.current) {
        gsap.from(headerRef.current, {
          opacity: 0,
          y: 50,
          duration: 0.8,
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
      }

      if (cardsRef.current.length > 0) {
        gsap.from(cardsRef.current, {
          opacity: 0,
          y: 80,
          scale: 0.9,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardsRef.current[0],
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-b from-white to-[#F5F1ED]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaUsers className="text-4xl text-[#8B7FCF]" />
            <h2 className="text-4xl md:text-5xl font-bold text-[#4A3B5C]">
              Our Team
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Meet the experts behind CardioShield AI - dedicated professionals committed to revolutionizing cardiovascular health care
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={member.id}
              ref={(el) => (cardsRef.current[index] = el)}
              className={`group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 ${
                member.isLeader
                  ? 'border-4 border-[#8B7FCF]'
                  : 'border border-[#E8DFF5]'
              }`}
            >

              {member.isLeader && (
                <div className="absolute top-4 right-4 z-10 bg-[#8B7FCF] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                  <FaUserTie />
                  <span>Leader</span>
                </div>
              )}

              {/* Image */}
              <div className="relative overflow-hidden bg-gray-100">
                <img
                  src={member.photo}
                  alt={member.name}
                  width={520}
                  height={256}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.onerror = null;
                    img.src = placeholderImg;
                    const overlay = img.nextElementSibling;
                    if (overlay) overlay.style.opacity = '0';
                  }}
                  className="w-full h-64 object-cover object-top transition-all duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#4A3B5C] to-transparent opacity-40 group-hover:opacity-30 transition-opacity duration-500"></div>

                {/* Social Icons */}
                <div className="absolute left-1/2 bottom-4 -translate-x-1/2 flex items-center gap-4 z-20 opacity-0 translate-y-3 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-[#4A3B5C] hover:bg-[#8B7FCF] hover:text-white transition-all duration-300 shadow-lg"
                  >
                    <FaGithub size={18} />
                  </a>

                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-[#4A3B5C] hover:bg-[#8B7FCF] hover:text-white transition-all duration-300 shadow-lg"
                  >
                    <FaLinkedin size={18} />
                  </a>

                  <a
                    href={getEmailHref(member.email)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-[#4A3B5C] hover:bg-[#8B7FCF] hover:text-white transition-all duration-300 shadow-lg"
                  >
                    <FaEnvelope size={18} />
                  </a>
                </div>
              </div>

              {/* Info */}
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-[#4A3B5C] mb-2 group-hover:text-[#8B7FCF] transition-colors duration-300">
                  {member.name}
                </h3>
                <p className="text-sm text-[#6B5B7C] font-medium">
                  {member.role}
                </p>
              </div>

              {/* Bottom Border */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B7FCF] to-[#E8DFF5] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E8DFF5] group-hover:opacity-0 transition-opacity duration-300"></div>

            </div>
          ))}
        </div>

        {/* CTA removed per request */}

      </div>
    </section>
  );
};

export default Team;