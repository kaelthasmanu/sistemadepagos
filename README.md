# Sistema de Pagos

Proyecto de referencia para administrar usuarios, tarjetas tokenizadas y pagos.
Combina una API REST en NestJS, un procesador stateless en FastAPI y PostgreSQL.
Todo el entorno puede ejecutarse con Docker Compose y el microservicio también
está preparado para desplegarse en AWS Lambda con AWS SAM.

> El procesador de pagos es un simulador: aprueba o rechaza operaciones de forma
> probabilística. No debe utilizarse como procesador financiero real.

## Arquitectura

```mermaid
flowchart LR
    Client[Cliente / Postman] --> API[API NestJS :3000]
    API --> DB[(PostgreSQL :5432)]
    API --> Payment[FastAPI :8001]
    Gateway[API Gateway HTTP API] --> Lambda[Lambda + Mangum]
    Lambda --> PaymentApp[Misma aplicación FastAPI]
```

| Componente | Tecnología | Responsabilidad |
| --- | --- | --- |
| `api/` | NestJS 11, Prisma, TypeScript | Usuarios, tarjetas, pagos y persistencia |
| `microservice/` | FastAPI, Pydantic, Python | Simulación stateless del procesamiento |
| `db/` | PostgreSQL | Esquema relacional de la aplicación |
| `postman/` | Postman Collection 2.1 | Pruebas manuales y ejecución encadenada |

## Características

- Documentación Swagger/OpenAPI con cuerpos, ejemplos y respuestas.
- Validación y transformación estricta de las solicitudes.
- Rechazo de propiedades no declaradas.
- Manejo HTTP de errores de validación, conflictos, recursos inexistentes y
  fallos del procesador externo.
- Comprobación de que una tarjeta pertenezca al usuario que realiza el pago.
- Importes decimales, monedas enumeradas y validación de expiración en FastAPI.
- Health checks, correlación mediante `X-Request-ID` y logs sin datos de tarjeta.
- Contenedores con health checks y ejecución del microservicio sin privilegios.
- Compatibilidad de FastAPI con API Gateway y Lambda mediante Mangum y SAM.

## Requisitos

Para ejecutar todo el proyecto se recomienda Docker Desktop con Docker Compose.

Para desarrollo sin contenedores:

- Node.js 22 o superior y npm.
- Python 3.13 o superior.
- PostgreSQL.
- AWS SAM CLI, únicamente para probar o desplegar Lambda.

## Inicio rápido con Docker

Desde la raíz del repositorio:

```bash
docker compose up --build -d
docker compose ps
```

En una base local completamente nueva, inicialice una sola vez el esquema y
los datos de ejemplo:

```bash
docker compose exec -T db psql -U root -d development < db/schema.sql
```

> `db/schema.sql` crea el esquema completo y datos de demostración en una base
> nueva; no elimina ni reemplaza tablas existentes. Para evolucionar una base ya
> creada utilice las migraciones de Prisma descritas en la sección de desarrollo
> de la API.

Servicios disponibles:

| Servicio | URL |
| --- | --- |
| API NestJS | `http://localhost:3000` |
| Swagger de la API | `http://localhost:3000/api/docs` |
| OpenAPI JSON de la API | `http://localhost:3000/api/docs-json` |
| Microservicio FastAPI | `http://localhost:8001` |
| Swagger del microservicio | `http://localhost:8001/docs` |
| Health check del microservicio | `http://localhost:8001/health` |
| PostgreSQL | `localhost:5432` |

Comandos habituales:

```bash
docker compose logs -f api microservice
docker compose ps
docker compose down
```

Los datos de PostgreSQL se almacenan en `./development` mediante un bind mount,
por lo que `docker compose down` no elimina la base de datos.

## Endpoints

