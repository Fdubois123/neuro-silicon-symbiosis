from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field


router = APIRouter(
    prefix="/brain-explorer",
    tags=["Brain Explorer"],
)


# ============================================================
# TYPES
# ============================================================

Hemisphere = Literal[
    "left",
    "right",
    "bilateral",
]

RegionCategory = Literal[
    "cortical",
    "subcortical",
    "limbic",
    "cerebellar",
]

RegionStatus = Literal[
    "stable",
    "watch",
    "elevated",
]

OverlayMode = Literal[
    "anatomy",
    "resilience",
    "complexity",
    "atrophy",
    "confidence",
]


# ============================================================
# MODELS
# ============================================================

class BrainRegion(BaseModel):
    region_id: str
    name: str
    hemisphere: Hemisphere
    category: RegionCategory

    description: str

    cortical_thickness_mm: float | None = None
    volume_mm3: float | None = None

    resilience_score: float = Field(
        ge=0.0,
        le=1.0,
    )

    complexity_score: float = Field(
        ge=0.0,
        le=1.0,
    )

    atrophy_index: float = Field(
        ge=0.0,
        le=1.0,
    )

    confidence: float = Field(
        ge=0.0,
        le=1.0,
    )

    status: RegionStatus


class BrainRegionListResponse(BaseModel):
    subject_id: str
    total_regions: int
    overlay_mode: OverlayMode
    regions: list[BrainRegion]


class BrainRegionDetailResponse(BaseModel):
    subject_id: str
    region: BrainRegion

    linked_modalities: list[str]

    longitudinal_change_percent: float

    interpretation: str


class BrainSummary(BaseModel):
    subject_id: str
    total_regions: int

    mean_resilience: float
    mean_complexity: float
    mean_atrophy: float
    mean_confidence: float

    stable_regions: int
    watch_regions: int
    elevated_regions: int


class BrainOverlayResponse(BaseModel):
    subject_id: str
    overlay_mode: OverlayMode

    min_value: float
    max_value: float
    mean_value: float

    values: dict[str, float]


# ============================================================
# RESEARCH SUBJECT
# ============================================================

DEFAULT_SUBJECT_ID = "NS-001"


# ============================================================
# REGION REGISTRY
# ============================================================

