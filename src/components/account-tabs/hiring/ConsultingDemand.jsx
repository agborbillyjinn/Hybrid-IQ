import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { TrendingUp } from "lucide-react";

export default function ConsultingDemand({ hi }) {
  const tone =
    hi.consulting_demand_level === "VERY HIGH" ? "text-rose-600"
    : hi.consulting_demand_level === "HIGH" ? "text-orange-600"
    : hi.consulting_demand_level === "MEDIUM" ? "text-amber-600"
    : "text-emerald-600";
  return (
    <SectionCard title="Consulting Demand" subtitle="Specialist ERP delivery capacity likely required">
      <div className="flex items-center gap-4 mb-3">
        <div className="relative w-14 h-14 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100" />
            <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 42} strokeDashoffset={2 * Math.PI * 42 - (hi.consulting_demand_score / 100) * 2 * Math.PI * 42}
              className={tone.replace("text-", "stroke-")} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-semibold ${tone}`}>{hi.consulting_demand_score}</span>
          </div>
        </div>
        <div>
          <div className={`text-base font-semibold ${tone}`}>{hi.consulting_demand_level}</div>
          <div className="text-xs text-slate-400">Consulting Demand Score</div>
        </div>
      </div>
      <div className="text-[10px] font-medium text-slate-400 uppercase mb-1.5">Primary Reasons</div>
      <ul className="space-y-1">
        {(hi.consulting_demand_reasons || []).map((r, i) => (
          <li key={i} className="text-sm text-slate-700 flex items-start gap-2"><TrendingUp className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />{r}</li>
        ))}
      </ul>
    </SectionCard>
  );
}