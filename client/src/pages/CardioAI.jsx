import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Brain, Scale, BarChart2, AlertCircle } from 'lucide-react';
import PatientForm from '../components/AI/PatientForm';
import ResultDisplay from '../components/AI/ResultDisplay';
import ExplainabilityTab from '../components/AI/ExplainabilityTab';
import FairnessTab from '../components/AI/FairnessTab';
import MetricsCharts from '../components/AI/MetricsCharts';
import { predictRisk, getExplanation, checkHealth } from '../services/cardioApi';
import toast from 'react-hot-toast';

const CardioAI = () => {
  const [activeTab, setActiveTab] = useState('assessment');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [backendReady, setBackendReady] = useState(null);

  const tabs = [
    { id: 'assessment', label: 'Patient Assessment', icon: Heart },
    { id: 'explainability', label: 'Explainability', icon: Brain },
    { id: 'fairness', label: 'Fairness', icon: Scale },
    { id: 'metrics', label: 'Model Metrics', icon: BarChart2 },
  ];

  useEffect(() => {
    checkBackendHealth();
  }, []);

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
    setIsLoading(true);
    setPatientData(data);
    
    try {
      // Get prediction
      const predResult = await predictRisk(data);
      setResult(predResult);
      
      // Get explanation
      const explainResult = await getExplanation(data);
      setExplanation(explainResult);
      
      toast.success(`Risk Assessment Complete: ${predResult.risk_level} Risk`);
    } catch (error) {
      console.error('Prediction error:', error);
      toast.error('Failed to get prediction. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1ED] via-white to-[#E8DFF5]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8B7FCF] to-[#6B5B9A] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="p-3 bg-white/20 rounded-2xl">
              <Heart className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">CardioShield AI</h1>
              <p className="text-white/80 mt-1">Advanced Cardiovascular Risk Prediction System</p>
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
              <span>Backend not connected. Start the server with: <code className="bg-white/20 px-2 py-1 rounded">python -m uvicorn app.main:app --reload</code></span>
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
