export const ERP_SYSTEMS = [
  "Microsoft Dynamics NAV",
  "Microsoft Dynamics GP",
  "Microsoft Dynamics AX",
  "Microsoft Dynamics 365 Business Central",
  "Microsoft Dynamics 365 Finance & Operations",
  "SAP ECC",
  "SAP Business One",
  "SAP S/4HANA",
  "SAP S/4HANA Cloud",
  "Oracle E-Business Suite",
  "Oracle Fusion Cloud ERP",
  "JD Edwards",
  "NetSuite ERP",
  "NetSuite OneWorld",
  "Sage 50",
  "Sage 200",
  "Sage X3",
  "Infor",
  "Epicor",
  "Other / Unknown",
];

export const INDUSTRIES = [
  "Manufacturing",
  "Distribution & Wholesale",
  "Retail & E-commerce",
  "Professional Services",
  "Construction & Engineering",
  "Healthcare",
  "Financial Services",
  "Education",
  "Not-for-profit",
  "Food & Beverage",
  "Logistics & Transport",
  "Energy & Utilities",
  "Media & Entertainment",
  "Real Estate",
  "Agriculture",
  "Automotive",
  "Technology",
  "Public Sector",
  "Other",
];

export const SOURCE_TYPES = [
  "Primary Company Disclosure",
  "Annual Report",
  "Investor Presentation",
  "Company Technology Page",
  "ERP Vendor Case Study",
  "Implementation Partner Case Study",
  "Official Procurement Notice",
  "Current Job Vacancy",
  "Historic Job Vacancy",
  "Executive Interview",
  "Transformation Announcement",
  "Cloud Migration Announcement",
  "M&A Information",
  "Credible Publication",
  "Third-Party Technology Database",
  "Unverified Web Mention",
  "Historic Archived Evidence",
  "Technical Documentation",
  "Other",
];

// Evidence Confidence Methodology — source quality weightings (0-100)
export const SOURCE_WEIGHTS = {
  "Primary Company Disclosure": 100,
  "Annual Report": 100,
  "Investor Presentation": 100,
  "Company Technology Page": 100,
  "Transformation Announcement": 100,
  "Cloud Migration Announcement": 100,
  "ERP Vendor Case Study": 95,
  "Implementation Partner Case Study": 90,
  "Official Procurement Notice": 90,
  "Current Job Vacancy": 80,
  "Executive Interview": 80,
  "M&A Information": 80,
  "Technical Documentation": 80,
  "Credible Publication": 70,
  "Historic Job Vacancy": 60,
  "Historic Archived Evidence": 60,
  "Third-Party Technology Database": 55,
  "Unverified Web Mention": 30,
  "Other": 50,
};

export const EVIDENCE_STRENGTHS = ["PRIMARY", "STRONG", "SUPPORTING", "WEAK"];

export function sourceWeight(sourceType) {
  return SOURCE_WEIGHTS[sourceType] ?? 50;
}

export function evidenceStrengthStyle(strength) {
  switch ((strength || "").toUpperCase()) {
    case "PRIMARY":
      return { color: "text-emerald-700", bg: "bg-emerald-100 border-emerald-200", dot: "bg-emerald-500", label: "Primary" };
    case "STRONG":
      return { color: "text-sky-700", bg: "bg-sky-100 border-sky-200", dot: "bg-sky-500", label: "Strong" };
    case "SUPPORTING":
      return { color: "text-amber-700", bg: "bg-amber-100 border-amber-200", dot: "bg-amber-500", label: "Supporting" };
    case "WEAK":
      return { color: "text-slate-500", bg: "bg-slate-100 border-slate-200", dot: "bg-slate-400", label: "Weak" };
    default:
      return { color: "text-slate-500", bg: "bg-slate-100 border-slate-200", dot: "bg-slate-400", label: "—" };
  }
}

export function erpConfidenceLabel(score) {
  const v = Number(score) || 0;
  if (v >= 70) return "HIGH";
  if (v >= 40) return "MEDIUM";
  return "LOW";
}

export function erpConfidenceStyle(label) {
  switch ((label || "").toUpperCase()) {
    case "HIGH":
      return { color: "text-emerald-700", bg: "bg-emerald-100 border-emerald-200", bar: "bg-emerald-500" };
    case "MEDIUM":
      return { color: "text-amber-700", bg: "bg-amber-100 border-amber-200", bar: "bg-amber-500" };
    default:
      return { color: "text-rose-700", bg: "bg-rose-100 border-rose-200", bar: "bg-rose-500" };
  }
}

export const SIGNAL_CATEGORIES = [
  "Executive Changes",
  "M&A",
  "ERP / Technology",
  "Digital Transformation",
  "Operational",
  "Financial",
];

export const CONFIDENCE_LEVELS = ["CONFIRMED", "HIGHLY LIKELY", "INFERRED", "UNKNOWN"];

export function scoreBand(value) {
  const v = Number(value) || 0;
  if (v >= 85) return { label: "Very High", color: "text-rose-600", bg: "bg-rose-50", bar: "bg-rose-500" };
  if (v >= 70) return { label: "High", color: "text-orange-600", bg: "bg-orange-50", bar: "bg-orange-500" };
  if (v >= 40) return { label: "Medium", color: "text-amber-600", bg: "bg-amber-50", bar: "bg-amber-500" };
  return { label: "Low", color: "text-emerald-600", bg: "bg-emerald-50", bar: "bg-emerald-500" };
}

export function fitBand(value) {
  const v = Number(value) || 0;
  if (v >= 70) return { label: "Strong", color: "text-emerald-600", bg: "bg-emerald-50", bar: "bg-emerald-500" };
  if (v >= 40) return { label: "Moderate", color: "text-amber-600", bg: "bg-amber-50", bar: "bg-amber-500" };
  return { label: "Weak", color: "text-rose-600", bg: "bg-rose-50", bar: "bg-rose-500" };
}

export function confidenceStyle(conf) {
  switch ((conf || "").toUpperCase()) {
    case "CONFIRMED":
      return { color: "text-emerald-700", bg: "bg-emerald-100 border-emerald-200", dot: "bg-emerald-500" };
    case "HIGHLY LIKELY":
      return { color: "text-sky-700", bg: "bg-sky-100 border-sky-200", dot: "bg-sky-500" };
    case "INFERRED":
      return { color: "text-amber-700", bg: "bg-amber-100 border-amber-200", dot: "bg-amber-500" };
    default:
      return { color: "text-slate-500", bg: "bg-slate-100 border-slate-200", dot: "bg-slate-400" };
  }
}

export function priorityStyle(p) {
  switch ((p || "").toLowerCase()) {
    case "high":
      return { color: "text-rose-600", bg: "bg-rose-50 border-rose-200" };
    case "medium":
      return { color: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
    default:
      return { color: "text-slate-500", bg: "bg-slate-50 border-slate-200" };
  }
}

export function tierStyle(t) {
  switch ((t || "").toLowerCase()) {
    case "tier 1":
      return { color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" };
    case "tier 2":
      return { color: "text-sky-600", bg: "bg-sky-50 border-sky-200" };
    case "tier 3":
      return { color: "text-slate-600", bg: "bg-slate-50 border-slate-200" };
    default:
      return { color: "text-slate-400", bg: "bg-slate-50 border-slate-200" };
  }
}