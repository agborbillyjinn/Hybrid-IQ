// Realistic mock research payload for a fictional UK mid-market manufacturer.
// Sent through the SAME normalizer as external n8n/API workflows — not mock-only UI logic.

export function buildMockPayload(companyName, analysisId) {
  const company = companyName || "Northstar Manufacturing Ltd";
  return {
    analysis_id: analysisId,
    source_provider: "mock",
    retrieved_at: new Date().toISOString(),
    source_url: "mock://northstar-manufacturing",
    confidence: "HIGHLY LIKELY",
    evidence_type: "mock_research",
    research_sources: ["Mock Companies House", "Mock Job Board", "Mock Tech Intelligence", "Mock Procurement Portal", "Mock News API"],

    company_profile: {
      name: company,
      logo_url: "",
      website: "https://www.northstar-mfg.co.uk",
      industry: "Industrial Manufacturing",
      headquarters: "Sheffield, United Kingdom",
      revenue: 180000000,
      employees: 850,
      locations: "Sheffield (HQ), Birmingham, Glasgow",
      ownership: "Private Limited (PE-backed — Midbridge Capital, 2022)",
      description: "Mid-market industrial manufacturer of precision-engineered components for aerospace, defence and automotive OEMs.",
    },

    financial_profile: {
      revenue: 180000000, currency: "GBP", revenue_trend: "+8% YoY", ebitda_margin: "14.2%", growth_pct: 8, fiscal_year_end: "March",
    },

    current_erp: {
      vendor: "Microsoft", product: "Dynamics NAV", version: "NAV 2018",
      confidence: 92, confidence_label: "HIGH",
      why: "Multiple corroborating sources confirm Dynamics NAV 2018 as the current ERP, including a vendor case study, current job adverts referencing NAV/C/Side, and the company technology page.",
      supporting_evidence: [
        "Company technology page lists 'Microsoft Dynamics NAV' as ERP system",
        "Microsoft partner case study references Northstar NAV 2018 deployment",
        "Current job vacancy for 'NAV Developer — C/Side & AL'",
      ],
    },

    likely_target_erp: {
      product: "Dynamics 365 Business Central",
      next_erp: "Dynamics 365 Business Central",
      probability: 88,
      migration_type: "NAV → Business Central",
      why: "Natural upgrade path from NAV 2018 (mainstream support ending April 2023), existing Microsoft 365 ecosystem, mid-market employee count ideal for Business Central.",
      supporting_evidence: [
        "NAV 2018 mainstream support ending — forced upgrade trigger",
        "Existing Microsoft 365 / Azure tenant reduces migration friction",
        "850 employees fits Business Central upper-mid-market sweet spot",
      ],
    },

    erp_inference: {
      previous_erp: { vendor: "Microsoft", product: "Dynamics NAV", version: "NAV 2013", why: "Upgrade history visible in archived job adverts referencing NAV 2013 C/Side." },
      historical_timeline: [
        { date: "2013-06", erp: "Dynamics NAV 2013", event: "Initial NAV implementation", confidence: 80, confidence_label: "HIGH", evidence_refs: ["Archived job advert: 'NAV 2013 implementation project'"] },
        { date: "2018-09", erp: "Dynamics NAV 2018", event: "Upgrade from NAV 2013 to NAV 2018", confidence: 92, confidence_label: "HIGH", evidence_refs: ["Microsoft partner case study", "Company technology page"] },
        { date: "2024-03", erp: "Dynamics NAV 2018", event: "Mainstream support expiry approaching — migration evaluation underway", confidence: 75, confidence_label: "HIGH", evidence_refs: ["Job vacancy for 'ERP Transformation Lead'"] },
      ],
      erp_age_estimate: { years: 8, basis: "NAV 2018 implemented Sept 2018", confidence: 90 },
      deployment_model: { value: "On-Premise", confidence: 85, why: "Job adverts reference on-premise NAV server administration and C/Side development." },
      known_modules: [
        { module: "Manufacturing (Production Orders)", confidence: 85, evidence_ref: "Job advert: 'NAV Manufacturing module support'" },
        { module: "Warehouse Management (WMS)", confidence: 80, evidence_ref: "Job advert: 'NAV WMS configuration'" },
        { module: "Sales & Receivables", confidence: 90, evidence_ref: "Standard NAV module" },
        { module: "Purchase & Payables", confidence: 90, evidence_ref: "Standard NAV module" },
        { module: "Jobs & Resources", confidence: 70, evidence_ref: "Job advert references 'NAV Jobs module'" },
      ],
      known_integrations: [
        { integration: "Shop floor MES system (custom API)", confidence: 75, evidence_ref: "Job advert: 'NAV-to-MES integration maintenance'" },
        { integration: "Salesforce CRM (middleware)", confidence: 70, evidence_ref: "Job advert: 'NAV Salesforce integration'" },
        { integration: "EDI (AS2) for automotive OEMs", confidence: 80, evidence_ref: "Procurement notice: 'EDI VAN provider for NAV'" },
        { integration: "Bank reconciliation (Barclays)", confidence: 65, evidence_ref: "Standard NAV banking integration" },
      ],
      known_customisations: [
        { customisation: "Custom C/Side modifications for aerospace traceability (AS9100)", confidence: 85, evidence_ref: "Job advert: 'C/Side customisation for AS9100 compliance'" },
        { customisation: "Bespoke shop-floor scheduling extension", confidence: 75, evidence_ref: "Job advert: 'NAV scheduling extension support'" },
      ],
      known_erp_partner: { partner: "Tectura (Microsoft Gold Partner)", confidence: 70, evidence_ref: "Case study attribution" },
      possible_migration_path: { from: "Dynamics NAV 2018", to: "Dynamics 365 Business Central", type: "Phased", probability: 85, why: "Phased migration recommended due to manufacturing complexity and customisations." },
      evidence_conflicts: [
        { description: "One source references 'Dynamics 365' generically; others confirm NAV 2018 on-premise.", evidence_a: "Job advert: 'Dynamics 365 experience desirable'", evidence_b: "Technology page: 'Dynamics NAV'", resolution: "NAV 2018 is current; D365 reference is aspirational job requirement, not deployed system.", confidence: 85 },
      ],
      unanswered_questions: ["Exact volume of C/Side custom code to be rewritten in AL", "Current licensing model and renewal date", "Whether cloud migration or on-premise BC is preferred"],
      recommended_research: ["Request NAV licence renewal date from IT Director", "Confirm C/Side customisation inventory", "Validate cloud readiness with IT team"],
    },

    erp_estate: {
      current_erp_vendor: { value: "Microsoft", confidence: 92, evidence_count: 4, source_status: "CORROBORATED" },
      current_erp_product: { value: "Dynamics NAV 2018", confidence: 92, evidence_count: 4, source_status: "CORROBORATED" },
      current_version: { value: "NAV 2018", confidence: 90, evidence_count: 3, source_status: "CONFIRMED" },
      erp_confidence_score: { value: 92, confidence: 92, evidence_count: 4, source_status: "HIGH" },
      year_implemented: { value: "2018", confidence: 85, evidence_count: 2, source_status: "INFERRED" },
      last_major_upgrade: { value: "Sept 2018 (NAV 2013 → NAV 2018)", confidence: 80, evidence_count: 2, source_status: "INFERRED" },
      estimated_erp_age: { value: "8 years", confidence: 90, evidence_count: 2, source_status: "INFERRED" },
      deployment_type: { value: "On-Premise", confidence: 85, evidence_count: 3, source_status: "INFERRED" },
      cloud_status: { value: "Not migrated — on-premise", confidence: 80, evidence_count: 2, source_status: "INFERRED" },
      estimated_users: { value: 320, confidence: 70, evidence_count: 1, source_status: "ESTIMATE" },
      countries: { value: "1 (UK)", confidence: 90, evidence_count: 3, source_status: "CONFIRMED" },
      legal_entities: { value: "4 (Northstar Ltd, Northstar Aerospace, Northstar Glasgow, NS Properties)", confidence: 75, evidence_count: 1, source_status: "INFERRED" },
      sites_warehouses: { value: "3 sites, 2 warehouses", confidence: 80, evidence_count: 2, source_status: "INFERRED" },
      known_modules: { value: "Manufacturing, WMS, Sales, Purchasing, Jobs", confidence: 85, evidence_count: 3, source_status: "INFERRED" },
      known_customisations: { value: "AS9100 traceability (C/Side), shop-floor scheduling", confidence: 80, evidence_count: 2, source_status: "INFERRED" },
      known_integrations: { value: "MES, Salesforce, EDI, Barclays", confidence: 75, evidence_count: 3, source_status: "INFERRED" },
      implementation_partner: { value: "Tectura", confidence: 70, evidence_count: 1, source_status: "INFERRED" },
      support_partner: { value: "Tectura (support contract)", confidence: 65, evidence_count: 1, source_status: "INFERRED" },
      contract_renewal_signals: { value: "NAV 2018 mainstream support ending April 2023 — renewal trigger", confidence: 90, evidence_count: 2, source_status: "CONFIRMED" },
    },

    erp_history: [
      { date: "2013-06", erp: "Dynamics NAV 2013", event_type: "Implementation", description: "Initial Dynamics NAV 2013 implementation replacing Sage 200.", confidence: "HIGHLY LIKELY", evidence: "Archived job adverts; Sage migration reference", source_url: "mock://archive/job-nav2013", source_type: "Historic Job Vacancy" },
      { date: "2018-09", erp: "Dynamics NAV 2018", event_type: "Upgrade", description: "Upgrade from NAV 2013 to NAV 2018 with Tectura.", confidence: "CONFIRMED", evidence: "Microsoft partner case study", source_url: "mock://tectura/case-study", source_type: "Implementation Partner Case Study" },
      { date: "2022-11", erp: "Dynamics NAV 2018", event_type: "PE Acquisition", description: "Midbridge Capital acquired majority stake; digital transformation mandate.", confidence: "HIGHLY LIKELY", evidence: "Companies House filing; press release", source_url: "mock://companies-house/filing", source_type: "M&A Information" },
      { date: "2024-03", erp: "Dynamics NAV 2018", event_type: "Evaluation", description: "ERP transformation programme initiated; ERP Transformation Lead hired.", confidence: "HIGHLY LIKELY", evidence: "Current job vacancy", source_url: "mock://jobs/erp-transformation-lead", source_type: "Current Job Vacancy" },
    ],

    erp_evidence: [
      { finding: "Company technology page lists Microsoft Dynamics NAV as ERP system", erp_vendor: "Microsoft", erp_product: "Dynamics NAV", erp_version: "NAV 2018", evidence_date: "2024-07-15", date_found: "2024-07-15", source_type: "Company Technology Page", source_name: "northstar-mfg.co.uk/technology", source_url: "mock://northstar/technology", evidence_summary: "Technology page references 'Microsoft Dynamics NAV' as the ERP platform.", evidence_extract: "“Our ERP system, Microsoft Dynamics NAV, manages operations across all sites.”", evidence_strength: "PRIMARY", confidence_score: 95, current_or_historical: "CURRENT", last_verified: "2024-07-15", supported_fields: "current_erp_vendor,current_erp_product" },
      { finding: "Microsoft partner case study confirms NAV 2018 deployment", erp_vendor: "Microsoft", erp_product: "Dynamics NAV", erp_version: "NAV 2018", evidence_date: "2019-02-10", date_found: "2024-07-15", source_type: "ERP Vendor Case Study", source_name: "Tectura Case Study", source_url: "mock://tectura/case-study", evidence_summary: "Tectura published a case study on Northstar's NAV 2018 upgrade.", evidence_extract: "“Northstar Manufacturing upgraded to Dynamics NAV 2018 to modernise shop-floor operations.”", evidence_strength: "STRONG", confidence_score: 90, current_or_historical: "CURRENT", last_verified: "2024-07-15", supported_fields: "current_erp_product,year_implemented,implementation_partner" },
      { finding: "Current job vacancy for NAV Developer references C/Side and AL", erp_vendor: "Microsoft", erp_product: "Dynamics NAV", erp_version: "NAV 2018", evidence_date: "2024-08-01", date_found: "2024-08-01", source_type: "Current Job Vacancy", source_name: "Northstar Careers — NAV Developer", source_url: "mock://jobs/nav-developer", evidence_summary: "Job advert seeks NAV developer with C/Side and AL experience, confirming active NAV estate.", evidence_extract: "“NAV Developer — maintain and extend our Dynamics NAV 2018 system, C/Side and AL.”", evidence_strength: "STRONG", confidence_score: 85, current_or_historical: "CURRENT", last_verified: "2024-08-01", supported_fields: "current_erp_product,deployment_type" },
      { finding: "Job vacancy for ERP Transformation Lead", erp_vendor: "Microsoft", erp_product: "Dynamics 365 Business Central", erp_version: "", evidence_date: "2024-03-20", date_found: "2024-08-01", source_type: "Current Job Vacancy", source_name: "Northstar Careers — ERP Transformation Lead", source_url: "mock://jobs/erp-transformation-lead", evidence_summary: "ERP Transformation Lead role references 'Dynamics 365 Business Central migration'.", evidence_extract: "“Lead our migration from Dynamics NAV to Dynamics 365 Business Central.”", evidence_strength: "STRONG", confidence_score: 88, current_or_historical: "CURRENT", last_verified: "2024-08-01", supported_fields: "likely_target_erp,migration_type" },
      { finding: "Archived job advert references NAV 2013 implementation", erp_vendor: "Microsoft", erp_product: "Dynamics NAV", erp_version: "NAV 2013", evidence_date: "2013-06-10", date_found: "2024-07-20", source_type: "Historic Job Vacancy", source_name: "Archived — NAV 2013 Project", source_url: "mock://archive/job-nav2013", evidence_summary: "2013 job advert for NAV 2013 implementation project manager.", evidence_extract: "“Project Manager required for Dynamics NAV 2013 roll-out.”", evidence_strength: "SUPPORTING", confidence_score: 70, current_or_historical: "HISTORICAL", last_verified: "2024-07-20", supported_fields: "previous_erp,year_implemented" },
      { finding: "Companies House filing shows PE acquisition", erp_vendor: "", erp_product: "", erp_version: "", evidence_date: "2022-11-05", date_found: "2024-07-15", source_type: "M&A Information", source_name: "Companies House", source_url: "mock://companies-house/filing", evidence_summary: "Midbridge Capital acquired majority stake in Northstar Manufacturing.", evidence_extract: "“Midbridge Capital LLP acquired 72% of Northstar Manufacturing Ltd.”", evidence_strength: "PRIMARY", confidence_score: 100, current_or_historical: "CURRENT", last_verified: "2024-07-15", supported_fields: "ownership" },
    ],

    transformation_signals: [
      { signal: "NAV 2018 mainstream support ending April 2023 — forced upgrade trigger", category: "ERP", date: "2024-08-01", strength: "High", source: "Microsoft lifecycle policy", confidence: "CONFIRMED", why_it_matters: "Creates a hard deadline forcing migration decisions within 12 months.", impact_on_probability: 20 },
      { signal: "ERP Transformation Lead hired (March 2024)", category: "ERP", date: "2024-03-20", strength: "High", source: "Job vacancy", confidence: "HIGHLY LIKELY", why_it_matters: "Active programme leadership indicates budget approval and intent.", impact_on_probability: 15 },
      { signal: "PE-backed digital transformation mandate from Midbridge Capital", category: "Financial", date: "2022-11-05", strength: "High", source: "Companies House / press release", confidence: "CONFIRMED", why_it_matters: "PE owners typically drive operational modernisation within 3-year horizon.", impact_on_probability: 12 },
    ],
    executive_changes: [
      { signal: "New CFO appointed (Q4 2023) with prior D365 transformation experience", category: "Executive Changes", date: "2023-10-15", strength: "Medium", source: "LinkedIn executive profile", confidence: "HIGHLY LIKELY", why_it_matters: "CFO with BC transformation track record increases likelihood of D365 selection.", impact_on_probability: 8 },
    ],
    job_signals: [
      { signal: "3 active NAV developer roles — suggests maintaining customisations pre-migration", category: "ERP", date: "2024-08-01", strength: "Medium", source: "Job board", confidence: "HIGHLY LIKELY", why_it_matters: "Indicates current system is live and customised; migration will need rework.", impact_on_probability: 5 },
    ],
    m_and_a_signals: [
      { signal: "Acquired Glasgow subsidiary (2023) — multi-entity consolidation needed", category: "M&A", date: "2023-05-01", strength: "Medium", source: "Press release", confidence: "CONFIRMED", why_it_matters: "Multi-entity consolidation is a classic ERP migration driver.", impact_on_probability: 7 },
    ],
    technology_signals: [
      { signal: "Existing Microsoft 365 and Azure tenant — cloud readiness established", category: "Technology", date: "2024-07-15", strength: "High", source: "Technology page", confidence: "HIGHLY LIKELY", why_it_matters: "Reduces friction for Business Central cloud migration.", impact_on_probability: 10 },
    ],
    integration_signals: [
      { signal: "11 active integrations including MES, Salesforce, EDI — migration scope driver", category: "Technology", date: "2024-08-01", strength: "Medium", source: "Job adverts", confidence: "INFERRED", why_it_matters: "High integration count increases migration complexity and duration.", impact_on_probability: -5 },
    ],

    transformation_probability: { value: 86, level: "High", reasons: ["NAV 2018 support ending — forced upgrade", "ERP Transformation Lead hired", "PE-backed transformation mandate", "New CFO with D365 experience"], biggest_unknown: "Exact budget approval timeline", next_action: "Engage ERP Transformation Lead on migration scope", drivers: [{ factor: "ERP Age", weight: 15, contribution: 14 }, { factor: "Legacy ERP Evidence", weight: 15, contribution: 15 }, { factor: "ERP Recruitment", weight: 15, contribution: 13 }, { factor: "M&A", weight: 10, contribution: 7 }, { factor: "Executive Change", weight: 10, contribution: 8 }] },
    hybrid_fit: { value: 91, level: "Very High", reasons: ["Natural NAV → BC upgrade path", "Existing Microsoft ecosystem", "850 employees fits BC sweet spot", "Manufacturing modules available in BC"], breakdown: [{ factor: "Source ERP suitability", weight: 20, score: 95, note: "NAV → BC is the most direct path" }, { factor: "Company size", weight: 15, score: 90, note: "850 employees ideal for BC" }, { factor: "Microsoft ecosystem", weight: 15, score: 95, note: "M365 + Azure already in place" }] },
    future_enterprise_fit: { value: 76, level: "High", reasons: ["Strong transformation likelihood", "Moderate complexity", "AI-compressible workload present"], breakdown: [{ factor: "Transformation likelihood", weight: 25, score: 86, note: "86% probability" }, { factor: "Complexity", weight: 20, score: 68, note: "Manufacturing + customisations" }] },
    migration_complexity: { value: 68, level: "Medium", breakdown: [{ factor: "Customisations (C/Side → AL)", score: 75, note: "AS9100 traceability + scheduling" }, { factor: "Integrations", score: 70, note: "11 integrations incl. MES, EDI" }, { factor: "Data volume", score: 65, note: "1.2TB, 8 years history" }, { factor: "Legal entities", score: 60, note: "4 entities to consolidate" }, { factor: "Manufacturing complexity", score: 80, note: "Aerospace/defence regulatory" }], blockers: ["AS9100 regulatory validation requirements", "MES integration re-platforming"], ai_reducible: ["Data mapping", "Test generation", "Configuration preparation", "Documentation"], human_critical: ["Cutover governance", "Change management", "Stakeholder alignment", "Architecture decisions"] },

    commercial_assumptions: {
      disclaimer: "Illustrative pre-discovery estimate — validation required.",
      complexity_inputs: { revenue: 180000000, employees: 850, erp_users: 320, countries: 1, legal_entities: 4, locations: 3, warehouses: 2, erp_modules: 9, integrations: 11, customisations: 14, erp_age: 8, current_erp: "Dynamics NAV 2018", target_erp: "Dynamics 365 Business Central", migration_type: "NAV → Business Central", data_volume: "1.2TB", historical_data_requirement: "8 years", regulatory_requirements: "AS9100 (aerospace)", training_population: 320, process_complexity: "High", ma_complexity: "Low", data_quality: "Medium", expected_custom_development: "Moderate" },
      migration_assessment: { from: "Microsoft Dynamics NAV", to: "Dynamics 365 Business Central", migration_type: "NAV → Business Central", complexity_multiplier: 1.0, rationale: "Direct upgrade path with established tooling; moderate customisation debt from C/Side to AL rewrite." },
      traditional: {
        cost: { low: 1200000, expected: 1800000, high: 2600000 },
        duration: { low: 12, expected: 16, high: 22 },
        workstreams: [
          { name: "Discovery", cost_low: 40000, cost_expected: 60000, cost_high: 90000, duration_low: 1, duration_expected: 1, duration_high: 2 },
          { name: "Requirements", cost_low: 60000, cost_expected: 90000, cost_high: 130000, duration_low: 1, duration_expected: 2, duration_high: 3 },
          { name: "Process Design", cost_low: 70000, cost_expected: 110000, cost_high: 160000, duration_low: 1, duration_expected: 2, duration_high: 3 },
          { name: "Architecture", cost_low: 50000, cost_expected: 80000, cost_high: 120000, duration_low: 1, duration_expected: 1, duration_high: 2 },
          { name: "Configuration", cost_low: 90000, cost_expected: 140000, cost_high: 200000, duration_low: 2, duration_expected: 3, duration_high: 4 },
          { name: "Custom Development", cost_low: 150000, cost_expected: 240000, cost_high: 380000, duration_low: 3, duration_expected: 4, duration_high: 6 },
          { name: "Data Migration", cost_low: 110000, cost_expected: 170000, cost_high: 250000, duration_low: 2, duration_expected: 3, duration_high: 4 },
          { name: "Integrations", cost_low: 130000, cost_expected: 200000, cost_high: 300000, duration_low: 2, duration_expected: 3, duration_high: 5 },
          { name: "Testing", cost_low: 90000, cost_expected: 140000, cost_high: 210000, duration_low: 2, duration_expected: 3, duration_high: 4 },
          { name: "Training", cost_low: 60000, cost_expected: 100000, cost_high: 150000, duration_low: 1, duration_expected: 2, duration_high: 3 },
          { name: "Change Management", cost_low: 70000, cost_expected: 110000, cost_high: 170000, duration_low: 2, duration_expected: 3, duration_high: 4 },
          { name: "Programme Management", cost_low: 120000, cost_expected: 190000, cost_high: 280000, duration_low: 4, duration_expected: 6, duration_high: 8 },
          { name: "Governance", cost_low: 50000, cost_expected: 80000, cost_high: 120000, duration_low: 4, duration_expected: 6, duration_high: 8 },
          { name: "Cutover", cost_low: 60000, cost_expected: 90000, cost_high: 140000, duration_low: 1, duration_expected: 1, duration_high: 2 },
          { name: "Hypercare", cost_low: 50000, cost_expected: 80000, cost_high: 120000, duration_low: 1, duration_expected: 2, duration_high: 3 },
        ],
      },
      ai_compressibility: { overall_score: 54, workstreams: [
        { name: "Discovery", compressibility: 35, rationale: "Stakeholder interviews remain human-led" },
        { name: "Requirements", compressibility: 78, rationale: "Documentation generation highly compressible" },
        { name: "Process Design", compressibility: 72, rationale: "Process mapping assistance" },
        { name: "Architecture", compressibility: 25, rationale: "Complex decisions require human judgement" },
        { name: "Configuration", compressibility: 68, rationale: "Configuration preparation automatable" },
        { name: "Custom Development", compressibility: 55, rationale: "AL code generation assistance" },
        { name: "Data Migration", compressibility: 82, rationale: "Mapping and script generation highly compressible" },
        { name: "Integrations", compressibility: 40, rationale: "Architecture decisions human-led" },
        { name: "Testing", compressibility: 80, rationale: "Test generation and regression highly compressible" },
        { name: "Training", compressibility: 20, rationale: "Human-led training delivery" },
        { name: "Change Management", compressibility: 15, rationale: "Stakeholder alignment human-critical" },
        { name: "Programme Management", compressibility: 18, rationale: "Governance and coordination human-led" },
        { name: "Governance", compressibility: 10, rationale: "Executive decisions human-critical" },
        { name: "Cutover", compressibility: 12, rationale: "Critical cutover decisions human-led" },
        { name: "Hypercare", compressibility: 45, rationale: "Issue triage assisted but human-resolved" },
      ] },
      hybrid_scenarios: [
        { name: "CONSERVATIVE", reduction_pct: 28, reduction_range: "20-35%", cost: { low: 864000, expected: 1296000, high: 1872000 }, duration: { low: 9, expected: 12, high: 16 }, saving: 504000, pct_saving: 28, months_saved: 4, pct_faster: 25, timeline_reduction_pct: 25, confidence: "HIGH", rationale: "Conservative AI assistance on documentation, data mapping and testing only." },
        { name: "EXPECTED", reduction_pct: 44, reduction_range: "35-55%", cost: { low: 672000, expected: 1008000, high: 1456000 }, duration: { low: 7, expected: 9, high: 12 }, saving: 792000, pct_saving: 44, months_saved: 7, pct_faster: 44, timeline_reduction_pct: 44, confidence: "MEDIUM", rationale: "AI compresses requirements, data migration, testing and configuration; governance and change management remain human-led." },
        { name: "MAXIMUM", reduction_pct: 62, reduction_range: "55-70%", cost: { low: 456000, expected: 684000, high: 988000 }, duration: { low: 5, expected: 6, high: 9 }, saving: 1116000, pct_saving: 62, months_saved: 10, pct_faster: 62, timeline_reduction_pct: 62, confidence: "LOW", rationale: "Aggressive AI adoption across all compressible workstreams; requires mature delivery team." },
      ],
      explanation: {
        primary_cost_drivers: ["14 C/Side customisations requiring AL rewrite", "11 integrations including MES and EDI", "4 legal entities to consolidate", "8 years of historical data (1.2TB)", "AS9100 aerospace regulatory requirements", "320 users requiring training"],
        ai_saving_opportunities: ["Requirements documentation", "Data mapping and migration scripts", "Test case generation and regression", "Configuration preparation", "AL code generation assistance"],
        unlikely_to_compress: ["Stakeholder change management", "Programme governance", "Integration architecture decisions", "Training delivery", "Critical cutover decisions"],
      },
      cost_of_delay: {
        annual_transformation_benefit: 1200000, annual_operating_cost_saving: 350000, expected_revenue_uplift: 500000, monthly_manual_process_cost: 40000, risk_reduction_value: 200000,
        monthly_value_of_transformation: 100000, months_saved: 7, accelerated_benefit: 700000, direct_implementation_saving: 792000, combined_economic_impact: 1492000,
        disclaimer: "Scenario estimate — not guaranteed customer ROI.",
      },
    },

    buying_committee: [
      { role: "CFO", influence: "High", priority: "High", pain: "Manual financial consolidation across 4 entities", cares_about: "Cost, ROI, consolidation", objection: "Disruption to month-end", value_hypothesis: "Faster close, lower run-cost", discovery_angle: "Current month-end close time and consolidation pain" },
      { role: "CIO", influence: "High", priority: "High", pain: "End-of-support NAV estate", cares_about: "Security, supportability, cloud", objection: "Integration re-platforming risk", value_hypothesis: "Supported modern platform, reduced support burden", discovery_angle: "NAV support expiry timeline and risk" },
      { role: "ERP Programme Director", influence: "High", priority: "High", pain: "Customisation debt blocking upgrade", cares_about: "Delivery scope, timeline, risk", objection: "C/Side rewrite effort", value_hypothesis: "AI-assisted migration reduces rewrite effort", discovery_angle: "Customisation inventory and AL readiness" },
      { role: "COO", influence: "High", priority: "Medium", pain: "Shop-floor scheduling inefficiency", cares_about: "Throughput, WMS, MES integration", objection: "Production downtime during cutover", value_hypothesis: "Modern WMS, better scheduling", discovery_angle: "Current shop-floor pain and MES integration" },
      { role: "Finance Director", influence: "Medium", priority: "Medium", pain: "Multi-entity reporting", cares_about: "Consolidation, audit, compliance", objection: "Re-training finance team", value_hypothesis: "Automated consolidation", discovery_angle: "Audit and reporting pain" },
      { role: "IT Director", influence: "Medium", priority: "Medium", pain: "Maintaining on-premise NAV servers", cares_about: "Infrastructure, security, support", objection: "Cloud migration complexity", value_hypothesis: "Cloud-managed, auto-updates", discovery_angle: "Current infrastructure support burden" },
      { role: "Head of Manufacturing", influence: "Medium", priority: "Medium", pain: "AS9100 traceability workarounds", cares_about: "Quality, traceability, compliance", objection: "Validation rework", value_hypothesis: "Built-in traceability", discovery_angle: "AS9100 compliance gaps in current NAV" },
      { role: "Procurement", influence: "Low", priority: "Low", pain: "EDI mapping maintenance", cares_about: "Vendor management, contracts", objection: "Cost", value_hypothesis: "Modern EDI options", discovery_angle: "EDI partner landscape" },
    ],

    meddpicc_hypotheses: {
      metrics: { known: "16-month expected duration; £1.8m expected cost", hypothesised: "£0.8m saving, 7 months faster", unknown: "Exact budget ceiling", evidence: "Commercial model", confidence: "HIGHLY LIKELY", discovery_question: "What budget has been approved for the ERP transformation?" },
      economic_buyer: { known: "CFO (new, D365 experience)", hypothesised: "CFO + COO joint decision", unknown: "PE board involvement", evidence: "Executive changes", confidence: "HIGHLY LIKELY", discovery_question: "Who signs off the ERP investment decision?" },
      decision_criteria: { known: "Cloud, Microsoft ecosystem, manufacturing fit", hypothesised: "Cost, timeline, support", unknown: "Weighting", evidence: "Inferred from ecosystem", confidence: "INFERRED", discovery_question: "What are the formal selection criteria?" },
      decision_process: { known: "ERP Transformation Lead engaged", hypothesised: "CFO + CIO + board", unknown: "Timeline", evidence: "Job vacancy", confidence: "INFERRED", discovery_question: "What is the evaluation and approval timeline?" },
      paper_process: { known: "", hypothesised: "PE board approval required", unknown: "Signing authority limits", evidence: "", confidence: "UNKNOWN", discovery_question: "What approvals are needed and from whom?" },
      pain: { known: "NAV 2018 support ending; manual consolidation", hypothesised: "Customisation debt; MES integration", unknown: "Quantified pain", evidence: "Multiple signals", confidence: "HIGHLY LIKELY", discovery_question: "What is the cost of not migrating by the support deadline?" },
      champion: { known: "ERP Transformation Lead", hypothesised: "IT Director", unknown: "Internal sponsor strength", evidence: "Job vacancy", confidence: "HIGHLY LIKELY", discovery_question: "Who is driving this internally?" },
      competition: { known: "", hypothesised: "Other Microsoft partners", unknown: "Incumbent SI relationship", evidence: "", confidence: "UNKNOWN", discovery_question: "Which implementation partners are being evaluated?" },
    },

    discovery_questions: [
      { category: "Business pain", question: "What happens to operations if NAV 2018 is not upgraded before support ends?" },
      { category: "ERP estate", question: "Can you share the inventory of C/Side customisations and their business criticality?" },
      { category: "Technical complexity", question: "How is the MES system integrated today and what is the migration plan?" },
      { category: "Financial impact", question: "What budget has been approved for the ERP transformation programme?" },
      { category: "Transformation timetable", question: "What is the target go-live window and what drives that date?" },
      { category: "Decision process", question: "Who are the decision-makers and what is the approval path to PE board?" },
      { category: "Competition", question: "Which implementation partners are being evaluated?" },
      { category: "Implementation concerns", question: "How will you manage production downtime during cutover?" },
      { category: "Data migration", question: "What is the data archival strategy for the 8 years of historical data?" },
      { category: "Integrations", question: "Which of the 11 integrations are business-critical for go-live?" },
    ],

    attack_plan: {
      account_priority: "Tier 1",
      transformation_hypothesis: "NAV 2018 end-of-support + PE mandate + new CFO = active 12-month migration window",
      erp_hypothesis: "Migrating from Dynamics NAV 2018 to Dynamics 365 Business Central (phased)",
      why_now: "NAV 2018 mainstream support ending; 10 ERP transformation roles opened in the last 12 months (hiring surge); PE transformation mandate",
      primary_persona: "CFO",
      secondary_persona: "CIO",
      economic_buyer: "CFO",
      champion: "ERP Transformation Lead",
      primary_pain: "End-of-support ERP with customisation debt; internal programme team may be struggling to source sufficient BC migration and integration capacity",
      commercial_hypothesis: "£1.8m traditional → £1.0m AI-enabled (44% reduction, £0.8m saving, 7 months faster); AI-assisted delivery could reduce dependence on expensive contractor and consulting capacity",
      primary_objection: "C/Side rewrite effort and MES integration risk",
      entry_point: "ERP Transformation Lead (recently hired)",
      discovery_goal: "Confirm budget, timeline, customisation inventory, decision process and internal vs partner resourcing split",
      meddpicc_gaps: ["Paper process", "Competition", "Exact budget ceiling"],
      next_action: "Outreach to ERP Transformation Lead referencing NAV support expiry and D365 migration",
    },

    outreach: {
      evidence_used: ["NAV 2018 mainstream support ending April 2023", "ERP Transformation Lead hired March 2024", "PE-backed transformation mandate", "New CFO with D365 experience"],
      email: { subject: "Northstar's NAV 2018 support expiry — your migration window", body: "Hi [First Name],\n\nI noticed Northstar recently hired an ERP Transformation Lead — timely, given Dynamics NAV 2018 mainstream support ends April 2023.\n\nWe've helped similar manufacturers migrate from NAV to Business Central, and our AI-assisted approach typically cuts implementation time by ~40% and cost by ~44%. For an estate your size, that's roughly 7 months and £0.8m.\n\nWould a 20-minute call this week make sense to compare notes on your migration scope?\n\nBest,\n[Your Name]\nHybrid Solutions AI" },
      linkedin: "Hi [First Name] — saw you're leading Northstar's ERP transformation. With NAV 2018 support ending soon, we've been helping manufacturers migrate to Business Central with AI-assisted delivery (typically 40% faster). Would value a quick exchange of notes if you're open to it.",
      cold_call: "Hi [First Name], I'm calling about your Dynamics NAV migration — we help manufacturers move to Business Central with an AI-assisted approach that typically saves about 7 months. Is now a good time, or would later today suit better?",
      voicemail: "Hi [First Name], it's [Your Name] from Hybrid Solutions AI. I'm reaching out about Northstar's NAV 2018 migration — we typically cut implementation time by 40%. Give me a call back on [number] when you have a moment. Thanks.",
      follow_up: "Hi [First Name],\n\nFollowing up on my note about Northstar's NAV 2018 migration. With support ending soon, I imagine timing is front of mind.\n\nHappy to share a quick illustration of how our AI-assisted approach compresses the C/Side-to-AL rewrite and data migration. Any interest in a brief call?\n\nBest,\n[Your Name]",
    },
    job_vacancies: buildMockVacancies(),
  };
}

