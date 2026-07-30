from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def valid_payment() -> dict[str, object]:
    return {
        "amount": 125.50,
        "currency": "USD",
        "card_number": "4242424242424242",
        "cardholder_name": "María García",
        "expiry_month": 12,
        "expiry_year": 2030,
        "cvv": "123",
    }


def test_health() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_process_payment_contract(monkeypatch) -> None:
    monkeypatch.setenv("PAYMENT_APPROVAL_RATE", "1")

    response = client.post(
        "/process-payment",
        json=valid_payment(),
        headers={"X-Request-ID": "req-test"},
    )

    body = response.json()
    assert response.status_code == 200
    assert response.headers["X-Request-ID"] == "req-test"
    assert body["status"] == "approved"
    assert body["amount"] == "125.5"
    assert body["currency"] == "USD"
    assert body["transaction_id"].startswith("TXN_")


def test_rejects_unknown_fields() -> None:
    payload = valid_payment() | {"unexpected": "value"}

    response = client.post("/process-payment", json=payload)

    assert response.status_code == 422


def test_rejects_invalid_amount() -> None:
    payload = valid_payment() | {"amount": 0}

    response = client.post("/process-payment", json=payload)

    assert response.status_code == 422
