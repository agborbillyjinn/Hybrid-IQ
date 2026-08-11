// Cross-Source Evidence Reconciliation Engine
// Aggregates evidence from multiple independent source types, computes weighted
// confidence (not averaged), detects smart conflicts, models the ERP estate,
// scores evidence health, and identifies research gaps.
import { classifySource, extractDomain } from "./sourceTaxonomy.ts";

export const CONCLUSION_TAGS = [
  "current_erp", "historical_erp", "target_erp", "erp_version", "erp_modules",
  "integration_technologies", "cloud_platform", "implementation_partner",
  "programme_stage", "transformation_probability", "transformation_urgency",
  "consulting_demand", "erp_user_count", "legal_entities",
] as const;

const TRANSFORMATION_KEYWORDS = /(migrat|transformation|s\/4hana|s4hana|fusion cloud|netsuite|workday|upgrade|cutover|go-live|go live|rollout|roll-out|deployment|greenfield|brownfield|implementation programme|implementation program)/i;
const MODULE_KEYWORDS = /(module|fico|fi-co|controlling|material management|\bmm\b|\bsd\b|sales distrib|supply chain|procurement|manufacturing|wm|ewm|tm|qm|pm|ps|hr|payroll|hcm)/i;
const INTEGRATION_KEYWORDS = /(integration|api|middleware|boomi|mulesoft|kafka|etl|data migration|interface|web service|rest|soap)/i;
const CLOUD_KEYWORDS = /(cloud|aws|azure|gcp|hyperscaler|saas|hosted|on-premise|on premise|datacenter)/i;
const PARTNER_KEYWORDS = /(accenture|deloitte|ibm|capgemini|pwc|kpmg|egis|cognizant|wipro|tata|tcs|infosys|si partner|systems integrator|implementation partner|consultant|advisor)/i;
const URGENCY_KEYWORDS = /(deadline|urgent|cutover|go-live|go live|end of support|mainstream support|2027|2030|mandat)/i;
const USER_COUNT_KEYWORDS = /(user count|erp users|seat|named user|concurrent user|license count)/i;
const ENTITY_KEYWORDS = /(legal entit|subsidiar|acquisition|acquired|division|business unit|regional)/i;

export interface EnrichedEvidence {
  [key: string]: any;
  conclusion_tags: string[];
  source_category: string;
  source_strength: number;
  source_origin: string;
  canonical_source: string;
  duplicate_group_id: string;
  stance: "supporting" | "conflicting" | "neutral";
}

export function reconcileEvidence(intelligence: any, rawEvidence: any[]): any {
  const evidenceList = collectEvidence(intelligence, rawEvidence);
  const enriched = enrichEvidence(evidenceList);
  const { duplicateGroups, independentCount } = computeSourceIndependence(enriched);
  const clusters = buildClusters(enriched, intelligence);
  const erpEstate = buildErpEstate(enriched, intelligence);
  const evidenceHealth = computeEvidenceHealth(enriched, intelligence, clusters);
  const researchGaps = identifyResearchGaps(clusters, erpEstate, intelligence);
  const latestDate = getLatestDate(enriched);

  return {
    clusters,
    erp_estate: erpEstate,
    evidence_health: evidenceHealth,
    research_gaps: researchGaps,
    source_stats: {
      total_sources: enriched.length,
      independent_sources: independentCount,
      duplicate_groups: duplicateGroups.length,
      source_categories: countByCategory(enriched),
    },
    latest_evidence_date: latestDate,
    accuracy_principle: applyAccuracyPrinciple(clusters, evidenceHealth),
  };
}

