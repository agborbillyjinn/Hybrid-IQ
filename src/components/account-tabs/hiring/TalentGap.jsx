import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default function TalentGap({ hi }) {
  const tg = hi.talent_gap || {};
  return (
    <SectionCard title="Talent Gap Analysis" subtitle="Programme requirements vs visible internal hiring">
      <div className="space-y-3">
        <GapRow icon={CheckCircle2} tone="emerald" label="Skills Required" items={tg.skills_required} />
        <GapRow icon={CheckCircle2} tone="sky" label="Skills Being Hired" items={tg.skills_being_hired} />
        <GapRow icon={CheckCircle2} tone="slate" label="Likely Internal Capability" items={tg.likely_internal_capability} />
        <GapRow icon={XCircle} tone="rose" label="Potential Capability Gaps" items={tg.potential_gaps} />
        <GapRow icon={AlertTriangle} tone="amber" label="Potential External Consulting Need" items={tg.external_consulting_need} />
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400">Confidence: <strong className="text-slate-600">{tg.confidence}</strong></span>
        <span className="text-slate-400 italic">Absence of job adverts does not prove capability is absent.</span>
      </div>
    </SectionCard>
  );
}

function GapRow({ icon: Icon, tone, label, items }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    sky: "bg-sky-50 text-sky-700 border-sky-100",
    slate: "bg-slate-50 text-slate-700 border-slate-200",
    rose: "bg-rose-50 text-rose-700 border-rose-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
  };
  const iconTone = { emerald: "text-emerald-500", sky: "text-sky-500", slate: "text-slate-400", rose: "text-rose-500", amber: "text-amber-500" };
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase mb-1.5"><Icon className={`w-3.5 h-3.5 ${iconTone[tone]}`} />{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {items?.length ? items.map((s) => (
          <span key={s} className={`px-2 py-0.5 rounded text-[11px] border ${tones[tone]}`}>{s}</span>
        )) : <span className="text-xs text-slate-400">—</span>}
      </div>
    </div>
  );
}