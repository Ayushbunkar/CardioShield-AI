import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, TrendingUp, AlertCircle, Bell, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  getAssessmentHistory, 
  getUserStats, 
  getUserMessages, 
  markMessageAsRead 
} from '../../services/cardioApi';
import toast from 'react-hot-toast';

const AIHistory = () => {
  const [assessments, setAssessments] = useState([]);
  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [historyRes, statsRes, messagesRes] = await Promise.all([
        getAssessmentHistory(1, 10),
        getUserStats(),
        getUserMessages()
      ]);
      setAssessments(historyRes.data || []);
      setStats(statsRes.data?.stats || null);
      setMessages(messagesRes.data || []);
      setUnreadCount(messagesRes.unreadCount || 0);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (messageId) => {
    try {
      await markMessageAsRead(messageId);
      setMessages(messages.map(m => 
        m._id === messageId ? { ...m, isRead: true, readAt: new Date() } : m
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Message marked as read');
    } catch (error) {
      toast.error('Failed to mark message as read');
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-700 border-green-200';
      case 'Moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Very High': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8B7FCF] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#4A3B5C] flex items-center gap-3">
              <Heart className="w-8 h-8 text-[#8B7FCF]" />
              AI Health Assessments
            </h1>
            <p className="text-gray-500 mt-1">Track your cardiovascular health over time</p>
          </div>
          <Link
            to="/ai"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8B7FCF] to-[#6B5B9A] text-white rounded-xl font-medium hover:shadow-lg transition"
          >
            <Activity className="w-5 h-5" />
            New Assessment
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          {['overview', 'history', 'messages'].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeSection === section
                  ? 'bg-[#8B7FCF] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
              {section === 'messages' && unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-4 gap-6"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-10 h-10 text-[#8B7FCF]" />
                <span className="text-3xl font-bold text-[#4A3B5C]">
                  {stats?.totalAssessments || 0}
                </span>
              </div>
              <p className="text-gray-500 font-medium">Total Assessments</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-10 h-10 text-blue-500" />
                <span className="text-3xl font-bold text-[#4A3B5C]">
                  {stats?.avgRiskScore ? (stats.avgRiskScore * 100).toFixed(0) : 0}%
                </span>
              </div>
              <p className="text-gray-500 font-medium">Avg Risk Score</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <AlertCircle className="w-10 h-10 text-orange-500" />
                <span className="text-3xl font-bold text-[#4A3B5C]">
                  {stats?.highRiskCount || 0}
                </span>
              </div>
              <p className="text-gray-500 font-medium">High Risk Alerts</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <Bell className="w-10 h-10 text-purple-500" />
                <span className="text-3xl font-bold text-[#4A3B5C]">
                  {unreadCount}
                </span>
              </div>
              <p className="text-gray-500 font-medium">Unread Messages</p>
            </div>

            {/* Latest Assessment */}
            {assessments.length > 0 && (
              <div className="md:col-span-4 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-semibold text-[#4A3B5C] mb-4">Latest Assessment</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-xl border ${getRiskColor(assessments[0].riskLevel)}`}>
                      {assessments[0].riskLevel} Risk
                    </div>
                    <span className="text-gray-500">
                      Score: {(assessments[0].riskScore * 100).toFixed(0)}%
                    </span>
                    <span className="text-gray-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(assessments[0].createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link
                    to="/ai"
                    className="flex items-center gap-1 text-[#8B7FCF] font-medium hover:underline"
                  >
                    View Details <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* History Section */}
        {activeSection === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            {assessments.length === 0 ? (
              <div className="p-12 text-center">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No assessments yet. Take your first assessment!</p>
                <Link
                  to="/ai"
                  className="inline-block mt-4 px-6 py-2 bg-[#8B7FCF] text-white rounded-lg"
                >
                  Start Assessment
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Risk Level</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Score</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">BP</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">BMI</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((assessment, idx) => (
                    <tr key={assessment._id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {new Date(assessment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm border ${getRiskColor(assessment.riskLevel)}`}>
                          {assessment.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {(assessment.riskScore * 100).toFixed(0)}%
                      </td>
                      <td className="px-6 py-4">
                        {assessment.patientData.ap_hi}/{assessment.patientData.ap_lo}
                      </td>
                      <td className="px-6 py-4">
                        {assessment.bmi?.toFixed(1) || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        )}

        {/* Messages Section */}
        {activeSection === 'messages' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {messages.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No messages from your healthcare team</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message._id}
                  className={`bg-white rounded-2xl p-6 shadow-lg border-l-4 ${
                    message.isRead ? 'border-gray-200' : getPriorityColor(message.priority)
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`w-2 h-2 rounded-full ${getPriorityColor(message.priority)}`} />
                        <h4 className="font-semibold text-[#4A3B5C]">{message.subject}</h4>
                        {!message.isRead && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">New</span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{message.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>From: {message.fromAdmin?.fullName || 'Admin'}</span>
                        <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                        {message.priority && (
                          <span className={`px-2 py-0.5 rounded text-xs text-white ${getPriorityColor(message.priority)}`}>
                            {message.priority}
                          </span>
                        )}
                      </div>
                    </div>
                    {!message.isRead && (
                      <button
                        onClick={() => handleMarkRead(message._id)}
                        className="flex items-center gap-1 text-[#8B7FCF] hover:underline text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AIHistory;
