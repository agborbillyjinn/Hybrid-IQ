import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from "base44:runtime";

export default async function(req: Request): Promise<Response> {
  try {
    // Webhook endpoint — validate shared secret if configured
    const secret = secrets.get("N8N_WEBHOOK_SECRET");
    if (secret) {
      const provided = req.headers.get("x-webhook-secret") || new URL(req.url).searchParams.get("secret");
      if (provided !== secret) return Response.json({ error: "Invalid webhook secret" }, { status: 401 });
    }

    const body = await req.json();
    const analysisId = body.analysis_id;
    if (!analysisId) return Response.json({ error: "analysis_id is required" }, { status: 400 });

    const base44 = createClientFromRequest(req);
    const jobs = await base44.asServiceRole.entities.AnalysisJob.filter({ analysis_id: analysisId });
    const job = jobs[0];
    if (!job) return Response.json({ error: "Job not found" }, { status: 404 });

    const intelligence = normalizeIntelligence(body);
    await base44.asServiceRole.entities.AnalysisJob.update(job.id, {
      status: "complete",
      completed_at: new Date().toISOString(),
      intelligence,
      source_provider: body.source_provider || "external-workflow",
      retrieved_at: body.retrieved_at || new Date().toISOString(),
      source_url: body.source_url || "",
      confidence: body.confidence || "CONFIRMED",
      evidence_type: body.evidence_type || "external_research",
      research_sources: Array.isArray(body.research_sources) ? body.research_sources.join(", ") : (body.research_sources || ""),
    });

    return Response.json({ status: "complete", analysis_id: analysisId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// Normalize any external provider payload to the canonical intelligence structure the UI renders.
function normalizeIntelligence(body) {
  const signals = [
    ...(body.transformation_signals || []),
    ...(body.executive_changes || []),
    ...(body.job_signals || []),
    ...(body.m_and_a_signals || []),
    ...(body.technology_signals || []),
    ...(body.integration_signals || []),
  ];
  const scores = {
    transformation_probability: wrapScore(body.transformation_probability),
    hybrid_fit: wrapScore(body.hybrid_fit),
    future_enterprise_fit: wrapScore(body.future_enterprise_fit),
    migration_complexity: wrapScore(body.migration_complexity),
  };
  return {
    company_overview: body.company_profile || body.company_overview || { name: body.company_name },
    financial_profile: body.financial_profile,
    erp_inference: { current_erp: body.current_erp, likely_target_erp: body.likely_target_erp },
    erp_estate: body.erp_estate,
    erp_history: body.erp_history || [],
    evidence: body.erp_evidence || body.evidence || [],
    signals,
    target_erp: body.likely_target_erp || body.target_erp || {},
    commercial_model: body.commercial_assumptions || body.commercial_model || {},
    buying_committee: body.buying_committee || [],
    meddpicc: body.meddpicc_hypotheses || body.meddpicc || {},
    discovery_questions: body.discovery_questions || [],
    outreach: body.outreach,
    attack_plan: body.attack_plan || {},
    scores,
    source_provider: body.source_provider,
  };
}

function wrapScore(v) {
  if (v == null) return { value: 50, level: "Medium", reasons: [] };
  if (typeof v === "number") return { value: v, level: band(v), reasons: [] };
  if (typeof v === "object") return v;
  return { value: 50, level: "Medium", reasons: [] };
}
function band(v) {
  if (v >= 85) return "Very High";
  if (v >= 70) return "High";
  if (v >= 40) return "Medium";
  return "Low";
}