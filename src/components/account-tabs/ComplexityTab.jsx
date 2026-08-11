import React from "react";
import ScoreGauge from "@/components/intelligence/ScoreGauge";
import SectionCard from "@/components/intelligence/SectionCard";
import { scoreBand, fitBand } from "@/lib/erpData";
import { AlertTriangle, Bot, UserCheck } from "lucide-react";

export default function ComplexityTab({ intel }) {
  const s = intel.scores || {};
  const mc = s.migration_complexity || {};
  const breakdown = mc.breakdown || [];
  const band = scoreBand(mc.value);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-center gap-8">
        <ScoreGauge label="Migration Complexity" value={mc.value} subtitle={mc.level} />
        <div className="flex-1 w-full">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Complexity Drivers</h3>
          <div className="space-y-2.5">
            {breakdown.map((d, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">{d.factor}</span>
                  <span className="font-medium text-slate-800">{d.score ?? "—"}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${band.bar} rounded-full`} style={{ width: `${d.score || 0}%` }} />
                </div>
                {d.note && <p className="text-[11px] text-slate-400 mt-0.5">{d.note}</p>}
              </div>
            ))}
            {breakdown.length === 0 && <p className="text-sm text-slate-400">No breakdown provided.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="Potential Implementation Blockers">
          <ul className="space-y-2">
            {(mc.blockers || []).map((b, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />{b}</li>
            ))}
            {(mc.blockers || []).length === 0 && <li className="text-sm text-slate-400">None identified.</li>}
          </ul>
        </SectionCard>
        <SectionCard title="AI-Compressible Areas">
          <ul className="space-y-2">
            {(mc.ai_reducible || []).map((b, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-start gap-2"><Bot className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />{b}</li>
            ))}
            {(mc.ai_reducible || []).length === 0 && <li className="text-sm text-slate-400">None identified.</li>}
          </ul>
        </SectionCard>
        <SectionCard title="Human Expertise Critical">
          <ul className="space-y-2">
            {(mc.human_critical || []).map((b, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-start gap-2"><UserCheck className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />{b}</li>
            ))}
            {(mc.human_critical || []).length === 0 && <li className="text-sm text-slate-400">None identified.</li>}
          </ul>
        </SectionCard>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Hybrid Fit Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FitBreakdown title="Current Hybrid Fit (Business Central)" data={s.hybrid_fit} type="fit" />
          <FitBreakdown title="Future Hybrid Enterprise Fit" data={s.future_enterprise_fit} type="fit" />
        </div>
      </div>
    </div>
  );
}

function FitBreakdown({ title, data, type }) {
  const d = data || {};
  const breakdown = d.breakdown || [];
  const band = type === "fit" ? fitBand(d.value) : scoreBand(d.value);
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-slate-700">{title}</h4>
        <span className={`text-lg font-semibold ${band.color}`}>{d.value ?? "—"}</span>
      </div>
      <div className="space-y-2">
        {breakdown.map((b, i) => (
          <div key={i}>
            <div className="flex items-center justify-between text-xs mb-0.5">
              <span className="text-slate-500">{b.factor} <span className="text-slate-300">({b.weight}%)</span></span>
              <span className="font-medium text-slate-700">{b.score}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${band.bar} rounded-full`} style={{ width: `${b.score || 0}%` }} />
            </div>
          </div>
        ))}
        {breakdown.length === 0 && <p className="text-xs text-slate-400">No breakdown provided.</p>}
      </div>
      {(d.reasons || []).length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="text-[11px] text-slate-400 uppercase mb-1">Reasons</div>
          <ul className="space-y-1">{d.reasons.map((r, i) => <li key={i} className="text-xs text-slate-600">• {r}</li>)}</ul>
        </div>
      )}
    </div>
  );
}