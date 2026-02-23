import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { getAssessmentHistory, getUserStats, getUserMessages } from "../services/cardioApi";

// Simple circular progress component using SVG
function ProgressRing({ size = 96, stroke = 8, progress = 60, label = "" }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#efe6f2"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#8b5cf6"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="14" fill="#4c1d95">
          {progress}%
        </text>
      </svg>
      <div className="text-sm text-gray-700 mt-2">{label}</div>
    </div>
  );
}

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { isLogin, isAdmin } = useAuth();

  useEffect(() => {
    if (!isLogin || isAdmin) navigate("/login");
  }, [isLogin, isAdmin, navigate]);

  // Real data states
  const [stats, setStats] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [hRes, sRes, mRes] = await Promise.all([
          getAssessmentHistory(1, 5).catch(() => ({ data: [] })),
          getUserStats().catch(() => ({})),
          getUserMessages().catch(() => ({ data: [] }))
        ]);

        setAssessments(hRes.data || hRes || []);
        setStats(sRes.data || sRes || {});
        setMessages(mRes.data || mRes || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5eef8] text-gray-800 p-6">
      <div className="max-w-[1200px] mx-auto grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-3 bg-[#efe6f2] rounded-2xl p-6">
          <div className="flex flex-col items-start gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-purple-300 flex items-center justify-center text-white font-semibold">S</div>
              <div>
                <div className="text-sm font-semibold">Sophia Tompson</div>
                <div className="text-xs text-gray-600">Student</div>
              </div>
            </div>

            <nav className="w-full">
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-white">Home</Link>
                </li>
                <li>
                  <Link to="/ai" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-white">AI Assessment</Link>
                </li>
                <li>
                  <Link to="/ai-history" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-white">Assessment History</Link>
                </li>
                <li>
                  <Link to="/profile" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-white">Profile</Link>
                </li>
                <li>
                  <Link to="/contact" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-white">Contact</Link>
                </li>
              </ul>
            </nav>

            <button className="mt-auto w-full py-2 rounded-lg bg-white text-purple-700 font-semibold">Log out</button>
          </div>
        </aside>

        {/* Main content */}
        <main className="col-span-6 bg-transparent">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-purple-900">HELLO, SOPHIA!</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  className="w-64 py-2 px-3 rounded-full bg-white shadow-sm text-sm"
                  placeholder="Search"
                />
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-300 flex items-center justify-center text-white">ST</div>
            </div>
          </header>

          <div className="grid grid-cols-2 gap-4 items-stretch">
            <section className="bg-white rounded-2xl p-4 h-full flex flex-col">
              <h3 className="font-semibold text-gray-800 mb-3">Overview</h3>
              <div className="grid grid-cols-2 gap-3 flex-1">
                <div className="bg-white rounded-lg p-4 shadow-sm border h-full flex flex-col justify-between">
                  <div className="text-sm text-gray-500">Total Assessments</div>
                  <div className="text-2xl font-bold text-purple-800">{loading ? '—' : (stats?.totalAssessments ?? 0)}</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border h-full flex flex-col justify-between">
                  <div className="text-sm text-gray-500">Avg Risk Score</div>
                  <div className="text-2xl font-bold text-purple-800">{loading ? '—' : (stats?.avgRiskScore ? `${(stats.avgRiskScore*100).toFixed(0)}%` : '—')}</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border h-full flex flex-col justify-between">
                  <div className="text-sm text-gray-500">High Risk Alerts</div>
                  <div className="text-2xl font-bold text-purple-800">{loading ? '—' : (stats?.highRiskCount ?? 0)}</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm border h-full flex flex-col justify-between">
                  <div className="text-sm text-gray-500">Unread Messages</div>
                  <div className="text-2xl font-bold text-purple-800">{loading ? '—' : messages.filter(m=>!m.isRead).length}</div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl p-4 h-full flex flex-col">
              <h3 className="font-semibold text-gray-800 mb-3">Latest Assessment</h3>
              {loading ? (
                <div className="py-10 flex-1 flex items-center justify-center text-center">Loading...</div>
              ) : assessments.length === 0 ? (
                <div className="py-8 flex-1 flex items-center justify-center text-center text-gray-500">No assessments yet. Start one at the AI page.</div>
              ) : (
                <div className="p-4 border rounded-lg flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-sm text-gray-500">{new Date(assessments[0].createdAt || assessments[0].date || Date.now()).toLocaleDateString()}</div>
                    <div className="text-lg font-semibold text-purple-800">{assessments[0].riskLevel || assessments[0].risk_level || 'N/A'} Risk</div>
                  </div>
                  <div className="text-sm text-gray-600">{assessments[0].summary || assessments[0].note || 'No details available.'}</div>
                  <div className="mt-4 text-right">
                    <Link to="/ai-history" className="text-purple-700 font-medium">View history &rarr;</Link>
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 items-stretch">
            <section className="bg-white rounded-2xl p-4 h-full flex flex-col">
              <h3 className="font-semibold text-gray-800 mb-3">Recent Assessments</h3>
              {loading ? (
                <div className="py-8 flex-1 flex items-center justify-center">Loading...</div>
              ) : assessments.length === 0 ? (
                <div className="py-6 flex-1 flex items-center justify-center text-gray-500">No recent assessments</div>
              ) : (
                <ul className="space-y-3 flex-1 overflow-auto">
                  {assessments.slice(0,4).map((a, i) => (
                    <li key={a._id || i} className="p-3 border rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{a.title || `Assessment ${i+1}`}</div>
                        <div className="text-xs text-gray-500">{new Date(a.createdAt || a.date || Date.now()).toLocaleDateString()}</div>
                      </div>
                      <div className="text-sm text-purple-700">{a.riskLevel || a.risk_level || 'N/A'}</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="bg-white rounded-2xl p-4 h-full flex flex-col">
              <h3 className="font-semibold text-gray-800 mb-3">Reports</h3>
              {loading ? (
                <div className="py-6 flex-1 flex items-center justify-center">Loading reports...</div>
              ) : (
                <div className="space-y-3 flex-1 overflow-auto">
                  {(assessments.slice(0,3).length === 0) ? (
                    <div className="text-sm text-gray-500">No reports available.</div>
                  ) : (
                    assessments.slice(0,3).map((r, i) => (
                      <div key={r._id || i} className="p-3 border rounded-lg flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{r.title || `Report ${i + 1}`}</div>
                          <div className="text-xs text-gray-500">{new Date(r.createdAt || r.date || Date.now()).toLocaleDateString()}</div>
                        </div>
                        <Link to="/reports" className="text-purple-700 text-sm font-medium">View</Link>
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>
          </div>
        </main>

        {/* Right column */}
        <aside className="col-span-3">
          <div className="flex flex-col gap-4 h-full">
            <div className="bg-white rounded-2xl p-4 flex flex-col items-center h-48">
              <ProgressRing
                progress={Math.min(100, Math.round((stats?.avgRiskScore ?? 0) * 100))}
                label="Avg Risk"
              />
            </div>

            <div className="bg-white rounded-2xl p-4 flex flex-col items-center h-48">
              <ProgressRing
                progress={(() => {
                  const total = stats?.totalAssessments || assessments.length || 0;
                  const high = stats?.highRiskCount || 0;
                  return total > 0 ? Math.min(100, Math.round((high / total) * 100)) : 0;
                })()}
                label="High Risk Rate"
              />
            </div>

            <div className="bg-white rounded-2xl p-4 h-48 flex items-center">
              <div className="flex items-start justify-between w-full">
                <div>
                  <div className="text-sm text-gray-500">Reports</div>
                  <div className="text-2xl font-bold text-purple-800">{loading ? '—' : (stats?.totalAssessments ?? assessments.length)}</div>
                </div>
                <div className="mt-2">
                  <Link to="/reports" className="px-3 py-2 bg-purple-700 text-white rounded-lg text-sm">Open</Link>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CustomerDashboard;
