import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { Boxes } from "lucide-react";

export default function ModuleIntelligence({ hi }) {
  const m = hi.modules || {};
  return (
    <SectionCard title="ERP Module Intelligence" subtitle="Modules extracted from vacancy requirements">
      <div className="flex items-center gap-2 mb-3">
        <Boxes className="w-4 h-4 text-indigo-500" />
        <span className="text-sm text-slate-600">Confidence: <strong>{m.confidence}</strong></span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-semibold text-emerald-600 uppercase mb-1.5">Known Modules</div>
          <div className="flex flex-wrap gap-1.5">
            {m.known?.length ? m.known.map((mod) => (
              <span key={mod} className="px-2 py-0.5 rounded text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-100">{mod}</span>
            )) : <span className="text-xs text-slate-400">—</span>}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold text-amber-600 uppercase mb-1.5">Likely Modules</div>
          <div className="flex flex-wrap gap-1.5">
            {m.likely?.length ? m.likely.map((mod) => (
              <span key={mod} className="px-2 py-0.5 rounded text-[11px] bg-amber-50 text-amber-700 border border-amber-100">{mod}</span>
            )) : <span className="text-xs text-slate-400">—</span>}
          </div>
        </div>
      </div>
      {m.evidence?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="text-[10px] font-medium text-slate-400 uppercase mb-1.5">Evidence</div>
          <div className="flex flex-wrap gap-1.5">
            {m.evidence.map((e) => <span key={e} className="px-2 py-0.5 rounded text-[11px] bg-slate-50 text-slate-600 border border-slate-200">{e}</span>)}
          </div>
        </div>
      )}
      <p className="text-xs text-slate-400 mt-3 italic">Module count contributes to Migration Complexity.</p>
    </SectionCard>
  );
}