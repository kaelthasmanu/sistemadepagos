from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict

from dtos.payment_request import Currency


class PaymentResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    transaction_id: str
    status: Literal["approved", "rejected"]
    amount: Decimal
    currency: Currency
    message: str
    timestamp: datetime
