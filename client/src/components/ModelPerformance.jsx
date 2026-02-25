import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Award, Target, ShieldCheck, TrendingUp, Activity, Layers, Zap, Brain, Network } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const models = [
  {
    id: 1,
    name: 'Stacked Ensemble',
    isBest: true,
    description: 'Combined multi-model approach that leverages the strengths of all individual models for maximum prediction accuracy and recall.',
    icon: Layers,
    color: 'from-[#8B7FCF] to-[#6B5B9A]',
    bgColor: 'bg-[#F5EFFC]',
    borderColor: 'border-[#E8DFF5]',
    metrics: { rocAuc: 0.94, recall: 0.91, precision: 0.87, prAuc: 0.89, f1: 0.89, accuracy: 0.92 },
  },
  {
    id: 2,
    name: 'XGBoost',
    isBest: false,
    description: 'Extreme gradient boosting algorithm with regularization. Excels at structured data and handles missing values natively.',
    icon: Zap,
    color: 'from-[#8B7FCF] to-[#6B5B9A]',
    bgColor: 'bg-[#F5EFFC]',
    borderColor: 'border-[#E8DFF5]',
    metrics: { rocAuc: 0.93, recall: 0.88, precision: 0.85, prAuc: 0.87, f1: 0.86, accuracy: 0.90 },
  },
  {
    id: 3,
    name: 'LightGBM',
    isBest: false,
    description: 'Light gradient boosting machine optimized for speed and efficiency. Uses histogram-based splitting for fast training.',
    icon: Activity,
    color: 'from-[#8B7FCF] to-[#6B5B9A]',
    bgColor: 'bg-[#F5EFFC]',
    borderColor: 'border-[#E8DFF5]',
    metrics: { rocAuc: 0.92, recall: 0.87, precision: 0.84, prAuc: 0.86, f1: 0.85, accuracy: 0.89 },
  },
  {
    id: 4,
    name: 'TabNet',
    isBest: false,
    description: 'Attention-based deep learning architecture specifically designed for tabular data with built-in feature selection.',
    icon: Brain,
    color: 'from-[#8B7FCF] to-[#6B5B9A]',
    bgColor: 'bg-[#F5EFFC]',
    borderColor: 'border-[#E8DFF5]',
    metrics: { rocAuc: 0.92, recall: 0.86, precision: 0.83, prAuc: 0.85, f1: 0.84, accuracy: 0.88 },
  },
  {
    id: 5,
    name: 'Neural Network',
    isBest: false,
    description: 'Multi-layer perceptron with dropout regularization. Learns complex non-linear patterns in clinical data.',
    icon: Network,
    color: 'from-[#8B7FCF] to-[#6B5B9A]',
    bgColor: 'bg-[#F5EFFC]',
    borderColor: 'border-[#E8DFF5]',
    metrics: { rocAuc: 0.91, recall: 0.85, precision: 0.82, prAuc: 0.84, f1: 0.83, accuracy: 0.87 },
  },
];

const metricInfo = [
  { key: 'rocAuc', label: 'ROC-AUC', icon: TrendingUp, color: '#8B7FCF', description: 'Area under ROC curve — overall discriminative power' },
  { key: 'recall', label: 'Recall', icon: Target, color: '#22c55e', critical: true, description: 'True positive rate — minimizing missed high-risk patients' },
  { key: 'precision', label: 'Precision', icon: ShieldCheck, color: '#3b82f6', description: 'Positive predictive value — confidence in positive predictions' },
  { key: 'prAuc', label: 'PR-AUC', icon: Activity, color: '#f59e0b', description: 'Precision-Recall AUC — performance on imbalanced data' },
];

