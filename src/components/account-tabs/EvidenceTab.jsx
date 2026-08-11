import React, { useEffect, useState } from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { ConfidenceBadge } from "@/components/intelligence/Badges";
import { base44 } from "@/api/base44Client";
import { formatDate } from "@/lib/format";
import { ExternalLink } from "lucide-react";

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

  return (
    <SectionCard title="Evidence Center" subtitle="All evidence supporting AI conclusions — inspect sources and confidence">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-slate-400 uppercase border-b border-slate-100">
              <th className="py-2 pr-3 font-medium">Finding</th>
              <th className="py-2 px-3 font-medium">ERP</th>
              <th className="py-2 px-3 font-medium">Date</th>
              <th className="py-2 px-3 font-medium">Source Type</th>
              <th className="py-2 px-3 font-medium">Source</th>
              <th className="py-2 px-3 font-medium">Confidence</th>
              <th className="py-2 px-3 font-medium">Supports</th>
            </tr>
          </thead>
          <tbody>
            {evidence.map((ev, i) => (
              <tr key={i} className="border-b border-slate-50 align-top">
                <td className="py-3 pr-3">
                  <div className="font-medium text-slate-800">{ev.finding}</div>
                  {ev.evidence_extract || ev.extract ? <p className="text-xs text-slate-500 mt-1 max-w-md italic">"{ev.evidence_extract || ev.extract}"</p> : null}
                </td>
                <td className="py-3 px-3 text-slate-600">{ev.erp || "—"}</td>
                <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{formatDate(ev.date)}</td>
                <td className="py-3 px-3 text-slate-600">{ev.source_type || "—"}</td>
                <td className="py-3 px-3">
                  {ev.source_name || (ev.source_url ? <a href={ev.source_url} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline inline-flex items-center gap-1"><ExternalLink className="w-3 h-3" />Link</a> : "—")}
                  {ev.source_name && ev.source_url && <a href={ev.source_url} target="_blank" rel="noreferrer" className="block text-xs text-indigo-500 hover:underline mt-0.5 inline-flex items-center gap-1"><ExternalLink className="w-3 h-3" />View</a>}
                </td>
                <td className="py-3 px-3"><ConfidenceBadge value={ev.confidence || ev.status} /></td>
                <td className="py-3 px-3 text-xs text-slate-500 max-w-[160px]">{ev.supported_fields || "—"}</td>
              </tr>
            ))}
            {evidence.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-slate-400">No evidence collected yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}