import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Heart, AlertTriangle, CheckCircle, Activity, 
  Clock, FileText, Download, Save, Lightbulb,
  Droplets, Gauge, TrendingUp, Shield, Brain
} from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * ResultModal - Full-screen overlay modal for AI prediction results
 * 
 * Features:
 * - Animated modal with blur backdrop
 * - Risk level visualization (Low/Moderate/High/Very High)
 * - Health data summary
 * - Personalized recommendations
 * - Download PDF & Save assessment options
 * - Close on outside click
 */

const ResultModal = ({ 
  isOpen, 
  onClose, 
  result, 
  patientData,
  onSave,
  isSaving = false
}) => {
  const modalRef = useRef(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle outside click
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!result || !patientData) return null;

  const { risk_score, risk_level, confidence, recommendations } = result;
  const riskPercent = Math.round((risk_score || 0) * 100);

  // Risk configuration
  const getRiskConfig = () => {
    switch(risk_level) {
      case 'Low': 
        return { 
          bg: 'bg-green-500', 
          text: 'text-green-600', 
          light: 'bg-green-50',
          border: 'border-green-200',
          gradient: 'from-green-500 to-emerald-500',
          message: 'Great news! Your cardiovascular disease risk is low. Keep up the healthy lifestyle!',
          icon: CheckCircle
        };
      case 'Moderate': 
        return { 
          bg: 'bg-yellow-500', 
          text: 'text-yellow-600', 
          light: 'bg-yellow-50',
          border: 'border-yellow-200',
          gradient: 'from-yellow-500 to-orange-500',
          message: 'Your risk is moderate. Consider lifestyle changes to reduce your risk.',
          icon: AlertTriangle
        };
      case 'High': 
        return { 
          bg: 'bg-orange-500', 
          text: 'text-orange-600', 
          light: 'bg-orange-50',
          border: 'border-orange-200',
          gradient: 'from-orange-500 to-red-500',
          message: 'Your risk is elevated. We recommend consulting with a healthcare provider soon.',
          icon: AlertTriangle
        };
      default: 
        return { 
          bg: 'bg-red-500', 
          text: 'text-red-600', 
          light: 'bg-red-50',
          border: 'border-red-200',
          gradient: 'from-red-500 to-rose-600',
          message: 'Your risk is very high. Please consult with a healthcare provider as soon as possible.',
          icon: AlertTriangle
        };
    }
  };

  const config = getRiskConfig();
  const RiskIcon = config.icon;

  // Blood pressure interpretation
  const getBPInterpretation = () => {
    const sys = patientData.ap_hi || 120;
    const dia = patientData.ap_lo || 80;
    if (sys < 120 && dia < 80) return { label: 'Normal', color: 'text-green-600', detail: 'Blood pressure is within healthy range' };
    if (sys < 130 && dia < 80) return { label: 'Elevated', color: 'text-yellow-600', detail: 'Blood pressure is slightly elevated' };
    if (sys < 140 || dia < 90) return { label: 'High (Stage 1)', color: 'text-orange-600', detail: 'Hypertension Stage 1 - Consider lifestyle changes' };
    return { label: 'High (Stage 2)', color: 'text-red-600', detail: 'Hypertension Stage 2 - Medical attention recommended' };
  };

  // Cholesterol interpretation
  const getCholInterpretation = () => {
    const chol = patientData.cholesterol || 1;
    if (chol === 1) return { label: 'Normal', color: 'text-green-600', detail: 'Cholesterol levels are healthy' };
    if (chol === 2) return { label: 'Above Normal', color: 'text-yellow-600', detail: 'Consider dietary adjustments' };
    return { label: 'Well Above Normal', color: 'text-red-600', detail: 'Medical intervention may be needed' };
  };

  // Glucose interpretation
  const getGlucInterpretation = () => {
    const gluc = patientData.gluc || 1;
    if (gluc === 1) return { label: 'Normal', color: 'text-green-600', detail: 'Blood sugar is within normal range' };
    if (gluc === 2) return { label: 'Above Normal', color: 'text-yellow-600', detail: 'Monitor blood sugar levels' };
    return { label: 'Well Above Normal', color: 'text-red-600', detail: 'Check for diabetes risk' };
  };

  const bpInfo = getBPInterpretation();
  const cholInfo = getCholInterpretation();
  const glucInfo = getGlucInterpretation();

  // Calculate BMI
  const getBMI = () => {
    const h = patientData.height || 170;
    const w = patientData.weight || 70;
    return (w / ((h / 100) ** 2)).toFixed(1);
  };
  const bmi = getBMI();

  // Handle PDF download
  const handleDownloadPDF = () => {
    toast.success('PDF download feature coming soon!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={handleBackdropClick}
        >
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>

            {/* Header with Risk Level */}
            <div className={`bg-gradient-to-r ${config.gradient} text-white p-8 rounded-t-3xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Heart className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">AI Health Assessment Result</h2>
                    <p className="text-white/80 mt-1 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date().toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Brain className="w-4 h-4" />
                    Powered by LightGBM
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-8">
              {/* Risk Score Section */}
              <div className="flex flex-col items-center mb-8">
                {/* Circular Progress */}
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="96" cy="96" r="80" 
                      fill="none" 
                      stroke="#E5E7EB" 
                      strokeWidth="16" 
                    />
                    <motion.circle
                      cx="96" cy="96" r="80" 
                      fill="none"
                      stroke={risk_level === 'Low' ? '#22C55E' : risk_level === 'Moderate' ? '#EAB308' : risk_level === 'High' ? '#F97316' : '#EF4444'}
                      strokeWidth="16"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: '0 502' }}
                      animate={{ strokeDasharray: `${riskPercent * 5.02} 502` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                  </svg>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span 
                      className={`text-5xl font-bold ${config.text}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {riskPercent}%
                    </motion.span>
                    <span className="text-gray-500 text-sm mt-1">Risk Probability</span>
                  </div>
                </div>

                {/* Risk Level Badge */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className={`mt-6 px-8 py-3 rounded-full ${config.light} ${config.text} font-bold text-lg flex items-center gap-2 border-2 ${config.border}`}
                >
                  <RiskIcon className="w-6 h-6" />
                  {risk_level} Risk
                </motion.div>

                {/* Risk Message */}
                <p className={`text-center mt-4 max-w-lg ${config.text} font-medium text-lg`}>
                  {config.message}
                </p>

                {/* AI Confidence */}
                <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
                  <Shield className="w-4 h-4" />
                  AI Confidence: <span className="font-semibold">{Math.round((confidence || 0.5) * 100)}%</span>
                </div>
              </div>

              {/* Health Summary Cards */}
              <div className={`p-6 rounded-2xl ${config.light} border ${config.border} mb-6`}>
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  Health Data Summary
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <span className="text-gray-500 text-xs block mb-2">Age</span>
                    <p className="font-bold text-2xl text-gray-800">{patientData.age}</p>
                    <span className="text-gray-400 text-xs">years</span>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <span className="text-gray-500 text-xs block mb-2">Gender</span>
                    <p className="font-bold text-2xl text-gray-800">{patientData.gender === 2 ? 'Male' : 'Female'}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <span className="text-gray-500 text-xs block mb-2">Blood Pressure</span>
                    <p className="font-bold text-xl text-gray-800">{patientData.ap_hi}/{patientData.ap_lo}</p>
                    <span className={`text-xs font-medium ${bpInfo.color}`}>{bpInfo.label}</span>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <span className="text-gray-500 text-xs block mb-2">BMI</span>
                    <p className="font-bold text-2xl text-gray-800">{bmi}</p>
                    <span className="text-gray-400 text-xs">kg/m²</span>
                  </div>
                </div>
              </div>

              {/* Interpretations */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {/* Blood Pressure */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Gauge className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-gray-800">Blood Pressure</h4>
                  </div>
                  <p className={`font-bold text-lg ${bpInfo.color}`}>{bpInfo.label}</p>
                  <p className="text-gray-500 text-sm mt-1">{bpInfo.detail}</p>
                </div>

                {/* Cholesterol */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplets className="w-5 h-5 text-purple-500" />
                    <h4 className="font-semibold text-gray-800">Cholesterol</h4>
                  </div>
                  <p className={`font-bold text-lg ${cholInfo.color}`}>{cholInfo.label}</p>
                  <p className="text-gray-500 text-sm mt-1">{cholInfo.detail}</p>
                </div>

                {/* Glucose */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-pink-500" />
                    <h4 className="font-semibold text-gray-800">Glucose</h4>
                  </div>
                  <p className={`font-bold text-lg ${glucInfo.color}`}>{glucInfo.label}</p>
                  <p className="text-gray-500 text-sm mt-1">{glucInfo.detail}</p>
                </div>
              </div>

              {/* Personalized Recommendations */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100 mb-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Personalized Recommendations
                </h3>
                <ul className="space-y-3">
                  {(recommendations || []).map((rec, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span>{rec}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download PDF Report
                </button>
                
                <button
                  onClick={onSave}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#8B7FCF] to-[#6B5B9A] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Assessment
                    </>
                  )}
                </button>
              </div>

              {/* Disclaimer */}
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-amber-800 text-xs text-center">
                  <strong>Medical Disclaimer:</strong> This AI assessment is for educational purposes only 
                  and should not replace professional medical advice. Always consult with a healthcare provider.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResultModal;
