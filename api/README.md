# Sistema de Pagos API

API REST construida con NestJS, Prisma y PostgreSQL para administrar usuarios,
tarjetas tokenizadas y pagos mediante el microservicio procesador.

## Requisitos

- Node.js 22+
- PostgreSQL
- Microservicio de pagos disponible

## Configuración

```bash
cp env.example .env
npm ci
npx prisma generate
npx prisma migrate deploy
```

Variables de entorno:

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql://root:root@localhost:5432/development?schema=public` |
| `PAYMENT_SERVICE_URL` | Endpoint completo del procesador | `http://localhost:8001/process-payment` |
| `PORT` | Puerto HTTP | `3000` |

## Ejecución y calidad

```bash
npm run start:dev
npm run build
npm test
npm run lint
```

La documentación interactiva está disponible en
`http://localhost:3000/api/docs`. Incluye esquemas, ejemplos, restricciones y
respuestas de todos los endpoints.

La API rechaza propiedades no declaradas y transforma/valida parámetros y
cuerpos automáticamente. Nunca se deben almacenar números completos de tarjeta
ni códigos CVV; el campo `token` está destinado al identificador seguro emitido
por el proveedor de pagos.
