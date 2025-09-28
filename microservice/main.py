from fastapi import FastAPI
from typing import Union

from dtos.paymentRequest import PaymentRequest
from dtos.paymentResponse import PaymentResponse
from service.payment_service import process_payment as payment_service_process


app = FastAPI()


@app.post("/process-payment", response_model=PaymentResponse)
def process_payment(payment: PaymentRequest):
    return payment_service_process(payment)