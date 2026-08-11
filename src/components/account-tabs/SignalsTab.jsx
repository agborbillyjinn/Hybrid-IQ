import React, { useEffect, useState } from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { ConfidenceBadge } from "@/components/intelligence/Badges";
import { base44 } from "@/api/base44Client";
import { formatDate } from "@/lib/format";

const CAT_COLORS = {
  "Executive Changes": "bg-violet-50 text-violet-600 border-violet-200",
  "M&A": "bg-rose-50 text-rose-600 border-rose-200",
  "ERP / Technology": "bg-indigo-50 text-indigo-600 border-indigo-200",
  "Digital Transformation": "bg-emerald-50 text-emerald-600 border-emerald-200",
  "Operational": "bg-amber-50 text-amber-600 border-amber-200",
  "Financial": "bg-sky-50 text-sky-600 border-sky-200",
};

export default function SignalsTab({ intel, accountId }) {
  const [signals, setSignals] = useState(intel.signals || []);

  useEffect(() => {
    (async () => {
      try {
        const s = await base44.entities.Signal.filter({ account_id: accountId });
        if (s.length) setSignals(s);
      } catch (e) {}
    })();
  }, [accountId]);

  return (
    <div className="space-y-5">
      <SectionCard title="Transformation Signals" subtitle={`${signals.length} signals detected — each with strength, confidence and impact`}>
        <div className="space-y-3">
          {signals.map((sig, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-900">{sig.signal}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded border ${CAT_COLORS[sig.category] || "bg-slate-50 text-slate-500 border-slate-200"}`}>{sig.category}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                    <span>{formatDate(sig.date)}</span>
                    <span>Strength: <span className="font-medium text-slate-600">{sig.strength}</span></span>
                    {sig.source && <span>· {sig.source}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <ConfidenceBadge value={sig.confidence} />
                  {sig.impact_on_probability != null && (
                    <span className="text-[11px] font-medium text-indigo-600">+{sig.impact_on_probability}% impact</span>
                  )}
                </div>
              </div>
              {sig.why_it_matters && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{sig.why_it_matters}</p>}
            </div>
          ))}
          {signals.length === 0 && <p className="text-sm text-slate-400">No signals detected.</p>}
        </div>
      </SectionCard>
    </div>
  );
}