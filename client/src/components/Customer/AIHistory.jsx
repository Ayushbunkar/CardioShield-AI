import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getAssessmentHistory,
} from "../../services/cardioApi";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  AlertTriangle,
} from "lucide-react";

const AIHistory = () => {
  const { isLogin } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLogin) {
      navigate("/login");
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const res = await getAssessmentHistory(page, 10);
        setAssessments(res.data || []);
        setTotalPages(res.pagination?.pages || 1);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [isLogin, navigate, page]);

  const lc = {
    Low: "text-emerald-600 bg-emerald-50 border-emerald-200",
    Moderate: "text-yellow-600 bg-yellow-50 border-yellow-200",
    High: "text-orange-600 bg-orange-50 border-orange-200",
    "Very High": "text-red-600 bg-red-50 border-red-200",
  };

  return (
    <div className="min-h-screen bg-[#f5eef8] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-purple-800 mb-2 flex items-center gap-2">
          <Activity size={24} /> AI Assessment History
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          View all your past CardioShield AI risk assessments
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Heart size={40} className="mx-auto mb-3 text-purple-300" />
            <p>No assessments yet.</p>
            <button
              onClick={() => navigate("/ai")}
              className="mt-4 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-500 transition"
            >
              Take Your First Assessment
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {assessments.map((a, i) => (
              <div
                key={a._id || i}
                className={`bg-white rounded-xl border p-4 hover:shadow-md transition ${
                  lc[a.riskLevel]?.split(" ").slice(1).join(" ") || "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      lc[a.riskLevel] || "text-gray-500"
                    }`}
                  >
                    {a.riskLevel}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Risk Score</span>
                    <p className="font-bold text-purple-700">
                      {((a.riskScore || 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">BP</span>
                    <p className="font-medium">
                      {a.patientData?.ap_hi}/{a.patientData?.ap_lo}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">BMI</span>
                    <p className="font-medium">{a.bmi?.toFixed(1) || "—"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Prediction</span>
                    <p className="font-medium">
                      {a.prediction ? "Disease" : "No Disease"}
                    </p>
                  </div>
                </div>
                {a.recommendations?.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Recommendations:</p>
                    <ul className="text-xs text-gray-600 space-y-0.5">
                      {a.recommendations.slice(0, 3).map((r, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-purple-400 mt-0.5">•</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 hover:text-purple-600 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 hover:text-purple-600 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIHistory;
