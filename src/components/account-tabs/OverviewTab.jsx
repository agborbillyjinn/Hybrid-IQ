import React from "react";
import ScoreGauge from "@/components/intelligence/ScoreGauge";
import SectionCard from "@/components/intelligence/SectionCard";
import { ConfidenceBadge } from "@/components/intelligence/Badges";
import { formatCurrency } from "@/lib/format";
import { Target, TrendingUp, Zap, Layers, AlertCircle, Lightbulb, Compass } from "lucide-react";

export default function OverviewTab({ account, intel }) {
  const s = intel.scores || {};
  const tp = s.transformation_probability || {};
  const target = intel.target_erp || {};
  const attack = intel.attack_plan || {};

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Scoring Summary</h3>
        <p className="text-xs text-slate-400 mb-5">Four independent models. All scores are AI estimates with evidence-backed confidence.</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
          <ScoreGauge label="Transformation Probability" value={tp.value} subtitle="Likelihood of ERP transformation" />
          <ScoreGauge label="Hybrid Fit" value={s.hybrid_fit?.value} type="fit" subtitle="Current BC offering suitability" />
          <ScoreGauge label="Future Enterprise Fit" value={s.future_enterprise_fit?.value} type="fit" subtitle="SAP / Oracle / NetSuite / F&O" />
          <ScoreGauge label="Migration Complexity" value={s.migration_complexity?.value} subtitle="Difficulty of transformation" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Transformation Probability Breakdown">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-medium text-slate-500 uppercase">Biggest Unknown</div>
                <p className="text-sm text-slate-700 mt-0.5">{tp.biggest_unknown || "Not determined"}</p>
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500 uppercase mb-2">Top Reasons</div>
              <ul className="space-y-1.5">
                {(tp.reasons || []).map((r, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2"><span className="text-indigo-500 mt-0.5">•</span>{r}</li>
                ))}
                {(tp.reasons || []).length === 0 && <li className="text-sm text-slate-400">No reasons provided.</li>}
              </ul>
            </div>
            <div className="flex items-start gap-2 pt-2 border-t border-slate-100">
              <Compass className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-medium text-slate-500 uppercase">Recommended Next Research Action</div>
                <p className="text-sm text-slate-700 mt-0.5">{tp.next_action || "—"}</p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Target ERP / Next Move">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="text-xs text-slate-400 uppercase">Current</div>
              <div className="text-base font-semibold text-slate-800 mt-1">{target.current_erp || account.current_erp || "Unknown"}</div>
            </div>
            <div className="rounded-lg bg-indigo-50 p-4">
              <div className="text-xs text-indigo-400 uppercase">Likely Target</div>
              <div className="text-base font-semibold text-indigo-700 mt-1">{target.next_erp || "—"}</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-slate-500">Migration Probability</span>
              <span className="font-semibold text-slate-800">{target.probability || 0}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${target.probability || 0}%` }} />
            </div>
            <div className="text-xs text-slate-400 mt-1.5">Type: {target.migration_type || "—"}</div>
          </div>
          {target.why && <p className="text-sm text-slate-600 mt-3 leading-relaxed">{target.why}</p>}
        </SectionCard>
      </div>

      <SectionCard title="Account Attack Plan" subtitle="Hypothesis-driven — validate before acting">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <Field icon={Target} label="Account Priority" value={attack.account_priority} />
          <Field icon={Layers} label="Transformation Hypothesis" value={attack.transformation_hypothesis} />
          <Field icon={Layers} label="ERP Hypothesis" value={attack.erp_hypothesis} />
          <Field icon={Zap} label="Why Now" value={attack.why_now} />
          <Field icon={TrendingUp} label="Primary Persona" value={attack.primary_persona} />
          <Field icon={TrendingUp} label="Secondary Persona" value={attack.secondary_persona} />
          <Field icon={TrendingUp} label="Economic Buyer" value={attack.economic_buyer} />
          <Field icon={TrendingUp} label="Potential Champion" value={attack.champion} />
          <Field icon={AlertCircle} label="Primary Pain Hypothesis" value={attack.primary_pain} />
          <Field icon={TrendingUp} label="Commercial Hypothesis" value={attack.commercial_hypothesis} />
          <Field icon={AlertCircle} label="Primary Objection" value={attack.primary_objection} />
          <Field icon={Compass} label="Entry Point" value={attack.entry_point} />
          <Field icon={Compass} label="Discovery Goal" value={attack.discovery_goal} />
          <Field icon={Lightbulb} label="Next Action" value={attack.next_action} />
        </div>
        {(attack.meddpicc_gaps || []).length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="text-xs font-medium text-slate-500 uppercase mb-2">MEDDPICC Gaps</div>
            <div className="flex flex-wrap gap-2">
              {attack.meddpicc_gaps.map((g, i) => (
                <span key={i} className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-600 text-xs border border-rose-100">{g}</span>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          All intelligence distinguishes <strong>FACT</strong>, <strong>INFERENCE</strong>, <strong>ESTIMATE</strong> and <strong>HYPOTHESIS</strong>. Commercial figures are illustrative pre-discovery estimates requiring validation. Hybrid references reductions of <em>up to 70%</em> — never a guaranteed figure for any specific customer.
        </p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase"><Icon className="w-3.5 h-3.5" />{label}</div>
      <p className="text-sm text-slate-700 mt-1">{value || <span className="text-slate-300">—</span>}</p>
    </div>
  );
}