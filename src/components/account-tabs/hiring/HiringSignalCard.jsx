import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { Flame, Users, Briefcase, Cpu, GitBranch, AlertTriangle } from "lucide-react";

export default function HiringSignalCard({ hi }) {
  const tone =
    hi.hiring_signal_level === "VERY HIGH" ? "text-rose-600"
    : hi.hiring_signal_level === "HIGH" ? "text-orange-600"
    : hi.hiring_signal_level === "MEDIUM" ? "text-amber-600"
    : "text-emerald-600";
  return (
    <SectionCard title="ERP Hiring Signal" subtitle="Independent score from current & historical vacancies">
      <div className="flex items-center gap-6">
        <div className="text-center shrink-0">
          <div className={`text-4xl font-bold ${tone}`}>{hi.hiring_signal_score}</div>
          <div className="text-xs text-slate-400">/ 100</div>
          <div className={`text-sm font-semibold ${tone} mt-1`}>{hi.hiring_signal_level}</div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 flex-1 text-sm">
          <Stat icon={Briefcase} label="Active ERP Vacancies" value={hi.active_vacancies} />
          <Stat icon={Users} label="Transformation Roles" value={hi.transformation_roles} />
          <Stat icon={GitBranch} label="Migration Roles" value={hi.migration_roles} />
          <Stat icon={Briefcase} label="Contract Roles" value={hi.contract_roles} />
          <Stat icon={Users} label="Programme Leadership" value={hi.programme_leadership_roles} />
          <Stat icon={Cpu} label="Dominant Technology" value={hi.dominant_technology} />
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-[10px] font-medium text-slate-400 uppercase">Likely Programme Stage</div>
          <div className="font-medium text-slate-800 mt-0.5">{hi.likely_programme_stage}</div>
          <div className="text-xs text-slate-400">{hi.programme_stage_confidence} confidence</div>
        </div>
        <div>
          <div className="text-[10px] font-medium text-slate-400 uppercase">Consulting Demand</div>
          <div className="font-medium text-slate-800 mt-0.5">{hi.consulting_demand_level} ({hi.consulting_demand_score}/100)</div>
        </div>
      </div>
      {hi.talent_gap?.potential_gaps?.length > 0 && (
        <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>Potential external skills gap: <strong>{hi.talent_gap.potential_gaps.join(", ")}</strong></span>
        </div>
      )}
    </SectionCard>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <div>
        <div className="text-[10px] text-slate-400 uppercase">{label}</div>
        <div className="font-medium text-slate-800">{value}</div>
      </div>
    </div>
  );
}