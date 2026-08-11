import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { SOURCE_WEIGHTS } from "@/lib/erpData";

export default function ConfidenceMethodology() {
  const rows = Object.entries(SOURCE_WEIGHTS).sort((a, b) => b[1] - a[1]);
  return (
    <SectionCard title="Evidence Confidence Methodology" subtitle="How HybridIQ weights source quality when calculating ERP confidence">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        {rows.map(([type, weight]) => (
          <div key={type} className="flex items-center justify-between py-1.5 border-b border-slate-50">
            <span className="text-sm text-slate-600">{type}</span>
            <span className="text-sm font-semibold text-slate-800 tabular-nums">{weight}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-3">Final confidence also factors recency, number of corroborating sources, and whether newer evidence contradicts older evidence. HybridIQ prefers uncertainty over fabricated certainty.</p>
    </SectionCard>
  );
}