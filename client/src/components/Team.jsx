import React from 'react';
import { FaUserTie, FaUsers } from 'react-icons/fa';

const Team = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      role: "Team Leader & Chief Cardiologist",
      photo: "https://placehold.co/300x300?text=SJ",
      isLeader: true
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      role: "AI Research Scientist",
      photo: "https://placehold.co/300x300?text=MC",
      isLeader: false
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      role: "Data Analytics Specialist",
      photo: "https://placehold.co/300x300?text=ER",
      isLeader: false
    },
    {
      id: 4,
      name: "Dr. James Wilson",
      role: "Clinical Research Director",
      photo: "https://placehold.co/300x300?text=JW",
      isLeader: false
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-[#F5F1ED]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaUsers className="text-4xl text-[#8B7FCF]" />
            <h2 className="text-4xl font-bold text-[#4A3B5C]">Our Team</h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Meet the experts behind CardioShield AI - dedicated professionals committed to revolutionizing cardiovascular health care
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                member.isLeader ? 'border-4 border-[#8B7FCF]' : 'border border-[#E8DFF5]'
              }`}
            >
              {/* Leader Badge */}
              {member.isLeader && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-[#8B7FCF] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <FaUserTie />
                    <span>Leader</span>
                  </div>
                </div>
              )}

              {/* Photo */}
              <div className="relative overflow-hidden">
                <img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#4A3B5C] to-transparent opacity-60"></div>
              </div>

              {/* Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#4A3B5C] mb-2">
                  {member.name}
                </h3>
                <p className="text-sm text-[#8B7FCF] font-medium">
                  {member.role}
                </p>
              </div>

              {/* Decorative Element */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B7FCF] to-[#E8DFF5]"></div>
            </div>
          ))}
        </div>

        {/* Optional CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 text-sm">
            Want to join our team? <a href="/contact" className="text-[#8B7FCF] font-semibold hover:underline">Get in touch</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Team;
