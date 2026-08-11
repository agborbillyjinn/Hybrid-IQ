import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { TrendingUp, Cpu } from "lucide-react";

export default function HistoricalTrend({ hi }) {
  const t = hi.historical_trend || {};
  const max = Math.max(...(t.years || []).map((y) => y.count), 1);
  return (
    <SectionCard title="Historical Hiring Trend" subtitle="ERP hiring over time — detects programmes before formal announcement">
      <div className="flex items-end gap-3 h-32 mt-2">
        {(t.years || []).map((y) => (
          <div key={y.year} className="flex-1 flex flex-col items-center gap-1">
            <div className="text-xs font-semibold text-slate-700">{y.count}</div>
            <div className="w-full bg-slate-100 rounded-t-md overflow-hidden flex flex-col justify-end" style={{ height: "100%" }}>
              <div className="w-full bg-gradient-to-t from-indigo-500 to-violet-400 rounded-t-md" style={{ height: `${(y.count / max) * 100}%` }} />
            </div>
            <div className="text-[11px] text-slate-400">{y.year}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-sm">
        <div className="flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /><span className="text-slate-700">Growth: <strong>{t.growth_pct > 0 ? `+${t.growth_pct}%` : `${t.growth_pct}%`}</strong> YoY</span></div>
        {t.technology_changes?.length > 0 && (
          <div className="flex items-start gap-2"><Cpu className="w-3.5 h-3.5 text-indigo-500 mt-0.5" /><div className="text-slate-700">{t.technology_changes.map((c, i) => <div key={i} className="text-xs">{c}</div>)}</div></div>
        )}
      </div>
      <p className="text-xs text-slate-500 mt-3 italic">{t.interpretation}</p>
    </SectionCard>
  );
}