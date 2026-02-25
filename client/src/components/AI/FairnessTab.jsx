import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Scale, Users, AlertCircle, CheckCircle, ShieldAlert, ArrowRight, RefreshCw } from 'lucide-react';
import { getFairness, getFairnessMitigation } from '../../services/cardioApi';

const MetricBadge = ({ label, value, threshold, invert }) => {
  const v = typeof value === 'number' ? value : 0;
  const pass = invert ? v >= threshold : v < threshold;
  return (
    <div className="p-3 bg-gray-50 rounded-xl">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${pass ? 'text-green-600' : 'text-amber-600'}`}>
        {typeof value === 'number' ? (value * 100).toFixed(2) + '%' : 'N/A'}
      </p>
      <span className={`text-[10px] px-2 py-0.5 rounded-full ${pass ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
        {pass ? 'Pass' : 'Flag'}
      </span>
    </div>
  );
};

const FairnessTab = () => {
  const [fairness, setFairness] = useState(null);
  const [mitigation, setMitigation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mitigationLoading, setMitigationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMitigation, setShowMitigation] = useState(false);

  useEffect(() => { loadFairness(); }, []);

  const loadFairness = async () => {
    try {
      setLoading(true); setError(null);
      const data = await getFairness();
      setFairness(data);
    } catch { setError('Failed to load fairness data. Make sure the backend is running.'); }
    finally { setLoading(false); }
  };

  const loadMitigation = async () => {
    try {
      setMitigationLoading(true);
      const data = await getFairnessMitigation();
      setMitigation(data);
      setShowMitigation(true);
    } catch { /* silent */ }
    finally { setMitigationLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8B7FCF] border-t-transparent" />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 rounded-2xl p-6 text-center">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <p className="text-red-600">{error}</p>
      <button onClick={loadFairness} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition">Retry</button>
    </div>
  );

  const fairnessScore = fairness?.summary?.fairness_score || 0;
  const isFair = fairnessScore >= 0.9;
  const violations = fairness?.summary?.violations || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Fairness Score Overview */}
      <div className={`rounded-2xl p-6 ${isFair ? 'bg-green-50' : 'bg-yellow-50'}`}>
        <div className="flex items-center gap-4">
          {isFair ? <CheckCircle className="w-12 h-12 text-green-500" /> : <AlertCircle className="w-12 h-12 text-yellow-500" />}
          <div className="flex-1">
            <h3 className={`text-2xl font-bold ${isFair ? 'text-green-700' : 'text-yellow-700'}`}>
              Fairness Score: {(fairnessScore * 100).toFixed(1)}%
            </h3>
            <p className={isFair ? 'text-green-600' : 'text-yellow-600'}>
              {isFair ? 'The model shows minimal bias across demographic groups' : 'Some performance disparity detected across groups'}
            </p>
          </div>
          {!isFair && (
            <button onClick={loadMitigation} disabled={mitigationLoading}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
              {mitigationLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
              Run Mitigation
            </button>
          )}
        </div>
      </div>

      {/* Violations */}
      {violations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-100">
          <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />Fairness Violations ({violations.length})
          </h3>
          <div className="space-y-2">
            {violations.map((v, i) => (
              <div key={i} className={`p-3 rounded-xl border flex items-start gap-3 ${v.severity === 'high' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${v.severity === 'high' ? 'text-red-500' : 'text-amber-500'}`} />
                <div>
                  <p className={`text-sm font-semibold ${v.severity === 'high' ? 'text-red-700' : 'text-amber-700'}`}>{v.metric}</p>
                  <p className="text-xs text-gray-600">{v.detail || `Value: ${typeof v.value === 'number' ? v.value.toFixed(4) : v.value}`}</p>
                </div>
                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${v.severity === 'high' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'}`}>
                  {v.severity?.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mitigation Results */}
      {showMitigation && mitigation && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
          <h3 className="text-lg font-semibold text-[#4A3B5C] mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#8B7FCF]" />Bias Mitigation Results
          </h3>
          {mitigation.mitigation_results?.map((m, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <p className="text-sm font-semibold text-gray-700 mb-2">{m.feature}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                  <p className="text-[10px] text-red-500 font-semibold uppercase mb-1">Before</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-gray-600">DI Ratio: <b>{(m.before?.disparate_impact_ratio ?? 0).toFixed(3)}</b></span>
                    <span className="text-gray-600">EO Diff: <b>{(m.before?.equalized_odds_diff ?? 0).toFixed(3)}</b></span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                  <p className="text-[10px] text-green-500 font-semibold uppercase mb-1">After</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-gray-600">DI Ratio: <b>{(m.after?.disparate_impact_ratio ?? 0).toFixed(3)}</b></span>
                    <span className="text-gray-600">EO Diff: <b>{(m.after?.equalized_odds_diff ?? 0).toFixed(3)}</b></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Demographic Analysis */}
      {fairness?.analyses?.map((analysis, idx) => (
        <div key={idx} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-[#4A3B5C] mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#8B7FCF]" />
            Analysis by {analysis.feature?.charAt(0).toUpperCase() + analysis.feature?.slice(1)}
          </h3>

          {/* Extended Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <MetricBadge label="Disparate Impact" value={analysis.disparate_impact_ratio} threshold={0.8} invert />
            <MetricBadge label="Equalized Odds Diff" value={analysis.equalized_odds_diff} threshold={0.1} />
            <MetricBadge label="Demographic Parity" value={analysis.demographic_parity_diff} threshold={0.1} />
            <MetricBadge label="AUC Disparity" value={analysis.auc_disparity} threshold={0.1} />
          </div>

          {/* Group Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left font-semibold text-gray-600">Group</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600">Count</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600">Actual</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600">Predicted</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600">AUC</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600">F1</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600">FPR</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600">FNR</th>
                </tr>
              </thead>
              <tbody>
                {analysis.groups?.map((g, gIdx) => (
                  <tr key={gIdx} className="border-t border-gray-100">
                    <td className="px-3 py-2 font-medium text-gray-700">{g.group_label}</td>
                    <td className="px-3 py-2 text-center text-gray-600">{g.count?.toLocaleString()}</td>
                    <td className="px-3 py-2 text-center text-gray-600">{((g.positive_rate || 0) * 100).toFixed(1)}%</td>
                    <td className="px-3 py-2 text-center text-gray-600">{((g.predicted_positive_rate || 0) * 100).toFixed(1)}%</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs ${(g.auc || 0) >= 0.7 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {((g.auc || 0) * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center text-gray-600">{((g.f1 || 0) * 100).toFixed(1)}%</td>
                    <td className="px-3 py-2 text-center text-gray-600">{((g.fpr || 0) * 100).toFixed(1)}%</td>
                    <td className="px-3 py-2 text-center text-gray-600">{((g.fnr || 0) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bar Chart */}
          <div className="h-64">
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
          We evaluate <b>disparate impact ratio</b> (0.80–1.25 is fair), <b>equalized odds difference</b> (&lt;0.10 is fair), 
          <b> FPR/FNR per group</b>, and <b>demographic parity</b> across gender, age, and BMI subgroups. 
          Mitigation uses sample reweighting and per-group threshold tuning to reduce detected bias.
        </p>
      </div>
    </motion.div>
  );
};

export default FairnessTab;
