import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import {
  buildSearchQueries, mapRawVacancy, deduplicateVacancies, extractTechnologies,
  classifyCompensation, classifySource, inferVacanciesViaLLM, buildVacancyDiscoveryPrompt,
} from "../../shared/vacancyResearch.ts";
import { getIntegrationConfig } from "../../shared/integrationConfig.ts";

const ANALYSIS_VERSION = "1.1";

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const company = (body.company_name || "").trim();
    if (!company) return Response.json({ error: "company_name is required" }, { status: 400 });

    const mode = (body.research_mode || "LIVE").toUpperCase();
    const startedAt = Date.now();
    const errors: string[] = [];
    const sourcesChecked: string[] = [];
    let rawVacancies: any[] = [];
    let llmCalls = 0;
    let n8nUsed = false;

    // 1. Build structured search queries
    const queries = buildSearchQueries(company, body.known_erp);

    // 2. Fetch raw vacancies — prefer n8n job research workflow, else LLM web search
    const jobsConfig = await getIntegrationConfig(base44, "jobs_research");
    const n8nJobsWebhook = jobsConfig?.webhook_url;
    if (n8nJobsWebhook) {
      try {
        sourcesChecked.push("n8n Job Research Workflow");
        const r = await fetch(n8nJobsWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            analysis_id: body.analysis_id, company_name: company,
            company_website: body.company_website, country: body.country,
            known_erp: body.known_erp, search_queries: queries, research_mode: mode,
          }),
        });
        if (r.ok) {
          const data = await r.json();
          rawVacancies = data.vacancies || data.jobVacancies || [];
          n8nUsed = true;
          if (Array.isArray(data.sources_checked)) sourcesChecked.push(...data.sources_checked);
        } else {
          errors.push(`n8n jobs webhook returned ${r.status}`);
        }
      } catch (e: any) {
        errors.push(`n8n jobs webhook failed: ${e.message}`);
      }
    }

    if (!n8nUsed) {
      try {
        sourcesChecked.push("LLM Web Search (Gemini)");
        llmCalls++;
        const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: buildVacancyDiscoveryPrompt(company, body, queries),
          add_context_from_internet: true,
          model: "gemini_3_flash",
          response_json_schema: {
            type: "object",
            properties: {
              vacancies: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    job_title: { type: "string" }, location: { type: "string" },
                    date_posted: { type: "string" }, employment_type: { type: "string" },
                    erp_vendor: { type: "string" }, erp_product: { type: "string" },
                    erp_modules: { type: "array", items: { type: "string" } },
                    technical_skills: { type: "array", items: { type: "string" } },
                    integration_technologies: { type: "array", items: { type: "string" } },
                    cloud_technologies: { type: "array", items: { type: "string" } },
                    responsibilities: { type: "string" }, advertised_compensation: { type: "string" },
                    source: { type: "string" }, source_url: { type: "string" }, status: { type: "string" },
                  },
                },
              },
            },
          },
        });
        rawVacancies = (llmRes && Array.isArray(llmRes.vacancies)) ? llmRes.vacancies : (Array.isArray(llmRes) ? llmRes : []);
      } catch (e: any) {
        errors.push(`LLM web search failed: ${e.message}`);
      }
    }

    // 3. Map raw vacancies to canonical JobVacancy shape
    let mapped = rawVacancies.map((rv) => mapRawVacancy(rv, company, queries)).filter((v) => v.job_title);

    // 4. Deduplicate across sources (company careers page preferred as canonical)
    const { unique, duplicatesRemoved } = deduplicateVacancies(mapped);
    mapped = unique;

    // 5. Deterministic technology extraction + compensation classification
    for (const v of mapped) {
      Object.assign(v, extractTechnologies(v));
      Object.assign(v, classifyCompensation(v));
      if (!v.source_quality) v.source_quality = classifySource(v.source || v.source_url);
    }

    // 6. LLM inference where needed (HYBRID mode, or vacancies with unknown ERP product)
    if (mode === "HYBRID" || mapped.some((v) => !v.erp_product)) {
      const needingLLM = mapped
        .map((v, i) => ({ index: i, job_title: v.job_title, responsibilities: v.responsibilities, technical_skills: v.technical_skills }))
        .filter((x) => x.job_title);
      if (needingLLM.length) {
        try {
          llmCalls++;
          const inferred = await inferVacanciesViaLLM(base44, needingLLM);
          for (const [idx, inf] of Object.entries(inferred)) {
            const v = mapped[parseInt(idx)];
            if (!v) continue;
            if (!v.erp_vendor && inf.erp_vendor) v.erp_vendor = inf.erp_vendor;
            if (!v.erp_product && inf.erp_product) v.erp_product = inf.erp_product;
            if (inf.technology_role) v.technology_role = inf.technology_role;
            if (inf.role_classification) v.classification = inf.role_classification;
            if (inf.programme_stage_signal) v.programme_stage_signal = inf.programme_stage_signal;
            if (Array.isArray(inf.module_signals) && inf.module_signals.length) v.erp_modules = [...new Set([...(v.erp_modules || []), ...inf.module_signals])];
            if (Array.isArray(inf.integration_signals) && inf.integration_signals.length) v.integration_technologies = [...new Set([...(v.integration_technologies || []), ...inf.integration_signals])];
            v.llm_inferred = true;
            if (inf.confidence != null) v.evidence_confidence = inf.confidence;
          }
        } catch (e: any) {
          errors.push(`LLM vacancy inference failed: ${e.message}`);
        }
      }
    }

    const duration = Date.now() - startedAt;
    const research_metadata = {
      research_mode: mode,
      search_queries: queries,
      sources_checked: sourcesChecked,
      vacancies_found: rawVacancies.length,
      duplicates_removed: duplicatesRemoved,
      vacancies_persisted: mapped.length,
      llm_calls: llmCalls,
      errors,
      duration_ms: duration,
      analysis_version: ANALYSIS_VERSION,
      last_job_search: new Date().toISOString(),
      coverage_confidence: mapped.length >= 5 ? "HIGH" : mapped.length >= 1 ? "MEDIUM" : "LOW",
      no_vacancies_message: mapped.length ? null : "No relevant vacancies detected from the sources searched.",
    };

    return Response.json({ jobVacancies: mapped, research_metadata, errors, sources_checked: sourcesChecked });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}