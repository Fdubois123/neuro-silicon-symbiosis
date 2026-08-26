from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Neuro-Silicon API",
    description="Backend API for the Neuro-Silicon Symbiosis research platform.",
    version="0.1.0",
)

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


@app.get("/")
def root():
    return {
        "name": "Neuro-Silicon Symbiosis API",
        "version": "0.1.0",
        "status": "online",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "neuro-silicon-api",
        "version": "0.1.0",
    }


@app.get("/api/v1/system")
def system_info():
    return {
        "platform": "Neuro-Silicon Symbiosis",
        "api_version": "v1",
        "research_mode": True,
        "status": "operational",
    }
