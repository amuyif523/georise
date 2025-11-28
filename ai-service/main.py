from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="AI Classification Rule-Based Stub")


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


CATEGORY_KEYWORDS = {
    "fire": ["fire", "smoke", "burn", "flames"],
    "accident": ["accident", "crash", "collision", "car", "vehicle"],
    "crime": ["robbery", "assault", "theft", "gun", "knife", "crime"],
    "medical": ["injury", "medical", "ambulance", "unconscious", "bleeding"],
    "hazard": ["gas leak", "hazard", "chemical", "spill"],
}

def score_text(text: str, keywords: List[str]) -> int:
    lower = text.lower()
    return sum(1 for kw in keywords if kw in lower)


@app.post("/classify", response_model=ClassifyResponse)
def classify(req: ClassifyRequest):
    text = req.text or ""
    scores = {cat: score_text(text, kws) for cat, kws in CATEGORY_KEYWORDS.items()}
    best_cat = max(scores, key=scores.get)
    best_score = scores[best_cat]
    # confidence heuristic: normalized keyword hits
    max_hits = max(1, len(CATEGORY_KEYWORDS[best_cat]))
    confidence = round(min(0.95, 0.4 + (best_score / max_hits)), 2)

    # severity heuristic: more keywords => higher severity
    severity_score = round(min(1.0, 0.2 + best_score * 0.2), 2)
    severity_label = max(1, min(5, int(severity_score * 5)))

    summary = f"Detected {best_cat} with {best_score} keyword matches."

    return ClassifyResponse(
        category=best_cat,
        severity_score=severity_score,
        severity_label=severity_label,
        confidence=confidence,
        summary=summary,
        model_version="rule-stub-v2",
    )
