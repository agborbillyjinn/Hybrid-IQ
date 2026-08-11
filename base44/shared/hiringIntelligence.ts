// ERP Hiring & Consulting Demand Intelligence engine.
// Pure logic — derives programme stage, consulting demand, talent gaps, resourcing,
// delivery model, consulting economics and consultant-effort displacement from job vacancies.
// A job advert is a SIGNAL, not proof — technologies are classified by context.

const RATE_CARD: Record<string, number> = {
  "Programme Director": 1200, "Programme Manager": 1000,
  "Solution Architect": 1000, "Enterprise Architect": 1050,
  "Functional Consultant": 800, "Technical Consultant": 850,
  "Data Migration Lead": 800, "Data Specialist": 750,
  "Integration Specialist": 900, "Test Manager": 700, "Test Specialist": 650,
  "Change Manager": 700, "Change Specialist": 700, "Training Lead": 600,
  "Finance Transformation Lead": 950, "ERP Developer": 700,
  "ERP Support Analyst": 500, "ERP Administrator": 450,
};

const SALARY_CARD: Record<string, number> = {
  "Programme Director": 130000, "Programme Manager": 110000,
  "Solution Architect": 105000, "Enterprise Architect": 115000,
  "Functional Consultant": 85000, "Technical Consultant": 90000,
  "Data Migration Lead": 85000, "Data Specialist": 75000,
  "Integration Specialist": 95000, "Test Manager": 80000, "Test Specialist": 65000,
  "Change Manager": 85000, "Training Lead": 70000,
  "Finance Transformation Lead": 110000, "ERP Developer": 75000,
  "ERP Support Analyst": 45000, "ERP Administrator": 40000,
};

const CLASSIFICATION_KEYWORDS: [string, string[]][] = [
  ["ERP TRANSFORMATION", ["erp transformation", "transformation lead", "transformation director", "transformation manager"]],
  ["FINANCE TRANSFORMATION", ["finance transformation", "finance change"]],
  ["PROGRAMME MANAGEMENT", ["programme director", "program director", "programme manager", "program manager", "project director", "erp programme"]],
  ["MIGRATION", ["migration lead", "migration manager", "erp migration"]],
  ["DATA MIGRATION", ["data migration", "data lead", "data specialist"]],
  ["INTEGRATION", ["integration architect", "integration lead", "integration specialist", "integration"]],
  ["ARCHITECTURE", ["solution architect", "enterprise architect", "architect"]],
  ["IMPLEMENTATION", ["implementation consultant", "functional consultant", "solution consultant", "implementation lead", "business central consultant"]],
  ["TESTING", ["test manager", "test lead", "qa lead", "test analyst", "testing", "qa"]],
  ["CHANGE MANAGEMENT", ["change manager", "change lead", "change management"]],
  ["TRAINING", ["training lead", "training manager", "trainer"]],
  ["POST-GO-LIVE SUPPORT", ["hypercare", "post go-live", "post go live"]],
  ["DEVELOPMENT", ["developer", "development lead", "technical lead", "abap", "c/side", "al developer", "suitescript", "power platform developer"]],
  ["ERP ADMINISTRATION", ["administrator", "admin", "basis"]],
  ["BAU SUPPORT", ["support analyst", "support lead", "erp support", "nav support", "2nd line", "3rd line", "support"]],
];