function collectEvidence(intelligence: any, rawEvidence: any[]): any[] {
  const list: any[] = [];
  // Explicit evidence records
  for (const e of rawEvidence || []) list.push({ ...e, _kind: "evidence" });
  // Derive evidence from job vacancies (vacancies are a source type too)
  for (const v of intelligence?.job_vacancies || []) {
    list.push({
      _kind: "vacancy",
      finding: `${v.job_title} — ${v.erp_product || "ERP"} vacancy (${v.status || "ACTIVE"})`,
      erp_vendor: v.erp_vendor,
      erp_product: v.erp_product,
      erp_version: v.erp_version,
      source_type: v.status === "HISTORICAL" ? "Historic vacancy" : "Current job vacancy",
      source_name: v.source,
      source_url: v.source_url,
      canonical_url: v.canonical_url,
      dedup_hash: v.dedup_hash,
      evidence_date: v.date_posted || v.date_first_detected,
      current_or_historical: v.status === "HISTORICAL" ? "HISTORICAL" : "CURRENT",
      evidence_extract: (v.raw_text_reference || v.responsibilities || "").slice(0, 500),
      confidence_score: v.evidence_confidence,
      classification: v.classification,
      responsibilities: v.responsibilities,
      technical_skills: v.technical_skills,
    });
  }
  // Derive evidence from signals
  for (const s of intelligence?.signals || []) {
    list.push({
      _kind: "signal",
      finding: s.signal,
      source_type: s.source || "Signal",
      source_name: s.source,
      evidence_date: s.date,
      current_or_historical: "CURRENT",
      confidence_score: s.impact_on_probability,
      category: s.category,
    });
  }
  return list;
}

function enrichEvidence(evidenceList: any[]): EnrichedEvidence[] {
  return evidenceList.map((ev, idx) => {
    const { category, strength } = classifySource(ev.source_type, ev.source_name, ev.source_url || ev.canonical_url);
    const tags = inferConclusionTags(ev);
    const origin = ev.dedup_hash ? `vacancy:${ev.dedup_hash}` : `origin:${extractDomain(ev.source_url || ev.canonical_url) || ev.source_name || ev.source_type || "unknown"}`;
    return {
      ...ev,
      conclusion_tags: tags,
      source_category: category,
      source_strength: strength,
      source_origin: origin,
      canonical_source: extractDomain(ev.canonical_url || ev.source_url) || ev.source_name || category,
      duplicate_group_id: origin,
      stance: "supporting" as const,
      _idx: idx,
    };
  });
}

function inferConclusionTags(ev: any): string[] {
  const tags = new Set<string>();
  const text = `${ev.finding || ""} ${ev.source_type || ""} ${ev.erp_product || ""} ${ev.responsibilities || ""} ${(ev.technical_skills || []).join(" ")}`.toLowerCase();
  const isHistorical = ev.current_or_historical === "HISTORICAL" || /historic/.test(ev.source_type || "");

  if (ev.erp_vendor || ev.erp_product) {
    tags.add(isHistorical ? "historical_erp" : "current_erp");
  }
  if (TRANSFORMATION_KEYWORDS.test(text)) {
    tags.add("target_erp");
    tags.add("programme_stage");
    tags.add("transformation_probability");
  }
  if (MODULE_KEYWORDS.test(text)) tags.add("erp_modules");
  if (INTEGRATION_KEYWORDS.test(text)) tags.add("integration_technologies");
  if (CLOUD_KEYWORDS.test(text)) tags.add("cloud_platform");
  if (PARTNER_KEYWORDS.test(text)) tags.add("implementation_partner");
  if (/vacancy|hiring|recruit|contractor|consultant/.test(text)) tags.add("programme_stage");
  if (URGENCY_KEYWORDS.test(text)) tags.add("transformation_urgency");
  if (USER_COUNT_KEYWORDS.test(text)) tags.add("erp_user_count");
  if (ENTITY_KEYWORDS.test(text)) tags.add("legal_entities");
  if (ev.erp_version) tags.add("erp_version");

  if (tags.size === 0) tags.add("current_erp");
  return Array.from(tags);
}

function computeSourceIndependence(enriched: EnrichedEvidence[]) {
  const groups = new Map<string, EnrichedEvidence[]>();
  for (const ev of enriched) {
    if (!groups.has(ev.duplicate_group_id)) groups.set(ev.duplicate_group_id, []);
    groups.get(ev.duplicate_group_id)!.push(ev);
  }
  const duplicateGroups = Array.from(groups.entries()).map(([key, items]) => ({
    group_id: key,
    origin: items[0].source_origin,
    canonical_source: items[0].canonical_source,
    count: items.length,
    top_category: items.sort((a, b) => b.source_strength - a.source_strength)[0].source_category,
  }));
  return { duplicateGroups, independentCount: groups.size };
}

function buildClusters(enriched: EnrichedEvidence[], intelligence: any): any[] {
  const conclusions = defineConclusions(intelligence);
  const clusters: any[] = [];
  for (const con of conclusions) {
    const supporting = enriched.filter((e) => e.conclusion_tags.includes(con.tag) && supportsConclusion(e, con, intelligence));
    const conflicting = enriched.filter((e) => e.conclusion_tags.includes(con.tag) && conflictsWithConclusion(e, con, supporting));
    if (supporting.length === 0 && conflicting.length === 0) {
      clusters.push({ ...con, status: "UNKNOWN", confidence: 0, independent_sources: 0, supporting: [], conflicting: [], explanation: "No evidence collected for this conclusion." });
      continue;
    }
    const independentSupporting = dedupeByOrigin(supporting);
    const confidence = computeClusterConfidence(independentSupporting, conflicting);
    const status = confidenceToStatus(confidence, conflicting.length);
    const explanation = buildExplanation(con, independentSupporting, conflicting, intelligence);
    const interpretation = conflicting.length > 0 ? interpretConflict(independentSupporting, conflicting) : null;
    clusters.push({
      ...con,
      status,
      confidence,
      independent_sources: independentSupporting.length,
      supporting: independentSupporting.map(summariseEvidence),
      conflicting: conflicting.map(summariseEvidence),
      latest_evidence_date: getLatestDate([...independentSupporting, ...conflicting]),
      explanation,
      interpretation,
    });
  }
  return clusters;
}

function defineConclusions(intelligence: any): any[] {
  const estate = intelligence.erp_estate || {};
  const scores = intelligence.scores || {};
  return [
    { tag: "current_erp", label: "Current ERP", value: estate.current_erp_product?.value || intelligence.erp_inference?.current_erp || "—" },
    { tag: "historical_erp", label: "Historical ERP", value: estate.previous_erp_product?.value || "—" },
    { tag: "target_erp", label: "Likely Target ERP", value: intelligence.target_erp?.next_erp || intelligence.target_erp?.product || estate.target_erp_product?.value || "—" },
    { tag: "erp_version", label: "Current ERP Version", value: estate.current_erp_version?.value || "—" },
    { tag: "erp_modules", label: "ERP Modules", value: estate.erp_modules?.value ? (Array.isArray(estate.erp_modules.value) ? estate.erp_modules.value.join(", ") : estate.erp_modules.value) : "—" },
    { tag: "integration_technologies", label: "Integration Technologies", value: estate.integration_technologies?.value || "—" },
    { tag: "cloud_platform", label: "Cloud Platform", value: estate.cloud_platform?.value || "—" },
    { tag: "implementation_partner", label: "Implementation Partner", value: estate.implementation_partner?.value || "—" },
    { tag: "programme_stage", label: "Programme Stage", value: intelligence.hiring_intelligence?.likely_programme_stage || "—" },
    { tag: "transformation_probability", label: "Transformation Probability", value: scores.transformation_probability?.value != null ? `${scores.transformation_probability.value}%` : "—" },
    { tag: "transformation_urgency", label: "Transformation Urgency", value: estate.transformation_deadline?.value || "—" },
    { tag: "consulting_demand", label: "Consulting Demand", value: intelligence.hiring_intelligence?.consulting_demand_level || "—" },
    { tag: "erp_user_count", label: "ERP User Count", value: estate.estimated_users?.value || "—" },
    { tag: "legal_entities", label: "Legal Entities", value: estate.legal_entities?.value || "—" },
  ];
}

function supportsConclusion(ev: any, con: any, intelligence: any): boolean {
  return true; // tagged evidence supports by default; stance refined in conflicts
}

function conflictsWithConclusion(ev: any, con: any, supporting: EnrichedEvidence[]): boolean {
  // Only flag conflict for ERP-product conclusions where a different product is referenced
  if (!["current_erp", "target_erp", "historical_erp"].includes(con.tag)) return false;
  if (!ev.erp_product) return false;
  const supportProducts = supporting.map((s) => (s.erp_product || "").toLowerCase()).filter(Boolean);
  if (supportProducts.length === 0) return false;
  const evProduct = (ev.erp_product || "").toLowerCase();
  // Same product → not a conflict
  if (supportProducts.includes(evProduct)) return false;
  // Same vendor, different product (e.g. SAP ECC vs S/4HANA) → transformation signal, not a hard conflict,
  // but we surface it as a "conflicting/nuanced" evidence item with low severity
  const evVendor = (ev.erp_vendor || "").toLowerCase();
  const supportVendors = supporting.map((s) => (s.erp_vendor || "").toLowerCase()).filter(Boolean);
  if (evVendor && supportVendors.includes(evVendor)) return true; // same vendor different product
  // Different vendor, one historical one current → migration (not a true conflict)
  const evHistorical = ev.current_or_historical === "HISTORICAL";
  const supportHistorical = supporting.some((s) => s.current_or_historical === "HISTORICAL");
  if (evHistorical !== supportHistorical) return true; // migration pattern
  // Different vendor, both current → potential true conflict or hybrid estate
  return true;
}

function computeClusterConfidence(supporting: EnrichedEvidence[], conflicting: EnrichedEvidence[]): number {
  if (supporting.length === 0) return 0;
  const strengths = supporting.map((s) => s.source_strength || 0.3).sort((a, b) => b - a);
  let confidence = strengths[0];
  for (let i = 1; i < strengths.length; i++) {
    confidence += strengths[i] * Math.pow(0.5, i);
  }
  confidence = Math.min(confidence, 0.97);
  if (conflicting.length > 0) {
    const conflictStrength = conflicting.reduce((sum, c) => sum + (c.source_strength || 0.3), 0);
    const severity = assessConflictSeverity(supporting, conflicting);
    confidence -= conflictStrength * 0.2 * severity;
  }
  return Math.round(Math.max(0, Math.min(confidence, 0.99)) * 100);
}

function assessConflictSeverity(supporting: EnrichedEvidence[], conflicting: EnrichedEvidence[]): number {
  let max = 0;
  for (const s of supporting) {
    for (const c of conflicting) {
      const sV = (s.erp_vendor || "").toLowerCase();
      const cV = (c.erp_vendor || "").toLowerCase();
      const sP = (s.erp_product || "").toLowerCase();
      const cP = (c.erp_product || "").toLowerCase();
      if (sV && cV && sV === cV && sP !== cP) {
        max = Math.max(max, 0.25); // same vendor different product → transformation
      } else if (sV && cV && sV !== cV) {
        const sH = s.current_or_historical === "HISTORICAL";
        const cH = c.current_or_historical === "HISTORICAL";
        if (sH !== cH) max = Math.max(max, 0.3); // migration pattern
        else max = Math.max(max, 0.65); // potential true conflict / hybrid estate
      } else {
        max = Math.max(max, 0.45);
      }
    }
  }
  return max;
}

function interpretConflict(supporting: EnrichedEvidence[], conflicting: EnrichedEvidence[]): string {
  const sProducts = unique(supporting.map((s) => s.erp_product).filter(Boolean));
  const cProducts = unique(conflicting.map((c) => c.erp_product).filter(Boolean));
  const sVendors = unique(supporting.map((s) => s.erp_vendor).filter(Boolean));
  const cVendors = unique(conflicting.map((c) => c.erp_vendor).filter(Boolean));
  if (sProducts.length && cProducts.length) {
    const sameVendor = sVendors.some((v) => cVendors.map((x) => x.toLowerCase()).includes(v.toLowerCase()));
    const supportHistorical = supporting.some((s) => s.current_or_historical === "HISTORICAL");
    const conflictCurrent = conflicting.some((c) => c.current_or_historical === "CURRENT");
    if (sameVendor) {
      return `${sProducts.join(", ")} likely remains part of the estate while ${cProducts.join(", ")} transformation is underway.`;
    }
    if (supportHistorical || conflictCurrent) {
      return `${sProducts.join(", ")} appears to be the legacy estate while ${cProducts.join(", ")} represents the target/future state — migration pattern.`;
    }
    return `Evidence suggests a mixed or hybrid estate: ${sProducts.join(", ")} and ${cProducts.join(", ")} may coexist across business units or regions.`;
  }
  return "Conflicting evidence detected — manual review recommended before acting.";
}

function buildExplanation(con: any, supporting: EnrichedEvidence[], conflicting: EnrichedEvidence[], intelligence: any): string {
  if (supporting.length === 0 && conflicting.length === 0) return "No evidence collected for this conclusion.";
  const parts: string[] = [];
  const topSource = supporting.sort((a, b) => b.source_strength - a.source_strength)[0];
  parts.push(`Strongest support: ${topSource.source_category} (${topSource.source_strength.toFixed(2)})`);
  if (supporting.length > 1) parts.push(`${supporting.length} independent supporting source${supporting.length > 1 ? "s" : ""}`);
  if (conflicting.length > 0) parts.push(`${conflicting.length} conflicting item${conflicting.length > 1 ? "s" : ""} — see interpretation`);
  return parts.join(" · ");
}

