const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";


export type RiskState =
  | "Low"
  | "Moderate"
  | "High";


export type ModalityStatus =
  | "ready"
  | "pending"
  | "unavailable";


export type SimulationScenario =
  | "baseline"
  | "accelerated_decline"
  | "resilience_intervention"
  | "high_stress";


export type SimulationHorizon =
  | 6
  | 12
  | 24
  | 36;


// ============================================================
// SUBJECT
// ============================================================

export interface SubjectProfile {
  subject_id: string;
  display_name: string;
  age: number;
  sex: "Female" | "Male" | "Other";
  visits: number;
  observation_window_months: number;
  cognitive_state: string;
  diagnosis: string;
  last_updated: string;
}


// ============================================================
// RESILIENCE
// ============================================================

export interface ResilienceState {
  coefficient: number;
  index_percent: number;
  classification: string;
  complexity: number;
  confidence: number;
  risk: RiskState;
}


// ============================================================
// TRAJECTORY
// ============================================================

export interface TrajectoryPoint {
  label: string;
  month: number;
  resilience_index: number;
}


// ============================================================
// MODALITIES
// ============================================================

export interface ModalityState {
  key: string;
  name: string;
  description: string;
  status: ModalityStatus;
}


// ============================================================
// PREDICTION
// ============================================================

export interface TwinPrediction {
  predicted_coefficient: number;
  trajectory_percent: number;
  risk_state: RiskState;
  confidence: number;
}


// ============================================================
// COMPLETE DIGITAL TWIN SUBJECT
// ============================================================

export interface DigitalTwinSubject {
  subject: SubjectProfile;
  resilience: ResilienceState;
  trajectory: TrajectoryPoint[];
  modalities: ModalityState[];
  prediction: TwinPrediction;
}


// ============================================================
// SIMULATION
// ============================================================

export interface SimulationRequest {
  scenario: SimulationScenario;
  horizon_months: SimulationHorizon;
}


export interface SimulationResponse {
  scenario: SimulationScenario;
  horizon_months: number;
  baseline_coefficient: number;
  predicted_coefficient: number;
  change_percent: number;
  risk_state: RiskState;
  confidence: number;
}


// ============================================================
// INTERNAL API FETCH
// ============================================================

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
      `Digital Twin API request failed (${response.status})`;

    try {
      const body = await response.json();

      if (body?.detail) {
        message =
          typeof body.detail === "string"
            ? body.detail
            : JSON.stringify(body.detail);
      }
    } catch {
      // Response did not contain JSON.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}


// ============================================================
// GET DIGITAL TWIN SUBJECT
// ============================================================

export async function getDigitalTwinSubject():
  Promise<DigitalTwinSubject> {
  return apiFetch<DigitalTwinSubject>(
    "/digital-twin/subject",
  );
}


// ============================================================
// RUN DIGITAL TWIN SIMULATION
// ============================================================

export async function runDigitalTwinSimulation(
  request: SimulationRequest,
): Promise<SimulationResponse> {
  return apiFetch<SimulationResponse>(
    "/digital-twin/simulate",
    {
      method: "POST",

      body: JSON.stringify(request),
    },
  );
}