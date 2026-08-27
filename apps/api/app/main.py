from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as api_v1_router


app = FastAPI(
    title="Neuro-Silicon Symbiosis API",
    version="0.1.0",
    description=(
        "FastAPI backend for the Neuro-Silicon Symbiosis "
        "cognitive resilience research platform."
    ),
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "name": "Neuro-Silicon Symbiosis API",
        "version": "0.1.0",
        "status": "online",
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
    }


# ============================================================
# API V1
# ============================================================

app.include_router(
    api_v1_router,
    prefix="/api/v1",
)