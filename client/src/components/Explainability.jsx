import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Eye, Info, TrendingUp, TrendingDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const shapFeatures = [
  { name: 'Systolic BP', value: 0.35, impact: 'positive', description: 'High blood pressure increases risk' },
  { name: 'Age', value: 0.28, impact: 'positive', description: 'Risk increases with age' },
  { name: 'Cholesterol', value: 0.22, impact: 'positive', description: 'Elevated levels contribute to risk' },
  { name: 'Physical Activity', value: -0.18, impact: 'negative', description: 'Regular exercise reduces risk' },
  { name: 'BMI', value: 0.15, impact: 'positive', description: 'Higher BMI correlates with risk' },
  { name: 'Glucose', value: 0.12, impact: 'positive', description: 'Elevated glucose is a risk factor' },
  { name: 'Smoking', value: -0.05, impact: 'negative', description: 'Non-smoker status is protective' }
];

const Explainability = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardRef = useRef(null);
  const barsRef = useRef([]);
  const [barWidths, setBarWidths] = useState(shapFeatures.map(() => 0));
  const [hoveredIndex, setHoveredIndex] = useState(null);

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

      // Card animation
      gsap.fromTo(cardRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // SHAP bars animation
      ScrollTrigger.create({
        trigger: cardRef.current,
        start: 'top 70%',
        onEnter: () => {
          shapFeatures.forEach((feature, index) => {
            gsap.to({}, {
              duration: 1.2,
              delay: index * 0.1,
              ease: 'power3.out',
              onUpdate: function() {
                setBarWidths(prev => {
                  const newWidths = [...prev];
                  newWidths[index] = Math.abs(feature.value) * 100 * this.progress();
                  return newWidths;
                });
              }
            });
          });
        },
        once: true
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-b from-white to-[#F5F1ED] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-[#8B7FCF]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#E8DFF5]/30 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B7FCF]/10 text-[#8B7FCF] text-sm font-semibold rounded-full mb-4">
            <Eye className="w-4 h-4" />
            AI Transparency
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#4A3B5C] mb-6">
            Explainability Preview
          </h2>
          <p className="text-lg text-[#6B5B7C] max-w-2xl mx-auto">
            Understanding AI decisions is critical in healthcare. Our SHAP-powered explainability shows how each feature influences prediction.
          </p>
        </div>

        {/* SHAP Visualization Card */}
        <div 
          ref={cardRef}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#E8DFF5]/50 overflow-hidden"
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[#8B7FCF]/10 to-[#E8DFF5]/30 px-8 py-6 border-b border-[#E8DFF5]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#4A3B5C]">Feature Impact Analysis</h3>
                <p className="text-sm text-[#6B5B7C]">SHAP values for sample prediction</p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-red-400 to-red-500" />
                  <span className="text-[#6B5B7C]">Increases Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-400 to-blue-500" />
                  <span className="text-[#6B5B7C]">Decreases Risk</span>
                </div>
              </div>
            </div>
          </div>

          {/* SHAP Bars */}
          <div className="p-8 space-y-4">
            {shapFeatures.map((feature, index) => (
              <div
                key={feature.name}
                ref={el => barsRef.current[index] = el}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-center gap-4">
                  {/* Feature Name */}
                  <div className="w-32 flex-shrink-0">
                    <span className="text-sm font-medium text-[#4A3B5C]">{feature.name}</span>
                  </div>

                  {/* Bar Container */}
                  <div className="flex-1 flex items-center">
                    {/* Negative side (blue) */}
                    <div className="flex-1 flex justify-end">
                      {feature.impact === 'negative' && (
                        <div
                          className="h-8 rounded-l-lg bg-gradient-to-l from-blue-400 to-blue-500 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/30"
                          style={{ width: `${barWidths[index]}%` }}
                        />
                      )}
                    </div>

                    {/* Center line */}
                    <div className="w-0.5 h-10 bg-[#4A3B5C]/20 mx-1" />

                    {/* Positive side (red) */}
                    <div className="flex-1">
                      {feature.impact === 'positive' && (
                        <div
                          className="h-8 rounded-r-lg bg-gradient-to-r from-red-400 to-red-500 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-red-500/30"
                          style={{ width: `${barWidths[index]}%` }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Value */}
                  <div className="w-16 flex-shrink-0 text-right">
                    <span className={`text-sm font-semibold ${
                      feature.impact === 'positive' ? 'text-red-500' : 'text-blue-500'
                    }`}>
                      {feature.impact === 'positive' ? '+' : ''}{feature.value.toFixed(2)}
                    </span>
                  </div>

                  {/* Impact icon */}
                  <div className="w-6 flex-shrink-0">
                    {feature.impact === 'positive' ? (
                      <TrendingUp className="w-4 h-4 text-red-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                </div>

                {/* Tooltip */}
                {hoveredIndex === index && (
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-12 bg-[#4A3B5C] text-white text-xs px-4 py-2 rounded-lg shadow-lg z-20 whitespace-nowrap">
                    <Info className="w-3 h-3 inline mr-1" />
                    {feature.description}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#4A3B5C] rotate-45" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Card Footer */}
          <div className="bg-[#F5F1ED]/50 px-8 py-4 border-t border-[#E8DFF5]">
            <p className="text-sm text-[#6B5B7C] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#8B7FCF]" />
              SHAP (SHapley Additive exPlanations) values show each feature's contribution to the prediction
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Explainability;
