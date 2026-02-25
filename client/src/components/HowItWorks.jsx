import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Database, Cpu, BarChart3, Lightbulb } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    id: 1,
    icon: Database,
    title: 'Data Collection',
    description: 'Users enter clinical and lifestyle parameters including age, cholesterol, blood pressure, glucose, and medical history.',
    color: '#8B7FCF'
  },
  {
    id: 2,
    icon: Cpu,
    title: 'AI Model Processing',
    description: 'Our AI engine processes inputs using LightGBM, XGBoost, Neural Networks, and Stacked Ensemble learning.',
    color: '#6B5B9A'
  },
  {
    id: 3,
    icon: BarChart3,
    title: 'Risk Prediction',
    description: 'The system generates cardiovascular risk probability with classification (Low / Moderate / High).',
    color: '#9B8AD4'
  },
  {
    id: 4,
    icon: Lightbulb,
    title: 'Explainability & Insights',
    description: 'SHAP-based explainability highlights feature contributions and personalized risk factors.',
    color: '#7B6BC4'
  }
];

const HowItWorks = () => {
  const sectionRef = useRef(null);
  const stepsRef = useRef([]);
  const lineRef = useRef(null);
  const titleRef = useRef(null);

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

      // Line animation
      gsap.fromTo(lineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Steps staggered animation
      stepsRef.current.forEach((step, index) => {
        gsap.fromTo(step,
          { opacity: 0, y: 80 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: index * 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: step,
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
    <section ref={sectionRef} className=" bg-gradient-to-b from-[#F5F1ED] to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#8B7FCF]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#E8DFF5]/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-20">
         
          <h2 className="text-4xl md:text-5xl font-bold text-[#4A3B5C] mb-6">
            How It Works
          </h2>
          <p className="text-lg text-[#6B5B7C] max-w-2xl mx-auto">
            Four simple steps to understand your cardiovascular health risk with AI-powered precision
          </p>
        </div>

        {/* Connecting Line - Desktop */}
        <div className="hidden lg:block absolute top-[55%] left-[15%] right-[15%] h-1 z-0">
          <div 
            ref={lineRef}
            className="h-full bg-gradient-to-r from-[#8B7FCF] via-[#9B8AD4] to-[#8B7FCF] rounded-full origin-left"
            style={{ transformOrigin: 'left center' }}
          />
        </div>

        {/* Steps Grid - Desktop Horizontal */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-8 relative z-10">
          {steps.map((step, index) => (
            <div
              key={step.id}
              ref={el => stepsRef.current[index] = el}
              className="group relative"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-[#E8DFF5] hover:border-[#8B7FCF]/30 h-full relative overflow-hidden">
                {/* Gradient border on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#8B7FCF]/20 to-[#E8DFF5]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-[#8B7FCF] to-[#6B5B9A] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {step.id}
                </div>

                {/* Icon */}
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${step.color}15` }}
                >
                  <step.icon className="w-8 h-8" style={{ color: step.color }} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[#4A3B5C] mb-3 relative z-10">
                  {step.title}
                </h3>
                <p className="text-[#6B5B7C] text-sm leading-relaxed relative z-10">
                  {step.description}
                </p>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8B7FCF] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Steps - Mobile Vertical Timeline */}
        <div className="lg:hidden space-y-6">
          {steps.map((step, index) => (
            <div
              key={step.id}
              ref={el => stepsRef.current[index] = el}
              className="flex gap-6"
            >
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${step.color}, #6B5B9A)` }}
                >
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gradient-to-b from-[#8B7FCF] to-[#E8DFF5] mt-3" />
                )}
              </div>

              {/* Card */}
              <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border border-[#E8DFF5] mb-2">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${step.color}15` }}
                >
                  <step.icon className="w-6 h-6" style={{ color: step.color }} />
                </div>
                <h3 className="text-lg font-bold text-[#4A3B5C] mb-2">{step.title}</h3>
                <p className="text-[#6B5B7C] text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
