// Data-driven derivation helpers for the Account Overview.
// All explanations are synthesised from the underlying intelligence object — never hard-coded.

export function scoreExplanation(score) {
  if (!score) return "Insufficient data to determine this score.";
  if (score.reasons?.length) return score.reasons.slice(0, 3).join(", ") + ".";
  if (score.why) return score.why;
  if (score.breakdown?.length) {
    const top = [...score.breakdown]
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 3)
      .map((b) => b.factor || b.name)
      .filter(Boolean);
    if (top.length) return "Key drivers: " + top.join(", ") + ".";
  }
  if (score.blockers?.length) return "Key blockers: " + score.blockers.slice(0, 3).join(", ") + ".";
  return `${score.level || "Medium"} based on available evidence.`;
}

export function erpEvidenceStats(intel, erpObj, { isTarget = false } = {}) {
  const evidence = intel.evidence || [];
  const product = erpObj?.product || erpObj?.next_erp || "";
  const prodLower = (product || "").toLowerCase();
  const matching = evidence.filter((e) => {
    const ep = (e.erp_product || "").toLowerCase();
    const ev = (e.erp_vendor || "").toLowerCase();
    if (!prodLower) return false;
    return ep.includes(prodLower) || prodLower.includes(ep) || ev.includes(prodLower) || prodLower.includes(ev);
  });
  const count = matching.length || (erpObj?.supporting_evidence?.length || 0);
  const dates = matching
    .map((e) => e.evidence_date || e.date_found || e.date)
    .filter(Boolean)
    .sort()
    .reverse();
  const latest = dates[0] || null;
  const confidence = isTarget ? erpObj?.probability : erpObj?.confidence;
  const status = evidenceStatus(erpObj?.confidence_label, count, confidence);
  return { product, count, latest, confidence, status };
}

export function evidenceStatus(label, count, confidence) {
  if (!count) return "UNKNOWN";
  const l = (label || "").toUpperCase();
  // Do not claim CONFIRMED without sufficient corroborating evidence
  if (l === "CONFIRMED" && count < 3) return "HIGHLY LIKELY";
  if (l) return l;
  const v = Number(confidence) || 0;
  if (v >= 85) return "HIGHLY LIKELY";
  if (v >= 50) return "INFERRED";
  return "UNKNOWN";
}

export function buildEconomics(intel) {
  const cm = intel.commercial_model || {};
  const trad = cm.traditional || {};
  const scenarios = cm.hybrid_scenarios || [];
  const expected = scenarios.find((s) => /expected/i.test(s.name || "")) || scenarios[0] || {};
  return {
    traditional: { cost: trad.cost || {}, duration: trad.duration || {} },
    aiEnabled: { cost: expected.cost || {}, duration: expected.duration || {}, confidence: expected.confidence, name: expected.name },
    saving: expected.saving,
    pct_saving: expected.pct_saving,
    months_saved: expected.months_saved,
    hasData: !!(trad.cost?.expected || trad.cost?.low || expected.cost?.expected),
  };
}

export function scoreRelationship(intel) {
  const s = intel.scores || {};
  const hf = s.hybrid_fit?.value;
  const ff = s.future_enterprise_fit?.value;
  if (hf == null || ff == null) return null;
  const gap = ff - hf;
  if (Math.abs(gap) < 15) return { show: false, gap, text: null };
  const hfReasons = (s.hybrid_fit?.reasons || []).slice(0, 2).join("; ");
  const ffReasons = (s.future_enterprise_fit?.reasons || []).slice(0, 2).join("; ");
  const text =
    gap > 0
      ? `Current Hybrid Fit is lower (${hf}/100) because ${hfReasons || "the account's current estate and scale reduce immediate Business Central suitability"}. Future Enterprise Fit is higher (${ff}/100) because ${ffReasons || "the account has significant enterprise-class transformation complexity"}.`
      : `Current Hybrid Fit is higher (${hf}/100) because ${hfReasons || "the account fits the current offering well"}. Future Enterprise Fit is lower (${ff}/100) because ${ffReasons || "the account has less enterprise-class transformation complexity"}.`;
  return { show: true, gap, text };
}

export function evidenceHealth(intel) {
  const evidence = intel.evidence || [];
  const count = evidence.length;
  const confidences = evidence.map((e) => Number(e.confidence_score)).filter((n) => !isNaN(n));
  const avgConf = confidences.length ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length) : 0;
  const signals = intel.signals || [];
  const erpInference = intel.erp_inference || {};
  const erpEstate = intel.erp_estate || {};
  const co = intel.company_overview || {};
  const areas = [
    { name: "ERP history", strong: (intel.erp_history || []).length >= 2 },
    { name: "M&A signals", strong: signals.some((s) => /m&a|acquisition|merger/i.test((s.category || "") + " " + (s.signal || ""))) },
    { name: "Company size", strong: !!co.employees },
    { name: "Current integration estate", strong: (erpInference.known_integrations || []).length >= 3 },
    { name: "Remaining legacy entities", strong: evidence.some((e) => /entit|legacy/i.test(e.finding || "")) && !!(erpEstate.legal_entities?.value) },
    { name: "Implementation timetable", strong: signals.some((s) => /timetable|timeline|schedule|deadline|go-live/i.test(s.signal || "")) },
  ];
  const strongCount = areas.filter((a) => a.strong).length;
  const coveragePct = Math.round((strongCount / areas.length) * 100);
  const countScore = Math.min(100, count * 10);
  const health = Math.round(countScore * 0.4 + avgConf * 0.4 + coveragePct * 0.2);
  return {
    health: Math.min(100, health),
    count,
    avgConf,
    coveragePct,
    strong: areas.filter((a) => a.strong).map((a) => a.name),
    weak: areas.filter((a) => !a.strong).map((a) => a.name),
  };
}

export function deriveWhyItMatters(unknown) {
  const u = (unknown || "").toLowerCase();
  if (!u) return "Affects the accuracy of the transformation probability and commercial estimates.";
  if (/budget|cost|price|invest/.test(u)) return "Affects commercial modelling accuracy and deal sizing.";
  if (/entit|legal|subsidiar/.test(u)) return "Determines remaining migration scope and the size of the transformation opportunity.";
  if (/custom|c\/side|\bal\b|code|develop/.test(u)) return "Determines migration complexity and rewrite effort.";
  if (/integrat|mes|edi|api/.test(u)) return "Determines integration scope and migration risk.";
  if (/timetable|timeline|date|deadline|go-live/.test(u)) return "Affects deal timing and pipeline forecasting.";
  if (/data|migrat/.test(u)) return "Determines data migration scope and risk.";
  return "Affects the accuracy of the transformation probability and commercial estimates.";
}