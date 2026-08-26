const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export type HealthResponse = {
  status: string;
  service: string;
  version: string;
};

export type SystemResponse = {
  platform: string;
  api_version: string;
  research_mode: boolean;
  status: string;
};

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/health`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to reach Neuro-Silicon API");
  }

  return response.json();
}

export async function getSystemInfo(): Promise<SystemResponse> {
  const response = await fetch(`${API_URL}/api/v1/system`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to retrieve Neuro-Silicon system information");
  }

  return response.json();
}
