// Canonical normalizer shared by receiveAnalysisResults (external webhook) and mock analysis.
// Any source — n8n, external API, mock, future agent — flows through this to produce the
// same intelligence structure the UI renders.

export function normalizeIntelligence(body) {
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
    erp_inference: {
      ...(body.erp_inference || {}),
      current_erp: body.current_erp || body.erp_inference?.current_erp,
      likely_target_erp: body.likely_target_erp || body.erp_inference?.likely_target_erp,
    },
    erp_estate: body.erp_estate || {},
    erp_history: body.erp_history || [],
    evidence: body.erp_evidence || body.evidence || [],
    signals: signals.length ? signals : (body.signals || []),
    target_erp: body.target_erp || body.likely_target_erp || {},
    commercial_model: body.commercial_assumptions || body.commercial_model || {},
    buying_committee: body.buying_committee || [],
    meddpicc: body.meddpicc_hypotheses || body.meddpicc || {},
    discovery_questions: body.discovery_questions || [],
    outreach: body.outreach,
    attack_plan: body.attack_plan || {},
    scores: { ...(body.scores || {}), ...scores },
    source_provider: body.source_provider,
  };
}

export function wrapScore(v) {
  if (v == null) return { value: 50, level: "Medium", reasons: [] };
  if (typeof v === "number") return { value: v, level: band(v), reasons: [] };
  if (typeof v === "object") return v;
  return { value: 50, level: "Medium", reasons: [] };
}

export function band(v) {
  if (v >= 85) return "Very High";
  if (v >= 70) return "High";
  if (v >= 40) return "Medium";
  return "Low";
}