import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const configs = await base44.asServiceRole.entities.IntegrationConfig.list();
    const masked = configs.map((c) => ({ ...c, api_key: c.api_key ? maskKey(c.api_key) : "" }));
    return Response.json({ configs: masked });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function maskKey(k) {
  if (!k || k.length < 6) return k ? "••••" : "";
  return k.slice(0, 3) + "••••" + k.slice(-3);
}