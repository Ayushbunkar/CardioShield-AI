import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';
import { BarChart2, Target, TrendingUp, Activity } from 'lucide-react';
import { getMetrics } from '../../services/cardioApi';

const MetricsCharts = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await getMetrics();
      setMetrics(data);
    } catch (err) {
      setError('Failed to load metrics. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8B7FCF] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadMetrics}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const metricCards = [
    { name: 'AUC-ROC', value: metrics.auc, icon: Target, color: '#8B7FCF', description: 'Area Under Curve', threshold: 0.92 },
    { name: 'Recall', value: metrics.recall, icon: Activity, color: '#22C55E', description: 'Sensitivity (Critical)', threshold: 0.85, critical: true },
    { name: 'Precision', value: metrics.precision, icon: TrendingUp, color: '#3B82F6', description: 'Positive Predictive Value', threshold: 0.80 },
    { name: 'F1 Score', value: metrics.f1, icon: BarChart2, color: '#F59E0B', description: 'Harmonic Mean of P&R', threshold: 0.80 },
  ];

  const radialData = metricCards.map((m, idx) => ({
    name: m.name,
    value: Math.round(m.value * 100),
    fill: m.color,
  }));

  const COLORS = ['#8B7FCF', '#22C55E', '#3B82F6', '#F59E0B'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((metric, idx) => (
          <motion.div
            key={metric.name}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-white rounded-2xl shadow-lg p-6 border ${metric.critical ? 'border-green-300 ring-2 ring-green-100' : 'border-gray-100'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <metric.icon className="w-8 h-8" style={{ color: metric.color }} />
              <span 
                className="text-3xl font-bold"
                style={{ color: metric.color }}
              >
                {Math.round(metric.value * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-700">{metric.name}</h4>
              {metric.critical && <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded">PRIORITY</span>}
            </div>
            <p className="text-sm text-gray-500">{metric.description}</p>
            {metric.value >= metric.threshold && (
              <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Meets threshold
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Radial Bar Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-[#4A3B5C] mb-4">Performance Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" cy="50%" 
                innerRadius="20%" outerRadius="90%" 
                data={radialData} 
                startAngle={180} endAngle={0}
              >
                <RadialBar
                  minAngle={15}
                  label={{ position: 'insideStart', fill: '#fff', fontSize: 12 }}
                  background
                  clockWise
                  dataKey="value"
                />
                <Legend 
                  iconSize={10} 
                  layout="horizontal" 
                  verticalAlign="bottom"
                  formatter={(value) => <span className="text-gray-600">{value}</span>}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-[#4A3B5C] mb-4">Metrics Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metricCards.map(m => ({ name: m.name, value: Math.round(m.value * 100) }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                  labelLine={false}
                >
                  {metricCards.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Threshold & Accuracy */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h4 className="font-semibold text-gray-700 mb-4">Decision Threshold</h4>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
              <motion.div
                className="absolute left-0 top-0 h-4 bg-gradient-to-r from-green-400 to-red-400 rounded-full"
                style={{ width: '100%' }}
              />
              <motion.div
                className="absolute top-0 w-1 h-4 bg-[#4A3B5C] rounded"
                initial={{ left: '0%' }}
                animate={{ left: `${metrics.threshold * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="font-bold text-[#8B7FCF] text-lg">{(metrics.threshold * 100).toFixed(0)}%</span>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Predictions above this threshold are classified as high risk.
            This threshold was optimized for the best F1 score.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h4 className="font-semibold text-gray-700 mb-4">Overall Accuracy</h4>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                <motion.circle
                  cx="48" cy="48" r="40" fill="none"
                  stroke="#8B7FCF"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${metrics.accuracy * 251.3} 251.3`}
                  initial={{ strokeDasharray: '0 251.3' }}
                  animate={{ strokeDasharray: `${metrics.accuracy * 251.3} 251.3` }}
                  transition={{ duration: 1 }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-[#8B7FCF]">
                {Math.round(metrics.accuracy * 100)}%
              </span>
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                The model correctly classifies {Math.round(metrics.accuracy * 100)}% of patients 
                in the test set.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Info */}
      <div className="bg-gradient-to-r from-[#8B7FCF] to-[#6B5B9A] rounded-2xl p-6 text-white">
        <h4 className="font-semibold mb-2">About These Metrics</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-white/90">
          <div>
            <strong>AUC-ROC:</strong> Measures how well the model distinguishes between classes. 
            Values closer to 1.0 indicate better performance.
          </div>
          <div>
            <strong>F1 Score:</strong> Balance between precision and recall. 
            Important when we care about both false positives and false negatives.
          </div>
          <div>
            <strong>Precision:</strong> Of all patients predicted as high risk, 
            how many actually have cardiovascular disease.
          </div>
          <div>
            <strong>Recall:</strong> Of all patients with cardiovascular disease, 
            how many were correctly identified.
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MetricsCharts;
