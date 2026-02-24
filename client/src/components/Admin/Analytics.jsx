import React, { useEffect, useState, useCallback } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  RefreshCw,
  Clock,
  Heart,
} from "lucide-react";
import { getAdminAnalytics } from "../../services/cardioApi";

/* ── horizontal bar ── */
const HBar = ({ label, value, max, color, suffix = "" }) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-24 truncate">{label}</span>
      <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-white font-medium w-16 text-right">
        {typeof value === "number" ? value.toLocaleString() : value}
        {suffix}
      </span>
    </div>
  );
};

/* ── vertical bar chart ── */
const BarChart = ({ data, label, barColor = "bg-purple-500/70" }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      <p className="text-sm font-semibold text-white mb-4">{label}</p>
      <div className="flex items-end gap-2 h-40">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <span className="text-[9px] text-gray-500">{d.value}</span>
            <div
              className={`w-full rounded-t-sm ${barColor} min-h-[3px] transition-all`}
              style={{ height: `${(d.value / max) * 100}%` }}
            />
            <span className="text-[9px] text-gray-500 truncate w-full text-center">
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminAnalytics();
      setData(res.data);
      setLastRefresh(new Date());
    } catch (e) {
      console.error("Analytics load failed", e);
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
          <p className="text-gray-400 text-sm">Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-[100vh] bg-[#0b0614] p-5 text-gray-500 text-sm">
        Failed to load analytics data.
      </div>
    );
  }

  /* Derived datasets */
  const riskDist = (data.riskDistribution || []).map((r) => ({
    label: r._id || "Unknown",
    value: r.count,
  }));
  const totalRisk = riskDist.reduce((s, r) => s + r.value, 0);
  const riskColors = {
    Low: "bg-emerald-500",
    Moderate: "bg-yellow-500",
    High: "bg-orange-500",
    "Very High": "bg-red-500",
  };

  const monthlyGrowth = (data.monthlyGrowth || []).map((m) => ({
    label: m._id?.slice(5) || "",
    value: m.count,
    avg: m.avgScore,
  }));

  const genderRisk = (data.genderRisk || []).map((g) => ({
    gender: g._id === 1 ? "Female" : g._id === 2 ? "Male" : `G-${g._id}`,
    avgRisk: g.avgRisk,
    count: g.count,
    highRisk: g.highRisk,
  }));

  const ageVsRisk = data.ageVsRisk || [];
  // Bin age groups
  const ageBins = {};
  ageVsRisk.forEach((a) => {
    const age = a.age || 0;
    let bin;
    if (age < 30) bin = "<30";
    else if (age < 40) bin = "30-39";
    else if (age < 50) bin = "40-49";
    else if (age < 60) bin = "50-59";
    else bin = "60+";
    if (!ageBins[bin]) ageBins[bin] = { total: 0, riskSum: 0 };
    ageBins[bin].total += 1;
    ageBins[bin].riskSum += a.riskScore || 0;
  });
  const ageBinData = Object.entries(ageBins).map(([bin, d]) => ({
    label: bin,
    value: d.total,
    avg: d.total > 0 ? d.riskSum / d.total : 0,
  }));

  return (
    <div className="h-[100vh] overflow-y-auto bg-[#0b0614] px-5 pb-5">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0b0614] pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-500 text-sm">
            Deep-dive into risk distribution, demographics, and trends
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
      {/* Top mini stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={14} className="text-purple-400" />
            <span className="text-xs text-gray-500">Total Assessments</span>
          </div>
          <p className="text-xl font-bold text-white">{totalRisk.toLocaleString()}</p>
        </div>
        <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-blue-400" />
            <span className="text-xs text-gray-500">Active Today</span>
          </div>
          <p className="text-xl font-bold text-white">
            {data.activeUsersToday || 0}
          </p>
        </div>
        <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Heart size={14} className="text-red-400" />
            <span className="text-xs text-gray-500">High Risk Cases</span>
          </div>
          <p className="text-xl font-bold text-white">
            {riskDist
              .filter((r) => r.label === "High" || r.label === "Very High")
              .reduce((s, r) => s + r.value, 0)}
          </p>
        </div>
        <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-xs text-gray-500">Monthly Records</span>
          </div>
          <p className="text-xl font-bold text-white">
            {monthlyGrowth.length > 0
              ? monthlyGrowth[monthlyGrowth.length - 1].value
              : 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk Distribution */}
        <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 size={16} /> Risk Distribution
          </h2>
          <div className="space-y-3">
            {riskDist.map((r) => (
              <HBar
                key={r.label}
                label={r.label}
                value={r.value}
                max={totalRisk}
                color={riskColors[r.label] || "bg-gray-500"}
              />
            ))}
          </div>
          {/* Pie-like summary */}
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5">
            {riskDist.map((r) => (
              <div key={r.label} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${riskColors[r.label] || "bg-gray-500"}`} />
                <span className="text-[10px] text-gray-400">
                  {r.label} ({totalRisk > 0 ? ((r.value / totalRisk) * 100).toFixed(0) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Growth */}
        <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-5">
          {monthlyGrowth.length > 0 ? (
            <BarChart
              data={monthlyGrowth}
              label="Monthly Assessment Growth"
              barColor="bg-purple-500/70"
            />
          ) : (
            <p className="text-sm text-gray-500">No monthly growth data</p>
          )}
        </div>

        {/* Age Group Distribution */}
        <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-5">
          {ageBinData.length > 0 ? (
            <>
              <BarChart
                data={ageBinData}
                label="Assessments by Age Group"
                barColor="bg-cyan-500/70"
              />
              <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
                {ageBinData.map((a) => (
                  <div key={a.label} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Age {a.label}</span>
                    <span className="text-gray-300">
                      Avg Risk: <span className="text-purple-300">{(a.avg * 100).toFixed(1)}%</span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No age data</p>
          )}
        </div>

        {/* Gender Analysis */}
        <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Users size={16} /> Gender-Based Risk Analysis
          </h2>
          {genderRisk.length > 0 ? (
            <div className="space-y-4">
              {genderRisk.map((g) => (
                <div
                  key={g.gender}
                  className="bg-white/[0.03] rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white font-medium">
                      {g.gender}
                    </span>
                    <span className="text-xs text-gray-500">
                      {g.count} assessments
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500">Avg Risk Score</p>
                      <p className="text-sm text-purple-300 font-medium">
                        {((g.avgRisk || 0) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">High Risk Cases</p>
                      <p className="text-sm text-red-400 font-medium">
                        {g.highRisk} ({g.count > 0 ? ((g.highRisk / g.count) * 100).toFixed(0) : 0}%)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No gender data</p>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Analytics;
