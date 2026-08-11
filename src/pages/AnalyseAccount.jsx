import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crosshair, Sparkles } from "lucide-react";
import { ERP_SYSTEMS, INDUSTRIES } from "@/lib/erpData";
import ResearchStatus, { STAGES } from "@/components/ResearchStatus";

const FIELDS = [
  { name: "company_name", label: "Company Name", required: true, placeholder: "e.g. Contoso Manufacturing Ltd" },
  { name: "website", label: "Company Website", placeholder: "https://…" },
  { name: "country", label: "Country", placeholder: "United Kingdom" },
  { name: "estimated_erp_users", label: "Estimated ERP Users", type: "number" },
  { name: "employees", label: "Employees", type: "number" },
  { name: "revenue", label: "Revenue (GBP)", type: "number" },
];

export default function AnalyseAccount() {
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stage, setStage] = useState("researching_company");
  const timerRef = useRef(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const runAnalysis = async () => {
    if (!form.company_name?.trim()) {
      setError("Company name is required.");
      return;
    }
    setLoading(true);
    setError("");
    setStage("researching_company");

    // Animate through stages while the synchronous built-in analysis runs
    let stageIdx = 0;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      stageIdx = Math.min(stageIdx + 1, STAGES.length - 2);
      setStage(STAGES[stageIdx].key);
    }, 7000);

    try {
      const res = await base44.functions.invoke("startAnalysis", form);
      const data = res.data || {};
      let intelligence = data.intelligence;

      if (data.async && !intelligence) {
        // External n8n workflow — poll the job until it completes
        clearInterval(timerRef.current);
        intelligence = await waitForJob(data.analysis_id, setStage);
      }

      clearInterval(timerRef.current);
      setStage("complete");

      const account = await createAccountFromIntelligence(form, intelligence, data.analysis_id);
      await persistChildren(account.id, form.company_name, intelligence);
      navigate(`/accounts/${account.id}`);
    } catch (e) {
      clearInterval(timerRef.current);
      setError(e.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <Crosshair className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Analyse Account</h1>
          <p className="text-sm text-slate-500">Run AI account intelligence on any company across 20+ ERP systems.</p>
        </div>
      </div>

      <Card className="mt-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FIELDS.map((f) => (
            <div key={f.name} className={f.name === "company_name" ? "md:col-span-2" : ""}>
              <Label className="text-xs font-medium text-slate-600">
                {f.label}{f.required && <span className="text-rose-500 ml-0.5">*</span>}
              </Label>
              <Input
                type={f.type || "text"}
                value={form[f.name] || ""}
                onChange={(e) => set(f.name, e.target.value)}
                placeholder={f.placeholder}
                className="mt-1.5"
              />
            </div>
          ))}
          <div>
            <Label className="text-xs font-medium text-slate-600">Industry</Label>
            <Select value={form.industry || ""} onValueChange={(v) => set("industry", v)}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select industry" /></SelectTrigger>
              <SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium text-slate-600">Known ERP</Label>
            <Select value={form.known_erp || ""} onValueChange={(v) => set("known_erp", v)}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Optional — AI will infer" /></SelectTrigger>
              <SelectContent>{ERP_SYSTEMS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium text-slate-600">Research Mode</Label>
            <Select value={form.research_mode || ""} onValueChange={(v) => set("research_mode", v)}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Use default (from settings)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MOCK">MOCK — test data</SelectItem>
                <SelectItem value="LIVE">LIVE — external job sources</SelectItem>
                <SelectItem value="HYBRID">HYBRID — live + AI inference</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs font-medium text-slate-600">Notes</Label>
            <Textarea
              value={form.notes || ""}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Anything the AI should know — context, rumours, prior conversations…"
              className="mt-1.5"
              rows={3}
            />
          </div>
        </div>

        {error && <p className="text-sm text-rose-600 mt-4">{error}</p>}

        <Button
          onClick={runAnalysis}
          disabled={loading}
          size="lg"
          className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {loading ? "Running account intelligence…" : "Run Account Intelligence"}
        </Button>

        {loading && (
          <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <ResearchStatus currentStage={stage} />
          </div>
        )}

        {!loading && (
          <p className="text-[11px] text-slate-400 text-center mt-3">
            AI-generated intelligence distinguishes fact, inference, estimate and hypothesis. Commercial figures are illustrative pre-discovery estimates.
          </p>
        )}
      </Card>
    </div>
  );
}

