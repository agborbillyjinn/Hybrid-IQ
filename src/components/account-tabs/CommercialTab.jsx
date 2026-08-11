import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { formatCurrency } from "@/lib/format";
import { Info } from "lucide-react";

export default function CommercialTab({ intel }) {
  const cm = intel.commercial_model || {};
  const trad = cm.traditional || {};
  const scenarios = cm.ai_scenarios || [];
  const workstreams = cm.workstreams || [];
  const cod = cm.cost_of_delay || {};
  const asx = cm.assumptions || {};

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>Illustrative pre-discovery planning estimates, not quotations from Hybrid Solutions AI.</strong> Requires validation. Hybrid references potential reductions of <em>up to 70%</em> — never a guaranteed figure.
        </p>
      </div>

      <SectionCard title="Assumptions">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Assumption label="Employees" value={asx.employees} />
          <Assumption label="ERP Users" value={asx.erp_users} />
          <Assumption label="Countries" value={asx.countries} />
          <Assumption label="Entities" value={asx.entities} />
          <Assumption label="Sites" value={asx.sites} />
          <Assumption label="Modules" value={asx.modules} />
          <Assumption label="Integrations" value={asx.integrations} />
          <Assumption label="Customisations" value={asx.customisations} />
          <Assumption label="ERP Age (yrs)" value={asx.erp_age} />
          <Assumption label="Team Size" value={asx.team_size} />
          <Assumption label="Migration Type" value={asx.migration_type} text />
          <Assumption label="Target ERP" value={asx.target_erp} text />
        </div>
      </SectionCard>

      <SectionCard title="Traditional Implementation Estimate">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase mb-2">Cost (GBP)</div>
            <EstimateRow label="Low" value={trad.cost_low} />
            <EstimateRow label="Expected" value={trad.cost_expected} highlight />
            <EstimateRow label="High" value={trad.cost_high} />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase mb-2">Duration (months)</div>
            <EstimateRow label="Low" value={trad.duration_low} suffix=" mo" />
            <EstimateRow label="Expected" value={trad.duration_expected} highlight suffix=" mo" />
            <EstimateRow label="High" value={trad.duration_high} suffix=" mo" />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Hybrid AI-Enabled Scenarios" subtitle="Reduction is adjusted by AI-compressible workload — not a fixed 70%">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((sc, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">{sc.name}</h4>
                <span className="text-lg font-semibold text-emerald-600">{sc.reduction_pct}%</span>
              </div>
              <div className="mt-3 space-y-1.5 text-sm">
                <Row label="AI-Enabled Cost" value={formatCurrency(sc.cost)} />
                <Row label="Direct Saving" value={formatCurrency(sc.saving)} accent="text-emerald-600" />
                <Row label="% Saving" value={sc.pct_saving ? sc.pct_saving + "%" : "—"} />
                <Row label="Timeline" value={sc.timeline ? sc.timeline + " mo" : "—"} />
                <Row label="Months Saved" value={sc.months_saved ? sc.months_saved + " mo" : "—"} accent="text-indigo-600" />
                <Row label="% Faster" value={sc.pct_faster ? sc.pct_faster + "%" : "—"} />
                <Row label="Confidence" value={sc.confidence} />
              </div>
              {(sc.assumptions || []).length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="text-[11px] text-slate-400 uppercase mb-1">Assumptions</div>
                  <ul className="space-y-0.5">{sc.assumptions.map((a, j) => <li key={j} className="text-[11px] text-slate-500">• {a}</li>)}</ul>
                </div>
              )}
            </div>
          ))}
          {scenarios.length === 0 && <p className="text-sm text-slate-400">No scenarios generated.</p>}
        </div>
      </SectionCard>

      <SectionCard title="Workstream Cost Model" subtitle="AI compressibility per workstream — change management and governance remain human-led">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] text-slate-400 uppercase border-b border-slate-100">
                <th className="py-2 font-medium">Workstream</th>
                <th className="py-2 font-medium text-right">Trad. Cost</th>
                <th className="py-2 font-medium text-right">Trad. Duration</th>
                <th className="py-2 font-medium text-right">AI Compress.</th>
                <th className="py-2 font-medium text-right">AI Cost</th>
                <th className="py-2 font-medium text-right">AI Duration</th>
                <th className="py-2 font-medium text-right">Saving</th>
              </tr>
            </thead>
            <tbody>
              {workstreams.map((w, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td className="py-2.5 font-medium text-slate-700">{w.name}</td>
                  <td className="py-2.5 text-right text-slate-600">{formatCurrency(w.traditional_cost)}</td>
                  <td className="py-2.5 text-right text-slate-600">{w.traditional_duration ? w.traditional_duration + " mo" : "—"}</td>
                  <td className="py-2.5 text-right">
                    <span className={`px-1.5 py-0.5 rounded text-[11px] ${compressColor(w.ai_compressibility)}`}>{w.ai_compressibility ?? "—"}%</span>
                  </td>
                  <td className="py-2.5 text-right text-slate-600">{formatCurrency(w.ai_cost)}</td>
                  <td className="py-2.5 text-right text-slate-600">{w.ai_duration ? w.ai_duration + " mo" : "—"}</td>
                  <td className="py-2.5 text-right font-medium text-emerald-600">{formatCurrency(w.saving)}</td>
                </tr>
              ))}
              {workstreams.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-slate-400">No workstream model.</td></tr>}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="Cost of Delay" subtitle="Optional scenario estimate — scenario figures only">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Metric label="Value / Month" value={formatCurrency(cod.value_per_month)} />
          <Metric label="Months Accelerated" value={cod.months_accelerated ? cod.months_accelerated + " mo" : "—"} />
          <Metric label="Accelerated Business Value" value={formatCurrency(cod.accelerated_business_value)} />
          <Metric label="Direct Implementation Saving" value={formatCurrency(cod.direct_implementation_saving)} />
          <Metric label="Combined Economic Impact" value={formatCurrency(cod.total_economic_impact)} highlight />
        </div>
      </SectionCard>
    </div>
  );
}

function compressColor(v) {
  const n = Number(v) || 0;
  if (n >= 60) return "bg-emerald-50 text-emerald-600";
  if (n >= 30) return "bg-amber-50 text-amber-600";
  return "bg-slate-50 text-slate-500";
}
function Assumption({ label, value, text }) {
  return (
    <div>
      <div className="text-[11px] text-slate-400 uppercase">{label}</div>
      <div className="text-sm font-medium text-slate-800 mt-0.5">{value != null ? value : "—"}</div>
    </div>
  );
}
function EstimateRow({ label, value, highlight, suffix }) {
  return (
    <div className={`flex items-center justify-between py-2 border-b border-slate-50 ${highlight ? "bg-indigo-50/50 -mx-2 px-2 rounded" : ""}`}>
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-indigo-700" : "text-slate-800"}`}>{value != null ? formatCurrency(value) + (suffix || "") : "—"}</span>
    </div>
  );
}
function Row({ label, value, accent }) {
  return <div className="flex items-center justify-between"><span className="text-slate-500">{label}</span><span className={`font-medium ${accent || "text-slate-800"}`}>{value || "—"}</span></div>;
}
function Metric({ label, value, highlight }) {
  return (
    <div className={`rounded-lg p-4 ${highlight ? "bg-emerald-50 border border-emerald-200" : "bg-slate-50 border border-slate-100"}`}>
      <div className="text-[11px] text-slate-400 uppercase">{label}</div>
      <div className={`text-lg font-semibold mt-1 ${highlight ? "text-emerald-700" : "text-slate-800"}`}>{value}</div>
    </div>
  );
}