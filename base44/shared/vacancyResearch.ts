// Shared ERP vacancy research utilities: search-query generation, source priority,
// deduplication, deterministic technology extraction, compensation classification,
// and LLM-based vacancy inference. Used by the discoverERPJobs backend function.

const ERP_KEYWORDS: Record<string, string[]> = {
  "Microsoft Dynamics NAV": ["dynamics nav", "nav 2018", "nav 2017", "nav 2016", "nav 2015", "c/side"],
  "Microsoft Dynamics 365 Business Central": ["business central", "dynamics 365 business central", "al language", "al development", "bc "],
  "Microsoft Dynamics 365 Finance & Operations": ["dynamics 365 finance", "finance & operations", "f&O", "d365 f&o"],
  "Microsoft Dynamics AX": ["dynamics ax", "ax 2012"],
  "Microsoft Dynamics GP": ["dynamics gp", "great plains"],
  "SAP S/4HANA": ["s/4hana", "s4hana", "sap s/4hana"],
  "SAP S/4HANA Cloud": ["s/4hana cloud", "s4hana cloud"],
  "SAP ECC": ["sap ecc", "sap erp core"],
  "SAP Business One": ["sap business one", "sap b1"],
  "Oracle Fusion Cloud ERP": ["oracle fusion", "oracle cloud erp", "fusion cloud"],
  "Oracle E-Business Suite": ["oracle e-business", "ebs", "oracle apps"],
  "NetSuite ERP": ["netsuite"],
  "Sage X3": ["sage x3"],
  "Sage 200": ["sage 200"],
  "Sage 50": ["sage 50"],
  "Infor": ["infor", "infor cloudsuite"],
  "Epicor": ["epicor"],
  "JD Edwards": ["jd edwards", "jde"],
};

const VENDOR_BY_PRODUCT: Record<string, string> = {
  "Microsoft Dynamics NAV": "Microsoft", "Microsoft Dynamics 365 Business Central": "Microsoft",
  "Microsoft Dynamics 365 Finance & Operations": "Microsoft", "Microsoft Dynamics AX": "Microsoft",
  "Microsoft Dynamics GP": "Microsoft", "SAP S/4HANA": "SAP", "SAP S/4HANA Cloud": "SAP",
  "SAP ECC": "SAP", "SAP Business One": "SAP", "Oracle Fusion Cloud ERP": "Oracle",
  "Oracle E-Business Suite": "Oracle", "NetSuite ERP": "Oracle", "Sage X3": "Sage",
  "Sage 200": "Sage", "Sage 50": "Sage", "Infor": "Infor", "Epicor": "Epicor", "JD Edwards": "Oracle",
};

const MODULE_KEYWORDS: Record<string, string[]> = {
  "Finance": ["finance", "general ledger", "gl ", "accounts payable", "accounts receivable", "ap/ar"],
  "Manufacturing": ["manufacturing", "mrp", "production", "mrp ", "shop floor"],
  "Supply Chain": ["supply chain", "warehouse", "wms", "inventory"],
  "Sales": ["sales order", "order management", "crm"],
  "Purchasing": ["purchasing", "procurement", "purchase order"],
  "Warehouse": ["warehouse", "wms", "pick pack ship"],
  "Projects": ["project accounting", "project management", "jobs "],
  "Service Management": ["service management", "field service"],
};

const INTEGRATION_KEYWORDS: Record<string, string[]> = {
  "MES": ["mes ", "manufacturing execution"], "EDI": ["edi "], "Salesforce": ["salesforce"],
  "Power Platform": ["power platform", "power apps", "power automate", "dataverse"],
  "Azure Logic Apps": ["logic apps"], "MuleSoft": ["mulesoft"], "Boomi": ["boomi"],
  "Shopify": ["shopify"], "Coupa": ["coupa"], "Workday": ["workday"],
};

const CLOUD_KEYWORDS: Record<string, string[]> = {
  "Azure": ["azure"], "AWS": ["aws "], "GCP": ["gcp", "google cloud"],
};

// Source priority — lower number = higher quality (1 = company careers page)
const SOURCE_PRIORITY: { match: string[]; quality: number }[] = [
  { match: ["careers", "company careers", "our jobs", "work with us"], quality: 1 },
  { match: ["workday", "successfactors", "greenhouse", "lever", "smartrecruiters", "icims", "taleo", "jobvite"], quality: 2 },
  { match: ["linkedin"], quality: 3 },
  { match: ["indeed", "reed", "totaljobs", "glassdoor", "monster", "stepstone"], quality: 4 },
  { match: ["agency", "recruitment", "hays", "michael page", "robert walters", "la Fosse"], quality: 5 },
  { match: ["archive", "webcache", "cached", "wayback"], quality: 6 },
  { match: ["google", "bing", "search"], quality: 7 },
];

