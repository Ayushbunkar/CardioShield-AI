import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  Filter,
  UserX,
  UserCheck,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Mail,
  Shield,
  X,
  Send,
  Clock,
  Activity,
} from "lucide-react";
import {
  getAdminAllUsers,
  toggleUserStatus,
  deleteUserByAdmin,
  getUserAssessmentHistory,
  sendMessageToUser,
} from "../../services/cardioApi";

/* ── User Detail Modal ── */
const UserDetailModal = ({ user, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await getUserAssessmentHistory(user._id);
        setHistory(res.data?.assessments || []);
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#110d1d] border border-purple-900/30 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">User Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* User Info */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            ["Name", user.fullName],
            ["Email", user.email],
            ["Phone", user.phone],
            ["Gender", user.gender],
            ["Age", user.age || "N/A"],
            ["Role", user.role],
            ["Status", user.status],
            ["City", user.city],
            ["State", user.state],
            ["Smoking", user.smokingStatus],
            ["Family History", user.familyHistory || "N/A"],
            ["Joined", new Date(user.createdAt).toLocaleDateString()],
          ].map(([lbl, val], i) => (
            <div key={i} className="bg-white/5 rounded-lg px-3 py-2">
              <p className="text-[10px] text-gray-500">{lbl}</p>
              <p className="text-sm text-white truncate">{val || "—"}</p>
            </div>
          ))}
        </div>

        {/* Assessment History */}
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <Activity size={14} /> Assessment History ({history.length})
        </h3>
        {loading ? (
          <p className="text-xs text-gray-500">Loading…</p>
        ) : history.length === 0 ? (
          <p className="text-xs text-gray-500">No assessments found</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {history.map((a, i) => {
              const lc = {
                Low: "text-emerald-400 bg-emerald-500/10",
                Moderate: "text-yellow-400 bg-yellow-500/10",
                High: "text-orange-400 bg-orange-500/10",
                "Very High": "text-red-400 bg-red-500/10",
              };
              return (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        lc[a.riskLevel] || "text-gray-400"
                      }`}
                    >
                      {a.riskLevel}
                    </span>
                    <span className="text-purple-300">
                      Score: {((a.riskScore || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-gray-500">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Message Modal ── */
const MessageModal = ({ user, onClose, onSent }) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    try {
      await sendMessageToUser({
        userId: user._id,
        subject,
        message,
        priority,
      });
      onSent?.();
      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#110d1d] border border-purple-900/30 rounded-2xl w-full max-w-lg p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">
            Message {user.fullName}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-white/5 border border-purple-900/30 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
          />
          <textarea
            placeholder="Write your message…"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-white/5 border border-purple-900/30 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full bg-white/5 border border-purple-900/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
          >
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
            <option value="Critical">Critical Priority</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !message.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-lg text-sm text-white transition"
          >
            <Send size={14} />
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Users Component ── */
const Users = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ gender: "all", status: "all", role: "all" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageUser, setMessageUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchUsers = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = { page, limit: 15 };
        if (search) params.search = search;
        if (filters.gender !== "all") params.gender = filters.gender;
        if (filters.status !== "all") params.status = filters.status;
        if (filters.role !== "all") params.role = filters.role;

        const res = await getAdminAllUsers(params);
        setUsers(res.data || []);
        setPagination(res.pagination || { total: 0, page: 1, pages: 1 });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [search, filters]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggle = async (userId) => {
    try {
      await toggleUserStatus(userId);
      fetchUsers(pagination.page);
    } catch (e) {
      console.error(e);
      alert("Failed to toggle user status");
    }
  };

  const handleDelete = async (userId, name) => {
    if (!confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) return;
    try {
      await deleteUserByAdmin(userId);
      fetchUsers(pagination.page);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to delete user");
    }
  };

  const statusBadge = (s) => {
    const cls = s === "Active" ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10";
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cls}`}>
        {s}
      </span>
    );
  };

  return (
    <div className="h-[100vh] overflow-y-auto bg-[#0b0614] px-5 pb-5">
      <div className="sticky top-0 z-10 bg-[#0b0614] pt-5 pb-3">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-gray-500 text-sm">
          View, search, message, block, or remove users
        </p>
      </div>

      <div className="relative z-0">
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#110d1d] border border-purple-900/20 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/40"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
            showFilters
              ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
              : "bg-[#110d1d] border border-purple-900/20 text-gray-400 hover:text-white"
          }`}
        >
          <Filter size={14} /> Filters
        </button>
      </div>

      {/* Filter Row */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 mb-4 bg-[#110d1d] border border-purple-900/20 rounded-xl p-3">
          {[
            {
              label: "Gender",
              key: "gender",
              opts: ["all", "Male", "Female", "Other"],
            },
            {
              label: "Status",
              key: "status",
              opts: ["all", "Active", "Inactive"],
            },
            {
              label: "Role",
              key: "role",
              opts: ["all", "User", "Admin"],
            },
          ].map((f) => (
            <div key={f.key} className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{f.label}:</span>
              <select
                value={filters[f.key]}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, [f.key]: e.target.value }))
                }
                className="bg-white/5 border border-purple-900/30 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
              >
                {f.opts.map((o) => (
                  <option key={o} value={o}>
                    {o === "all" ? "All" : o}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Stats strip */}
      <div className="flex gap-3 mb-4 text-xs">
        <div className="bg-[#110d1d] border border-purple-900/20 rounded-lg px-3 py-2 text-gray-400">
          Total: <span className="text-white font-semibold">{pagination.total}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-white/5 bg-white/[0.02]">
                  <th className="text-left py-3 px-4 font-medium">User</th>
                  <th className="text-left py-3 px-4 font-medium">Contact</th>
                  <th className="text-center py-3 px-4 font-medium">Gender</th>
                  <th className="text-center py-3 px-4 font-medium">Role</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                  <th className="text-center py-3 px-4 font-medium">Joined</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.fullName?.charAt(0) || "U"}
                        </div>
                        <span className="text-white font-medium truncate max-w-[140px]">
                          {u.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-400 truncate max-w-[160px]">
                        {u.email}
                      </p>
                      <p className="text-gray-600 text-[10px]">{u.phone}</p>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-400">
                      {u.gender || "—"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          u.role === "Admin"
                            ? "text-purple-300 bg-purple-500/10"
                            : "text-blue-300 bg-blue-500/10"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {statusBadge(u.status)}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedUser(u)}
                          title="View details"
                          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setMessageUser(u)}
                          title="Send message"
                          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-blue-400 transition"
                        >
                          <Mail size={14} />
                        </button>
                        <button
                          onClick={() => handleToggle(u._id)}
                          title={u.status === "Active" ? "Block user" : "Unblock user"}
                          className={`p-1.5 rounded-lg hover:bg-white/5 transition ${
                            u.status === "Active"
                              ? "text-gray-400 hover:text-orange-400"
                              : "text-orange-400 hover:text-emerald-400"
                          }`}
                        >
                          {u.status === "Active" ? (
                            <UserX size={14} />
                          ) : (
                            <UserCheck size={14} />
                          )}
                        </button>
                        {u.role !== "Admin" && (
                          <button
                            onClick={() => handleDelete(u._id, u.fullName)}
                            title="Delete user"
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
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
              Page {pagination.page} of {pagination.pages} · {pagination.total} users
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white disabled:opacity-30 transition"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white disabled:opacity-30 transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
      {messageUser && (
        <MessageModal
          user={messageUser}
          onClose={() => setMessageUser(null)}
          onSent={() => {}}
        />
      )}
      </div>
    </div>
  );
};

export default Users;
