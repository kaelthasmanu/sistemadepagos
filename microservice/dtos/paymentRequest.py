from pydantic import BaseModel

class PaymentRequest(BaseModel):
    amount: float
    currency: str = "USD"
    card_number: str
    cardholder_name: str
    expiry_month: int
    expiry_year: int
    cvv: str