const STAGE_VOTES: Record<string, Record<string, number>> = {
  "ERP TRANSFORMATION": { "EARLY EXPLORATION": 2, "BUSINESS CASE / DISCOVERY": 2, "PROGRAMME MOBILISATION": 3 },
  "FINANCE TRANSFORMATION": { "BUSINESS CASE / DISCOVERY": 2, "PROGRAMME MOBILISATION": 2 },
  "PROGRAMME MANAGEMENT": { "PROGRAMME MOBILISATION": 3, "DESIGN": 2, "IMPLEMENTATION": 2 },
  "MIGRATION": { "PROGRAMME MOBILISATION": 1, "IMPLEMENTATION": 2 },
  "DATA MIGRATION": { "IMPLEMENTATION": 3, "DATA MIGRATION": 3 },
  "INTEGRATION": { "IMPLEMENTATION": 2, "INTEGRATION": 3 },
  "ARCHITECTURE": { "PROGRAMME MOBILISATION": 2, "DESIGN": 3 },
  "IMPLEMENTATION": { "IMPLEMENTATION": 3, "DESIGN": 1 },
  "TESTING": { "TESTING": 3, "PRE-GO-LIVE": 2 },
  "CHANGE MANAGEMENT": { "CHANGE & TRAINING": 3, "PRE-GO-LIVE": 2 },
  "TRAINING": { "CHANGE & TRAINING": 3, "PRE-GO-LIVE": 2 },
  "POST-GO-LIVE SUPPORT": { "HYPERCARE": 3, "BAU / OPTIMISATION": 1 },
  "BAU SUPPORT": { "BAU / OPTIMISATION": 3 },
  "ERP ADMINISTRATION": { "BAU / OPTIMISATION": 2 },
  "DEVELOPMENT": { "IMPLEMENTATION": 1, "BAU / OPTIMISATION": 1 },
};

const TRANSFORMATION_CLASSES = new Set(["ERP TRANSFORMATION", "FINANCE TRANSFORMATION", "PROGRAMME MANAGEMENT", "MIGRATION", "DATA MIGRATION", "INTEGRATION", "ARCHITECTURE", "IMPLEMENTATION", "TESTING", "CHANGE MANAGEMENT", "TRAINING", "POST-GO-LIVE SUPPORT"]);
const SUPPORT_CLASSES = new Set(["BAU SUPPORT", "ERP ADMINISTRATION"]);

const DEFAULT_WS = [
  { name: "Requirements & Documentation", traditional_base: 180, compressibility: 78 },
  { name: "Process Design", traditional_base: 150, compressibility: 72 },
  { name: "Data Mapping & Migration", traditional_base: 220, compressibility: 82 },
  { name: "Configuration", traditional_base: 140, compressibility: 68 },
  { name: "Custom Development", traditional_base: 200, compressibility: 55 },
  { name: "Integration", traditional_base: 160, compressibility: 40 },
  { name: "Testing Preparation", traditional_base: 160, compressibility: 80 },
  { name: "Change Management", traditional_base: 180, compressibility: 15 },
  { name: "Governance", traditional_base: 140, compressibility: 10 },
];

function classify(v: any): string {
  const text = ((v.job_title || "") + " " + (v.responsibilities || "")).toLowerCase();
  for (const [label, kws] of CLASSIFICATION_KEYWORDS) {
    if (kws.some((k) => text.includes(k))) return label;
  }
  return "UNKNOWN";
}

function isSenior(v: any): boolean {
  return /director|lead|manager|architect|head of|principal|senior/i.test(v.job_title || "");
}

const STAGE_REQUIREMENTS: Record<string, string[]> = {
  "PROGRAMME MOBILISATION": ["Programme Management", "Solution Architecture", "Finance Transformation", "Data Migration", "Integration"],
  "DESIGN": ["Solution Architecture", "Process Design", "Data Migration", "Integration"],
  "IMPLEMENTATION": ["Data Migration", "Integration", "Testing", "Change Management", "Cutover Planning", "Training"],
  "DATA MIGRATION": ["Data Migration", "Data Quality", "Integration"],
  "INTEGRATION": ["Integration", "Interface Testing", "Data Migration"],
  "TESTING": ["Testing", "Test Automation", "UAT", "Cutover Planning"],
  "CHANGE & TRAINING": ["Change Management", "Training", "Cutover Planning"],
  "PRE-GO-LIVE": ["Cutover Planning", "Testing", "Hypercare", "Change Management"],
  "HYPERCARE": ["Hypercare", "Support", "Testing"],
};

