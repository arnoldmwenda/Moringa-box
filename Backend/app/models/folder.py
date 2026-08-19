from app import db
from datetime import datetime, timezone


class Folder(db.Model):
    __tablename__ = "folders"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    parent_folder_id = db.Column(
        db.Integer,
        db.ForeignKey("folders.id", ondelete="RESTRICT"),
        nullable=True
    )
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    __table_args__ = (
        db.Index(
            "uq_folder_user_root_name",
            "user_id",
            "name",
            unique=True,
            postgresql_where=db.text("parent_folder_id IS NULL"),
            sqlite_where=db.text("parent_folder_id IS NULL")
        ),
        db.Index(
            "uq_folder_user_parent_name",
            "user_id",
            "parent_folder_id",
            "name",
            unique=True,
            postgresql_where=db.text("parent_folder_id IS NOT NULL"),
            sqlite_where=db.text("parent_folder_id IS NOT NULL")
        ),
    )
