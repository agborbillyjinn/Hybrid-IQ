import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { formatCurrency } from "@/lib/format";
import { Info } from "lucide-react";

export default function ConsultingEconomics({ hi }) {
  const ce = hi.consulting_economics || {};
  const fmt = (v) => (v != null ? formatCurrency(v) : "—");
  return (
    <SectionCard title="Consulting Economics" subtitle="Conventional human-heavy resourcing scenario">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] text-slate-400 uppercase border-b border-slate-100">
              <th className="text-left font-medium py-2">Role</th>
              <th className="text-right font-medium py-2">People</th>
              <th className="text-right font-medium py-2">Day Rate</th>
              <th className="text-right font-medium py-2">Days</th>
              <th className="text-right font-medium py-2">Cost</th>
            </tr>
          </thead>
          <tbody>
            {(ce.roles || []).map((r) => (
              <tr key={r.role} className="border-b border-slate-50">
                <td className="py-2 text-slate-700">{r.role}</td>
                <td className="py-2 text-right text-slate-700">{r.people}</td>
                <td className="py-2 text-right text-slate-700">£{r.day_rate.toLocaleString()}</td>
                <td className="py-2 text-right text-slate-700">{r.days.toLocaleString()}</td>
                <td className="py-2 text-right font-medium text-slate-800">{formatCurrency(r.cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <Mini label="Estimated People" value={ce.estimated_people} />
        <Mini label="Estimated Days" value={ce.estimated_days?.toLocaleString()} />
        <Mini label="Blended Day Rate" value={`£${ce.blended_day_rate?.toLocaleString()}`} />
        <Mini label="Estimated Consulting Cost" value={fmt(ce.estimated_consulting_cost?.expected)} sub={ce.estimated_consulting_cost ? `${fmt(ce.estimated_consulting_cost.low)}–${fmt(ce.estimated_consulting_cost.high)}` : null} highlight />
      </div>
      <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>{ce.note}</span>
      </div>
    </SectionCard>
  );
}

function Mini({ label, value, sub, highlight }) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? "border-indigo-200 bg-indigo-50/40" : "border-slate-200 bg-slate-50"}`}>
      <div className="text-[10px] font-medium text-slate-400 uppercase">{label}</div>
      <div className={`text-base font-semibold mt-1 ${highlight ? "text-indigo-700" : "text-slate-800"}`}>{value}</div>
      {sub && <div className="text-[11px] text-slate-400">{sub}</div>}
    </div>
  );
}