import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Activity, Clock, Lightbulb, FileText } from 'lucide-react';

const ResultDisplay = ({ result, patientData }) => {
  if (!result) return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full flex items-center justify-center p-8">
      <div className="text-center text-gray-400">
        <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Fill the form and click "Predict Risk"</p>
        <p className="text-xs mt-1">Results will appear here</p>
      </div>
    </div>
  );

  const { risk_score, risk_level, confidence, recommendations } = result;
  
  const config = {
    Low: { text: 'text-green-600', light: 'bg-green-50', border: 'border-green-200', stroke: '#22C55E' },
    Moderate: { text: 'text-yellow-600', light: 'bg-yellow-50', border: 'border-yellow-200', stroke: '#EAB308' },
    High: { text: 'text-orange-600', light: 'bg-orange-50', border: 'border-orange-200', stroke: '#F97316' },
  }[risk_level] || { text: 'text-red-600', light: 'bg-red-50', border: 'border-red-200', stroke: '#EF4444' };

  const riskPercent = Math.round(risk_score * 100);
  const bmi = (patientData.weight / ((patientData.height / 100) ** 2)).toFixed(1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full flex flex-col p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-[#4A3B5C] flex items-center gap-2"><Activity className="w-5 h-5 text-[#8B7FCF]" />Risk Assessment Result</h3>
        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{new Date().toLocaleString()}</span>
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
          <div className="bg-white rounded-lg p-2"><span className="text-xs text-gray-400 block">Chol</span><span className={`font-bold ${patientData.cholesterol > 1 ? 'text-yellow-600' : 'text-green-600'}`}>{['','N','↑','↑↑'][patientData.cholesterol]}</span></div>
          <div className="bg-white rounded-lg p-2"><span className="text-xs text-gray-400 block">Gluc</span><span className={`font-bold ${patientData.gluc > 1 ? 'text-yellow-600' : 'text-green-600'}`}>{['','N','↑','↑↑'][patientData.gluc]}</span></div>
          <div className="bg-white rounded-lg p-2"><span className="text-xs text-gray-400 block">Smoke</span><span className={`font-bold ${patientData.smoke ? 'text-red-600' : 'text-green-600'}`}>{patientData.smoke ? '✗' : '✓'}</span></div>
          <div className="bg-white rounded-lg p-2"><span className="text-xs text-gray-400 block">Active</span><span className={`font-bold ${patientData.active ? 'text-green-600' : 'text-red-600'}`}>{patientData.active ? '✓' : '✗'}</span></div>
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
    </motion.div>
  );
};

export default ResultDisplay;
