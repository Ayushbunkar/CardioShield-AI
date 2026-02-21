import React from 'react';
import { motion } from 'framer-motion';
import { Heart, AlertTriangle, CheckCircle, Activity, Clock, Stethoscope, Lightbulb, Info, FileText } from 'lucide-react';

const ResultDisplay = ({ result, patientData }) => {
  if (!result) return null;

  const { risk_score, risk_level, confidence, recommendations } = result;
  
  const getRiskConfig = () => {
    switch(risk_level) {
      case 'Low': 
        return { 
          bg: 'bg-green-500', 
          text: 'text-green-600', 
          light: 'bg-green-50',
          border: 'border-green-200',
          message: 'Great news! Your heart disease risk is low. Keep up the healthy lifestyle!'
        };
      case 'Moderate': 
        return { 
          bg: 'bg-yellow-500', 
          text: 'text-yellow-600', 
          light: 'bg-yellow-50',
          border: 'border-yellow-200',
          message: 'Your risk is moderate. Consider lifestyle changes to reduce your risk.'
        };
      case 'High': 
        return { 
          bg: 'bg-orange-500', 
          text: 'text-orange-600', 
          light: 'bg-orange-50',
          border: 'border-orange-200',
          message: 'Your risk is elevated. We recommend consulting with a healthcare provider soon.'
        };
      default: 
        return { 
          bg: 'bg-red-500', 
          text: 'text-red-600', 
          light: 'bg-red-50',
          border: 'border-red-200',
          message: 'Your risk is very high. Please consult with a healthcare provider as soon as possible.'
        };
    }
  };

  const config = getRiskConfig();
  const riskPercent = Math.round(risk_score * 100);

  // Blood pressure category
  const getBPCategory = () => {
    const bp = patientData.trestbps;
    if (bp < 120) return { label: 'Normal', color: 'text-green-600' };
    if (bp < 130) return { label: 'Elevated', color: 'text-yellow-600' };
    if (bp < 140) return { label: 'High (Stage 1)', color: 'text-orange-600' };
    return { label: 'High (Stage 2)', color: 'text-red-600' };
  };
  const bpInfo = getBPCategory();

  // Cholesterol category
  const getCholCategory = () => {
    const chol = patientData.chol;
    if (chol < 200) return { label: 'Desirable', color: 'text-green-600' };
    if (chol < 240) return { label: 'Borderline', color: 'text-yellow-600' };
    return { label: 'High', color: 'text-red-600' };
  };
  const cholInfo = getCholCategory();

  // Heart Rate Status
  const getHRCategory = () => {
    const hr = patientData.thalach;
    const maxHR = 220 - patientData.age;
    const percent = (hr / maxHR) * 100;
    if (percent < 50) return { label: 'Low', color: 'text-blue-600' };
    if (percent < 85) return { label: 'Normal', color: 'text-green-600' };
    return { label: 'High', color: 'text-orange-600' };
  };
  const hrInfo = getHRCategory();

  // Chest pain type label
  const getChestPainLabel = () => {
    switch(patientData.cp) {
      case 1: return 'Typical Angina';
      case 2: return 'Atypical Angina';
      case 3: return 'Non-Anginal';
      case 4: return 'Asymptomatic';
      default: return 'Unknown';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      {/* Header with timestamp */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[#4A3B5C] flex items-center gap-2">
          <Activity className="w-6 h-6 text-[#8B7FCF]" />
          Your Risk Assessment Result
        </h3>
        <span className="text-sm text-gray-400 flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleString()}
        </span>
      </div>

      {/* Risk Gauge */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-48 h-48">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r="80" fill="none" stroke="#E5E7EB" strokeWidth="16" />
            <motion.circle
              cx="96" cy="96" r="80" fill="none"
              stroke={risk_level === 'Low' ? '#22C55E' : risk_level === 'Moderate' ? '#EAB308' : risk_level === 'High' ? '#F97316' : '#EF4444'}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${riskPercent * 5.02} 502`}
              initial={{ strokeDasharray: '0 502' }}
              animate={{ strokeDasharray: `${riskPercent * 5.02} 502` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span 
              className={`text-4xl font-bold ${config.text}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {riskPercent}%
            </motion.span>
            <span className="text-gray-500 text-sm mt-1">Risk Score</span>
          </div>
        </div>

        {/* Risk Level Badge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`mt-4 px-6 py-2 rounded-full ${config.light} ${config.text} font-semibold flex items-center gap-2 border ${config.border}`}
        >
          {risk_level === 'Low' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {risk_level} Risk
        </motion.div>

        {/* Risk Message */}
        <p className={`text-center mt-4 max-w-md ${config.text} font-medium`}>
          {config.message}
        </p>

        {/* Confidence */}
        <p className="text-gray-400 text-sm mt-2">
          AI Confidence: {Math.round(confidence * 100)}%
        </p>
      </div>

      {/* Patient Summary - Your Health Data */}
      <div className={`p-5 rounded-xl ${config.light} border ${config.border} mb-6`}>
        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" />
          Your Health Data Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 text-center">
            <span className="text-gray-500 text-xs block mb-1">Age</span>
            <p className="font-bold text-lg text-gray-700">{patientData.age} <span className="text-sm font-normal">years</span></p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <span className="text-gray-500 text-xs block mb-1">Blood Pressure</span>
            <p className="font-bold text-lg text-gray-700">{patientData.trestbps} <span className="text-sm font-normal">mmHg</span></p>
            <span className={`text-xs ${bpInfo.color}`}>{bpInfo.label}</span>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <span className="text-gray-500 text-xs block mb-1">Cholesterol</span>
            <p className="font-bold text-lg text-gray-700">{patientData.chol} <span className="text-sm font-normal">mg/dl</span></p>
            <span className={`text-xs ${cholInfo.color}`}>{cholInfo.label}</span>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <span className="text-gray-500 text-xs block mb-1">Max Heart Rate</span>
            <p className="font-bold text-lg text-gray-700">{patientData.thalach} <span className="text-sm font-normal">bpm</span></p>
            <span className={`text-xs ${hrInfo.color}`}>{hrInfo.label}</span>
          </div>
        </div>
        
        {/* Additional clinical info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white rounded-lg p-3 text-center">
            <span className="text-gray-500 text-xs block mb-1">Chest Pain</span>
            <p className="font-bold text-sm text-gray-700">{getChestPainLabel()}</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <span className="text-gray-500 text-xs block mb-1">Exercise Angina</span>
            <p className={`font-bold text-sm ${patientData.exang === 1 ? 'text-red-600' : 'text-green-600'}`}>
              {patientData.exang === 1 ? 'Yes' : 'No'}
            </p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <span className="text-gray-500 text-xs block mb-1">ST Depression</span>
            <p className="font-bold text-lg text-gray-700">{patientData.oldpeak}</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <span className="text-gray-500 text-xs block mb-1">Vessels Affected</span>
            <p className={`font-bold text-lg ${patientData.ca > 0 ? 'text-orange-600' : 'text-green-600'}`}>{patientData.ca}</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
        <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          Personalized Recommendations
        </h4>
        <p className="text-blue-600 text-sm mb-4">Based on your health data, here's what you can do:</p>
        <ul className="space-y-3">
          {recommendations.map((rec, idx) => (
            <motion.li
              key={idx}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              className="flex items-start gap-3 text-blue-700"
            >
              <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {idx + 1}
              </span>
              <span>{rec}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <p className="text-gray-400 text-xs text-center mt-6 flex items-center justify-center gap-1">
        <Info className="w-3 h-3" />
        This AI prediction is for informational purposes only and should not replace professional medical advice.
      </p>
    </motion.div>
  );
};

export default ResultDisplay;
