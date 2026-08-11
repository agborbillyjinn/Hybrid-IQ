// Shared integration-config helper used by backend functions that need to read
// IntegrationConfig records (n8n, jobs_research, mock, etc.) via the service role.

export async function getIntegrationConfig(base44: any, provider: string): Promise<any | null> {
  try {
    const configs = await base44.asServiceRole.entities.IntegrationConfig.filter({ provider });
    return configs[0] || null;
  } catch (e) {
    return null;
  }
}