import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { waitUntil } from "base44:runtime";
import { normalizeIntelligence } from "../../shared/intelligenceNormalizer.ts";
import { buildMockPayload } from "../../shared/mockResearchData.ts";
import { analyzeHiringIntelligence } from "../../shared/hiringIntelligence.ts";
import { buildSearchQueries } from "../../shared/vacancyResearch.ts";
import { getIntegrationConfig } from "../../shared/integrationConfig.ts";
import { reconcileEvidence } from "../../shared/evidenceReconciliation.ts";

const ANALYSIS_VERSION = "1.1";
const MOCK_STAGES = [
  "researching_company", "searching_erp_evidence", "building_erp_history",
  "detecting_signals", "calculating_complexity", "modelling_cost",
  "mapping_committee", "creating_gtm",
  "searching_erp_vacancies", "analysing_hiring_signals",
  "inferring_programme_stage", "estimating_consulting_demand",
];

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const company = (body.company_name || "").trim();
    if (!company) return Response.json({ error: "company_name is required" }, { status: 400 });

    // Determine research mode: explicit body param > jobs_research config notes > mock toggle > LIVE
    const jobsConfig = await getIntegrationConfig(base44, "jobs_research");
    const mockConfig = await getIntegrationConfig(base44, "mock");
    let mode = (body.research_mode || jobsConfig?.notes || "").toUpperCase();
    if (!["MOCK", "LIVE", "HYBRID"].includes(mode)) mode = mockConfig?.enabled ? "MOCK" : "LIVE";

    const analysisId = "job_" + crypto.randomUUID();
    const now = new Date().toISOString();
    const job = await base44.entities.AnalysisJob.create({
      analysis_id: analysisId,
      company_id: body.company_id || "",
      company_name: company,
      status: "researching_company",
      started_at: now,
      analysis_version: ANALYSIS_VERSION,
      research_sources: "",
      research_mode: mode,
    });

    // MOCK mode — full orchestration with fictional test data through the same normalizer
    if (mode === "MOCK") {
      waitUntil(simulateMockAnalysis(base44, job.id, analysisId, company, mode));
      return Response.json({ analysis_id: analysisId, status: "pending", async: true, research_mode: mode });
    }

    // n8n full-analysis delegation (LIVE/HYBRID) — external workflow calls back receiveAnalysisResults
    const n8nConfig = await getIntegrationConfig(base44, "n8n");
    if (n8nConfig?.enabled && n8nConfig.webhook_url) {
      try {
        const r = await fetch(n8nConfig.webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            analysis_id: analysisId, company_name: company, website: body.website, country: body.country,
            industry: body.industry, known_erp: body.known_erp, employees: body.employees,
            revenue: body.revenue, estimated_erp_users: body.estimated_erp_users, notes: body.notes,
            research_mode: mode, search_queries: buildSearchQueries(company, body.known_erp),
          }),
        });
        if (r.ok) return Response.json({ analysis_id: analysisId, status: "pending", async: true, research_mode: mode });
      } catch (e) {
        // webhook fire failed — fall through to built-in
      }
    }

    // Built-in LIVE/HYBRID path
    return Response.json(await runBuiltInAnalysis(base44, job, body, company, analysisId, mode));
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function runBuiltInAnalysis(base44: any, job: any, body: any, company: string, analysisId: string, mode: string) {
  try {
    await base44.entities.AnalysisJob.update(job.id, { status: "searching_erp_evidence" });
    const res = await base44.functions.invoke("generateAccountIntelligence", body);
    const intelligence = res?.data?.intelligence || {};

    // Discover real ERP vacancies (non-blocking on failure — partial results)
    await base44.entities.AnalysisJob.update(job.id, { status: "searching_erp_vacancies" });
    let discoverResult: any = { jobVacancies: [], research_metadata: null, errors: [] };
    try {
      const dres = await base44.functions.invoke("discoverERPJobs", {
        company_name: company, company_website: body.website, country: body.country,
        known_erp: body.known_erp, analysis_id: analysisId, research_mode: mode,
      });
      discoverResult = dres?.data || { jobVacancies: [], research_metadata: null, errors: [] };
    } catch (e: any) {
      discoverResult = { jobVacancies: [], research_metadata: null, errors: [e.message] };
    }

    await base44.entities.AnalysisJob.update(job.id, { status: "analysing_hiring_signals" });
    const vacancies = discoverResult.jobVacancies || [];
    intelligence.job_vacancies = vacancies;
    intelligence.research_metadata = discoverResult.research_metadata || buildEmptyResearchMetadata(mode, buildSearchQueries(company, body.known_erp), discoverResult.errors || []);

    if (vacancies.length) {
      await base44.entities.AnalysisJob.update(job.id, { status: "inferring_programme_stage" });
      intelligence.hiring_intelligence = analyzeHiringIntelligence(vacancies, {
        commercial_model: intelligence.commercial_model || {},
        employees: intelligence.company_overview?.employees,
        estimated_users: intelligence.erp_estate?.estimated_users?.value,
        countries: intelligence.erp_estate?.countries?.value,
        legal_entities: intelligence.erp_estate?.legal_entities?.value,
        migration_complexity: intelligence.scores?.migration_complexity?.value,
      });
      await base44.entities.AnalysisJob.update(job.id, { status: "estimating_consulting_demand" });
    } else {
      intelligence.hiring_intelligence = null;
    }

    // Cross-source evidence reconciliation
    intelligence.reconciliation = reconcileEvidence(intelligence, intelligence.evidence || []);

    await base44.entities.AnalysisJob.update(job.id, {
      status: "complete",
      completed_at: new Date().toISOString(),
      intelligence,
      source_provider: "builtin-llm",
      retrieved_at: new Date().toISOString(),
      research_sources: "HybridIQ built-in LLM + ERP job discovery",
      confidence: vacancies.length ? "HIGHLY LIKELY" : "INFERRED",
      evidence_type: mode === "HYBRID" ? "hybrid_research" : "live_research",
      research_mode: mode,
      research_metadata: intelligence.research_metadata,
    });

    return { analysis_id: analysisId, status: "complete", async: false, intelligence, research_mode: mode };
  } catch (error: any) {
    await base44.entities.AnalysisJob.update(job.id, { status: "failed", error: error.message }).catch(() => {});
    throw error;
  }
}