export function buildMockVacancies() {
  const c = "Northstar Manufacturing Ltd";
  return [
    { company: c, job_title: "Dynamics NAV Developer (C/Side)", location: "Sheffield, UK", date_posted: "2023-03-15", date_first_detected: "2023-03-15", date_last_detected: "2023-04-20", status: "HISTORICAL", employment_type: "Permanent", salary_low: 55000, salary_high: 65000, currency: "GBP", advertised_compensation: "£55,000–£65,000", erp_vendor: "Microsoft", erp_product: "Dynamics NAV", erp_version: "NAV 2018", erp_modules: ["Manufacturing", "WMS"], technical_skills: ["C/Side", "AL"], integration_technologies: [], cloud_technologies: [], responsibilities: "Maintain and extend Dynamics NAV 2018 manufacturing and warehouse modules.", support_language: "NAV support", source: "Mock Job Board", source_url: "mock://jobs/nav-dev-2023", evidence_confidence: 80 },
    { company: c, job_title: "NAV Support Analyst", location: "Sheffield, UK", date_posted: "2023-09-10", date_first_detected: "2023-09-10", date_last_detected: "2023-10-15", status: "HISTORICAL", employment_type: "Permanent", salary_low: 40000, salary_high: 48000, currency: "GBP", advertised_compensation: "£40,000–£48,000", erp_vendor: "Microsoft", erp_product: "Dynamics NAV", erp_version: "NAV 2018", erp_modules: ["Sales", "Purchasing"], technical_skills: ["C/Side"], integration_technologies: [], cloud_technologies: [], responsibilities: "2nd/3rd line support for Dynamics NAV estate.", support_language: "NAV support", source: "Mock Job Board", source_url: "mock://jobs/nav-support-2023", evidence_confidence: 80 },
    { company: c, job_title: "Dynamics NAV Developer", location: "Sheffield, UK", date_posted: "2024-02-20", date_first_detected: "2024-02-20", date_last_detected: "2024-03-30", status: "HISTORICAL", employment_type: "Permanent", salary_low: 58000, salary_high: 68000, currency: "GBP", advertised_compensation: "£58,000–£68,000", erp_vendor: "Microsoft", erp_product: "Dynamics NAV", erp_version: "NAV 2018", erp_modules: ["Manufacturing"], technical_skills: ["C/Side", "AL"], integration_technologies: [], cloud_technologies: [], responsibilities: "Develop and maintain NAV customisations for AS9100 traceability.", support_language: "NAV development", source: "Mock Job Board", source_url: "mock://jobs/nav-dev-2024", evidence_confidence: 80 },
    { company: c, job_title: "ERP Project Manager", location: "Sheffield, UK", date_posted: "2024-08-05", date_first_detected: "2024-08-05", date_last_detected: "2024-09-12", status: "HISTORICAL", employment_type: "Permanent", salary_low: 70000, salary_high: 85000, currency: "GBP", advertised_compensation: "£70,000–£85,000", erp_vendor: "Microsoft", erp_product: "Dynamics NAV", erp_modules: [], technical_skills: ["Prince2", "Agile"], integration_technologies: [], cloud_technologies: [], responsibilities: "Manage ERP improvement projects across the NAV estate.", programme_language: "ERP project delivery", source: "Mock Job Board", source_url: "mock://jobs/erp-pm-2024", evidence_confidence: 75 },
    { company: c, job_title: "ERP Transformation Lead", location: "Sheffield, UK", date_posted: "2025-01-12", date_first_detected: "2025-01-12", date_last_detected: "2025-03-01", status: "HISTORICAL", employment_type: "Permanent", salary_low: 95000, salary_high: 115000, currency: "GBP", advertised_compensation: "£95,000–£115,000", erp_vendor: "Microsoft", erp_product: "Dynamics 365 Business Central", erp_modules: ["Finance", "Manufacturing"], technical_skills: ["Business Central", "AL"], integration_technologies: [], cloud_technologies: ["Azure"], responsibilities: "Lead migration from Dynamics NAV 2018 to Dynamics 365 Business Central.", transformation_language: "NAV to Business Central migration", migration_language: "ERP migration programme", source: "Mock Job Board", source_url: "mock://jobs/erp-transformation-lead", evidence_confidence: 88 },
    { company: c, job_title: "Dynamics NAV Developer", location: "Sheffield, UK", date_posted: "2025-05-18", date_first_detected: "2025-05-18", date_last_detected: "2025-07-02", status: "HISTORICAL", employment_type: "Contract", contract_rate_low: 600, contract_rate_high: 700, currency: "GBP", advertised_compensation: "£600–£700/day", erp_vendor: "Microsoft", erp_product: "Dynamics NAV", erp_version: "NAV 2018", erp_modules: ["Manufacturing"], technical_skills: ["C/Side"], integration_technologies: [], cloud_technologies: [], responsibilities: "Contract NAV developer to maintain legacy customisations during migration.", support_language: "NAV development", source: "Mock Job Board", source_url: "mock://jobs/nav-dev-contract-2025", evidence_confidence: 75 },
    { company: c, job_title: "Business Central Functional Consultant", location: "Sheffield, UK", date_posted: "2025-11-03", date_first_detected: "2025-11-03", date_last_detected: "2026-01-10", status: "HISTORICAL", employment_type: "Contract", contract_rate_low: 700, contract_rate_high: 800, currency: "GBP", advertised_compensation: "£700–£800/day", erp_vendor: "Microsoft", erp_product: "Dynamics 365 Business Central", erp_modules: ["Finance", "Manufacturing"], technical_skills: ["Business Central", "AL"], integration_technologies: [], cloud_technologies: ["Azure"], responsibilities: "Configure Business Central finance and manufacturing modules.", implementation_language: "Business Central implementation", source: "Mock Job Board", source_url: "mock://jobs/bc-consultant-2025", evidence_confidence: 82 },
    { company: c, job_title: "BC Solution Architect", location: "Sheffield, UK", date_posted: "2026-01-08", date_first_detected: "2026-01-08", date_last_detected: "2026-02-20", status: "ACTIVE", employment_type: "Contract", contract_rate_low: 800, contract_rate_high: 950, currency: "GBP", advertised_compensation: "£800–£950/day", erp_vendor: "Microsoft", erp_product: "Dynamics 365 Business Central", erp_modules: ["Finance", "Supply Chain", "Manufacturing"], technical_skills: ["Business Central", "AL", "Azure"], integration_technologies: ["Power Platform"], cloud_technologies: ["Azure"], responsibilities: "Architect Business Central solution across 4 legal entities.", transformation_language: "BC solution architecture", source: "Mock Job Board", source_url: "mock://jobs/bc-architect-2026", evidence_confidence: 85 },
    { company: c, job_title: "Data Migration Lead", location: "Sheffield, UK", date_posted: "2026-02-14", date_first_detected: "2026-02-14", date_last_detected: "2026-03-25", status: "ACTIVE", employment_type: "Contract", contract_rate_low: 700, contract_rate_high: 800, currency: "GBP", advertised_compensation: "£700–£800/day", erp_vendor: "Microsoft", erp_product: "Dynamics 365 Business Central", erp_modules: [], technical_skills: ["Data Migration", "SQL", "AL"], integration_technologies: [], cloud_technologies: ["Azure"], responsibilities: "Lead data migration from NAV 2018 to Business Central, 8 years of history.", migration_language: "Data migration from NAV to BC", source: "Mock Job Board", source_url: "mock://jobs/data-migration-lead-2026", evidence_confidence: 85 },
    { company: c, job_title: "Integration Specialist", location: "Sheffield, UK", date_posted: "2026-03-02", date_first_detected: "2026-03-02", date_last_detected: "2026-04-10", status: "ACTIVE", employment_type: "Contract", contract_rate_low: 650, contract_rate_high: 750, currency: "GBP", advertised_compensation: "£650–£750/day", erp_vendor: "Microsoft", erp_product: "Dynamics 365 Business Central", erp_modules: [], technical_skills: ["Power Platform", "Azure Logic Apps"], integration_technologies: ["MES", "EDI", "Salesforce"], cloud_technologies: ["Azure"], responsibilities: "Re-platform MES, EDI and Salesforce integrations to Business Central.", transformation_language: "Integration architecture", source: "Mock Job Board", source_url: "mock://jobs/integration-specialist-2026", evidence_confidence: 82 },
    { company: c, job_title: "Test Manager", location: "Sheffield, UK", date_posted: "2026-04-05", date_first_detected: "2026-04-05", date_last_detected: "2026-05-18", status: "ACTIVE", employment_type: "Contract", contract_rate_low: 600, contract_rate_high: 700, currency: "GBP", advertised_compensation: "£600–£700/day", erp_vendor: "Microsoft", erp_product: "Dynamics 365 Business Central", erp_modules: [], technical_skills: ["Test Automation", "UAT"], integration_technologies: [], cloud_technologies: [], responsibilities: "Manage testing strategy for BC migration including regression and UAT.", transformation_language: "Test strategy", source: "Mock Job Board", source_url: "mock://jobs/test-manager-2026", evidence_confidence: 80 },
    { company: c, job_title: "Change Manager", location: "Sheffield, UK", date_posted: "2026-05-12", date_first_detected: "2026-05-12", date_last_detected: "2026-06-22", status: "ACTIVE", employment_type: "Contract", contract_rate_low: 650, contract_rate_high: 750, currency: "GBP", advertised_compensation: "£650–£750/day", erp_vendor: "Microsoft", erp_product: "Dynamics 365 Business Central", erp_modules: [], technical_skills: ["Change Management", "Stakeholder Engagement"], integration_technologies: [], cloud_technologies: [], responsibilities: "Lead change management and training for 320 users across 3 sites.", transformation_language: "Change management", source: "Mock Job Board", source_url: "mock://jobs/change-manager-2026", evidence_confidence: 78 },
    { company: c, job_title: "Finance Transformation Lead", location: "Sheffield, UK", date_posted: "2026-06-03", date_first_detected: "2026-06-03", date_last_detected: "2026-07-15", status: "ACTIVE", employment_type: "Permanent", salary_low: 80000, salary_high: 95000, currency: "GBP", advertised_compensation: "£80,000–£95,000", erp_vendor: "Microsoft", erp_product: "Dynamics 365 Business Central", erp_modules: ["Finance"], technical_skills: ["Business Central", "Finance"], integration_technologies: [], cloud_technologies: ["Azure"], responsibilities: "Lead finance transformation and multi-entity consolidation in Business Central.", transformation_language: "Finance transformation", source: "Mock Job Board", source_url: "mock://jobs/finance-transformation-2026", evidence_confidence: 82 },
    { company: c, job_title: "BC Functional Consultant (Supply Chain)", location: "Sheffield, UK", date_posted: "2026-07-01", date_first_detected: "2026-07-01", date_last_detected: "2026-08-05", status: "ACTIVE", employment_type: "Contract", contract_rate_low: 700, contract_rate_high: 800, currency: "GBP", advertised_compensation: "£700–£800/day", erp_vendor: "Microsoft", erp_product: "Dynamics 365 Business Central", erp_modules: ["Supply Chain", "Warehouse"], technical_skills: ["Business Central", "AL"], integration_technologies: [], cloud_technologies: ["Azure"], responsibilities: "Configure BC supply chain and warehouse management modules.", implementation_language: "BC supply chain implementation", source: "Mock Job Board", source_url: "mock://jobs/bc-supply-chain-2026", evidence_confidence: 80 },
    { company: c, job_title: "NAV Support Analyst", location: "Sheffield, UK", date_posted: "2026-07-10", date_first_detected: "2026-07-10", date_last_detected: "2026-08-08", status: "ACTIVE", employment_type: "Permanent", salary_low: 42000, salary_high: 50000, currency: "GBP", advertised_compensation: "£42,000–£50,000", erp_vendor: "Microsoft", erp_product: "Dynamics NAV", erp_version: "NAV 2018", erp_modules: ["Sales", "Purchasing"], technical_skills: ["C/Side"], integration_technologies: [], cloud_technologies: [], responsibilities: "Support legacy NAV 2018 estate during migration.", support_language: "NAV support", source: "Mock Job Board", source_url: "mock://jobs/nav-support-2026", evidence_confidence: 78 },
    { company: c, job_title: "Power Platform Developer", location: "Sheffield, UK", date_posted: "2026-07-18", date_first_detected: "2026-07-18", date_last_detected: "2026-08-10", status: "ACTIVE", employment_type: "Permanent", salary_low: 55000, salary_high: 65000, currency: "GBP", advertised_compensation: "£55,000–£65,000", erp_vendor: "Microsoft", erp_product: "Power Platform", erp_modules: [], technical_skills: ["Power Apps", "Power Automate", "Dataverse"], integration_technologies: ["Business Central"], cloud_technologies: ["Azure"], responsibilities: "Build Power Platform apps extending Business Central.", implementation_language: "Power Platform development", source: "Mock Job Board", source_url: "mock://jobs/power-platform-2026", evidence_confidence: 75 },
    { company: c, job_title: "BC Developer (AL)", location: "Sheffield, UK", date_posted: "2026-08-01", date_first_detected: "2026-08-01", date_last_detected: "2026-08-09", status: "ACTIVE", employment_type: "Permanent", salary_low: 60000, salary_high: 70000, currency: "GBP", advertised_compensation: "£60,000–£70,000", erp_vendor: "Microsoft", erp_product: "Dynamics 365 Business Central", erp_modules: [], technical_skills: ["AL", "Business Central"], integration_technologies: [], cloud_technologies: ["Azure"], responsibilities: "Develop AL extensions for Business Central.", implementation_language: "AL development", source: "Mock Job Board", source_url: "mock://jobs/bc-developer-2026", evidence_confidence: 80 },
  ];
}