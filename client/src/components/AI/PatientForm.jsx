import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Heart, Droplets, Activity, AlertCircle, Calendar, 
  Users, Search, Stethoscope, Zap, Ruler, Weight,
  Gauge, Wine, Cigarette, Dumbbell
} from 'lucide-react';

/**
 * PatientForm for Cardiovascular Disease Prediction
 * 
 * Features (11 inputs matching cardio_train.csv - 70,000 records):
 * 1. age         - Age in years (converted to days for model)
 * 2. gender      - Gender (1 = Female, 2 = Male)
 * 3. height      - Height in cm
 * 4. weight      - Weight in kg
 * 5. ap_hi       - Systolic blood pressure
 * 6. ap_lo       - Diastolic blood pressure
 * 7. cholesterol - Cholesterol level (1: normal, 2: above normal, 3: well above normal)
 * 8. gluc        - Glucose level (1: normal, 2: above normal, 3: well above normal)
 * 9. smoke       - Smoking (0/1)
 * 10. alco       - Alcohol intake (0/1)
 * 11. active     - Physical activity (0/1)
 */

const PatientForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    age: 50,
    gender: 2,
    height: 170,
    weight: 70,
    ap_hi: 120,
    ap_lo: 80,
    cholesterol: 1,
    gluc: 1,
    smoke: 0,
    alco: 0,
    active: 1,
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

  // BMI calculation
  const getBMI = () => {
    const heightM = formData.height / 100;
    return (formData.weight / (heightM * heightM)).toFixed(1);
  };
  const bmi = getBMI();

  const getBMIStatus = () => {
    const b = parseFloat(bmi);
    if (b < 18.5) return { label: 'Underweight', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (b < 25) return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-50' };
    if (b < 30) return { label: 'Overweight', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { label: 'Obese', color: 'text-red-600', bg: 'bg-red-50' };
  };
  const bmiStatus = getBMIStatus();

  // Blood Pressure Status
  const getBPStatus = () => {
    const sys = formData.ap_hi;
    const dia = formData.ap_lo;
    if (sys < 120 && dia < 80) return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-50' };
    if (sys < 130 && dia < 80) return { label: 'Elevated', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (sys < 140 || dia < 90) return { label: 'High (Stage 1)', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { label: 'High (Stage 2)', color: 'text-red-600', bg: 'bg-red-50' };
  };
  const bpStatus = getBPStatus();

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
          Cardiovascular Disease Risk Assessment
        </h3>
        <p className="text-gray-500 text-sm mt-2">
          Enter your health data for an AI-powered cardiovascular disease prediction — trained on 70,000 patient records
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
              min="18" 
              max="100" 
              className={inputClass} 
              placeholder="Enter your age" 
            />
            <p className={hintClass}>Your age in years (30–70 typical range)</p>
          </div>

          {/* Gender */}
          <div>
            <label className={labelClass}>
              <Users className="w-4 h-4 inline mr-1" /> Gender
            </label>
            <select 
              name="gender" 
              value={formData.gender} 
              onChange={handleChange} 
              className={inputClass}
            >
              <option value={1}>Female</option>
              <option value={2}>Male</option>
            </select>
            <p className={hintClass}>Biological sex</p>
          </div>
        </div>
      </div>

      {/* Body Measurements Section */}
      <div className={sectionClass}>
        <h4 className="text-sm font-semibold text-[#8B7FCF] uppercase tracking-wide mb-4 flex items-center gap-2">
          <Ruler className="w-4 h-4" />
          Body Measurements
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Height */}
          <div>
            <label className={labelClass}>
              <Ruler className="w-4 h-4 inline mr-1" /> Height
            </label>
            <div className="relative">
              <input 
                type="number" 
                name="height" 
                value={formData.height} 
                onChange={handleChange}
                min="100" 
                max="220" 
                className={inputClass} 
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
            </div>
            <p className={hintClass}>Height in centimeters</p>
          </div>

          {/* Weight */}
          <div>
            <label className={labelClass}>
              <Weight className="w-4 h-4 inline mr-1" /> Weight
            </label>
            <div className="relative">
              <input 
                type="number" 
                name="weight" 
                value={formData.weight} 
                onChange={handleChange}
                min="30" 
                max="200" 
                step="0.5"
                className={inputClass} 
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
            </div>
            <p className={hintClass}>Weight in kilograms</p>
          </div>

          {/* BMI (calculated, display only) */}
          <div>
            <label className={labelClass}>
              <Activity className="w-4 h-4 inline mr-1" /> BMI (Calculated)
            </label>
            <div className={`px-4 py-3 rounded-xl border border-gray-200 ${bmiStatus.bg}`}>
              <span className={`text-lg font-bold ${bmiStatus.color}`}>{bmi}</span>
              <span className="text-gray-400 text-sm ml-2">kg/m²</span>
            </div>
            <p className={`text-xs mt-1 ${bmiStatus.color}`}>{bmiStatus.label}</p>
          </div>
        </div>
      </div>

      {/* Blood Pressure Section */}
      <div className={sectionClass}>
        <h4 className="text-sm font-semibold text-[#8B7FCF] uppercase tracking-wide mb-4 flex items-center gap-2">
          <Gauge className="w-4 h-4" />
          Blood Pressure
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Systolic BP */}
          <div>
            <label className={labelClass}>
              <Gauge className="w-4 h-4 inline mr-1" /> Systolic Blood Pressure
            </label>
            <div className="relative">
              <input 
                type="number" 
                name="ap_hi" 
                value={formData.ap_hi} 
                onChange={handleChange}
                min="80" 
                max="240" 
                className={inputClass} 
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">mmHg</span>
            </div>
            <p className={`text-xs mt-1 ${bpStatus.color}`}>{bpStatus.label}</p>
          </div>

          {/* Diastolic BP */}
          <div>
            <label className={labelClass}>
              <Gauge className="w-4 h-4 inline mr-1" /> Diastolic Blood Pressure
            </label>
            <div className="relative">
              <input 
                type="number" 
                name="ap_lo" 
                value={formData.ap_lo} 
                onChange={handleChange}
                min="40" 
                max="160" 
                className={inputClass} 
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">mmHg</span>
            </div>
            <p className={hintClass}>Diastolic blood pressure</p>
          </div>
        </div>
      </div>

      {/* Lab Tests Section */}
      <div className={sectionClass}>
        <h4 className="text-sm font-semibold text-[#8B7FCF] uppercase tracking-wide mb-4 flex items-center gap-2">
          <Stethoscope className="w-4 h-4" />
          Lab Test Results
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cholesterol */}
          <div>
            <label className={labelClass}>
              <Droplets className="w-4 h-4 inline mr-1" /> Cholesterol Level
            </label>
            <select 
              name="cholesterol" 
              value={formData.cholesterol} 
              onChange={handleChange} 
              className={inputClass}
            >
              <option value={1}>Normal</option>
              <option value={2}>Above Normal</option>
              <option value={3}>Well Above Normal</option>
            </select>
            <p className={hintClass}>Blood cholesterol level category</p>
          </div>

          {/* Glucose */}
          <div>
            <label className={labelClass}>
              <Droplets className="w-4 h-4 inline mr-1" /> Glucose Level
            </label>
            <select 
              name="gluc" 
              value={formData.gluc} 
              onChange={handleChange} 
              className={inputClass}
            >
              <option value={1}>Normal</option>
              <option value={2}>Above Normal</option>
              <option value={3}>Well Above Normal</option>
            </select>
            <p className={hintClass}>Blood glucose level category</p>
          </div>
        </div>
      </div>

      {/* Lifestyle Section */}
      <div className={sectionClass}>
        <h4 className="text-sm font-semibold text-[#8B7FCF] uppercase tracking-wide mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Lifestyle Factors
        </h4>

        {/* Smoking */}
        <div className="mb-4">
          <label className={labelClass}>
            <Cigarette className="w-4 h-4 inline mr-1" /> Smoking
          </label>
          <div className="flex gap-3 mt-2">
            <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 rounded-xl border-2 transition-all ${
              formData.smoke === 0 ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
              <input 
                type="radio" 
                name="smoke" 
                value={0}
                checked={formData.smoke === 0}
                onChange={handleChange}
                className="hidden"
              />
              <span className="font-medium">No</span>
            </label>
            <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 rounded-xl border-2 transition-all ${
              formData.smoke === 1 ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
              <input 
                type="radio" 
                name="smoke" 
                value={1}
                checked={formData.smoke === 1}
                onChange={handleChange}
                className="hidden"
              />
              <span className="font-medium">Yes</span>
            </label>
          </div>
          <p className={hintClass}>Do you currently smoke?</p>
        </div>

        {/* Alcohol */}
        <div className="mb-4">
          <label className={labelClass}>
            <Wine className="w-4 h-4 inline mr-1" /> Alcohol Intake
          </label>
          <div className="flex gap-3 mt-2">
            <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 rounded-xl border-2 transition-all ${
              formData.alco === 0 ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
              <input 
                type="radio" 
                name="alco" 
                value={0}
                checked={formData.alco === 0}
                onChange={handleChange}
                className="hidden"
              />
              <span className="font-medium">No</span>
            </label>
            <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 rounded-xl border-2 transition-all ${
              formData.alco === 1 ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
              <input 
                type="radio" 
                name="alco" 
                value={1}
                checked={formData.alco === 1}
                onChange={handleChange}
                className="hidden"
              />
              <span className="font-medium">Yes</span>
            </label>
          </div>
          <p className={hintClass}>Do you consume alcohol?</p>
        </div>

        {/* Physical Activity */}
        <div>
          <label className={labelClass}>
            <Dumbbell className="w-4 h-4 inline mr-1" /> Physical Activity
          </label>
          <div className="flex gap-3 mt-2">
            <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 rounded-xl border-2 transition-all ${
              formData.active === 0 ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
              <input 
                type="radio" 
                name="active" 
                value={0}
                checked={formData.active === 0}
                onChange={handleChange}
                className="hidden"
              />
              <span className="font-medium">Inactive</span>
            </label>
            <label className={`flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 rounded-xl border-2 transition-all ${
              formData.active === 1 ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
              <input 
                type="radio" 
                name="active" 
                value={1}
                checked={formData.active === 1}
                onChange={handleChange}
                className="hidden"
              />
              <span className="font-medium">Active</span>
            </label>
          </div>
          <p className={hintClass}>Do you engage in regular physical activity?</p>
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
            Analyzing Cardiovascular Risk...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Search className="w-5 h-5" /> Predict Cardiovascular Disease Risk
          </span>
        )}
      </motion.button>

      {/* Disclaimer */}
      <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
        <p className="text-amber-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Medical Disclaimer:</strong> This AI prediction is trained on 70,000 cardiovascular patient records and is for educational purposes only. 
            It should not replace professional medical diagnosis. Always consult with a qualified healthcare provider for medical advice.
          </span>
        </p>
      </div>
    </motion.form>
  );
};

export default PatientForm;
