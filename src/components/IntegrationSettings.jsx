import React, { useState, useEffect } from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plug, Save, Check, Lock, FlaskConical, Briefcase } from "lucide-react";

const PROVIDERS = [
  { key: "n8n", label: "n8n Workflow", desc: "Webhook URL to trigger external research orchestration", hasWebhook: true },
  { key: "web_search", label: "Web Search API", desc: "General web search for company evidence" },
  { key: "company_enrichment", label: "Company Enrichment API", desc: "Firmographics & financial profile" },
  { key: "llm", label: "LLM API", desc: "External LLM for inference & synthesis" },
  { key: "jobs_data", label: "Jobs Data Provider", desc: "Job postings & ERP skill signals" },
  { key: "news", label: "News Provider", desc: "Company, executive & industry news" },
  { key: "tech_intel", label: "Technology Intelligence", desc: "Tech stack, integrations & ERP detection" },
];

export default function IntegrationSettings() {
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [saved, setSaved] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await base44.functions.invoke("getIntegrationSettings", {});
      const map = {};
      (res.data.configs || []).forEach((c) => { map[c.provider] = c; });
      setConfigs(map);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const save = async (p) => {
    setSaving(p.key);
    try {
      const c = configs[p.key] || {};
      await base44.functions.invoke("saveIntegrationSetting", {
        provider: p.key, enabled: c.enabled, webhook_url: c.webhook_url, base_url: c.base_url, api_key: c.api_key, notes: c.notes,
      });
      setSaved(p.key);
      setTimeout(() => setSaved(null), 1500);
    } catch (e) {
    } finally {
      setSaving(null);
    }
  };

  const update = (key, field, val) =>
    setConfigs((c) => ({ ...c, [key]: { ...(c[key] || {}), provider: key, [field]: val } }));

  if (loading) return <div className="py-8 text-center"><Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" /></div>;

  return (
    <SectionCard title="Integration Settings" subtitle="External research providers — API keys are stored securely, never exposed in client-side code">
      <div className="flex items-center gap-2 mb-4 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
        <Lock className="w-3.5 h-3.5 text-slate-400" />
        No single provider is required. The built-in LLM engine runs when no external workflow is configured.
      </div>
      <div className="border border-violet-200 bg-violet-50/50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FlaskConical className="w-4 h-4 text-violet-600" />
            <div>
              <div className="text-sm font-semibold text-slate-900">Mock Analysis Mode</div>
              <div className="text-xs text-slate-500">Mock is now opt-in per analysis via the Research Mode dropdown on the Analyse page — real companies always run live research by default.</div>
            </div>
          </div>
          <Switch checked={!!(configs["mock"] || {}).enabled} onCheckedChange={(v) => update("mock", "enabled", v)} />
        </div>
        <div className="flex justify-end mt-3">
          <Button size="sm" variant="outline" onClick={() => save({ key: "mock" })} disabled={saving === "mock"}>
            {saving === "mock" ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : saved === "mock" ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
            {saved === "mock" ? "Saved" : "Save"}
          </Button>
        </div>
      </div>
      <div className="border border-indigo-200 bg-indigo-50/50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2.5 mb-3">
          <Briefcase className="w-4 h-4 text-indigo-600" />
          <div>
            <div className="text-sm font-semibold text-slate-900">ERP Job Discovery Mode</div>
            <div className="text-xs text-slate-500">MOCK uses test data · LIVE uses external job sources · HYBRID supplements missing fields with AI inference</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-slate-500">Research Mode</Label>
            <Select value={(configs["jobs_research"] || {}).notes || "MOCK"} onValueChange={(v) => update("jobs_research", "notes", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MOCK">MOCK — test data</SelectItem>
                <SelectItem value="LIVE">LIVE — external job sources</SelectItem>
                <SelectItem value="HYBRID">HYBRID — live + AI inference</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-slate-500">n8n Job Research Webhook (optional)</Label>
            <Input value={(configs["jobs_research"] || {}).webhook_url || ""} onChange={(e) => update("jobs_research", "webhook_url", e.target.value)} placeholder="https://n8n.example.com/webhook/jobs" className="mt-1" />
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <Button size="sm" variant="outline" onClick={() => save({ key: "jobs_research" })} disabled={saving === "jobs_research"}>
            {saving === "jobs_research" ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : saved === "jobs_research" ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
            {saved === "jobs_research" ? "Saved" : "Save"}
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {PROVIDERS.map((p) => {
          const c = configs[p.key] || {};
          return (
            <div key={p.key} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <Plug className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{p.label}</div>
                    <div className="text-xs text-slate-400">{p.desc}</div>
                  </div>
                </div>
                <Switch checked={!!c.enabled} onCheckedChange={(v) => update(p.key, "enabled", v)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {p.hasWebhook ? (
                  <div className="md:col-span-2">
                    <Label className="text-xs text-slate-500">Webhook URL</Label>
                    <Input value={c.webhook_url || ""} onChange={(e) => update(p.key, "webhook_url", e.target.value)} placeholder="https://n8n.example.com/webhook/…" className="mt-1" />
                  </div>
                ) : (
                  <>
                    <div>
                      <Label className="text-xs text-slate-500">Base URL</Label>
                      <Input value={c.base_url || ""} onChange={(e) => update(p.key, "base_url", e.target.value)} placeholder="https://api.example.com" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">API Key</Label>
                      <Input type="password" value={c.api_key || ""} onChange={(e) => update(p.key, "api_key", e.target.value)} placeholder={c.api_key ? "Saved — enter a new key to replace" : "Enter key"} className="mt-1" />
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end mt-3">
                <Button size="sm" variant="outline" onClick={() => save(p)} disabled={saving === p.key}>
                  {saving === p.key ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : saved === p.key ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                  {saved === p.key ? "Saved" : "Save"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}