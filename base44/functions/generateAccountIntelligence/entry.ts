import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const ERP_SYSTEMS = [
  "Microsoft Dynamics NAV", "Microsoft Dynamics GP", "Microsoft Dynamics AX",
  "Microsoft Dynamics 365 Business Central", "Microsoft Dynamics 365 Finance & Operations",
  "SAP ECC", "SAP Business One", "SAP S/4HANA", "SAP S/4HANA Cloud",
  "Oracle E-Business Suite", "Oracle Fusion Cloud ERP", "JD Edwards",
  "NetSuite ERP", "NetSuite OneWorld", "Sage 50", "Sage 200", "Sage X3",
  "Infor", "Epicor", "Other / Unknown",
];

const BANDS = "Bands: 0-39 Low, 40-69 Medium, 70-84 High, 85-100 Very High.";
const CONF = "Confidence values: CONFIRMED, HIGHLY LIKELY, INFERRED, UNKNOWN.";
const JSON_INSTR = "Respond with ONLY a single valid JSON object, no markdown, no code fences, no commentary. Be CONCISE: short string values.";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const company = (body.company_name || "").trim();
    if (!company) return Response.json({ error: "company_name is required" }, { status: 400 });

    const ctx = buildContext(body);
    const [coreRes, commercialRes, peopleRes] = await Promise.all([
      callLLM(base44, corePrompt(ctx, body)),
      callLLM(base44, commercialPrompt(ctx, body)),
      callLLM(base44, peoplePrompt(ctx, body)),
    ]);

    const core = safeParse(coreRes) || {};
    const commercial = safeParse(commercialRes) || {};
    const people = safeParse(peopleRes) || {};

    const intel = merge(core, commercial, people, body);
    return Response.json({ intelligence: intel });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function callLLM(base44, prompt: string) {
  const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: prompt + "\n\n" + JSON_INSTR,
    add_context_from_internet: false,
    model: "gemini_3_flash",
  });
  return res;
}

function buildContext(body) {
  return [
    body.company_name ? `Company: ${body.company_name}` : "",
    body.website ? `Website: ${body.website}` : "",
    body.country ? `Country: ${body.country}` : "",
    body.industry ? `Industry: ${body.industry}` : "",
    body.known_erp ? `Known ERP: ${body.known_erp}` : "",
    body.estimated_erp_users ? `Estimated ERP users: ${body.estimated_erp_users}` : "",
    body.employees ? `Employees: ${body.employees}` : "",
    body.revenue ? `Revenue (GBP): ${body.revenue}` : "",
    body.notes ? `Notes: ${body.notes}` : "",
  ].filter(Boolean).join("\n");
}

function corePrompt(ctx, body) {
  return `You are HybridIQ, an AI ERP Transformation Intelligence analyst for Hybrid Solutions AI.
Produce the CORE section of an Account Intelligence report as JSON.

${ctx}

ERP universe: ${ERP_SYSTEMS.join(", ")}. Do not assume Business Central unless evidence supports it. ${CONF} Distinguish FACT/INFERENCE/ESTIMATE/HYPOTHESIS; never present inferences as fact.

Return JSON with EXACTLY these top-level keys:
{
  "company_overview": { "name","logo_url":"","website","industry","headquarters","revenue"(number GBP),"employees"(number),"locations","ownership","description" },
  "scores": {
    "transformation_probability": { "value"(0-100),"level","reasons"(array, top 3),"biggest_unknown","next_action","drivers"(array of {factor,weight,contribution}) },
    "hybrid_fit": { "value"(0-100),"level","reasons"(array),"breakdown"(array of {factor,weight,score,note}) },
    "future_enterprise_fit": { "value"(0-100),"level","reasons"(array),"breakdown"(array of {factor,weight,score,note}) },
    "migration_complexity": { "value"(0-100),"level","breakdown"(array of {factor,score,note}),"blockers"(array),"ai_reducible"(array),"human_critical"(array) }
  },
  "erp_estate": { for each of these fields an object {value,confidence,evidence_count,source_status}: current_erp_vendor,current_erp_product,current_version,erp_confidence_score,year_implemented,last_major_upgrade,estimated_erp_age,deployment_type,cloud_status,estimated_users,countries,legal_entities,sites_warehouses,known_modules,known_customisations,known_integrations,implementation_partner,support_partner,contract_renewal_signals },
  "erp_history": [ {date,erp,event_type,description,confidence,evidence,source_url,source_type} ] (chronological),
  "signals": [ {signal,category,date,strength,source,confidence,why_it_matters,impact_on_probability} ] (4-6 signals; category in Executive Changes/M&A/ERP / Technology/Digital Transformation/Operational/Financial),
  "target_erp": { current_erp,next_erp,migration_type,probability,why },
  "attack_plan": { account_priority,transformation_hypothesis,erp_hypothesis,why_now,primary_persona,secondary_persona,economic_buyer,champion,primary_pain,commercial_hypothesis,primary_objection,entry_point,discovery_goal,meddpicc_gaps(array),next_action }
}

Transformation probability weighting: ERP Age 15%, Legacy ERP Evidence 15%, ERP Recruitment 15%, Finance Transformation 10%, M&A 10%, Executive Change 10%, International Expansion 5%, Cloud Strategy 5%, Business Growth 5%, Support/Maintenance Complexity 5%, Other Strategic Triggers 5%.
Hybrid fit factors: source ERP suitability, company size, ERP user count, complexity, Microsoft ecosystem, migration urgency, BC suitability, industry fit, geo fit, evidence confidence.
Future enterprise fit factors: transformation likelihood, implementation spend, complexity, urgency, AI-compressible workload, enterprise scale, integration complexity, data migration complexity, testing, consulting effort.
Migration complexity factors: ERP age, customisation, integrations, data volume, entities, countries, users, modules, regulatory, process complexity, custom dev, data quality, change management, testing, migration type. ${BANDS}`;
}

