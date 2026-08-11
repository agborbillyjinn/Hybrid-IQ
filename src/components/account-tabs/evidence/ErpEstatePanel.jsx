import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { Server, History, Target, MapPin, Building2, Box, HelpCircle } from "lucide-react";

export default function ErpEstatePanel({ reconciliation }) {
  const estate = reconciliation?.erp_estate;
  if (!estate) return <p className="text-sm text-slate-400">No ERP estate data.</p>;

  return (
    <div className="space-y-5">
      <SectionCard title="ERP Estate Model" subtitle="Multi-system estate — not a single 'Current ERP' field">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EstateRole icon={Server} label="Primary ERP" role={estate.primary} tone="emerald" />
          <EstateRole icon={Target} label="Target ERP" role={estate.target} tone="blue" />
          <EstateRole icon={History} label="Legacy ERP" role={estate.legacy} tone="slate" multi />
          <EstateRole icon={Box} label="Specialist ERP" role={estate.specialist} tone="violet" multi />
          <EstateRole icon={MapPin} label="Regional ERP" role={estate.regional} tone="amber" multi />
          <EstateRole icon={Building2} label="Subsidiary / Acquired" role={[...(estate.subsidiary || []), ...(estate.acquired || [])]} tone="rose" multi />
        </div>
        {estate.unknown && (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-lg p-3">
            <HelpCircle className="w-4 h-4" /> Insufficient evidence to determine the ERP estate. Prefer UNKNOWN over false certainty.
          </div>
        )}
      </SectionCard>

      <SectionCard title="ERP Evidence Clusters" subtitle="Current, historical and target ERP conclusions reconciled across sources">
        <div className="space-y-3">
          {reconciliation.clusters.filter((c) => ["current_erp", "historical_erp", "target_erp", "erp_version", "erp_modules", "cloud_platform", "integration_technologies"].includes(c.tag)).map((c, i) => (
            <ClusterRow key={i} cluster={c} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function EstateRole({ icon: Icon, label, role, tone, multi }) {
  const toneClasses = {
    emerald: "border-emerald-200 bg-emerald-50/50",
    blue: "border-blue-200 bg-blue-50/50",
    slate: "border-slate-200 bg-slate-50/50",
    violet: "border-violet-200 bg-violet-50/50",
    amber: "border-amber-200 bg-amber-50/50",
    rose: "border-rose-200 bg-rose-50/50",
  };
  const items = multi ? (role || []) : (role ? [role] : []);
  return (
    <div className={`rounded-lg border p-3 ${toneClasses[tone]}`}>
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase mb-2"><Icon className="w-3.5 h-3.5" />{label}</div>
      {items.length === 0 ? (
        <div className="text-sm text-slate-400 italic">No evidence</div>
      ) : (
        items.map((r, i) => (
          <div key={i} className="text-sm">
            <span className="font-semibold text-slate-800">{r.product}</span>
            {r.vendor && r.vendor !== r.product && <span className="text-slate-500"> · {r.vendor}</span>}
            {r.transformation_underway && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">TRANSFORMATION UNDERWAY</span>}
            {r.llm_inferred && <span className="ml-1 text-[10px] text-slate-400">· inferred</span>}
            {r.confidence != null && <span className="ml-1 text-xs text-slate-400">({r.confidence}%)</span>}
          </div>
        ))
      )}
    </div>
  );
}

function ClusterRow({ cluster }) {
  return (
    <div className="border border-slate-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-500 uppercase">{cluster.label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">{cluster.confidence}%</span>
          <span className="text-[10px] px-2 py-0.5 rounded border bg-slate-50 text-slate-600">{cluster.status}</span>
        </div>
      </div>
      <div className="text-sm font-semibold text-slate-900 mb-1">{cluster.value || "—"}</div>
      <p className="text-xs text-slate-500">{cluster.explanation}</p>
      {cluster.interpretation && <p className="text-xs text-amber-700 mt-1 italic">{cluster.interpretation}</p>}
    </div>
  );
}