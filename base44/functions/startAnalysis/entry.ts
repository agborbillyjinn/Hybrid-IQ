import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { waitUntil } from "base44:runtime";
import { normalizeIntelligence } from "../../shared/intelligenceNormalizer.ts";
import { buildMockPayload } from "../../shared/mockResearchData.ts";

const ANALYSIS_VERSION = "1.0";
const MOCK_STAGES = [
  "researching_company", "searching_erp_evidence", "building_erp_history",
  "detecting_signals", "calculating_complexity", "modelling_cost",
  "mapping_committee", "creating_gtm",
];

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const company = (body.company_name || "").trim();
    if (!company) return Response.json({ error: "company_name is required" }, { status: 400 });

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
    });

    // Mock Analysis Mode — simulate the full research workflow through the same normalizer
    const mockConfig = await getIntegrationConfig(base44, "mock");
    if (mockConfig?.enabled) {
      waitUntil(simulateMockAnalysis(base44, job.id, analysisId, company));
      return Response.json({ analysis_id: analysisId, status: "pending", async: true });
    }

    // n8n external workflow — delegate research
    const n8nConfig = await getIntegrationConfig(base44, "n8n");
    if (n8nConfig?.enabled && n8nConfig.webhook_url) {
      try {
        const r = await fetch(n8nConfig.webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            analysis_id: analysisId,
            company_name: company,
            website: body.website,
            country: body.country,
            industry: body.industry,
            known_erp: body.known_erp,
            employees: body.employees,
            revenue: body.revenue,
            estimated_erp_users: body.estimated_erp_users,
            notes: body.notes,
          }),
        });
        if (r.ok) {
          return Response.json({ analysis_id: analysisId, status: "pending", async: true });
        }
      } catch (e) {
        // webhook fire failed — fall through to built-in
      }
    }

    // Built-in fallback: run the LLM analysis engine
    await base44.entities.AnalysisJob.update(job.id, { status: "searching_erp_evidence" });
    const res = await base44.functions.invoke("generateAccountIntelligence", body);
    const intelligence = res?.data?.intelligence || {};

    await base44.entities.AnalysisJob.update(job.id, {
      status: "complete",
      completed_at: new Date().toISOString(),
      intelligence,
      source_provider: "builtin-llm",
      retrieved_at: new Date().toISOString(),
      research_sources: "HybridIQ built-in LLM inference engine",
      confidence: "INFERRED",
      evidence_type: "ai_inference",
    });

    return Response.json({ analysis_id: analysisId, status: "complete", async: false, intelligence });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function simulateMockAnalysis(base44, jobId, analysisId, company) {
  for (const stage of MOCK_STAGES) {
    try {
      await base44.asServiceRole.entities.AnalysisJob.update(jobId, { status: stage });
    } catch (e) {}
    await sleep(2000);
  }
  const mockPayload = buildMockPayload(company, analysisId);
  const intelligence = normalizeIntelligence(mockPayload);
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
    });
  } catch (e) {}
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getIntegrationConfig(base44, provider) {
  try {
    const configs = await base44.asServiceRole.entities.IntegrationConfig.filter({ provider });
    return configs[0] || null;
  } catch (e) {
    return null;
  }
}