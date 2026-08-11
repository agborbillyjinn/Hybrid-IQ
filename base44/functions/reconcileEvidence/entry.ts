import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { reconcileEvidence, createVersionSnapshot } from "../../shared/evidenceReconciliation.ts";

// Runs cross-source evidence reconciliation on an account's intelligence.
// Computes evidence clusters, ERP estate, evidence health, research gaps,
// persists EvidenceCluster + AnalysisVersion records, and returns the reconciliation.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { account_id, company_name, intelligence, evidence_list, analysis_id, trigger_reason } = body;
    if (!account_id && !intelligence) return Response.json({ error: "account_id or intelligence is required" }, { status: 400 });

    // Gather evidence: explicit list > DB query by account_id
    let rawEvidence = evidence_list;
    let intel = intelligence;
    if (!rawEvidence && account_id) {
      rawEvidence = await base44.asServiceRole.entities.Evidence.filter({ account_id });
    }
    if (!intel && account_id) {
      const accounts = await base44.asServiceRole.entities.Account.filter({ id: account_id });
      intel = accounts[0]?.intelligence || {};
    }
    if (!rawEvidence) rawEvidence = [];
    if (!intel) intel = {};

    const reconciliation = reconcileEvidence(intel, rawEvidence);

    // Determine version number
    let version = 1;
    if (account_id) {
      const existing = await base44.asServiceRole.entities.AnalysisVersion.filter({ account_id }, "-version", 50);
      if (existing.length) version = (existing[0].version || 0) + 1;
    }

    // Persist clusters (replace previous for this account)
    if (account_id) {
      try {
        const oldClusters = await base44.asServiceRole.entities.EvidenceCluster.filter({ account_id });
        if (oldClusters.length) await base44.asServiceRole.entities.EvidenceCluster.deleteMany({ account_id });
      } catch (e) {}
      if (reconciliation.clusters.length) {
        await base44.asServiceRole.entities.EvidenceCluster.bulkCreate(
          reconciliation.clusters.map((c: any) => ({
            account_id, company: company_name || "",
            analysis_id: analysis_id || "",
            conclusion_tag: c.tag, label: c.label, value: String(c.value ?? ""),
            status: c.status, confidence: c.confidence,
            independent_sources: c.independent_sources,
            supporting_count: c.supporting.length, conflicting_count: c.conflicting.length,
            supporting: c.supporting, conflicting: c.conflicting,
            explanation: c.explanation, interpretation: c.interpretation,
            latest_evidence_date: c.latest_evidence_date,
            erp_vendor: c.supporting?.[0]?.erp_vendor || "", erp_product: c.supporting?.[0]?.erp_product || "",
          }))
        );
      }
    }

    // Persist version snapshot
    if (account_id) {
      const snapshot = createVersionSnapshot(intel, reconciliation, analysis_id || "", account_id, company_name || "", version);
      try {
        await base44.asServiceRole.entities.AnalysisVersion.create({
          ...snapshot,
          research_gaps_count: reconciliation.research_gaps.length,
          trigger_reason: trigger_reason || "initial_analysis",
        });
      } catch (e) {}
    }

    return Response.json({ reconciliation, version });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}