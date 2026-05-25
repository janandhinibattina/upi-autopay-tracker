from collections import defaultdict
from datetime import date
import re

from app.models import Subscription, Transaction


GUIDANCE_BY_APP = {
    "google pay": "Open Google Pay > Profile > Autopay > Select mandate > Cancel.",
    "gpay": "Open Google Pay > Profile > Autopay > Select mandate > Cancel.",
    "phonepe": "Open PhonePe > Profile > Autopay > Select subscription > Disable.",
    "paytm": "Open Paytm > UPI & Payment Settings > Automatic Payments > Cancel mandate.",
}


def detect_subscriptions(transactions: list[Transaction]) -> list[Subscription]:
    debit_transactions = [txn for txn in transactions if txn.type == "debit"]
    groups: dict[tuple[str, float], list[Transaction]] = defaultdict(list)

    for txn in debit_transactions:
        merchant = normalize_merchant(txn.description)
        amount_bucket = round(txn.amount, 2)
        groups[(merchant, amount_bucket)].append(txn)

    subscriptions: list[Subscription] = []
    for (merchant, amount), items in groups.items():
        ordered = sorted(items, key=lambda txn: txn.date)
        if len(ordered) < 2:
            continue

        frequency = infer_frequency([txn.date for txn in ordered])
        if frequency == "irregular":
            continue

        upi_app = most_common([txn.upi_app for txn in ordered])
        subscriptions.append(
            Subscription(
                name=title_case_merchant(merchant),
                amount=amount,
                frequency=frequency,
                upi_app=upi_app,
                occurrences=len(ordered),
                estimated_monthly_spend=monthly_equivalent(amount, frequency),
                cancellation_guidance=guidance_for_app(upi_app),
            )
        )

    return sorted(subscriptions, key=lambda item: item.estimated_monthly_spend, reverse=True)


def normalize_merchant(description: str) -> str:
    value = description.lower()
    value = re.sub(r"\b(upi|autopay|mandate|payment|india|pvt|ltd)\b", " ", value)
    value = re.sub(r"[^a-z0-9 ]+", " ", value)
    value = re.sub(r"\s+", " ", value).strip()
    return value or "unknown merchant"


def title_case_merchant(value: str) -> str:
    return " ".join(part.capitalize() for part in value.split())


def infer_frequency(dates: list[date]) -> str:
    if len(dates) < 2:
        return "irregular"

    gaps = [(dates[index] - dates[index - 1]).days for index in range(1, len(dates))]
    average_gap = sum(gaps) / len(gaps)

    if 6 <= average_gap <= 8:
        return "weekly"
    if 27 <= average_gap <= 34:
        return "monthly"
    if 85 <= average_gap <= 95:
        return "quarterly"
    if 360 <= average_gap <= 370:
        return "yearly"

    return "irregular"


def monthly_equivalent(amount: float, frequency: str) -> float:
    multipliers = {
        "weekly": 4.33,
        "monthly": 1,
        "quarterly": 1 / 3,
        "yearly": 1 / 12,
    }
    return round(amount * multipliers.get(frequency, 0), 2)


def most_common(values: list[str]) -> str:
    return max(set(values), key=values.count)


def guidance_for_app(app_name: str) -> str:
    return GUIDANCE_BY_APP.get(
        app_name.lower(),
        f"Open {app_name}, find Autopay or UPI mandates in payment settings, and cancel the subscription.",
    )

