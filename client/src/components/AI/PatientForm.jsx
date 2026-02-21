import React, { useState } from 'react';
import { motion } from 'framer-motion';

const PatientForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    age: 55,
    gender: 1,
    height: 165,
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
      [name]: type === 'number' || type === 'range' ? parseInt(value) : parseInt(value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8B7FCF] focus:border-transparent transition-all bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      <h3 className="text-xl font-semibold text-[#4A3B5C] mb-6">Patient Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Age */}
        <div>
          <label className={labelClass}>Age (years)</label>
          <input type="number" name="age" value={formData.age} onChange={handleChange}
            min="1" max="120" className={inputClass} />
        </div>

        {/* Gender */}
        <div>
          <label className={labelClass}>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
            <option value={1}>Female</option>
            <option value={2}>Male</option>
          </select>
        </div>

        {/* Height */}
        <div>
          <label className={labelClass}>Height (cm)</label>
          <input type="number" name="height" value={formData.height} onChange={handleChange}
            min="100" max="220" className={inputClass} />
        </div>

        {/* Weight */}
        <div>
          <label className={labelClass}>Weight (kg)</label>
          <input type="number" name="weight" value={formData.weight} onChange={handleChange}
            min="30" max="200" className={inputClass} />
        </div>

        {/* Systolic BP */}
        <div>
          <label className={labelClass}>Systolic BP (ap_hi)</label>
          <input type="number" name="ap_hi" value={formData.ap_hi} onChange={handleChange}
            min="60" max="250" className={inputClass} />
        </div>

        {/* Diastolic BP */}
        <div>
          <label className={labelClass}>Diastolic BP (ap_lo)</label>
          <input type="number" name="ap_lo" value={formData.ap_lo} onChange={handleChange}
            min="40" max="200" className={inputClass} />
        </div>

        {/* Cholesterol */}
        <div>
          <label className={labelClass}>Cholesterol</label>
          <select name="cholesterol" value={formData.cholesterol} onChange={handleChange} className={inputClass}>
            <option value={1}>Normal</option>
            <option value={2}>Above Normal</option>
            <option value={3}>High</option>
          </select>
        </div>

        {/* Glucose */}
        <div>
          <label className={labelClass}>Glucose</label>
          <select name="gluc" value={formData.gluc} onChange={handleChange} className={inputClass}>
            <option value={1}>Normal</option>
            <option value={2}>Above Normal</option>
            <option value={3}>High</option>
          </select>
        </div>

        {/* BMI Display */}
        <div>
          <label className={labelClass}>Calculated BMI</label>
          <div className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium">
            {(formData.weight / ((formData.height / 100) ** 2)).toFixed(1)}
          </div>
        </div>
      </div>

      {/* Lifestyle Factors */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-600 mb-4">Lifestyle Factors</h4>
        <div className="flex flex-wrap gap-6">
          {/* Smoking */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="smoke" checked={formData.smoke === 1}
              onChange={(e) => setFormData(p => ({ ...p, smoke: e.target.checked ? 1 : 0 }))}
              className="w-5 h-5 rounded text-[#8B7FCF] focus:ring-[#8B7FCF]" />
            <span className="text-gray-700">Smoker</span>
          </label>

          {/* Alcohol */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="alco" checked={formData.alco === 1}
              onChange={(e) => setFormData(p => ({ ...p, alco: e.target.checked ? 1 : 0 }))}
              className="w-5 h-5 rounded text-[#8B7FCF] focus:ring-[#8B7FCF]" />
            <span className="text-gray-700">Alcohol Consumption</span>
          </label>

          {/* Active */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="active" checked={formData.active === 1}
              onChange={(e) => setFormData(p => ({ ...p, active: e.target.checked ? 1 : 0 }))}
              className="w-5 h-5 rounded text-[#8B7FCF] focus:ring-[#8B7FCF]" />
            <span className="text-gray-700">Physically Active</span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-6 w-full py-3 px-6 bg-gradient-to-r from-[#8B7FCF] to-[#6B5B9A] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing...
          </span>
        ) : (
          'Analyze Risk'
        )}
      </motion.button>
    </motion.form>
  );
};

export default PatientForm;
