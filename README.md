# Unified UPI Autopay Tracker & Manager

A web-based MVP for detecting, tracking, and managing recurring UPI autopay subscriptions across payment apps such as Google Pay, PhonePe, and Paytm.

## MVP Scope

- Upload CSV transaction history
- Parse transaction records
- Detect recurring UPI transactions
- Show detected subscriptions in a unified dashboard
- Calculate monthly recurring spend
- Provide app-specific cancellation guidance

## Project Structure

```text
.
├── backend/      FastAPI API and detection engine
├── frontend/     React dashboard app
├── data/         Sample CSV input
└── docs/         Product requirements and technical notes
```

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## CSV Format

The MVP expects a CSV with these columns:

```csv
date,description,amount,upi_app,type
2026-01-01,Netflix Autopay,649,Google Pay,debit
```

See `data/sample_transactions.csv` for an example.

