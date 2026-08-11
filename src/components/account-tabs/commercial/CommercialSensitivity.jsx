import React, { useState, useMemo } from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { formatCurrency } from "@/lib/format";
import { recalculateCommercial, defaultSensitivityParams } from "@/lib/commercialSensitivity";
import { Sliders, RotateCcw, AlertTriangle } from "lucide-react";

const SLIDERS = [
  { key: "blended_day_rate", label: "Blended Consultant Day Rate", min: 500, max: 1500, step: 50, format: (v) => "£" + v },
  { key: "programme_duration", label: "Programme Duration (months)", min: 6, max: 36, step: 1, format: (v) => v + " mo" },
  { key: "erp_users", label: "ERP Users", min: 100, max: 20000, step: 100, format: (v) => v.toLocaleString() },
  { key: "integrations", label: "Number of Integrations", min: 0, max: 50, step: 1, format: (v) => v },
  { key: "legal_entities", label: "Number of Legal Entities", min: 1, max: 20, step: 1, format: (v) => v },
  { key: "countries", label: "Number of Countries", min: 1, max: 20, step: 1, format: (v) => v },
  { key: "customisation_complexity", label: "Customisation Complexity", min: 0, max: 100, step: 5, format: (v) => v + "/100" },
  { key: "data_complexity", label: "Data Complexity", min: 0, max: 100, step: 5, format: (v) => v + "/100" },
  { key: "ai_efficiency", label: "AI Efficiency Assumption", min: 0, max: 100, step: 5, format: (v) => v + "%" },
];

export default function CommercialSensitivity({ intel }) {
  const [params, setParams] = useState(() => defaultSensitivityParams(intel));
  const result = useMemo(() => recalculateCommercial(intel, params), [intel, params]);

  const update = (key, value) => setParams((p) => ({ ...p, [key]: value }));
  const reset = () => setParams(defaultSensitivityParams(intel));

  return (
    <SectionCard title="Commercial Sensitivity" subtitle="Adjust assumptions to recalculate scenarios — maximum AI reduction capped at 70%" action={
      <button onClick={reset} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Reset</button>
    }>
      <div className="space-y-5">
        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          {SLIDERS.map((s) => (
            <div key={s.key}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-600 flex items-center gap-1"><Sliders className="w-3 h-3 text-slate-400" />{s.label}</label>
                <span className="text-xs font-semibold text-slate-900">{s.format(params[s.key])}</span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={params[s.key]}
                onChange={(e) => update(s.key, Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          ))}
        </div>

        {/* Cap warning */}
        {result.capped && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">{result.cap_applied}. Reductions above this threshold are not presented.</p>
          </div>
        )}

        {/* Scenarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {result.scenarios.map((sc, i) => (
            <div key={i} className={`border rounded-lg p-4 ${sc.name === "EXPECTED" ? "border-indigo-300 bg-indigo-50/50" : "border-slate-200"}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase">{sc.label}</h4>
                <span className="text-lg font-bold text-emerald-600">{sc.reduction_pct}%</span>
              </div>
              <div className="space-y-1.5 text-sm">
                <Row label="AI Cost" value={formatCurrency(sc.ai_cost)} />
                <Row label="Saving" value={formatCurrency(sc.saving)} accent="text-emerald-600" />
                <Row label="Duration" value={sc.duration_months + " mo"} />
                <Row label="Months Saved" value={sc.months_saved + " mo"} accent="text-indigo-600" />
                <Row label="Days Avoided" value={sc.days_avoided?.toLocaleString()} />
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Metric label="Traditional Cost" value={formatCurrency(result.traditional_cost)} />
            <Metric label="AI-Enabled Cost" value={formatCurrency(result.ai_cost)} />
            <Metric label="Potential Saving" value={formatCurrency(result.saving)} accent="text-emerald-600" />
            <Metric label="Overall Reduction" value={result.overall_reduction_pct + "%"} accent="text-emerald-600" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3 pt-3 border-t border-slate-200">
            <Metric label="Traditional Days" value={result.traditional_total_days?.toLocaleString()} />
            <Metric label="AI-Enabled Days" value={result.ai_total_days?.toLocaleString()} />
            <Metric label="Days Avoided" value={result.days_avoided?.toLocaleString()} accent="text-emerald-600" />
            <Metric label="Blended Rate" value={"£" + result.blended_rate + "/day"} />
          </div>
        </div>

        <p className="text-[11px] text-slate-500">All figures are illustrative pre-discovery estimates. Maximum AI reduction is capped at {params.max_reduction}%. "Up to" never means guaranteed.</p>
      </div>
    </SectionCard>
  );
}

function Row({ label, value, accent }) {
  return <div className="flex items-center justify-between"><span className="text-slate-500">{label}</span><span className={`font-medium ${accent || "text-slate-800"}`}>{value || "—"}</span></div>;
}
function Metric({ label, value, accent }) {
  return <div><div className="text-[10px] text-slate-400 uppercase">{label}</div><div className={`text-sm font-semibold ${accent || "text-slate-800"}`}>{value || "—"}</div></div>;
}