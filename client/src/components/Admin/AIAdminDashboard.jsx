import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Activity, AlertTriangle, Users, TrendingUp, 
  Send, Search, Filter, ChevronDown, Eye, MessageCircle,
  CheckCircle, Clock, XCircle
} from 'lucide-react';
import { 
  getAllAssessments, 
  getHighRiskUsers, 
  getAIDashboardStats,
  getUserAssessmentHistory,
  sendMessageToUser 
} from '../../services/cardioApi';
import toast from 'react-hot-toast';

const AIAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [highRiskUsers, setHighRiskUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageData, setMessageData] = useState({
    toUser: '',
    assessment: '',
    subject: '',
    message: '',
    priority: 'Medium'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, assessmentsRes, highRiskRes] = await Promise.all([
        getAIDashboardStats(),
        getAllAssessments(1, 50),
        getHighRiskUsers()
      ]);
      setStats(statsRes.data);
      setAssessments(assessmentsRes.data || []);
      setHighRiskUsers(highRiskRes.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async (userId, userName) => {
    try {
      const res = await getUserAssessmentHistory(userId);
      setUserHistory(res.data || []);
      setSelectedUser({ _id: userId, name: userName });
    } catch (error) {
      toast.error('Failed to load user history');
    }
  };

  const handleSendMessage = async () => {
    if (!messageData.toUser || !messageData.subject || !messageData.message) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await sendMessageToUser(messageData);
      toast.success('Message sent successfully');
      setShowMessageModal(false);
      setMessageData({
        toUser: '',
        assessment: '',
        subject: '',
        message: '',
        priority: 'Medium'
      });
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const openMessageModal = (user, assessment = null) => {
    setMessageData({
      toUser: user._id,
      assessment: assessment?._id || '',
      subject: assessment ? `Regarding Your Cardiovascular Risk Assessment` : '',
      message: assessment && assessment.riskLevel === 'High' || assessment?.riskLevel === 'Very High' 
        ? `Dear ${user.fullName},\n\nBased on your recent cardiovascular risk assessment showing ${assessment.riskLevel} risk (${(assessment.riskScore * 100).toFixed(0)}%), we strongly recommend scheduling an appointment with a healthcare provider for a comprehensive evaluation.\n\nPlease take this alert seriously and consult with a medical professional at your earliest convenience.\n\nBest regards,\nCardioShield AI Team`
        : '',
      priority: assessment?.riskLevel === 'Very High' ? 'Urgent' : assessment?.riskLevel === 'High' ? 'High' : 'Medium'
    });
    setShowMessageModal(true);
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-700 border-green-300';
      case 'Moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Very High': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const filteredAssessments = assessments.filter(a => {
    const matchesSearch = !searchQuery || 
      a.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = filterRisk === 'all' || a.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#8B7FCF] border-t-transparent mx-auto mb-4" />
          <p className="text-gray-500">Loading AI Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#4A3B5C] flex items-center gap-3">
              <Heart className="w-8 h-8 text-[#8B7FCF]" />
              AI Health Administration
            </h1>
            <p className="text-gray-500 mt-1">Monitor and manage cardiovascular risk assessments</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white p-2 rounded-xl shadow-sm">
          {['dashboard', 'assessments', 'high-risk'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-[#8B7FCF] to-[#6B5B9A] text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              {tab === 'high-risk' && highRiskUsers.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {highRiskUsers.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="w-12 h-12 text-[#8B7FCF] p-2 bg-purple-50 rounded-xl" />
                  <span className="text-4xl font-bold text-[#4A3B5C]">
                    {stats?.totalAssessments || 0}
                  </span>
                </div>
                <p className="text-gray-500 font-medium">Total Assessments</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-12 h-12 text-blue-500 p-2 bg-blue-50 rounded-xl" />
                  <span className="text-4xl font-bold text-[#4A3B5C]">
                    {stats?.uniqueUsers || 0}
                  </span>
                </div>
                <p className="text-gray-500 font-medium">Users Assessed</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <AlertTriangle className="w-12 h-12 text-red-500 p-2 bg-red-50 rounded-xl" />
                  <span className="text-4xl font-bold text-[#4A3B5C]">
                    {stats?.highRiskCount || 0}
                  </span>
                </div>
                <p className="text-gray-500 font-medium">High Risk Users</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-12 h-12 text-green-500 p-2 bg-green-50 rounded-xl" />
                  <span className="text-4xl font-bold text-[#4A3B5C]">
                    {stats?.avgRiskScore ? (stats.avgRiskScore * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <p className="text-gray-500 font-medium">Avg Risk Score</p>
              </div>
            </div>

            {/* Risk Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-[#4A3B5C] mb-6">Risk Level Distribution</h3>
              <div className="grid md:grid-cols-4 gap-4">
                {stats?.riskDistribution?.map((item) => (
                  <div key={item._id} className={`p-4 rounded-xl border ${getRiskColor(item._id)}`}>
                    <div className="text-2xl font-bold">{item.count}</div>
                    <div className="text-sm">{item._id} Risk</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent High Risk */}
            {highRiskUsers.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-red-100">
                <h3 className="text-xl font-semibold text-[#4A3B5C] mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Recent High Risk Alerts
                </h3>
                <div className="space-y-3">
                  {highRiskUsers.slice(0, 5).map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                      <div>
                        <span className="font-semibold text-[#4A3B5C]">{item.user?.fullName}</span>
                        <span className="text-gray-500 ml-2">{item.user?.email}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-red-600 font-semibold">
                          {(item.riskScore * 100).toFixed(0)}% Risk
                        </span>
                        <button
                          onClick={() => openMessageModal(item.user, item)}
                          className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                          <Send className="w-4 h-4" />
                          Alert User
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Assessments Tab */}
        {activeTab === 'assessments' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            {/* Search & Filter */}
            <div className="p-4 border-b flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#8B7FCF] focus:border-transparent"
                />
              </div>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#8B7FCF]"
              >
                <option value="all">All Risk Levels</option>
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Very High">Very High</option>
              </select>
            </div>

            {/* Table */}
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Risk Level</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">BP</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.map((assessment) => (
                  <tr key={assessment._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-[#4A3B5C]">{assessment.user?.fullName}</div>
                        <div className="text-sm text-gray-500">{assessment.user?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
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
                      {assessment.patientData?.ap_hi}/{assessment.patientData?.ap_lo}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewHistory(assessment.user?._id, assessment.user?.fullName)}
                          className="p-2 text-[#8B7FCF] hover:bg-purple-50 rounded-lg transition"
                          title="View History"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openMessageModal(assessment.user, assessment)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="Send Message"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* High Risk Tab */}
        {activeTab === 'high-risk' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {highRiskUsers.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No high-risk users at the moment</p>
              </div>
            ) : (
              highRiskUsers.map((item) => (
                <div
                  key={item._id}
                  className={`bg-white rounded-2xl p-6 shadow-lg border-l-4 ${
                    item.riskLevel === 'Very High' ? 'border-red-500' : 'border-orange-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className={`w-5 h-5 ${
                          item.riskLevel === 'Very High' ? 'text-red-500' : 'text-orange-500'
                        }`} />
                        <h4 className="font-semibold text-lg text-[#4A3B5C]">{item.user?.fullName}</h4>
                        <span className={`px-3 py-1 rounded-full text-sm border ${getRiskColor(item.riskLevel)}`}>
                          {item.riskLevel}
                        </span>
                      </div>
                      <p className="text-gray-500 mb-2">{item.user?.email}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Risk Score: <b className="text-red-600">{(item.riskScore * 100).toFixed(0)}%</b></span>
                        <span>BP: {item.patientData?.ap_hi}/{item.patientData?.ap_lo}</span>
                        <span>BMI: {item.bmi?.toFixed(1)}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewHistory(item.user?._id, item.user?.fullName)}
                        className="flex items-center gap-2 px-4 py-2 border border-[#8B7FCF] text-[#8B7FCF] rounded-lg hover:bg-purple-50 transition"
                      >
                        <Eye className="w-4 h-4" />
                        History
                      </button>
                      <button
                        onClick={() => openMessageModal(item.user, item)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        <Send className="w-4 h-4" />
                        Alert User
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* User History Modal */}
        <AnimatePresence>
          {selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedUser(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-[#4A3B5C]">
                    Assessment History: {selectedUser.name}
                  </h3>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <XCircle className="w-6 h-6 text-gray-400" />
                  </button>
                </div>
                {userHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No assessments found</p>
                ) : (
                  <div className="space-y-4">
                    {userHistory.map((h) => (
                      <div key={h._id} className="p-4 border rounded-xl">
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-sm border ${getRiskColor(h.riskLevel)}`}>
                            {h.riskLevel}
                          </span>
                          <span className="font-medium">{(h.riskScore * 100).toFixed(0)}%</span>
                          <span className="text-gray-500">{new Date(h.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Send Message Modal */}
        <AnimatePresence>
          {showMessageModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowMessageModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-lg w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-[#4A3B5C] flex items-center gap-2">
                    <Send className="w-5 h-5 text-[#8B7FCF]" />
                    Send Alert Message
                  </h3>
                  <button
                    onClick={() => setShowMessageModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <XCircle className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={messageData.subject}
                      onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#8B7FCF]"
                      placeholder="Message subject..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={messageData.priority}
                      onChange={(e) => setMessageData({ ...messageData, priority: e.target.value })}
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#8B7FCF]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      value={messageData.message}
                      onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#8B7FCF] resize-none"
                      placeholder="Enter your message..."
                    />
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowMessageModal(false)}
                      className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendMessage}
                      className="px-6 py-3 bg-gradient-to-r from-[#8B7FCF] to-[#6B5B9A] text-white rounded-xl hover:shadow-lg transition flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send Message
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIAdminDashboard;
