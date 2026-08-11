import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { AlertTriangle } from "lucide-react";

export default function ConflictsPanel({ reconciliation }) {
  const conflicts = (reconciliation?.clusters || []).filter((c) => c.conflicting && c.conflicting.length > 0);
  if (conflicts.length === 0) {
    return (
      <SectionCard title="Evidence Conflicts" subtitle="Contradictory evidence across sources">
        <div className="flex items-center gap-2 text-sm text-emerald-600 py-4">
          <AlertTriangle className="w-4 h-4" /> No conflicting evidence detected. All conclusions are internally consistent.
        </div>
      </SectionCard>
    );
  }
  return (
    <div className="space-y-4">
      {conflicts.map((c, i) => (
        <SectionCard key={i} title={c.label} subtitle={`Status: ${c.status} · Confidence: ${c.confidence}%`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-emerald-600 uppercase mb-2">Supporting Evidence</div>
              <div className="space-y-2">
                {c.supporting.map((s, j) => <EvidenceItem key={j} ev={s} stance="supporting" />)}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-rose-600 uppercase mb-2">Conflicting Evidence</div>
              <div className="space-y-2">
                {c.conflicting.map((s, j) => <EvidenceItem key={j} ev={s} stance="conflicting" />)}
              </div>
            </div>
          </div>
          {c.interpretation && (
            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="text-xs font-medium text-amber-600 uppercase mb-1">Interpretation</div>
              <p className="text-sm text-amber-800">{c.interpretation}</p>
            </div>
          )}
        </SectionCard>
      ))}
    </div>
  );
}

function EvidenceItem({ ev, stance }) {
  const border = stance === "supporting" ? "border-emerald-100 bg-emerald-50/30" : "border-rose-100 bg-rose-50/30";
  return (
    <div className={`border rounded-lg p-2.5 ${border}`}>
      <div className="text-sm font-medium text-slate-800">{ev.finding}</div>
      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
        <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">{ev.source_category}</span>
        {ev.erp_product && <span>· {ev.erp_product}</span>}
        {ev.evidence_date && <span>· {ev.evidence_date}</span>}
      </div>
    </div>
  );
}