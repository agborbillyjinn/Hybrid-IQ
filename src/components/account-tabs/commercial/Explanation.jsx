import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { TrendingUp, Sparkles, Lock } from "lucide-react";

export default function Explanation({ explanation }) {
  const ex = explanation || {};
  return (
    <SectionCard title="Why these estimates" subtitle="The reasoning behind cost, savings and compression">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <List icon={TrendingUp} title="Primary Cost Drivers" items={ex.primary_cost_drivers} accent="text-rose-600" dot="bg-rose-400" />
        <List icon={Sparkles} title="AI-Saving Opportunities" items={ex.ai_saving_opportunities} accent="text-emerald-600" dot="bg-emerald-400" />
        <List icon={Lock} title="Unlikely to Compress" items={ex.unlikely_to_compress} accent="text-slate-500" dot="bg-slate-400" />
      </div>
    </SectionCard>
  );
}

function List({ icon: Icon, title, items, accent, dot }) {
  return (
    <div>
      <div className={`flex items-center gap-2 text-xs font-semibold uppercase mb-2 ${accent}`}><Icon className="w-3.5 h-3.5" />{title}</div>
      {items?.length ? (
        <ul className="space-y-1.5">
          {items.map((it, i) => <li key={i} className="text-sm text-slate-600 flex items-start gap-2"><span className={`w-1.5 h-1.5 rounded-full ${dot} mt-1.5 shrink-0`} />{it}</li>)}
        </ul>
      ) : <p className="text-sm text-slate-400">—</p>}
    </div>
  );
}