import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function EvidenceConflicts({ conflicts }) {
  if (!conflicts || !conflicts.length) {
    return (
      <SectionCard title="Evidence Conflicts" subtitle="Contradictions between evidence sources — resolved by the inference engine">
        <div className="flex items-center gap-2 text-sm text-emerald-600 py-2">
          <AlertTriangle className="w-4 h-4" /> No conflicting evidence detected — sources corroborate each other.
        </div>
      </SectionCard>
    );
  }
  return (
    <SectionCard title="Evidence Conflicts" subtitle="Contradictions between evidence sources — historical evidence retained, not overwritten">
      <div className="space-y-3">
        {conflicts.map((c, i) => (
          <div key={i} className="p-4 rounded-lg border border-amber-200 bg-amber-50/50">
            <p className="text-sm font-medium text-slate-800">{c.description}</p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-md bg-white border border-slate-200">
                <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Evidence A</div>
                <p className="text-xs text-slate-600">{c.evidence_a}</p>
              </div>
              <div className="p-3 rounded-md bg-white border border-slate-200">
                <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Evidence B</div>
                <p className="text-xs text-slate-600">{c.evidence_b}</p>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-2">
              <ArrowRight className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Resolution · {c.confidence || 50}% confidence</span>
                <p className="text-sm text-slate-700">{c.resolution}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}