import pytest
from app.schemas.user import UserSchema
from marshmallow import ValidationError

def test_user_schema_dump_happy_path(app):
    """Happy Path: UserSchema serializes valid input and hides write-only/excluded fields."""
    schema = UserSchema()
    payload = {
        "username": "john_doe",
        "email": "john@example.com",
        "password": "securepassword123"
    }
    loaded_user = schema.load(payload)
    dumped_data = schema.dump(loaded_user)

    assert dumped_data["username"] == "john_doe"
    assert dumped_data["email"] == "john@example.com"
    assert "password" not in dumped_data
    assert "password_hash" not in dumped_data

def test_user_schema_validation_failures(app):
    """Edge Case: Validation raises errors on invalid email and character length limits."""
    schema = UserSchema()
    invalid_payload = {
        "username": "ab",          # Less than min 3 chars
        "email": "invalid-email",   # Incorrect email format
        "password": "123"          # Less than min 6 chars
    }

    with pytest.raises(ValidationError) as exc_info:
        schema.load(invalid_payload)

    errors = exc_info.value.messages
    assert "username" in errors
    assert "email" in errors
    assert "password" in errors