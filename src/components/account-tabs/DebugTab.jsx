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
        <Field label="Research Mode" value={job.research_mode} />
      </div>
      {job.intelligence?.research_metadata && (
        <div className="mt-4">
          <div className="text-xs font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1.5"><Bug className="w-3.5 h-3.5" /> Hiring Research Audit</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Research Mode" value={job.intelligence.research_metadata.research_mode} />
            <Field label="Last Job Search" value={fmtTime(job.intelligence.research_metadata.last_job_search)} />
            <Field label="Vacancies Found" value={job.intelligence.research_metadata.vacancies_found} />
            <Field label="Duplicates Removed" value={job.intelligence.research_metadata.duplicates_removed} />
            <Field label="Vacancies Persisted" value={job.intelligence.research_metadata.vacancies_persisted} />
            <Field label="LLM Calls" value={job.intelligence.research_metadata.llm_calls} />
            <Field label="Duration (ms)" value={job.intelligence.research_metadata.duration_ms} />
            <Field label="Coverage Confidence" value={job.intelligence.research_metadata.coverage_confidence} />
            <Field label="Sources Checked" value={(job.intelligence.research_metadata.sources_checked || []).join(", ")} />
            <Field label="Search Queries" value={(job.intelligence.research_metadata.search_queries || []).join(" | ")} />
          </div>
          {job.intelligence.research_metadata.errors?.length > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <div className="text-xs font-semibold text-amber-600 uppercase mb-1">Research Errors</div>
              <ul className="text-sm text-amber-700 list-disc list-inside">
                {job.intelligence.research_metadata.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
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