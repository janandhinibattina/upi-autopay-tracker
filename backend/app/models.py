from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


TransactionType = Literal["debit", "credit"]


class Transaction(BaseModel):
    date: date
    description: str
    amount: float = Field(gt=0)
    upi_app: str
    type: TransactionType


class Subscription(BaseModel):
    name: str
    amount: float
    frequency: str
    upi_app: str
    occurrences: int
    estimated_monthly_spend: float
    cancellation_guidance: str


class AnalyzeRequest(BaseModel):
    transactions: list[Transaction]


class AnalyzeResponse(BaseModel):
    subscriptions: list[Subscription]
    total_monthly_spend: float
    active_subscription_count: int
    highest_recurring_expense: Subscription | None

