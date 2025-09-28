# sistemadepagos

Proyecto de ejemplo para un sistema básico de pagos que incluye:

- API REST en Node.js (creación de usuarios, tarjetas y pagos)
- Microservicio de procesamiento de pagos en Python (FastAPI)
- Esquema de base de datos PostgreSQL y scripts SQL

## Microservicio Python (FastAPI) - Instrucciones de inicio profesional

Estos pasos describen cómo crear un entorno virtual, instalar dependencias y ejecutar el microservicio Python basado en FastAPI que simula el procesamiento de pagos.

1) Clonar el repositorio (si no lo has hecho):

```bash
git clone <repo-url>
cd sistemadepagos
```

2) Crear y activar un entorno virtual (venv) — recomendado para macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

En Windows (PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

3) Actualizar pip y preparar archivos de dependencias

```bash
python -m pip install --upgrade pip
```

1) Instalar dependencias dentro del venv

```bash
pip install -r microservice/requirements.txt
```

5) Variables de entorno (opcional)

Si necesitas configurar puertos u otros settings, exporta variables antes de ejecutar. Ejemplo:

```bash
export PAYMENT_SERVICE_PORT=8001
```

6) Ejecutar el microservicio (desarrollo)

```bash
uvicorn microservice.main:app --reload --host 0.0.0.0 --port 8001
```

7) Probar el endpoint de ejemplo

Probar el endpoint de procesamiento de pago (ejemplo):

```bash
curl -X POST "http://127.0.0.1:8001/process-payment" \
  -H "Content-Type: application/json" \
  -d '{"amount": 12.5, "currency": "USD", "card_number": "4242424242424242", "cardholder_name": "Test User", "expiry_month": 12, "expiry_year": 2026, "cvv": "123"}'
```
