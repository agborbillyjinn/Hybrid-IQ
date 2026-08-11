import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { formatCurrency } from "@/lib/format";
import { erpConfidenceStyle } from "@/lib/erpData";

export default function HybridScenarios({ scenarios }) {
  const list = scenarios || [];
  return (
    <SectionCard title="Hybrid AI-Enabled Scenarios" subtitle="Account-specific reduction based on AI compressibility — never exceeding 70%">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {list.map((sc, i) => {
          const cs = erpConfidenceStyle(sc.confidence);
          return (
            <div key={i} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">{sc.name}</h4>
                <span className="text-lg font-semibold text-emerald-600">{sc.reduction_pct}%</span>
              </div>
              {sc.reduction_range && <div className="text-[11px] text-slate-400">range {sc.reduction_range}</div>}
              <div className="mt-3 space-y-1.5 text-sm">
                <Row label="AI Cost (exp)" value={formatCurrency(sc.cost?.expected)} />
                <Row label="Cost range" value={sc.cost ? `${formatCurrency(sc.cost.low)}–${formatCurrency(sc.cost.high)}` : "—"} muted />
                <Row label="Direct Saving" value={formatCurrency(sc.saving)} accent="text-emerald-600" />
                <Row label="Duration (exp)" value={sc.duration?.expected != null ? sc.duration.expected + " mo" : "—"} />
                <Row label="Months Saved" value={sc.months_saved != null ? sc.months_saved + " mo" : "—"} accent="text-indigo-600" />
                <Row label="Timeline Reduction" value={sc.timeline_reduction_pct != null ? sc.timeline_reduction_pct + "%" : "—"} />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-500">Confidence</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${cs.bg} ${cs.color}`}>{sc.confidence || "—"}</span>
                </div>
              </div>
              {sc.rationale && <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100">{sc.rationale}</p>}
            </div>
          );
        })}
        {list.length === 0 && <p className="text-sm text-slate-400 col-span-3">No scenarios generated.</p>}
      </div>
    </SectionCard>
  );
}
function Row({ label, value, accent, muted }) {
  return <div className="flex items-center justify-between"><span className="text-slate-500">{label}</span><span className={`font-medium ${accent || (muted ? "text-slate-400 text-xs" : "text-slate-800")}`}>{value || "—"}</span></div>;
}