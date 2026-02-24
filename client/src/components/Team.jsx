import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaUserTie, FaUsers, FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import ayushImg from '../images/ayush.png';
import kaustubhImg from '../images/kaustubh.png';
import lalitImg from '../images/lalit.jpeg';
import mansiImg from '../images/mansi.jpeg';

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
      github: "#",
      linkedin: "#",
      email: "mailto:ayush@cardioshield.ai"
    },
    {
      id: 2,
      name: "Kaustubh Soni",
      role: "Frontend Developer",
      photo: kaustubhImg,
      isLeader: false,
      github: "#",
      linkedin: "#",
      email: "mailto:kaustubh@cardioshield.ai"
    },
    {
      id: 3,
      name: "Lalit Pawar",
      role: "Backend Developer",
      photo: lalitImg,
      isLeader: false,
      github: "#",
      linkedin: "#",
      email: "mailto:lalit@cardioshield.ai"
    },
    {
      id: 4,
      name: "Mansi Pandagre",
      role: "Research & Documentation Lead",
      photo: mansiImg,
      isLeader: false,
      github: "#",
      linkedin: "#",
      email: "mailto:mansi@cardioshield.ai"
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
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

      // Cards stagger animation
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
            <h2 className="text-4xl md:text-5xl font-bold text-[#4A3B5C]">Our Team</h2>
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
                member.isLeader ? 'border-4 border-[#8B7FCF]' : 'border border-[#E8DFF5]'
              }`}
            >
              {/* Leader Badge */}
              {member.isLeader && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-[#8B7FCF] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                    <FaUserTie />
                    <span>Leader</span>
                  </div>
                </div>
              )}

              {/* Photo */}
              <div className="relative overflow-hidden bg-gray-100">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-64 object-cover object-top transition-all duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#4A3B5C] to-transparent opacity-40 group-hover:opacity-30 transition-opacity duration-500"></div>
                
                {/* Social Icons Overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                  <a 
                    href={member.github}
                    className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#4A3B5C] hover:bg-[#8B7FCF] hover:text-white transition-all duration-300 shadow-lg hover:scale-110"
                  >
                    <FaGithub size={18} />
                  </a>
                  <a 
                    href={member.linkedin}
                    className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#4A3B5C] hover:bg-[#8B7FCF] hover:text-white transition-all duration-300 shadow-lg hover:scale-110"
                  >
                    <FaLinkedin size={18} />
                  </a>
                  <a 
                    href={member.email}
                    className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#4A3B5C] hover:bg-[#8B7FCF] hover:text-white transition-all duration-300 shadow-lg hover:scale-110"
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

              {/* Animated Bottom Border */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B7FCF] to-[#E8DFF5] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              
              {/* Static bottom border (visible initially) */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E8DFF5] group-hover:opacity-0 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Join CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md border border-[#E8DFF5] hover:shadow-lg transition-shadow duration-300">
            <span className="text-gray-600">Want to join our team?</span>
            <a href="/contact" className="text-[#8B7FCF] font-semibold hover:text-[#4A3B5C] transition-colors duration-300">
              Get in touch →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
