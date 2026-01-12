export interface ProviderHealth {
  ok: boolean;
  latencyMs?: number;
  error?: string;
}

export interface ProviderInfo {
  name: string;
  version?: string;
}