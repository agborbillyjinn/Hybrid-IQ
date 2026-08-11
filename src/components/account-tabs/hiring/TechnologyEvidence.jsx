import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";

export default function TechnologyEvidence({ hi }) {
  const te = hi.technology_evidence || {};
  return (
    <SectionCard title="ERP Technology Evidence" subtitle="A job advert is a signal, not proof — technologies classified by context">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TechBlock label="Current System" items={te.current} tone="emerald" />
        <TechBlock label="Target System" items={te.target} tone="indigo" />
        <TechBlock label="Legacy System" items={te.legacy} tone="slate" />
        <TechBlock label="Integration" items={te.integration} tone="sky" />
      </div>
      <p className="text-xs text-slate-400 mt-4 italic">
        Technologies shown as "experience required" are not treated as the company's production ERP. Confidence reflects corroboration across vacancies.
      </p>
    </SectionCard>
  );
}

function TechBlock({ label, items, tone }) {
  const tones = {
    emerald: "border-emerald-100 bg-emerald-50/40", indigo: "border-indigo-100 bg-indigo-50/40",
    slate: "border-slate-200 bg-slate-50", sky: "border-sky-100 bg-sky-50/40",
  };
  return (
    <div className={`rounded-lg border p-3 ${tones[tone]}`}>
      <div className="text-[10px] font-semibold text-slate-500 uppercase mb-2">{label}</div>
      {items?.length ? (
        <div className="space-y-1.5">
          {items.map((t) => (
            <div key={t.technology} className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-800">{t.technology}</span>
              <span className="text-[10px] text-slate-400">{t.count} · {t.status}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-slate-400">None detected</div>
      )}
    </div>
  );
}