import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Building2, Rocket, FileCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const users = [
  {
    icon: Building2,
    title: 'Hospitals & Clinics',
    description: 'Integrate AI-powered cardiovascular risk assessment into your clinical workflow. Empower physicians with instant, explainable predictions for better patient outcomes.',
    features: ['EHR Integration Ready', 'HIPAA Compliant', 'Clinical Decision Support']
  },
  {
    icon: Rocket,
    title: 'HealthTech Startups',
    description: 'Build innovative health products with our robust prediction API. Scale your telemedicine or wellness platform with enterprise-grade AI capabilities.',
    features: ['RESTful API Access', 'Real-time Processing', 'Custom Model Training']
  },
  {
    icon: FileCheck,
    title: 'Insurance & Research',
    description: 'Leverage population-level risk stratification for underwriting and clinical research. Data-driven insights for actuarial models and epidemiological studies.',
    features: ['Batch Processing', 'Statistical Reports', 'Research Collaboration']
  }
];

const TargetUsers = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Cards staggered animation
      cardsRef.current.forEach((card, index) => {
        gsap.fromTo(card,
          { opacity: 0, y: 60, rotateY: -5 },
          {
            opacity: 1,
            y: 0,
            rotateY: 0,
            duration: 0.8,
            delay: index * 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-[#F5F1ED] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#8B7FCF]/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#E8DFF5]/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-16">
      
          <h2 className="text-4xl md:text-5xl font-bold text-[#4A3B5C] mb-6">
            Who Benefits
          </h2>
          <p className="text-lg text-[#6B5B7C] max-w-2xl mx-auto">
            CardioShield AI is designed for healthcare providers, innovators, and institutions committed to preventive care
          </p>
        </div>

        {/* Target Users Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {users.map((user, index) => (
            <div
              key={index}
              ref={el => cardsRef.current[index] = el}
              className="group perspective-1000"
            >
              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#E8DFF5] hover:border-[#8B7FCF]/30 h-full transform-style-3d hover:-rotate-y-2 hover:rotate-x-2">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#8B7FCF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

                {/* Animated background shapes */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#8B7FCF]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#E8DFF5]/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Icon */}
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B7FCF] to-[#6B5B9A] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <user.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-[#4A3B5C] mb-4 relative z-10">
                  {user.title}
                </h3>
                <p className="text-[#6B5B7C] mb-6 leading-relaxed relative z-10">
                  {user.description}
                </p>

                {/* Features */}
                <div className="space-y-2 relative z-10">
                  {user.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#8B7FCF]" />
                      <span className="text-sm text-[#6B5B7C]">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8B7FCF] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetUsers;
