import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Brain, Layers, Eye, Zap, Shield, LayoutDashboard } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Brain,
    title: 'Multi-Model AI Prediction',
    description: 'Leverages LightGBM, XGBoost, and Neural Networks for comprehensive analysis.',
    gradient: 'from-[#8B7FCF] to-[#6B5B9A]'
  },
  {
    icon: Layers,
    title: 'Ensemble Learning Excellence',
    description: 'Stacked ensemble achieves 0.94 ROC-AUC with 91% recall, prioritizing missed diagnosis prevention.',
    gradient: 'from-[#9B8AD4] to-[#7B6BC4]'
  },
  {
    icon: Eye,
    title: 'SHAP Explainability',
    description: 'Transparent AI decisions with feature contribution visualization.',
    gradient: 'from-[#7B6BC4] to-[#8B7FCF]'
  },
  {
    icon: Zap,
    title: 'Real-Time Assessment',
    description: 'Get instant cardiovascular risk predictions in under 2 seconds.',
    gradient: 'from-[#6B5B9A] to-[#9B8AD4]'
  },
  {
    icon: Shield,
    title: 'Secure Data Handling',
    description: 'Enterprise-grade security protocols protect sensitive patient information.',
    gradient: 'from-[#8B7FCF] to-[#7B6BC4]'
  },
  {
    icon: LayoutDashboard,
    title: 'Admin Analytics Dashboard',
    description: 'Comprehensive insights and monitoring for healthcare administrators.',
    gradient: 'from-[#9B8AD4] to-[#6B5B9A]'
  }
];

const Features = () => {
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
          { opacity: 0, y: 60, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            delay: index * 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#8B7FCF]/5 to-[#E8DFF5]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#E8DFF5]/10 to-[#8B7FCF]/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-[#8B7FCF]/10 text-[#8B7FCF] text-sm font-semibold rounded-full mb-4">
            Platform Capabilities
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#4A3B5C] mb-6">
            Key Features
          </h2>
          <p className="text-lg text-[#6B5B7C] max-w-2xl mx-auto">
            Cutting-edge technology designed for accurate, transparent, and secure cardiovascular risk assessment
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={el => cardsRef.current[index] = el}
              className="group relative"
            >
              {/* Glassmorphism Card */}
              <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-[#E8DFF5]/50 hover:border-[#8B7FCF]/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-full overflow-hidden">
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#8B7FCF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                
                {/* Subtle corner accent */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#8B7FCF]/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[#4A3B5C] mb-3 relative z-10">
                  {feature.title}
                </h3>
                <p className="text-[#6B5B7C] leading-relaxed relative z-10">
                  {feature.description}
                </p>

                {/* Hover indicator */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8B7FCF] to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
