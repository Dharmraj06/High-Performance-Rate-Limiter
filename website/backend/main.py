import os

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from services.benchmark_service import (
    get_baseline_data,
    get_final_data,
    get_comparison_data,
)

app = FastAPI(
    title="C++ Rate Limiter Benchmark API",
    description="Backend API serving baseline, final, and comparison benchmark results for the C++ Rate Limiter project.",
    version="1.0.0",
)

def configured_frontend_origins() -> list[str]:
    """Return the comma-separated frontend origins permitted by CORS."""
    configured = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173,http://127.0.0.1:5173",
    )
    return [origin.strip().rstrip("/") for origin in configured.split(",") if origin.strip()]


# Set FRONTEND_URL to the deployed frontend origin in production. Multiple
# comma-separated origins are supported for deployments with a preview domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=configured_frontend_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend status."""
    return {
        "status": "healthy",
        "service": "rate-limiter-benchmark-api",
        "version": "1.0.0",
    }


@app.get("/api/benchmark/baseline", tags=["Benchmarks"])
def get_baseline():
    """Returns the baseline benchmark data from Google Benchmark suite."""
    try:
        return get_baseline_data()
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Corrupted baseline data: {exc}",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error retrieving baseline benchmark data: {exc}",
        )


@app.get("/api/benchmark/final", tags=["Benchmarks"])
def get_final():
    """Returns the final benchmark data from the standalone chrono benchmark suite."""
    try:
        return get_final_data()
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Corrupted final benchmark data: {exc}",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error retrieving final benchmark data: {exc}",
        )


@app.get("/api/benchmark/comparison", tags=["Benchmarks"])
def get_comparison():
    """
    Returns structured comparison metrics derived from baseline and final benchmark data.
    Includes throughput changes, latency deltas, speedup factors, and handles non-comparable
    distributed benchmarks such as Redis Token Bucket.
    """
    try:
        return get_comparison_data()
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Corrupted benchmark data during comparison: {exc}",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error computing benchmark comparison: {exc}",
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