function technologyRole(v: any, classification: string, dominantSupportTech: string): string {
  const text = ((v.job_title || "") + " " + (v.responsibilities || "") + " " + (v.technical_skills || "")).toLowerCase();
  const isHist = (v.status || "ACTIVE").toUpperCase() === "HISTORICAL";
  const tech = (v.erp_product || v.erp_vendor || "").toLowerCase();
  const isSupportTech = !!(dominantSupportTech && tech.includes(dominantSupportTech.toLowerCase()));
  if (isHist) {
    if (TRANSFORMATION_CLASSES.has(classification)) return "TARGET";
    return "LEGACY";
  }
  if (/experience (required|of)|years.? experience/.test(text)) {
    if (TRANSFORMATION_CLASSES.has(classification)) return "TARGET";
    return "EXPERIENCE";
  }
  if (TRANSFORMATION_CLASSES.has(classification)) return "TARGET";
  if (classification === "INTEGRATION") return "INTEGRATION";
  if (SUPPORT_CLASSES.has(classification)) return "CURRENT";
  if (classification === "DEVELOPMENT") return isSupportTech ? "CURRENT" : "TARGET";
  return "UNCLEAR";
}

function unique(arr: string[]): string[] {
  return [...new Set(arr.filter(Boolean))];
}

function parseCount(v: any): number {
  if (v == null) return 0;
  const m = String(v).match(/\d+/);
  return m ? parseInt(m[0]) : 0;
}

function band(v: number) {
  const n = Math.round(v);
  return { low: Math.round(n * 0.85), expected: n, high: Math.round(n * 1.15) };
}

function estimateSalary(title: string): number {
  const t = (title || "").toLowerCase();
  for (const [k, v] of Object.entries(SALARY_CARD)) if (t.includes(k.toLowerCase())) return v;
  return 70000;
}

function estimateDayRate(title: string): number {
  const t = (title || "").toLowerCase();
  for (const [k, v] of Object.entries(RATE_CARD)) if (t.includes(k.toLowerCase())) return v;
  return 800;
}

function toTechList(map: Record<string, number>) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([technology, count]) => ({
      technology,
      count,
      confidence: count >= 3 ? "HIGH" : count >= 2 ? "MEDIUM" : "LOW",
      status: count >= 2 ? "HIGHLY LIKELY" : "INFERRED",
    }));
}

function buildStageReasoning(stage: string, counts: Record<string, number>): string {
  const parts: string[] = [];
  const labels: [string, string][] = [
    ["PROGRAMME MANAGEMENT", "programme-management"], ["ARCHITECTURE", "architecture"],
    ["DATA MIGRATION", "data-migration"], ["INTEGRATION", "integration"],
    ["TESTING", "testing"], ["CHANGE MANAGEMENT", "change-management"],
    ["TRAINING", "training"], ["BAU SUPPORT", "BAU/support"], ["ERP TRANSFORMATION", "transformation"],
  ];
  for (const [k, label] of labels) if (counts[k]) parts.push(`${counts[k]} ${label} role(s)`);
  if (!parts.length) return "Insufficient role mix to infer programme stage.";
  return `Role mix (${parts.join(", ")}) suggests ${stage}.`;
}

function computeHiringSignalScore(d: any) {
  let s = 0;
  s += Math.min(30, d.total * 3);
  s += Math.min(20, d.transformationRoles * 4);
  s += Math.min(15, d.migrationRoles * 5);
  s += Math.min(10, d.contractRoles * 2);
  s += Math.min(10, d.programmeLeadership * 5);
  s += Math.min(10, d.seniorCount * 2);
  s += Math.min(5, d.moduleCount);
  s = Math.min(100, s);
  const level = s >= 80 ? "VERY HIGH" : s >= 60 ? "HIGH" : s >= 35 ? "MEDIUM" : "LOW";
  return { score: s, level };
}

