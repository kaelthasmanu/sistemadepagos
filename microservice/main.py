import logging
import os
from typing import Annotated

from fastapi import FastAPI, Header, Response, status
from mangum import Mangum

from dtos import PaymentRequest, PaymentResponse
from service import process_payment as process_payment_service

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Payment Processor Microservice",
    description="Simulador stateless para autorizar o rechazar pagos.",
    version="1.0.0",
)


@app.get("/health", tags=["Health"], summary="Comprobar disponibilidad")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post(
    "/process-payment",
    response_model=PaymentResponse,
    status_code=status.HTTP_200_OK,
    tags=["Payments"],
    summary="Procesar un pago",
    responses={422: {"description": "La solicitud no cumple el contrato"}},
)
def process_payment(
    payment: PaymentRequest,
    response: Response,
    x_request_id: Annotated[str | None, Header()] = None,
) -> PaymentResponse:
    request_id = x_request_id or "not-provided"
    result = process_payment_service(payment)
    response.headers["X-Request-ID"] = request_id
    logger.info(
        "payment_processed request_id=%s transaction_id=%s status=%s",
        request_id,
        result.transaction_id,
        result.status,
    )
    return result


# API Gateway HTTP API v2 -> ASGI adapter. FastAPI remains the single app.
handler = Mangum(app, lifespan="off")