async function waitForJob(analysisId, setStage) {
  let elapsed = 0;
  return new Promise((resolve, reject) => {
    const poll = setInterval(async () => {
      elapsed += 3;
      if (elapsed > 180) {
        clearInterval(poll);
        reject(new Error("Analysis timed out — the external workflow did not return in time."));
        return;
      }
      try {
        const jobs = await base44.entities.AnalysisJob.filter({ analysis_id: analysisId });
        const job = jobs[0];
        if (!job) return;
        if (job.status === "complete") {
          clearInterval(poll);
          resolve(job.intelligence || {});
        } else if (job.status === "failed") {
          clearInterval(poll);
          reject(new Error(job.error || "Analysis failed"));
        } else if (job.status !== "pending") {
          setStage(job.status);
        }
      } catch (e) {
        // keep polling
      }
    }, 3000);
  });
}

async function createAccountFromIntelligence(form, intel, analysisId) {
  const scores = intel.scores || {};
  const cm = intel.commercial_model || {};
  const tradCost = (cm.traditional || {}).cost || {};
  const expectedScenario = (cm.hybrid_scenarios || []).find((s) => s.name?.toLowerCase().includes("expected")) || {};
  return await base44.entities.Account.create({
    company_name: form.company_name,
    website: form.website,
    country: form.country,
    industry: form.industry || intel.company_overview?.industry,
    known_erp: form.known_erp,
    estimated_erp_users: num(form.estimated_erp_users),
    employees: num(form.employees) || intel.company_overview?.employees,
    revenue: num(form.revenue) || intel.company_overview?.revenue,
    notes: form.notes,
    logo_url: intel.company_overview?.logo_url || "",
    headquarters: intel.company_overview?.headquarters,
    locations: intel.company_overview?.locations,
    ownership: intel.company_overview?.ownership,
    last_analysed: new Date().toISOString(),
    transformation_probability: scores.transformation_probability?.value,
    hybrid_fit: scores.hybrid_fit?.value,
    future_enterprise_fit: scores.future_enterprise_fit?.value,
    migration_complexity: scores.migration_complexity?.value,
    estimated_traditional_cost_low: tradCost.low,
    estimated_traditional_cost_expected: tradCost.expected,
    estimated_traditional_cost_high: tradCost.high,
    potential_saving: expectedScenario.saving,
    estimated_months_saved: expectedScenario.months_saved,
    priority: derivePriority(scores.transformation_probability?.value, scores.hybrid_fit?.value),
    primary_trigger: (intel.signals || [])[0]?.signal,
    current_erp: intel.erp_estate?.current_erp_product?.value || form.known_erp,
    target_erp: intel.target_erp?.next_erp || intel.target_erp?.product,
    saved: false,
    source_provider: intel.source_provider || "builtin-llm",
    analysis_id: analysisId,
    intelligence: intel,
  });
}

function num(v) {
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}

function derivePriority(prob, fit) {
  const p = Number(prob) || 0;
  const f = Number(fit) || 0;
  if (p >= 70 && f >= 60) return "High";
  if (p >= 45 || f >= 45) return "Medium";
  return "Low";
}

