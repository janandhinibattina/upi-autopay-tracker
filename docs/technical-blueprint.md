# Technical Blueprint

## Architecture

```text
React Frontend
    |
FastAPI Backend
    |
Autopay Detection Engine
    |
PostgreSQL-ready data models
```

## MVP API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | API health check |
| `POST` | `/api/analyze` | Upload CSV and return detected subscriptions |
| `POST` | `/api/analyze-json` | Analyze transaction JSON for local UI demos/tests |

## Detection Approach

The first-pass detection engine groups debit transactions by normalized merchant name and amount. It flags a group as a subscription when:

- At least two matching payments exist
- Amounts are the same or very similar
- Date gaps resemble monthly, weekly, quarterly, or yearly recurrence

## Future Database Tables

- `users`
- `transactions`
- `subscriptions`
- `upi_apps`
- `mandate_guidance`