function computeConsultingDemand(d: any) {
  let s = 0;
  s += Math.min(25, d.total * 2.5);
  s += Math.min(20, d.transformationRoles * 3);
  s += Math.min(15, d.migrationRoles * 4);
  s += Math.min(10, d.contractRoles * 2);
  s += Math.min(10, d.seniorCount * 1.5);
  s += Math.min(5, d.moduleCount);
  s += Math.min(5, d.entities * 1.5);
  s += Math.min(5, d.countries * 2);
  s += Math.min(5, Math.min(5, d.users / 100));
  s += Math.min(10, d.complexity / 10);
  const stageBoost: Record<string, number> = { "PROGRAMME MOBILISATION": 10, "DESIGN": 10, "IMPLEMENTATION": 12, "DATA MIGRATION": 10, "INTEGRATION": 8, "TESTING": 6, "CHANGE & TRAINING": 4, "PRE-GO-LIVE": 4, "HYPERCARE": 2 };
  s += stageBoost[d.stage] || 0;
  s = Math.min(100, s);
  const level = s >= 80 ? "VERY HIGH" : s >= 60 ? "HIGH" : s >= 35 ? "MEDIUM" : "LOW";
  const reasons: string[] = [];
  if (d.transformationRoles >= 3) reasons.push(`${d.transformationRoles} transformation-specific roles`);
  if (d.migrationRoles >= 1) reasons.push(`${d.migrationRoles} migration role(s)`);
  if (d.contractRoles >= 2) reasons.push(`${d.contractRoles} contract roles suggesting external capacity need`);
  if (d.seniorCount >= 3) reasons.push(`${d.seniorCount} senior/architect roles`);
  if (d.entities >= 3) reasons.push(`${d.entities} legal entities increasing programme scope`);
  if (d.complexity >= 65) reasons.push(`high migration complexity (${d.complexity}/100)`);
  if (!reasons.length) reasons.push("Limited ERP hiring activity detected");
  return { score: s, level, reasons };
}

function buildResourcing(vacs: any[], active: any[], gapCount: number) {
  const advertised = active.filter((v) => v.advertised_compensation).map((v) => ({ job_title: v.job_title, advertised_compensation: v.advertised_compensation, employment_type: v.employment_type }));
  const permanent = active.filter((v) => (v.employment_type || "").toLowerCase().includes("permanent"));
  const contract = active.filter((v) => (v.employment_type || "").toLowerCase().includes("contract"));
  const estFte = permanent.length + contract.length;
  const permCost = permanent.reduce((sum, v) => sum + (v.salary_high ? (v.salary_low + v.salary_high) / 2 : estimateSalary(v.job_title)), 0);
  const permOnCost = permCost * 1.3;
  const avgDayRate = contract.length ? contract.reduce((s, v) => s + (v.contract_rate_high ? (v.contract_rate_low + v.contract_rate_high) / 2 : estimateDayRate(v.job_title)), 0) / contract.length : 800;
  const contractorSpend = contract.length * avgDayRate * 180;
  const consultingSpend = gapCount * avgDayRate * 180;
  const total = permOnCost + contractorSpend + consultingSpend;
  return {
    advertised,
    estimated_market: active.map((v) => ({ role: v.job_title, low: Math.round(estimateSalary(v.job_title) * 0.9), high: Math.round(estimateSalary(v.job_title) * 1.1), currency: "GBP" })),
    likely_roles: unique(active.map((v) => v.job_title)),
    estimated_fte: estFte,
    permanent_staff_cost: band(permOnCost),
    contractor_requirement: contract.length,
    consulting_requirement: gapCount,
    estimated_contractor_spend: band(contractorSpend),
    estimated_consulting_spend: band(consultingSpend),
    estimated_total_resourcing: band(total),
    note: "Estimated market compensation uses configurable assumptions — not factual rates unless advertised.",
  };
}