REGIONS: list[BrainRegion] = [
    BrainRegion(
        region_id="CTX-PFC-L",
        name="Prefrontal Cortex",
        hemisphere="left",
        category="cortical",
        description=(
            "Executive function, working memory and "
            "cognitive control region."
        ),
        cortical_thickness_mm=2.71,
        volume_mm3=42_800,
        resilience_score=0.78,
        complexity_score=0.74,
        atrophy_index=0.18,
        confidence=0.93,
        status="stable",
    ),

    BrainRegion(
        region_id="CTX-PFC-R",
        name="Prefrontal Cortex",
        hemisphere="right",
        category="cortical",
        description=(
            "Executive function, attention regulation "
            "and behavioral control region."
        ),
        cortical_thickness_mm=2.68,
        volume_mm3=42_100,
        resilience_score=0.76,
        complexity_score=0.72,
        atrophy_index=0.20,
        confidence=0.92,
        status="stable",
    ),

    BrainRegion(
        region_id="CTX-PAR-L",
        name="Parietal Cortex",
        hemisphere="left",
        category="cortical",
        description=(
            "Spatial integration, attention and "
            "multisensory processing region."
        ),
        cortical_thickness_mm=2.54,
        volume_mm3=38_600,
        resilience_score=0.73,
        complexity_score=0.69,
        atrophy_index=0.24,
        confidence=0.90,
        status="stable",
    ),

    BrainRegion(
        region_id="CTX-PAR-R",
        name="Parietal Cortex",
        hemisphere="right",
        category="cortical",
        description=(
            "Spatial attention and sensory integration region."
        ),
        cortical_thickness_mm=2.51,
        volume_mm3=38_100,
        resilience_score=0.71,
        complexity_score=0.68,
        atrophy_index=0.26,
        confidence=0.89,
        status="watch",
    ),

    BrainRegion(
        region_id="CTX-TEMP-L",
        name="Temporal Cortex",
        hemisphere="left",
        category="cortical",
        description=(
            "Memory, language and semantic processing region."
        ),
        cortical_thickness_mm=2.49,
        volume_mm3=36_900,
        resilience_score=0.69,
        complexity_score=0.65,
        atrophy_index=0.31,
        confidence=0.91,
        status="watch",
    ),

    BrainRegion(
        region_id="CTX-TEMP-R",
        name="Temporal Cortex",
        hemisphere="right",
        category="cortical",
        description=(
            "Auditory processing, recognition and memory support."
        ),
        cortical_thickness_mm=2.52,
        volume_mm3=37_200,
        resilience_score=0.72,
        complexity_score=0.67,
        atrophy_index=0.27,
        confidence=0.90,
        status="stable",
    ),

    BrainRegion(
        region_id="CTX-OCC-L",
        name="Occipital Cortex",
        hemisphere="left",
        category="cortical",
        description=(
            "Primary and associative visual processing region."
        ),
        cortical_thickness_mm=2.39,
        volume_mm3=29_800,
        resilience_score=0.81,
        complexity_score=0.76,
        atrophy_index=0.14,
        confidence=0.94,
        status="stable",
    ),

    BrainRegion(
        region_id="CTX-OCC-R",
        name="Occipital Cortex",
        hemisphere="right",
        category="cortical",
        description=(
            "Visual feature integration and visuospatial processing."
        ),
        cortical_thickness_mm=2.41,
        volume_mm3=30_100,
        resilience_score=0.80,
        complexity_score=0.75,
        atrophy_index=0.15,
        confidence=0.94,
        status="stable",
    ),

    BrainRegion(
        region_id="LIM-HIP-L",
        name="Hippocampus",
        hemisphere="left",
        category="limbic",
        description=(
            "Memory consolidation and spatial navigation structure."
        ),
        volume_mm3=3_420,
        resilience_score=0.62,
        complexity_score=0.59,
        atrophy_index=0.41,
        confidence=0.95,
        status="elevated",
    ),

    BrainRegion(
        region_id="LIM-HIP-R",
        name="Hippocampus",
        hemisphere="right",
        category="limbic",
        description=(
            "Memory consolidation and contextual learning structure."
        ),
        volume_mm3=3_510,
        resilience_score=0.65,
        complexity_score=0.61,
        atrophy_index=0.37,
        confidence=0.95,
        status="watch",
    ),

    BrainRegion(
        region_id="LIM-AMY-L",
        name="Amygdala",
        hemisphere="left",
        category="limbic",
        description=(
            "Emotion processing and salience integration structure."
        ),
        volume_mm3=1_580,
        resilience_score=0.70,
        complexity_score=0.66,
        atrophy_index=0.23,
        confidence=0.89,
        status="stable",
    ),

    BrainRegion(
        region_id="LIM-AMY-R",
        name="Amygdala",
        hemisphere="right",
        category="limbic",
        description=(
            "Emotion processing and memory modulation structure."
        ),
        volume_mm3=1_610,
        resilience_score=0.72,
        complexity_score=0.68,
        atrophy_index=0.21,
        confidence=0.90,
        status="stable",
    ),

    BrainRegion(
        region_id="SUB-THAL-L",
        name="Thalamus",
        hemisphere="left",
        category="subcortical",
        description=(
            "Major sensory and cortical relay structure."
        ),
        volume_mm3=6_920,
        resilience_score=0.75,
        complexity_score=0.71,
        atrophy_index=0.19,
        confidence=0.92,
        status="stable",
    ),

    BrainRegion(
        region_id="SUB-THAL-R",
        name="Thalamus",
        hemisphere="right",
        category="subcortical",
        description=(
            "Sensory integration and cortical relay structure."
        ),
        volume_mm3=6_880,
        resilience_score=0.74,
        complexity_score=0.70,
        atrophy_index=0.20,
        confidence=0.92,
        status="stable",
    ),

    BrainRegion(
        region_id="SUB-CAU-L",
        name="Caudate",
        hemisphere="left",
        category="subcortical",
        description=(
            "Motor, learning and executive loop structure."
        ),
        volume_mm3=3_180,
        resilience_score=0.71,
        complexity_score=0.66,
        atrophy_index=0.25,
        confidence=0.88,
        status="watch",
    ),

    BrainRegion(
        region_id="SUB-CAU-R",
        name="Caudate",
        hemisphere="right",
        category="subcortical",
        description=(
            "Motor planning and reward-learning structure."
        ),
        volume_mm3=3_220,
        resilience_score=0.72,
        complexity_score=0.67,
        atrophy_index=0.24,
        confidence=0.88,
        status="stable",
    ),

    BrainRegion(
        region_id="CER-L",
        name="Cerebellum",
        hemisphere="left",
        category="cerebellar",
        description=(
            "Coordination, timing and cognitive modulation region."
        ),
        volume_mm3=71_400,
        resilience_score=0.79,
        complexity_score=0.77,
        atrophy_index=0.13,
        confidence=0.93,
        status="stable",
    ),

    BrainRegion(
        region_id="CER-R",
        name="Cerebellum",
        hemisphere="right",
        category="cerebellar",
        description=(
            "Motor coordination and cognitive timing region."
        ),
        volume_mm3=71_900,
        resilience_score=0.80,
        complexity_score=0.78,
        atrophy_index=0.12,
        confidence=0.93,
        status="stable",
    ),
]


# ============================================================
# HELPERS
# ============================================================

