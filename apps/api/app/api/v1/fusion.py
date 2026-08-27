import math
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field


router = APIRouter(
    prefix="/fusion",
    tags=["Fusion Lab"],
)


# ============================================================
# TYPES
# ============================================================

ModalityName = Literal[
    "MRI",
    "EEG",
    "Genomics",
    "Proteomics",
    "Behavior",
]


FusionStateName = Literal[
    "Stable",
    "Reduced",
    "Idle",
]


RiskState = Literal[
    "Low",
    "Moderate",
    "High",
]


# ============================================================
# MODELS
# ============================================================


class FusionModality(BaseModel):
    name: ModalityName
    description: str
    status: Literal[
        "ready",
        "pending",
        "unavailable",
    ]
    baseline_contribution_percent: float = Field(
        ge=0,
        le=100,
    )


class LatentMetrics(BaseModel):
    energy: float = Field(
        ge=0,
        le=1,
    )
    coherence: float = Field(
        ge=0,
        le=1,
    )
    entropy: float = Field(
        ge=0,
        le=1,
    )


class FusionStateResponse(BaseModel):
    subject_id: str
    model_name: str
    latent_dimensions: int
    visualization_dimensions: int
    fusion_method: str

    baseline_rho: float
    baseline_confidence: float

    modalities: list[FusionModality]

    baseline_latent_vector: list[float]
    baseline_latent_metrics: LatentMetrics


class FusionRunRequest(BaseModel):
    active_modalities: list[ModalityName]


class ContributionResult(BaseModel):
    name: ModalityName
    contribution_percent: float


class FusionRunResponse(BaseModel):
    subject_id: str

    active_modalities: list[ModalityName]
    active_count: int

    latent_dimensions: int
    visualization_dimensions: int

    fusion_state: FusionStateName

    predicted_rho: float
    confidence: float
    risk_state: RiskState

    contributions: list[
        ContributionResult
    ]

    latent_vector: list[float]
    latent_metrics: LatentMetrics


class AblationRequest(BaseModel):
    excluded_modality: ModalityName


class AblationResponse(BaseModel):
    excluded_modality: ModalityName

    baseline_rho: float
    ablated_rho: float

    rho_change: float
    rho_change_percent: float

    baseline_confidence: float
    ablated_confidence: float

    latent_shift: float

    interpretation: str


# ============================================================
# CONFIGURATION
# ============================================================

SUBJECT_ID = "NS-001"

MODEL_NAME = (
    "Neuro-Silicon Multimodal Fusion Engine"
)

LATENT_DIMENSIONS = 256

VISUALIZATION_DIMENSIONS = 32

FUSION_METHOD = (
    "Weighted Latent Feature Fusion"
)

BASELINE_RHO = 0.74

BASELINE_CONFIDENCE = 0.91


MODALITY_CONFIG = {
    "MRI": {
        "description":
            "Structural neuroimaging features",
        "status":
            "ready",
        "contribution":
            0.31,
        "phase":
            0.35,
    },

    "EEG": {
        "description":
            "Electrophysiological dynamics",
        "status":
            "ready",
        "contribution":
            0.19,
        "phase":
            1.15,
    },

    "Genomics": {
        "description":
            "Genetic resilience markers",
        "status":
            "pending",
        "contribution":
            0.14,
        "phase":
            2.05,
    },

    "Proteomics": {
        "description":
            "Protein biomarker signatures",
        "status":
            "pending",
        "contribution":
            0.23,
        "phase":
            2.85,
    },

    "Behavior": {
        "description":
            "Cognitive and behavioral performance",
        "status":
            "ready",
        "contribution":
            0.13,
        "phase":
            3.55,
    },
}


ALL_MODALITIES: list[ModalityName] = [
    "MRI",
    "EEG",
    "Genomics",
    "Proteomics",
    "Behavior",
]


# ============================================================
# HELPERS
# ============================================================


def normalize_modalities(
    modalities: list[
        ModalityName
    ],
) -> list[
    ModalityName
]:
    return list(
        dict.fromkeys(
            modalities
        )
    )


def get_risk_state(
    rho: float,
) -> RiskState:
    if rho >= 0.70:
        return "Low"

    if rho >= 0.50:
        return "Moderate"

    return "High"


def get_fusion_state_name(
    active_count: int,
) -> FusionStateName:
    if active_count >= 3:
        return "Stable"

    if active_count > 0:
        return "Reduced"

    return "Idle"


def calculate_contributions(
    modalities: list[
        ModalityName
    ],
) -> list[
    ContributionResult
]:
    if not modalities:
        return []

    total = sum(
        MODALITY_CONFIG[
            modality
        ]["contribution"]
        for modality
        in modalities
    )

    if total <= 0:
        return []

    return [
        ContributionResult(
            name=modality,
            contribution_percent=
                round(
                    (
                        MODALITY_CONFIG[
                            modality
                        ]["contribution"]
                        / total
                    )
                    * 100,
                    2,
                ),
        )
        for modality
        in modalities
    ]


