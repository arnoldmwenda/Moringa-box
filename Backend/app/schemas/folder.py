from app import ma
from app.models.folder import Folder
from marshmallow import fields, validate

class FolderSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Folder
        load_instance = True
        include_fk = True

    id = fields.Integer(dump_only=True)
    name = fields.String(required=True, validate=validate.Length(min=1, max=100))
    user_id = fields.Integer(required=True)
    parent_folder_id = fields.Integer(allow_none=True)
    created_at = fields.DateTime(dump_only=True)