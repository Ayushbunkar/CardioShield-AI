import React, { useEffect, useState } from "react";
import {
  Users,
  Activity,
  AlertTriangle,
  TrendingUp,
  Heart,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Clock,
} from "lucide-react";
import { getAIDashboardStats } from "../../services/cardioApi";

/* ── tiny bar for risk distribution ── */
const RiskBar = ({ label, count, total, color }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-gray-400 truncate">{label}</span>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-gray-300 w-8 text-right">{count}</span>
    </div>
  );
};

/* ── circular gauge ── */
const CircleGauge = ({ value, max, label, color, suffix = "%" }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const r = 42;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <svg width="110" height="110" className="-rotate-90">
        <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute mt-8 text-center">
        <p className="text-xl font-bold text-white">
          {typeof value === "number" ? value.toFixed(1) : value}
          <span className="text-xs text-gray-400">{suffix}</span>
        </p>
      </div>
      <p className="text-[11px] text-gray-400 mt-1">{label}</p>
    </div>
  );
};

/* ── tiny bar chart ── */
const MiniBarChart = ({ data, label }) => {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div>
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      <div className="flex items-end gap-1 h-20">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-sm bg-purple-500/70 min-h-[2px] transition-all"
              style={{ height: `${(d.count / max) * 100}%` }}
            />
            <span className="text-[8px] text-gray-500 truncate w-full text-center">
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getAIDashboardStats();
        setStats(data);
      } catch (e) {
        console.error("Dashboard load failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[87vh] bg-[#0b0614]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-[87vh] bg-[#0b0614] text-gray-400">
        Failed to load dashboard data.
      </div>
    );
  }

  /* derived data */
  const riskMap = {};
  (stats.riskDistribution || []).forEach((r) => (riskMap[r._id] = r.count));
  const totalA = stats.totalAssessments || 0;

  const daily = (stats.dailyAssessments || []).map((d) => ({
    label: d._id?.slice(5) || "",
    count: d.count,
  }));

  const monthly = (stats.monthlyAssessments || []).map((m) => ({
    label: m._id?.slice(5) || "",
    count: m.count,
  }));

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "from-blue-500 to-cyan-400",
      sub: `${stats.uniqueUsers || 0} assessed`,
    },
    {
      title: "Assessments",
      value: totalA,
      icon: Activity,
      color: "from-purple-500 to-pink-400",
      sub: "All time",
    },
    {
      title: "High Risk",
      value: stats.highRiskCount || 0,
      icon: AlertTriangle,
      color: "from-red-500 to-orange-400",
      sub: `${(stats.highRiskRate || 0).toFixed(1)}% of total`,
    },
    {
      title: "Avg Risk Score",
      value: `${((stats.avgRiskScore || 0) * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-400",
      sub: "Across all patients",
    },
  ];

  return (
    <div className="h-[100vh] overflow-y-auto bg-[#0b0614] px-5 pb-5">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0b0614] pt-5 pb-3">
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm">CardioShield AI — Admin Control Centre</p>
      </div>

      <div className="relative z-0">
      {/* Grid: left 8 cols · right 4 cols */}
      <div className="grid grid-cols-12 gap-4">
        {/* ── LEFT COLUMN (8 cols) ── */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {/* stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statCards.map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-4 hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center`}
                    >
                      <Icon size={18} className="text-white" />
                    </div>
                  </div>
                  <p className="text-white text-xl font-bold">{c.value}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{c.title}</p>
                  <p className="text-purple-400 text-[10px]">{c.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Risk Distribution + mini charts row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Risk distribution */}
            <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-4">
              <p className="text-sm font-semibold text-white mb-3">
                Risk Distribution
              </p>
              <div className="space-y-2">
                <RiskBar label="Low" count={riskMap["Low"] || 0} total={totalA} color="bg-emerald-500" />
                <RiskBar label="Moderate" count={riskMap["Moderate"] || 0} total={totalA} color="bg-yellow-500" />
                <RiskBar label="High" count={riskMap["High"] || 0} total={totalA} color="bg-orange-500" />
                <RiskBar label="Very High" count={riskMap["Very High"] || 0} total={totalA} color="bg-red-500" />
              </div>
            </div>

            {/* Daily trend */}
            <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-4">
              {daily.length > 0 ? (
                <MiniBarChart data={daily} label="Daily (Last 7 days)" />
              ) : (
                <p className="text-xs text-gray-500">No daily data</p>
              )}
            </div>

            {/* Monthly trend */}
            <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-4">
              {monthly.length > 0 ? (
                <MiniBarChart data={monthly} label="Monthly (Last 6 months)" />
              ) : (
                <p className="text-xs text-gray-500">No monthly data</p>
              )}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText size={15} /> Recent Reports
              </p>
            </div>
            {stats.recentAssessments && stats.recentAssessments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b border-white/5">
                      <th className="text-left py-2 font-medium">Patient</th>
                      <th className="text-left py-2 font-medium">Email</th>
                      <th className="text-center py-2 font-medium">Risk Score</th>
                      <th className="text-center py-2 font-medium">Risk Level</th>
                      <th className="text-right py-2 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentAssessments.map((a, i) => {
                      const levelColors = {
                        Low: "text-emerald-400 bg-emerald-500/10",
                        Moderate: "text-yellow-400 bg-yellow-500/10",
                        High: "text-orange-400 bg-orange-500/10",
                        "Very High": "text-red-400 bg-red-500/10",
                      };
                      return (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-2 text-white">
                            {a.user?.fullName || "—"}
                          </td>
                          <td className="py-2 text-gray-400">
                            {a.user?.email || "—"}
                          </td>
                          <td className="py-2 text-center text-purple-300">
                            {((a.riskScore || 0) * 100).toFixed(1)}%
                          </td>
                          <td className="py-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                levelColors[a.riskLevel] || "text-gray-400"
                              }`}
                            >
                              {a.riskLevel}
                            </span>
                          </td>
                          <td className="py-2 text-right text-gray-500">
                            {new Date(a.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-500">No recent reports</p>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN (4 cols) ── */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {/* Avg Risk Score Gauge */}
          <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-5 flex flex-col items-center">
            <p className="text-sm font-semibold text-white mb-3">Avg Risk Score</p>
            <div className="relative">
              <CircleGauge
                value={(stats.avgRiskScore || 0) * 100}
                max={100}
                label=""
                color="#a78bfa"
              />
            </div>
          </div>

          {/* High Risk Rate Gauge */}
          <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-5 flex flex-col items-center">
            <p className="text-sm font-semibold text-white mb-3">High Risk Rate</p>
            <div className="relative">
              <CircleGauge
                value={stats.highRiskRate || 0}
                max={100}
                label=""
                color="#f87171"
              />
            </div>
          </div>

          {/* Recent High Risk Alerts */}
          <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl p-4">
            <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-400" /> High Risk
              Alerts
            </p>
            {stats.recentHighRisk && stats.recentHighRisk.length > 0 ? (
              <div className="space-y-2">
                {stats.recentHighRisk.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-lg bg-red-500/5 border border-red-500/10"
                  >
                    <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center">
                      <Heart size={13} className="text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">
                        {a.user?.fullName || "Unknown"}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Score: {((a.riskScore || 0) * 100).toFixed(1)}% ·{" "}
                        {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                      {a.riskLevel}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No high-risk alerts</p>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Overview;
