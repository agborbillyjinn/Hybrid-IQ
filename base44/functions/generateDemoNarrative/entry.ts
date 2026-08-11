import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Generates a short internal presentation narrative for a seller.
// Format: ACCOUNT CONTEXT / SIGNAL / HYPOTHESIS / ECONOMICS / SALES ACTION.
// Maximum 150 words. Internal, not customer-facing.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { intelligence, account_name } = body;
    if (!intelligence) return Response.json({ error: "intelligence is required" }, { status: 400 });

    const scores = intelligence.scores || {};
    const cm = intelligence.commercial_model || {};
    const tradCost = cm.traditional?.cost?.expected;
    const expectedScenario = (cm.hybrid_scenarios || []).find((s) => s.name?.toLowerCase().includes("expected")) || (cm.hybrid_scenarios || [])[0] || {};
    const signals = (intelligence.signals || []).slice(0, 3).map((s) => s.signal || s);
    const hiring = intelligence.hiring_intelligence || {};
    const attack = intelligence.attack_plan || {};
    const erpEstate = intelligence.erp_estate || {};

    const prompt = `Generate a concise internal sales narrative for ${account_name || "this account"} in exactly this format, maximum 150 words total. This is INTERNAL seller coaching — not customer-facing copy.

1. ACCOUNT CONTEXT: One sentence on the company and their current ERP (${erpEstate.current_erp_product?.value || intelligence.erp_inference?.current_erp || "unknown"}).
2. SIGNAL: One sentence on the top transformation signal (${signals[0] || "hiring activity"}).
3. HYPOTHESIS: One sentence on the likely target ERP and programme stage (${intelligence.target_erp?.next_erp || "unknown"} / ${hiring.likely_programme_stage || "unknown"}).
4. ECONOMICS: One sentence on traditional cost (£${tradCost || "unknown"}) vs AI-enabled saving (£${expectedScenario.saving || "unknown"}, up to ${expectedScenario.reduction_pct || "unknown"}% reduction — potential, not guaranteed).
5. SALES ACTION: One sentence on the next action (${attack.next_action || "approach economic buyer"}).

Transformation probability: ${scores.transformation_probability?.value || "unknown"}/100. Hybrid fit: ${scores.hybrid_fit?.value || "unknown"}/100. Keep it factual, no hype, no guaranteed outcomes. Label estimates as estimates.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: "gemini_3_flash",
    });

    const narrative = typeof result === "string" ? result : result?.response || result?.text || JSON.stringify(result);

    // Persist to account if account_id provided
    const accountId = body.account_id;
    if (accountId) {
      await base44.asServiceRole.entities.Account.update(accountId, { demo_narrative: narrative });
    }

    return Response.json({ narrative });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}