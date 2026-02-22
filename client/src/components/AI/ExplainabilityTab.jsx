import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Brain, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Info, Heart, Activity, Stethoscope, Zap, Calendar, Scale, Cigarette, BarChart2, Droplets, Ruler, Wine, Dumbbell, User, Users, Search, Lightbulb } from 'lucide-react';

// Human-readable feature names and descriptions for cardiovascular dataset (70K records)
const featureInfo = {
  'Age': { 
    name: 'Age', 
    desc: 'Age in years — cardiovascular risk increases with age'
  },
  'Gender': { 
    name: 'Gender', 
    desc: 'Biological sex (1 = Female, 2 = Male)'
  },
  'Height': { 
    name: 'Height', 
    desc: 'Height in centimeters'
  },
  'Weight': { 
    name: 'Weight / BMI', 
    desc: 'Weight in kg — used to compute BMI'
  },
  'Systolic BP': { 
    name: 'Systolic Blood Pressure', 
    desc: 'Upper blood pressure reading (mmHg). >140 is hypertension.'
  },
  'Diastolic BP': { 
    name: 'Diastolic Blood Pressure', 
    desc: 'Lower blood pressure reading (mmHg). >90 is hypertension.'
  },
  'Cholesterol': { 
    name: 'Cholesterol Level', 
    desc: 'Blood cholesterol (1: normal, 2: above normal, 3: well above normal)'
  },
  'Glucose': { 
    name: 'Glucose Level', 
    desc: 'Blood glucose (1: normal, 2: above normal, 3: well above normal)'
  },
  'Smoking': { 
    name: 'Smoking Status', 
    desc: 'Whether you currently smoke — major cardiovascular risk factor'
  },
  'Alcohol': { 
    name: 'Alcohol Intake', 
    desc: 'Whether you consume alcohol regularly'
  },
  'Physical Activity': { 
    name: 'Physical Activity', 
    desc: 'Whether you engage in regular physical activity'
  },
  'Age (Years)': {
    name: 'Age in Years',
    desc: 'Age converted from days to years for better model accuracy'
  },
  'BMI': {
    name: 'Body Mass Index',
    desc: 'Calculated from weight and height — key obesity indicator'
  },
  'Pulse Pressure': {
    name: 'Pulse Pressure',
    desc: 'Difference between systolic and diastolic BP — arterial stiffness indicator'
  },
  'Mean Arterial Pressure': {
    name: 'Mean Arterial Pressure',
    desc: 'Average BP during cardiac cycle — organ perfusion indicator'
  },
  'Age-BP Interaction': {
    name: 'Age × Blood Pressure',
    desc: 'Combined effect of age and high blood pressure on risk'
  },
  'Metabolic Risk': {
    name: 'Metabolic Risk Score',
    desc: 'Combined cholesterol and glucose risk level'
  },
  'Lifestyle Risk': {
    name: 'Lifestyle Risk Score',
    desc: 'Combined smoking, alcohol, and inactivity risk'
  },
  'BMI Category': {
    name: 'BMI Category',
    desc: 'Weight classification (underweight / normal / overweight / obese)'
  },
  'BP Category': {
    name: 'BP Category',
    desc: 'Blood pressure classification (normal / elevated / high / very high)'
  },
  'Age Category': {
    name: 'Age Risk Group',
    desc: 'Age bracket for cardiovascular risk stratification'
  },
  'Age-Chol Interaction': {
    name: 'Age × Cholesterol',
    desc: 'Combined effect of aging and high cholesterol on cardiovascular risk'
  },
  'BMI-BP Interaction': {
    name: 'BMI × Blood Pressure',
    desc: 'Combined effect of obesity and high blood pressure'
  },
  'BMI-Chol Interaction': {
    name: 'BMI × Cholesterol',
    desc: 'Combined effect of obesity and high cholesterol'
  },
  'Overall Risk': {
    name: 'Overall Risk Score',
    desc: 'Composite score combining metabolic and lifestyle risk factors'
  },
  'Systolic BP²': {
    name: 'Systolic BP (Squared)',
    desc: 'Non-linear effect of very high systolic blood pressure'
  },
  'BMI²': {
    name: 'BMI (Squared)',
    desc: 'Non-linear effect of extreme BMI values on risk'
  },
  'Age²': {
    name: 'Age (Squared)',
    desc: 'Non-linear effect of advancing age on cardiovascular risk'
  },
};

const getFeatureName = (key) => featureInfo[key]?.name || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const getFeatureDesc = (key) => featureInfo[key]?.desc || '';

