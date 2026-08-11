import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { Building, Users, ArrowRight } from "lucide-react";

export default function DeliveryModel({ hi }) {
  const d = hi.delivery_model || {};
  const tone =
    d.hypothesis === "BUILDING INTERNAL TEAM" ? "text-emerald-600 bg-emerald-50 border-emerald-200"
    : d.hypothesis === "USING CONTRACTORS" ? "text-amber-600 bg-amber-50 border-amber-200"
    : d.hypothesis === "HYBRID INTERNAL + EXTERNAL" ? "text-indigo-600 bg-indigo-50 border-indigo-200"
    : d.hypothesis === "USING SYSTEMS INTEGRATOR" ? "text-violet-600 bg-violet-50 border-violet-200"
    : "text-slate-600 bg-slate-50 border-slate-200";
  return (
    <SectionCard title="Delivery Model Hypothesis" subtitle="Build vs buy / internal vs consultancy">
      <div className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-semibold border ${tone}`}>{d.hypothesis}</div>
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 uppercase"><Users className="w-3 h-3" />Internal ERP Team</div>
          <div className="text-base font-semibold text-slate-800 mt-1">{d.internal_team_size}</div>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 uppercase"><Building className="w-3 h-3" />Additional Capacity</div>
          <div className="text-base font-semibold text-slate-800 mt-1">{d.additional_capacity}</div>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 uppercase"><ArrowRight className="w-3 h-3" />External Requirement</div>
          <div className="text-base font-semibold text-slate-800 mt-1">{d.external_requirement}</div>
        </div>
      </div>
      {d.evidence?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="text-[10px] font-medium text-slate-400 uppercase mb-1.5">Evidence</div>
          <ul className="space-y-1">
            {d.evidence.map((e, i) => <li key={i} className="text-sm text-slate-700 flex items-start gap-2"><span className="text-indigo-400">•</span>{e}</li>)}
          </ul>
        </div>
      )}
    </SectionCard>
  );
}