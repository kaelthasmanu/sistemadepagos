import random
from datetime import datetime
from typing import Optional

from ..dtos.paymentResponse import PaymentResponse


def process_payment(payment) -> PaymentResponse:
    transaction_id = f"TXN_{random.randint(100000, 999999)}_{int(datetime.now().timestamp())}"
    is_approved = random.random() < 0.8

    if is_approved:
        status = "approved"
        message = "Pago procesado exitosamente"
    else:
        status = "rejected"
        rejection_reasons = [
            "Fondos insuficientes",
            "Tarjeta expirada",
            "Número de tarjeta inválido",
            "CVV incorrecto",
            "Transacción sospechosa detectada",
        ]
        message = random.choice(rejection_reasons)

    return PaymentResponse(
        transaction_id=transaction_id,
        status=status,
        amount=payment.amount,
        currency=payment.currency,
        message=message,
        timestamp=datetime.now().isoformat(),
    )
