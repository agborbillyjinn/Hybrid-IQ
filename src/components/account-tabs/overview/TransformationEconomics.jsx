import React from "react";
import { buildEconomics } from "./deriveOverview";
import { formatCurrency } from "@/lib/format";
import { ArrowRight, TrendingDown, CalendarClock, ShieldCheck, Info } from "lucide-react";

export default function TransformationEconomics({ intel, onViewCommercial }) {
  const e = buildEconomics(intel);
  if (!e.hasData) return null;
  const t = e.traditional;
  const a = e.aiEnabled;
  const fmt = (v) => (v != null ? formatCurrency(v) : "—");
  const range = (r) => (r && (r.low != null || r.high != null) ? `${fmt(r.low)}–${fmt(r.high)}` : "—");

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Potential Transformation Economics</h3>
          <p className="text-xs text-slate-400 mt-0.5">From the commercial model — account-specific scenario</p>
        </div>
        <button onClick={onViewCommercial} className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap">
          View Full Commercial Model <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-200 p-4">
            <div className="text-[10px] font-semibold text-slate-400 uppercase">Traditional Implementation</div>
            <div className="text-xl font-semibold text-slate-900 mt-1">{range(t.cost)}</div>
            <div className="text-xs text-slate-500 mt-1">Expected: {fmt(t.cost?.expected)}</div>
            <div className="text-xs text-slate-400 mt-2 flex items-center gap-1"><CalendarClock className="w-3 h-3" />Timeline: {t.duration?.expected || "—"} months</div>
          </div>
          <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-4">
            <div className="text-[10px] font-semibold text-indigo-500 uppercase">AI-Enabled Scenario{a.name ? ` · ${a.name}` : ""}</div>
            <div className="text-xl font-semibold text-indigo-900 mt-1">{range(a.cost)}</div>
            <div className="text-xs text-indigo-600 mt-1">Expected: {fmt(a.cost?.expected)}</div>
            <div className="text-xs text-indigo-500 mt-2 flex items-center gap-1"><CalendarClock className="w-3 h-3" />Timeline: {a.duration?.expected || "—"} months</div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <Metric icon={TrendingDown} label="Potential Direct Saving" value={fmt(e.saving)} accent="emerald" />
          <Metric icon={TrendingDown} label="Est. % Reduction" value={e.pct_saving != null ? e.pct_saving + "%" : "—"} accent="emerald" />
          <Metric icon={CalendarClock} label="Months Saved" value={e.months_saved != null ? e.months_saved : "—"} accent="sky" />
          <Metric icon={ShieldCheck} label="Model Confidence" value={a.confidence || "—"} accent="violet" />
        </div>
        <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <Info className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Illustrative pre-discovery estimate — validation required. Hybrid publicly references potential implementation cost reductions of <strong>up to 70%</strong>. HybridIQ calculates an account-specific scenario rather than automatically applying 70%. Hybrid does not guarantee the estimated saving for any specific customer.
          </p>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, accent }) {
  const accents = { emerald: "text-emerald-600", sky: "text-sky-600", violet: "text-violet-600" };
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
      <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 uppercase"><Icon className="w-3 h-3" />{label}</div>
      <div className={`text-lg font-semibold mt-1 ${accents[accent] || "text-slate-800"}`}>{value}</div>
    </div>
  );
}