import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Send,
  X,
  Activity,
  AlertTriangle,
  FileText,
} from "lucide-react";
import {
  getAllAssessments,
  getUserAssessmentHistory,
  sendMessageToUser,
  exportAssessmentsCSV,
} from "../../services/cardioApi";

/* ── Assessment Detail Modal ── */
const DetailModal = ({ assessment, onClose }) => {
  if (!assessment) return null;
  const p = assessment.patientData || {};
  const lc = {
    Low: "text-emerald-400 bg-emerald-500/10",
    Moderate: "text-yellow-400 bg-yellow-500/10",
    High: "text-orange-400 bg-orange-500/10",
    "Very High": "text-red-400 bg-red-500/10",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#110d1d] border border-purple-900/30 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Assessment Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Patient */}
        <div className="flex items-center gap-3 mb-5 bg-white/[0.03] rounded-xl p-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
            {assessment.user?.fullName?.charAt(0) || "?"}
          </div>
          <div>
            <p className="text-white font-medium text-sm">
              {assessment.user?.fullName || "Unknown"}
            </p>
            <p className="text-gray-500 text-xs">
              {assessment.user?.email || "—"}
            </p>
          </div>
          <span
            className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
              lc[assessment.riskLevel] || "text-gray-400"
            }`}
          >
            {assessment.riskLevel}
          </span>
        </div>

        {/* Vitals grid */}
        <h3 className="text-sm font-semibold text-white mb-2">Patient Data</h3>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            ["Age", p.age],
            ["Gender", p.gender === 1 ? "Female" : "Male"],
            ["Height", `${p.height} cm`],
            ["Weight", `${p.weight} kg`],
            ["Systolic BP", `${p.ap_hi} mmHg`],
            ["Diastolic BP", `${p.ap_lo} mmHg`],
            ["Cholesterol", ["—", "Normal", "Above Normal", "Well Above"][p.cholesterol] || p.cholesterol],
            ["Glucose", ["—", "Normal", "Above Normal", "Well Above"][p.gluc] || p.gluc],
            ["Smoking", p.smoke ? "Yes" : "No"],
            ["Alcohol", p.alco ? "Yes" : "No"],
            ["Active", p.active ? "Yes" : "No"],
            ["BMI", assessment.bmi?.toFixed(1) || "—"],
          ].map(([lbl, val], i) => (
            <div key={i} className="bg-white/5 rounded-lg px-3 py-2">
              <p className="text-[10px] text-gray-500">{lbl}</p>
              <p className="text-sm text-white">{val}</p>
            </div>
          ))}
        </div>

        {/* Results */}
        <h3 className="text-sm font-semibold text-white mb-2">AI Results</h3>
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-white/5 rounded-lg px-3 py-2">
            <p className="text-[10px] text-gray-500">Risk Score</p>
            <p className="text-sm text-purple-300 font-bold">
              {((assessment.riskScore || 0) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="bg-white/5 rounded-lg px-3 py-2">
            <p className="text-[10px] text-gray-500">Prediction</p>
            <p className="text-sm text-white">
              {assessment.prediction ? "Disease" : "No Disease"}
            </p>
          </div>
          <div className="bg-white/5 rounded-lg px-3 py-2">
            <p className="text-[10px] text-gray-500">Confidence</p>
            <p className="text-sm text-white">
              {((assessment.confidence || 0) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Recommendations */}
        {assessment.recommendations?.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-white mb-2">
              Recommendations
            </h3>
            <ul className="space-y-1 mb-4">
              {assessment.recommendations.map((r, i) => (
                <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span> {r}
                </li>
              ))}
            </ul>
          </>
        )}

        <p className="text-[10px] text-gray-600 text-right">
          Assessed on {new Date(assessment.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

/* ── Main Assessments Component ── */
const Assessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const fetchData = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await getAllAssessments(page, 20, riskFilter);
        setAssessments(res.data || []);
        setPagination(res.pagination || { total: 0, page: 1, pages: 1 });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [riskFilter]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    window.open(exportAssessmentsCSV(), "_blank");
  };

  const lc = {
    Low: "text-emerald-400 bg-emerald-500/10",
    Moderate: "text-yellow-400 bg-yellow-500/10",
    High: "text-orange-400 bg-orange-500/10",
    "Very High": "text-red-400 bg-red-500/10",
  };

  return (
    <div className="h-[100vh] overflow-y-auto bg-[#0b0614] px-5 pb-5">
      <div className="sticky top-0 z-10 bg-[#0b0614] pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Assessment Management
          </h1>
          <p className="text-gray-500 text-sm">
            All AI risk assessments from every user
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm text-white transition"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="relative z-0">
      {/* Filter Row */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-gray-500">Risk Level:</span>
        {["all", "Low", "Moderate", "High", "Very High"].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setRiskFilter(lvl)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              riskFilter === lvl
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                : "bg-[#110d1d] border border-purple-900/20 text-gray-400 hover:text-white"
            }`}
          >
            {lvl === "all" ? "All" : lvl}
          </button>
        ))}
        <div className="ml-auto text-xs text-gray-500">
          Total: <span className="text-white font-semibold">{pagination.total}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            No assessments found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-white/5 bg-white/[0.02]">
                  <th className="text-left py-3 px-4 font-medium">Patient</th>
                  <th className="text-center py-3 px-4 font-medium">Age</th>
                  <th className="text-center py-3 px-4 font-medium">BP</th>
                  <th className="text-center py-3 px-4 font-medium">BMI</th>
                  <th className="text-center py-3 px-4 font-medium">Risk Score</th>
                  <th className="text-center py-3 px-4 font-medium">Risk Level</th>
                  <th className="text-center py-3 px-4 font-medium">Prediction</th>
                  <th className="text-center py-3 px-4 font-medium">Date</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assessments.map((a) => (
                  <tr
                    key={a._id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {a.user?.fullName?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="text-white font-medium truncate max-w-[120px]">
                            {a.user?.fullName || "Unknown"}
                          </p>
                          <p className="text-gray-600 text-[10px] truncate max-w-[120px]">
                            {a.user?.email || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-400">
                      {a.patientData?.age || "—"}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-400">
                      {a.patientData?.ap_hi}/{a.patientData?.ap_lo}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-400">
                      {a.bmi?.toFixed(1) || "—"}
                    </td>
                    <td className="py-3 px-4 text-center text-purple-300 font-medium">
                      {((a.riskScore || 0) * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          lc[a.riskLevel] || "text-gray-400"
                        }`}
                      >
                        {a.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {a.prediction ? (
                        <span className="text-red-400 text-[10px]">Disease</span>
                      ) : (
                        <span className="text-emerald-400 text-[10px]">
                          No Disease
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-500">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelected(a)}
                          title="View details"
                          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <p className="text-xs text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => fetchData(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white disabled:opacity-30 transition"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => fetchData(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white disabled:opacity-30 transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <DetailModal assessment={selected} onClose={() => setSelected(null)} />
      )}
      </div>
    </div>
  );
};

export default Assessments;
