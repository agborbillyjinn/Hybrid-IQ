import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { ConfidenceBadge } from "@/components/intelligence/Badges";

export default function ProgrammeStageInference({ hi }) {
  return (
    <SectionCard title="Programme Stage Inference" subtitle="Inferred from the mix of ERP roles">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-lg font-semibold text-slate-900">{hi.likely_programme_stage}</div>
        <ConfidenceBadge value={hi.programme_stage_confidence === "HIGH" ? "HIGHLY LIKELY" : hi.programme_stage_confidence === "MEDIUM" ? "HIGHLY LIKELY" : "INFERRED"} />
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{hi.programme_stage_reasoning}</p>
      <div className="mt-4">
        <div className="text-[10px] font-medium text-slate-400 uppercase mb-2">Role Classification</div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(hi.classification_counts || {}).map(([k, v]) => (
            <span key={k} className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200">{k}: {v}</span>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}