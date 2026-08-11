import React, { useState } from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Lightbulb, Loader2, CheckCircle2, ArrowRight, AlertCircle } from "lucide-react";

export default function ResearchGapsPanel({ reconciliation, account, onResolved }) {
  const gaps = reconciliation?.research_gaps || [];
  const [resolving, setResolving] = useState(null);
  const [resolved, setResolved] = useState(new Set());
  const [results, setResults] = useState({});
  const [error, setError] = useState("");

  const resolveGap = async (idx) => {
    const gap = gaps[idx];
    if (!gap || !account) return;
    setResolving(idx);
    setError("");
    try {
      const res = await base44.functions.invoke("resolveResearchGap", {
        account_id: account.id,
        company_name: account.company_name,
        gap: gap.gap,
        recommended_action: gap.recommended_action,
      });
      const data = res.data || res;
      setResults((r) => ({ ...r, [idx]: data }));
      setResolved((s) => new Set(s).add(idx));
      onResolved?.();
    } catch (e) {
      setError(e.message || "Research failed");
    } finally {
      setResolving(null);
    }
  };

  if (gaps.length === 0) {
    return (
      <SectionCard title="Research Gaps" subtitle="Highest-value missing evidence">
        <div className="flex items-center gap-2 text-sm text-emerald-600 py-4">
          <CheckCircle2 className="w-4 h-4" /> No critical research gaps identified. Evidence coverage is sufficient across major conclusions.
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Research Gaps" subtitle="Highest-value missing evidence — resolve to trigger targeted follow-up research">
      <div className="space-y-3">
        {gaps.map((g, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-semibold text-slate-900 text-sm">{g.gap}</span>
                  <PriorityBadge priority={g.priority} />
                </div>
                <p className="text-xs text-slate-500 ml-6">{g.why_it_matters}</p>
                <div className="ml-6 mt-2 flex flex-wrap gap-3 text-xs">
                  <span className="text-slate-400">Impact: <span className="text-slate-600 font-medium">{g.impact_on_score}</span></span>
                </div>
                <p className="text-xs text-slate-400 ml-6 mt-1.5 italic">→ {g.recommended_action}</p>
                {results[i] && (
                  <div className="ml-6 mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
                    Found {results[i].new_evidence_count} new evidence source(s). Transformation Probability: {results[i].previous_transform_probability}% → {results[i].new_transform_probability}%. Re-reconciled to v{results[i].version}.
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant={resolved.has(i) ? "outline" : "default"}
                onClick={() => resolveGap(i)}
                disabled={resolving === i}
                className="shrink-0"
              >
                {resolving === i ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Researching…</> : resolved.has(i) ? <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Resolved</> : <><ArrowRight className="w-3.5 h-3.5 mr-1.5" />Resolve</>}
              </Button>
            </div>
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-rose-600 mt-3 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" />{error}</p>}
    </SectionCard>
  );
}

function PriorityBadge({ priority }) {
  const styles = { High: "bg-rose-50 text-rose-700 border-rose-200", Medium: "bg-amber-50 text-amber-700 border-amber-200", Low: "bg-slate-100 text-slate-600 border-slate-200" };
  return <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${styles[priority] || styles.Low}`}>{priority}</span>;
}