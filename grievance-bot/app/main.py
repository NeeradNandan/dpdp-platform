"""Yojak Grievance Bot API - FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import router

app = FastAPI(
    title="Yojak Grievance Bot API",
    version="1.0.0",
    description="AI-powered grievance redressal for the DPDP PaaS platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def health_check() -> dict[str, str]:
    """Root health check endpoint."""
    return {"status": "healthy", "service": "grievance-bot"}


@app.get("/health")
def health() -> dict[str, str]:
    """Health check endpoint for load balancers."""
    return {"status": "ok"}
