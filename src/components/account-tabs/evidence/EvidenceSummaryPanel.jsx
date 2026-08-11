import React, { useEffect, useState } from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { base44 } from "@/api/base44Client";
import { ShieldCheck, Users, Calendar, AlertTriangle, Lightbulb, GitBranch, Activity, Layers } from "lucide-react";

export default function EvidenceSummaryPanel({ reconciliation, clusters }) {
  if (!reconciliation) return <p className="text-sm text-slate-400">No reconciliation data available.</p>;
  const health = reconciliation.evidence_health || {};
  const stats = reconciliation.source_stats || {};

  return (
    <div className="space-y-5">
      {/* Evidence Health + Source Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
          <div className="text-xs font-medium text-slate-400 uppercase mb-2">Overall Evidence Health</div>
          <div className={`text-4xl font-bold ${healthColor(health.overall)}`}>{health.overall ?? "—"}</div>
          <div className="text-xs text-slate-400 mt-1">/ 100</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-xs font-medium text-slate-400 uppercase mb-3">Source Independence</div>
          <div className="grid grid-cols-2 gap-3">
            <Stat icon={Layers} label="Total Sources" value={stats.total_sources} />
            <Stat icon={Users} label="Independent" value={stats.independent_sources} />
            <Stat icon={GitBranch} label="Duplicate Groups" value={stats.duplicate_groups} />
            <Stat icon={Calendar} label="Latest Evidence" value={reconciliation.latest_evidence_date ? formatDateShort(reconciliation.latest_evidence_date) : "—"} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-xs font-medium text-slate-400 uppercase mb-3">Evidence Dimensions</div>
          <div className="space-y-1.5">
            <DimBar label="ERP Evidence" value={health.erp_evidence} />
            <DimBar label="Hiring Evidence" value={health.hiring_evidence} />
            <DimBar label="Transformation" value={health.transformation_evidence} />
            <DimBar label="Company Data" value={health.company_data} />
            <DimBar label="Commercial" value={health.commercial_assumption} />
            <DimBar label="Buying Committee" value={health.buying_committee} />
          </div>
        </div>
      </div>

      {/* Accuracy Principle */}
      <div className={`rounded-xl border p-4 flex items-start gap-3 ${accuracyStyle(reconciliation.accuracy_principle)}`}>
        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
        <p className="text-sm leading-relaxed">{reconciliation.accuracy_principle}</p>
      </div>

      {/* Cluster Summary Grid */}
      <SectionCard title="Conclusion Reconciliation" subtitle="Every major conclusion validated across independent sources">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {clusters.map((c, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-500 uppercase">{c.label}</span>
                <StatusBadge status={c.status} />
              </div>
              <div className="text-sm font-semibold text-slate-900">{c.value || "—"}</div>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{c.confidence}%</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.independent_sources} indep.</span>
                {c.conflicting_count > 0 && <span className="flex items-center gap-1 text-amber-600"><AlertTriangle className="w-3 h-3" />{c.conflicting_count} conflict</span>}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-slate-400" />
      <div>
        <div className="text-[10px] text-slate-400 uppercase">{label}</div>
        <div className="text-sm font-semibold text-slate-800">{value}</div>
      </div>
    </div>
  );
}

function DimBar({ label, value }) {
  const v = value || 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${barColor(v)}`} style={{ width: `${v}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-600 w-8 text-right">{v}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "HIGHLY LIKELY": "bg-blue-50 text-blue-700 border-blue-200",
    INFERRED: "bg-amber-50 text-amber-700 border-amber-200",
    MIXED: "bg-orange-50 text-orange-700 border-orange-200",
    UNKNOWN: "bg-slate-100 text-slate-500 border-slate-200",
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${styles[status] || styles.UNKNOWN}`}>{status}</span>;
}

function healthColor(v) {
  if (v >= 70) return "text-emerald-600";
  if (v >= 45) return "text-amber-600";
  return "text-rose-600";
}
function barColor(v) {
  if (v >= 70) return "bg-emerald-500";
  if (v >= 45) return "bg-amber-500";
  return "bg-rose-500";
}
function accuracyStyle(text) {
  if (!text) return "bg-slate-50 border-slate-200 text-slate-600";
  if (text.startsWith("SUFFICIENT")) return "bg-emerald-50 border-emerald-200 text-emerald-700";
  if (text.startsWith("INSUFFICIENT")) return "bg-rose-50 border-rose-200 text-rose-700";
  return "bg-amber-50 border-amber-200 text-amber-700";
}
function formatDateShort(d) {
  try { return new Date(d).toLocaleDateString("en-GB", { month: "short", year: "numeric" }); } catch { return d; }
}