def generate_latent_vector(
    active_modalities: list[
        ModalityName
    ],
) -> list[float]:
    """
    Deterministic Phase 3B latent fingerprint.

    This is a research-demo latent representation,
    not a trained neural embedding.

    Future model phases can replace this function
    with actual encoder outputs.
    """

    if not active_modalities:
        return [
            0.0
            for _ in range(
                VISUALIZATION_DIMENSIONS
            )
        ]

    total_weight = sum(
        MODALITY_CONFIG[
            modality
        ]["contribution"]
        for modality
        in active_modalities
    )

    values: list[float] = []

    for index in range(
        VISUALIZATION_DIMENSIONS
    ):
        combined = 0.0

        for modality in active_modalities:
            config = (
                MODALITY_CONFIG[
                    modality
                ]
            )

            weight = (
                config[
                    "contribution"
                ]
                / total_weight
            )

            phase = config[
                "phase"
            ]

            frequency = (
                0.19
                + (
                    phase
                    * 0.035
                )
            )

            signal = (
                math.sin(
                    (
                        index + 1
                    )
                    * frequency
                    + phase
                )
                * 0.68
                +
                math.cos(
                    (
                        index + 1
                    )
                    * 0.11
                    + phase
                    * 0.75
                )
                * 0.32
            )

            combined += (
                weight
                * signal
            )

        combined = max(
            -1.0,
            min(
                1.0,
                combined,
            ),
        )

        values.append(
            round(
                combined,
                4,
            )
        )

    return values


def calculate_latent_metrics(
    vector: list[float],
) -> LatentMetrics:
    if not vector:
        return LatentMetrics(
            energy=0.0,
            coherence=0.0,
            entropy=0.0,
        )

    absolute_values = [
        abs(value)
        for value
        in vector
    ]

    energy = (
        sum(
            absolute_values
        )
        / len(
            absolute_values
        )
    )

    mean = (
        sum(vector)
        / len(vector)
    )

    variance = (
        sum(
            (
                value
                - mean
            )
            ** 2
            for value
            in vector
        )
        / len(vector)
    )

    standard_deviation = (
        math.sqrt(
            variance
        )
    )

    coherence = max(
        0.0,
        min(
            1.0,
            1.0
            - (
                standard_deviation
                * 0.65
            ),
        ),
    )

    magnitude_total = sum(
        absolute_values
    )

    if magnitude_total <= 0:
        entropy = 0.0
    else:
        probabilities = [
            value
            / magnitude_total
            for value
            in absolute_values
            if value > 0
        ]

        raw_entropy = -sum(
            probability
            * math.log(
                probability
            )
            for probability
            in probabilities
        )

        max_entropy = math.log(
            len(
                absolute_values
            )
        )

        entropy = (
            raw_entropy
            / max_entropy
            if max_entropy > 0
            else 0.0
        )

    return LatentMetrics(
        energy=round(
            energy,
            3,
        ),
        coherence=round(
            coherence,
            3,
        ),
        entropy=round(
            entropy,
            3,
        ),
    )


def calculate_fusion_output(
    active_modalities: list[
        ModalityName
    ],
) -> tuple[
    float,
    float,
]:
    if not active_modalities:
        return (
            0.0,
            0.0,
        )

    excluded_modalities = [
        modality
        for modality
        in ALL_MODALITIES
        if modality
        not in active_modalities
    ]

    missing_weight = sum(
        MODALITY_CONFIG[
            modality
        ]["contribution"]
        for modality
        in excluded_modalities
    )

    rho_penalty = (
        missing_weight
        * 0.28
    )

    confidence_penalty = (
        missing_weight
        * 0.34
    )

    predicted_rho = max(
        0.0,
        BASELINE_RHO
        - rho_penalty,
    )

    confidence = max(
        0.0,
        BASELINE_CONFIDENCE
        - confidence_penalty,
    )

    return (
        round(
            predicted_rho,
            3,
        ),
        round(
            confidence,
            3,
        ),
    )


def calculate_latent_shift(
    baseline_vector: list[float],
    ablated_vector: list[float],
) -> float:
    if (
        not baseline_vector
        or not ablated_vector
    ):
        return 0.0

    count = min(
        len(
            baseline_vector
        ),
        len(
            ablated_vector
        ),
    )

    shift = (
        sum(
            abs(
                baseline_vector[
                    index
                ]
                -
                ablated_vector[
                    index
                ]
            )
            for index
            in range(
                count
            )
        )
        / count
    )

    return round(
        shift,
        3,
    )


