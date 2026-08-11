import React from "react";
import ScoreGauge from "@/components/intelligence/ScoreGauge";
import { scoreExplanation } from "./deriveOverview";

export default function ScoreExplanations({ scores }) {
  const items = [
    { label: "Transformation Probability", value: scores.transformation_probability?.value, subtitle: "Likelihood of ERP transformation", score: scores.transformation_probability },
    { label: "Hybrid Fit", value: scores.hybrid_fit?.value, type: "fit", subtitle: "Current BC offering suitability", score: scores.hybrid_fit },
    { label: "Future Enterprise Fit", value: scores.future_enterprise_fit?.value, type: "fit", subtitle: "SAP / Oracle / NetSuite / F&O", score: scores.future_enterprise_fit },
    { label: "Migration Complexity", value: scores.migration_complexity?.value, subtitle: "Difficulty of transformation", score: scores.migration_complexity },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((it) => (
        <div key={it.label} className="flex flex-col items-center">
          <ScoreGauge label={it.label} value={it.value} type={it.type} subtitle={it.subtitle} />
          <div className="mt-3 w-full rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
            <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1">Reason</div>
            <p className="text-xs text-slate-600 leading-relaxed">{scoreExplanation(it.score)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}