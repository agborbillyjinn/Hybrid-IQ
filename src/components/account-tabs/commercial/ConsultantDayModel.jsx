import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";

const WORKSTREAM_LABELS = {
  "Requirements & Documentation": "Requirements",
  "Process Design": "Design",
  "Data Mapping & Migration": "Migration",
  "Configuration": "Configuration",
  "Custom Development": "Custom Dev",
  "Integration": "Integration",
  "Testing Preparation": "Testing",
  "Change Management": "Change Mgmt",
  "Governance": "Governance",
};

export default function ConsultantDayModel({ intel }) {
  const hiring = intel.hiring_intelligence || {};
  const effort = hiring.effort_displacement || {};
  const workstreams = effort.workstreams || [];

  if (workstreams.length === 0) return null;

  const tradTotal = effort.traditional_total_days || workstreams.reduce((s, w) => s + (w.traditional_days || 0), 0);
  const aiTotal = effort.ai_total_days || workstreams.reduce((s, w) => s + (w.ai_days || 0), 0);
  const avoided = effort.days_avoided || (tradTotal - aiTotal);
  const reductionPct = tradTotal > 0 ? Math.round((avoided / tradTotal) * 100) : 0;

  return (
    <SectionCard title="Consultant Day Model" subtitle="Traditional vs AI-enabled consulting effort by workstream — effort displacement, not headcount elimination">
      <div className="space-y-4">
        {/* Headline numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Headline label="Traditional Consulting Effort" value={tradTotal.toLocaleString() + " days"} />
          <Headline label="AI-Enabled Scenario" value={aiTotal.toLocaleString() + " days"} />
          <Headline label="Potential Consultant Days Avoided" value={avoided.toLocaleString()} accent="text-emerald-600" />
          <Headline label="Reduction" value={reductionPct + "%"} accent="text-emerald-600" />
        </div>

        {/* Workstream breakdown table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] text-slate-400 uppercase border-b border-slate-100">
                <th className="py-2 font-medium">Workstream</th>
                <th className="py-2 font-medium text-right">Traditional</th>
                <th className="py-2 font-medium text-right">AI-Enabled</th>
                <th className="py-2 font-medium text-right">Days Avoided</th>
                <th className="py-2 font-medium text-right">Reduction</th>
                <th className="py-2 font-medium" style={{ minWidth: 120 }}>Visual</th>
              </tr>
            </thead>
            <tbody>
              {workstreams.map((w, i) => {
                const pct = w.traditional_days > 0 ? Math.round((w.reduction_days / w.traditional_days) * 100) : 0;
                return (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-2.5 font-medium text-slate-700">{WORKSTREAM_LABELS[w.name] || w.name}</td>
                    <td className="py-2.5 text-right text-slate-600">{w.traditional_days?.toLocaleString()}</td>
                    <td className="py-2.5 text-right text-slate-600">{w.ai_days?.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-medium text-emerald-600">{w.reduction_days?.toLocaleString()}</td>
                    <td className="py-2.5 text-right text-slate-600">{pct}%</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: pct + "%" }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-slate-200 font-semibold">
                <td className="py-2.5 text-slate-900">Total</td>
                <td className="py-2.5 text-right text-slate-900">{tradTotal.toLocaleString()}</td>
                <td className="py-2.5 text-right text-slate-900">{aiTotal.toLocaleString()}</td>
                <td className="py-2.5 text-right text-emerald-600">{avoided.toLocaleString()}</td>
                <td className="py-2.5 text-right text-emerald-600">{reductionPct}%</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-700">
            Consultant-day reduction represents <strong>effort displacement</strong> — AI accelerates compressible workstreams. This does <strong>not</strong> imply headcount elimination. Senior consulting judgement, governance and change management remain essential and are the least compressible workstreams.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

function Headline({ label, value, accent }) {
  return (
    <div className="border border-slate-200 rounded-lg p-3">
      <div className="text-[10px] text-slate-400 uppercase font-medium mb-1">{label}</div>
      <div className={`text-lg font-bold ${accent || "text-slate-900"}`}>{value}</div>
    </div>
  );
}