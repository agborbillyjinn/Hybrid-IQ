import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import ScoreExplanations from "@/components/account-tabs/overview/ScoreExplanations";
import ERPEvidenceSummary from "@/components/account-tabs/overview/ERPEvidenceSummary";
import TransformationEconomics from "@/components/account-tabs/overview/TransformationEconomics";
import CriticalResearchGap from "@/components/account-tabs/overview/CriticalResearchGap";
import ScoreRelationship from "@/components/account-tabs/overview/ScoreRelationship";
import EvidenceHealth from "@/components/account-tabs/overview/EvidenceHealth";
import { Target, TrendingUp, Zap, Layers, AlertCircle, Lightbulb, Compass } from "lucide-react";

export default function OverviewTab({ account, intel, onNavigateTab }) {
  const attack = intel.attack_plan || {};

  return (
    <div className="space-y-5">
      {/* Scoring Summary with dynamic explanations */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Scoring Summary</h3>
        <p className="text-xs text-slate-400 mb-5">Four independent models. All scores are AI estimates with evidence-backed confidence.</p>
        <ScoreExplanations scores={intel.scores || {}} />
      </div>

      {/* Critical Research Gap | ERP Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <CriticalResearchGap intel={intel} account={account} />
        <ERPEvidenceSummary intel={intel} account={account} onViewEvidence={() => onNavigateTab?.("Evidence")} />
      </div>

      {/* Transformation Economics */}
      <TransformationEconomics intel={intel} onViewCommercial={() => onNavigateTab?.("Commercial Model")} />

      {/* Score Relationship | Evidence Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ScoreRelationship intel={intel} />
        <EvidenceHealth intel={intel} />
      </div>

      {/* Account Attack Plan (preserved) */}
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