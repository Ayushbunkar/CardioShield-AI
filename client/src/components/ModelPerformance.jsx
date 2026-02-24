import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BarChart3, Award, Star, Target, ShieldCheck, TrendingUp, Activity } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const models = [
  { 
    name: 'Stacked Ensemble', 
    isBest: true, 
    description: 'Combined multi-model approach',
    metrics: {
      rocAuc: 0.94,
      recall: 0.91,
      precision: 0.87,
      prAuc: 0.89,
      f1: 0.89,
      accuracy: 0.92
    }
  },
  { 
    name: 'XGBoost', 
    isBest: false, 
    description: 'Extreme gradient boosting',
    metrics: {
      rocAuc: 0.93,
      recall: 0.88,
      precision: 0.85,
      prAuc: 0.87,
      f1: 0.86,
      accuracy: 0.90
    }
  },
  { 
    name: 'LightGBM', 
    isBest: false, 
    description: 'Light gradient boosting machine',
    metrics: {
      rocAuc: 0.92,
      recall: 0.87,
      precision: 0.84,
      prAuc: 0.86,
      f1: 0.85,
      accuracy: 0.89
    }
  },
  { 
    name: 'TabNet', 
    isBest: false, 
    description: 'Attention-based deep learning',
    metrics: {
      rocAuc: 0.92,
      recall: 0.86,
      precision: 0.83,
      prAuc: 0.85,
      f1: 0.84,
      accuracy: 0.88
    }
  },
  { 
    name: 'Neural Network', 
    isBest: false, 
    description: 'Multi-layer perceptron',
    metrics: {
      rocAuc: 0.91,
      recall: 0.85,
      precision: 0.82,
      prAuc: 0.84,
      f1: 0.83,
      accuracy: 0.87
    }
  }
];

const metricInfo = [
  { key: 'rocAuc', label: 'ROC-AUC', icon: TrendingUp, color: '#8B7FCF', description: 'Area under ROC curve' },
  { key: 'recall', label: 'Recall', icon: Target, color: '#22c55e', critical: true, description: 'True positive rate (prioritized)' },
  { key: 'precision', label: 'Precision', icon: ShieldCheck, color: '#3b82f6', description: 'Positive predictive value' },
  { key: 'prAuc', label: 'PR-AUC', icon: Activity, color: '#f59e0b', description: 'Precision-Recall AUC' },
];

const ModelPerformance = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);
  const metricsRef = useRef([]);
  const [animatedMetrics, setAnimatedMetrics] = useState(
    models.map(() => ({ rocAuc: 0, recall: 0, precision: 0, prAuc: 0 }))
  );

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

      // Animate metrics when scrolled into view
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 60%',
        onEnter: () => {
          models.forEach((model, modelIndex) => {
            gsap.to({}, {
              duration: 2,
              delay: modelIndex * 0.1,
              ease: 'power3.out',
              onUpdate: function() {
                const progress = this.progress();
                setAnimatedMetrics(prev => {
                  const newMetrics = [...prev];
                  newMetrics[modelIndex] = {
                    rocAuc: model.metrics.rocAuc * progress,
                    recall: model.metrics.recall * progress,
                    precision: model.metrics.precision * progress,
                    prAuc: model.metrics.prAuc * progress,
                  };
                  return newMetrics;
                });
              }
            });
          });
        },
        once: true
      });

      // Cards staggered reveal
      cardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(card,
            { opacity: 0, y: 40, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              delay: index * 0.12,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-[#1a1625] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4A3B5C]/20 to-transparent" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#8B7FCF]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#6B5B9A]/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div ref={titleRef} className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B7FCF]/20 text-[#8B7FCF] text-sm font-semibold rounded-full mb-4">
            <BarChart3 className="w-4 h-4" />
            Performance Metrics
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Model Performance
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Our ensemble approach combines multiple algorithms for maximum prediction accuracy
          </p>
        </div>

        {/* Model Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {models.map((model, index) => (
            <div
              key={model.name}
              ref={el => cardsRef.current[index] = el}
              className={`relative group ${model.isBest ? 'md:col-span-2 lg:col-span-1 lg:row-span-1' : ''}`}
            >
              <div className={`h-full bg-[#2a2235] rounded-2xl p-6 border transition-all duration-300 ${
                model.isBest 
                  ? 'border-[#8B7FCF] shadow-xl shadow-[#8B7FCF]/20' 
                  : 'border-[#3a3045] hover:border-[#8B7FCF]/30'
              }`}>
                {/* Best Model Badge */}
                {model.isBest && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#8B7FCF] to-[#6B5B9A] text-white text-sm font-semibold rounded-full shadow-lg">
                      <Award className="w-4 h-4" />
                      Best Model
                    </span>
                  </div>
                )}

                {/* Model Header */}
                <div className={`mb-6 ${model.isBest ? 'mt-3' : ''}`}>
                  <h3 className={`text-xl font-bold mb-1 ${model.isBest ? 'text-[#8B7FCF]' : 'text-white'}`}>
                    {model.name}
                  </h3>
                  <p className="text-sm text-gray-500">{model.description}</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {metricInfo.map((metric) => (
                    <div key={metric.key} className="relative">
                      <div className={`p-3 rounded-xl bg-[#1a1625] border ${
                        metric.critical ? 'border-green-500/30' : 'border-transparent'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <metric.icon className="w-4 h-4" style={{ color: metric.color }} />
                          <span className="text-xs text-gray-400">{metric.label}</span>
                          {metric.critical && (
                            <span className="text-[9px] bg-green-500/20 text-green-400 px-1 rounded">★</span>
                          )}
                        </div>
                        <div className="flex items-end gap-1">
                          <span 
                            className="text-2xl font-bold"
                            style={{ color: metric.color }}
                          >
                            {animatedMetrics[index][metric.key].toFixed(2)}
                          </span>
                        </div>
                        {/* Mini progress bar */}
                        <div className="mt-2 h-1.5 bg-[#2a2235] rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ 
                              width: `${animatedMetrics[index][metric.key] * 100}%`,
                              backgroundColor: metric.color 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Metrics Row */}
                <div className="mt-4 pt-4 border-t border-[#3a3045] flex justify-between text-sm">
                  <div className="text-center">
                    <span className="text-gray-500 block text-xs">F1 Score</span>
                    <span className="text-white font-semibold">{model.metrics.f1.toFixed(2)}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-500 block text-xs">Accuracy</span>
                    <span className="text-gray-400 font-semibold">{(model.metrics.accuracy * 100).toFixed(0)}%</span>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-500 block text-xs">Status</span>
                    <span className="text-green-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Pass
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Why Recall Matters */}
        <div className="mt-12 bg-gradient-to-r from-green-500/10 to-[#8B7FCF]/10 rounded-2xl p-6 border border-green-500/20">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center">
                <Target className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-xl font-bold text-white mb-2">Why We Prioritize Recall</h4>
              <p className="text-gray-400">
                In cardiovascular risk assessment, <span className="text-green-400 font-semibold">missing a high-risk patient (false negative) is far more dangerous</span> than a false alarm. 
                Our models are optimized to achieve <span className="text-white font-semibold">≥85% recall</span> while maintaining strong precision, ensuring 
                minimal missed diagnoses while keeping false positives manageable. This approach has been validated by healthcare professionals.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ModelPerformance;