### API NestJS

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/` | Comprobar disponibilidad básica |
| `POST` | `/users` | Crear usuario |
| `GET` | `/users` | Listar usuarios |
| `GET` | `/users/:id` | Obtener usuario por ID |
| `POST` | `/cards` | Registrar tarjeta tokenizada |
| `GET` | `/cards/user/:usuarioId` | Listar tarjetas del usuario |
| `POST` | `/payments` | Procesar pago con tarjeta registrada o nueva |
| `GET` | `/payments/user/:usuarioId` | Listar pagos del usuario |

### Microservicio FastAPI

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/health` | Comprobar disponibilidad |
| `POST` | `/process-payment` | Simular autorización o rechazo de un pago |
| `GET` | `/openapi.json` | Obtener el contrato OpenAPI |

Los contratos completos, campos obligatorios, restricciones y ejemplos están
disponibles en las interfaces Swagger.

## Colección Postman

Importe estos dos archivos:

- [`postman/Sistema-de-Pagos.postman_collection.json`](postman/Sistema-de-Pagos.postman_collection.json)
- [`postman/Local.postman_environment.json`](postman/Local.postman_environment.json)

Seleccione el entorno **Sistema de Pagos - Local** y ejecute la colección en
orden. Los scripts generan un correo único y guardan automáticamente `userId` y
`cardId`, permitiendo probar los pagos sin editar manualmente las solicitudes.
Las variables `apiBaseUrl` y `microserviceBaseUrl` permiten apuntar la misma
colección a otros entornos.

## Desarrollo de la API NestJS

```bash
cd api
cp env.example .env
npm ci
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

Variables de entorno:

| Variable | Descripción | Valor local |
| --- | --- | --- |
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql://root:root@localhost:5432/development?schema=public` |
| `PAYMENT_SERVICE_URL` | Endpoint completo de FastAPI | `http://localhost:8001/process-payment` |
| `PORT` | Puerto HTTP | `3000` |

Validación del proyecto:

```bash
npm run lint
npm run build
npm test -- --runInBand
```

Consulte [`api/README.md`](api/README.md) para información específica del
componente.

## Desarrollo del microservicio FastAPI

```bash
cd microservice
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-dev.txt
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

En Windows PowerShell, active el entorno con
`.venv\Scripts\Activate.ps1`.

Variables opcionales:

| Variable | Descripción | Predeterminado |
| --- | --- | --- |
| `PORT` | Puerto usado por el contenedor | `8001` |
| `PAYMENT_APPROVAL_RATE` | Probabilidad entre `0` y `1` | `0.8` |
| `LOG_LEVEL` | Nivel de logging | `INFO` |

Validación del proyecto:

```bash
ruff check .
ruff format --check .
pytest
```

La batería cubre contratos HTTP, validaciones, servicio de dominio y ejecución
del handler con un evento API Gateway HTTP API v2.

## AWS SAM y Lambda

[`microservice/template.yaml`](microservice/template.yaml) despliega la misma
aplicación FastAPI como una función Lambda Python 3.13 ARM64. La plantilla crea
una API Gateway HTTP API, activa tracing con X-Ray y permite configurar ambiente
y tasa de aprobación.

```bash
cd microservice
sam validate --lint
sam build --use-container
sam local start-api
sam deploy --guided
```

El handler configurado es `main.handler`; Mangum adapta los eventos de API
Gateway al protocolo ASGI de FastAPI. Para producción debe añadirse un
authorizer JWT/IAM y una política de acceso adecuada al consumidor.

## Seguridad y alcance

- La API solo almacena los últimos cuatro dígitos y, opcionalmente, un token.
- El microservicio no persiste ni registra el número completo o el CVV.
- Los campos de tarjeta directa existen exclusivamente para demostrar el flujo.
- Una implementación real debe tokenizar en el cliente o proveedor, usar un
  procesador certificado, cifrar secretos y cumplir PCI DSS.
- Antes de exponer el sistema deben añadirse autenticación, autorización, rate
  limiting y gestión centralizada de secretos.

## Estructura

```text
.
├── api/                    # API NestJS y Prisma
├── db/                     # Esquema SQL de referencia
├── microservice/           # FastAPI, pruebas y plantilla SAM
├── postman/                # Colección y entorno local
├── docker-compose.yml      # Orquestación local
└── README.md
```
