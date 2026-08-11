// Source taxonomy: classifies raw evidence sources into canonical categories
// and assigns strength weights per the HybridIQ confidence model.

export const SOURCE_STRENGTH: Record<string, number> = {
  "Official company disclosure": 1.00,
  "Annual report": 1.00,
  "Investor presentation": 0.95,
  "ERP vendor case study": 0.95,
  "Implementation partner case study": 0.90,
  "Official procurement": 0.90,
  "Company careers page": 0.85,
  "Executive interview": 0.85,
  "Current job vacancy": 0.80,
  "Credible publication": 0.70,
  "Historic vacancy": 0.60,
  "Technology database": 0.55,
  "Unverified third-party mention": 0.30,
};

const KEYWORD_RULES: Array<{ pattern: RegExp; category: keyof typeof SOURCE_STRENGTH }> = [
  { pattern: /annual report|annual_report|10-k|annual filing/i, category: "Annual report" },
  { pattern: /investor|earnings call|quarterly report/i, category: "Investor presentation" },
  { pattern: /vendor case study|customer story|success story|vendor reference/i, category: "ERP vendor case study" },
  { pattern: /partner case study|implementation partner|systems integrator case/i, category: "Implementation partner case study" },
  { pattern: /procurement|tender|contract notice|rfp|rfq/i, category: "Official procurement" },
  { pattern: /press release|company announcement|official disclosure|newsroom/i, category: "Official company disclosure" },
  { pattern: /career page|careers page|company careers/i, category: "Company careers page" },
  { pattern: /executive interview|c-level interview|ceo interview|cio interview/i, category: "Executive interview" },
  { pattern: /current job|current vacancy|job vacancy|active vacancy/i, category: "Current job vacancy" },
  { pattern: /historic vacancy|historical vacancy|expired vacancy|closed vacancy/i, category: "Historic vacancy" },
  { pattern: /news|publication|article|media report|trade press/i, category: "Credible publication" },
  { pattern: /technology database|tech database|stack database|builtwith|whatol/i, category: "Technology database" },
];

export function classifySource(rawType?: string, sourceName?: string, url?: string): { category: string; strength: number } {
  const hay = `${rawType || ""} ${sourceName || ""}`;
  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(hay)) {
      return { category: rule.category, strength: SOURCE_STRENGTH[rule.category] };
    }
  }
  // Fallback: infer from URL domain
  const domain = extractDomain(url);
  if (domain) {
    if (/(linkedin|indeed|glassdoor|reed|totaljobs|monster)/.test(domain)) return { category: "Current job vacancy", strength: 0.80 };
    if (/(sap|oracle|microsoft|workday|infor)\.com/.test(domain)) return { category: "ERP vendor case study", strength: 0.95 };
  }
  return { category: "Unverified third-party mention", strength: 0.30 };
}

export function extractDomain(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}