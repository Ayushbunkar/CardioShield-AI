import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Heart, Droplets, Activity, AlertCircle, Calendar, 
  Users, Search, Stethoscope, Zap, TrendingDown, ArrowUpRight,
  Gauge, TestTube, HeartPulse, CircleDot
} from 'lucide-react';

/**
 * PatientForm for UCI Heart Disease Prediction
 * 
 * Features (13 inputs):
 * 1. age       - Age in years
 * 2. sex       - Sex (0 = female, 1 = male)
 * 3. cp        - Chest pain type (1-4)
 * 4. trestbps  - Resting blood pressure (mm Hg)
 * 5. chol      - Serum cholesterol (mg/dl)
 * 6. fbs       - Fasting blood sugar > 120 mg/dl (0/1)
 * 7. restecg   - Resting ECG results (0-2)
 * 8. thalach   - Maximum heart rate achieved
 * 9. exang     - Exercise induced angina (0/1)
 * 10. oldpeak  - ST depression induced by exercise
 * 11. slope    - Slope of peak exercise ST segment (1-3)
 * 12. ca       - Number of major vessels colored by flouroscopy (0-3)
 * 13. thal     - Thalassemia (3/6/7)
 */

const PatientForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    age: 55,
    sex: 1,
    cp: 1,
    trestbps: 120,
    chol: 200,
    fbs: 0,
    restecg: 0,
    thalach: 150,
    exang: 0,
    oldpeak: 0,
    slope: 2,
    ca: 0,
    thal: 3,
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : parseInt(value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Blood Pressure Status
  const getBPStatus = () => {
    const bp = formData.trestbps;
    if (bp < 120) return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-50' };
    if (bp < 130) return { label: 'Elevated', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (bp < 140) return { label: 'High (Stage 1)', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { label: 'High (Stage 2)', color: 'text-red-600', bg: 'bg-red-50' };
  };
  const bpStatus = getBPStatus();

  // Cholesterol Status
  const getCholStatus = () => {
    const chol = formData.chol;
    if (chol < 200) return { label: 'Desirable', color: 'text-green-600', bg: 'bg-green-50' };
    if (chol < 240) return { label: 'Borderline', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: 'High', color: 'text-red-600', bg: 'bg-red-50' };
  };
  const cholStatus = getCholStatus();

  // Heart Rate Status
  const getHRStatus = () => {
    const hr = formData.thalach;
    const maxHR = 220 - formData.age;
    const percent = (hr / maxHR) * 100;
    if (percent < 50) return { label: 'Low', color: 'text-blue-600' };
    if (percent < 85) return { label: 'Normal', color: 'text-green-600' };
    return { label: 'High', color: 'text-orange-600' };
  };
  const hrStatus = getHRStatus();

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8B7FCF] focus:border-transparent transition-all bg-white text-gray-700";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";
  const hintClass = "text-xs text-gray-400 mt-1";
  const sectionClass = "mb-6 bg-white rounded-xl p-5 border border-gray-100";

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-b from-gray-50 to-white rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      {/* Form Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-[#8B7FCF] to-[#6B5B9A] mb-4">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-[#4A3B5C]">
          Heart Disease Risk Assessment
        </h3>
        <p className="text-gray-500 text-sm mt-2">
          Enter your clinical data for an AI-powered heart disease prediction based on the UCI Heart Disease dataset
        </p>
      </div>

      {/* Basic Info Section */}
      <div className={sectionClass}>
        <h4 className="text-sm font-semibold text-[#8B7FCF] uppercase tracking-wide mb-4 flex items-center gap-2">
          <User className="w-4 h-4" />
          Patient Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Age */}
          <div>
            <label className={labelClass}>
              <Calendar className="w-4 h-4 inline mr-1" /> Age (years)
            </label>
            <input 
              type="number" 
              name="age" 
              value={formData.age} 
              onChange={handleChange}
              min="20" 
              max="100" 
              className={inputClass} 
              placeholder="Enter your age" 
            />
            <p className={hintClass}>Your age in years (29-77 in dataset)</p>
          </div>

          {/* Sex */}
          <div>
            <label className={labelClass}>
              <Users className="w-4 h-4 inline mr-1" /> Biological Sex
            </label>
            <select 
              name="sex" 
              value={formData.sex} 
              onChange={handleChange} 
              className={inputClass}
            >
              <option value={0}>Female</option>
              <option value={1}>Male</option>
            </select>
            <p className={hintClass}>Biological sex at birth</p>
          </div>
        </div>
      </div>

      {/* Chest Pain Section */}
      <div className={sectionClass}>
        <h4 className="text-sm font-semibold text-[#8B7FCF] uppercase tracking-wide mb-4 flex items-center gap-2">
          <Stethoscope className="w-4 h-4" />
          Chest Pain Assessment
        </h4>
        <div>
          <label className={labelClass}>
            <Heart className="w-4 h-4 inline mr-1 text-red-500" /> Chest Pain Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {[
              { value: 1, label: 'Typical Angina', desc: 'Classic chest pain during exertion' },
              { value: 2, label: 'Atypical Angina', desc: 'Unusual chest discomfort' },
              { value: 3, label: 'Non-Anginal Pain', desc: 'Chest pain not related to heart' },
              { value: 4, label: 'Asymptomatic', desc: 'No chest pain symptoms' },
            ].map((option) => (
              <label 
                key={option.value}
                className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all ${
                  formData.cp === option.value 
                    ? 'border-[#8B7FCF] bg-[#8B7FCF]/10' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input 
                  type="radio" 
                  name="cp" 
                  value={option.value}
                  checked={formData.cp === option.value}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-[#8B7FCF] focus:ring-[#8B7FCF]"
                />
                <div>
                  <span className="font-medium text-gray-700">{option.label}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Vital Signs Section */}
      <div className={sectionClass}>
        <h4 className="text-sm font-semibold text-[#8B7FCF] uppercase tracking-wide mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Vital Signs
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Resting Blood Pressure */}
          <div>
            <label className={labelClass}>
              <Gauge className="w-4 h-4 inline mr-1" /> Resting Blood Pressure
            </label>
            <div className="relative">
              <input 
                type="number" 
                name="trestbps" 
                value={formData.trestbps} 
                onChange={handleChange}
                min="90" 
                max="200" 
                className={inputClass} 
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">mmHg</span>
            </div>
            <p className={`text-xs mt-1 ${bpStatus.color}`}>{bpStatus.label}</p>
          </div>

          {/* Max Heart Rate */}
          <div>
            <label className={labelClass}>
              <HeartPulse className="w-4 h-4 inline mr-1" /> Max Heart Rate
            </label>
            <div className="relative">
              <input 
                type="number" 
                name="thalach" 
                value={formData.thalach} 
                onChange={handleChange}
                min="60" 
                max="220" 
                className={inputClass} 
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">bpm</span>
            </div>
            <p className={`text-xs mt-1 ${hrStatus.color}`}>
              {hrStatus.label} ({Math.round((formData.thalach / (220 - formData.age)) * 100)}% of max)
            </p>
          </div>

          {/* Serum Cholesterol */}
          <div>
            <label className={labelClass}>
              <Droplets className="w-4 h-4 inline mr-1" /> Serum Cholesterol
            </label>
            <div className="relative">
              <input 
                type="number" 
                name="chol" 
                value={formData.chol} 
                onChange={handleChange}
                min="100" 
                max="600" 
                className={inputClass} 
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">mg/dl</span>
            </div>
            <p className={`text-xs mt-1 ${cholStatus.color}`}>{cholStatus.label}</p>
          </div>
        </div>
      </div>

      {/* Blood Tests Section */}
      <div className={sectionClass}>
        <h4 className="text-sm font-semibold text-[#8B7FCF] uppercase tracking-wide mb-4 flex items-center gap-2">
          <TestTube className="w-4 h-4" />
          Blood Tests & ECG
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fasting Blood Sugar */}
          <div>
            <label className={labelClass}>
              <Droplets className="w-4 h-4 inline mr-1" /> Fasting Blood Sugar
            </label>
            <select 
              name="fbs" 
              value={formData.fbs} 
              onChange={handleChange} 
              className={inputClass}
            >
              <option value={0}>Normal (120 mg/dl or less)</option>
              <option value={1}>High (more than 120 mg/dl)</option>
            </select>
            <p className={hintClass}>Fasting blood sugar level</p>
          </div>

          {/* Resting ECG */}
          <div>
            <label className={labelClass}>
              <Activity className="w-4 h-4 inline mr-1" /> Resting ECG Results
            </label>
            <select 
              name="restecg" 
              value={formData.restecg} 
              onChange={handleChange} 
              className={inputClass}
            >
              <option value={0}>Normal</option>
              <option value={1}>ST-T Wave Abnormality</option>
              <option value={2}>Left Ventricular Hypertrophy</option>
            </select>
            <p className={hintClass}>Electrocardiography results at rest</p>
          </div>
        </div>
      </div>

      {/* Exercise Test Section */}
      <div className={sectionClass}>
        <h4 className="text-sm font-semibold text-[#8B7FCF] uppercase tracking-wide mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Exercise Stress Test Results
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Exercise Induced Angina */}
          <div>
            <label className={labelClass}>
              <Heart className="w-4 h-4 inline mr-1 text-red-500" /> Exercise Induced Angina
            </label>
            <div className="flex gap-3 mt-2">
              <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 rounded-xl border-2 transition-all ${
                formData.exang === 0 ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
                <input 
                  type="radio" 
                  name="exang" 
                  value={0}
                  checked={formData.exang === 0}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="font-medium">No</span>
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 rounded-xl border-2 transition-all ${
                formData.exang === 1 ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
                <input 
                  type="radio" 
                  name="exang" 
                  value={1}
                  checked={formData.exang === 1}
                  onChange={handleChange}
                  className="hidden"
                />
                <span className="font-medium">Yes</span>
              </label>
            </div>
            <p className={hintClass}>Chest pain during exercise test</p>
          </div>

          {/* ST Depression (oldpeak) */}
          <div>
            <label className={labelClass}>
              <TrendingDown className="w-4 h-4 inline mr-1" /> ST Depression (oldpeak)
            </label>
            <div className="relative">
              <input 
                type="number" 
                name="oldpeak" 
                value={formData.oldpeak} 
                onChange={handleChange}
                min="0" 
                max="6.5" 
                step="0.1"
                className={inputClass} 
              />
            </div>
            <p className={hintClass}>ST depression induced by exercise relative to rest (0-6.2)</p>
          </div>
        </div>

        {/* ST Slope */}
        <div>
          <label className={labelClass}>
            <ArrowUpRight className="w-4 h-4 inline mr-1" /> Slope of Peak Exercise ST Segment
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            {[
              { value: 1, label: 'Upsloping', desc: 'Generally normal' },
              { value: 2, label: 'Flat', desc: 'May indicate ischemia' },
              { value: 3, label: 'Downsloping', desc: 'Higher risk indicator' },
            ].map((option) => (
              <label 
                key={option.value}
                className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all ${
                  formData.slope === option.value 
                    ? 'border-[#8B7FCF] bg-[#8B7FCF]/10' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input 
                  type="radio" 
                  name="slope" 
                  value={option.value}
                  checked={formData.slope === option.value}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#8B7FCF] focus:ring-[#8B7FCF]"
                />
                <div>
                  <span className="font-medium text-gray-700">{option.label}</span>
                  <p className="text-xs text-gray-500">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Angiography Results Section */}
      <div className={sectionClass}>
        <h4 className="text-sm font-semibold text-[#8B7FCF] uppercase tracking-wide mb-4 flex items-center gap-2">
          <CircleDot className="w-4 h-4" />
          Cardiac Catheterization
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Number of Major Vessels */}
          <div>
            <label className={labelClass}>
              <CircleDot className="w-4 h-4 inline mr-1" /> Number of Major Vessels Colored
            </label>
            <select 
              name="ca" 
              value={formData.ca} 
              onChange={handleChange} 
              className={inputClass}
            >
              <option value={0}>0 - No vessels affected</option>
              <option value={1}>1 - One vessel affected</option>
              <option value={2}>2 - Two vessels affected</option>
              <option value={3}>3 - Three vessels affected</option>
            </select>
            <p className={hintClass}>Number of major vessels (0-3) colored by flouroscopy</p>
          </div>

          {/* Thalassemia */}
          <div>
            <label className={labelClass}>
              <Droplets className="w-4 h-4 inline mr-1" /> Thalassemia (Thallium Stress Test)
            </label>
            <select 
              name="thal" 
              value={formData.thal} 
              onChange={handleChange} 
              className={inputClass}
            >
              <option value={3}>Normal</option>
              <option value={6}>Fixed Defect</option>
              <option value={7}>Reversible Defect</option>
            </select>
            <p className={hintClass}>Thallium stress test result</p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 px-6 bg-gradient-to-r from-[#8B7FCF] to-[#6B5B9A] text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing Heart Disease Risk...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Search className="w-5 h-5" /> Predict Heart Disease Risk
          </span>
        )}
      </motion.button>

      {/* Disclaimer */}
      <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <p className="text-amber-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Medical Disclaimer:</strong> This AI prediction is based on the UCI Heart Disease dataset and is for educational purposes only. 
            It should not replace professional medical diagnosis. Always consult with a qualified healthcare provider for medical advice.
          </span>
        </p>
      </div>
    </motion.form>
  );
};

export default PatientForm;