# ============================================================
# GET STATE
# ============================================================


@router.get(
    "/state",
    response_model=
        FusionStateResponse,
)
def get_fusion_state():
    modalities = [
        FusionModality(
            name=modality,
            description=
                MODALITY_CONFIG[
                    modality
                ]["description"],
            status=
                MODALITY_CONFIG[
                    modality
                ]["status"],
            baseline_contribution_percent=
                round(
                    MODALITY_CONFIG[
                        modality
                    ]["contribution"]
                    * 100,
                    2,
                ),
        )
        for modality
        in ALL_MODALITIES
    ]

    baseline_vector = (
        generate_latent_vector(
            ALL_MODALITIES
        )
    )

    baseline_metrics = (
        calculate_latent_metrics(
            baseline_vector
        )
    )

    return FusionStateResponse(
        subject_id=
            SUBJECT_ID,

        model_name=
            MODEL_NAME,

        latent_dimensions=
            LATENT_DIMENSIONS,

        visualization_dimensions=
            VISUALIZATION_DIMENSIONS,

        fusion_method=
            FUSION_METHOD,

        baseline_rho=
            BASELINE_RHO,

        baseline_confidence=
            BASELINE_CONFIDENCE,

        modalities=
            modalities,

        baseline_latent_vector=
            baseline_vector,

        baseline_latent_metrics=
            baseline_metrics,
    )


# ============================================================
# RUN FUSION
# ============================================================


@router.post(
    "/run",
    response_model=
        FusionRunResponse,
)
def run_fusion(
    request:
        FusionRunRequest,
):
    active_modalities = (
        normalize_modalities(
            request.active_modalities
        )
    )

    (
        predicted_rho,
        confidence,
    ) = calculate_fusion_output(
        active_modalities
    )

    contributions = (
        calculate_contributions(
            active_modalities
        )
    )

    latent_vector = (
        generate_latent_vector(
            active_modalities
        )
    )

    latent_metrics = (
        calculate_latent_metrics(
            latent_vector
        )
    )

    return FusionRunResponse(
        subject_id=
            SUBJECT_ID,

        active_modalities=
            active_modalities,

        active_count=
            len(
                active_modalities
            ),

        latent_dimensions=
            LATENT_DIMENSIONS,

        visualization_dimensions=
            VISUALIZATION_DIMENSIONS,

        fusion_state=
            get_fusion_state_name(
                len(
                    active_modalities
                )
            ),

        predicted_rho=
            predicted_rho,

        confidence=
            confidence,

        risk_state=
            get_risk_state(
                predicted_rho
            ),

        contributions=
            contributions,

        latent_vector=
            latent_vector,

        latent_metrics=
            latent_metrics,
    )


# ============================================================
# ABLATION
# ============================================================


@router.post(
    "/ablation",
    response_model=
        AblationResponse,
)
def run_ablation(
    request:
        AblationRequest,
):
    remaining_modalities = [
        modality
        for modality
        in ALL_MODALITIES
        if modality
        != request.excluded_modality
    ]

    (
        ablated_rho,
        ablated_confidence,
    ) = calculate_fusion_output(
        remaining_modalities
    )

    rho_change = (
        ablated_rho
        - BASELINE_RHO
    )

    rho_change_percent = (
        (
            rho_change
            / BASELINE_RHO
        )
        * 100
    )

    baseline_vector = (
        generate_latent_vector(
            ALL_MODALITIES
        )
    )

    ablated_vector = (
        generate_latent_vector(
            remaining_modalities
        )
    )

    latent_shift = (
        calculate_latent_shift(
            baseline_vector,
            ablated_vector,
        )
    )

    absolute_impact = abs(
        rho_change_percent
    )

    if absolute_impact >= 6:
        interpretation = (
            "High-impact modality. "
            "Its removal substantially alters "
            "the multimodal resilience estimate "
            "and latent representation."
        )

    elif absolute_impact >= 3:
        interpretation = (
            "Moderate-impact modality. "
            "Its removal causes a measurable "
            "change in resilience and latent state."
        )

    else:
        interpretation = (
            "Lower-impact modality under the "
            "current fusion configuration."
        )

    return AblationResponse(
        excluded_modality=
            request.excluded_modality,

        baseline_rho=
            BASELINE_RHO,

        ablated_rho=
            ablated_rho,

        rho_change=
            round(
                rho_change,
                3,
            ),

        rho_change_percent=
            round(
                rho_change_percent,
                2,
            ),

        baseline_confidence=
            BASELINE_CONFIDENCE,

        ablated_confidence=
            ablated_confidence,

        latent_shift=
            latent_shift,

        interpretation=
            interpretation,
    )