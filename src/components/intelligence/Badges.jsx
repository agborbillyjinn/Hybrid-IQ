import React from "react";
import { confidenceStyle, priorityStyle, tierStyle, scoreBand, fitBand } from "@/lib/erpData";

export function ConfidenceBadge({ value }) {
  const s = confidenceStyle(value);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${s.bg} ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {(value || "UNKNOWN").toUpperCase()}
    </span>
  );
}

export function PriorityBadge({ value }) {
  const s = priorityStyle(value);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${s.bg} ${s.color}`}>
      {(value || "—").toUpperCase()}
    </span>
  );
}

export function TierBadge({ value }) {
  const s = tierStyle(value);
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${s.bg} ${s.color}`}>{value || "—"}</span>;
}

export function ScoreBadge({ value, type = "score" }) {
  const band = type === "fit" ? fitBand(value) : scoreBand(value);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${band.bg} ${band.color}`}>
      {band.label}
    </span>
  );
}