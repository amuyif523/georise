from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from sklearn.linear_model import LogisticRegression
import numpy as np
from sentence_transformers import SentenceTransformer

app = FastAPI(title="AI Classification (Embedding + Logistic)")


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


TRAIN_DATA = [
    ("big fire and smoke in the building", "fire"),
    ("car accident crash on the road", "accident"),
    ("robbery with a knife reported", "crime"),
    ("person unconscious needs ambulance", "medical"),
    ("gas leak chemical hazard", "hazard"),
    ("house burning flames everywhere", "fire"),
    ("multiple vehicles collision highway", "accident"),
    ("shooting incident assault", "crime"),
    ("injured people need medical help", "medical"),
    ("chemical spill hazardous fumes", "hazard"),
    ("wildfire spreading fast", "fire"),
    ("pileup on highway multiple cars", "accident"),
    ("burglary reported with weapon", "crime"),
    ("emergency patient not breathing", "medical"),
    ("chemical factory leak toxic fumes", "hazard"),
]

texts, labels = zip(*TRAIN_DATA)

# CPU-friendly embedding model
embedder = SentenceTransformer("all-MiniLM-L6-v2")
X = embedder.encode(list(texts))
clf = LogisticRegression(max_iter=400).fit(X, labels)
MODEL_VERSION = "minilm-logreg-v1"


def severity_from_probs(probs: np.ndarray) -> float:
    max_p = float(np.max(probs))
    return min(1.0, 0.3 + 0.7 * max_p)


@app.post("/classify", response_model=ClassifyResponse)
def classify(req: ClassifyRequest):
    text = req.text or ""
    vec = embedder.encode([text])
    probs = clf.predict_proba(vec)[0]
    classes = clf.classes_
    best_idx = int(np.argmax(probs))
    category = classes[best_idx]
    confidence = round(float(probs[best_idx]), 2)
    severity_score = round(severity_from_probs(probs), 2)
    severity_label = max(1, min(5, int(severity_score * 5)))
    summary = f"Model predicts {category} with confidence {confidence}"
    return ClassifyResponse(
        category=category,
        severity_score=severity_score,
        severity_label=severity_label,
        confidence=confidence,
        summary=summary,
        model_version=MODEL_VERSION,
    )
