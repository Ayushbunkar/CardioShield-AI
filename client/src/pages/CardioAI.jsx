import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Brain, Scale, BarChart2, AlertCircle, Lock, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import PatientForm from '../components/AI/PatientForm';
import ResultDisplay from '../components/AI/ResultDisplay';
import ExplainabilityTab from '../components/AI/ExplainabilityTab';
import FairnessTab from '../components/AI/FairnessTab';
import MetricsCharts from '../components/AI/MetricsCharts';
import { 
  predictRisk, 
  getExplanation, 
  checkHealth,
  saveAssessment,
  canGuestUse,
  incrementGuestUsage,
  getRemainingGuestAttempts
} from '../services/cardioApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CardioAI = () => {
  const { isLogin, user } = useAuth();
  const [activeTab, setActiveTab] = useState('assessment');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [backendReady, setBackendReady] = useState(null);
  const [guestAttempts, setGuestAttempts] = useState(getRemainingGuestAttempts());
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const tabs = [
    { id: 'assessment', label: 'Patient Assessment', icon: Heart },
    { id: 'explainability', label: 'Explainability', icon: Brain },
    { id: 'fairness', label: 'Fairness', icon: Scale },
    { id: 'metrics', label: 'Model Metrics', icon: BarChart2 },
  ];

  useEffect(() => {
    checkBackendHealth();
  }, []);

  useEffect(() => {
    if (isLogin) {
      setShowLoginPrompt(false);
    } else {
      setGuestAttempts(getRemainingGuestAttempts());
    }
  }, [isLogin]);

  const checkBackendHealth = async () => {
    try {
      const health = await checkHealth();
      setBackendReady(health.model_loaded);
      if (!health.model_loaded) {
        toast.error('Model is loading, please wait...');
      }
    } catch {
      setBackendReady(false);
    }
  };

  const handleSubmit = async (data) => {
    // Check guest usage limit
    if (!isLogin) {
      if (!canGuestUse()) {
        setShowLoginPrompt(true);
        toast.error('Free trial limit reached. Please login to continue.');
        return;
      }
    }

    setIsLoading(true);
    setPatientData(data);
    
    try {
      const predResult = await predictRisk(data);
      setResult(predResult);
      
      const explainResult = await getExplanation(data);
      setExplanation(explainResult);
      
      // If user is logged in, save the assessment
      if (isLogin) {
        try {
          await saveAssessment({
            patientData: data,
            riskScore: predResult.risk_score,
            riskLevel: predResult.risk_level,
            prediction: predResult.prediction,
            confidence: predResult.confidence,
            recommendations: predResult.recommendations,
          });
          toast.success('Assessment saved to your history!');
        } catch (saveError) {
          console.error('Failed to save assessment:', saveError);
        }
      } else {
        incrementGuestUsage();
        setGuestAttempts(getRemainingGuestAttempts());
      }
      
      toast.success(`Risk Assessment Complete: ${predResult.risk_level} Risk`);
    } catch (error) {
      console.error('Prediction error:', error);
      toast.error('Failed to get prediction. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  // Login Required Modal
  const LoginPromptModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => setShowLoginPrompt(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-[#8B7FCF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-[#8B7FCF]" />
          </div>
          <h3 className="text-2xl font-bold text-[#4A3B5C] mb-2">Free Trial Ended</h3>
          <p className="text-gray-600 mb-6">
            You've used all 3 free assessments. Login or register to get <strong>unlimited access</strong> and save your assessment history!
          </p>
          <div className="flex gap-3">
            <Link 
              to="/login"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8B7FCF] to-[#6B5B9A] text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              <LogIn className="w-5 h-5" />
              Login
            </Link>
            <Link
              to="/register"
              className="flex-1 px-6 py-3 border-2 border-[#8B7FCF] text-[#8B7FCF] rounded-xl font-semibold hover:bg-[#8B7FCF]/5 transition text-center"
            >
              Register
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1ED] via-white to-[#E8DFF5]">
      {/* Login Prompt Modal */}
      {showLoginPrompt && <LoginPromptModal />}

      {/* Header */}
      <div className="bg-gradient-to-r from-[#8B7FCF] to-[#6B5B9A] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between flex-wrap gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Heart className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">CardioShield AI</h1>
                <p className="text-white/80 mt-1">Advanced Cardiovascular Risk Prediction System</p>
              </div>
            </div>

            {/* User Status / Guest Counter */}
            <div className="flex items-center gap-4">
              {isLogin ? (
                <div className="flex items-center gap-3 bg-white/20 px-4 py-2 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center font-bold">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user?.fullName}</p>
                    <p className="text-white/70 text-xs">Unlimited Access</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white/20 px-4 py-2 rounded-xl">
                  <p className="text-sm">
                    <span className="font-bold">{guestAttempts}</span> free attempts remaining
                  </p>
                  <Link to="/login" className="text-white/80 text-xs hover:text-white underline">
                    Login for unlimited access
                  </Link>
                </div>
              )}

              {isLogin && (
                <Link
                  to="/dashboard"
                  className="bg-white text-[#8B7FCF] px-4 py-2 rounded-xl font-medium hover:bg-white/90 transition"
                >
                  My Dashboard
                </Link>
              )}
            </div>
          </motion.div>

          {/* Backend Status */}
          {backendReady === false && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 text-yellow-200"
            >
              <AlertCircle className="w-5 h-5" />
              <span>Backend not connected. Start the server.</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#8B7FCF] border-[#8B7FCF]'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'assessment' && (
            <motion.div
              key="assessment"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid lg:grid-cols-2 gap-6"
            >
              <PatientForm onSubmit={handleSubmit} isLoading={isLoading} />
              <ResultDisplay result={result} patientData={patientData} />
            </motion.div>
          )}

          {activeTab === 'explainability' && (
            <motion.div
              key="explainability"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ExplainabilityTab explanation={explanation} isLoading={isLoading} />
            </motion.div>
          )}

          {activeTab === 'fairness' && (
            <motion.div
              key="fairness"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <FairnessTab />
            </motion.div>
          )}

          {activeTab === 'metrics' && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <MetricsCharts />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>
            CardioShield AI uses machine learning to assess cardiovascular risk. 
            This tool is for educational purposes and should not replace professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardioAI;
