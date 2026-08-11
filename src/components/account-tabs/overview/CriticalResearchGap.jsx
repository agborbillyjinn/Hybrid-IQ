import React, { useState } from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { deriveWhyItMatters } from "./deriveOverview";
import { ShieldQuestion, Compass, ArrowRight, CheckCircle2 } from "lucide-react";

export default function CriticalResearchGap({ intel, account }) {
  const { toast } = useToast();
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(false);

  const tp = intel.scores?.transformation_probability || {};
  const unknown = tp.biggest_unknown || (intel.erp_inference?.unanswered_questions || [])[0] || "Not determined";
  const recommended = tp.next_action || (intel.erp_inference?.recommended_research || [])[0] || "—";
  const whyItMatters = deriveWhyItMatters(unknown);
  const evidenceCount = (intel.evidence || []).length;
  const confLabel = intel.erp_inference?.current_erp?.confidence_label || "INFERRED";
  const currentEvidence = `${evidenceCount} evidence record${evidenceCount === 1 ? "" : "s"} · ${confLabel} confidence`;
  const confidence = tp.level || "—";

  const resolveGap = async () => {
    setResolving(true);
    try {
      await base44.entities.AnalysisJob.create({
        analysis_id: "gap_" + crypto.randomUUID(),
        company_name: account.company_name,
        company_id: account.id,
        status: "pending",
        started_at: new Date().toISOString(),
        research_sources: "Research gap: " + unknown,
      });
      setResolved(true);
      toast({ title: "Research task created", description: "A placeholder analysis job has been queued to resolve this gap." });
    } catch (e) {
      toast({ title: "Could not create research task", description: e.message, variant: "destructive" });
    } finally {
      setResolving(false);
    }
  };

  return (
    <SectionCard title="Critical Research Gap" subtitle="Largest unknown affecting this account">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-rose-500 uppercase"><ShieldQuestion className="w-3.5 h-3.5" />Unknown</div>
          <p className="text-sm font-medium text-slate-800 mt-1">{unknown}</p>
        </div>
        <div>
          <div className="text-[10px] font-medium text-slate-400 uppercase">Why It Matters</div>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{whyItMatters}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] font-medium text-slate-400 uppercase">Current Evidence</div>
            <p className="text-sm text-slate-700 mt-1">{currentEvidence}</p>
          </div>
          <div>
            <div className="text-[10px] font-medium text-slate-400 uppercase">Confidence</div>
            <p className="text-sm text-slate-700 mt-1">{confidence}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 pt-3 border-t border-slate-100">
          <Compass className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="text-[10px] font-medium text-slate-400 uppercase">Recommended Research</div>
            <p className="text-sm text-slate-700 mt-1">{recommended}</p>
          </div>
        </div>
        <button
          onClick={resolveGap}
          disabled={resolving || resolved}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-60 transition-colors"
        >
          {resolved ? (
            <><CheckCircle2 className="w-3.5 h-3.5" />Research task queued</>
          ) : (
            <>{resolving ? "Creating…" : "Resolve Gap"}{!resolving && <ArrowRight className="w-3.5 h-3.5" />}</>
          )}
        </button>
      </div>
    </SectionCard>
  );
}