import React from 'react';
import { motion } from 'framer-motion';
import { Heart, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

const ResultDisplay = ({ result, patientData }) => {
  if (!result) return null;

  const { risk_score, risk_level, confidence, recommendations } = result;
  
  const getRiskColor = () => {
    if (risk_level === 'Low') return { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50' };
    if (risk_level === 'Moderate') return { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-50' };
    if (risk_level === 'High') return { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50' };
    return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50' };
  };

  const colors = getRiskColor();
  const riskPercent = Math.round(risk_score * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      <h3 className="text-xl font-semibold text-[#4A3B5C] mb-6 flex items-center gap-2">
        <Activity className="w-6 h-6 text-[#8B7FCF]" />
        Risk Assessment Result
      </h3>

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
              className={`text-4xl font-bold ${colors.text}`}
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
          className={`mt-4 px-6 py-2 rounded-full ${colors.light} ${colors.text} font-semibold flex items-center gap-2`}
        >
          {risk_level === 'Low' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {risk_level} Risk
        </motion.div>

        {/* Confidence */}
        <p className="text-gray-500 text-sm mt-2">
          Model Confidence: {Math.round(confidence * 100)}%
        </p>
      </div>

      {/* Patient Summary */}
      <div className={`p-4 rounded-xl ${colors.light} mb-6`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Age</span>
            <p className="font-semibold text-gray-700">{patientData.age} years</p>
          </div>
          <div>
            <span className="text-gray-500">BMI</span>
            <p className="font-semibold text-gray-700">
              {(patientData.weight / ((patientData.height / 100) ** 2)).toFixed(1)}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Blood Pressure</span>
            <p className="font-semibold text-gray-700">{patientData.ap_hi}/{patientData.ap_lo}</p>
          </div>
          <div>
            <span className="text-gray-500">Cholesterol</span>
            <p className="font-semibold text-gray-700">
              {patientData.cholesterol === 1 ? 'Normal' : patientData.cholesterol === 2 ? 'Above' : 'High'}
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-[#8B7FCF]" />
          Recommendations
        </h4>
        <ul className="space-y-2">
          {recommendations.map((rec, idx) => (
            <motion.li
              key={idx}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              className="flex items-start gap-2 text-gray-600"
            >
              <span className="w-2 h-2 rounded-full bg-[#8B7FCF] mt-2 flex-shrink-0" />
              {rec}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default ResultDisplay;
