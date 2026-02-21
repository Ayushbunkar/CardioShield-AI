import React from "react";

const About = () => {
  return (
    <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-red-950 py-20 px-6 text-gray-200">
      
      <div className="max-w-6xl mx-auto text-center">

        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-red-400 to-cyan-400 bg-clip-text text-transparent">
          About CardioShield AI
        </h2>

        <p className="text-gray-400 text-lg mb-12 max-w-3xl mx-auto">
          AI-Powered Early Cardiovascular Risk Stratification Platform
        </p>

        {/* Executive Summary */}
        <div className="bg-slate-800/60 backdrop-blur-md border border-cyan-500/20 rounded-2xl shadow-xl p-8 mb-16 text-left">
          <h3 className="text-2xl font-bold text-cyan-400 mb-4">
            1. Executive Summary
          </h3>

          <p className="mb-6 leading-relaxed text-gray-300">
            CardioShield AI is an explainable, low-cost, deployable AI platform 
            designed for early risk prediction of cardiovascular diseases (CVD) 
            — specifically heart attacks and strokes — in underserved and 
            resource-constrained populations.
          </p>

          <ul className="list-disc pl-6 space-y-3 text-gray-300">
            <li>High-accuracy 5–10 year CVD risk prediction</li>
            <li>Point-of-care screening using low-cost clinical inputs</li>
            <li>Real-time explainable risk scoring</li>
            <li>Bias-aware model calibration for South Asian populations</li>
            <li>Offline-capable deployment in rural health settings</li>
          </ul>

          <p className="mt-6 text-gray-400 italic">
            Input → Clean → Engineer → Predict → Calibrate → Explain → Stratify → Act
          </p>
        </div>

        {/* Product Vision */}
        <div className="bg-slate-800/60 backdrop-blur-md border border-red-500/20 rounded-2xl shadow-xl p-8 mb-16 text-left">
          <h3 className="text-2xl font-bold text-red-400 mb-4">
            2. Product Vision
          </h3>

          <ul className="list-disc pl-6 space-y-3 text-gray-300">
            <li>Affordable AI-based risk screening</li>
            <li>Clinically interpretable risk explanations</li>
            <li>Bias-aware decision support</li>
            <li>Scalable population-level screening</li>
            <li>Deployment-ready architecture for rural clinics</li>
          </ul>

          <p className="mt-6 text-gray-400 font-semibold">
            CardioShield AI is not a diagnostic replacement.  
            It is an early-warning risk stratification system.
          </p>
        </div>

        {/* Target Users */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 text-left">
          
          <div className="bg-slate-800/60 border border-cyan-500/20 rounded-xl shadow-md p-6">
            <h4 className="text-xl font-semibold text-cyan-400 mb-4">
              3. Target Users – Primary
            </h4>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>Rural Primary Health Centers (PHCs)</li>
              <li>Community Health Workers</li>
              <li>Government screening programs</li>
              <li>Insurance risk stratification teams</li>
              <li>Telehealth providers</li>
            </ul>
          </div>

          <div className="bg-slate-800/60 border border-red-500/20 rounded-xl shadow-md p-6">
            <h4 className="text-xl font-semibold text-red-400 mb-4">
              End Beneficiaries
            </h4>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>Adults aged 30–65</li>
              <li>High-risk South Asian populations</li>
              <li>Low-income & underserved communities</li>
            </ul>
          </div>

        </div>

        {/* System Architecture */}
        <div className="bg-slate-800/60 backdrop-blur-md border border-cyan-500/20 rounded-2xl shadow-xl p-8 text-left max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-cyan-400 mb-4">
            4. System Architecture
          </h3>

          <p className="mb-6 text-gray-300">
            CardioShield AI consists of two major components:
          </p>

          <div className="space-y-4">
            <div className="bg-slate-900 p-4 rounded-lg border border-cyan-500/20">
              <h5 className="font-semibold text-cyan-300">
                PART 1 – Core Risk Stratification Engine (~70%)
              </h5>
              <p className="text-sm text-gray-400">
                Machine learning-based predictive modeling system for 
                cardiovascular risk scoring using structured clinical inputs.
              </p>
            </div>

            <div className="bg-slate-900 p-4 rounded-lg border border-red-500/20">
              <h5 className="font-semibold text-red-300">
                PART 2 – Advanced Clinical Intelligence, Ethics & Deployment Layer (~30%)
              </h5>
              <p className="text-sm text-gray-400">
                Explainability framework, bias calibration, fairness evaluation,
                and deployment infrastructure for rural and low-resource settings.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default About;