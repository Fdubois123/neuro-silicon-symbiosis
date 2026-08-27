from __future__ import annotations

import math
from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field


router = APIRouter(
    prefix="/datasets",
    tags=["Datasets"],
)


# ============================================================
# TYPES
# ============================================================

DatasetStatus = Literal[
    "ready",
    "pending",
    "processing",
    "unavailable",
]

ModalityName = Literal[
    "MRI",
    "EEG",
    "Genomics",
    "Proteomics",
    "Behavior",
]

SubjectStatus = Literal[
    "active",
    "review",
    "incomplete",
]

SortDirection = Literal[
    "asc",
    "desc",
]


# ============================================================
# MODELS
# ============================================================

class DatasetRecord(BaseModel):
    dataset_id: str
    name: str
    modality: ModalityName
    description: str

    subjects: int = Field(ge=0)
    records: int = Field(ge=0)
    size_gb: float = Field(ge=0)

    status: DatasetStatus

    source: str
    version: str
    last_updated: str

    quality_score: float = Field(
        ge=0.0,
        le=1.0,
    )

    missingness_percent: float = Field(
        ge=0.0,
        le=100.0,
    )


class DatasetSummary(BaseModel):
    total_datasets: int

    ready_datasets: int
    pending_datasets: int
    processing_datasets: int

    unique_subjects: int

    total_records: int
    total_storage_gb: float

    mri_records: int
    eeg_records: int
    genomics_records: int
    proteomics_records: int
    behavior_records: int


class DatasetRegistryResponse(BaseModel):
    summary: DatasetSummary
    datasets: list[DatasetRecord]


class DatasetDetailResponse(BaseModel):
    dataset: DatasetRecord

    fields: list[str]

    linked_modules: list[str]

    sample_statistics: dict[
        str,
        float | int | str,
    ]


class SubjectRecord(BaseModel):
    subject_id: str
    age: int

    sex: Literal[
        "Female",
        "Male",
        "Other",
    ]

    visits: int

    available_modalities: list[
        ModalityName
    ]

    resilience_coefficient: float = Field(
        ge=0.0,
        le=1.0,
    )

    status: SubjectStatus


class SubjectRegistryResponse(BaseModel):
    total_subjects: int

    page: int
    page_size: int
    total_pages: int

    subjects: list[SubjectRecord]


class ModalitySummary(BaseModel):
    modality: ModalityName

    dataset_count: int
    total_subjects: int
    total_records: int

    total_storage_gb: float
    average_quality: float


class PlatformAnalyticsResponse(BaseModel):
    total_subjects: int
    total_datasets: int
    total_records: int
    total_storage_gb: float

    modalities: list[
        ModalitySummary
    ]


# ============================================================
# LARGE SYNTHETIC RESEARCH REGISTRY
# ============================================================

TOTAL_SYNTHETIC_SUBJECTS = 482_750


DATASET_NAMES: dict[
    ModalityName,
    list[str],
] = {
    "MRI": [
        "Structural T1 Cohort",
        "Cortical Thickness Registry",
        "Hippocampal Volumetry Cohort",
        "White Matter Morphometry",
        "Super-Ager Imaging Cohort",
        "Longitudinal MRI Archive",
        "Regional Volume Atlas",
        "Subcortical Structure Panel",
    ],

    "EEG": [
        "Resting-State EEG Archive",
        "Cognitive Task EEG",
        "Spectral Dynamics Registry",
        "Connectivity Dataset",
        "Neural Complexity Archive",
        "Sleep EEG Cohort",
        "Event-Related Potential Bank",
        "High-Density EEG Pilot",
    ],

    "Genomics": [
        "SNP Marker Panel",
        "APOE Risk Marker Cohort",
        "Polygenic Risk Dataset",
        "Whole-Genome Research Set",
        "Resilience Variant Registry",
        "Rare Variant Cohort",
        "Epigenetic Marker Registry",
        "Gene Expression Summary Bank",
    ],

    "Proteomics": [
        "Plasma Proteomics Cohort",
        "CSF Biomarker Registry",
        "SomaScan Proteomic Panel",
        "Olink Biomarker Panel",
        "Inflammatory Protein Registry",
        "Longitudinal Proteomic Series",
        "Neurodegeneration Protein Panel",
        "Metabolic Protein Registry",
    ],

    "Behavior": [
        "MMSE Registry",
        "ADAS-Cog Archive",
        "Memory Recall Battery",
        "Executive Function Battery",
        "Reaction-Time Registry",
        "Longitudinal Cognitive Assessment",
        "Language Performance Dataset",
        "Functional Independence Registry",
    ],
}


MODALITY_CODES: dict[
    ModalityName,
    str,
] = {
    "MRI": "MRI",
    "EEG": "EEG",
    "Genomics": "GEN",
    "Proteomics": "PROT",
    "Behavior": "BEH",
}


