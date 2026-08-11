import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const ANALYSIS_VERSION = "1.0";

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

    // If an n8n external workflow is configured, delegate research to it
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

async function getIntegrationConfig(base44, provider) {
  try {
    const configs = await base44.asServiceRole.entities.IntegrationConfig.filter({ provider });
    return configs[0] || null;
  } catch (e) {
    return null;
  }
}