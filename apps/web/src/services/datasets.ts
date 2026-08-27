const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";


export type DatasetStatus =
  | "ready"
  | "pending"
  | "processing"
  | "unavailable";


export type ModalityName =
  | "MRI"
  | "EEG"
  | "Genomics"
  | "Proteomics"
  | "Behavior";


export type SubjectStatus =
  | "active"
  | "review"
  | "incomplete";


export type SortDirection =
  | "asc"
  | "desc";


export interface DatasetRecord {
  dataset_id: string;
  name: string;
  modality: ModalityName;
  description: string;

  subjects: number;
  records: number;
  size_gb: number;

  status: DatasetStatus;

  source: string;
  version: string;
  last_updated: string;

  quality_score: number;
  missingness_percent: number;
}


export interface DatasetSummary {
  total_datasets: number;

  ready_datasets: number;
  pending_datasets: number;
  processing_datasets: number;

  unique_subjects: number;

  total_records: number;
  total_storage_gb: number;

  mri_records: number;
  eeg_records: number;
  genomics_records: number;
  proteomics_records: number;
  behavior_records: number;
}


export interface DatasetRegistryResponse {
  summary: DatasetSummary;
  datasets: DatasetRecord[];
}


export interface DatasetDetailResponse {
  dataset: DatasetRecord;

  fields: string[];

  linked_modules: string[];

  sample_statistics: Record<
    string,
    string | number
  >;
}


export interface SubjectRecord {
  subject_id: string;

  age: number;

  sex:
    | "Female"
    | "Male"
    | "Other";

  visits: number;

  available_modalities:
    ModalityName[];

  resilience_coefficient:
    number;

  status: SubjectStatus;
}


export interface SubjectRegistryResponse {
  total_subjects: number;

  page: number;
  page_size: number;
  total_pages: number;

  subjects: SubjectRecord[];
}


export interface ModalitySummary {
  modality: ModalityName;

  dataset_count: number;

  total_subjects: number;
  total_records: number;

  total_storage_gb: number;
  average_quality: number;
}


export interface PlatformAnalyticsResponse {
  total_subjects: number;
  total_datasets: number;
  total_records: number;
  total_storage_gb: number;

  modalities: ModalitySummary[];
}


export interface SubjectQuery {
  page?: number;
  page_size?: number;

  search?: string;

  status?: SubjectStatus | "";

  modality?: ModalityName | "";

  sort_direction?: SortDirection;
}


/* ============================================================
   API HELPER
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
        "Content-Type":
          "application/json",

        ...options?.headers,
      },

      cache: "no-store",
    },
  );


  if (!response.ok) {
    let message =
      `Datasets API request failed (${response.status})`;

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
            JSON.stringify(
              detail,
            );
        }
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }


  const data =
    await response.json();

  return data as T;
}


/* ============================================================
   DATASET REGISTRY
   ============================================================ */

export async function getDatasetRegistry():
  Promise<DatasetRegistryResponse> {
  return apiFetch<
    DatasetRegistryResponse
  >(
    "/datasets/registry",
  );
}


/* ============================================================
   DATASET ANALYTICS
   ============================================================ */

export async function getDatasetAnalytics():
  Promise<PlatformAnalyticsResponse> {
  return apiFetch<
    PlatformAnalyticsResponse
  >(
    "/datasets/analytics",
  );
}


/* ============================================================
   DATASET DETAIL
   ============================================================ */

export async function getDatasetDetail(
  datasetId: string,
): Promise<DatasetDetailResponse> {
  return apiFetch<
    DatasetDetailResponse
  >(
    `/datasets/${encodeURIComponent(
      datasetId,
    )}`,
  );
}


/* ============================================================
   SUBJECT REGISTRY
   ============================================================ */

export async function getSubjectRegistry(
  query: SubjectQuery = {},
): Promise<SubjectRegistryResponse> {
  const params =
    new URLSearchParams();

  params.set(
    "page",
    String(
      query.page ?? 1,
    ),
  );

  params.set(
    "page_size",
    String(
      query.page_size ?? 25,
    ),
  );


  if (
    query.search?.trim()
  ) {
    params.set(
      "search",
      query.search.trim(),
    );
  }


  if (
    query.status
  ) {
    params.set(
      "status",
      query.status,
    );
  }


  if (
    query.modality
  ) {
    params.set(
      "modality",
      query.modality,
    );
  }


  params.set(
    "sort_direction",
    query.sort_direction ??
      "asc",
  );


  return apiFetch<
    SubjectRegistryResponse
  >(
    `/datasets/subjects/registry?${params.toString()}`,
  );
}