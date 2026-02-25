import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, AlertCircle, Search, Stethoscope, Zap, User, Shield, ShieldCheck } from 'lucide-react';

const PatientForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    age: 50, gender: 2, height: 170, weight: 70,
    ap_hi: 120, ap_lo: 80, cholesterol: 1, gluc: 1,
    smoke: 0, alco: 0, active: 1, family_history: 0,
  });
  const [consent, setConsent] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' || type === 'range' ? parseFloat(value) : parseInt(value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!consent) return;
    onSubmit(formData);
  };

  const bmi = (formData.weight / ((formData.height / 100) ** 2)).toFixed(1);
  const bmiStatus = parseFloat(bmi) < 18.5 ? { l: 'Under', c: 'text-blue-600' } : parseFloat(bmi) < 25 ? { l: 'Normal', c: 'text-green-600' } : parseFloat(bmi) < 30 ? { l: 'Over', c: 'text-yellow-600' } : { l: 'Obese', c: 'text-red-600' };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8B7FCF] bg-white text-gray-700 text-sm";
  const selectClass = "w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#8B7FCF] bg-white text-gray-700 text-sm cursor-pointer";
  const labelClass = "block text-xs font-semibold text-gray-500 mb-1";

  const Toggle = ({ name, v0, v1, l0, l1 }) => (
    <div className="flex gap-2">
      {[[v0, l0, 'green'], [v1, l1, 'red']].map(([v, l, c]) => (
        <label key={v} className={`flex-1 text-center cursor-pointer py-2 rounded-lg border-2 text-sm font-medium transition-all ${
          formData[name] === v ? `border-${c}-400 bg-${c}-50 text-${c}-700` : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'}`}>
          <input type="radio" name={name} value={v} checked={formData[name] === v} onChange={handleChange} className="hidden" />{l}
        </label>
      ))}
    </div>
  );

  return (
    <motion.form onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-[#8B7FCF]/5 to-[#6B5B9A]/5 rounded-t-2xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#8B7FCF] to-[#6B5B9A] flex items-center justify-center">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#4A3B5C]">CVD Risk Assessment</h3>
          <p className="text-gray-400 text-xs">AI-powered • 70,000 patient records</p>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-5">
          {/* Patient Info */}
          <div>
            <div className="flex items-center gap-2 mb-3"><User className="w-4 h-4 text-[#8B7FCF]" /><span className="text-sm font-semibold text-[#4A3B5C]">Patient Info</span></div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>Age: {formData.age}</label>
                <input type="range" name="age" value={formData.age} onChange={handleChange} min="18" max="100" className="w-full accent-[#8B7FCF]" />
              </div>
              <div><label className={labelClass}>Gender</label><select name="gender" value={formData.gender} onChange={handleChange} className={selectClass}><option value={1}>Female</option><option value={2}>Male</option></select></div>
              <div>
                <label className={labelClass}>Height: {formData.height} cm</label>
                <input type="range" name="height" value={formData.height} onChange={handleChange} min="120" max="210" className="w-full accent-[#8B7FCF]" />
              </div>
              <div>
                <label className={labelClass}>Weight: {formData.weight} kg</label>
                <input type="range" name="weight" value={formData.weight} onChange={handleChange} min="30" max="200" className="w-full accent-[#8B7FCF]" />
              </div>
            </div>
          </div>

          {/* Vitals */}
          <div>
            <div className="flex items-center gap-2 mb-3"><Stethoscope className="w-4 h-4 text-[#8B7FCF]" /><span className="text-sm font-semibold text-[#4A3B5C]">Vitals & Labs</span></div>
            <div className="grid grid-cols-5 gap-3">
              <div>
                <label className={labelClass}>Sys BP: {formData.ap_hi}</label>
                <input type="range" name="ap_hi" value={formData.ap_hi} onChange={handleChange} min="80" max="200" className="w-full accent-[#8B7FCF]" />
              </div>
              <div>
                <label className={labelClass}>Dia BP: {formData.ap_lo}</label>
                <input type="range" name="ap_lo" value={formData.ap_lo} onChange={handleChange} min="40" max="140" className="w-full accent-[#8B7FCF]" />
              </div>
              <div><label className={labelClass}>BMI</label><div className={`px-3 py-2 rounded-lg border text-sm font-bold ${bmiStatus.c} bg-gray-50 text-center`}>{bmi} <span className="text-xs font-normal">({bmiStatus.l})</span></div></div>
              <div><label className={labelClass}>Cholesterol</label><select name="cholesterol" value={formData.cholesterol} onChange={handleChange} className={selectClass}><option value={1}>Normal</option><option value={2}>Above Normal</option><option value={3}>Well Above</option></select></div>
              <div><label className={labelClass}>Glucose</label><select name="gluc" value={formData.gluc} onChange={handleChange} className={selectClass}><option value={1}>Normal</option><option value={2}>Above Normal</option><option value={3}>Well Above</option></select></div>
            </div>
          </div>

          {/* Lifestyle */}
          <div>
            <div className="flex items-center gap-2 mb-3"><Zap className="w-4 h-4 text-[#8B7FCF]" /><span className="text-sm font-semibold text-[#4A3B5C]">Lifestyle & History</span></div>
            <div className="grid grid-cols-4 gap-4">
              <div><label className={labelClass}>Smoking</label><Toggle name="smoke" v0={0} v1={1} l0="No" l1="Yes" /></div>
              <div><label className={labelClass}>Alcohol</label><Toggle name="alco" v0={0} v1={1} l0="No" l1="Yes" /></div>
              <div><label className={labelClass}>Active</label><Toggle name="active" v0={1} v1={0} l0="Yes" l1="No" /></div>
              <div><label className={labelClass}>Family History</label><Toggle name="family_history" v0={0} v1={1} l0="None" l1="Yes" /></div>
            </div>
          </div>

          {/* Consent */}
          <div className={`p-3 rounded-xl border-2 transition-all ${consent ? 'border-green-300 bg-green-50' : 'border-amber-300 bg-amber-50'}`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 w-4 h-4 accent-[#8B7FCF] rounded" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {consent ? <ShieldCheck className="w-4 h-4 text-green-600" /> : <Shield className="w-4 h-4 text-amber-600" />}
                  <span className={`text-xs font-bold ${consent ? 'text-green-700' : 'text-amber-700'}`}>
                    {consent ? 'Consent Provided' : 'Consent Required'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  I understand this is a <strong>cardiovascular risk estimation tool</strong>, not a medical diagnosis. 
                  Results should be reviewed by a qualified healthcare professional. My data will be processed securely.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-4">
          <motion.button type="submit" disabled={isLoading || !consent} whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-gradient-to-r from-[#8B7FCF] to-[#6B5B9A] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isLoading ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Analyzing...</> : <><Search className="w-5 h-5" />Predict Risk</>}
          </motion.button>
          {!consent && (
            <p className="text-center text-xs text-amber-600 mt-2 flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3" />Please provide consent to proceed
            </p>
          )}
        </div>
      </div>
    </motion.form>
  );
};

export default PatientForm;