export function classifySource(sourceOrUrl: string): number {
  const t = (sourceOrUrl || "").toLowerCase();
  for (const s of SOURCE_PRIORITY) if (s.match.some((m) => t.includes(m))) return s.quality;
  return 8;
}

export function buildSearchQueries(company: string, knownErp?: string): string[] {
  const c = company || "";
  const erp = knownErp ? [knownErp] : ["SAP", "Oracle Fusion", "NetSuite", "Dynamics 365", "Business Central"];
  const base = [
    ...erp.map((e) => `"${c}" ${e} jobs`),
    `"${c}" ERP transformation`,
    `"${c}" ERP programme`,
    `"${c}" finance systems`,
    `"${c}" data migration`,
    `"${c}" integration architect`,
    `"${c}" cutover manager`,
    `"${c}" ERP contractor`,
    `"${c}" SAP consultant`,
    `"${c}" ERP project manager`,
  ];
  return Array.from(new Set(base));
}

function arr(v: any): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === "string" && v.trim()) return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

function num(v: any): number | undefined {
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}

function parseNum(s: string): number | undefined {
  if (!s) return undefined;
  const cleaned = String(s).replace(/[£,$\s]/g, "").replace(/,/g, "");
  const n = Number(cleaned);
  return isNaN(n) ? undefined : n;
}

function normalizeEmployment(v: string): string {
  const t = (v || "").toLowerCase();
  if (t.includes("contract") || t.includes("contractor")) return "Contract";
  if (t.includes("consultant")) return "Consultant";
  if (t.includes("permanent") || t.includes("full-time") || t.includes("full time")) return "Permanent";
  return "Unknown";
}

function inferVendor(product: string): string {
  return VENDOR_BY_PRODUCT[product] || "";
}

function uniqueArr(a: string[]): string[] {
  return [...new Set(a.filter(Boolean))];
}

export function dedupHash(v: any): string {
  const title = (v.job_title || "").toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  const loc = (v.location || "").toLowerCase().trim();
  const date = (v.date_posted || "").slice(0, 10);
  return `${title}|${loc}|${date}`;
}

export function mapRawVacancy(rv: any, company: string, queries: string[]): any {
  const today = new Date().toISOString().slice(0, 10);
  const posted = (rv.date_posted || rv.posted_date || "").slice(0, 10);
  const status = (rv.status || "ACTIVE").toUpperCase() === "HISTORICAL" ? "HISTORICAL" : "ACTIVE";
  const source = rv.source || "";
  const sourceUrl = rv.source_url || rv.url || "";
  return {
    company: rv.company || company,
    job_title: rv.job_title || rv.title || "",
    location: rv.location || "",
    date_posted: posted || undefined,
    date_first_detected: (rv.date_first_detected || "").slice(0, 10) || posted || today,
    date_last_detected: (rv.date_last_detected || "").slice(0, 10) || today,
    status,
    employment_type: normalizeEmployment(rv.employment_type || rv.type || ""),
    salary_low: num(rv.salary_low), salary_high: num(rv.salary_high),
    contract_rate_low: num(rv.contract_rate_low), contract_rate_high: num(rv.contract_rate_high),
    currency: rv.currency || "GBP",
    advertised_compensation: rv.advertised_compensation || rv.salary || "",
    erp_vendor: rv.erp_vendor || "",
    erp_product: rv.erp_product || "",
    erp_version: rv.erp_version || "",
    erp_modules: arr(rv.erp_modules),
    technical_skills: arr(rv.technical_skills),
    integration_technologies: arr(rv.integration_technologies),
    cloud_technologies: arr(rv.cloud_technologies),
    responsibilities: rv.responsibilities || rv.description || "",
    programme_language: rv.programme_language || "",
    migration_language: rv.migration_language || "",
    transformation_language: rv.transformation_language || "",
    implementation_language: rv.implementation_language || "",
    support_language: rv.support_language || "",
    greenfield_brownfield: rv.greenfield_brownfield || "",
    source,
    source_url: sourceUrl,
    source_quality: rv.source_quality || classifySource(source || sourceUrl),
    raw_text_reference: rv.raw_text_reference || (rv.responsibilities || "").slice(0, 500),
    search_query: rv.search_query || queries[0] || "",
    canonical_url: rv.canonical_url || sourceUrl,
    evidence_confidence: num(rv.evidence_confidence) ?? (status === "HISTORICAL" ? 60 : 80),
    classification: rv.classification || "",
    llm_inferred: false,
  };
}

