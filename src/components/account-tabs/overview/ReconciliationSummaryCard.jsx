import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { ShieldCheck, Users, Calendar, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/format";

export default function ReconciliationSummaryCard({ intel, onViewEvidence }) {
  const rec = intel.reconciliation;
  if (!rec) return null;
  const health = rec.evidence_health || {};
  const stats = rec.source_stats || {};
  const criticalGap = (rec.research_gaps || [])[0];

  return (
    <SectionCard
      title="Evidence Reconciliation"
      subtitle="Cross-source validated intelligence"
      action={
        <button onClick={onViewEvidence} className="text-xs font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap">
          VIEW EVIDENCE →
        </button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className={`text-2xl font-bold ${healthColor(health.overall)}`}>{health.overall ?? "—"}</div>
          <div className="text-[10px] text-slate-400 uppercase mt-0.5">Evidence Health</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-800">{stats.independent_sources ?? "—"}</div>
          <div className="text-[10px] text-slate-400 uppercase mt-0.5">Independent Sources</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold text-slate-800 pt-1.5">{rec.latest_evidence_date ? formatDate(rec.latest_evidence_date) : "—"}</div>
          <div className="text-[10px] text-slate-400 uppercase mt-0.5">Latest Evidence</div>
        </div>
        <div className="text-center">
          <div className={`text-sm font-semibold pt-1.5 ${criticalGap ? "text-rose-600" : "text-emerald-600"}`}>
            {criticalGap ? criticalGap.priority : "None"}
          </div>
          <div className="text-[10px] text-slate-400 uppercase mt-0.5">Critical Gap</div>
        </div>
      </div>

      {rec.accuracy_principle && (
        <div className={`mt-3 p-2.5 rounded-lg text-xs flex items-start gap-2 ${accuracyStyle(rec.accuracy_principle)}`}>
          <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{rec.accuracy_principle}</span>
        </div>
      )}

      {criticalGap && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-800">{criticalGap.gap}</div>
              <div className="text-xs text-slate-500 mt-0.5">{criticalGap.why_it_matters}</div>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function healthColor(v) {
  if (v == null) return "text-slate-400";
  if (v >= 70) return "text-emerald-600";
  if (v >= 45) return "text-amber-600";
  return "text-rose-600";
}
function accuracyStyle(text) {
  if (!text) return "bg-slate-50 text-slate-600";
  if (text.startsWith("SUFFICIENT")) return "bg-emerald-50 text-emerald-700";
  if (text.startsWith("INSUFFICIENT")) return "bg-rose-50 text-rose-700";
  return "bg-amber-50 text-amber-700";
}