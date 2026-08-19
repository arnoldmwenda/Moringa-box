from app import ma
from app.models.file import File
from marshmallow import fields, validate

class FileSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = File
        load_instance = True
        include_fk = True

    id = fields.Integer(dump_only=True)
    name = fields.String(required=True, validate=validate.Length(min=1, max=255))
    file_url = fields.String(required=True)
    file_type = fields.String(required=True, validate=validate.Length(max=50))
    file_size = fields.Integer(required=True)
    user_id = fields.Integer(required=True)
    folder_id = fields.Integer(allow_none=True)
    created_at = fields.DateTime(dump_only=True)