function dedupeByOrigin(evidence: EnrichedEvidence[]): EnrichedEvidence[] {
  const seen = new Map<string, EnrichedEvidence>();
  for (const ev of evidence) {
    if (!seen.has(ev.duplicate_group_id)) seen.set(ev.duplicate_group_id, ev);
  }
  return Array.from(seen.values());
}

function summariseEvidence(ev: EnrichedEvidence): any {
  return {
    finding: ev.finding,
    source_category: ev.source_category,
    source_strength: ev.source_strength,
    source_name: ev.source_name,
    source_url: ev.source_url,
    evidence_date: ev.evidence_date,
    erp_product: ev.erp_product,
    erp_vendor: ev.erp_vendor,
    current_or_historical: ev.current_or_historical,
  };
}

function confidenceToStatus(confidence: number, conflictCount: number): string {
  if (confidence === 0) return "UNKNOWN";
  if (conflictCount > 0 && confidence < 60) return "MIXED";
  if (confidence >= 80) return "CONFIRMED";
  if (confidence >= 65) return "HIGHLY LIKELY";
  if (confidence >= 45) return "INFERRED";
  return "UNKNOWN";
}

function buildErpEstate(enriched: EnrichedEvidence[], intelligence: any): any {
  const estate: any = {
    primary: null, legacy: [], target: null, regional: [], subsidiary: [], acquired: [], specialist: [], unknown: false,
  };
  const byProduct = new Map<string, any>();
  for (const ev of enriched) {
    if (!ev.erp_product) continue;
    const key = ev.erp_product;
    if (!byProduct.has(key)) byProduct.set(key, { product: key, vendor: ev.erp_vendor, evidence: [], current: 0, historical: 0, transformation: 0 });
    const g = byProduct.get(key);
    g.evidence.push(ev);
    if (ev.current_or_historical === "HISTORICAL") g.historical++;
    else g.current++;
    if (ev.conclusion_tags.includes("target_erp") || ev.conclusion_tags.includes("programme_stage")) g.transformation++;
  }
  const products = Array.from(byProduct.values());
  for (const p of products) {
    const conf = Math.min(95, 50 + p.evidence.length * 10);
    if (p.transformation > 0 && p.current === 0) {
      estate.target = { product: p.product, vendor: p.vendor, evidence_count: p.evidence.length, confidence: conf };
    } else if (p.historical > 0 && p.current === 0) {
      estate.legacy.push({ product: p.product, vendor: p.vendor, evidence_count: p.evidence.length, confidence: conf });
    } else if (p.current > 0 && p.transformation > 0) {
      if (!estate.primary) estate.primary = { product: p.product, vendor: p.vendor, evidence_count: p.evidence.length, confidence: conf, transformation_underway: true };
      else estate.specialist.push({ product: p.product, vendor: p.vendor, evidence_count: p.evidence.length });
    } else if (p.current > 0) {
      if (!estate.primary) estate.primary = { product: p.product, vendor: p.vendor, evidence_count: p.evidence.length, confidence: conf };
      else estate.specialist.push({ product: p.product, vendor: p.vendor, evidence_count: p.evidence.length });
    }
  }
  // Fallback to LLM-derived estate
  const llmEstate = intelligence.erp_estate || {};
  if (!estate.primary && llmEstate.current_erp_product?.value) {
    estate.primary = { product: llmEstate.current_erp_product.value, vendor: llmEstate.current_erp_vendor?.value, evidence_count: 0, confidence: llmEstate.current_erp_product.confidence || 50, llm_inferred: true };
  }
  if (estate.legacy.length === 0 && llmEstate.previous_erp_product?.value) {
    estate.legacy.push({ product: llmEstate.previous_erp_product.value, vendor: llmEstate.previous_erp_vendor?.value, evidence_count: 0, llm_inferred: true });
  }
  if (!estate.target && llmEstate.target_erp_product?.value) {
    estate.target = { product: llmEstate.target_erp_product.value, vendor: llmEstate.target_erp_vendor?.value, evidence_count: 0, llm_inferred: true };
  }
  if (!estate.primary && !estate.target && estate.legacy.length === 0) estate.unknown = true;
  return estate;
}

