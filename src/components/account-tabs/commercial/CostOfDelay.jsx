import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { formatCurrency } from "@/lib/format";

export default function CostOfDelay({ cod }) {
  const c = cod || {};
  return (
    <SectionCard title="Cost of Delay" subtitle="Optional scenario estimate — not guaranteed customer ROI">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
        <Metric label="Annual Transformation Benefit" value={formatCurrency(c.annual_transformation_benefit)} />
        <Metric label="Annual Operating Cost Saving" value={formatCurrency(c.annual_operating_cost_saving)} />
        <Metric label="Expected Revenue Uplift" value={formatCurrency(c.expected_revenue_uplift)} />
        <Metric label="Monthly Manual-Process Cost" value={formatCurrency(c.monthly_manual_process_cost)} />
        <Metric label="Risk Reduction Value" value={formatCurrency(c.risk_reduction_value)} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric label="Monthly Value of Transformation" value={formatCurrency(c.monthly_value_of_transformation)} />
        <Metric label="Months Saved" value={c.months_saved != null ? c.months_saved + " mo" : "—"} />
        <Metric label="Accelerated Benefit" value={formatCurrency(c.accelerated_benefit)} accent="text-indigo-600" />
        <Metric label="Direct Implementation Saving" value={formatCurrency(c.direct_implementation_saving)} accent="text-emerald-600" />
      </div>
      <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
        <div className="text-[11px] text-emerald-600 uppercase font-semibold">Combined Economic Impact</div>
        <div className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(c.combined_economic_impact)}</div>
        <p className="text-xs text-emerald-600 mt-1">Scenario estimate — not guaranteed customer ROI.</p>
      </div>
    </SectionCard>
  );
}

function Metric({ label, value, accent }) {
  return (
    <div className="rounded-lg p-3 bg-slate-50 border border-slate-100">
      <div className="text-[10px] text-slate-400 uppercase">{label}</div>
      <div className={`text-base font-semibold mt-1 ${accent || "text-slate-800"}`}>{value}</div>
    </div>
  );
}