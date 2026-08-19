from app import db
from datetime import datetime, timezone


class File(db.Model):
    __tablename__ = "files"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    file_url = db.Column(db.Text, nullable=False)
    file_type = db.Column(db.String(50), nullable=False)
    file_size = db.Column(db.BigInteger, nullable=False)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    folder_id = db.Column(
        db.Integer,
        db.ForeignKey("folders.id", ondelete="SET NULL"),
        nullable=True
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )