from fastapi import FastAPI

app = FastAPI(
    title="Neuro-Silicon API",
    description="Backend API for the Neuro-Silicon Symbiosis research platform.",
    version="0.1.0",
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
        "status": "healthy"
    }