function commercialPrompt(ctx, body) {
  return `You are HybridIQ's commercial modelling analyst for Hybrid Solutions AI.
Produce the COMMERCIAL section of an Account Intelligence report as JSON. All figures in GBP. These are illustrative pre-discovery estimates, NOT quotations. Refer to Hybrid's reduction as "up to 70%", never guaranteed.

${ctx}

Return JSON with EXACTLY this top-level key:
{
  "commercial_model": {
    "assumptions": { employees(number),erp_users(number),countries(number),entities(number),sites(number),modules(number),integrations(number),customisations(number),erp_age(number),migration_type,target_erp,team_size(number) },
    "traditional": { cost_low,cost_expected,cost_high,duration_low,duration_expected,duration_high } (GBP cost; months duration for a conventional consultancy implementation),
    "ai_scenarios": [ {name,reduction_pct,cost,saving,pct_saving,timeline,months_saved,pct_faster,confidence,assumptions(array)} ] (three: Conservative ~30%, Expected ~50%, Maximum up to 70%; adjust reduction by AI-compressibility),
    "workstreams": [ {name,traditional_cost,traditional_duration,ai_compressibility,ai_cost,ai_duration,saving} ] (14 workstreams: Requirements & Documentation, Process Design, Solution Architecture, Configuration, Custom Development, Data Migration, Integrations, Testing, Training, Change Management, Programme Management, Governance, Cutover, Hypercare; keep change management/governance low compressibility),
    "cost_of_delay": { value_per_month,months_accelerated,accelerated_business_value,direct_implementation_saving,total_economic_impact }
  }
}`;
}

function peoplePrompt(ctx, body) {
  return `You are HybridIQ's GTM analyst for Hybrid Solutions AI.
Produce the PEOPLE & DISCOVERY section of an Account Intelligence report as JSON. ${CONF}

${ctx}

Return JSON with EXACTLY these top-level keys:
{
  "buying_committee": [ {role,influence(High/Medium/Low),priority,pain,cares_about,objection,value_hypothesis,discovery_angle} ] (8-12 personas: CFO,CIO,CTO,COO,Finance Director,Transformation Director,IT Director,ERP Programme Director,Business Systems Manager,Procurement,Security,Operations),
  "meddpicc": { metrics,economic_buyer,decision_criteria,decision_process,paper_process,pain,champion,competition } each {known,hypothesised,unknown,evidence,confidence,discovery_question},
  "discovery_questions": [ {category,question} ] (8-12; categories: Business pain, ERP estate, Technical complexity, Financial impact, Transformation timetable, Decision process, Competition, Implementation concerns, Data migration, Integrations, Executive priorities),
  "evidence": [ {finding,erp,date,source_type,source_name,source_url,extract,confidence,status,supported_fields} ] (6-8 supporting findings; source_type in Annual Report, Investor Presentation, Job Advertisement, ERP Vendor Case Study, Implementation Partner Case Study, Procurement Notice, News Article, Company Website, LinkedIn / Executive Announcement, Technical Documentation, Other)
}`;
}

function merge(core, commercial, people, body) {
  const s = core.scores || {};
  return {
    company_overview: core.company_overview || { name: body.company_name, industry: body.industry, headquarters: body.country },
    scores: {
      transformation_probability: withValue(s.transformation_probability, 50),
      hybrid_fit: withValue(s.hybrid_fit, 50),
      future_enterprise_fit: withValue(s.future_enterprise_fit, 45),
      migration_complexity: withValue(s.migration_complexity, 55),
    },
    erp_estate: core.erp_estate || {},
    erp_history: Array.isArray(core.erp_history) ? core.erp_history : [],
    signals: Array.isArray(core.signals) ? core.signals : [],
    target_erp: core.target_erp || {},
    attack_plan: core.attack_plan || {},
    commercial_model: commercial.commercial_model || { assumptions: {}, traditional: {} },
    buying_committee: Array.isArray(people.buying_committee) ? people.buying_committee : [],
    meddpicc: people.meddpicc || {},
    discovery_questions: Array.isArray(people.discovery_questions) ? people.discovery_questions : [],
    evidence: Array.isArray(people.evidence) ? people.evidence : [],
  };
}

function withValue(obj, def) {
  if (obj && typeof obj === "object" && obj.value != null) return obj;
  return { value: def, level: "Medium", reasons: [], ...(obj || {}) };
}

function safeParse(s) {
  if (s && typeof s === "object") return s;
  try {
    let txt = String(s).trim();
    if (txt.startsWith("```")) txt = txt.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    try { return JSON.parse(txt); } catch {}
    const start = txt.indexOf("{");
    const end = txt.lastIndexOf("}");
    if (start !== -1 && end > start) { try { return JSON.parse(txt.slice(start, end + 1)); } catch {} }
    return null;
  } catch { return null; }
}