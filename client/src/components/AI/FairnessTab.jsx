import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Scale, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { getFairness } from '../../services/cardioApi';

const FairnessTab = () => {
  const [fairness, setFairness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFairness();
  }, []);

  const loadFairness = async () => {
    try {
      setLoading(true);
      const data = await getFairness();
      setFairness(data);
    } catch (err) {
      setError('Failed to load fairness data. Make sure the backend is running.');
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
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadFairness}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const fairnessScore = fairness?.summary?.fairness_score || 0;
  const isFair = fairnessScore >= 0.9;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Fairness Score Overview */}
      <div className={`rounded-2xl p-6 ${isFair ? 'bg-green-50' : 'bg-yellow-50'}`}>
        <div className="flex items-center gap-4">
          {isFair ? (
            <CheckCircle className="w-12 h-12 text-green-500" />
          ) : (
            <AlertCircle className="w-12 h-12 text-yellow-500" />
          )}
          <div>
            <h3 className={`text-2xl font-bold ${isFair ? 'text-green-700' : 'text-yellow-700'}`}>
              Fairness Score: {(fairnessScore * 100).toFixed(1)}%
            </h3>
            <p className={isFair ? 'text-green-600' : 'text-yellow-600'}>
              {isFair 
                ? 'The model shows minimal bias across demographic groups'
                : 'Some performance disparity detected across groups'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Demographic Analysis */}
      {fairness?.analyses?.map((analysis, idx) => (
        <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-[#4A3B5C] mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#8B7FCF]" />
            Analysis by {analysis.feature.charAt(0).toUpperCase() + analysis.feature.slice(1)}
          </h3>

          {/* Metrics Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Group</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Count</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Actual Rate</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">Predicted Rate</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">AUC</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600">F1</th>
                </tr>
              </thead>
              <tbody>
                {analysis.groups?.map((group, gIdx) => (
                  <tr key={gIdx} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-700">{group.group_label}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{group.count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{(group.positive_rate * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-center text-gray-600">{(group.predicted_positive_rate * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded ${group.auc >= 0.7 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {(group.auc * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{(group.f1 * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Disparity Metrics */}
          {analysis.auc_disparity !== undefined && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">AUC Disparity</p>
                <p className={`text-2xl font-bold ${analysis.auc_disparity < 0.1 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {(analysis.auc_disparity * 100).toFixed(2)}%
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Demographic Parity Diff</p>
                <p className={`text-2xl font-bold ${analysis.demographic_parity_diff < 0.1 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {(analysis.demographic_parity_diff * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          )}

          {/* Bar Chart */}
          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysis.groups}>
                <XAxis dataKey="group_label" />
                <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip formatter={(v) => `${(v * 100).toFixed(1)}%`} />
                <Legend />
                <Bar dataKey="positive_rate" name="Actual Rate" fill="#8B7FCF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predicted_positive_rate" name="Predicted Rate" fill="#C4B5FD" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}

      {/* Info Card */}
      <div className="bg-gradient-to-r from-[#8B7FCF] to-[#6B5B9A] rounded-2xl p-6 text-white">
        <Scale className="w-8 h-8 mb-3" />
        <h4 className="font-semibold mb-2">About Fairness Analysis</h4>
        <p className="text-white/90 text-sm">
          We analyze model performance across different demographic groups to ensure equitable predictions.
          A fair model should have similar accuracy and prediction rates across all groups.
          Lower disparity values indicate better fairness.
        </p>
      </div>
    </motion.div>
  );
};

export default FairnessTab;