function buildDeliveryModel(vacs: any[], active: any[], contractCount: number, permCount: number, talentGap: any) {
  let hypothesis = "UNKNOWN";
  const evidence: string[] = [];
  if (permCount > contractCount && permCount >= 3) { hypothesis = "BUILDING INTERNAL TEAM"; evidence.push(`${permCount} permanent ERP roles`); }
  else if (contractCount > permCount && contractCount >= 3) { hypothesis = "USING CONTRACTORS"; evidence.push(`${contractCount} contract ERP roles`); }
  else if (contractCount >= 2 && permCount >= 2) { hypothesis = "HYBRID INTERNAL + EXTERNAL"; evidence.push(`${permCount} permanent and ${contractCount} contract roles`); }
  if (talentGap.potential_gaps.length >= 3) evidence.push(`${talentGap.potential_gaps.length} potential external skill gaps`);
  const internalTeam = Math.max(permCount, 4);
  const additionalCap = Math.max(contractCount + talentGap.potential_gaps.length, 5);
  const extReq = talentGap.potential_gaps.length >= 3 || contractCount >= 4 ? "HIGH" : talentGap.potential_gaps.length >= 1 ? "MEDIUM" : "LOW";
  return { hypothesis, evidence, internal_team_size: `${internalTeam}-${internalTeam + 6}`, additional_capacity: `${additionalCap}-${additionalCap + 10}`, external_requirement: extReq };
}

function buildConsultingEconomics(complexity: number, stage: string) {
  const factor = Math.max(0.6, complexity / 100);
  const roles = [
    { role: "Programme Director", people: 1, day_rate: 1200, days: Math.round(200 * factor) },
    { role: "Solution Architects", people: 2, day_rate: 1000, days: Math.round(180 * factor) },
    { role: "Functional Consultants", people: Math.round(4 + 2 * factor), day_rate: 800, days: Math.round(160 * factor) },
    { role: "Technical Consultants", people: Math.round(3 + 2 * factor), day_rate: 850, days: Math.round(160 * factor) },
    { role: "Data Specialists", people: Math.round(3 + 2 * factor), day_rate: 750, days: Math.round(140 * factor) },
    { role: "Test Specialists", people: Math.round(4 + 2 * factor), day_rate: 650, days: Math.round(120 * factor) },
    { role: "Change Specialists", people: Math.round(2 + factor), day_rate: 700, days: Math.round(140 * factor) },
  ];
  const rolesCosted = roles.map((r) => ({ ...r, cost: r.people * r.day_rate * r.days }));
  const totalPeople = rolesCosted.reduce((s, r) => s + r.people, 0);
  const totalDays = rolesCosted.reduce((s, r) => s + r.people * r.days, 0);
  const totalCost = rolesCosted.reduce((s, r) => s + r.cost, 0);
  return { roles: rolesCosted, estimated_people: totalPeople, estimated_days: totalDays, blended_day_rate: totalDays ? Math.round(totalCost / totalDays) : 0, estimated_consulting_cost: band(totalCost), note: "Configurable assumptions — not factual market rates unless supported by advertised evidence." };
}

function buildEffortDisplacement(commercialModel: any, complexity: number) {
  const factor = Math.max(0.5, complexity / 100);
  const compressMap: Record<string, number> = {};
  if (commercialModel?.ai_compressibility?.workstreams) {
    for (const w of commercialModel.ai_compressibility.workstreams) compressMap[w.name] = w.compressibility;
  }
  const workstreams = DEFAULT_WS.map((ws) => {
    const comp = compressMap[ws.name] ?? ws.compressibility;
    const traditional = Math.round(ws.traditional_base * factor);
    const ai = Math.round(traditional * (1 - comp / 100));
    return { name: ws.name, traditional_days: traditional, ai_days: ai, reduction_days: traditional - ai };
  });
  const tradTotal = workstreams.reduce((s, w) => s + w.traditional_days, 0);
  const aiTotal = workstreams.reduce((s, w) => s + w.ai_days, 0);
  const avoided = tradTotal - aiTotal;
  return { workstreams, traditional_total_days: tradTotal, ai_total_days: aiTotal, days_avoided: avoided, cost_avoided: band(avoided * 800), note: "AI reduces consultant effort on compressible workstreams — senior consulting judgement remains required." };
}

