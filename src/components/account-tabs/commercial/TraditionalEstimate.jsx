import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { formatCurrency } from "@/lib/format";

export default function TraditionalEstimate({ traditional, compressibility }) {
  const t = traditional || {};
  const cost = t.cost || {};
  const dur = t.duration || {};
  const workstreams = t.workstreams || [];
  const compMap = {};
  (compressibility?.workstreams || []).forEach((w) => { compMap[w.name] = w.compressibility; });

  return (
    <SectionCard title="Traditional Implementation Estimate" subtitle="Low / Expected / High ranges for cost and duration — never a single unsupported number">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <RangeBlock label="Cost (GBP)" low={cost.low} expected={cost.expected} high={cost.high} format={formatCurrency} />
        <RangeBlock label="Duration (months)" low={dur.low} expected={dur.expected} high={dur.high} format={(v) => v != null ? v + " mo" : "—"} />
      </div>
      {workstreams.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] text-slate-400 uppercase border-b border-slate-100">
                <th className="py-2 font-medium">Workstream</th>
                <th className="py-2 font-medium text-right">Cost (Exp)</th>
                <th className="py-2 font-medium text-right">Dur (Exp)</th>
                <th className="py-2 font-medium text-right">AI Compress</th>
              </tr>
            </thead>
            <tbody>
              {workstreams.map((w, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td className="py-2.5 font-medium text-slate-700">{w.name}</td>
                  <td className="py-2.5 text-right text-slate-600">{formatCurrency(w.cost_expected)}</td>
                  <td className="py-2.5 text-right text-slate-600">{w.duration_expected != null ? w.duration_expected + " mo" : "—"}</td>
                  <td className="py-2.5 text-right">
                    <span className={`px-1.5 py-0.5 rounded text-[11px] ${compressColor(compMap[w.name])}`}>{compMap[w.name] != null ? compMap[w.name] + "%" : "—"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}

function RangeBlock({ label, low, expected, high, format }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-400 uppercase mb-2">{label}</div>
      <div className="space-y-1">
        <RangeRow label="Low" value={format(low)} />
        <RangeRow label="Expected" value={format(expected)} highlight />
        <RangeRow label="High" value={format(high)} />
      </div>
    </div>
  );
}
function RangeRow({ label, value, highlight }) {
  return (
    <div className={`flex items-center justify-between py-2 border-b border-slate-50 ${highlight ? "bg-indigo-50/50 -mx-2 px-2 rounded" : ""}`}>
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-indigo-700" : "text-slate-800"}`}>{value}</span>
    </div>
  );
}
function compressColor(v) {
  const n = Number(v) || 0;
  if (n >= 60) return "bg-emerald-50 text-emerald-600";
  if (n >= 30) return "bg-amber-50 text-amber-600";
  return "bg-slate-50 text-slate-500";
}