MODALITY_DESCRIPTIONS: dict[
    ModalityName,
    str,
] = {
    "MRI":
        "Structural neuroimaging and morphometric research features.",

    "EEG":
        "Electrophysiological signals, connectivity and neural complexity features.",

    "Genomics":
        "Genetic, genomic and resilience-associated molecular markers.",

    "Proteomics":
        "Protein biomarker measurements for multimodal resilience analysis.",

    "Behavior":
        "Longitudinal cognitive and behavioral assessment records.",
}


MODALITY_SOURCES: dict[
    ModalityName,
    str,
] = {
    "MRI":
        "Neuroimaging Research Warehouse",

    "EEG":
        "Neural Signal Research Archive",

    "Genomics":
        "Genomics Research Store",

    "Proteomics":
        "Proteomics Research Store",

    "Behavior":
        "Cognitive Assessment Registry",
}


BASE_SUBJECT_COUNTS: dict[
    ModalityName,
    int,
] = {
    "MRI": 128_000,
    "EEG": 96_000,
    "Genomics": 84_000,
    "Proteomics": 71_000,
    "Behavior": 142_000,
}


BASE_RECORD_COUNTS: dict[
    ModalityName,
    int,
] = {
    "MRI": 642_000,
    "EEG": 512_000,
    "Genomics": 1_420_000,
    "Proteomics": 1_160_000,
    "Behavior": 812_000,
}


BASE_STORAGE_GB: dict[
    ModalityName,
    float,
] = {
    "MRI": 8420.0,
    "EEG": 1860.0,
    "Genomics": 1940.0,
    "Proteomics": 780.0,
    "Behavior": 58.0,
}


# ============================================================
# BUILD 40 DATASETS
# ============================================================

def build_dataset_registry() -> list[DatasetRecord]:
    datasets: list[
        DatasetRecord
    ] = []

    modalities: list[
        ModalityName
    ] = [
        "MRI",
        "EEG",
        "Genomics",
        "Proteomics",
        "Behavior",
    ]

    for modality in modalities:
        names = DATASET_NAMES[
            modality
        ]

        for index, name in enumerate(
            names,
            start=1,
        ):
            scale = (
                1.0
                - (
                    (index - 1)
                    * 0.075
                )
            )

            subjects = max(
                18_000,
                int(
                    BASE_SUBJECT_COUNTS[
                        modality
                    ]
                    * scale
                ),
            )

            records = max(
                subjects,
                int(
                    BASE_RECORD_COUNTS[
                        modality
                    ]
                    * scale
                ),
            )

            storage_gb = round(
                BASE_STORAGE_GB[
                    modality
                ]
                * scale,
                2,
            )

            if index in {
                5,
                7,
            }:
                status: DatasetStatus = (
                    "processing"
                )

            elif index == 8:
                status = "pending"

            else:
                status = "ready"

            quality_score = max(
                0.79,
                round(
                    0.96
                    - (
                        index
                        * 0.012
                    ),
                    3,
                ),
            )

            missingness = round(
                1.2
                + (
                    index
                    * 0.65
                ),
                2,
            )

            code = (
                MODALITY_CODES[
                    modality
                ]
            )

            dataset_id = (
                f"DS-{code}-{index:03d}"
            )

            datasets.append(
                DatasetRecord(
                    dataset_id=
                        dataset_id,

                    name=
                        name,

                    modality=
                        modality,

                    description=
                        MODALITY_DESCRIPTIONS[
                            modality
                        ],

                    subjects=
                        subjects,

                    records=
                        records,

                    size_gb=
                        storage_gb,

                    status=
                        status,

                    source=
                        MODALITY_SOURCES[
                            modality
                        ],

                    version=
                        f"v{1 + index // 4}.{index}",

                    last_updated=(
                        "Current research snapshot"
                        if status == "ready"
                        else (
                            "Processing current batch"
                            if status == "processing"
                            else
                            "Pending validation"
                        )
                    ),

                    quality_score=
                        quality_score,

                    missingness_percent=
                        missingness,
                )
            )

    return datasets


DATASETS = build_dataset_registry()


# ============================================================
# SCHEMAS
# ============================================================

