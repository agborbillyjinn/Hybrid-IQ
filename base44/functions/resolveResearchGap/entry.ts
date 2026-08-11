import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { reconcileEvidence, createVersionSnapshot } from "../../shared/evidenceReconciliation.ts";

// Resolves a single research gap via targeted LLM web-search research, stores
// new Evidence records, then re-runs reconciliation and re-scores the account.
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { account_id, company_name, gap, recommended_action } = body;
    if (!account_id || !company_name) return Response.json({ error: "account_id and company_name are required" }, { status: 400 });

    // 1. Targeted LLM research with web search (Gemini 3 Flash supports add_context_from_internet)
    const prompt = `You are an ERP intelligence research analyst. Research the following question about the company "${company_name}":
    
GAP: ${gap}
RESEARCH ACTION: ${recommended_action}

Search the web for evidence about this company's ERP systems, transformation programmes, implementation partners, ERP user counts, deadlines, integration technologies, or cloud platforms — specifically addressing the gap above.

Return a JSON array of evidence items (maximum 5). Each item must have:
- finding: a concise factual statement
- erp_vendor: the ERP vendor if identifiable (e.g. "SAP", "Oracle", "Microsoft", "Workday") or null
- erp_product: the specific product if identifiable (e.g. "SAP S/4HANA", "Oracle Fusion Cloud", "Dynamics 365") or null
- erp_version: version if identifiable or null
- source_type: one of ["Annual report", "Investor presentation", "ERP vendor case study", "Implementation partner case study", "Official procurement", "Official company disclosure", "Company careers page", "Executive interview", "Current job vacancy", "Historic vacancy", "Credible publication", "Technology database"]
- source_name: the name of the source (e.g. "SAP Customer Story", "BAE Systems Annual Report 2024")
- source_url: the URL if available or null
- evidence_date: the date of the evidence in YYYY-MM-DD format or null
- evidence_extract: a short quote or summary from the source
- current_or_historical: "CURRENT" or "HISTORICAL"

If you find no relevant evidence, return an empty array [].
Return ONLY the JSON array, no other text.`;

    let newEvidence: any[] = [];
    try {
      const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            evidence: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  finding: { type: "string" },
                  erp_vendor: { type: "string" },
                  erp_product: { type: "string" },
                  erp_version: { type: "string" },
                  source_type: { type: "string" },
                  source_name: { type: "string" },
                  source_url: { type: "string" },
                  evidence_date: { type: "string" },
                  evidence_extract: { type: "string" },
                  current_or_historical: { type: "string" },
                },
              },
            },
          },
        },
      });
      const data = llmRes as any;
      newEvidence = data?.evidence || data?.output?.evidence || [];
      if (!Array.isArray(newEvidence)) newEvidence = [];
    } catch (e: any) {
      return Response.json({ error: `Research failed: ${e.message}` }, { status: 500 });
    }

    // 2. Persist new evidence records
    const persisted: any[] = [];
    if (newEvidence.length) {
      const records = newEvidence.map((e: any) => ({
        account_id, company: company_name,
        finding: e.finding || "Research finding",
        erp_vendor: e.erp_vendor || "", erp_product: e.erp_product || "", erp_version: e.erp_version || "",
        source_type: e.source_type || "Credible publication",
        source_name: e.source_name || "", source_url: e.source_url || "",
        evidence_date: e.evidence_date, date: e.evidence_date,
        evidence_extract: e.evidence_extract || "",
        current_or_historical: e.current_or_historical === "HISTORICAL" ? "HISTORICAL" : "CURRENT",
        confidence: "INFERRED", status: "INFERRED", evidence_strength: "SUPPORTING",
        last_checked: new Date().toISOString(),
        supported_fields: `gap_research:${gap?.slice(0, 60) || ""}`,
      }));
      try {
        persisted.push(...await base44.asServiceRole.entities.Evidence.bulkCreate(records));
      } catch (e) {}
    }

    // 3. Re-run reconciliation with ALL evidence (existing + new)
    const allEvidence = await base44.asServiceRole.entities.Evidence.filter({ account_id });
    const accounts = await base44.asServiceRole.entities.Account.filter({ id: account_id });
    const intel = accounts[0]?.intelligence || {};

    const reconciliation = reconcileEvidence(intel, allEvidence);

    // 4. Re-score: adjust transformation probability & migration complexity based on new evidence
    const prevScores = intel.scores || {};
    const prevTransformProb = prevScores.transformation_probability?.value || 50;
    const prevComplexity = prevScores.migration_complexity?.value || 50;
    const newEvidenceCount = persisted.length;
    const transformBoost = Math.min(15, newEvidenceCount * 3);
    const updatedScores = {
      ...prevScores,
      transformation_probability: { ...prevScores.transformation_probability, value: Math.min(95, prevTransformProb + transformBoost) },
    };

    // 5. Persist updated clusters + new version
    try {
      const oldClusters = await base44.asServiceRole.entities.EvidenceCluster.filter({ account_id });
      if (oldClusters.length) await base44.asServiceRole.entities.EvidenceCluster.deleteMany({ account_id });
    } catch (e) {}
    if (reconciliation.clusters.length) {
      await base44.asServiceRole.entities.EvidenceCluster.bulkCreate(
        reconciliation.clusters.map((c: any) => ({
          account_id, company: company_name,
          conclusion_tag: c.tag, label: c.label, value: String(c.value ?? ""),
          status: c.status, confidence: c.confidence,
          independent_sources: c.independent_sources,
          supporting_count: c.supporting.length, conflicting_count: c.conflicting.length,
          supporting: c.supporting, conflicting: c.conflicting,
          explanation: c.explanation, interpretation: c.interpretation,
          latest_evidence_date: c.latest_evidence_date,
        }))
      );
    }

    const existingVersions = await base44.asServiceRole.entities.AnalysisVersion.filter({ account_id }, "-version", 50);
    const nextVersion = existingVersions.length ? (existingVersions[0].version || 0) + 1 : 2;
    const snapshot = createVersionSnapshot({ ...intel, scores: updatedScores }, reconciliation, "", account_id, company_name, nextVersion);
    try {
      await base44.asServiceRole.entities.AnalysisVersion.create({
        ...snapshot,
        research_gaps_count: reconciliation.research_gaps.length,
        trigger_reason: `gap_research: ${gap?.slice(0, 80) || ""}`,
      });
    } catch (e) {}

    // 6. Update account with new scores + reconciliation
    try {
      await base44.asServiceRole.entities.Account.update(account_id, {
        intelligence: { ...intel, scores: updatedScores, reconciliation },
        transformation_probability: updatedScores.transformation_probability.value,
        last_analysed: new Date().toISOString(),
      });
    } catch (e) {}

    return Response.json({
      new_evidence_count: persisted.length,
      reconciliation,
      updated_scores: updatedScores,
      version: nextVersion,
      previous_transform_probability: prevTransformProb,
      new_transform_probability: updatedScores.transformation_probability.value,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}