import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { validateAnalysisQuality } from "../../shared/demoQuality.ts";
import { reconcileEvidence } from "../../shared/evidenceReconciliation.ts";

// Runs quality validation on an account's intelligence after analysis.
// Persists quality score, status, breakdown and red flags to the Account.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { account_id, intelligence, max_reduction } = body;
    if (!account_id) return Response.json({ error: "account_id is required" }, { status: 400 });

    let intel = intelligence;
    if (!intel) {
      const accounts = await base44.asServiceRole.entities.Account.filter({ id: account_id });
      intel = accounts[0]?.intelligence || {};
    }
    if (!intel) intel = {};

    // Use persisted reconciliation if available, else compute
    let reconciliation = intel.reconciliation;
    if (!reconciliation) {
      const evidence = await base44.asServiceRole.entities.Evidence.filter({ account_id });
      reconciliation = reconcileEvidence(intel, evidence);
    }

    const report = validateAnalysisQuality(intel, reconciliation, { max_reduction: max_reduction || 70 });

    // Persist quality results to the account
    await base44.asServiceRole.entities.Account.update(account_id, {
      quality_score: report.score,
      quality_status: report.status,
      quality_breakdown: report.categories,
      red_flags: report.red_flags,
    });

    return Response.json({ report });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}