function buildHistoricalTrend(vacs: any[]) {
  const byYear: Record<string, any> = {};
  for (const v of vacs) {
    const y = (v.date_posted || "").slice(0, 4);
    if (!y) continue;
    if (!byYear[y]) byYear[y] = { year: y, count: 0, tech: {} as Record<string, number>, contract: 0, total: 0, senior: 0 };
    byYear[y].count++;
    byYear[y].total++;
    if ((v.employment_type || "").toLowerCase().includes("contract")) byYear[y].contract++;
    if (v._senior) byYear[y].senior++;
    const tech = v.erp_product || v.erp_vendor;
    if (tech) byYear[y].tech[tech] = (byYear[y].tech[tech] || 0) + 1;
  }
  const years = Object.values(byYear).sort((a, b) => a.year.localeCompare(b.year));
  for (const y of years) {
    y.technologies = Object.entries(y.tech).sort((a: any, b: any) => b[1] - a[1]).map(([t]: any) => t);
    y.contractor_pct = y.total ? Math.round((y.contract / y.total) * 100) : 0;
    y.senior_pct = y.total ? Math.round((y.senior / y.total) * 100) : 0;
    delete y.tech; delete y.contract; delete y.total; delete y.senior;
  }
  let growthPct = 0;
  if (years.length >= 2) {
    const last = years[years.length - 1].count;
    const prev = years[years.length - 2].count;
    growthPct = prev ? Math.round(((last - prev) / prev) * 100) : 0;
  }
  const techChanges: string[] = [];
  for (let i = 1; i < years.length; i++) {
    for (const t of years[i].technologies) if (!years[i - 1].technologies.includes(t)) techChanges.push(`${t} appears in ${years[i].year}`);
  }
  return {
    years,
    growth_pct: growthPct,
    technology_changes: techChanges,
    seniority_changes: [],
    contractor_demand_changes: [],
    transformation_language_changes: [],
    interpretation: growthPct > 100 ? `ERP hiring grew ${growthPct}% year-on-year — strong evidence of transformation mobilisation.` : growthPct > 0 ? `ERP hiring grew ${growthPct}% year-on-year.` : "Stable ERP hiring trend.",
  };
}

function buildTrigger(trend: any) {
  const triggered = trend.growth_pct > 100;
  const lastYear = trend.years[trend.years.length - 1];
  return {
    triggered,
    label: triggered ? "ERP HIRING SURGE" : "No hiring surge",
    summary: triggered ? `ERP-related recruitment increased ${trend.growth_pct}% over the previous 12 months.` : "No material increase in ERP hiring detected.",
    dominant_skills: triggered ? unique(lastYear?.technologies || []).slice(0, 5) : [],
    interpretation: triggered ? "Strong evidence of active ERP transformation mobilisation." : "Hiring activity does not currently indicate a surge.",
  };
}

