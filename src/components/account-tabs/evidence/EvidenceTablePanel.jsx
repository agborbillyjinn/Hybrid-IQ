import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";

export default function EvidenceTablePanel({ evidence }) {
  const sorted = [...evidence].sort((a, b) =>
    (a.evidence_date || a.date || "").localeCompare(b.evidence_date || b.date || "")
  );
  return (
    <SectionCard title="Raw Evidence Graph" subtitle="Every piece of evidence — inspect source, strength, date and what it supports">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-slate-400 uppercase border-b border-slate-100">
              <th className="py-2 pr-3 font-medium">Finding</th>
              <th className="py-2 px-3 font-medium">ERP</th>
              <th className="py-2 px-3 font-medium">Date</th>
              <th className="py-2 px-3 font-medium">Source</th>
              <th className="py-2 px-3 font-medium">Strength</th>
              <th className="py-2 px-3 font-medium">Era</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((ev, i) => (
              <tr key={i} className="border-b border-slate-50 align-top">
                <td className="py-3 pr-3 max-w-xs">
                  <div className="font-medium text-slate-800">{ev.finding}</div>
                  {ev.evidence_extract && <p className="text-xs text-slate-500 mt-1 italic">"{ev.evidence_extract.slice(0, 150)}"</p>}
                </td>
                <td className="py-3 px-3">
                  <div className="text-slate-700 font-medium">{ev.erp_vendor || ev.erp || "—"}</div>
                  {ev.erp_product && <div className="text-xs text-slate-500">{ev.erp_product}</div>}
                </td>
                <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{ev.evidence_date || ev.date || "—"}</td>
                <td className="py-3 px-3">
                  <div className="text-slate-600">{ev.source_type || "—"}</div>
                  {ev.source_name && <div className="text-xs text-slate-400">{ev.source_name}</div>}
                </td>
                <td className="py-3 px-3">
                  {ev.source_strength != null ? (
                    <span className="text-xs font-medium text-slate-600">{(ev.source_strength * 100).toFixed(0)}%</span>
                  ) : "—"}
                </td>
                <td className="py-3 px-3">
                  <span className={`text-[11px] ${ev.current_or_historical === "HISTORICAL" ? "text-slate-500" : "text-emerald-600"}`}>
                    {ev.current_or_historical === "HISTORICAL" ? "Historical" : "Current"}
                  </span>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-slate-400">No evidence collected yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}