import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heart, Brain, Users, Shield, Cpu } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const cards = [
  {
    id: 1,
    title: "Executive Summary",
    icon: Heart,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    content: {
      description: "CardioShield AI is an explainable, low-cost, deployable AI platform designed for early risk prediction of cardiovascular diseases (CVD) — specifically heart attacks and strokes — in underserved and resource-constrained populations.",
      points: [
        "High-accuracy 5–10 year CVD risk prediction",
        "Point-of-care screening using low-cost clinical inputs",
        "Real-time explainable risk scoring",
        "Bias-aware model calibration for South Asian populations",
        "Offline-capable deployment in rural health settings"
      ],
      footer: "Input → Clean → Engineer → Predict → Calibrate → Explain → Stratify → Act"
    }
  },
  {
    id: 2,
    title: "Product Vision",
    icon: Brain,
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    content: {
      description: "Our vision is to democratize cardiovascular health screening through accessible AI technology.",
      points: [
        "Affordable AI-based risk screening",
        "Clinically interpretable risk explanations",
        "Bias-aware decision support",
        "Scalable population-level screening",
        "Deployment-ready architecture for rural clinics"
      ],
      footer: "CardioShield AI is not a diagnostic replacement. It is an early-warning risk stratification system."
    }
  },
  {
    id: 3,
    title: "Target Users",
    icon: Users,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    content: {
      description: "Designed for healthcare providers serving underserved communities.",
      points: [
        "Rural Primary Health Centers (PHCs)",
        "Community Health Workers",
        "Government screening programs",
        "Insurance risk stratification teams",
        "Telehealth providers"
      ],
      footer: "End beneficiaries: Adults aged 30–65, High-risk South Asian populations, Low-income communities"
    }
  },
  {
    id: 4,
    title: "System Architecture",
    icon: Cpu,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    content: {
      description: "CardioShield AI consists of two major components for comprehensive risk assessment.",
      points: [
        "PART 1 – Core Risk Stratification Engine (~70%)",
        "Machine learning-based predictive modeling",
        "PART 2 – Clinical Intelligence Layer (~30%)",
        "Explainability framework & bias calibration",
        "Deployment infrastructure for rural settings"
      ],
      footer: "Built with LightGBM, XGBoost, TabNet, and Neural Network ensemble"
    }
  },
  {
    id: 5,
    title: "Our Promise",
    icon: Shield,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    content: {
      description: "We are committed to ethical, transparent, and equitable AI in healthcare.",
      points: [
        "Privacy-first data handling",
        "Transparent model decisions (XAI)",
        "Continuous bias monitoring",
        "Open for clinical validation",
        "Designed for health equity"
      ],
      footer: "Empowering communities with AI-driven preventive healthcare"
    }
  }
];

const About = () => {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const container = containerRef.current;
    const cardElements = cardsRef.current;

    // Set initial positions - all cards stacked, only first visible
    cardElements.forEach((card, i) => {
      gsap.set(card, {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: i + 1,
        yPercent: i === 0 ? 0 : 100,
      });
    });

    // Create scroll-triggered animations
    cardElements.forEach((card, i) => {
      if (i === 0) return; // First card doesn't need animation

      gsap.fromTo(
        card,
        {
          yPercent: 100,
        },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: `${(i - 1) * 20}% top`,
            end: `${i * 20}% top`,
            scrub: 0.2,
          },
        }
      );

      // Scale down previous cards slightly
      if (i > 0) {
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
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 min-h-screen">
      {/* Hero Section */}
      <div className="pt-20 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 ]" />
        <div className="text-center z-10 px-6 relative">
          <h1 className="text-5xl md:text-5xl  font-bold text-white mb-4">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">CardioShield AI</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            AI-Powered Early Cardiovascular Risk Stratification Platform
          </p>
        </div>
      </div>

      {/* Sticky Cards Section */}
      <div 
        ref={containerRef}
        className="relative"
        style={{ height: `${(cards.length + 2) * 100}vh` }}
      >
        <div className="sticky top-0 h-screen flex items-center justify-center p-6 overflow-hidden">
          <div className="relative w-full max-w-4xl h-[70vh]">
            {cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  ref={(el) => (cardsRef.current[index] = el)}
                  className={`w-full h-full ${card.bgColor} ${card.borderColor} border-2 rounded-3xl shadow-2xl overflow-hidden`}
                >
                  {/* Card Header */}
                  <div className={`bg-gradient-to-r ${card.color} p-6 text-white`}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                        <Icon className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-white/70 text-sm font-medium">0{card.id} / 05</span>
                        <h2 className="text-2xl md:text-3xl font-bold">{card.title}</h2>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 md:p-8 flex flex-col justify-center" style={{ height: "calc(70vh - 120px)" }}>
                    <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                      {card.content.description}
                    </p>

                    <ul className="space-y-2 mb-6">
                      {card.content.points.map((point, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${card.color} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white text-xs font-bold">{i + 1}</span>
                          </div>
                          <span className="text-gray-600">{point}</span>
                        </li>
                      ))}
                    </ul>

                    <div className={`p-4 rounded-xl bg-gradient-to-r ${card.color} bg-opacity-10 border ${card.borderColor}`}>
                      <p className="text-gray-700 font-medium text-sm italic">
                        "{card.content.footer}"
                      </p>
                    </div>
                  </div>

                  {/* Card Number Indicator */}
                  <div className="absolute bottom-6 right-6 text-8xl font-bold opacity-5 text-gray-900">
                    0{card.id}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
