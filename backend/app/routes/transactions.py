# transactions routes
from app.services.autopay_detector import test_function@router.get("/transactions")
def get_transactions():
    result = test_function()

    return {
        "message": result
    }