function computeEvidenceHealth(enriched: EnrichedEvidence[], intelligence: any, clusters: any[]): any {
  const has = (tags: string[]) => enriched.filter((e) => tags.some((t) => e.conclusion_tags.includes(t)));
  const dims = {
    erp_evidence: dimScore(has(["current_erp", "historical_erp", "target_erp", "erp_version", "erp_modules"])),
    hiring_evidence: dimScore(enriched.filter((e) => ["Current job vacancy", "Historic vacancy", "Company careers page"].includes(e.source_category))),
    transformation_evidence: dimScore(has(["transformation_probability", "transformation_urgency", "programme_stage", "target_erp"])),
    company_data: companyDataScore(intelligence),
    commercial_assumption: commercialScore(intelligence),
    buying_committee: committeeScore(intelligence),
    historical_coverage: historicalCoverage(enriched),
    recent_coverage: recentCoverage(enriched),
  };
  const overall = Math.round(
    dims.erp_evidence * 0.20 + dims.hiring_evidence * 0.15 + dims.transformation_evidence * 0.20 +
    dims.company_data * 0.10 + dims.commercial_assumption * 0.10 + dims.buying_committee * 0.10 +
    dims.historical_coverage * 0.075 + dims.recent_coverage * 0.075
  );
  return { ...dims, overall };
}

function dimScore(evidence: EnrichedEvidence[]): number {
  if (evidence.length === 0) return 0;
  const independent = dedupeByOrigin(evidence);
  const avgStrength = independent.reduce((s, e) => s + e.source_strength, 0) / independent.length;
  const countFactor = Math.min(independent.length / 4, 1); // 4+ independent sources = full
  return Math.round(avgStrength * 60 + countFactor * 40);
}

function companyDataScore(intelligence: any): number {
  const co = intelligence.company_overview || {};
  const fields = ["name", "industry", "employees", "revenue", "headquarters", "ownership", "locations"];
  const present = fields.filter((f) => co[f] != null && co[f] !== "").length;
  return Math.round((present / fields.length) * 100);
}

function commercialScore(intelligence: any): number {
  const cm = intelligence.commercial_model || {};
  const trad = cm.traditional || {};
  const hasCost = trad.cost && (trad.cost.low || trad.cost.expected || trad.cost.high);
  const hasScenarios = (cm.hybrid_scenarios || []).length > 0;
  const hasComplexity = cm.complexity_drivers && (cm.complexity_drivers.length > 0 || Object.keys(cm.complexity_drivers || {}).length > 0);
  return Math.round(((hasCost ? 40 : 0) + (hasScenarios ? 35 : 0) + (hasComplexity ? 25 : 0)));
}

function committeeScore(intelligence: any): number {
  const bc = intelligence.buying_committee || [];
  if (bc.length === 0) return 0;
  return Math.min(100, bc.length * 25);
}

function historicalCoverage(enriched: EnrichedEvidence[]): number {
  const dates = enriched.map((e) => e.evidence_date).filter(Boolean).sort();
  if (dates.length < 2) return dates.length === 1 ? 20 : 0;
  const first = new Date(dates[0]).getTime();
  const last = new Date(dates[dates.length - 1]).getTime();
  if (isNaN(first) || isNaN(last)) return 30;
  const months = (last - first) / (1000 * 60 * 60 * 24 * 30);
  return Math.min(100, Math.round(months / 3)); // 3+ months span = decent, 30+ months = full
}

function recentCoverage(enriched: EnrichedEvidence[]): number {
  const now = Date.now();
  const recent = enriched.filter((e) => {
    if (!e.evidence_date) return false;
    const t = new Date(e.evidence_date).getTime();
    return !isNaN(t) && (now - t) < 1000 * 60 * 60 * 24 * 365; // within 12 months
  });
  if (recent.length === 0) return 0;
  return Math.min(100, recent.length * 30);
}

