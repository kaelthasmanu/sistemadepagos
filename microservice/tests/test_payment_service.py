from decimal import Decimal

from dtos import PaymentRequest
from service import process_payment


def payment() -> PaymentRequest:
    return PaymentRequest(
        amount=Decimal("25.00"),
        currency="USD",
        card_number="4242424242424242",
        cardholder_name="Test User",
        expiry_month=12,
        expiry_year=2030,
        cvv="123",
    )


def test_approves_deterministically(monkeypatch) -> None:
    monkeypatch.setenv("PAYMENT_APPROVAL_RATE", "0.8")

    result = process_payment(payment(), random_value=lambda: 0.1)

    assert result.status == "approved"


def test_rejects_deterministically(monkeypatch) -> None:
    monkeypatch.setenv("PAYMENT_APPROVAL_RATE", "0.8")

    result = process_payment(payment(), random_value=lambda: 0.9)

    assert result.status == "rejected"
