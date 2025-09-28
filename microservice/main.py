from typing import Union
import random
from datetime import datetime
from dtos.paymentRequest import PaymentRequest
from dtos.paymentResponse import PaymentResponse

from fastapi import FastAPI

app = FastAPI()

@app.post("/process-payment", response_model=PaymentResponse)
def process_payment(payment: PaymentRequest):
    
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
            "Transacción sospechosa detectada"
        ]
        message = random.choice(rejection_reasons)
    
    return PaymentResponse(
        transaction_id=transaction_id,
        status=status,
        amount=payment.amount,
        currency=payment.currency,
        message=message,
        timestamp=datetime.now().isoformat()
    )