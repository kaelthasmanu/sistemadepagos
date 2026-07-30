import asyncio
import json

from main import handler


def api_gateway_event() -> dict[str, object]:
    return {
        "version": "2.0",
        "routeKey": "GET /health",
        "rawPath": "/health",
        "rawQueryString": "",
        "headers": {
            "host": "example.execute-api.us-east-1.amazonaws.com",
            "x-forwarded-port": "443",
            "x-forwarded-proto": "https",
        },
        "requestContext": {
            "http": {
                "method": "GET",
                "path": "/health",
                "protocol": "HTTP/1.1",
                "sourceIp": "127.0.0.1",
                "userAgent": "pytest",
            },
            "requestId": "lambda-test",
            "routeKey": "GET /health",
            "stage": "$default",
            "time": "30/Jul/2026:12:00:00 +0000",
            "timeEpoch": 1785412800000,
        },
        "isBase64Encoded": False,
    }


def test_lambda_handler_serves_fastapi_health() -> None:
    # Python 3.14 no longer creates an implicit loop; Lambda uses Python 3.13.
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        response = handler(api_gateway_event(), {})
    finally:
        loop.close()
        asyncio.set_event_loop(None)

    assert response["statusCode"] == 200
    assert json.loads(response["body"]) == {"status": "ok"}
