import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const provider = (body.provider || "").trim();
    if (!provider) return Response.json({ error: "provider is required" }, { status: 400 });

    const existing = await base44.asServiceRole.entities.IntegrationConfig.filter({ provider });
    const data = {
      provider,
      enabled: !!body.enabled,
      webhook_url: body.webhook_url || "",
      base_url: body.base_url || "",
      notes: body.notes || "",
    };
    // Only overwrite the key when a real new value is supplied (not the masked placeholder)
    if (body.api_key && !body.api_key.includes("••••")) {
      data.api_key = body.api_key;
    }

    if (existing[0]) {
      await base44.asServiceRole.entities.IntegrationConfig.update(existing[0].id, data);
    } else {
      if (!data.api_key) data.api_key = body.api_key || "";
      await base44.asServiceRole.entities.IntegrationConfig.create(data);
    }
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}