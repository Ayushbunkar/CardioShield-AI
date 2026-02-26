import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Activity, Clock, Lightbulb, FileText, MapPin, X, Navigation, Check, XIcon, TrendingUp, Minus, CircleAlert, Info } from 'lucide-react';
import { RiskResultPage } from '../Location';

const ResultDisplay = ({ result, patientData }) => {
  const [showHospitalMap, setShowHospitalMap] = useState(false);
  if (!result) return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full flex items-center justify-center p-8">
      <div className="text-center text-gray-400">
        <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Fill the form and click "Predict Risk"</p>
        <p className="text-xs mt-1">Results will appear here</p>
      </div>
    </div>
  );

  const { risk_score, risk_level, confidence, recommendations, disclaimer, escalation, urgency, model_version } = result;
  
  const config = {
    Low: { text: 'text-green-600', light: 'bg-green-50', border: 'border-green-200', stroke: '#22C55E' },
    Moderate: { text: 'text-yellow-600', light: 'bg-yellow-50', border: 'border-yellow-200', stroke: '#EAB308' },
    High: { text: 'text-orange-600', light: 'bg-orange-50', border: 'border-orange-200', stroke: '#F97316' },
  }[risk_level] || { text: 'text-red-600', light: 'bg-red-50', border: 'border-red-200', stroke: '#EF4444' };

  const riskPercent = Math.round(risk_score * 100);
  const bmi = (patientData.weight / ((patientData.height / 100) ** 2)).toFixed(1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full flex flex-col p-5">
      {/* Escalation Alert */}
      {escalation && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-red-600 text-white rounded-xl flex items-center gap-3">
          <div>
            <p className="font-bold text-sm">Urgent: Immediate Action Required</p>
            <p className="text-xs text-white/90">{escalation}</p>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-[#4A3B5C] flex items-center gap-2"><Activity className="w-5 h-5 text-[#8B7FCF]" />Risk Assessment Result</h3>
        <div className="text-right">
          <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date().toLocaleString()}</span>
          {model_version && <span className="text-[10px] text-gray-300">Model v{model_version}</span>}
        </div>
      </div>

      {/* Risk Gauge */}
      <div className="flex items-center gap-5 mb-5">
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="56" cy="56" r="48" fill="none" stroke="#E5E7EB" strokeWidth="10" />
            <motion.circle cx="56" cy="56" r="48" fill="none" stroke={config.stroke} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${riskPercent * 3.01} 301`} initial={{ strokeDasharray: '0 301' }}
              animate={{ strokeDasharray: `${riskPercent * 3.01} 301` }} transition={{ duration: 1 }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${config.text}`}>{riskPercent}%</span>
            <span className="text-xs text-gray-400">Risk</span>
          </div>
        </div>
        <div className="flex-1">
          <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full ${config.light} ${config.text} text-sm font-semibold border ${config.border} mb-2`}>
            {risk_level === 'Low' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}{risk_level} Risk
          </div>
          <p className="text-xs text-gray-400">AI Confidence: {Math.round(confidence * 100)}%</p>
        </div>
      </div>

      {/* Health Summary */}
      <div className={`p-4 rounded-xl ${config.light} border ${config.border} mb-4 flex-1`}>
        <div className="flex items-center gap-2 mb-3"><FileText className="w-4 h-4 text-gray-500" /><span className="text-sm font-semibold text-gray-600">Health Summary</span></div>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="bg-white rounded-lg p-2"><span className="text-xs text-gray-400 block">Age</span><span className="font-bold text-gray-700">{patientData.age}y</span></div>
          <div className="bg-white rounded-lg p-2"><span className="text-xs text-gray-400 block">BP</span><span className="font-bold text-gray-700">{patientData.ap_hi}/{patientData.ap_lo}</span></div>
          <div className="bg-white rounded-lg p-2"><span className="text-xs text-gray-400 block">BMI</span><span className="font-bold text-gray-700">{bmi}</span></div>
          <div className="bg-white rounded-lg p-2"><span className="text-xs text-gray-400 block">Gender</span><span className="font-bold text-gray-700">{patientData.gender === 2 ? 'M' : 'F'}</span></div>
        </div>
        <div className="grid grid-cols-4 gap-3 text-center mt-3">
          <div className="bg-white rounded-lg p-2"><span className="text-xs text-gray-400 block">Chol</span><span className={`font-bold flex justify-center ${patientData.cholesterol > 1 ? 'text-yellow-600' : 'text-green-600'}`}>{patientData.cholesterol === 1 ? <Minus className="w-4 h-4" /> : patientData.cholesterol === 2 ? <TrendingUp className="w-4 h-4" /> : <><TrendingUp className="w-4 h-4" /><TrendingUp className="w-4 h-4 -ml-1" /></>}</span></div>
          <div className="bg-white rounded-lg p-2"><span className="text-xs text-gray-400 block">Gluc</span><span className={`font-bold flex justify-center ${patientData.gluc > 1 ? 'text-yellow-600' : 'text-green-600'}`}>{patientData.gluc === 1 ? <Minus className="w-4 h-4" /> : patientData.gluc === 2 ? <TrendingUp className="w-4 h-4" /> : <><TrendingUp className="w-4 h-4" /><TrendingUp className="w-4 h-4 -ml-1" /></>}</span></div>
          <div className="bg-white rounded-lg p-2"><span className="text-xs text-gray-400 block">Smoke</span><span className={`font-bold ${patientData.smoke ? 'text-red-600' : 'text-green-600'}`}>{patientData.smoke ? <XIcon className="w-4 h-4 mx-auto" /> : <Check className="w-4 h-4 mx-auto" />}</span></div>
          <div className="bg-white rounded-lg p-2"><span className="text-xs text-gray-400 block">Active</span><span className={`font-bold ${patientData.active ? 'text-green-600' : 'text-red-600'}`}>{patientData.active ? <Check className="w-4 h-4 mx-auto" /> : <XIcon className="w-4 h-4 mx-auto" />}</span></div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-blue-600" /><span className="text-sm font-semibold text-blue-800">Recommendations</span></div>
        <ul className="space-y-2">
          {recommendations.slice(0, 3).map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-blue-700">
              <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{idx + 1}</span>
              <span className="line-clamp-1">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      {disclaimer && (
        <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-2">
          <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-gray-500 leading-relaxed">{disclaimer}</p>
        </div>
      )}

      {/* Find Nearby Hospitals Button - Shows for Moderate/High risk */}
      {(risk_level === 'Moderate' || risk_level === 'High' || risk_level === 'Very High') && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => setShowHospitalMap(true)}
          className={`mt-4 w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg ${
            risk_level === 'High' || risk_level === 'Very High'
              ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white'
              : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white'
          }`}
        >
          <MapPin className="w-5 h-5" />
          Find Nearby Hospitals & Care Centers
          <Navigation className="w-4 h-4" />
        </motion.button>
      )}

      {/* Hospital Map Modal */}
      <AnimatePresence>
        {showHospitalMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowHospitalMap(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl h-[90vh] rounded-2xl overflow-y-auto shadow-2xl custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowHospitalMap(false)}
                className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Risk Result Page with Map */}
              <RiskResultPage
                riskProbability={Math.round(risk_score * 100)}
                assessmentData={patientData}
                onNewAssessment={() => setShowHospitalMap(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ResultDisplay;
