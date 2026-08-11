// Demo Readiness Quality Validation Engine
// Runs after every LIVE analysis to validate intelligence quality.
// Returns a 0-100 score, PASS/REVIEW/FAIL status, category breakdown, and red flags.
// Pure deterministic rules engine — no LLM calls.

const DEFAULT_MAX_REDUCTION = 70;

export interface Check {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
  severity: "problem" | "warning" | "ok";
  category: string;
}

export interface Category {
  score: number;
  problems: string[];
  warnings: string[];
  recommended_fix: string;
}

export interface RedFlag {
  flag: string;
  severity: "high" | "medium" | "low";
  detail: string;
  category: string;
}

export interface QualityReport {
  score: number;
  status: "PASS" | "REVIEW" | "FAIL";
  max_reduction: number;
  categories: {
    erp_intelligence: Category;
    evidence: Category;
    hiring_intelligence: Category;
    transformation_intelligence: Category;
    commercial_model: Category;
    gtm_output: Category;
  };
  red_flags: RedFlag[];
  checks: Check[];
  generated_at: string;
}

export function validateAnalysisQuality(intelligence: any, reconciliation: any, options: any = {}): QualityReport {
  const maxReduction = options.max_reduction || DEFAULT_MAX_REDUCTION;
  const checks: Check[] = [];
  const redFlags: RedFlag[] = [];

  const clusters = reconciliation?.clusters || [];
  const evidence = intelligence?.evidence || [];
  const erpHistory = intelligence?.erp_history || [];
  const jobVacancies = intelligence?.job_vacancies || [];
  const commercial = intelligence?.commercial_model || {};
  const hiring = intelligence?.hiring_intelligence || {};
  const buyingCommittee = intelligence?.buying_committee || [];
  const outreach = intelligence?.outreach || {};
  const scores = intelligence?.scores || {};
  const erpEstate = intelligence?.erp_estate || {};
  const targetErp = intelligence?.target_erp || {};

  const findCluster = (tag: string) => clusters.find((c: any) => (c.tag || c.conclusion_tag) === tag);

  // ===== ERP INTELLIGENCE =====
  const erpProblems: string[] = [];
  const erpWarnings: string[] = [];

  // 1. Current ERP has supporting evidence
  const currentErpCluster = findCluster("current_erp");
  const currentErpSupported = currentErpCluster && currentErpCluster.confidence >= 45 && (currentErpCluster.independent_sources || 0) >= 1;
  checks.push({
    id: "current_erp_evidence", category: "erp_intelligence",
    label: "Current ERP has supporting evidence",
    passed: !!currentErpSupported,
    detail: currentErpSupported ? `Supported by ${currentErpCluster.independent_sources} independent source(s) at ${currentErpCluster.confidence}% confidence` : "Current ERP conclusion lacks supporting evidence",
    severity: currentErpSupported ? "ok" : "problem",
  });
  if (!currentErpSupported) erpProblems.push("Current ERP conclusion is not supported by sufficient evidence");

  // 2. Target ERP has supporting evidence
  const targetErpCluster = findCluster("target_erp");
  const targetErpSupported = targetErpCluster && targetErpCluster.confidence >= 40 && (targetErpCluster.independent_sources || 0) >= 1;
  checks.push({
    id: "target_erp_evidence", category: "erp_intelligence",
    label: "Target ERP has supporting evidence",
    passed: !!targetErpSupported,
    detail: targetErpSupported ? `Supported by ${targetErpCluster.independent_sources} independent source(s) at ${targetErpCluster.confidence}% confidence` : "Target ERP conclusion lacks supporting evidence",
    severity: targetErpSupported ? "ok" : "problem",
  });
  if (!targetErpSupported) erpProblems.push("Target ERP conclusion is not supported by sufficient evidence");
  if (!targetErpSupported && (targetErp.next_erp || targetErp.product)) {
    redFlags.push({ flag: "Target ERP unsupported", severity: "high", detail: "A target ERP is stated but no supporting evidence was found", category: "erp_intelligence" });
  }

  // 3. Historical ERP timeline chronologically coherent
  const erpHistoryDates = erpHistory.map((h: any) => ({ date: h.date, erp: h.erp || h.description })).filter((h: any) => h.date);
  let timelineCoherent = true;
  if (erpHistoryDates.length >= 2) {
    const sorted = [...erpHistoryDates].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].date).getTime();
      const curr = new Date(sorted[i].date).getTime();
      if (!isNaN(prev) && !isNaN(curr) && curr < prev) timelineCoherent = false;
    }
  }
  checks.push({
    id: "erp_timeline_coherent", category: "erp_intelligence",
    label: "Historical ERP timeline is chronologically coherent",
    passed: timelineCoherent,
    detail: timelineCoherent ? `${erpHistoryDates.length} ERP history events in chronological order` : "ERP history events are not in chronological order",
    severity: timelineCoherent ? "ok" : "warning",
  });
  if (!timelineCoherent) erpWarnings.push("ERP history timeline has chronological inconsistencies");

  // 4. Old ERP evidence treated as current
  const now = Date.now();
  const oldEvidenceAsCurrent = evidence.filter((e: any) => {
    if (!e.evidence_date || e.current_or_historical === "HISTORICAL") return false;
    const t = new Date(e.evidence_date).getTime();
    return !isNaN(t) && (now - t) > 1000 * 60 * 60 * 24 * 365 * 3; // >3 years old
  });
  const noOldAsCurrent = oldEvidenceAsCurrent.length === 0;
  checks.push({
    id: "old_evidence_not_current", category: "erp_intelligence",
    label: "Old ERP evidence not treated as current",
    passed: noOldAsCurrent,
    detail: noOldAsCurrent ? "No stale evidence treated as current" : `${oldEvidenceAsCurrent.length} evidence item(s) >3 years old treated as current`,
    severity: noOldAsCurrent ? "ok" : "warning",
  });
  if (!noOldAsCurrent) {
    erpWarnings.push(`${oldEvidenceAsCurrent.length} evidence item(s) older than 3 years are treated as current`);
    redFlags.push({ flag: "Old ERP evidence treated as current", severity: "medium", detail: "Evidence older than 3 years is classified as current", category: "erp_intelligence" });
  }

  // 5. Conflicting ERP evidence surfaced
  const erpConflicts = clusters.filter((c: any) => ["current_erp", "target_erp", "historical_erp"].includes(c.tag || c.conclusion_tag) && (c.conflicting_count || c.conflicting?.length || 0) > 0);
  const conflictsSurfaced = erpConflicts.length === 0 || erpConflicts.every((c: any) => c.interpretation || c.explanation);
  checks.push({
    id: "erp_conflicts_surfaced", category: "erp_intelligence",
    label: "Conflicting ERP evidence is surfaced",
    passed: conflictsSurfaced,
    detail: conflictsSurfaced ? "All ERP conflicts have interpretations" : `${erpConflicts.length} ERP conflict(s) lack interpretation`,
    severity: conflictsSurfaced ? "ok" : "problem",
  });
  if (!conflictsSurfaced) {
    erpProblems.push("Conflicting ERP evidence is not surfaced with interpretation");
    redFlags.push({ flag: "Conflicting ERP evidence hidden", severity: "high", detail: "ERP evidence conflicts exist but are not surfaced", category: "erp_intelligence" });
  }

  // 6. ERP conclusion based on only one weak source
  const weakErpCluster = clusters.find((c: any) => ["current_erp", "target_erp"].includes(c.tag || c.conclusion_tag) && (c.independent_sources || 0) === 1 && c.confidence < 40);
  if (weakErpCluster) {
    redFlags.push({ flag: "ERP conclusion based on only one weak source", severity: "high", detail: `${weakErpCluster.label} relies on a single weak source at ${weakErpCluster.confidence}% confidence`, category: "erp_intelligence" });
    erpProblems.push(`${weakErpCluster.label} relies on a single weak source`);
  }

  // 7. Impossible migration path
  const currentErpVal = (erpEstate.current_erp_product?.value || intelligence.erp_inference?.current_erp || "").toLowerCase();
  const targetErpVal = (targetErp.next_erp || targetErp.product || erpEstate.target_erp_product?.value || "").toLowerCase();
  const impossibleMigrations: Record<string, string[]> = {
    "sap s/4hana": ["oracle fusion", "netsuite", "workday"],
    "oracle fusion cloud": ["sap s/4hana"],
  };
  let impossiblePath = false;
  if (currentErpVal && targetErpVal) {
    for (const [from, tos] of Object.entries(impossibleMigrations)) {
      if (currentErpVal.includes(from) && tos.some((t) => targetErpVal.includes(t))) impossiblePath = true;
    }
  }
  checks.push({
    id: "migration_path_valid", category: "erp_intelligence",
    label: "Migration path is supported",
    passed: !impossiblePath,
    detail: impossiblePath ? "Current → Target ERP path is unusual or unsupported" : "Migration path is plausible",
    severity: impossiblePath ? "problem" : "ok",
  });
  if (impossiblePath) {
    erpProblems.push("Migration path from current to target ERP is unusual or unsupported");
    redFlags.push({ flag: "Impossible or unsupported migration path", severity: "high", detail: `${currentErpVal} → ${targetErpVal} is not a standard migration path`, category: "erp_intelligence" });
  }

  const erpScore = scoreFromChecks(checks.filter((c) => c.category === "erp_intelligence"));

  // ===== EVIDENCE =====
  const evProblems: string[] = [];
  const evWarnings: string[] = [];

  // Source duplicates not counted as independent
  const sourceStats = reconciliation?.source_stats || {};
  const totalSources = sourceStats.total_sources || evidence.length;
  const independentSources = sourceStats.independent_sources || 0;
  const duplicateGroups = sourceStats.duplicate_groups || 0;
  const duplicatesNotInflated = totalSources === 0 || independentSources >= totalSources * 0.5;
  checks.push({
    id: "duplicates_not_independent", category: "evidence",
    label: "Source duplicates not counted as independent evidence",
    passed: duplicatesNotInflated,
    detail: duplicatesNotInflated ? `${independentSources} independent of ${totalSources} total sources` : `Only ${independentSources} independent of ${totalSources} sources — duplicates may inflate confidence`,
    severity: duplicatesNotInflated ? "ok" : "problem",
  });
  if (!duplicatesNotInflated) {
    evProblems.push("Duplicate sources are inflating independent source count");
    redFlags.push({ flag: "Duplicate job vacancies inflating hiring score", severity: "medium", detail: `${totalSources - independentSources} duplicate source(s) detected`, category: "evidence" });
  }

  // Dates valid
  const invalidDates = evidence.filter((e: any) => e.evidence_date && isNaN(new Date(e.evidence_date).getTime()));
  checks.push({
    id: "dates_valid", category: "evidence",
    label: "All evidence dates are valid",
    passed: invalidDates.length === 0,
    detail: invalidDates.length === 0 ? "All evidence dates parse correctly" : `${invalidDates.length} evidence item(s) have invalid dates`,
    severity: invalidDates.length === 0 ? "ok" : "warning",
  });
  if (invalidDates.length > 0) evWarnings.push(`${invalidDates.length} evidence item(s) have invalid dates`);

  // Confidence corresponds with evidence strength
  const lowConfHighEvidence = clusters.filter((c: any) => c.confidence >= 75 && (c.independent_sources || 0) < 2);
  const highConfLowEvidence = clusters.filter((c: any) => c.confidence < 45 && (c.independent_sources || 0) >= 3);
  const confidenceAligned = lowConfHighEvidence.length === 0 && highConfLowEvidence.length === 0;
  checks.push({
    id: "confidence_aligns_evidence", category: "evidence",
    label: "Confidence scores correspond with evidence strength",
    passed: confidenceAligned,
    detail: confidenceAligned ? "Confidence scores align with evidence counts" : `${lowConfHighEvidence.length + highConfLowEvidence.length} cluster(s) have misaligned confidence`,
    severity: confidenceAligned ? "ok" : "warning",
  });
  if (!confidenceAligned) evWarnings.push("Some confidence scores do not align with evidence strength");

  const evScore = scoreFromChecks(checks.filter((c) => c.category === "evidence"));

  // ===== HIRING INTELLIGENCE =====
  const hireProblems: string[] = [];
  const hireWarnings: string[] = [];

  // Job vacancy signals not treated as confirmed production technology
  const techEvidence = hiring?.technology_evidence || {};
  const currentTech = techEvidence.current || [];
  const targetTech = techEvidence.target || [];
  const experienceAsCurrent = currentTech.filter((t: any) => t.confidence === "LOW" && (t.count || 0) === 1);
  const vacanciesNotOverstated = experienceAsCurrent.length === 0;
  checks.push({
    id: "vacancies_not_confirmed_tech", category: "hiring_intelligence",
    label: "Job vacancy signals not treated as confirmed production technology",
    passed: vacanciesNotOverstated,
    detail: vacanciesNotOverstated ? "Vacancy-derived technology appropriately qualified" : `${experienceAsCurrent.length} technology conclusion(s) from single low-confidence vacancies`,
    severity: vacanciesNotOverstated ? "ok" : "warning",
  });
  if (!vacanciesNotOverstated) hireWarnings.push("Some technology conclusions rely on single low-confidence vacancies");

  // Job experience requirement treated as deployed technology
  const expRoleCount = jobVacancies.filter((v: any) => {
    const text = ((v.job_title || "") + " " + (v.responsibilities || "")).toLowerCase();
    return /experience (required|of)|years.? experience/.test(text) && v.technology_role === "CURRENT";
  }).length;
  const expNotDeployed = expRoleCount === 0;
  checks.push({
    id: "experience_not_deployed", category: "hiring_intelligence",
    label: "Job experience requirements not treated as deployed technology",
    passed: expNotDeployed,
    detail: expNotDeployed ? "Experience requirements correctly distinguished from deployed tech" : `${expRoleCount} vacancy(ies) with experience requirements treated as current technology`,
    severity: expNotDeployed ? "ok" : "problem",
  });
  if (!expNotDeployed) {
    hireProblems.push("Job experience requirements are being treated as deployed technology");
    redFlags.push({ flag: "Job experience requirement treated as deployed technology", severity: "high", detail: `${expRoleCount} vacancy(ies) list experience requirements but are classified as current deployed technology`, category: "hiring_intelligence" });
  }

  // Duplicate job vacancies
  const dedupHashes = jobVacancies.map((v: any) => v.dedup_hash).filter(Boolean);
  const uniqueHashes = new Set(dedupHashes).size;
  const noDupVacancies = dedupHashes.length === 0 || uniqueHashes === dedupHashes.length;
  checks.push({
    id: "no_duplicate_vacancies", category: "hiring_intelligence",
    label: "No duplicate job vacancies inflating hiring score",
    passed: noDupVacancies,
    detail: noDupVacancies ? `${uniqueHashes} unique vacancies` : `${dedupHashes.length - uniqueHashes} duplicate vacancy(ies) detected`,
    severity: noDupVacancies ? "ok" : "warning",
  });
  if (!noDupVacancies) {
    hireWarnings.push(`${dedupHashes.length - uniqueHashes} duplicate job vacancies may inflate hiring scores`);
    redFlags.push({ flag: "Duplicate job vacancies inflating hiring score", severity: "medium", detail: `${dedupHashes.length - uniqueHashes} duplicate vacancies detected`, category: "hiring_intelligence" });
  }

  const hireScore = scoreFromChecks(checks.filter((c) => c.category === "hiring_intelligence"));

  // ===== TRANSFORMATION INTELLIGENCE =====
  const transProblems: string[] = [];
  const transWarnings: string[] = [];

  const tpScore = scores.transformation_probability?.value;
  const tpCluster = findCluster("transformation_probability");
  const tpSupported = tpCluster && (tpCluster.independent_sources || 0) >= 2;
  checks.push({
    id: "transformation_probability_supported", category: "transformation_intelligence",
    label: "Transformation probability is supported by multiple signals",
    passed: !!tpSupported,
    detail: tpSupported ? `Transformation probability backed by ${tpCluster.independent_sources} independent source(s)` : "Transformation probability lacks multi-source support",
    severity: tpSupported ? "ok" : "warning",
  });
  if (!tpSupported) transWarnings.push("Transformation probability score lacks multi-source support");

  const urgencyCluster = findCluster("transformation_urgency");
  const urgencySupported = !urgencyCluster || urgencyCluster.confidence >= 40 || (urgencyCluster.independent_sources || 0) >= 1;
  checks.push({
    id: "urgency_supported", category: "transformation_intelligence",
    label: "Transformation urgency has supporting evidence",
    passed: !!urgencySupported,
    detail: urgencySupported ? "Urgency conclusion supported" : "Urgency conclusion lacks evidence",
    severity: urgencySupported ? "ok" : "warning",
  });
  if (!urgencySupported) transWarnings.push("Transformation urgency lacks supporting evidence");

  const transScore = scoreFromChecks(checks.filter((c) => c.category === "transformation_intelligence"));

  // ===== COMMERCIAL MODEL =====
  const comProblems: string[] = [];
  const comWarnings: string[] = [];

  // Commercial estimates have assumptions
  const explanation = commercial.explanation || {};
  const hasAssumptions = (explanation.primary_cost_drivers?.length || 0) > 0 || (explanation.ai_saving_opportunities?.length || 0) > 0;
  checks.push({
    id: "commercial_has_assumptions", category: "commercial_model",
    label: "Commercial estimates have documented assumptions",
    passed: !!hasAssumptions,
    detail: hasAssumptions ? "Cost drivers and AI saving opportunities documented" : "Commercial model lacks documented assumptions",
    severity: hasAssumptions ? "ok" : "problem",
  });
  if (!hasAssumptions) {
    comProblems.push("Commercial estimates lack documented assumptions");
    redFlags.push({ flag: "Commercial estimate missing key assumptions", severity: "high", detail: "No cost drivers or AI saving opportunities documented", category: "commercial_model" });
  }

  // Cost reduction does not exceed maximum
  const scenarios = commercial.hybrid_scenarios || [];
  const overMaxReduction = scenarios.filter((s: any) => (s.reduction_pct || 0) > maxReduction);
  checks.push({
    id: "reduction_within_max", category: "commercial_model",
    label: `Cost reduction does not exceed ${maxReduction}% maximum`,
    passed: overMaxReduction.length === 0,
    detail: overMaxReduction.length === 0 ? `All scenarios within ${maxReduction}% cap` : `${overMaxReduction.length} scenario(s) exceed ${maxReduction}%`,
    severity: overMaxReduction.length === 0 ? "ok" : "problem",
  });
  if (overMaxReduction.length > 0) {
    comProblems.push(`${overMaxReduction.length} scenario(s) exceed the ${maxReduction}% reduction maximum`);
    redFlags.push({ flag: "70% reduction automatically applied", severity: "high", detail: `Scenario(s) exceed ${maxReduction}% reduction cap`, category: "commercial_model" });
  }

  // "up to 70%" not interpreted as guaranteed
  const guaranteedLanguage = scenarios.filter((s: any) => {
    const rationale = (s.rationale || "").toLowerCase();
    return rationale.includes("guaranteed") || rationale.includes("will achieve") || (s.reduction_pct || 0) === maxReduction && !s.reduction_range;
  });
  checks.push({
    id: "reduction_not_guaranteed", category: "commercial_model",
    label: '"Up to 70%" not interpreted as guaranteed 70%',
    passed: guaranteedLanguage.length === 0,
    detail: guaranteedLanguage.length === 0 ? "Reduction appropriately framed as potential" : `${guaranteedLanguage.length} scenario(s) use guaranteed language`,
    severity: guaranteedLanguage.length === 0 ? "ok" : "problem",
  });
  if (guaranteedLanguage.length > 0) {
    comProblems.push("Reduction is presented as guaranteed rather than potential");
    redFlags.push({ flag: "70% reduction automatically applied", severity: "high", detail: "Reduction presented as guaranteed rather than 'up to'", category: "commercial_model" });
  }

  // Salary estimates distinguished from advertised
  const resourcing = hiring?.resourcing || {};
  const estimatedMarket = resourcing.estimated_market || [];
  const mislabelledSalary = estimatedMarket.filter((m: any) => m.compensation_type === "ADVERTISED" && m.assumption_source?.includes("ESTIMATED"));
  const salaryLabelledCorrectly = mislabelledSalary.length === 0;
  checks.push({
    id: "salary_estimates_labelled", category: "commercial_model",
    label: "Salary estimates distinguished from advertised compensation",
    passed: salaryLabelledCorrectly,
    detail: salaryLabelledCorrectly ? "Compensation sources correctly labelled" : `${mislabelledSalary.length} estimated salary(ies) labelled as advertised`,
    severity: salaryLabelledCorrectly ? "ok" : "problem",
  });
  if (!salaryLabelledCorrectly) {
    comProblems.push("Estimated salaries are labelled as advertised compensation");
    redFlags.push({ flag: "Estimated salary labelled as advertised", severity: "medium", detail: `${mislabelledSalary.length} estimated salary(ies) mislabelled as advertised`, category: "commercial_model" });
  }

  // Commercial outputs not presented as Hybrid quotations
  const outreachText = JSON.stringify(outreach || {}).toLowerCase();
  const presentedAsQuote = outreachText.includes("quote") || outreachText.includes("quotation") || outreachText.includes("fixed price");
  checks.push({
    id: "not_presented_as_quote", category: "commercial_model",
    label: "Commercial outputs not presented as Hybrid quotations",
    passed: !presentedAsQuote,
    detail: presentedAsQuote ? "Outreach references quotations/fixed prices" : "Commercial outputs framed as estimates",
    severity: presentedAsQuote ? "problem" : "ok",
  });
  if (presentedAsQuote) comProblems.push("Commercial outputs are presented as quotations rather than estimates");

  // Extreme cost without complexity evidence
  const tradCost = commercial.traditional?.cost?.expected || 0;
  const complexity = scores.migration_complexity?.value || 50;
  const extremeCostWithoutComplexity = tradCost > 2000000 && complexity < 40;
  checks.push({
    id: "cost_matches_complexity", category: "commercial_model",
    label: "Implementation cost supported by complexity evidence",
    passed: !extremeCostWithoutComplexity,
    detail: !extremeCostWithoutComplexity ? "Cost aligned with complexity score" : `£${tradCost.toLocaleString()} cost with only ${complexity}/100 complexity`,
    severity: !extremeCostWithoutComplexity ? "ok" : "problem",
  });
  if (extremeCostWithoutComplexity) {
    comProblems.push("Extreme implementation cost without sufficient complexity evidence");
    redFlags.push({ flag: "Extreme implementation cost without sufficient complexity evidence", severity: "medium", detail: `£${tradCost.toLocaleString()} estimated but complexity is only ${complexity}/100`, category: "commercial_model" });
  }

  const comScore = scoreFromChecks(checks.filter((c) => c.category === "commercial_model"));

  // ===== GTM OUTPUT =====
  const gtmProblems: string[] = [];
  const gtmWarnings: string[] = [];

  // Buying committee hypotheses labelled
  const committeeLabelled = buyingCommittee.length === 0 || buyingCommittee.every((m: any) => m.hypothesis || m.role || m.label);
  checks.push({
    id: "committee_labelled", category: "gtm_output",
    label: "Buying committee hypotheses labelled appropriately",
    passed: !!committeeLabelled,
    detail: committeeLabelled ? `${buyingCommittee.length} committee member(s) labelled` : "Some committee members lack hypothesis labels",
    severity: committeeLabelled ? "ok" : "warning",
  });
  if (!committeeLabelled) gtmWarnings.push("Some buying committee members lack hypothesis labels");

  // Outreach only uses supported signals
  const signals = intelligence?.signals || [];
  const signalTexts = signals.map((s: any) => (s.signal || "").toLowerCase());
  const outreachBody = (outreach?.body || outreach?.message || "").toLowerCase();
  const outreachClaims = outreachBody.split(/[.!?]/).filter((c: string) => c.trim().length > 20);
  let unsupportedClaims = 0;
  for (const claim of outreachClaims) {
    const hasSupport = signalTexts.some((s: string) => claim.includes(s) || s.includes(claim.slice(0, 30)));
    if (!hasSupport && claim.length > 40) unsupportedClaims++;
  }
  const outreachSupported = unsupportedClaims === 0 || outreachClaims.length === 0;
  checks.push({
    id: "outreach_uses_supported_signals", category: "gtm_output",
    label: "Outreach only uses supported signals",
    passed: !!outreachSupported,
    detail: outreachSupported ? "Outreach claims are supported by signals" : `${unsupportedClaims} outreach claim(s) lack signal support`,
    severity: outreachSupported ? "ok" : "problem",
  });
  if (!outreachSupported) {
    gtmProblems.push("Outreach references information not supported by collected signals");
    redFlags.push({ flag: "Outreach referencing unsupported information", severity: "medium", detail: `${unsupportedClaims} outreach claim(s) lack signal support`, category: "gtm_output" });
  }

  const gtmScore = scoreFromChecks(checks.filter((c) => c.category === "gtm_output"));

  // ===== ASSEMBLE =====
  const categories = {
    erp_intelligence: { score: erpScore, problems: erpProblems, warnings: erpWarnings, recommended_fix: recommendFix(erpProblems, erpWarnings, "ERP intelligence") },
    evidence: { score: evScore, problems: evProblems, warnings: evWarnings, recommended_fix: recommendFix(evProblems, evWarnings, "Evidence") },
    hiring_intelligence: { score: hireScore, problems: hireProblems, warnings: hireWarnings, recommended_fix: recommendFix(hireProblems, hireWarnings, "Hiring intelligence") },
    transformation_intelligence: { score: transScore, problems: transProblems, warnings: transWarnings, recommended_fix: recommendFix(transProblems, transWarnings, "Transformation intelligence") },
    commercial_model: { score: comScore, problems: comProblems, warnings: comWarnings, recommended_fix: recommendFix(comProblems, comWarnings, "Commercial model") },
    gtm_output: { score: gtmScore, problems: gtmProblems, warnings: gtmWarnings, recommended_fix: recommendFix(gtmProblems, gtmWarnings, "GTM output") },
  };

  const weights = { erp_intelligence: 0.25, evidence: 0.20, hiring_intelligence: 0.10, transformation_intelligence: 0.15, commercial_model: 0.20, gtm_output: 0.10 };
  const overall = Math.round(
    categories.erp_intelligence.score * weights.erp_intelligence +
    categories.evidence.score * weights.evidence +
    categories.hiring_intelligence.score * weights.hiring_intelligence +
    categories.transformation_intelligence.score * weights.transformation_intelligence +
    categories.commercial_model.score * weights.commercial_model +
    categories.gtm_output.score * weights.gtm_output
  );

  const highFlags = redFlags.filter((f) => f.severity === "high").length;
  const status: "PASS" | "REVIEW" | "FAIL" = overall >= 75 && highFlags === 0 ? "PASS" : overall >= 50 || highFlags <= 1 ? "REVIEW" : "FAIL";

  return {
    score: overall,
    status,
    max_reduction: maxReduction,
    categories,
    red_flags: redFlags,
    checks,
    generated_at: new Date().toISOString(),
  };
}

function scoreFromChecks(checks: Check[]): number {
  if (checks.length === 0) return 50;
  let score = 0;
  for (const c of checks) {
    if (c.severity === "ok") score += 100 / checks.length;
    else if (c.severity === "warning") score += 60 / checks.length;
    // problem = 0
  }
  return Math.round(score);
}

function recommendFix(problems: string[], warnings: string[], area: string): string {
  if (problems.length === 0 && warnings.length === 0) return `${area} passes all quality checks.`;
  if (problems.length > 0) return `Fix: ${problems[0]}. Re-run research to gather supporting evidence.`;
  return `Review: ${warnings[0]}. Validate before presenting.`;
}