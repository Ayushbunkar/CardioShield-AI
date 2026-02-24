import React, { useEffect, useState, useCallback } from "react";
import {
  MessageSquare,
  Search,
  Eye,
  Send,
  X,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  Filter,
} from "lucide-react";
import axios from "axios";

const SERVER = "http://localhost:4500";
const serverClient = axios.create({
  baseURL: SERVER,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

/* ── Reply Modal ── */
const ReplyModal = ({ query, onClose, onUpdated }) => {
  const [reply, setReply] = useState(query.reply || "");
  const [status, setStatus] = useState(query.status || "Pending");
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await serverClient.put(`/admin/contacts/${query._id}`, { status, reply });
      onUpdated?.();
      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to update query");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#110d1d] border border-purple-900/30 rounded-2xl w-full max-w-lg p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Reply to Query</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Query Info */}
        <div className="bg-white/[0.03] rounded-xl p-4 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white font-medium">{query.name}</p>
            <p className="text-[10px] text-gray-500">
              {new Date(query.createdAt).toLocaleDateString()}
            </p>
          </div>
          <p className="text-xs text-gray-400">{query.email}</p>
          <p className="text-xs text-gray-400">Phone: {query.phone}</p>
          <p className="text-xs text-purple-300 font-medium">
            Subject: {query.subject}
          </p>
          <p className="text-xs text-gray-300 bg-white/5 rounded-lg p-3 mt-2">
            {query.message}
          </p>
        </div>

        {/* Reply Form */}
        <div className="space-y-3">
          <textarea
            placeholder="Write your reply…"
            rows={4}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="w-full bg-white/5 border border-purple-900/30 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-white/5 border border-purple-900/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
          >
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
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
            onClick={handleSubmit}
            disabled={sending || !reply.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-lg text-sm text-white transition"
          >
            <Send size={14} /> {sending ? "Sending…" : "Send Reply"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Detail Modal ── */
const DetailModal = ({ query, onClose }) => {
  if (!query) return null;
  const sc = {
    Pending: "text-yellow-400 bg-yellow-500/10",
    Resolved: "text-emerald-400 bg-emerald-500/10",
    Rejected: "text-red-400 bg-red-500/10",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#110d1d] border border-purple-900/30 rounded-2xl w-full max-w-lg p-6 mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Query Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {[
            ["Name", query.name],
            ["Email", query.email],
            ["Phone", query.phone],
            ["Subject", query.subject],
            ["Status", query.status],
            ["Submitted", new Date(query.createdAt).toLocaleString()],
          ].map(([lbl, val], i) => (
            <div key={i} className="bg-white/5 rounded-lg px-3 py-2">
              <p className="text-[10px] text-gray-500">{lbl}</p>
              <p className="text-sm text-white">{val}</p>
            </div>
          ))}
          <div className="bg-white/5 rounded-lg px-3 py-3">
            <p className="text-[10px] text-gray-500 mb-1">Message</p>
            <p className="text-sm text-gray-300">{query.message}</p>
          </div>
          {query.reply && (
            <div className="bg-purple-500/5 border border-purple-500/10 rounded-lg px-3 py-3">
              <p className="text-[10px] text-purple-400 mb-1">Admin Reply</p>
              <p className="text-sm text-gray-300">{query.reply}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main ContactQueries Component ── */
const ContactQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyQuery, setReplyQuery] = useState(null);

  const fetchQueries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await serverClient.get("/admin/contacts");
      setQueries(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  /* Filtered */
  const filtered = queries.filter((q) => {
    const matchSearch =
      !search ||
      q.name?.toLowerCase().includes(search.toLowerCase()) ||
      q.email?.toLowerCase().includes(search.toLowerCase()) ||
      q.subject?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusBadge = (s) => {
    const cls = {
      Pending: "text-yellow-400 bg-yellow-500/10",
      Resolved: "text-emerald-400 bg-emerald-500/10",
      Rejected: "text-red-400 bg-red-500/10",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cls[s] || "text-gray-400"}`}>
        {s}
      </span>
    );
  };

  const counts = {
    all: queries.length,
    Pending: queries.filter((q) => q.status === "Pending").length,
    Resolved: queries.filter((q) => q.status === "Resolved").length,
    Rejected: queries.filter((q) => q.status === "Rejected").length,
  };

  return (
    <div className="h-[100vh] overflow-y-auto bg-[#0b0614] px-5 pb-5">
      <div className="sticky top-0 z-10 bg-[#0b0614] pt-5 pb-3">
        <h1 className="text-2xl font-bold text-white">Contact Queries</h1>
        <p className="text-gray-500 text-sm">
          View and respond to user queries from the contact form
        </p>
      </div>

      <div className="relative z-0">
      {/* Stats strip */}
      <div className="flex flex-wrap gap-3 mb-4">
        {[
          { label: "All", key: "all" },
          { label: "Pending", key: "Pending" },
          { label: "Resolved", key: "Resolved" },
          { label: "Rejected", key: "Rejected" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              statusFilter === s.key
                ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                : "bg-[#110d1d] border border-purple-900/20 text-gray-400 hover:text-white"
            }`}
          >
            {s.label} ({counts[s.key]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name, email, or subject…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#110d1d] border border-purple-900/20 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/40"
        />
      </div>

      {/* Table */}
      <div className="bg-[#110d1d] border border-purple-900/20 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            No queries found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-white/5 bg-white/[0.02]">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Subject</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                  <th className="text-center py-3 px-4 font-medium">Date</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => (
                  <tr
                    key={q._id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition"
                  >
                    <td className="py-3 px-4 text-white font-medium truncate max-w-[120px]">
                      {q.name}
                    </td>
                    <td className="py-3 px-4 text-gray-400 truncate max-w-[160px]">
                      {q.subject}
                    </td>
                    <td className="py-3 px-4 text-gray-400 truncate max-w-[140px]">
                      {q.email}
                    </td>
                    <td className="py-3 px-4 text-center">{statusBadge(q.status)}</td>
                    <td className="py-3 px-4 text-center text-gray-500">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedQuery(q)}
                          title="View details"
                          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setReplyQuery(q)}
                          title="Reply"
                          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-purple-400 transition"
                        >
                          <Mail size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedQuery && (
        <DetailModal
          query={selectedQuery}
          onClose={() => setSelectedQuery(null)}
        />
      )}
      {replyQuery && (
        <ReplyModal
          query={replyQuery}
          onClose={() => setReplyQuery(null)}
          onUpdated={fetchQueries}
        />
      )}
      </div>
    </div>
  );
};

export default ContactQueries;
