import React from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { erpEvidenceStats } from "./deriveOverview";
import { confidenceStyle } from "@/lib/erpData";
import { formatDate } from "@/lib/format";
import { FileSearch } from "lucide-react";

export default function ERPEvidenceSummary({ intel, account, onViewEvidence }) {
  const cur = intel.erp_inference?.current_erp || {};
  const tgt = intel.erp_inference?.likely_target_erp || intel.target_erp || {};
  const curStats = erpEvidenceStats(intel, cur, { isTarget: false });
  const tgtStats = erpEvidenceStats(intel, tgt, { isTarget: true });

  return (
    <SectionCard
      title="Current & Target ERP"
      subtitle="Evidence-backed ERP inference"
      action={
        <button onClick={onViewEvidence} className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700">
          <FileSearch className="w-3.5 h-3.5" />View Evidence
        </button>
      }
    >
      <div className="space-y-3">
        <ErpBlock label="Current ERP" product={curStats.product || account.current_erp || "Unknown"} stats={curStats} tone="slate" />
        <ErpBlock label="Likely Target ERP" product={tgtStats.product || tgt.next_erp || "—"} stats={tgtStats} tone="indigo" />
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-slate-500">Migration Probability</span>
          <span className="font-semibold text-slate-800">{tgt.probability || 0}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${tgt.probability || 0}%` }} />
        </div>
        <div className="text-xs text-slate-400 mt-1.5">Type: {tgt.migration_type || "—"}</div>
      </div>
      {tgt.why && <p className="text-sm text-slate-600 mt-3 leading-relaxed">{tgt.why}</p>}
    </SectionCard>
  );
}

function ErpBlock({ label, product, stats, tone }) {
  const conf = stats.confidence != null ? Math.round(stats.confidence) + "%" : "—";
  const style = confidenceStyle(stats.status);
  const toneCls = tone === "indigo" ? "bg-indigo-50/50 border-indigo-100" : "bg-slate-50 border-slate-100";
  return (
    <div className={`rounded-lg border p-3 ${toneCls}`}>
      <div className="flex items-center justify-between">
        <div className="text-[10px] text-slate-400 uppercase font-semibold">{label}</div>
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${style.bg} ${style.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          {stats.status}
        </span>
      </div>
      <div className="text-base font-semibold text-slate-800 mt-1">{product}</div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
        <span>{conf} confidence</span>
        <span>{stats.count} supporting source{stats.count === 1 ? "" : "s"}</span>
        <span>Latest: {stats.latest ? formatDate(stats.latest) : "—"}</span>
      </div>
    </div>
  );
}