SCHEMAS: dict[
    ModalityName,
    list[str],
] = {
    "MRI": [
        "subject_id",
        "visit_id",
        "scan_date",
        "cortical_thickness",
        "hippocampal_volume",
        "white_matter_volume",
        "regional_volume",
        "scan_quality",
    ],

    "EEG": [
        "subject_id",
        "visit_id",
        "recording_id",
        "channel",
        "frequency_band",
        "spectral_power",
        "connectivity_index",
        "complexity_index",
    ],

    "Genomics": [
        "subject_id",
        "marker_id",
        "chromosome",
        "allele",
        "genotype",
        "variant_score",
        "polygenic_score",
    ],

    "Proteomics": [
        "subject_id",
        "visit_id",
        "protein_id",
        "concentration",
        "normalized_expression",
        "assay_platform",
    ],

    "Behavior": [
        "subject_id",
        "visit_id",
        "assessment",
        "score",
        "memory_index",
        "executive_index",
        "reaction_time",
    ],
}


# ============================================================
# HELPERS
# ============================================================

def get_dataset_or_404(
    dataset_id: str,
) -> DatasetRecord:
    for dataset in DATASETS:
        if (
            dataset.dataset_id
            == dataset_id
        ):
            return dataset

    raise HTTPException(
        status_code=404,
        detail=(
            f"Dataset '{dataset_id}' "
            "was not found."
        ),
    )


def generate_subject(
    index: int,
) -> SubjectRecord:
    subject_id = (
        f"NS-{index:06d}"
    )

    age = (
        55
        + (
            index % 31
        )
    )

    sex_index = (
        index % 3
    )

    if sex_index == 0:
        sex: Literal[
            "Female",
            "Male",
            "Other",
        ] = "Female"

    elif sex_index == 1:
        sex = "Male"

    else:
        sex = "Other"

    visits = (
        1
        + (
            index % 7
        )
    )

    modalities: list[
        ModalityName
    ] = [
        "Behavior",
    ]

    if index % 2 == 0:
        modalities.append(
            "MRI"
        )

    if index % 3 == 0:
        modalities.append(
            "EEG"
        )

    if index % 5 == 0:
        modalities.append(
            "Genomics"
        )

    if index % 7 == 0:
        modalities.append(
            "Proteomics"
        )

    rho = min(
        0.92,
        (
            0.48
            + (
                index
                % 35
            )
            / 100
        ),
    )

    status_value = (
        index % 10
    )

    if status_value <= 6:
        status: SubjectStatus = (
            "active"
        )

    elif status_value <= 8:
        status = "review"

    else:
        status = "incomplete"

    return SubjectRecord(
        subject_id=
            subject_id,

        age=
            age,

        sex=
            sex,

        visits=
            visits,

        available_modalities=
            modalities,

        resilience_coefficient=
            round(
                rho,
                2,
            ),

        status=
            status,
    )


def modality_records(
    modality: ModalityName,
) -> int:
    return sum(
        dataset.records
        for dataset
        in DATASETS
        if dataset.modality
        == modality
    )


# ============================================================
# DATASET REGISTRY
# ============================================================

@router.get(
    "/registry",
    response_model=DatasetRegistryResponse,
)
def get_dataset_registry():
    ready_count = sum(
        1
        for dataset
        in DATASETS
        if dataset.status
        == "ready"
    )

    pending_count = sum(
        1
        for dataset
        in DATASETS
        if dataset.status
        == "pending"
    )

    processing_count = sum(
        1
        for dataset
        in DATASETS
        if dataset.status
        == "processing"
    )

    total_records = sum(
        dataset.records
        for dataset
        in DATASETS
    )

    total_storage = sum(
        dataset.size_gb
        for dataset
        in DATASETS
    )

    return DatasetRegistryResponse(
        summary=DatasetSummary(
            total_datasets=
                len(DATASETS),

            ready_datasets=
                ready_count,

            pending_datasets=
                pending_count,

            processing_datasets=
                processing_count,

            unique_subjects=
                TOTAL_SYNTHETIC_SUBJECTS,

            total_records=
                total_records,

            total_storage_gb=
                round(
                    total_storage,
                    2,
                ),

            mri_records=
                modality_records(
                    "MRI"
                ),

            eeg_records=
                modality_records(
                    "EEG"
                ),

            genomics_records=
                modality_records(
                    "Genomics"
                ),

            proteomics_records=
                modality_records(
                    "Proteomics"
                ),

            behavior_records=
                modality_records(
                    "Behavior"
                ),
        ),

        datasets=
            DATASETS,
    )


# ============================================================
# ANALYTICS
# ============================================================

