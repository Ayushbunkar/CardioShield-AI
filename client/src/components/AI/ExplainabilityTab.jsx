import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Brain, TrendingUp, TrendingDown } from 'lucide-react';

const ExplainabilityTab = ({ explanation, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8B7FCF] border-t-transparent" />
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Submit a patient assessment to see the AI explanation</p>
      </div>
    );
  }

  const { feature_impacts, feature_importance } = explanation;

  // Prepare chart data from feature impacts
  const chartData = feature_impacts.map(f => ({
    name: f.feature,
    impact: parseFloat(f.impact.toFixed(3)),
    direction: f.direction,
    description: f.description
  }));

  // Sort feature importance for bar chart
  const importanceData = Object.entries(feature_importance)
    .map(([name, value]) => ({ name, importance: parseFloat((value * 100).toFixed(1)) }))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Feature Impact Analysis */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-[#4A3B5C] mb-4 flex items-center gap-2">
          <Brain className="w-6 h-6 text-[#8B7FCF]" />
          How the AI Made This Decision
        </h3>
        <p className="text-gray-600 mb-6">
          These are the top factors that influenced the prediction for this patient.
        </p>

        {/* Impact List */}
        <div className="space-y-3">
          {feature_impacts.map((impact, idx) => (
            <motion.div
              key={impact.feature}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-xl flex items-center gap-4 ${
                impact.direction === 'increases' ? 'bg-red-50' : 'bg-green-50'
              }`}
            >
              {impact.direction === 'increases' ? (
                <TrendingUp className="w-6 h-6 text-red-500 flex-shrink-0" />
              ) : (
                <TrendingDown className="w-6 h-6 text-green-500 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${impact.direction === 'increases' ? 'text-red-700' : 'text-green-700'}`}>
                  {impact.description}
                </p>
                <p className="text-sm text-gray-600">
                  Value: {impact.value.toFixed(2)} | Impact: {Math.abs(impact.impact).toFixed(3)}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                impact.direction === 'increases' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {impact.direction === 'increases' ? '+' : '-'}{Math.abs(impact.impact * 100).toFixed(1)}%
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feature Importance Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-semibold text-[#4A3B5C] mb-4">
          Overall Feature Importance
        </h3>
        <p className="text-gray-600 mb-6">
          How much each feature contributes to the model's decisions in general.
        </p>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={importanceData} layout="vertical" margin={{ left: 80, right: 20 }}>
              <XAxis type="number" tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Importance']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                {importanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index < 3 ? '#8B7FCF' : '#C4B5FD'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SHAP Base Value */}
      <div className="bg-gradient-to-r from-[#8B7FCF] to-[#6B5B9A] rounded-2xl p-6 text-white">
        <h4 className="font-semibold mb-2">Understanding the Prediction</h4>
        <p className="text-white/90 text-sm">
          The model starts with a base risk of {(explanation.base_value * 100).toFixed(1)}% (average population risk).
          Each feature then pushes the prediction higher or lower based on the patient's specific values.
          The final risk score combines all these individual contributions.
        </p>
      </div>
    </motion.div>
  );
};

export default ExplainabilityTab;
