// Commercial Sensitivity Recalculation — client-side pure function.
// Adjusts commercial scenario based on user-controlled parameters.
// Maximum AI reduction is capped at 70% by default.

const DEFAULT_MAX_REDUCTION = 70;
const WORKSTREAM_BASES = [
  { name: "Requirements", base: 180, compressibility: 78 },
  { name: "Design", base: 150, compressibility: 72 },
  { name: "Configuration", base: 140, compressibility: 68 },
  { name: "Migration", base: 220, compressibility: 82 },
  { name: "Testing", base: 160, compressibility: 80 },
  { name: "Training", base: 120, compressibility: 45 },
  { name: "Governance", base: 140, compressibility: 10 },
];

export function recalculateCommercial(baseIntel, params) {
  const maxReduction = params.max_reduction || DEFAULT_MAX_REDUCTION;
  const cm = baseIntel?.commercial_model || {};
  const scores = baseIntel?.scores || {};
  const complexity = params.customisation_complexity ?? params.data_complexity ?? scores.migration_complexity?.value ?? 50;
  const factor = Math.max(0.5, complexity / 100);

  // Complexity multiplier from adjustable inputs
  const users = Number(params.erp_users) || baseIntel?.company_overview?.employees || 1000;
  const integrations = Number(params.integrations) || 5;
  const entities = Number(params.legal_entities) || 2;
  const countries = Number(params.countries) || 1;
  const customisation = Number(params.customisation_complexity) || 50;
  const dataComplexity = Number(params.data_complexity) || 50;
  const blendedRate = Number(params.blended_day_rate) || 800;
  const durationMonths = Number(params.programme_duration) || 18;
  const aiEfficiency = Number(params.ai_efficiency) || 50; // 0-100, how much of max reduction to apply

  // Complexity factor from inputs
  const complexityFactor =
    1 +
    (users / 5000) * 0.3 +
    (integrations / 10) * 0.2 +
    (entities / 5) * 0.15 +
    (countries / 5) * 0.15 +
    (customisation / 100) * 0.1 +
    (dataComplexity / 100) * 0.1;

  // Workstream days
  const workstreams = WORKSTREAM_BASES.map((ws) => {
    const traditionalDays = Math.round(ws.base * factor * complexityFactor);
    const effectiveCompressibility = Math.min(ws.compressibility, maxReduction);
    const appliedReduction = (effectiveCompressibility * aiEfficiency) / 100;
    const aiDays = Math.round(traditionalDays * (1 - appliedReduction / 100));
    return {
      name: ws.name,
      traditional_days: traditionalDays,
      ai_days: aiDays,
      reduction_days: traditionalDays - aiDays,
      reduction_pct: Math.round(appliedReduction),
    };
  });

  const traditionalTotalDays = workstreams.reduce((s, w) => s + w.traditional_days, 0);
  const aiTotalDays = workstreams.reduce((s, w) => s + w.ai_days, 0);
  const daysAvoided = traditionalTotalDays - aiTotalDays;

  const traditionalCost = Math.round(traditionalTotalDays * blendedRate);
  const aiCost = Math.round(aiTotalDays * blendedRate);
  const saving = traditionalCost - aiCost;
  const overallReductionPct = traditionalCost > 0 ? Math.round((saving / traditionalCost) * 100) : 0;

  // 4 scenarios with different AI efficiency levels
  const efficiencyLevels = [
    { name: "BASELINE", aiEfficiency: 30, label: "Baseline" },
    { name: "CONSERVATIVE", aiEfficiency: 50, label: "Conservative" },
    { name: "EXPECTED", aiEfficiency: 70, label: "Expected" },
    { name: "HIGH-EFFICIENCY", aiEfficiency: 100, label: "High Efficiency" },
  ];

  const scenarios = efficiencyLevels.map((level) => {
    const levelAiDays = workstreams.reduce((s, ws) => {
      const appliedReduction = (Math.min(ws.reduction_pct > 0 ? WORKSTREAM_BASES.find((w) => w.name === ws.name)?.compressibility || ws.reduction_pct : 50, maxReduction) * level.aiEfficiency) / 100;
      return s + Math.round(ws.traditional_days * (1 - appliedReduction / 100));
    }, 0);
    const levelAiCost = Math.round(levelAiDays * blendedRate);
    const levelSaving = traditionalCost - levelAiCost;
    const levelReductionPct = traditionalCost > 0 ? Math.round((levelSaving / traditionalCost) * 100) : 0;
    const levelDuration = Math.max(6, Math.round(durationMonths * (levelAiDays / traditionalTotalDays)));
    return {
      name: level.name,
      label: level.label,
      ai_cost: levelAiCost,
      saving: levelSaving,
      reduction_pct: Math.min(levelReductionPct, maxReduction),
      duration_months: levelDuration,
      months_saved: Math.max(0, durationMonths - levelDuration),
      ai_days: levelAiDays,
      days_avoided: traditionalTotalDays - levelAiDays,
    };
  });

  return {
    inputs: {
      blended_day_rate: blendedRate,
      programme_duration: durationMonths,
      erp_users: users,
      integrations,
      legal_entities: entities,
      countries,
      customisation_complexity: customisation,
      data_complexity: dataComplexity,
      ai_efficiency: aiEfficiency,
      max_reduction: maxReduction,
    },
    workstreams,
    traditional_total_days: traditionalTotalDays,
    ai_total_days: aiTotalDays,
    days_avoided: daysAvoided,
    traditional_cost: traditionalCost,
    ai_cost: aiCost,
    saving,
    overall_reduction_pct: Math.min(overallReductionPct, maxReduction),
    blended_rate: blendedRate,
    scenarios,
    capped: overallReductionPct > maxReduction,
    cap_applied: overallReductionPct > maxReduction ? `Reduction capped at ${maxReduction}%` : null,
  };
}

export function defaultSensitivityParams(intel) {
  const cm = intel?.commercial_model || {};
  const ci = cm.complexity_inputs || {};
  return {
    blended_day_rate: 800,
    programme_duration: cm.traditional?.duration?.expected || 18,
    erp_users: intel?.company_overview?.employees || 1000,
    integrations: ci.integrations || 5,
    legal_entities: ci.legal_entities || 2,
    countries: ci.countries || 1,
    customisation_complexity: ci.customisation || 50,
    data_complexity: ci.data_complexity || 50,
    ai_efficiency: 70,
    max_reduction: DEFAULT_MAX_REDUCTION,
  };
}