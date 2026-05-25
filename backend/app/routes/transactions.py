from io import StringIO

import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile

from app.models import AnalyzeRequest, AnalyzeResponse, Transaction
from app.services.autopay_detector import detect_subscriptions


router = APIRouter(prefix="/api", tags=["transactions"])


@router.get("/transactions")
def get_transactions() -> dict[str, str]:
    return {"message": "Transaction service is working"}


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_csv(file: UploadFile = File(...)) -> AnalyzeResponse:
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Upload a CSV file.")

    content = (await file.read()).decode("utf-8")
    dataframe = pd.read_csv(StringIO(content))
    transactions = parse_transactions(dataframe)
    return build_response(transactions)


@router.post("/analyze-json", response_model=AnalyzeResponse)
def analyze_json(payload: AnalyzeRequest) -> AnalyzeResponse:
    return build_response(payload.transactions)


def parse_transactions(dataframe: pd.DataFrame) -> list[Transaction]:
    required_columns = {"date", "description", "amount", "upi_app", "type"}
    missing_columns = required_columns - set(dataframe.columns)
    if missing_columns:
        missing = ", ".join(sorted(missing_columns))
        raise HTTPException(status_code=400, detail=f"Missing required columns: {missing}")

    records = dataframe[list(required_columns)].to_dict(orient="records")
    return [Transaction(**record) for record in records]


def build_response(transactions: list[Transaction]) -> AnalyzeResponse:
    subscriptions = detect_subscriptions(transactions)
    highest = subscriptions[0] if subscriptions else None
    total = round(sum(item.estimated_monthly_spend for item in subscriptions), 2)

    return AnalyzeResponse(
        subscriptions=subscriptions,
        total_monthly_spend=total,
        active_subscription_count=len(subscriptions),
        highest_recurring_expense=highest,
    )