async function simulateMockAnalysis(base44: any, jobId: string, analysisId: string, company: string, mode: string) {
  for (const stage of MOCK_STAGES) {
    try {
      await base44.asServiceRole.entities.AnalysisJob.update(jobId, { status: stage });
    } catch (e) {}
    await sleep(2000);
  }
  const mockPayload = buildMockPayload(company, analysisId);
  const intelligence = normalizeIntelligence(mockPayload);
  intelligence.reconciliation = reconcileEvidence(intelligence, intelligence.evidence || []);
  try {
    await base44.asServiceRole.entities.AnalysisJob.update(jobId, {
      status: "complete",
      completed_at: new Date().toISOString(),
      intelligence,
      source_provider: "mock",
      retrieved_at: new Date().toISOString(),
      source_url: "mock://northstar-manufacturing",
      confidence: "HIGHLY LIKELY",
      evidence_type: "mock_research",
      research_sources: "Mock Analysis Mode (internal test data)",
      research_mode: mode,
      research_metadata: intelligence.research_metadata,
    });
  } catch (e) {}
}

function buildEmptyResearchMetadata(mode: string, queries: string[], errors: string[]) {
  return {
    research_mode: mode,
    search_queries: queries,
    sources_checked: [],
    vacancies_found: 0,
    duplicates_removed: 0,
    vacancies_persisted: 0,
    llm_calls: 0,
    errors,
    duration_ms: 0,
    analysis_version: ANALYSIS_VERSION,
    last_job_search: new Date().toISOString(),
    coverage_confidence: "LOW",
    no_vacancies_message: "No relevant vacancies detected from the sources searched.",
  };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}