const ModelPerformance = () => {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);
  const [animatedMetrics, setAnimatedMetrics] = useState(
    models.map(() => ({ rocAuc: 0, recall: 0, precision: 0, prAuc: 0 }))
  );
  const [animationTriggered, setAnimationTriggered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const cardElements = cardsRef.current.filter(Boolean);

    if (!container || cardElements.length === 0) return;

    // Title animation
    if (titleRef.current) {
      gsap.fromTo(titleRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: titleRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
        }
      );
    }

    // Set initial card positions — all stacked, only first visible
    cardElements.forEach((card, i) => {
      gsap.set(card, {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: i + 1,
        yPercent: i === 0 ? 0 : 100,
      });
    });

    // Scroll-triggered stacking animations
    cardElements.forEach((card, i) => {
      if (i === 0) return;

      gsap.fromTo(card,
        { yPercent: 100 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: `${(i - 1) * 20}% top`,
            end: `${i * 20}% top`,
            scrub: 0.2,
          },
        }
      );

      // Scale down previous card
      gsap.to(cardElements[i - 1], {
        scale: 0.92,
        y: -30,
        scrollTrigger: {
          trigger: container,
          start: `${(i - 1) * 20}% top`,
          end: `${i * 20}% top`,
          scrub: 0.2,
        },
      });
    });

    // Animate metrics numbers when section comes into view
    ScrollTrigger.create({
      trigger: container,
      start: 'top 70%',
      onEnter: () => {
        if (animationTriggered) return;
        setAnimationTriggered(true);
        models.forEach((model, modelIndex) => {
          gsap.to({}, {
            duration: 2,
            delay: modelIndex * 0.08,
            ease: 'power3.out',
            onUpdate: function () {
              const progress = this.progress();
              setAnimatedMetrics((prev) => {
                const next = [...prev];
                next[modelIndex] = {
                  rocAuc: model.metrics.rocAuc * progress,
                  recall: model.metrics.recall * progress,
                  precision: model.metrics.precision * progress,
                  prAuc: model.metrics.prAuc * progress,
                };
                return next;
              });
            },
          });
        });
      },
      once: true,
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#F5F1ED]">
      {/* Section Title */}
      <div ref={titleRef} className="text-center pt-20 pb-8 px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-[#4A3B5C] mb-4">
          Model <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B7FCF] to-[#B8A4C9]">Performance</span>
        </h2>
        <p className="text-lg text-[#6B5B7C] max-w-2xl mx-auto">
          Our ensemble approach combines multiple algorithms for maximum prediction accuracy
        </p>
      </div>

      {/* Sticky Stacking Cards */}
      <div
        ref={containerRef}
        className="relative"
        style={{ height: `${(models.length + 2) * 100}vh` }}
      >
        <div className="sticky top-0 h-screen flex items-center justify-center p-6 overflow-hidden">
          <div className="relative w-full max-w-4xl h-[70vh]">
            {models.map((model, index) => {
              const Icon = model.icon;
              return (
                <div
                  key={model.id}
                  ref={(el) => (cardsRef.current[index] = el)}
                  className={`w-full h-full ${model.bgColor} ${model.borderColor} border-2 rounded-3xl shadow-2xl overflow-hidden`}
                >
                  {/* Card Header */}
                  <div className={`bg-gradient-to-r ${model.color} p-6 text-white relative`}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                        <Icon className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-white/70 text-sm font-medium">
                          0{model.id} / 0{models.length}
                        </span>
                        <h3 className="text-2xl md:text-3xl font-bold">{model.name}</h3>
                      </div>
                    </div>
                    {model.isBest && (
                      <div className="absolute top-4 right-4">
                        <span className="flex items-center gap-1.5 px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full border border-white/30">
                          <Award className="w-4 h-4" />
                          Best Model
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6 md:p-8 flex flex-col justify-between overflow-y-auto" style={{ height: 'calc(70vh - 100px)' }}>
                    <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                      {model.description}
                    </p>

                    {/* Metrics as styled list items */}
                    <div className="space-y-2 mb-4 flex-1">
                      {metricInfo.map((metric) => {
                        const MetricIcon = metric.icon;
                        const value = animatedMetrics[index][metric.key];
                        return (
                          <div
                            key={metric.key}
                            className="flex items-center gap-4 p-3 rounded-xl bg-white/70 border border-gray-200/50 backdrop-blur-sm"
                          >
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${metric.color}20` }}
                            >
                              <MetricIcon className="w-5 h-5" style={{ color: metric.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-700">{metric.label}</span>
                                {metric.critical && (
                                  <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    PRIORITIZED
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 truncate">{metric.description}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-2xl font-bold" style={{ color: metric.color }}>
                                {value.toFixed(2)}
                              </span>
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: `${value * 100}%`,
                                    backgroundColor: metric.color,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer — F1, Accuracy, Status */}
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${model.color} flex justify-around text-white flex-shrink-0 mt-auto`}>
                      <div className="text-center">
                        <span className="block text-white/70 text-xs font-medium">F1 Score</span>
                        <span className="text-lg font-bold">{model.metrics.f1.toFixed(2)}</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-white/70 text-xs font-medium">Accuracy</span>
                        <span className="text-lg font-bold">{(model.metrics.accuracy * 100).toFixed(0)}%</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-white/70 text-xs font-medium">Status</span>
                        <span className="text-lg font-bold flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          Pass
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Number Watermark */}
                  <div className="absolute bottom-6 right-6 text-8xl font-bold opacity-5 text-gray-900">
                    0{model.id}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Why Recall Matters */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-r from-[#E8DFF5] to-[#F5EFFC] rounded-2xl p-6 border border-[#DFD1E8]">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-[#DFD1E8] rounded-2xl flex items-center justify-center">
                <Target className="w-8 h-8 text-[#8B7FCF]" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-xl font-bold text-[#4A3B5C] mb-2">Why We Prioritize Recall</h4>
              <p className="text-[#6B5B7C]">
                In cardiovascular risk assessment,{' '}
                <span className="text-[#8B7FCF] font-semibold">missing a high-risk patient (false negative) is far more dangerous</span>{' '}
                than a false alarm. Our models achieve{' '}
                <span className="text-[#4A3B5C] font-semibold">≥85% recall</span>{' '}
                while maintaining strong precision, ensuring minimal missed diagnoses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModelPerformance;
