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

## API Node (NestJS) - Instrucciones de inicio y ejecución

Pasos rápidos para instalar, configurar y ejecutar la API NestJS incluida en el proyecto.

Requisitos
- Node.js 18+ (preferible 20)
- npm
- PostgreSQL (o la base de datos que uses)
- Docker (opcional, para despliegue en contenedor)

1) Entrar al directorio de la API
```bash
cd api
```

2) Instalar dependencias
```bash
npm install
```

3) Variables de entorno
Crea un archivo `.env` en `api/` (puedes copiar de `.env.example` si existe) con al menos estas variables:
```
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
PORT=3000
PAYMENT_SERVICE_URL="http://localhost:8001" # URL del microservicio de pagos (opcional)
JWT_SECRET="tu_secreto_aqui"                # si aplica
```

4) Generar Prisma Client y ejecutar migraciones (desarrollo)
```bash
npx prisma generate
npx prisma migrate dev --name init
```
Para producción, usa:
```bash
npx prisma generate
npx prisma migrate deploy
```

5) Ejecutar en modo desarrollo (hot-reload)
```bash
npm run start:dev
# o
npm run start
```
Por defecto la API escuchará en el puerto definido en `PORT` (por defecto 3000).

6) Ejecutar en producción (build + start)
```bash
npm run build
npm run start:prod
```

7) Swagger / OpenAPI
Si la app inicializa Swagger (en `main.ts`), la UI suele estar en:
```
http://localhost:3000/api
```
Usa esa ruta para probar los endpoints y ver ejemplos.

## Uso con Docker Compose

Pasos para ejecutar el proyecto completo (API Node + microservicio FastAPI + PostgreSQL) usando docker-compose.

Requisitos
- Docker (o Docker Desktop)
- docker-compose (si no está incluido en Docker Desktop)
- 
1) Levantar los servicios:

```bash
docker-compose up --build -d
```

2) Ejecutar migraciones / generar cliente Prisma (si usas Prisma):
- Migrar (desarrollo)
```bash
docker-compose exec api npx prisma migrate dev --name init
```
o (producción)
```bash
docker-compose exec api npx prisma migrate deploy
```

1) Comprobar logs y estado
```bash
docker-compose logs -f api
docker-compose ps
```

1) Parar y limpiar
```bash
docker-compose down -v
```

1) Acceso
- API (Swagger/OpenAPI): http://localhost:${API_PORT:-3000}/api
- Microservicio de pagos: http://localhost:${PAYMENT_SERVICE_PORT:-8001}/