export function analyzeHiringIntelligence(vacancies: any[], ctx: any = {}) {
  const classified = (vacancies || []).map((v) => {
    const classification = v.classification || classify(v);
    return { ...v, _classification: classification, _senior: isSenior(v) };
  });
  // Dominant support technology = most common ERP product among active support/admin roles
  const supportTechCounts: Record<string, number> = {};
  for (const v of classified) {
    if (SUPPORT_CLASSES.has(v._classification) && (v.status || "ACTIVE").toUpperCase() === "ACTIVE") {
      const tech = v.erp_product || v.erp_vendor;
      if (tech) supportTechCounts[tech] = (supportTechCounts[tech] || 0) + 1;
    }
  }
  const dominantSupportTech = Object.entries(supportTechCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
  const vacs = classified.map((v) => ({ ...v, _techRole: technologyRole(v, v._classification, dominantSupportTech) }));

  const active = vacs.filter((v) => (v.status || "ACTIVE").toUpperCase() === "ACTIVE");
  const total = vacs.length;
  const classificationCounts: Record<string, number> = {};
  for (const v of vacs) classificationCounts[v._classification] = (classificationCounts[v._classification] || 0) + 1;

  const stageScores: Record<string, number> = {};
  for (const v of vacs) {
    const votes = STAGE_VOTES[v._classification] || {};
    for (const [stage, w] of Object.entries(votes)) stageScores[stage] = (stageScores[stage] || 0) + w;
  }
  let bestStage = "NO TRANSFORMATION DETECTED";
  let bestScore = 0;
  for (const [stage, score] of Object.entries(stageScores)) if (score > bestScore) { bestScore = score; bestStage = stage; }
  const stageConfidence = bestScore >= 8 ? "HIGH" : bestScore >= 4 ? "MEDIUM" : "LOW";

  const techBuckets: Record<string, Record<string, number>> = { CURRENT: {}, TARGET: {}, LEGACY: {}, INTEGRATION: {}, EXPERIENCE: {}, UNCLEAR: {} };
  for (const v of vacs) {
    const tech = v.erp_product || v.erp_vendor;
    if (tech) techBuckets[v._techRole][tech] = (techBuckets[v._techRole][tech] || 0) + 1;
    for (const it of (v.integration_technologies || [])) {
      const ii = (it || "").trim();
      if (ii) techBuckets.INTEGRATION[ii] = (techBuckets.INTEGRATION[ii] || 0) + 1;
    }
  }
  const technology_evidence = {
    current: toTechList(techBuckets.CURRENT),
    target: toTechList(techBuckets.TARGET),
    legacy: toTechList(techBuckets.LEGACY),
    integration: toTechList(techBuckets.INTEGRATION),
  };
  const dominantCurrent = technology_evidence.current[0]?.technology || "";
  const dominantTarget = technology_evidence.target[0]?.technology || dominantCurrent;

  const moduleCounts: Record<string, number> = {};
  for (const v of vacs) for (const m of (v.erp_modules || [])) { const mm = (m || "").trim(); if (mm) moduleCounts[mm] = (moduleCounts[mm] || 0) + 1; }
  const knownModules = Object.entries(moduleCounts).filter(([, c]) => c >= 2).map(([m]) => m);
  const likelyModules = Object.entries(moduleCounts).filter(([, c]) => c === 1).map(([m]) => m);
  const modules = { known: knownModules, likely: likelyModules, confidence: knownModules.length ? "HIGH" : likelyModules.length ? "MEDIUM" : "LOW", evidence: Object.entries(moduleCounts).map(([m, c]) => `${m} (${c})`) };

  const transformationRoles = vacs.filter((v) => TRANSFORMATION_CLASSES.has(v._classification)).length;
  const migrationRoles = vacs.filter((v) => ["MIGRATION", "DATA MIGRATION"].includes(v._classification)).length;
  const contractRoles = vacs.filter((v) => (v.employment_type || "").toLowerCase().includes("contract")).length;
  const permanentRoles = vacs.filter((v) => (v.employment_type || "").toLowerCase().includes("permanent")).length;
  const programmeLeadership = vacs.filter((v) => /director|programme manager|program manager|head of/i.test(v.job_title || "")).length;
  const seniorCount = vacs.filter((v) => v._senior).length;
  const hiringSignalScore = computeHiringSignalScore({ total, transformationRoles, migrationRoles, contractRoles, programmeLeadership, seniorCount, moduleCount: Object.keys(moduleCounts).length });

  const complexity = Number(ctx.migration_complexity) || 50;
  const consultingDemandScore = computeConsultingDemand({ total, transformationRoles, migrationRoles, contractRoles, seniorCount, moduleCount: Object.keys(moduleCounts).length, entities: parseCount(ctx.legal_entities), countries: parseCount(ctx.countries), users: Number(ctx.estimated_users) || 0, complexity, stage: bestStage });

  const stageReqs = STAGE_REQUIREMENTS[bestStage] || [];
  const detectedSkills = unique(vacs.filter((v) => TRANSFORMATION_CLASSES.has(v._classification)).flatMap((v) => [v.erp_product, ...(v.technical_skills || [])].filter(Boolean)));
  const skillsRequired = unique([...detectedSkills, ...stageReqs]);
  const skillsBeingHired = unique(active.flatMap((v) => [v.erp_product, ...(v.technical_skills || [])].filter(Boolean)));
  const internalCapability = unique(vacs.filter((v) => SUPPORT_CLASSES.has(v._classification) || v._classification === "DEVELOPMENT").flatMap((v) => [v.erp_product, ...(v.technical_skills || [])].filter(Boolean)));
  const classCoverage: Record<string, string> = { "integration": "INTEGRATION", "testing": "TESTING", "change management": "CHANGE MANAGEMENT", "data migration": "DATA MIGRATION", "training": "TRAINING", "programme management": "PROGRAMME MANAGEMENT", "solution architecture": "ARCHITECTURE", "finance transformation": "FINANCE TRANSFORMATION" };
  const isCovered = (req: string) => {
    if (skillsBeingHired.includes(req) || internalCapability.includes(req)) return true;
    const reqLower = req.toLowerCase();
    const tc = classCoverage[reqLower];
    if (tc && vacs.some((v) => v._classification === tc)) return true;
    if (vacs.some((v) => (v.technical_skills || []).some((s) => s.toLowerCase().includes(reqLower)) || (v.job_title || "").toLowerCase().includes(reqLower))) return true;
    return false;
  };
  const potentialGaps = skillsRequired.filter((s) => !isCovered(s));
  const talent_gap = { skills_required: skillsRequired, skills_being_hired: skillsBeingHired, likely_internal_capability: internalCapability, potential_gaps: potentialGaps, external_consulting_need: potentialGaps, confidence: potentialGaps.length > 0 ? "MEDIUM" : "HIGH" };

  const resourcing = buildResourcing(vacs, active, talent_gap.external_consulting_need.length);
  const delivery_model = buildDeliveryModel(vacs, active, contractRoles, permanentRoles, talent_gap);
  const consulting_economics = buildConsultingEconomics(complexity, bestStage);
  const effort_displacement = buildEffortDisplacement(ctx.commercial_model, complexity);
  const historical_trend = buildHistoricalTrend(vacs);
  const transformation_trigger = buildTrigger(historical_trend);

  return {
    hiring_signal_score: hiringSignalScore.score,
    hiring_signal_level: hiringSignalScore.level,
    active_vacancies: active.length,
    total_vacancies: total,
    transformation_roles: transformationRoles,
    migration_roles: migrationRoles,
    contract_roles: contractRoles,
    permanent_roles: permanentRoles,
    programme_leadership_roles: programmeLeadership,
    dominant_technology: dominantTarget || dominantCurrent || "—",
    likely_programme_stage: bestStage,
    programme_stage_confidence: stageConfidence,
    programme_stage_reasoning: buildStageReasoning(bestStage, classificationCounts),
    consulting_demand_score: consultingDemandScore.score,
    consulting_demand_level: consultingDemandScore.level,
    consulting_demand_reasons: consultingDemandScore.reasons,
    technology_evidence,
    modules,
    talent_gap,
    resourcing,
    delivery_model,
    consulting_economics,
    effort_displacement,
    historical_trend,
    transformation_trigger,
    classification_counts: classificationCounts,
  };
}