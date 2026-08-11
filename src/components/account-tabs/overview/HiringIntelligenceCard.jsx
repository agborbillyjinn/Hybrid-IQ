import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { formatDate } from "@/lib/format";
import { ArrowRight, Briefcase, Users, GitBranch, Cpu, Activity, AlertTriangle, Clock, Search } from "lucide-react";

export default function HiringIntelligenceCard({ intel, onView }) {
  const hi = intel.hiring_intelligence;
  const rm = intel.research_metadata;
  if (!hi && !rm) return null;

  // No vacancies detected (live research returned nothing)
  if (!hi && rm) {
    return (
      <SectionCard title="ERP Hiring Intelligence" subtitle="No relevant vacancies detected">
        <p className="text-sm text-slate-600">{rm.no_vacancies_message || "No relevant vacancies detected from the sources searched."}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          <Mini label="Research Mode" value={rm.research_mode} />
          <Mini label="Last Job Search" value={rm.last_job_search ? formatDate(rm.last_job_search) : "—"} />
          <Mini label="Sources Checked" value={rm.sources_checked?.length || 0} />
          <Mini label="Coverage Confidence" value={rm.coverage_confidence} />
        </div>
        <p className="text-xs text-slate-400 mt-3 italic">Absence of vacancies does not indicate no ERP transformation. Recommended: targeted manual research or configure a job research workflow.</p>
      </SectionCard>
    );
  }

  const tone =
    hi.hiring_signal_level === "VERY HIGH" ? "text-rose-600"
    : hi.hiring_signal_level === "HIGH" ? "text-orange-600"
    : hi.hiring_signal_level === "MEDIUM" ? "text-amber-600"
    : "text-emerald-600";
  const historical = (hi.total_vacancies || 0) - (hi.active_vacancies || 0);
  return (
    <SectionCard
      title="ERP Hiring Intelligence"
      subtitle={rm?.research_mode && rm.research_mode !== "MOCK" ? `Live research · ${rm.coverage_confidence?.toLowerCase() || ""} coverage` : "Evidence from current & historical vacancies"}
      action={
        <button onClick={onView} className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap">
          VIEW HIRING INTELLIGENCE <ArrowRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      <div className="flex items-center gap-5">
        <div className="text-center shrink-0">
          <div className={`text-3xl font-bold ${tone}`}>{hi.hiring_signal_score}</div>
          <div className="text-[10px] text-slate-400">/ 100</div>
          <div className={`text-xs font-semibold ${tone}`}>{hi.hiring_signal_level}</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 flex-1 text-sm">
          <Stat icon={Briefcase} label="Active ERP Vacancies" value={hi.active_vacancies} />
          <Stat icon={Clock} label="Historical Vacancies" value={historical} />
          <Stat icon={Users} label="Transformation Roles" value={hi.transformation_roles} />
          <Stat icon={GitBranch} label="Contract Roles" value={hi.contract_roles} />
          <Stat icon={Cpu} label="Dominant Technology" value={hi.dominant_technology} />
          <Stat icon={Activity} label="Likely Programme Stage" value={hi.likely_programme_stage} />
        </div>
      </div>
      {hi.talent_gap?.potential_gaps?.length > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Potential External Skills Gap: <strong>{hi.talent_gap.potential_gaps.join(", ")}</strong></span>
        </div>
      )}
      {rm && (
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Mini label="Research Mode" value={rm.research_mode || intel.source_provider} />
          <Mini label="Last Job Search" value={rm.last_job_search ? formatDate(rm.last_job_search) : "—"} />
          <Mini label="Sources Checked" value={rm.sources_checked?.length ?? "—"} />
          <Mini label="Consulting Demand" value={hi.consulting_demand_level} />
        </div>
      )}
    </SectionCard>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
      <div>
        <div className="text-[10px] text-slate-400 uppercase">{label}</div>
        <div className="font-medium text-slate-800 text-sm">{value}</div>
      </div>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div>
      <div className="text-[10px] text-slate-400 uppercase">{label}</div>
      <div className="text-sm font-medium text-slate-800 mt-0.5">{value || "—"}</div>
    </div>
  );
}