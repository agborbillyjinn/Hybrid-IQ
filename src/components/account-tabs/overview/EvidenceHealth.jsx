import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { evidenceHealth } from "./deriveOverview";
import { CheckCircle2, AlertTriangle } from "lucide-react";

export default function EvidenceHealth({ intel }) {
  const h = evidenceHealth(intel);
  const tone =
    h.health >= 70
      ? { color: "text-emerald-600", bar: "stroke-emerald-500", label: "Strong" }
      : h.health >= 40
      ? { color: "text-amber-600", bar: "stroke-amber-500", label: "Moderate" }
      : { color: "text-rose-600", bar: "stroke-rose-500", label: "Weak" };
  const circ = 2 * Math.PI * 42;
  const offset = circ - (h.health / 100) * circ;

  return (
    <SectionCard title="Account Evidence Health" subtitle="How much of the strategy is supported vs hypothesised">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100" />
            <circle
              cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={offset}
              className={`${tone.bar} transition-all duration-700`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-semibold ${tone.color}`}>{h.health}</span>
          </div>
        </div>
        <div className="flex-1">
          <div className={`text-sm font-semibold ${tone.color}`}>{tone.label}</div>
          <div className="text-xs text-slate-400 mt-0.5">
            {h.count} evidence records · {h.avgConf}% avg confidence · {h.coveragePct}% coverage
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 uppercase mb-1.5">
            <CheckCircle2 className="w-3 h-3" />Strong
          </div>
          <div className="flex flex-wrap gap-1.5">
            {h.strong.length
              ? h.strong.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100">{s}</span>
                ))
              : <span className="text-xs text-slate-400">—</span>}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1 text-[10px] font-semibold text-rose-500 uppercase mb-1.5">
            <AlertTriangle className="w-3 h-3" />Weak
          </div>
          <div className="flex flex-wrap gap-1.5">
            {h.weak.length
              ? h.weak.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded text-[11px] bg-rose-50 text-rose-600 border border-rose-100">{s}</span>
                ))
              : <span className="text-xs text-slate-400">—</span>}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}