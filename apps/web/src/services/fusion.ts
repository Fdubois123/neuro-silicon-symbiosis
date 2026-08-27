const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";


export type ModalityName =
  | "MRI"
  | "EEG"
  | "Genomics"
  | "Proteomics"
  | "Behavior";


export type ModalityStatus =
  | "ready"
  | "pending"
  | "unavailable";


export type RiskState =
  | "Low"
  | "Moderate"
  | "High";


export type FusionStateName =
  | "Stable"
  | "Reduced"
  | "Idle";


export interface FusionModality {
  name: ModalityName;
  description: string;
  status: ModalityStatus;
  baseline_contribution_percent: number;
}


export interface LatentMetrics {
  energy: number;
  coherence: number;
  entropy: number;
}


export interface FusionStateResponse {
  subject_id: string;
  model_name: string;

  latent_dimensions: number;
  visualization_dimensions: number;

  fusion_method: string;

  baseline_rho: number;
  baseline_confidence: number;

  modalities: FusionModality[];

  baseline_latent_vector: number[];
  baseline_latent_metrics: LatentMetrics;
}


export interface ContributionResult {
  name: ModalityName;
  contribution_percent: number;
}


export interface FusionRunResponse {
  subject_id: string;

  active_modalities: ModalityName[];
  active_count: number;

  latent_dimensions: number;
  visualization_dimensions: number;

  fusion_state: FusionStateName;

  predicted_rho: number;
  confidence: number;
  risk_state: RiskState;

  contributions: ContributionResult[];

  latent_vector: number[];
  latent_metrics: LatentMetrics;
}


export interface AblationResponse {
  excluded_modality: ModalityName;

  baseline_rho: number;
  ablated_rho: number;

  rho_change: number;
  rho_change_percent: number;

  baseline_confidence: number;
  ablated_confidence: number;

  latent_shift: number;

  interpretation: string;
}


/* ============================================================
   API FETCH HELPER
   ============================================================ */

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${API_URL}/api/v1${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },

      cache: "no-store",
    },
  );


  if (!response.ok) {
    let message =
      `Fusion API request failed (${response.status})`;

    try {
      const body: unknown =
        await response.json();

      if (
        typeof body === "object" &&
        body !== null &&
        "detail" in body
      ) {
        const detail = (
          body as {
            detail?: unknown;
          }
        ).detail;

        if (
          typeof detail === "string"
        ) {
          message = detail;
        } else if (
          detail !== undefined
        ) {
          message =
            JSON.stringify(detail);
        }
      }
    } catch {
      /*
       * Keep the default HTTP
       * error message if the
       * response is not JSON.
       */
    }

    throw new Error(message);
  }


  const data =
    await response.json();

  return data as T;
}


/* ============================================================
   GET FUSION STATE
   ============================================================ */

export async function getFusionState():
  Promise<FusionStateResponse> {
  return apiFetch<FusionStateResponse>(
    "/fusion/state",
  );
}


/* ============================================================
   RUN FUSION
   ============================================================ */

export async function runFusion(
  activeModalities: ModalityName[],
): Promise<FusionRunResponse> {
  return apiFetch<FusionRunResponse>(
    "/fusion/run",
    {
      method: "POST",

      body: JSON.stringify({
        active_modalities:
          activeModalities,
      }),
    },
  );
}


/* ============================================================
   RUN ABLATION
   ============================================================ */

export async function runAblation(
  excludedModality: ModalityName,
): Promise<AblationResponse> {
  return apiFetch<AblationResponse>(
    "/fusion/ablation",
    {
      method: "POST",

      body: JSON.stringify({
        excluded_modality:
          excludedModality,
      }),
    },
  );
}