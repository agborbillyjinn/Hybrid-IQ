import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { scoreRelationship } from "./deriveOverview";
import { GitCompare } from "lucide-react";

export default function ScoreRelationship({ intel }) {
  const r = scoreRelationship(intel);
  if (!r) return null;
  return (
    <SectionCard
      title="Score Relationship"
      subtitle={r.show ? "Why Current Hybrid Fit and Future Enterprise Fit differ" : "Hybrid Fit and Future Enterprise Fit align"}
    >
      <div className="flex items-start gap-2.5">
        <GitCompare className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
        <p className="text-sm text-slate-700 leading-relaxed">
          {r.show
            ? r.text
            : "Current Hybrid Fit and Future Enterprise Fit are closely aligned — the account's transformation profile is consistent across both models."}
        </p>
      </div>
    </SectionCard>
  );
}