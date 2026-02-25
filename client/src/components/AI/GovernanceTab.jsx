import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, ShieldCheck, ShieldAlert, Lock, Eye, FileText, Clock,
  CheckCircle, AlertTriangle, Database, RefreshCw, Trash2, Activity,
  Server, KeyRound, ScrollText, UserCheck, Hash, Info
} from 'lucide-react';
import { getGovernanceReport, getAuditLogs, getAuditSummary } from '../../services/cardioApi';

/* ── tiny pill ── */
const StatusPill = ({ ok, yes = 'Enabled', no = 'Disabled' }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
    {ok ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
    {ok ? yes : no}
  </span>
);

const GovernanceTab = () => {
  const [report, setReport] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditSummary, setAuditSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logView, setLogView] = useState('summary'); // summary | logs

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true); setError(null);
    try {
      const [gov, logs, summary] = await Promise.allSettled([
        getGovernanceReport(),
        getAuditLogs(50),
        getAuditSummary(),
      ]);
      if (gov.status === 'fulfilled') setReport(gov.value);
      if (logs.status === 'fulfilled') setAuditLogs(logs.value?.logs || logs.value || []);
      if (summary.status === 'fulfilled') setAuditSummary(summary.value);
      if (gov.status === 'rejected') throw gov.reason;
    } catch (e) {
      setError('Could not load governance data. Ensure the AI backend is running.');
    } finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#8B7FCF] border-t-transparent mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading governance report…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 rounded-2xl p-8 text-center">
      <ShieldAlert className="w-14 h-14 text-red-400 mx-auto mb-4" />
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={loadAll} className="px-5 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition font-medium">Retry</button>
    </div>
  );

  const gdpr = report?.compliance?.gdpr || {};
  const hipaa = report?.compliance?.hipaa_style || {};
  const liability = report?.liability || {};
  const privacy = report?.privacy_features || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

      {/* ─── Hero Banner ─── */}
      <div className="bg-gradient-to-r from-[#8B7FCF] to-[#6B5B9A] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-white/20 rounded-xl"><Shield className="w-8 h-8" /></div>
          <div>
            <h2 className="text-2xl font-bold mb-1">Governance &amp; Compliance</h2>
            <p className="text-white/80 text-sm">GDPR &amp; HIPAA-aligned privacy, audit trail, consent management, and liability safeguards</p>
            <div className="flex gap-3 mt-3">
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">Model v{report?.model_version || '—'}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">Retention {gdpr.log_retention_days || 90} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── GDPR & HIPAA Cards ─── */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* GDPR */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-[#4A3B5C] mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-[#8B7FCF]" />GDPR Compliance</h3>
          <div className="space-y-3">
            {[
              { k: 'data_minimization',  label: 'Data Minimization',  icon: Database,  desc: 'Only medically relevant fields are retained' },
              { k: 'right_to_deletion',  label: 'Right to Deletion',  icon: Trash2,    desc: 'Users can request full data erasure' },
              { k: 'consent_required',   label: 'Consent Required',   icon: UserCheck,  desc: 'Explicit consent validated before every prediction' },
              { k: 'no_pii_in_logs',     label: 'No PII in Logs',     icon: Hash,       desc: 'Inputs hashed (SHA-256) — no identifiers stored' },
            ].map(item => (
              <div key={item.k} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <item.icon className="w-5 h-5 text-[#8B7FCF] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                    <StatusPill ok={gdpr[item.k]} />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
              <Clock className="w-5 h-5 text-[#8B7FCF] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Log Retention Period</span>
                  <span className="text-xs font-bold text-[#8B7FCF] bg-purple-100 px-2.5 py-1 rounded-full">{gdpr.log_retention_days || 90} days</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Audit logs are automatically purged after retention window</p>
              </div>
            </div>
          </div>
        </div>

        {/* HIPAA */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-[#4A3B5C] mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#8B7FCF]" />HIPAA-Style Safeguards</h3>
          <div className="space-y-3">
            {[
              { k: 'https_required',     label: 'HTTPS / TLS Required',  icon: Lock,       desc: 'All traffic encrypted in transit' },
              { k: 'encrypted_logging',  label: 'Encrypted Logging',     icon: KeyRound,   desc: 'Audit entries cryptographically secured' },
              { k: 'role_based_access',  label: 'Role-Based Access',     icon: UserCheck,   desc: 'Admin, clinician, and patient roles enforced' },
              { k: 'audit_trail',        label: 'Full Audit Trail',      icon: ScrollText,  desc: 'Every prediction and action is logged with timestamp' },
            ].map(item => (
              <div key={item.k} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <item.icon className="w-5 h-5 text-[#8B7FCF] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                    <StatusPill ok={hipaa[item.k]} />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Liability & Disclaimers ─── */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#4A3B5C] mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-[#8B7FCF]" />Liability &amp; Disclaimers</h3>
        <div className="grid sm:grid-cols-3 gap-4 mb-5">
          {[
            { k: 'disclaimer_shown',      label: 'Disclaimer Displayed',         desc: 'Mandatory disclaimer shown on every result' },
            { k: 'high_risk_escalation',   label: 'High-Risk Escalation',         desc: 'Urgent alert for risk >70%' },
            { k: 'model_version_tracked',  label: 'Model Version Tracked',        desc: 'Every prediction tagged with model version' },
          ].map(item => (
            <div key={item.k} className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
              <StatusPill ok={liability[item.k]} />
              <p className="text-sm font-semibold text-gray-700 mt-2">{item.label}</p>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span><strong>Mandatory Disclaimer:</strong> "This is a cardiovascular risk estimation tool. It is not a medical diagnosis. Results should be interpreted by a qualified healthcare professional. Do not make medical decisions solely based on this tool's output."</span>
          </p>
        </div>
      </div>

      {/* ─── Privacy Features ─── */}
      {privacy.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-[#4A3B5C] mb-4 flex items-center gap-2"><Eye className="w-5 h-5 text-[#8B7FCF]" />Privacy Features</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {privacy.map((feat, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-green-800">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Audit Trail Section ─── */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#4A3B5C] flex items-center gap-2"><Activity className="w-5 h-5 text-[#8B7FCF]" />Audit Trail</h3>
          <div className="flex gap-2">
            {['summary', 'logs'].map(v => (
              <button key={v} onClick={() => setLogView(v)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${logView === v ? 'bg-[#8B7FCF] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {v === 'summary' ? 'Summary' : 'Recent Logs'}
              </button>
            ))}
            <button onClick={loadAll} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition"><RefreshCw className="w-4 h-4 text-gray-500" /></button>
          </div>
        </div>

        {logView === 'summary' && auditSummary && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
              <div className="p-4 bg-purple-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-[#8B7FCF]">{auditSummary.total_logs ?? 0}</p>
                <p className="text-xs text-gray-500 mt-1">Total Events</p>
              </div>
              {auditSummary.risk_distribution && Object.entries(auditSummary.risk_distribution).filter(([,v]) => v > 0).map(([k, v]) => (
                <div key={k} className={`p-4 rounded-xl text-center ${k === 'High' || k === 'Very High' ? 'bg-red-50' : k === 'Moderate' ? 'bg-amber-50' : 'bg-green-50'}`}>
                  <p className={`text-2xl font-bold ${k === 'High' || k === 'Very High' ? 'text-red-600' : k === 'Moderate' ? 'text-amber-600' : 'text-green-600'}`}>{v}</p>
                  <p className="text-xs text-gray-500 mt-1">{k} Risk</p>
                </div>
              ))}
            </div>
            {auditSummary.event_types && Object.keys(auditSummary.event_types).length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Event Types</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(auditSummary.event_types).map(([type, count]) => (
                    <span key={type} className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                      {type.replace(/_/g, ' ')} <strong className="text-[#8B7FCF]">{count}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {auditSummary.total_logs === 0 && <p className="text-sm text-gray-400 text-center py-8">No audit events recorded yet. Run a prediction to generate logs.</p>}
          </div>
        )}

        {logView === 'logs' && (
          <div className="max-h-96 overflow-y-auto space-y-2 custom-scrollbar">
            {auditLogs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No logs yet.</p>
            ) : auditLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 text-sm">
                <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                  log.risk_category === 'High' || log.risk_category === 'Very High' ? 'bg-red-500' :
                  log.risk_category === 'Moderate' ? 'bg-amber-500' : 'bg-green-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700 capitalize">{(log.event_type || log.action || '').replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-gray-400">{log.timestamp || ''}</span>
                  </div>
                  {log.risk_score != null && <span className="text-xs text-gray-500">Risk: {(log.risk_score * 100).toFixed(1)}% — {log.risk_category}</span>}
                  {log.model_version && <span className="text-[10px] text-gray-400 ml-2">v{log.model_version}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Bottom Info ─── */}
      <div className="bg-gradient-to-r from-[#8B7FCF] to-[#6B5B9A] rounded-2xl p-6 text-white">
        <Shield className="w-8 h-8 mb-3" />
        <h4 className="font-semibold mb-2">About This Governance Layer</h4>
        <p className="text-white/90 text-sm leading-relaxed">
          CardioShield AI implements a full ethical AI governance pipeline. Patient data is anonymised and hashed
          before logging. Consent is validated on every prediction. All actions are recorded in a tamper-aware audit
          trail with configurable retention. The system is designed to align with <strong>GDPR</strong> data-minimization
          requirements and <strong>HIPAA</strong> security safeguards, including role-based access, encrypted transport,
          and mandatory clinical disclaimers.
        </p>
      </div>
    </motion.div>
  );
};

export default GovernanceTab;
