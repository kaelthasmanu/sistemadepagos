# Payment Processor Microservice

Simulador stateless de pagos construido con FastAPI. Puede ejecutarse como
servicio HTTP en Docker o como AWS Lambda detrás de API Gateway HTTP API usando
la misma aplicación ASGI.

## Desarrollo local

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

- API: `http://localhost:8001/process-payment`
- Health check: `http://localhost:8001/health`
- OpenAPI: `http://localhost:8001/docs`

La variable opcional `PAYMENT_APPROVAL_RATE` controla la probabilidad simulada
de aprobación, entre `0` y `1` (por defecto `0.8`).

## Calidad

```bash
ruff check .
ruff format --check .
pytest
```

## Docker

```bash
docker build -t payment-microservice .
docker run --rm -p 8001:8001 payment-microservice
```

La imagen ejecuta con un usuario sin privilegios y no incluye compiladores ni
dependencias de desarrollo.

## AWS SAM / Lambda

La función usa `main.handler`, que adapta API Gateway a FastAPI mediante
Mangum. Desde esta carpeta:

```bash
sam validate --lint
sam build --use-container
sam local start-api
sam deploy --guided
```

`template.yaml` crea una Lambda Python 3.13 ARM64, una API Gateway HTTP API,
tracing de X-Ray y variables configurables por entorno. Para producción se debe
añadir un authorizer (JWT/IAM) y restringir el acceso según el consumidor de la
API.

## Seguridad

El servicio no persiste ni registra número de tarjeta o CVV. Sigue siendo un
simulador: una integración real debe reemplazar estos campos por tokens del
proveedor y aplicar los controles PCI DSS correspondientes.
