from fastapi import APIRouter

from app.api.v1.digital_twin import (
    router as digital_twin_router,
)
from app.api.v1.fusion import (
    router as fusion_router,
)


router = APIRouter()


# ============================================================
# SYSTEM STATUS
# ============================================================

@router.get("/system")
def system_info():
    return {
        "platform": "Neuro-Silicon Symbiosis",
        "api_version": "v1",
        "research_mode": True,
        "status": "operational",
    }


# ============================================================
# DIGITAL TWIN
# ============================================================

router.include_router(
    digital_twin_router
)


# ============================================================
# FUSION LAB
# ============================================================

router.include_router(
    fusion_router
)