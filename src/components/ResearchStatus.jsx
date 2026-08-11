import React from "react";
import { Check, Loader2, Circle } from "lucide-react";

export const STAGES = [
  { key: "researching_company", label: "Researching Company" },
  { key: "searching_erp_evidence", label: "Searching ERP Evidence" },
  { key: "building_erp_history", label: "Building ERP History" },
  { key: "detecting_signals", label: "Detecting Transformation Signals" },
  { key: "calculating_complexity", label: "Calculating Complexity" },
  { key: "modelling_cost", label: "Modelling Cost & Time" },
  { key: "mapping_committee", label: "Mapping Buying Committee" },
  { key: "creating_gtm", label: "Creating GTM Strategy" },
  { key: "searching_erp_vacancies", label: "Searching ERP Vacancies" },
  { key: "analysing_hiring_signals", label: "Analysing Hiring Signals" },
  { key: "inferring_programme_stage", label: "Inferring Programme Stage" },
  { key: "estimating_consulting_demand", label: "Estimating Consulting Demand" },
  { key: "validating_analysis", label: "Validating Analysis" },
  { key: "complete", label: "Analysis Complete" },
];

export default function ResearchStatus({ currentStage }) {
  const idx = STAGES.findIndex((s) => s.key === currentStage);
  return (
    <div className="space-y-0.5">
      {STAGES.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        const isComplete = s.key === "complete" && active;
        const icon = done || isComplete ? "done" : active ? "active" : "pending";
        return (
          <div key={s.key} className="flex items-center gap-3 py-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              done || isComplete ? "bg-emerald-100 text-emerald-600" : active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-300"
            }`}>
              {icon === "done" || isComplete ? <Check className="w-3.5 h-3.5" /> : icon === "active" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Circle className="w-3 h-3" />}
            </div>
            <span className={`text-sm ${done ? "text-slate-400" : active ? "text-slate-900 font-medium" : "text-slate-400"}`}>
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}