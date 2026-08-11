import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";

const INFLUENCE_COLOR = {
  High: "bg-rose-50 text-rose-600 border-rose-200",
  Medium: "bg-amber-50 text-amber-600 border-amber-200",
  Low: "bg-slate-50 text-slate-500 border-slate-200",
};

export default function BuyingCommitteeTab({ intel }) {
  const committee = intel.buying_committee || [];
  return (
    <SectionCard title="Buying Committee" subtitle="Likely personas — hypotheses, validate through discovery">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {committee.map((p, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900">{p.role}</h4>
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] px-2 py-0.5 rounded border ${INFLUENCE_COLOR[p.influence] || INFLUENCE_COLOR.Low}`}>Influence: {p.influence}</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-500">Priority: {p.priority}</span>
              </div>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              {p.pain && <Detail label="Likely Pain" value={p.pain} />}
              {p.cares_about && <Detail label="What They Care About" value={p.cares_about} />}
              {p.objection && <Detail label="Potential Objection" value={p.objection} />}
              {p.value_hypothesis && <Detail label="Hybrid Value Hypothesis" value={p.value_hypothesis} />}
              {p.discovery_angle && <Detail label="Best Discovery Angle" value={p.discovery_angle} />}
            </div>
          </div>
        ))}
        {committee.length === 0 && <p className="text-sm text-slate-400 col-span-2">No buying committee generated.</p>}
      </div>
    </SectionCard>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="text-[11px] text-slate-400 uppercase">{label}</div>
      <p className="text-slate-700 mt-0.5">{value}</p>
    </div>
  );
}