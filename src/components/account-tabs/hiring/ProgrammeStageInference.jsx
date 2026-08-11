import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { ConfidenceBadge } from "@/components/intelligence/Badges";

export default function ProgrammeStageInference({ hi }) {
  return (
    <SectionCard title="Programme Stage Inference" subtitle="Inferred from the mix of ERP roles">
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="text-lg font-semibold text-slate-900">{hi.likely_programme_stage}</div>
        <ConfidenceBadge value={hi.programme_stage_confidence === "HIGH" ? "HIGHLY LIKELY" : hi.programme_stage_confidence === "MEDIUM" ? "HIGHLY LIKELY" : "INFERRED"} />
        <span className="text-xs text-slate-400">{hi.programme_stage_evidence_count || 0} supporting role(s)</span>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{hi.programme_stage_reasoning}</p>

      {hi.programme_stage_supporting_roles?.length > 0 && (
        <div className="mt-3">
          <div className="text-[10px] font-medium text-slate-400 uppercase mb-1.5">Supporting Roles</div>
          <div className="flex flex-wrap gap-1.5">
            {hi.programme_stage_supporting_roles.slice(0, 10).map((r, i) => (
              <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100">
                {r.classification}: {r.job_title}
              </span>
            ))}
          </div>
        </div>
      )}

      {hi.programme_stage_conflicting_evidence?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="text-[10px] font-medium text-slate-400 uppercase mb-1.5">Conflicting Evidence</div>
          <div className="space-y-1">
            {hi.programme_stage_conflicting_evidence.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-600">{c.stage}</span>
                <span className="text-slate-400">vote weight: {c.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-slate-100">
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