@router.get(
    "/analytics",
    response_model=
        PlatformAnalyticsResponse,
)
def get_dataset_analytics():
    modalities: list[
        ModalityName
    ] = [
        "MRI",
        "EEG",
        "Genomics",
        "Proteomics",
        "Behavior",
    ]

    summaries: list[
        ModalitySummary
    ] = []

    for modality in modalities:
        items = [
            dataset
            for dataset
            in DATASETS
            if dataset.modality
            == modality
        ]

        summaries.append(
            ModalitySummary(
                modality=
                    modality,

                dataset_count=
                    len(items),

                total_subjects=
                    sum(
                        item.subjects
                        for item
                        in items
                    ),

                total_records=
                    sum(
                        item.records
                        for item
                        in items
                    ),

                total_storage_gb=
                    round(
                        sum(
                            item.size_gb
                            for item
                            in items
                        ),
                        2,
                    ),

                average_quality=
                    round(
                        sum(
                            item.quality_score
                            for item
                            in items
                        )
                        / len(items),
                        3,
                    ),
            )
        )

    return PlatformAnalyticsResponse(
        total_subjects=
            TOTAL_SYNTHETIC_SUBJECTS,

        total_datasets=
            len(DATASETS),

        total_records=
            sum(
                item.records
                for item
                in DATASETS
            ),

        total_storage_gb=
            round(
                sum(
                    item.size_gb
                    for item
                    in DATASETS
                ),
                2,
            ),

        modalities=
            summaries,
    )


# ============================================================
# SUBJECT REGISTRY
# ============================================================

@router.get(
    "/subjects/registry",
    response_model=
        SubjectRegistryResponse,
)
def get_subject_registry(
    page: int = Query(
        default=1,
        ge=1,
    ),

    page_size: int = Query(
        default=25,
        ge=5,
        le=100,
    ),

    search: str | None = Query(
        default=None,
    ),

    status: SubjectStatus | None = Query(
        default=None,
    ),

    modality: ModalityName | None = Query(
        default=None,
    ),

    sort_direction: SortDirection = Query(
        default="asc",
    ),
):
    if search:
        normalized = (
            search
            .strip()
            .upper()
        )

        if normalized.startswith(
            "NS-"
        ):
            try:
                index = int(
                    normalized.replace(
                        "NS-",
                        "",
                    )
                )
            except ValueError:
                index = -1

            if (
                1
                <= index
                <= TOTAL_SYNTHETIC_SUBJECTS
            ):
                subject = generate_subject(
                    index
                )

                status_match = (
                    status is None
                    or subject.status
                    == status
                )

                modality_match = (
                    modality is None
                    or modality
                    in subject.available_modalities
                )

                if (
                    status_match
                    and modality_match
                ):
                    return SubjectRegistryResponse(
                        total_subjects=1,
                        page=1,
                        page_size=page_size,
                        total_pages=1,
                        subjects=[
                            subject
                        ],
                    )

        return SubjectRegistryResponse(
            total_subjects=0,
            page=1,
            page_size=page_size,
            total_pages=1,
            subjects=[],
        )

    matched: list[
        SubjectRecord
    ] = []

    required_end = (
        page
        * page_size
    )

    index = 1

    scan_limit = min(
        TOTAL_SYNTHETIC_SUBJECTS,
        max(
            required_end
            * 12,
            10_000,
        ),
    )

    while (
        index <= scan_limit
        and len(matched)
        < required_end
    ):
        subject = generate_subject(
            index
        )

        if (
            status is not None
            and subject.status
            != status
        ):
            index += 1
            continue

        if (
            modality is not None
            and modality
            not in subject.available_modalities
        ):
            index += 1
            continue

        matched.append(
            subject
        )

        index += 1

    start = (
        page - 1
    ) * page_size

    end = (
        start
        + page_size
    )

    subjects = matched[
        start:end
    ]

    if (
        sort_direction
        == "desc"
    ):
        subjects.reverse()

    total_subjects = (
        TOTAL_SYNTHETIC_SUBJECTS
    )

    total_pages = math.ceil(
        total_subjects
        / page_size
    )

    return SubjectRegistryResponse(
        total_subjects=
            total_subjects,

        page=
            page,

        page_size=
            page_size,

        total_pages=
            total_pages,

        subjects=
            subjects,
    )


# ============================================================
# DATASET DETAIL
# ============================================================

@router.get(
    "/{dataset_id}",
    response_model=
        DatasetDetailResponse,
)
def get_dataset_detail(
    dataset_id: str,
):
    dataset = (
        get_dataset_or_404(
            dataset_id
        )
    )

    record_density = (
        dataset.records
        / dataset.subjects
        if dataset.subjects
        else 0
    )

    return DatasetDetailResponse(
        dataset=
            dataset,

        fields=
            SCHEMAS[
                dataset.modality
            ],

        linked_modules=[
            "Digital Twin",
            "Fusion Lab",
            "Brain Workspace",
        ],

        sample_statistics={
            "estimated_subject_coverage":
                dataset.subjects,

            "record_density":
                round(
                    record_density,
                    2,
                ),

            "quality_percent":
                round(
                    dataset.quality_score
                    * 100,
                    1,
                ),

            "missingness_percent":
                dataset.missingness_percent,

            "storage_gb":
                dataset.size_gb,

            "registry_status":
                dataset.status,
        },
    )