export function deduplicateVacancies(vacancies: any[]): { unique: any[]; duplicatesRemoved: number } {
  const seen = new Map<string, any>();
  const unique: any[] = [];
  let duplicatesRemoved = 0;
  for (const v of vacancies) {
    if (!v.job_title) continue;
    const hash = dedupHash(v);
    v.dedup_hash = hash;
    if (seen.has(hash)) {
      duplicatesRemoved++;
      const existing = seen.get(hash);
      // Prefer the higher-quality (lower number) source as canonical
      if ((v.source_quality || 8) < (existing.source_quality || 8)) {
        const idx = unique.findIndex((u) => u.dedup_hash === hash);
        if (idx >= 0) unique[idx] = { ...existing, ...v, source: v.source, source_url: v.source_url, source_quality: v.source_quality, canonical_url: v.canonical_url };
        seen.set(hash, unique[idx]);
      }
      continue;
    }
    seen.set(hash, v);
    unique.push(v);
  }
  return { unique, duplicatesRemoved };
}

export function extractTechnologies(v: any): any {
  const text = [v.job_title, v.responsibilities, ...(v.technical_skills || []), ...(v.erp_modules || [])].filter(Boolean).join(" ").toLowerCase();
  const products: string[] = [];
  for (const [product, kws] of Object.entries(ERP_KEYWORDS)) {
    if (kws.some((k) => text.includes(k))) products.push(product);
  }
  const erpProduct = v.erp_product || products[0] || "";
  const erpVendor = v.erp_vendor || inferVendor(erpProduct);
  const modules = uniqueArr([...(v.erp_modules || [])]);
  for (const [mod, kws] of Object.entries(MODULE_KEYWORDS)) if (kws.some((k) => text.includes(k)) && !modules.includes(mod)) modules.push(mod);
  const integrations = uniqueArr([...(v.integration_technologies || [])]);
  for (const [integ, kws] of Object.entries(INTEGRATION_KEYWORDS)) if (kws.some((k) => text.includes(k)) && !integrations.includes(integ)) integrations.push(integ);
  const cloud = uniqueArr([...(v.cloud_technologies || [])]);
  for (const [c, kws] of Object.entries(CLOUD_KEYWORDS)) if (kws.some((k) => text.includes(k)) && !cloud.includes(c)) cloud.push(c);
  return { erp_product: erpProduct, erp_vendor: erpVendor, erp_modules: modules, integration_technologies: integrations, cloud_technologies: cloud };
}

const SALARY_CARD: Record<string, number> = {
  "Programme Director": 130000, "Programme Manager": 110000, "Solution Architect": 105000,
  "Enterprise Architect": 115000, "Functional Consultant": 85000, "Technical Consultant": 90000,
  "Data Migration Lead": 85000, "Data Specialist": 75000, "Integration Specialist": 95000,
  "Test Manager": 80000, "Test Specialist": 65000, "Change Manager": 85000, "Training Lead": 70000,
  "Finance Transformation Lead": 110000, "ERP Developer": 75000, "ERP Support Analyst": 45000,
};
const RATE_CARD: Record<string, number> = {
  "Programme Director": 1200, "Programme Manager": 1000, "Solution Architect": 1000,
  "Enterprise Architect": 1050, "Functional Consultant": 800, "Technical Consultant": 850,
  "Data Migration Lead": 800, "Data Specialist": 750, "Integration Specialist": 900,
  "Test Manager": 700, "Test Specialist": 650, "Change Manager": 700, "Training Lead": 600,
  "Finance Transformation Lead": 950, "ERP Developer": 700, "ERP Support Analyst": 500,
};

function estimateMarketRate(v: any): { low: number; high: number; isDayRate: boolean } {
  const t = (v.job_title || "").toLowerCase();
  let base = 70000;
  for (const [k, val] of Object.entries(SALARY_CARD)) if (t.includes(k.toLowerCase())) { base = val; break; }
  const isContract = (v.employment_type || "").toLowerCase().includes("contract");
  if (isContract) {
    let dayRate = 800;
    for (const [k, val] of Object.entries(RATE_CARD)) if (t.includes(k.toLowerCase())) { dayRate = val; break; }
    return { low: Math.round(dayRate * 0.9), high: Math.round(dayRate * 1.1), isDayRate: true };
  }
  return { low: Math.round(base * 0.9), high: Math.round(base * 1.1), isDayRate: false };
}

