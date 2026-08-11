import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { formatCurrency } from "@/lib/format";
import { Info, Sparkles } from "lucide-react";

export default function EffortDisplacement({ hi }) {
  const ed = hi.effort_displacement || {};
  return (
    <SectionCard title="Consultant Effort Displacement" subtitle="Traditional vs AI-enabled consultant-days — strategically important">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] text-slate-400 uppercase border-b border-slate-100">
              <th className="text-left font-medium py-2">Workstream</th>
              <th className="text-right font-medium py-2">Traditional Days</th>
              <th className="text-right font-medium py-2">AI-Enabled Days</th>
              <th className="text-right font-medium py-2">Reduction</th>
            </tr>
          </thead>
          <tbody>
            {(ed.workstreams || []).map((w) => (
              <tr key={w.name} className="border-b border-slate-50">
                <td className="py-2 text-slate-700">{w.name}</td>
                <td className="py-2 text-right text-slate-700">{w.traditional_days.toLocaleString()}</td>
                <td className="py-2 text-right text-indigo-700 font-medium">{w.ai_days.toLocaleString()}</td>
                <td className="py-2 text-right text-emerald-600 font-medium">-{w.reduction_days.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <Mini label="Traditional Consultant Days" value={ed.traditional_total_days?.toLocaleString()} />
        <Mini label="AI-Enabled Consultant Days" value={ed.ai_total_days?.toLocaleString()} tone="indigo" />
        <Mini label="Days Avoided" value={ed.days_avoided?.toLocaleString()} tone="emerald" />
        <Mini label="Consulting Cost Avoided" value={ed.cost_avoided ? formatCurrency(ed.cost_avoided.expected) : "—"} sub={ed.cost_avoided ? `${formatCurrency(ed.cost_avoided.low)}–${formatCurrency(ed.cost_avoided.high)}` : null} tone="emerald" highlight />
      </div>
      <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>{ed.note}</span>
      </div>
      <div className="mt-2 flex items-start gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg p-2.5">
        <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span>AI reduces <strong>consulting effort</strong> on compressible workstreams (requirements, data mapping, testing) rather than simply reducing day rates. Senior consulting judgement is not eliminated.</span>
      </div>
    </SectionCard>
  );
}

function Mini({ label, value, sub, tone, highlight }) {
  const tones = { indigo: "text-indigo-700", emerald: "text-emerald-600" };
  return (
    <div className={`rounded-lg border p-3 ${highlight ? "border-indigo-200 bg-indigo-50/40" : "border-slate-200 bg-slate-50"}`}>
      <div className="text-[10px] font-medium text-slate-400 uppercase">{label}</div>
      <div className={`text-base font-semibold mt-1 ${tones[tone] || "text-slate-800"}`}>{value}</div>
      {sub && <div className="text-[11px] text-slate-400">{sub}</div>}
    </div>
  );
}