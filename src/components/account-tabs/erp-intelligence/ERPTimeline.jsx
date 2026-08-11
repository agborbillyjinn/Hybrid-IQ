import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { erpConfidenceStyle } from "@/lib/erpData";
import { Calendar } from "lucide-react";

export default function ERPTimeline({ timeline, events }) {
  const items = (timeline && timeline.length) ? timeline : (events || []).map((ev) => ({
    date: ev.date, erp: ev.erp, event: ev.description,
    confidence: typeof ev.confidence === "number" ? ev.confidence : 60,
    confidence_label: undefined,
    evidence_refs: ev.evidence ? [ev.evidence] : [],
  }));
  if (!items.length) {
    return <SectionCard title="ERP Timeline"><p className="text-sm text-slate-400">No ERP timeline events detected.</p></SectionCard>;
  }
  return (
    <SectionCard title="ERP Timeline" subtitle="Chronological ERP technology history — historical evidence is retained, never overwritten">
      <div className="relative pl-6">
        <div className="absolute left-2 top-1 bottom-1 w-px bg-slate-200" />
        {items.map((it, i) => {
          const conf = it.confidence_label || (it.confidence >= 70 ? "HIGH" : it.confidence >= 40 ? "MEDIUM" : "LOW");
          const s = erpConfidenceStyle(conf);
          return (
            <div key={i} className="relative pb-6 last:pb-0">
              <div className={`absolute -left-[18px] top-1 w-3 h-3 rounded-full ${s.bar} ring-4 ring-white`} />
              <div className="flex items-start gap-3">
                <div className="text-xs font-semibold text-slate-400 w-16 shrink-0 pt-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />{it.date || "—"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-900">{it.erp || "ERP"}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${s.bg} ${s.color} border`}>{conf}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{it.event}</p>
                  {it.evidence_refs?.length > 0 && (
                    <ul className="mt-1.5 space-y-1">
                      {it.evidence_refs.map((e, j) => (
                        <li key={j} className="text-xs text-slate-400 flex items-start gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 shrink-0" />{e}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}