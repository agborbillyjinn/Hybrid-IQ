import React, { useEffect, useState } from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { ConfidenceBadge } from "@/components/intelligence/Badges";
import { base44 } from "@/api/base44Client";
import { ExternalLink, Calendar } from "lucide-react";

export default function ERPHistoryTab({ intel, accountId }) {
  const [events, setEvents] = useState(intel.erp_history || []);

  useEffect(() => {
    (async () => {
      try {
        const evs = await base44.entities.ERPEvent.filter({ account_id: accountId });
        evs.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
        if (evs.length) setEvents(evs);
      } catch (e) {}
    })();
  }, [accountId]);

  if (!events.length) {
    return <SectionCard title="ERP History"><p className="text-sm text-slate-400">No ERP history events detected.</p></SectionCard>;
  }

  return (
    <div className="space-y-5">
      <SectionCard title="ERP History Timeline" subtitle="Chronological ERP events across the organisation's history">
        <div className="relative pl-6">
          <div className="absolute left-2 top-1 bottom-1 w-px bg-slate-200" />
          {events.map((ev, i) => (
            <div key={i} className="relative pb-6 last:pb-0">
              <div className="absolute -left-[18px] top-1 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-white" />
              <div className="flex items-start gap-3">
                <div className="text-xs font-semibold text-slate-400 w-16 shrink-0 pt-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />{ev.date || "—"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-900">{ev.erp || "ERP"}</span>
                    {ev.event_type && <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-500">{ev.event_type}</span>}
                    <ConfidenceBadge value={ev.confidence} />
                  </div>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{ev.description}</p>
                  {ev.evidence && <p className="text-xs text-slate-400 mt-1">{ev.evidence}</p>}
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                    {ev.source_type && <span>{ev.source_type}</span>}
                    {ev.source_url && <a href={ev.source_url} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" />Source</a>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}