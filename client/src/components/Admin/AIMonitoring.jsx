import React, { useEffect, useState, useCallback } from "react";
import {
  Brain,
  Activity,
  Server,
  CheckCircle,
  XCircle,
  RefreshCw,
  Cpu,
  BarChart3,
  Shield,
  Zap,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { getAIMetrics, getAIHealth } from "../../services/cardioApi";

/* ── Metric Card ── */
const MetricCard = ({ label, value, sub, icon: Icon, color }) => (
  <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-4 hover:border-purple-500/30 transition-all">
    <div className="flex items-center justify-between mb-2">
      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
    <p className="text-white text-xl font-bold">{value}</p>
    <p className="text-gray-500 text-xs">{label}</p>
    {sub && <p className="text-purple-400 text-[10px]">{sub}</p>}
  </div>
);

/* ── Progress Bar ── */
const ModelBar = ({ name, accuracy, color }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-gray-400 w-28 truncate">{name}</span>
    <div className="flex-1 h-2.5 bg-white/5 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${(accuracy * 100).toFixed(0)}%` }}
      />
    </div>
    <span className="text-xs text-white font-medium w-14 text-right">
      {(accuracy * 100).toFixed(1)}%
    </span>
  </div>
);

const AIMonitoring = () => {
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, h] = await Promise.all([getAIMetrics(), getAIHealth()]);
      setMetrics(m);
      setHealth(h);
      setLastRefresh(new Date());
    } catch (e) {
      console.error("AI Monitoring fetch failed", e);
      setError("Could not connect to AI backend. Make sure the Flask server is running on port 5001.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[100vh] bg-[#0b0614]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Connecting to AI backend…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[100vh] overflow-y-auto bg-[#0b0614] p-5">
        <h1 className="text-2xl font-bold text-white mb-2">AI Monitoring</h1>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center mt-10">
          <XCircle size={40} className="text-red-400 mx-auto mb-3" />
          <p className="text-red-300 text-sm mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm text-white transition"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  /* Parse metrics safely */
  const models = metrics?.models || {};
  const modelNames = Object.keys(models);
  const ensemble = models["Weighted Ensemble"] || models["ensemble"] || {};

  /* Individual model accuracies */
  const modelList = modelNames
    .filter((n) => n !== "Weighted Ensemble" && n !== "ensemble")
    .map((name) => ({
      name,
      accuracy: models[name]?.accuracy || 0,
      f1: models[name]?.f1_score || 0,
      precision: models[name]?.precision || 0,
      recall: models[name]?.recall || 0,
    }));

  const ensembleAcc = ensemble.accuracy || 0;
  const ensembleF1 = ensemble.f1_score || 0;

  const modelColors = [
    "bg-purple-500",
    "bg-blue-500",
    "bg-cyan-500",
    "bg-pink-500",
    "bg-emerald-500",
  ];

  /* health info */
  const isHealthy = health?.status === "healthy";
  const loadedModels = health?.models_loaded || [];
  const datasetSize = health?.dataset_size || metrics?.dataset_size || 0;
  const features = health?.features || metrics?.features || 0;

  return (
    <div className="h-[100vh] overflow-y-auto bg-[#0b0614] px-5 pb-5">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0b0614] pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Monitoring</h1>
          <p className="text-gray-500 text-sm">
            Live model performance, health status, and metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-[10px] text-gray-600 flex items-center gap-1">
              <Clock size={10} /> {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 bg-[#110d1d] border border-purple-900/20 rounded-lg text-sm text-gray-400 hover:text-white transition"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="relative z-0">
      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <MetricCard
          label="System Status"
          value={isHealthy ? "Healthy" : "Degraded"}
          icon={isHealthy ? CheckCircle : AlertTriangle}
          color={isHealthy ? "from-emerald-500 to-teal-400" : "from-red-500 to-orange-400"}
          sub={`${loadedModels.length} models loaded`}
        />
        <MetricCard
          label="Ensemble Accuracy"
          value={`${(ensembleAcc * 100).toFixed(1)}%`}
          icon={Brain}
          color="from-purple-500 to-pink-400"
          sub={`F1: ${(ensembleF1 * 100).toFixed(1)}%`}
        />
        <MetricCard
          label="Dataset Size"
          value={datasetSize.toLocaleString()}
          icon={Server}
          color="from-blue-500 to-cyan-400"
          sub={`${features} features`}
        />
        <MetricCard
          label="Models Active"
          value={loadedModels.length}
          icon={Cpu}
          color="from-orange-500 to-yellow-400"
          sub={loadedModels.join(", ").slice(0, 30)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Model Accuracy Breakdown */}
        <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={16} /> Model Accuracy Breakdown
          </h2>
          <div className="space-y-3">
            {modelList.map((m, i) => (
              <ModelBar
                key={m.name}
                name={m.name}
                accuracy={m.accuracy}
                color={modelColors[i % modelColors.length]}
              />
            ))}
            {/* Ensemble highlighted */}
            <div className="pt-2 border-t border-white/5">
              <ModelBar
                name="Ensemble"
                accuracy={ensembleAcc}
                color="bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Per-model detailed table */}
        <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={16} /> Detailed Metrics
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-white/5">
                  <th className="text-left py-2 font-medium">Model</th>
                  <th className="text-center py-2 font-medium">Accuracy</th>
                  <th className="text-center py-2 font-medium">Precision</th>
                  <th className="text-center py-2 font-medium">Recall</th>
                  <th className="text-center py-2 font-medium">F1</th>
                </tr>
              </thead>
              <tbody>
                {[...modelList, { name: "Ensemble", ...ensemble, accuracy: ensembleAcc, f1: ensembleF1, precision: ensemble.precision || 0, recall: ensemble.recall || 0 }].map(
                  (m, i) => (
                    <tr key={m.name} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-2 text-white font-medium">{m.name}</td>
                      <td className="py-2 text-center text-emerald-400">
                        {(m.accuracy * 100).toFixed(1)}%
                      </td>
                      <td className="py-2 text-center text-blue-300">
                        {((m.precision || 0) * 100).toFixed(1)}%
                      </td>
                      <td className="py-2 text-center text-orange-300">
                        {((m.recall || 0) * 100).toFixed(1)}%
                      </td>
                      <td className="py-2 text-center text-purple-300">
                        {((m.f1 || 0) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Loaded Models */}
        <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Zap size={16} /> Loaded Models
          </h2>
          <div className="space-y-2">
            {loadedModels.map((name, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/[0.03] rounded-lg px-3 py-2"
              >
                <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                <span className="text-sm text-white">{name}</span>
                <span className="ml-auto text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Health Info */}
        <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Shield size={16} /> System Information
          </h2>
          <div className="space-y-2">
            {[
              ["Status", isHealthy ? "Healthy" : "Degraded"],
              ["Endpoint", "http://localhost:5001"],
              ["Dataset Records", datasetSize.toLocaleString()],
              ["Input Features", features],
              ["Ensemble Method", "Weighted Average"],
              [
                "Models",
                loadedModels.length + " / " + loadedModels.length,
              ],
            ].map(([k, v], i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-2"
              >
                <span className="text-xs text-gray-400">{k}</span>
                <span className="text-xs text-white font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AIMonitoring;
