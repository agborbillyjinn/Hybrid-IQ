import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { formatCurrency } from "@/lib/format";
import { Users, Calendar, Layers, Cpu, TrendingUp, Clock, Percent } from "lucide-react";

export default function CommercialExplainability({ intel }) {
  const cm = intel.commercial_model || {};
  const scores = intel.scores || {};
  const hiring = intel.hiring_intelligence || {};
  const erpEstate = intel.erp_estate || {};
  const co = intel.company_overview || {};
  const explanation = cm.explanation || {};
  const trad = cm.traditional || {};
  const scenarios = cm.hybrid_scenarios || [];
  const expected = scenarios.find((s) => s.name?.toLowerCase().includes("expected")) || scenarios[0] || {};
  const consulting = hiring.consulting_economics || {};
  const effort = hiring.effort_displacement || {};

  return (
    <SectionCard title="How HybridIQ Calculated This" subtitle="Every assumption behind the commercial model — transparent and auditable">
      <div className="space-y-5">
        {/* Assumptions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AssumptionGroup icon={Users} title="Company Assumptions">
            <Assumption label="Employees" value={co.employees ? co.employees.toLocaleString() : "—"} />
            <Assumption label="Revenue" value={formatCurrency(co.revenue)} />
            <Assumption label="Industry" value={co.industry || "—"} />
            <Assumption label="Ownership" value={co.ownership || "—"} />
          </AssumptionGroup>

          <AssumptionGroup icon={Layers} title="ERP Assumptions">
            <Assumption label="Current ERP" value={erpEstate.current_erp_product?.value || "—"} />
            <Assumption label="Target ERP" value={intel.target_erp?.next_erp || "—"} />
            <Assumption label="ERP Users" value={erpEstate.estimated_users?.value || "—"} />
            <Assumption label="Legal Entities" value={erpEstate.legal_entities?.value || "—"} />
          </AssumptionGroup>

          <AssumptionGroup icon={Cpu} title="Complexity Assumptions">
            <Assumption label="Migration Complexity" value={scores.migration_complexity?.value != null ? scores.migration_complexity.value + "/100" : "—"} />
            <Assumption label="Integrations" value={cm.complexity_inputs?.integrations || "—"} />
            <Assumption label="Countries" value={cm.complexity_inputs?.countries || "—"} />
            <Assumption label="Customisation" value={cm.complexity_inputs?.customisation || "—"} />
          </AssumptionGroup>

          <AssumptionGroup icon={Calendar} title="Programme Assumptions">
            <Assumption label="Duration (expected)" value={trad.duration?.expected != null ? trad.duration.expected + " mo" : "—"} />
            <Assumption label="Programme Stage" value={hiring.likely_programme_stage || "—"} />
            <Assumption label="Delivery Model" value={hiring.delivery_model?.hypothesis || "—"} />
          </AssumptionGroup>

          <AssumptionGroup icon={Users} title="Estimated Team Composition">
            {consulting.roles?.length > 0 ? (
              consulting.roles.slice(0, 5).map((r, i) => (
                <Assumption key={i} label={r.role} value={`${r.people} ppl · ${r.days}d`} />
              ))
            ) : <Assumption label="Team" value="—" />}
          </AssumptionGroup>

          <AssumptionGroup icon={Clock} title="Consultant Day Model">
            <Assumption label="Estimated Days" value={consulting.estimated_days?.toLocaleString() || "—"} />
            <Assumption label="Blended Rate" value={consulting.blended_day_rate ? "£" + consulting.blended_day_rate + "/day" : "—"} />
            <Assumption label="Consulting Cost" value={formatCurrency(consulting.estimated_consulting_cost?.expected)} />
          </AssumptionGroup>
        </div>

        {/* Effort Displacement Summary */}
        {effort.workstreams?.length > 0 && (
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h4 className="text-sm font-semibold text-slate-900">Consultant Day Reduction</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <Metric label="Traditional Days" value={effort.traditional_total_days?.toLocaleString()} />
              <Metric label="AI-Enabled Days" value={effort.ai_total_days?.toLocaleString()} />
              <Metric label="Days Avoided" value={effort.days_avoided?.toLocaleString()} accent="text-emerald-600" />
              <Metric label="Reduction" value={effort.traditional_total_days ? Math.round((effort.days_avoided / effort.traditional_total_days) * 100) + "%" : "—"} accent="text-emerald-600" />
            </div>
            <p className="text-[11px] text-slate-500 mt-3">Consultant-day reduction is effort displacement — not headcount elimination. Senior consulting judgement remains required on all workstreams.</p>
          </div>
        )}

        {/* Cost Reduction Breakdown */}
        {scenarios.length > 0 && (
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Percent className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-semibold text-slate-900">Cost Reduction by Scenario</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {scenarios.map((s, i) => (
                <div key={i} className="border border-slate-200 rounded-lg p-3">
                  <div className="text-xs font-medium text-slate-500">{s.name}</div>
                  <div className="text-lg font-bold text-emerald-600 mt-1">{s.reduction_pct}%</div>
                  <div className="text-xs text-slate-500 mt-1">Saving: {formatCurrency(s.saving)}</div>
                  {s.timeline_reduction_pct != null && <div className="text-xs text-slate-500">Timeline: -{s.timeline_reduction_pct}%</div>}
                  <div className="text-[10px] text-slate-400 mt-1">{s.confidence || ""}</div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-3">Reductions are potential — "up to" figures, never guaranteed. Capped at 70% maximum.</p>
          </div>
        )}

        {/* Confidence */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm font-medium text-slate-600">Overall Confidence</span>
          <span className="text-sm font-semibold text-slate-900">{expected.confidence || "—"}</span>
        </div>
      </div>
    </SectionCard>
  );
}

function AssumptionGroup({ icon: Icon, title, children }) {
  return (
    <div className="border border-slate-200 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase mb-2"><Icon className="w-3.5 h-3.5" />{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
function Assumption({ label, value }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value || "—"}</span>
    </div>
  );
}
function Metric({ label, value, accent }) {
  return (
    <div>
      <div className="text-[10px] text-slate-400 uppercase">{label}</div>
      <div className={`text-sm font-semibold ${accent || "text-slate-800"}`}>{value || "—"}</div>
    </div>
  );
}