async function persistChildren(accountId, companyName, intel) {
  try {
    if (intel.evidence?.length) {
      await base44.entities.Evidence.bulkCreate(
        intel.evidence.map((e) => ({
          account_id: accountId, company: companyName,
          finding: e.finding, erp: e.erp, erp_vendor: e.erp_vendor, erp_product: e.erp_product, erp_version: e.erp_version,
          date: e.evidence_date || e.date, evidence_date: e.evidence_date, date_found: e.date_found,
          source_type: e.source_type, source_name: e.source_name, source_url: e.source_url,
          evidence_extract: e.evidence_extract || e.extract, evidence_summary: e.evidence_summary,
          confidence: e.confidence, status: e.status || e.confidence,
          evidence_strength: e.evidence_strength, confidence_score: e.confidence_score,
          current_or_historical: e.current_or_historical,
          last_checked: new Date().toISOString(), last_verified: e.last_verified, supported_fields: e.supported_fields,
        }))
      );
    }
    if (intel.signals?.length) {
      await base44.entities.Signal.bulkCreate(
        intel.signals.map((s) => ({
          account_id: accountId, company: companyName, signal: s.signal, category: s.category, date: s.date,
          strength: s.strength, source: s.source, confidence: s.confidence,
          why_it_matters: s.why_it_matters, impact_on_probability: s.impact_on_probability,
        }))
      );
    }
    if (intel.erp_history?.length) {
      await base44.entities.ERPEvent.bulkCreate(
        intel.erp_history.map((h) => ({
          account_id: accountId, company: companyName, date: h.date, erp: h.erp, event_type: h.event_type,
          description: h.description, confidence: h.confidence, evidence: h.evidence,
          source_url: h.source_url, source_type: h.source_type,
        }))
      );
    }
    if (intel.job_vacancies?.length) {
      await base44.entities.JobVacancy.bulkCreate(
        intel.job_vacancies.map((v) => ({
          account_id: accountId, company: companyName,
          job_title: v.job_title, location: v.location,
          date_posted: v.date_posted, date_first_detected: v.date_first_detected, date_last_detected: v.date_last_detected,
          status: v.status, employment_type: v.employment_type,
          salary_low: v.salary_low, salary_high: v.salary_high,
          contract_rate_low: v.contract_rate_low, contract_rate_high: v.contract_rate_high,
          currency: v.currency, advertised_compensation: v.advertised_compensation,
          compensation_type: v.compensation_type, market_rate_low: v.market_rate_low, market_rate_high: v.market_rate_high,
          market_rate_confidence: v.market_rate_confidence, assumption_source: v.assumption_source,
          erp_vendor: v.erp_vendor, erp_product: v.erp_product, erp_version: v.erp_version,
          erp_modules: (v.erp_modules || []).join(", "),
          technical_skills: (v.technical_skills || []).join(", "),
          integration_technologies: (v.integration_technologies || []).join(", "),
          cloud_technologies: (v.cloud_technologies || []).join(", "),
          responsibilities: v.responsibilities,
          programme_language: v.programme_language, migration_language: v.migration_language,
          transformation_language: v.transformation_language, implementation_language: v.implementation_language,
          support_language: v.support_language, greenfield_brownfield: v.greenfield_brownfield,
          source: v.source, source_url: v.source_url, source_quality: v.source_quality,
          raw_text_reference: v.raw_text_reference, search_query: v.search_query, canonical_url: v.canonical_url,
          dedup_hash: v.dedup_hash, technology_role: v.technology_role, programme_stage_signal: v.programme_stage_signal,
          llm_inferred: v.llm_inferred, evidence_confidence: v.evidence_confidence, classification: v.classification,
        }))
      );
      // Create Evidence records for live vacancies (mock already carries its own evidence)
      if (intel.source_provider !== "mock") {
        await base44.entities.Evidence.bulkCreate(
          intel.job_vacancies.map((v) => ({
            account_id: accountId, company: companyName,
            finding: `${v.job_title} — ${v.erp_product || "ERP"} vacancy (${v.status})`,
            erp: v.erp_product, erp_vendor: v.erp_vendor, erp_product: v.erp_product, erp_version: v.erp_version,
            date: v.date_posted, evidence_date: v.date_posted, date_found: v.date_first_detected,
            source_type: v.status === "HISTORICAL" ? "Historic Job Vacancy" : "Current Job Vacancy",
            source_name: v.source, source_url: v.source_url,
            evidence_extract: (v.raw_text_reference || v.responsibilities || "").slice(0, 500),
            evidence_summary: `${v.job_title} at ${companyName} (${v.employment_type || "Unknown"})`,
            confidence: (v.evidence_confidence || 0) >= 80 ? "HIGHLY LIKELY" : (v.evidence_confidence || 0) >= 60 ? "INFERRED" : "UNKNOWN",
            status: (v.evidence_confidence || 0) >= 80 ? "HIGHLY LIKELY" : "INFERRED",
            evidence_strength: "STRONG",
            confidence_score: v.evidence_confidence,
            current_or_historical: v.status === "HISTORICAL" ? "HISTORICAL" : "CURRENT",
            last_checked: new Date().toISOString(),
            supported_fields: "job_vacancy,hiring_intelligence",
          }))
        );
      }
    }
  } catch (e) {
    // non-critical
  }
}