function identifyResearchGaps(clusters: any[], erpEstate: any, intelligence: any): any[] {
  const gaps: any[] = [];
  const find = (tag: string) => clusters.find((c) => c.tag === tag);
  const gap = (g: string, why: string, impact: string, action: string, priority: string) => gaps.push({ gap: g, why_it_matters: why, impact_on_score: impact, recommended_action: action, priority });

  const erpVersion = find("erp_version");
  if (!erpVersion || erpVersion.confidence < 50) gap("Current ERP version unknown", "Version determines migration path complexity and vendor support timeline (e.g. SAP ECC end-of-mainstream 2027).", "Migration Complexity ±15%", "Search for ERP version in job vacancy skills, vendor case studies, or company technology pages.", "High");

  if (!intelligence.erp_estate?.estimated_users?.value) gap("No evidence for ERP user count", "User count drives commercial modelling, licensing and transformation scale.", "Commercial Model ±25%", "Search annual reports, investor presentations, or procurement notices for user/seat counts.", "Medium");

  if (!intelligence.erp_estate?.transformation_deadline?.value) gap("Transformation deadline unknown", "Deadline drives urgency scoring and cost-of-delay calculations.", "Transformation Urgency ±20%", "Search press releases, investor calls, or executive interviews for stated deadlines or go-live targets.", "High");

  const partner = find("implementation_partner");
  if (!partner || partner.confidence < 40) gap("Implementation partner unknown", "Existing SI relationship affects competitive positioning and commercial assumptions.", "Commercial Model ±15%", "Search for partner case studies, press releases, or contractor vacancies naming the systems integrator.", "High");

  if (!intelligence.erp_estate?.legal_entities?.value) gap("Number of legal entities unclear", "Entity count affects migration complexity, multi-country rollout and commercial scale.", "Migration Complexity ±10%", "Search annual reports or company filings for legal entity structure.", "Medium");

  const integration = find("integration_technologies");
  if (!integration || integration.confidence < 40) gap("Integration estate incomplete", "Integration complexity is a major cost driver in ERP transformations.", "Migration Complexity ±15%", "Search for integration architect vacancies, API/middleware mentions, or technology stack pages.", "Medium");

  const cloud = find("cloud_platform");
  if (!cloud || cloud.confidence < 40) gap("Cloud platform strategy unclear", "Cloud vs on-premise strategy affects deployment model and cost assumptions.", "Commercial Model ±10%", "Search for cloud architect vacancies, hyperscaler partnership announcements, or technology pages.", "Medium");

  const priorityOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
  gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  return gaps;
}

function applyAccuracyPrinciple(clusters: any[], health: any): string {
  const lowConf = clusters.filter((c) => c.confidence > 0 && c.confidence < 45);
  const unknown = clusters.filter((c) => c.status === "UNKNOWN");
  if (health.overall < 35) return "INSUFFICIENT EVIDENCE — confidence is low across multiple conclusions. Treat all outputs as hypotheses requiring validation.";
  if (unknown.length > 5) return "INSUFFICIENT EVIDENCE — several major conclusions lack supporting evidence. Prefer UNKNOWN over false certainty.";
  if (lowConf.length > 3) return "MIXED EVIDENCE — several conclusions have weak or conflicting support. Validate before acting.";
  return "SUFFICIENT EVIDENCE — major conclusions are supported by multiple independent sources.";
}

function getLatestDate(evidence: EnrichedEvidence[]): string | null {
  const dates = evidence.map((e) => e.evidence_date).filter(Boolean).sort();
  return dates.length ? dates[dates.length - 1] : null;
}

function countByCategory(enriched: EnrichedEvidence[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of enriched) counts[e.source_category] = (counts[e.source_category] || 0) + 1;
  return counts;
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function createVersionSnapshot(intelligence: any, reconciliation: any, analysisId: string, accountId: string, company: string, version: number): any {
  return {
    analysis_id: analysisId,
    account_id: accountId,
    company,
    version,
    created_at: new Date().toISOString(),
    source_count: reconciliation.source_stats.total_sources,
    independent_source_count: reconciliation.source_stats.independent_sources,
    evidence_health: reconciliation.evidence_health.overall,
    major_conclusions: reconciliation.clusters.map((c: any) => ({ conclusion: c.label, value: c.value, status: c.status, confidence: c.confidence })),
    scores: intelligence.scores,
    commercial_assumptions: intelligence.commercial_model,
    erp_estate: reconciliation.erp_estate,
  };
}