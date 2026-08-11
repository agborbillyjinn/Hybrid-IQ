import React, { useEffect, useState } from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { ConfidenceBadge } from "@/components/intelligence/Badges";
import { base44 } from "@/api/base44Client";
import { formatDate } from "@/lib/format";
import { evidenceStrengthStyle, sourceWeight, erpConfidenceStyle, erpConfidenceLabel } from "@/lib/erpData";
import { ExternalLink, History, ShieldCheck } from "lucide-react";

export default function EvidenceTab({ account, intel }) {
  const [evidence, setEvidence] = useState(intel.evidence || []);

  useEffect(() => {
    (async () => {
      try {
        const e = await base44.entities.Evidence.filter({ account_id: account.id });
        if (e.length) setEvidence(e);
      } catch (err) {}
    })();
  }, [account.id]);

  const sorted = [...evidence].sort((a, b) =>
    (a.evidence_date || a.date || "").localeCompare(b.evidence_date || b.date || "")
  );

  return (
    <SectionCard title="ERP Evidence Graph" subtitle="Every piece of evidence — inspect source, strength, date and what it supports">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-slate-400 uppercase border-b border-slate-100">
              <th className="py-2 pr-3 font-medium">Finding</th>
              <th className="py-2 px-3 font-medium">ERP</th>
              <th className="py-2 px-3 font-medium">Evidence Date</th>
              <th className="py-2 px-3 font-medium">Source</th>
              <th className="py-2 px-3 font-medium">Strength</th>
              <th className="py-2 px-3 font-medium">Score</th>
              <th className="py-2 px-3 font-medium">Era</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((ev, i) => {
              const strength = evidenceStrengthStyle(ev.evidence_strength);
              const w = sourceWeight(ev.source_type);
              const confLbl = erpConfidenceLabel(ev.confidence_score);
              const cs = erpConfidenceStyle(confLbl);
              return (
                <tr key={i} className="border-b border-slate-50 align-top">
                  <td className="py-3 pr-3 max-w-xs">
                    <div className="font-medium text-slate-800">{ev.finding}</div>
                    {(ev.evidence_extract || ev.evidence_summary) && (
                      <p className="text-xs text-slate-500 mt-1 italic">"{ev.evidence_extract || ev.evidence_summary}"</p>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-slate-700 font-medium">{ev.erp_vendor || ev.erp || "—"}</div>
                    {ev.erp_product && ev.erp_product !== ev.erp_vendor && <div className="text-xs text-slate-500">{ev.erp_product}</div>}
                    {ev.erp_version && <div className="text-xs text-slate-400">v{ev.erp_version}</div>}
                  </td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{formatDate(ev.evidence_date || ev.date)}</td>
                  <td className="py-3 px-3">
                    <div className="text-slate-600">{ev.source_type || "—"}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">weight {w}</span>
                      {ev.source_url && <a href={ev.source_url} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline"><ExternalLink className="w-3 h-3" /></a>}
                    </div>
                    {ev.source_name && <div className="text-xs text-slate-400 mt-0.5">{ev.source_name}</div>}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border ${strength.bg} ${strength.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${strength.dot}`} />{strength.label}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {ev.confidence_score != null ? (
                      <div>
                        <span className={`text-xs font-semibold ${cs.color}`}>{confLbl}</span>
                        <div className="text-xs text-slate-400">{ev.confidence_score}%</div>
                      </div>
                    ) : <ConfidenceBadge value={ev.confidence || ev.status} />}
                  </td>
                  <td className="py-3 px-3">
                    {ev.current_or_historical === "HISTORICAL" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500"><History className="w-3 h-3" />Historical</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600"><ShieldCheck className="w-3 h-3" />Current</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-slate-400">No evidence collected yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}