export function classifyCompensation(v: any): any {
  const adv = (v.advertised_compensation || "").trim();
  if (adv) {
    const dayMatch = adv.match(/£?\s*([\d,.]+)\s*[–-]\s*£?\s*([\d,.]+)\s*\/\s*day/i);
    const salaryMatch = adv.match(/£?\s*([\d,.]+k?)\s*[–-]\s*£?\s*([\d,.]+k?)/i);
    if (dayMatch) {
      const low = parseNum(dayMatch[1]), high = parseNum(dayMatch[2]);
      return { compensation_type: "ADVERTISED", contract_rate_low: low, contract_rate_high: high, market_rate_low: low, market_rate_high: high, market_rate_confidence: "HIGH", assumption_source: "ADVERTISED" };
    }
    if (salaryMatch) {
      const low = parseNum(salaryMatch[1].replace(/k$/i, "000")), high = parseNum(salaryMatch[2].replace(/k$/i, "000"));
      return { compensation_type: "ADVERTISED", salary_low: low, salary_high: high, market_rate_low: low, market_rate_high: high, market_rate_confidence: "HIGH", assumption_source: "ADVERTISED" };
    }
    return { compensation_type: "ADVERTISED", market_rate_confidence: "MEDIUM", assumption_source: "ADVERTISED" };
  }
  const est = estimateMarketRate(v);
  return {
    compensation_type: "ESTIMATED",
    market_rate_low: est.low, market_rate_high: est.high,
    market_rate_confidence: "LOW",
    assumption_source: "ESTIMATED MARKET RANGE (rate card assumption — not advertised)",
  };
}

export function buildVacancyDiscoveryPrompt(company: string, body: any, queries: string[]): string {
  return `You are HybridIQ's ERP Job Discovery engine. Search the web for CURRENT and HISTORICAL ERP-related job vacancies at "${company}"${body.country ? ` in ${body.country}` : ""}${body.known_erp ? ` (known ERP hint: ${body.known_erp})` : ""}.

Use these search queries as a guide:
${queries.map((q) => `- ${q}`).join("\n")}

Find real job vacancies (current and recently closed) that reference ERP systems, ERP transformation, migration, integration, data migration, testing, change management, or ERP support. For each vacancy return: job_title, location, date_posted (YYYY-MM-DD), employment_type (Permanent/Contract), erp_vendor, erp_product, erp_modules (array), technical_skills (array), integration_technologies (array), cloud_technologies (array), responsibilities (short summary), advertised_compensation (only if explicitly stated in the advert — otherwise empty string), source (site name), source_url, status (ACTIVE for currently open, HISTORICAL for closed/archived).

Rules:
- Only include real vacancies you find evidence of. Do NOT fabricate vacancies.
- Do NOT invent advertised compensation — leave advertised_compensation empty if not stated.
- Mark closed/archived vacancies as HISTORICAL with their original posted date.
- Prefer the company careers page as the source where identifiable.

Return JSON with a single "vacancies" array. Respond with ONLY valid JSON.`;
}

export async function inferVacanciesViaLLM(base44: any, vacancies: { index: number; job_title: string; responsibilities?: string; technical_skills?: string[] }[]): Promise<Record<number, any>> {
  const prompt = `You are HybridIQ's ERP Vacancy Inference Engine. For each job vacancy below, classify the ERP technology context. A job advert is a SIGNAL, not proof — "experience required" means EXPERIENCE, not the company's current system.

Vacancies (classify each by its index):
${JSON.stringify(vacancies)}

Return JSON with a "results" array, one object per vacancy in order, each with: index, erp_vendor, erp_product, technology_role (one of CURRENT/TARGET/LEGACY/INTEGRATION/EXPERIENCE/UNKNOWN), current_target_legacy, programme_stage_signal, role_classification, module_signals (array), integration_signals (array), transformation_signal, confidence (0-100), reasoning_summary, evidence_excerpt_reference. Respond with ONLY valid JSON.`;
  const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: false,
    model: "gemini_3_flash",
    response_json_schema: {
      type: "object",
      properties: {
        results: {
          type: "array",
          items: {
            type: "object",
            properties: {
              index: { type: "number" },
              erp_vendor: { type: "string" },
              erp_product: { type: "string" },
              technology_role: { type: "string" },
              current_target_legacy: { type: "string" },
              programme_stage_signal: { type: "string" },
              role_classification: { type: "string" },
              module_signals: { type: "array", items: { type: "string" } },
              integration_signals: { type: "array", items: { type: "string" } },
              transformation_signal: { type: "string" },
              confidence: { type: "number" },
              reasoning_summary: { type: "string" },
              evidence_excerpt_reference: { type: "string" },
            },
          },
        },
      },
    },
  });
  const results = (res && Array.isArray(res.results)) ? res.results : [];
  const map: Record<number, any> = {};
  for (const r of results) if (r && r.index != null) map[r.index] = r;
  return map;
}