const ExplainabilityTab = ({ explanation, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8B7FCF] border-t-transparent mx-auto mb-4" />
          <p className="text-gray-500">Analyzing your results...</p>
        </div>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center border-2 border-dashed border-gray-200">
        <Brain className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Assessment Yet</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Complete a patient assessment in the "Patient Assessment" tab to see a detailed explanation of how the AI analyzed your health data.
        </p>
      </div>
    );
  }

  const { feature_impacts, feature_importance } = explanation;

  // Sort feature importance for bar chart with human-readable names
  const importanceData = Object.entries(feature_importance)
    .map(([name, value]) => ({ 
      name: getFeatureName(name), 
      rawName: name,
      importance: parseFloat((value * 100).toFixed(1))
    }))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 10);

  // Separate factors that increase vs decrease risk
  const riskIncreasing = feature_impacts.filter(f => f.direction === 'increases');
  const riskDecreasing = feature_impacts.filter(f => f.direction === 'decreases');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Summary Banner */}
      <div className="bg-gradient-to-r from-[#8B7FCF] to-[#6B5B9A] rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Search className="w-5 h-5" /> Your Latest Assessment Explained
            </h3>
            <p className="text-white/90">
              The AI analyzed {Object.keys(feature_importance).length} health factors to predict your cardiovascular risk. 
              Below you'll see exactly what influenced your result - updated from your most recent test.
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Risk Factors */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Risk Increasing Factors */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-100">
          <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Factors INCREASING Your Risk
          </h3>
          
          {riskIncreasing.length === 0 ? (
            <p className="text-gray-500 text-center py-4 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              No major risk-increasing factors!
            </p>
          ) : (
            <div className="space-y-3">
              {riskIncreasing.map((impact, idx) => (
                <motion.div
                  key={impact.feature}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-red-50 rounded-xl p-4 border border-red-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-red-800 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      {getFeatureName(impact.feature)}
                    </span>
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      +{Math.abs(impact.impact * 100).toFixed(1)}% risk
                    </span>
                  </div>
                  <p className="text-red-700 text-sm mb-1">{impact.description}</p>
                  <p className="text-red-600/70 text-xs">{getFeatureDesc(impact.feature)}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Risk Decreasing Factors */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Factors PROTECTING You
          </h3>
          
          {riskDecreasing.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Focus on the risk factors to improve your score</p>
          ) : (
            <div className="space-y-3">
              {riskDecreasing.map((impact, idx) => (
                <motion.div
                  key={impact.feature}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-green-50 rounded-xl p-4 border border-green-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-green-800 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      {getFeatureName(impact.feature)}
                    </span>
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      -{Math.abs(impact.impact * 100).toFixed(1)}% risk
                    </span>
                  </div>
                  <p className="text-green-700 text-sm mb-1">{impact.description}</p>
                  <p className="text-green-600/70 text-xs">{getFeatureDesc(impact.feature)}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feature Importance Chart - What Matters Most */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-[#4A3B5C] flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-[#8B7FCF]" />
            What Matters Most for Heart Health
          </h3>
          <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
            Based on your data
          </span>
        </div>
        
        <p className="text-gray-600 mb-6 flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-400" />
          This chart shows which health factors have the biggest impact on cardiovascular risk predictions.
        </p>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={importanceData} layout="vertical" margin={{ left: 140, right: 30 }}>
              <XAxis 
                type="number" 
                tickFormatter={(v) => `${v}%`} 
                domain={[0, 'dataMax']}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={130} 
                tick={{ fontSize: 13, fontWeight: 500 }}
              />
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value}% importance`, 
                  props.payload.name
                ]}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #E5E7EB',
                  padding: '10px 14px'
                }}
              />
              <Bar dataKey="importance" radius={[0, 8, 8, 0]}>
                {importanceData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? '#7C3AED' : index < 3 ? '#8B7FCF' : '#C4B5FD'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#7C3AED]"></span>
            Most Important
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#8B7FCF]"></span>
            Very Important
          </span>
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-[#C4B5FD]"></span>
            Important
          </span>
        </div>
      </div>

      {/* How It Works - Simple Explanation */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          How the AI Made This Prediction
        </h4>
        <div className="text-blue-700 space-y-2">
          <p>
            <strong>Step 1:</strong> The AI starts with an average baseline risk of <strong>{((explanation.base_value || 0.497) * 100).toFixed(1)}%</strong> (typical population risk from 70,000 patient records).
          </p>
          <p>
            <strong>Step 2:</strong> Each of your health values either <span className="text-red-600 font-semibold">increases</span> or <span className="text-green-600 font-semibold">decreases</span> this baseline.
          </p>
          <p>
            <strong>Step 3:</strong> All these changes are combined to give your final personalized risk score.
          </p>
        </div>
        <div className="mt-4 p-3 bg-white rounded-xl text-sm text-blue-600">
          <strong>Note:</strong> This explanation updates automatically each time you complete a new assessment. The factors shown reflect YOUR specific health data.
        </div>
      </div>
    </motion.div>
  );
};

export default ExplainabilityTab;
