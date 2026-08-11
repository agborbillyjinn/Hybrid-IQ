import React, { useState } from "react";
import SectionCard from "@/components/intelligence/SectionCard";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Mail, Linkedin, Phone, Voicemail, MessageSquare, Copy, Check, Lightbulb } from "lucide-react";

const PERSONAS = ["CFO", "CIO", "CTO", "COO", "Finance Director", "IT Director", "Transformation Director", "ERP Programme Director"];

export default function OutreachTab({ account, intel }) {
  const [persona, setPersona] = useState("CFO");
  const [outreach, setOutreach] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    setOutreach(null);
    try {
      const res = await base44.functions.invoke("generateOutreach", {
        persona, company_name: account.company_name, intelligence: intel,
      });
      setOutreach(res.data.outreach);
    } catch (e) {
      setError(e.message || "Failed to generate outreach.");
    } finally {
      setLoading(false);
    }
  };

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <div className="space-y-5">
      <SectionCard title="Discovery Copilot" subtitle="Evidence-driven questions for this account">
        <div className="space-y-2.5">
          {(intel.discovery_questions || []).map((q, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50">
              <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-white text-slate-500 border border-slate-200 mr-2">{q.category}</span>
                <span className="text-sm text-slate-700">{q.question}</span>
              </div>
            </div>
          ))}
          {(intel.discovery_questions || []).length === 0 && <p className="text-sm text-slate-400">No discovery questions generated.</p>}
        </div>
      </SectionCard>

      <SectionCard title="Outreach Copilot" subtitle="Persona-specific outreach — references verified signals only, never fabricates">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-48">
            <Select value={persona} onValueChange={setPersona}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PERSONAS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-indigo-600 to-violet-600">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
            {loading ? "Generating…" : "Generate Outreach"}
          </Button>
        </div>

        {error && <p className="text-sm text-rose-600 mb-4">{error}</p>}

        {outreach && (
          <div className="space-y-4">
            {outreach.evidence_used && outreach.evidence_used.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div className="text-xs font-medium text-emerald-700 mb-1">Evidence used:</div>
                <ul className="space-y-0.5">{outreach.evidence_used.map((e, i) => <li key={i} className="text-xs text-emerald-700">• {e}</li>)}</ul>
              </div>
            )}
            <Block icon={Mail} title="Email" copyKey="email" copied={copied} onCopy={copy}>
              <div className="text-sm font-medium text-slate-800 mb-2">{outreach.email?.subject}</div>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{outreach.email?.body}</p>
            </Block>
            <Block icon={Linkedin} title="LinkedIn Message" copyKey="linkedin" copied={copied} onCopy={copy}>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{outreach.linkedin}</p>
            </Block>
            <Block icon={Phone} title="Cold Call Opener" copyKey="cold_call" copied={copied} onCopy={copy}>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{outreach.cold_call}</p>
            </Block>
            <Block icon={Voicemail} title="Voicemail" copyKey="voicemail" copied={copied} onCopy={copy}>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{outreach.voicemail}</p>
            </Block>
            <Block icon={MessageSquare} title="Follow-up" copyKey="follow_up" copied={copied} onCopy={copy}>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{outreach.follow_up}</p>
            </Block>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function Block({ icon: Icon, title, children, copyKey, copied, onCopy }) {
  const text = typeof children?.props?.children === "string" ? children.props.children : "";
  return (
    <div className="border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700"><Icon className="w-4 h-4 text-slate-400" />{title}</div>
        <button onClick={() => onCopy(text, copyKey)} className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1">
          {copied === copyKey ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
        </button>
      </div>
      {children}
    </div>
  );
}