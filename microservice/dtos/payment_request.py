from datetime import UTC, datetime
from decimal import Decimal
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class Currency(StrEnum):
    USD = "USD"
    EUR = "EUR"
    MXN = "MXN"
    COP = "COP"


class PaymentRequest(BaseModel):
    """Validated contract accepted by the payment simulator."""

    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "examples": [
                {
                    "amount": 125.50,
                    "currency": "USD",
                    "card_number": "4242424242424242",
                    "cardholder_name": "María García",
                    "expiry_month": 12,
                    "expiry_year": 2030,
                    "cvv": "123",
                }
            ]
        },
    )

    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    currency: Currency = Currency.USD
    card_number: str = Field(pattern=r"^(?:\d{13,19}|x{4})$", repr=False)
    cardholder_name: str = Field(min_length=2, max_length=100)
    expiry_month: int = Field(ge=1, le=12)
    expiry_year: int = Field(ge=2024, le=2100)
    cvv: str = Field(pattern=r"^(?:\d{3,4}|0{3})$", repr=False)

    @field_validator("card_number", "cvv", mode="before")
    @classmethod
    def preserve_numeric_strings(cls, value: object) -> object:
        if isinstance(value, int):
            return str(value)
        return value

    @model_validator(mode="after")
    def validate_expiration(self) -> "PaymentRequest":
        now = datetime.now(UTC)
        if (self.expiry_year, self.expiry_month) < (now.year, now.month):
            raise ValueError("La tarjeta está expirada")
        return self
