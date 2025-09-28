from pydantic import BaseModel

class PaymentResponse(BaseModel):
    transaction_id: str
    status: str
    amount: float
    currency: str
    message: str
    timestamp: str