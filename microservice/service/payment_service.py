import os
import random
from collections.abc import Callable
from datetime import UTC, datetime
from uuid import uuid4

from dtos import PaymentRequest, PaymentResponse

REJECTION_REASONS = (
    "Fondos insuficientes",
    "Tarjeta expirada",
    "Número de tarjeta inválido",
    "CVV incorrecto",
    "Transacción sospechosa detectada",
)


def _approval_rate() -> float:
    raw_value = "0.8"
    try:
        rate = float(raw_value)
    except ValueError as exc:
        raise ValueError("PAYMENT_APPROVAL_RATE debe ser un número") from exc
    if not 0 <= rate <= 1:
        raise ValueError("PAYMENT_APPROVAL_RATE debe estar entre 0 y 1")
    return rate


def process_payment(
    payment: PaymentRequest,
    *,
    random_value: Callable[[], float] = random.random,
) -> PaymentResponse:
    """Simulate a payment without persisting or logging sensitive card data."""

    approved = random_value() < _approval_rate()
    status = "approved" if approved else "rejected"
    message = (
        "Pago procesado exitosamente" if approved else random.choice(REJECTION_REASONS)
    )

    return PaymentResponse(
        transaction_id=f"TXN_{uuid4().hex.upper()}",
        status=status,
        amount=payment.amount,
        currency=payment.currency,
        message=message,
        timestamp=datetime.now(UTC),
    )
