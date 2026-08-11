import React, { useEffect, useState } from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { base44 } from "@/api/base44Client";
import { formatDate } from "@/lib/format";
import { GitCommit, TrendingUp } from "lucide-react";

export default function AnalysisHistoryPanel({ account }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!account?.id) return;
      try {
        const v = await base44.entities.AnalysisVersion.filter({ account_id: account.id }, "-version", 50);
        setVersions(v);
      } catch (e) {}
      setLoading(false);
    })();
  }, [account?.id]);

  if (loading) return <p className="text-sm text-slate-400">Loading analysis history…</p>;
  if (versions.length === 0) return <p className="text-sm text-slate-400">No version history yet. Run an analysis or resolve a research gap to create version snapshots.</p>;

  return (
    <SectionCard title="Analysis History" subtitle="Versioned snapshots — compare scores and evidence health over time">
      <div className="space-y-3">
        {versions.map((v, i) => {
          const prev = versions[i + 1];
          const tp = v.scores?.transformation_probability?.value;
          const prevTp = prev?.scores?.transformation_probability?.value;
          const delta = tp != null && prevTp != null ? tp - prevTp : null;
          return (
            <div key={v.id || i} className="border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GitCommit className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-900 text-sm">v{v.version}</span>
                  <span className="text-xs text-slate-400">{formatDate(v.created_at)}</span>
                </div>
                <span className="text-xs text-slate-400">{v.trigger_reason || "initial_analysis"}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <Metric label="Evidence Health" value={v.evidence_health != null ? `${v.evidence_health}/100` : "—"} />
                <Metric label="Independent Sources" value={v.independent_source_count} />
                <Metric label="Total Sources" value={v.source_count} />
                <Metric label="Research Gaps" value={v.research_gaps_count} />
              </div>
              {delta != null && delta !== 0 && (
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  <TrendingUp className={`w-3.5 h-3.5 ${delta > 0 ? "text-emerald-600" : "text-rose-600"}`} />
                  <span className={delta > 0 ? "text-emerald-600" : "text-rose-600"}>
                    Transformation Probability: {prevTp}% → {tp}% ({delta > 0 ? "+" : ""}{delta}%)
                  </span>
                </div>
              )}
              {v.major_conclusions && Array.isArray(v.major_conclusions) && v.major_conclusions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {v.major_conclusions.slice(0, 6).map((c, j) => (
                    <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {c.conclusion}: {c.value} ({c.confidence}%)
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <div className="text-[10px] text-slate-400 uppercase">{label}</div>
      <div className="text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}