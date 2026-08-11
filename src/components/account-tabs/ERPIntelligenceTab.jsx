import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import InferenceSummary from "./erp-intelligence/InferenceSummary";
import ERPTimeline from "./erp-intelligence/ERPTimeline";
import EvidenceConflicts from "./erp-intelligence/EvidenceConflicts";
import Unknowns from "./erp-intelligence/Unknowns";
import ConfidenceMethodology from "./erp-intelligence/ConfidenceMethodology";
import { Boxes, Link2, Wrench } from "lucide-react";

export default function ERPIntelligenceTab({ account, intel }) {
  const inf = intel.erp_inference || {};
  return (
    <div className="space-y-5">
      <InferenceSummary inference={inf} />
      <ERPTimeline timeline={inf.historical_timeline} events={intel.erp_history} />
      <KnownEstate inference={inf} />
      <EvidenceConflicts conflicts={inf.evidence_conflicts} />
      <Unknowns unansweredQuestions={inf.unanswered_questions} recommendedResearch={inf.recommended_research} />
      <ConfidenceMethodology />
    </div>
  );
}

function KnownEstate({ inference }) {
  const modules = inference.known_modules || [];
  const integrations = inference.known_integrations || [];
  const customisations = inference.known_customisations || [];
  if (!modules.length && !integrations.length && !customisations.length) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <KnownList icon={Boxes} title="Known Modules" items={modules} field="module" />
      <KnownList icon={Link2} title="Known Integrations" items={integrations} field="integration" />
      <KnownList icon={Wrench} title="Known Customisations" items={customisations} field="customisation" />
    </div>
  );
}

function KnownList({ icon: Icon, title, items, field }) {
  return (
    <SectionCard title={title} subtitle={`${items.length} identified from evidence`}>
      {items.length ? (
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={i} className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-sm text-slate-700">{it[field]}</span>
                  {it.evidence_ref && <p className="text-xs text-slate-400 mt-0.5">{it.evidence_ref}</p>}
                </div>
              </div>
              {it.confidence != null && <span className="text-xs text-slate-400 shrink-0">{it.confidence}%</span>}
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-slate-400">None identified.</p>}
    </SectionCard>
  );
}