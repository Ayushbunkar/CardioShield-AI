import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Activity, Loader2, Sparkles, Info,
  Shield, AlertTriangle, CheckCircle, Save,
  TrendingUp, FileText
} from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout';
import usePredict from '../hooks/usePredict';
import { useAuth } from '../context/AuthContext';
import { checkHealth } from '../services/cardioApi';
import toast from 'react-hot-toast';

const AIAssessment = () => {
  const { isLogin } = useAuth();
  const { isLoading, isSaving, result, predict, save, hasResult } = usePredict(isLogin);
  const [backendReady, setBackendReady] = useState(null);
  const [errors, setErrors] = useState({});
  const [showWarmupHint, setShowWarmupHint] = useState(false);

  const [formData, setFormData] = useState({
    age: 50, gender: 2, height: 170, weight: 70,
    ap_hi: 120, ap_lo: 80, cholesterol: 1, gluc: 1,
    smoke: 0, alco: 0, active: 1
  });

  useEffect(() => {
    checkHealth()
      .then(h => setBackendReady(h.status === 'healthy'))
      .catch(() => setBackendReady(false));
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setShowWarmupHint(false);
      return;
    }

    const timer = setTimeout(() => setShowWarmupHint(true), 3000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const bmi = useMemo(() => {
    const h = formData.height / 100;
    return (formData.weight / (h * h)).toFixed(1);
  }, [formData.height, formData.weight]);

  const bmiCategory = useMemo(() => {
    const b = parseFloat(bmi);
    if (b < 18.5) return { label: 'Underweight', color: 'blue' };
    if (b < 25) return { label: 'Normal', color: 'emerald' };
    if (b < 30) return { label: 'Overweight', color: 'amber' };
    return { label: 'Obese', color: 'red' };
  }, [bmi]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const e = {};
    if (formData.age < 18 || formData.age > 100) e.age = '18-100';
    if (formData.height < 100 || formData.height > 250) e.height = '100-250';
    if (formData.weight < 30 || formData.weight > 300) e.weight = '30-300';
    if (formData.ap_hi < 70 || formData.ap_hi > 250) e.ap_hi = '70-250';
    if (formData.ap_lo < 40 || formData.ap_lo > 180) e.ap_lo = '40-180';
    if (formData.ap_lo >= formData.ap_hi) e.ap_lo = '< Sys';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!backendReady) return toast.error('AI Backend offline');
    if (!validate()) return toast.error('Fix form errors');
    await predict(formData);
  };

  const handleSave = async () => {
    const { success } = await save();
    if (success) toast.success('Saved to history');
  };

  const riskScore = result?.ensemble?.probability ?? result?.lightgbm?.probability ?? 0;
  const isHighRisk = riskScore > 0.5;

  return (
    <DashboardLayout activeNav="ai-assessment">
      <div className="p-4 max-w-[1600px] mx-auto">
        {/* Compact Horizontal Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="flex flex-wrap items-end gap-3">
            {/* Age */}
            <InputField label="Age" value={formData.age} onChange={v => handleChange('age', v)} error={errors.age} suffix="yrs" width="w-20" />
            
            {/* Gender */}
            <div className="flex flex-col">
              <label className="text-[10px] font-medium text-gray-500 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={e => handleChange('gender', +e.target.value)}
                className="h-9 px-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white"
              >
                <option value={2}>Male</option>
                <option value={1}>Female</option>
              </select>
            </div>

            {/* Height */}
            <InputField label="Height" value={formData.height} onChange={v => handleChange('height', v)} error={errors.height} suffix="cm" width="w-20" />
            
            {/* Weight */}
            <InputField label="Weight" value={formData.weight} onChange={v => handleChange('weight', v)} error={errors.weight} suffix="kg" width="w-20" />

            {/* Divider */}
            <div className="h-9 w-px bg-gray-200 mx-1" />

            {/* Systolic */}
            <InputField label="Systolic" value={formData.ap_hi} onChange={v => handleChange('ap_hi', v)} error={errors.ap_hi} width="w-20" />
            
            {/* Diastolic */}
            <InputField label="Diastolic" value={formData.ap_lo} onChange={v => handleChange('ap_lo', v)} error={errors.ap_lo} width="w-20" />

            {/* Divider */}
            <div className="h-9 w-px bg-gray-200 mx-1" />

            {/* Cholesterol */}
            <div className="flex flex-col">
              <label className="text-[10px] font-medium text-gray-500 mb-1">Cholesterol</label>
              <select
                value={formData.cholesterol}
                onChange={e => handleChange('cholesterol', +e.target.value)}
                className="h-9 px-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white"
              >
                <option value={1}>Normal</option>
                <option value={2}>Above</option>
                <option value={3}>High</option>
              </select>
            </div>

            {/* Glucose */}
            <div className="flex flex-col">
              <label className="text-[10px] font-medium text-gray-500 mb-1">Glucose</label>
              <select
                value={formData.gluc}
                onChange={e => handleChange('gluc', +e.target.value)}
                className="h-9 px-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white"
              >
                <option value={1}>Normal</option>
                <option value={2}>Above</option>
                <option value={3}>High</option>
              </select>
            </div>

            {/* Divider */}
            <div className="h-9 w-px bg-gray-200 mx-1" />

            {/* Smoke */}
            <ToggleField label="Smoke" value={formData.smoke} onChange={v => handleChange('smoke', v)} yesColor="red" />
            
            {/* Alcohol */}
            <ToggleField label="Alcohol" value={formData.alco} onChange={v => handleChange('alco', v)} yesColor="amber" />
            
            {/* Active */}
            <ToggleField label="Active" value={formData.active} onChange={v => handleChange('active', v)} yesColor="emerald" noColor="red" />

            {/* Divider */}
            <div className="h-9 w-px bg-gray-200 mx-1" />

            {/* BMI Display */}
            <div className="flex flex-col">
              <label className="text-[10px] font-medium text-gray-500 mb-1">BMI</label>
              <div className={`h-9 flex items-center gap-2 px-3 rounded-lg ${
                bmiCategory.color === 'emerald' ? 'bg-emerald-50 border border-emerald-200' :
                bmiCategory.color === 'amber' ? 'bg-amber-50 border border-amber-200' :
                bmiCategory.color === 'red' ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <span className={`font-bold text-sm ${
                  bmiCategory.color === 'emerald' ? 'text-emerald-600' :
                  bmiCategory.color === 'amber' ? 'text-amber-600' :
                  bmiCategory.color === 'red' ? 'text-red-600' :
                  'text-blue-600'
                }`}>{bmi}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  bmiCategory.color === 'emerald' ? 'bg-emerald-500 text-white' :
                  bmiCategory.color === 'amber' ? 'bg-amber-500 text-white' :
                  bmiCategory.color === 'red' ? 'bg-red-500 text-white' :
                  'bg-blue-500 text-white'
                }`}>{bmiCategory.label}</span>
              </div>
            </div>

            {/* BP Display */}
            <div className="flex flex-col">
              <label className="text-[10px] font-medium text-gray-500 mb-1">BP</label>
              <div className="h-9 flex items-center gap-2 px-3 rounded-lg bg-gray-50 border border-gray-200">
                <Activity className="w-3 h-3 text-violet-500" />
                <span className="font-bold text-sm text-gray-700">{formData.ap_hi}/{formData.ap_lo}</span>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1 min-w-4" />

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading || !backendReady}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-9 flex items-center gap-2 px-5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium text-sm rounded-lg shadow-lg shadow-purple-500/25 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze</span>
                </>
              )}
            </motion.button>
          </div>

          {isLoading && (
            <div className="mt-2 flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>
                {showWarmupHint
                  ? "Waking the AI server... first request can take up to 60s on free tier."
                  : "Running prediction..."}
              </span>
            </div>
          )}
        </form>

        {/* Results Section - Below Form */}
        <AnimatePresence>
          {hasResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-4"
            >
              {/* Risk Card */}
              <div className={`relative overflow-hidden rounded-2xl p-5 ${isHighRisk ? 'bg-gradient-to-br from-red-500 to-rose-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'} text-white shadow-xl`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12" />
                
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    {isHighRisk ? <AlertTriangle className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                    <span className="text-xs font-medium opacity-90">Risk Level</span>
                  </div>
                  
                  <div className="text-4xl font-bold mb-1">
                    {(riskScore * 100).toFixed(0)}%
                  </div>
                  
                  <div className="text-sm font-semibold mb-3">
                    {isHighRisk ? 'High Risk Detected' : 'Low Risk'}
                  </div>
                  
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${riskScore * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>

                  {isLogin && (
                    <motion.button
                      onClick={handleSave}
                      disabled={isSaving}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-all"
                    >
                      {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      {isSaving ? 'Saving...' : 'Save'}
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Model Predictions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-violet-500" />
                  Model Predictions
                </h3>
                <div className="space-y-2">
                  {result?.lightgbm && <ModelBar name="LightGBM" prob={result.lightgbm.probability} />}
                  {result?.xgboost && <ModelBar name="XGBoost" prob={result.xgboost.probability} />}
                  {result?.tabnet && <ModelBar name="TabNet" prob={result.tabnet.probability} />}
                  {result?.neural_network && <ModelBar name="Neural Net" prob={result.neural_network.probability} />}
                  {result?.ensemble && <ModelBar name="Ensemble" prob={result.ensemble.probability} highlight />}
                </div>
              </div>

              {/* Recommendations - 2 columns */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-violet-500" />
                  Health Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {result?.explanation?.recommendations?.slice(0, 6).map((rec, i) => (
                    <RecommendationItem key={i} text={rec} />
                  )) || (
                    <>
                      <RecommendationItem text={isHighRisk ? "Schedule a cardiovascular checkup" : "Maintain your healthy lifestyle"} />
                      <RecommendationItem text="Monitor blood pressure regularly" />
                      <RecommendationItem text="Stay physically active (30+ min/day)" />
                      <RecommendationItem text={formData.smoke ? "Consider smoking cessation programs" : "Continue smoke-free lifestyle"} />
                      <RecommendationItem text="Follow a heart-healthy diet (low sodium)" />
                      <RecommendationItem text="Manage stress through relaxation techniques" />
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compact Disclaimer */}
        <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-amber-800 text-xs">
            <strong>Disclaimer:</strong> AI assessment for informational purposes only. Consult a healthcare provider for medical advice.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

// ============================================
// COMPACT FORM COMPONENTS
// ============================================

const InputField = ({ label, value, onChange, error, suffix, width = "w-20" }) => (
  <div className="flex flex-col">
    <label className="text-[10px] font-medium text-gray-500 mb-1">{label}</label>
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={e => onChange(+e.target.value || 0)}
        className={`${width} h-9 px-2 ${suffix ? 'pr-8' : ''} text-sm rounded-lg border ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'} focus:ring-2 focus:ring-violet-500 focus:outline-none`}
      />
      {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">{suffix}</span>}
    </div>
  </div>
);

const ToggleField = ({ label, value, onChange, yesColor = 'emerald', noColor = 'gray' }) => {
  const yesColorClass = yesColor === 'red' ? 'bg-red-500' : yesColor === 'amber' ? 'bg-amber-500' : 'bg-emerald-500';
  const noColorClass = noColor === 'red' ? 'bg-red-500' : 'bg-gray-400';
  
  return (
    <div className="flex flex-col">
      <label className="text-[10px] font-medium text-gray-500 mb-1">{label}</label>
      <div className="flex h-9 rounded-lg overflow-hidden border border-gray-200">
        <button
          type="button"
          onClick={() => onChange(0)}
          className={`px-3 text-xs font-medium transition-all ${value === 0 ? `${noColorClass} text-white` : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
        >
          No
        </button>
        <button
          type="button"
          onClick={() => onChange(1)}
          className={`px-3 text-xs font-medium transition-all ${value === 1 ? `${yesColorClass} text-white` : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
        >
          Yes
        </button>
      </div>
    </div>
  );
};

const ModelBar = ({ name, prob, highlight }) => {
  const percentage = (prob * 100).toFixed(0);
  const isHigh = prob > 0.5;
  
  return (
    <div className={highlight ? 'bg-violet-50 -mx-1 px-1 py-1 rounded' : ''}>
      <div className="flex justify-between text-xs mb-0.5">
        <span className={`font-medium ${highlight ? 'text-violet-700' : 'text-gray-600'}`}>{name}</span>
        <span className={isHigh ? 'text-red-600 font-semibold' : 'text-emerald-600 font-semibold'}>{percentage}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${isHigh ? 'bg-red-500' : 'bg-emerald-500'}`}
        />
      </div>
    </div>
  );
};

const RecommendationItem = ({ text }) => (
  <div className="flex items-start gap-2 text-xs">
    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
    <span className="text-gray-600">{text}</span>
  </div>
);

export default AIAssessment;
