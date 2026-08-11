import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const persona = (body.persona || "").trim();
    const companyName = (body.company_name || "").trim();
    const intelligence = body.intelligence;
    if (!persona || !companyName || !intelligence) {
      return Response.json({ error: "persona, company_name and intelligence are required" }, { status: 400 });
    }

    const evidenceSummary = buildEvidenceSummary(intelligence);
    const prompt = `You are HybridIQ's Outreach Copilot for Hybrid Solutions AI, an ERP migration consultancy.
Generate persona-specific sales outreach for ${companyName}, targeted at the ${persona}.

Use ONLY verified or high-confidence account signals. Never fabricate personalisation. Reference specific evidence.

Account intelligence summary:
${JSON.stringify(intelligence).slice(0, 6000)}

Key evidence to leverage:
${evidenceSummary}

Return JSON with: email (subject + body), linkedin (short message), cold_call (opener script), voicemail (short), follow_up (message).
Each message must reference a specific signal where possible and avoid claiming guaranteed savings (use "up to 70%").`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          email: { type: "object", properties: { subject: { type: "string" }, body: { type: "string" } }, required: ["subject", "body"] },
          linkedin: { type: "string" }, cold_call: { type: "string" }, voicemail: { type: "string" },
          follow_up: { type: "string" }, evidence_used: { type: "array", items: { type: "string" } },
        },
        required: ["email", "linkedin", "cold_call", "voicemail", "follow_up"],
      },
    });

    const out = typeof result === "string" ? safeParse(result) : result;
    return Response.json({ outreach: out || {} });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function buildEvidenceSummary(intel) {
  const parts = [];
  if (intel.signals && intel.signals.length) {
    parts.push("Signals: " + intel.signals.slice(0, 5).map(s => `${s.signal} (${s.confidence || "INFERRED"}, ${s.date || ""})`).join("; "));
  }
  if (intel.erp_estate && intel.erp_estate.current_erp_product) {
    parts.push("Current ERP: " + (intel.erp_estate.current_erp_product.value || "Unknown"));
  }
  if (intel.target_erp && intel.target_erp.next_erp) {
    parts.push(`Likely target ERP: ${intel.target_erp.next_erp} (${intel.target_erp.probability || "?"}% probability)`);
  }
  if (intel.scores) {
    parts.push(`Transformation probability: ${intel.scores.transformation_probability?.value}/100, Hybrid fit: ${intel.scores.hybrid_fit?.value}/100`);
  }
  if (intel.attack_plan && intel.attack_plan.why_now) {
    parts.push("Why now: " + intel.attack_plan.why_now);
  }
  return parts.join("\n") || "Limited evidence available.";
}

function safeParse(s) { try { return JSON.parse(s); } catch { return null; } }