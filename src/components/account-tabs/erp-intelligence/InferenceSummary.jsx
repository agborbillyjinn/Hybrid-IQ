import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import ConfidenceBar from "./ConfidenceBar";
import { Database, ArrowRight, Clock, Cloud, Users, GitBranch } from "lucide-react";

const ACCENTS = {
  indigo: "text-indigo-600 bg-indigo-50", slate: "text-slate-600 bg-slate-100",
  violet: "text-violet-600 bg-violet-50", amber: "text-amber-600 bg-amber-50",
  sky: "text-sky-600 bg-sky-50", emerald: "text-emerald-600 bg-emerald-50",
};

export default function InferenceSummary({ inference }) {
  const cur = inference.current_erp || {};
  const prev = inference.previous_erp || {};
  const target = inference.likely_target_erp || {};
  const age = inference.erp_age_estimate || {};
  const dep = inference.deployment_model || {};
  const partner = inference.known_erp_partner || {};
  const mig = inference.possible_migration_path || {};
  const isUnknown = (cur.vendor || "").toUpperCase() === "UNKNOWN" || !cur.vendor;
  const targetLabel = target.probability >= 70 ? "HIGH" : target.probability >= 40 ? "MEDIUM" : "LOW";

  return (
    <div className="space-y-5">
      <SectionCard title="ERP Inference Summary" subtitle="Evidence-driven conclusions about the current and target ERP estate">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card icon={Database} label="Current ERP" accent="indigo"
            title={`${cur.vendor || "UNKNOWN"}${cur.product && cur.product !== "UNKNOWN" ? " · " + cur.product : ""}`}
            subtitle={cur.version && cur.version !== "UNKNOWN" ? `Version ${cur.version}` : undefined}
            score={cur.confidence} label={cur.confidence_label} />
          <Card icon={ArrowRight} label="Previous ERP" accent="slate"
            title={prev.vendor ? `${prev.vendor}${prev.product ? " · " + prev.product : ""}` : "None identified"}
            subtitle={prev.why} />
          <Card icon={GitBranch} label="Likely Target ERP" accent="violet"
            title={target.product || "UNKNOWN"} subtitle={target.why}
            score={target.probability} label={targetLabel} />
          <Card icon={Clock} label="ERP Age Estimate" accent="amber"
            title={age.years != null ? `${age.years} years` : "Unknown"} subtitle={age.basis} score={age.confidence} />
          <Card icon={Cloud} label="Deployment Model" accent="sky"
            title={dep.value || "Unknown"} subtitle={dep.why} score={dep.confidence} />
          <Card icon={Users} label="Known ERP Partner" accent="emerald"
            title={partner.partner || "Unknown"} subtitle={partner.evidence_ref} score={partner.confidence} />
        </div>
        {mig && (mig.from || mig.to) && (
          <div className="mt-4 p-4 rounded-lg border border-violet-100 bg-violet-50/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-700 uppercase mb-1.5">
              <GitBranch className="w-3.5 h-3.5" /> Possible Migration Path
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700 flex-wrap">
              <span className="font-medium">{mig.from || "?"}</span>
              <ArrowRight className="w-4 h-4 text-violet-500" />
              <span className="font-medium">{mig.to || "?"}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">{mig.type || "Unknown"}</span>
              {mig.probability != null && <><span className="text-slate-400">·</span><span className="text-violet-600 font-medium">{mig.probability}% probability</span></>}
            </div>
            {mig.why && <p className="text-sm text-slate-600 mt-1.5">{mig.why}</p>}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Why HybridIQ believes this" subtitle="The reasoning and supporting evidence behind the current ERP conclusion">
        {isUnknown ? (
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-200">
            <p className="text-sm font-medium text-rose-700">Current ERP: UNKNOWN — insufficient evidence</p>
            <p className="text-sm text-rose-600 mt-1">{cur.why || "HybridIQ could not find enough corroborating evidence to determine the current ERP with confidence."}</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-slate-700 leading-relaxed">{cur.why}</p>
            {cur.supporting_evidence?.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Supporting Evidence</div>
                <ul className="space-y-1.5">
                  {cur.supporting_evidence.map((e, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />{e}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function Card({ icon: Icon, label, title, subtitle, score, label: lbl, accent }) {
  return (
    <div className="p-4 rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${ACCENTS[accent] || ACCENTS.slate}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      {subtitle && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{subtitle}</p>}
      {score != null && <div className="mt-2.5"><ConfidenceBar score={score} label={lbl} /></div>}
    </div>
  );
}