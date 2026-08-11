import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from "base44:runtime";
import { normalizeIntelligence } from "../../shared/intelligenceNormalizer.ts";

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
      research_mode: body.research_mode || body.research_metadata?.research_mode || null,
      research_metadata: body.research_metadata || intelligence.research_metadata || null,
    });

    return Response.json({ status: "complete", analysis_id: analysisId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}