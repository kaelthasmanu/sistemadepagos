# Colección Postman

Importe en Postman los archivos:

1. `Sistema-de-Pagos.postman_collection.json`
2. `Local.postman_environment.json`

Seleccione el entorno **Sistema de Pagos - Local** y levante el proyecto con:

```bash
docker compose up --build
```

La colección está ordenada para ejecutarse completa con Collection Runner. La
solicitud **Crear usuario** genera un correo único y guarda el ID de respuesta;
**Registrar tarjeta** utiliza ese usuario y guarda el ID de la tarjeta. Los
pagos siguientes reutilizan ambas variables automáticamente.

Las URLs pueden cambiarse con `apiBaseUrl` y `microserviceBaseUrl`, lo que
permite usar la misma colección contra Docker local o una API desplegada en
AWS.
