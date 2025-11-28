from fastapi import FastAPI
from pydantic import BaseModel
import random

app = FastAPI(title="AI Classification Stub")


class ClassifyRequest(BaseModel):
    text: str
    language: str | None = None
    location: dict | None = None
    timestamp: str | None = None


class ClassifyResponse(BaseModel):
    category: str
    severity_score: float
    severity_label: int
    confidence: float
    summary: str
    model_version: str


CATEGORIES = ["fire", "accident", "crime", "medical", "hazard"]


@app.post("/classify", response_model=ClassifyResponse)
def classify(req: ClassifyRequest):
    category = random.choice(CATEGORIES)
    severity_score = round(random.uniform(0.2, 0.9), 2)
    severity_label = max(1, min(5, int(severity_score * 5)))
    confidence = round(random.uniform(0.4, 0.95), 2)
    summary = f"Stub summary for {category}"
    return ClassifyResponse(
        category=category,
        severity_score=severity_score,
        severity_label=severity_label,
        confidence=confidence,
        summary=summary,
        model_version="stub-v1",
    )
