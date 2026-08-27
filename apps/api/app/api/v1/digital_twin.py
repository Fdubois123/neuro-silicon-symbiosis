from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field


router = APIRouter(
    prefix="/digital-twin",
    tags=["Digital Twin"],
)


# ============================================================
# DATA MODELS
# ============================================================


class SubjectProfile(BaseModel):
    subject_id: str
    display_name: str
    age: int
    sex: Literal["Female", "Male", "Other"]
    visits: int
    observation_window_months: int
    cognitive_state: str
    diagnosis: str
    last_updated: str


class ResilienceState(BaseModel):
    coefficient: float = Field(ge=0.0, le=1.0)
    index_percent: int = Field(ge=0, le=100)
    classification: str
    complexity: float = Field(ge=0.0, le=1.0)
    confidence: float = Field(ge=0.0, le=1.0)
    risk: Literal["Low", "Moderate", "High"]


class TrajectoryPoint(BaseModel):
    label: str
    month: int
    resilience_index: int


class ModalityState(BaseModel):
    key: str
    name: str
    description: str
    status: Literal["ready", "pending", "unavailable"]


class TwinPrediction(BaseModel):
    predicted_coefficient: float = Field(
        ge=0.0,
        le=1.0,
    )
    trajectory_percent: float
    risk_state: Literal[
        "Low",
        "Moderate",
        "High",
    ]
    confidence: float = Field(
        ge=0.0,
        le=1.0,
    )


class DigitalTwinSubjectResponse(BaseModel):
    subject: SubjectProfile
    resilience: ResilienceState
    trajectory: list[TrajectoryPoint]
    modalities: list[ModalityState]
    prediction: TwinPrediction


class SimulationRequest(BaseModel):
    scenario: Literal[
        "baseline",
        "accelerated_decline",
        "resilience_intervention",
        "high_stress",
    ] = "baseline"

    horizon_months: Literal[
        6,
        12,
        24,
        36,
    ] = 12


class SimulationResponse(BaseModel):
    scenario: str
    horizon_months: int
    baseline_coefficient: float
    predicted_coefficient: float
    change_percent: float
    risk_state: Literal[
        "Low",
        "Moderate",
        "High",
    ]
    confidence: float


# ============================================================
# PHASE 3 RESEARCH SUBJECT
# ============================================================

SUBJECT = SubjectProfile(
    subject_id="NS-001",
    display_name="Research Subject 001",
    age=72,
    sex="Female",
    visits=5,
    observation_window_months=24,
    cognitive_state="Stable",
    diagnosis="Research Cohort",
    last_updated="Current research snapshot",
)


RESILIENCE = ResilienceState(
    coefficient=0.74,
    index_percent=74,
    classification="Moderate-to-high resilience",
    complexity=0.66,
    confidence=0.91,
    risk="Low",
)


TRAJECTORY = [
    TrajectoryPoint(
        label="T-24M",
        month=-24,
        resilience_index=62,
    ),
    TrajectoryPoint(
        label="T-18M",
        month=-18,
        resilience_index=64,
    ),
    TrajectoryPoint(
        label="T-12M",
        month=-12,
        resilience_index=67,
    ),
    TrajectoryPoint(
        label="T-6M",
        month=-6,
        resilience_index=71,
    ),
    TrajectoryPoint(
        label="Current",
        month=0,
        resilience_index=74,
    ),
]


MODALITIES = [
    ModalityState(
        key="mri",
        name="MRI",
        description="Structural neuroimaging",
        status="ready",
    ),
    ModalityState(
        key="eeg",
        name="EEG",
        description="Electrophysiology",
        status="ready",
    ),
    ModalityState(
        key="genomics",
        name="Genomics",
        description="Genetic markers",
        status="pending",
    ),
    ModalityState(
        key="proteomics",
        name="Proteomics",
        description="Protein biomarkers",
        status="pending",
    ),
    ModalityState(
        key="behavior",
        name="Behavior",
        description="Cognitive performance",
        status="ready",
    ),
]


PREDICTION = TwinPrediction(
    predicted_coefficient=0.76,
    trajectory_percent=2.7,
    risk_state="Low",
    confidence=0.91,
)


# ============================================================
# SUBJECT ENDPOINT
# ============================================================


@router.get(
    "/subject",
    response_model=DigitalTwinSubjectResponse,
)
def get_digital_twin_subject():
    """
    Return the Phase 3 Digital Twin research subject.

    This endpoint provides the frontend with one consistent
    payload containing:

    - subject metadata
    - resilience state
    - longitudinal trajectory
    - multimodal availability
    - baseline prediction

    The current values are deterministic research-demo data.
    Later phases can replace this source with database records,
    uploaded datasets and trained-model inference.
    """

    return DigitalTwinSubjectResponse(
        subject=SUBJECT,
        resilience=RESILIENCE,
        trajectory=TRAJECTORY,
        modalities=MODALITIES,
        prediction=PREDICTION,
    )


# ============================================================
# SIMULATION ENGINE
# ============================================================


@router.post(
    "/simulate",
    response_model=SimulationResponse,
)
def simulate_digital_twin(
    request: SimulationRequest,
):
    """
    Run a deterministic Phase 3 Digital Twin simulation.

    This is intentionally not represented as a trained clinical
    prediction model. It provides the application architecture
    required for future model integration.
    """

    baseline = RESILIENCE.coefficient

    scenario_effects = {
        "baseline": 0.02,
        "accelerated_decline": -0.10,
        "resilience_intervention": 0.08,
        "high_stress": -0.06,
    }

    annual_effect = scenario_effects[
        request.scenario
    ]

    horizon_factor = (
        request.horizon_months / 12
    )

    predicted = baseline + (
        annual_effect * horizon_factor
    )

    predicted = max(
        0.0,
        min(1.0, predicted),
    )

    predicted = round(predicted, 3)

    change_percent = round(
        (
            (predicted - baseline)
            / baseline
        )
        * 100,
        1,
    )

    if predicted >= 0.70:
        risk_state = "Low"
    elif predicted >= 0.50:
        risk_state = "Moderate"
    else:
        risk_state = "High"

    confidence_penalty = (
        max(
            0,
            request.horizon_months - 12,
        )
        / 100
    )

    confidence = round(
        max(
            0.65,
            RESILIENCE.confidence
            - confidence_penalty,
        ),
        2,
    )

    return SimulationResponse(
        scenario=request.scenario,
        horizon_months=request.horizon_months,
        baseline_coefficient=baseline,
        predicted_coefficient=predicted,
        change_percent=change_percent,
        risk_state=risk_state,
        confidence=confidence,
    )