def get_region_or_404(
    region_id: str,
) -> BrainRegion:
    for region in REGIONS:
        if region.region_id == region_id:
            return region

    raise HTTPException(
        status_code=404,
        detail=f"Brain region '{region_id}' was not found.",
    )


def overlay_value(
    region: BrainRegion,
    mode: OverlayMode,
) -> float:
    if mode == "resilience":
        return region.resilience_score

    if mode == "complexity":
        return region.complexity_score

    if mode == "atrophy":
        return region.atrophy_index

    if mode == "confidence":
        return region.confidence

    return 1.0


# ============================================================
# SUMMARY
# ============================================================

@router.get(
    "/summary",
    response_model=BrainSummary,
)
def get_brain_summary(
    subject_id: str = Query(
        default=DEFAULT_SUBJECT_ID,
    ),
):
    region_count = len(REGIONS)

    mean_resilience = sum(
        region.resilience_score
        for region in REGIONS
    ) / region_count

    mean_complexity = sum(
        region.complexity_score
        for region in REGIONS
    ) / region_count

    mean_atrophy = sum(
        region.atrophy_index
        for region in REGIONS
    ) / region_count

    mean_confidence = sum(
        region.confidence
        for region in REGIONS
    ) / region_count

    stable_regions = sum(
        1
        for region in REGIONS
        if region.status == "stable"
    )

    watch_regions = sum(
        1
        for region in REGIONS
        if region.status == "watch"
    )

    elevated_regions = sum(
        1
        for region in REGIONS
        if region.status == "elevated"
    )

    return BrainSummary(
        subject_id=subject_id,
        total_regions=region_count,
        mean_resilience=round(
            mean_resilience,
            3,
        ),
        mean_complexity=round(
            mean_complexity,
            3,
        ),
        mean_atrophy=round(
            mean_atrophy,
            3,
        ),
        mean_confidence=round(
            mean_confidence,
            3,
        ),
        stable_regions=stable_regions,
        watch_regions=watch_regions,
        elevated_regions=elevated_regions,
    )


# ============================================================
# REGION LIST
# ============================================================

@router.get(
    "/regions",
    response_model=BrainRegionListResponse,
)
def get_regions(
    subject_id: str = Query(
        default=DEFAULT_SUBJECT_ID,
    ),
    hemisphere: Hemisphere | None = Query(
        default=None,
    ),
    category: RegionCategory | None = Query(
        default=None,
    ),
    overlay: OverlayMode = Query(
        default="anatomy",
    ),
):
    filtered = REGIONS

    if hemisphere:
        filtered = [
            region
            for region in filtered
            if region.hemisphere == hemisphere
        ]

    if category:
        filtered = [
            region
            for region in filtered
            if region.category == category
        ]

    return BrainRegionListResponse(
        subject_id=subject_id,
        total_regions=len(filtered),
        overlay_mode=overlay,
        regions=filtered,
    )


# ============================================================
# REGION DETAIL
# ============================================================

@router.get(
    "/regions/{region_id}",
    response_model=BrainRegionDetailResponse,
)
def get_region_detail(
    region_id: str,
    subject_id: str = Query(
        default=DEFAULT_SUBJECT_ID,
    ),
):
    region = get_region_or_404(
        region_id,
    )

    longitudinal_change = round(
        (
            region.resilience_score
            - 0.74
        )
        * 10,
        2,
    )

    if region.status == "elevated":
        interpretation = (
            "Region demonstrates elevated structural vulnerability "
            "and should be prioritized for longitudinal review."
        )

    elif region.status == "watch":
        interpretation = (
            "Region shows moderate deviation from the current "
            "research baseline and merits monitoring."
        )

    else:
        interpretation = (
            "Region remains within the stable research profile "
            "for the current subject."
        )

    return BrainRegionDetailResponse(
        subject_id=subject_id,
        region=region,
        linked_modalities=[
            "MRI",
            "EEG",
            "Behavior",
        ],
        longitudinal_change_percent=
            longitudinal_change,
        interpretation=
            interpretation,
    )


# ============================================================
# OVERLAY
# ============================================================

@router.get(
    "/overlay",
    response_model=BrainOverlayResponse,
)
def get_overlay(
    mode: OverlayMode = Query(
        default="resilience",
    ),
    subject_id: str = Query(
        default=DEFAULT_SUBJECT_ID,
    ),
):
    values = {
        region.region_id:
            round(
                overlay_value(
                    region,
                    mode,
                ),
                3,
            )
        for region in REGIONS
    }

    value_list = list(
        values.values()
    )

    return BrainOverlayResponse(
        subject_id=subject_id,
        overlay_mode=mode,
        min_value=min(
            value_list
        ),
        max_value=max(
            value_list
        ),
        mean_value=round(
            sum(value_list)
            / len(value_list),
            3,
        ),
        values=values,
    )