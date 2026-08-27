const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";


/* ============================================================
   TYPES
   ============================================================ */

export type Hemisphere =
  | "left"
  | "right"
  | "bilateral";


export type RegionCategory =
  | "cortical"
  | "subcortical"
  | "limbic"
  | "cerebellar";


export type RegionStatus =
  | "stable"
  | "watch"
  | "elevated";


export type OverlayMode =
  | "anatomy"
  | "resilience"
  | "complexity"
  | "atrophy"
  | "confidence";


export interface BrainRegion {
  region_id: string;
  name: string;

  hemisphere: Hemisphere;
  category: RegionCategory;

  description: string;

  cortical_thickness_mm:
    number | null;

  volume_mm3:
    number | null;

  resilience_score: number;
  complexity_score: number;
  atrophy_index: number;
  confidence: number;

  status: RegionStatus;
}


export interface BrainRegionListResponse {
  subject_id: string;
  total_regions: number;
  overlay_mode: OverlayMode;
  regions: BrainRegion[];
}


export interface BrainRegionDetailResponse {
  subject_id: string;
  region: BrainRegion;

  linked_modalities: string[];

  longitudinal_change_percent:
    number;

  interpretation: string;
}


export interface BrainSummary {
  subject_id: string;

  total_regions: number;

  mean_resilience: number;
  mean_complexity: number;
  mean_atrophy: number;
  mean_confidence: number;

  stable_regions: number;
  watch_regions: number;
  elevated_regions: number;
}


export interface BrainOverlayResponse {
  subject_id: string;

  overlay_mode: OverlayMode;

  min_value: number;
  max_value: number;
  mean_value: number;

  values: Record<
    string,
    number
  >;
}


export interface RegionQuery {
  subject_id?: string;

  hemisphere?:
    | Hemisphere
    | "";

  category?:
    | RegionCategory
    | "";

  overlay?: OverlayMode;
}


/* ============================================================
   API HELPER
   ============================================================ */

async function apiFetch<T>(
  endpoint: string,
): Promise<T> {
  const response =
    await fetch(
      `${API_URL}/api/v1${endpoint}`,
      {
        cache: "no-store",
      },
    );


  if (!response.ok) {
    let message =
      `Brain Explorer API request failed (${response.status})`;

    try {
      const body: unknown =
        await response.json();

      if (
        typeof body === "object" &&
        body !== null &&
        "detail" in body
      ) {
        const detail =
          (
            body as {
              detail?: unknown;
            }
          ).detail;

        if (
          typeof detail ===
          "string"
        ) {
          message =
            detail;
        }
      }
    } catch {
      // Preserve default error.
    }

    throw new Error(
      message,
    );
  }


  return (
    await response.json()
  ) as T;
}


/* ============================================================
   SUMMARY
   ============================================================ */

export async function getBrainSummary(
  subjectId = "NS-001",
): Promise<BrainSummary> {
  const params =
    new URLSearchParams();

  params.set(
    "subject_id",
    subjectId,
  );


  return apiFetch<
    BrainSummary
  >(
    `/brain-explorer/summary?${params.toString()}`,
  );
}


/* ============================================================
   REGION LIST
   ============================================================ */

export async function getBrainRegions(
  query: RegionQuery = {},
): Promise<BrainRegionListResponse> {
  const params =
    new URLSearchParams();


  params.set(
    "subject_id",
    query.subject_id ??
      "NS-001",
  );


  if (
    query.hemisphere
  ) {
    params.set(
      "hemisphere",
      query.hemisphere,
    );
  }


  if (
    query.category
  ) {
    params.set(
      "category",
      query.category,
    );
  }


  params.set(
    "overlay",
    query.overlay ??
      "anatomy",
  );


  return apiFetch<
    BrainRegionListResponse
  >(
    `/brain-explorer/regions?${params.toString()}`,
  );
}


/* ============================================================
   REGION DETAIL
   ============================================================ */

export async function getBrainRegionDetail(
  regionId: string,
  subjectId = "NS-001",
): Promise<BrainRegionDetailResponse> {
  const params =
    new URLSearchParams();

  params.set(
    "subject_id",
    subjectId,
  );


  return apiFetch<
    BrainRegionDetailResponse
  >(
    `/brain-explorer/regions/${encodeURIComponent(
      regionId,
    )}?${params.toString()}`,
  );
}


/* ============================================================
   OVERLAY
   ============================================================ */

export async function getBrainOverlay(
  mode: OverlayMode,
  subjectId = "NS-001",
): Promise<BrainOverlayResponse> {
  const params =
    new URLSearchParams();

  params.set(
    "mode",
    mode,
  );

  params.set(
    "subject_id",
    subjectId,
  );


  return apiFetch<
    BrainOverlayResponse
  >(
    `/brain-explorer/overlay?${params.toString()}`,
  );
}