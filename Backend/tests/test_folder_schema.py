import pytest
from app.schemas.folder import FolderSchema
from marshmallow import ValidationError

def test_folder_schema_serialization_happy_path(app):
    """Happy Path: FolderSchema deserializes valid folder payloads."""
    schema = FolderSchema()
    payload = {
        "name": "Documents",
        "user_id": 1,
        "parent_folder_id": None
    }
    folder_obj = schema.load(payload)

    assert folder_obj.name == "Documents"
    assert folder_obj.user_id == 1
    assert folder_obj.parent_folder_id is None

def test_folder_schema_empty_name_edge_case(app):
    """Edge Case: FolderSchema rejects empty strings or missing required fields."""
    schema = FolderSchema()
    
    with pytest.raises(ValidationError) as exc_info:
        schema.load({"name": "", "user_id": 1})

    assert "name" in exc_info.value.messages