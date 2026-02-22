import React, { useEffect, useState } from 'react';
import { getAssessmentHistory } from '../services/cardioApi';

// Simple beginner-friendly reports page
const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getAssessmentHistory(1, 20);
        // service returns an object; try to read a common shape
        setReports(data.data || data || []);
      } catch (err) {
        console.error('Failed to load reports', err);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-purple-800 mb-4">Assessment Reports</h1>
        <p className="text-gray-600 mb-6">This page lists your AI assessment reports. Click any row to see details.</p>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">No reports available.</div>
        ) : (
          <table className="w-full bg-white rounded-lg shadow overflow-hidden">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Risk Level</th>
                <th className="px-4 py-2">Score</th>
                <th className="px-4 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={r._id || i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{new Date(r.createdAt || r.date || Date.now()).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{r.riskLevel || r.risk_level || 'N/A'}</td>
                  <td className="px-4 py-3">{r.riskScore ? `${(r.riskScore * 100).toFixed(0)}%` : (r.risk_score ? `${(r.risk_score * 100).toFixed(0)}%` : 'N/A')}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.summary || r.note || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Reports;
