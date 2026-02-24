import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Heart } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const CTA = () => {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Content animation
      gsap.fromTo(contentRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Floating particles animation
      particlesRef.current.forEach((particle, index) => {
        if (particle) {
          gsap.to(particle, {
            y: `random(-30, 30)`,
            x: `random(-20, 20)`,
            opacity: `random(0.3, 0.7)`,
            duration: `random(3, 5)`,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: index * 0.2
          });
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Generate floating particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: Math.random() * 2
  }));

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#4A3B5C] via-[#6B5B9A] to-[#8B7FCF]" />
      
      {/* Overlay pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />
      </div>

      {/* Floating Particles */}
      {particles.map((particle, index) => (
        <div
          key={particle.id}
          ref={el => particlesRef.current[index] = el}
          className="absolute rounded-full bg-white/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.left,
            top: particle.top
          }}
        />
      ))}

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#8B7FCF]/30 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#E8DFF5]/20 rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div ref={contentRef} className="text-center">
          {/* Floating Heart Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Heart className="w-10 h-10 text-white animate-pulse" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping" />
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Predict Heart Risk
            <br />
            <span className="text-[#E8DFF5]">Before It Becomes Critical</span>
          </h2>

          {/* Subtext */}
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            AI-powered assessment in seconds. Early detection saves lives.
            Join thousands of healthcare providers using CardioShield.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary Button */}
            <Link
              to="/register"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-[#4A3B5C] font-semibold rounded-xl shadow-2xl hover:shadow-white/20 transition-all duration-300 overflow-hidden"
            >
              {/* Ripple effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-[#8B7FCF] to-[#6B5B9A] opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <span className="relative z-10">Get Started</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>

            {/* Secondary Button */}
            <Link
              to="/cardio-ai"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-300"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <span>Try Demo</span>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>HIPAA Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
