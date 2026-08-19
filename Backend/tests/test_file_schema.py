import pytest
from app.schemas.file import FileSchema
from marshmallow import ValidationError

def test_file_schema_dump_happy_path(app):
    """Happy Path: FileSchema validates complete file metadata payloads."""
    schema = FileSchema()
    payload = {
        "name": "document.pdf",
        "file_url": "https://storage.provider.com/files/document.pdf",
        "file_type": "application/pdf",
        "file_size": 1048576,
        "user_id": 1,
        "folder_id": 2
    }
    file_obj = schema.load(payload)

    assert file_obj.name == "document.pdf"
    assert file_obj.file_size == 1048576
    assert file_obj.folder_id == 2

def test_file_schema_missing_required_fields_edge_case(app):
    """Edge Case: FileSchema fails when required metadata fields are missing."""
    schema = FileSchema()
    incomplete_payload = {
        "name": "image.png"
    }

    with pytest.raises(ValidationError) as exc_info:
        schema.load(incomplete_payload)

    errors = exc_info.value.messages
    assert "file_url" in errors
    assert "file_type" in errors
    assert "file_size" in errors
    assert "user_id" in errors