from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import transactions


app = FastAPI(title="Unified UPI Autopay Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(transactions.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/")
def home() -> dict[str, str]:
    return {"message": "Unified UPI Autopay Tracker API is running"}
