import React, { useEffect, useState } from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { base44 } from "@/api/base44Client";
import { formatDate } from "@/lib/format";
import { Loader2, Bug, AlertCircle } from "lucide-react";

export default function DebugTab({ account }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!account.analysis_id) { setLoading(false); return; }
      try {
        const jobs = await base44.entities.AnalysisJob.filter({ analysis_id: account.analysis_id });
        setJob(jobs[0] || null);
      } catch (e) {} finally { setLoading(false); }
    })();
  }, [account.analysis_id]);

  if (loading) return <div className="p-4 text-slate-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading analysis job…</div>;

  if (!job) {
    return (
      <SectionCard title="Analysis Job Debug">
        <p className="text-sm text-slate-400">No analysis job linked to this account (it may predate the orchestration refactor).</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Analysis Job Debug" subtitle="Internal orchestration metadata">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Analysis Job ID" value={job.analysis_id} mono />
        <Field label="Analysis Version" value={job.analysis_version} />
        <Field label="Data Source" value={job.source_provider} />
        <Field label="Processing Status" value={job.status} />
        <Field label="Started At" value={fmtTime(job.started_at)} />
        <Field label="Completed At" value={fmtTime(job.completed_at)} />
        <Field label="Retrieved At" value={fmtTime(job.retrieved_at)} />
        <Field label="Evidence Type" value={job.evidence_type} />
        <Field label="Confidence" value={job.confidence} />
        <Field label="Research Sources" value={job.research_sources} />
      </div>
      {job.error && (
        <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-rose-600 uppercase mb-0.5">Errors</div>
            <p className="text-sm text-rose-700">{job.error}</p>
          </div>
        </div>
      )}
      {account.source_provider === "mock" && (
        <div className="mt-4 p-3 rounded-lg bg-violet-50 border border-violet-200 flex items-center gap-2">
          <Bug className="w-4 h-4 text-violet-600 shrink-0" />
          <p className="text-sm text-violet-700">This account was generated using <strong>Mock Analysis Mode</strong> — realistic internal test data, not live research.</p>
        </div>
      )}
    </SectionCard>
  );
}

function fmtTime(d) {
  if (!d) return "—";
  return formatDate(d) + " " + new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function Field({ label, value, mono }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
      <div className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</div>
      <div className={`text-sm font-medium text-slate-800 mt-0.5 break-all ${mono ? "font-mono text-xs" : ""}`}>{value || "—"}</div>
    </div>
  );
}