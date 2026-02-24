import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Heart, Activity, Timer, TrendingDown, Stethoscope } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 17.9, suffix: 'M', label: 'Annual deaths worldwide', icon: Heart },
  { value: 80, suffix: '%', label: 'Preventable with early detection', icon: TrendingDown },
  { value: 2, suffix: 's', prefix: '<', label: 'Prediction time', icon: Timer }
];

const WhyItMatters = () => {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const illustrationRef = useRef(null);
  const statsRef = useRef([]);
  const floatingRefs = useRef([]);
  const [counts, setCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Content animation
      gsap.fromTo(contentRef.current,
        { opacity: 0, x: -60 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Illustration animation
      gsap.fromTo(illustrationRef.current,
        { opacity: 0, x: 60 },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: illustrationRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Floating elements animation
      floatingRefs.current.forEach((el, index) => {
        if (el) {
          gsap.to(el, {
            y: index % 2 === 0 ? -20 : 20,
            x: index % 2 === 0 ? 10 : -10,
            rotation: index % 2 === 0 ? 5 : -5,
            duration: 3 + index * 0.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          });
        }
      });

      // Stats counter animation
      statsRef.current.forEach((stat, index) => {
        ScrollTrigger.create({
          trigger: stat,
          start: 'top 85%',
          onEnter: () => {
            gsap.to({}, {
              duration: 2,
              ease: 'power3.out',
              onUpdate: function() {
                const progress = this.progress();
                setCounts(prev => {
                  const newCounts = [...prev];
                  newCounts[index] = Number((stats[index].value * progress).toFixed(1));
                  return newCounts;
                });
              }
            });
          },
          once: true
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-br from-[#F5F1ED] via-[#E8DFF5]/30 to-[#F5F1ED] relative overflow-hidden">
      {/* Floating Medical Shapes */}
      <div ref={el => floatingRefs.current[0] = el} className="absolute top-20 left-[10%] opacity-20">
        <Heart className="w-16 h-16 text-[#8B7FCF]" />
      </div>
      <div ref={el => floatingRefs.current[1] = el} className="absolute top-40 right-[15%] opacity-15">
        <Activity className="w-20 h-20 text-[#6B5B9A]" />
      </div>
      <div ref={el => floatingRefs.current[2] = el} className="absolute bottom-32 left-[20%] opacity-10">
        <Stethoscope className="w-24 h-24 text-[#8B7FCF]" />
      </div>
      <div ref={el => floatingRefs.current[3] = el} className="absolute bottom-20 right-[25%] opacity-20">
        <Heart className="w-12 h-12 text-[#9B8AD4]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div ref={contentRef}>
            <span className="inline-block px-4 py-2 bg-[#8B7FCF]/10 text-[#8B7FCF] text-sm font-semibold rounded-full mb-6">
              Global Health Impact
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#4A3B5C] mb-6 leading-tight">
              Why Early Detection <br />
              <span className="text-[#8B7FCF]">Matters</span>
            </h2>
            <p className="text-lg text-[#6B5B7C] mb-8 leading-relaxed">
              Cardiovascular disease remains the leading cause of death globally, claiming millions of lives each year. 
              Yet, the majority of these deaths are preventable through early detection and intervention.
            </p>
            <p className="text-[#6B5B7C] mb-10 leading-relaxed">
              CardioShield AI leverages advanced machine learning to identify risk factors before they become critical, 
              empowering healthcare providers and individuals with actionable insights for preventive care.
            </p>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  ref={el => statsRef.current[index] = el}
                  className="text-center"
                >
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className="w-5 h-5 text-[#8B7FCF] mr-2" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-[#4A3B5C] mb-1">
                    {stat.prefix || ''}{counts[index]}{stat.suffix}
                  </div>
                  <p className="text-sm text-[#6B5B7C]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Illustration */}
          <div ref={illustrationRef} className="relative">
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-[#E8DFF5]">
              {/* Decorative gradient */}
              <div className="absolute -inset-1 bg-gradient-to-br from-[#8B7FCF]/20 to-[#E8DFF5]/20 rounded-3xl blur-xl opacity-60" />
              
              <div className="relative">
                {/* Heart visualization */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#8B7FCF] to-[#6B5B9A] flex items-center justify-center animate-pulse">
                      <Heart className="w-16 h-16 text-white" />
                    </div>
                    <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-[#8B7FCF]/30 animate-ping" />
                  </div>
                </div>

                {/* ECG-like visualization */}
                <div className="h-20 flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 400 80" className="w-full h-full">
                    <path
                      d="M0,40 L50,40 L60,40 L70,20 L80,60 L90,10 L100,70 L110,40 L120,40 L200,40 L210,40 L220,20 L230,60 L240,10 L250,70 L260,40 L270,40 L350,40 L360,40 L370,20 L380,60 L390,40 L400,40"
                      fill="none"
                      stroke="#8B7FCF"
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                  </svg>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-[#F5F1ED] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#8B7FCF]">0.94</p>
                    <p className="text-xs text-[#6B5B7C]">ROC-AUC Score</p>
                  </div>
                  <div className="bg-[#F5F1ED] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#4A3B5C]">91%</p>
                    <p className="text-xs text-[#6B5B7C]">Recall Rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyItMatters;
