import unittest

from flask import Flask

from app import db
from app.models.user import User
from app.models.folder import Folder
from app.models.file import File


class FileModelTestCase(unittest.TestCase):

    def setUp(self):
        self.app = Flask(__name__)
        self.app.config["TESTING"] = True
        self.app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        self.app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

        db.init_app(self.app)

        with self.app.app_context():
            connection = db.engine.raw_connection()
            connection.execute("PRAGMA foreign_keys=ON")
            connection.close()

            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def create_user(self):
        user = User(
            username="testuser",
            email="test@example.com",
            password_hash="hashed_password"
        )

        db.session.add(user)
        db.session.commit()

        return user

    def test_create_file_in_root(self):
        with self.app.app_context():
            user = self.create_user()

            file = File(
                name="photo.jpg",
                file_url="https://example.com/photo.jpg",
                file_type="image/jpeg",
                file_size=1024,
                user_id=user.id
            )

            db.session.add(file)
            db.session.commit()

            saved_file = File.query.filter_by(name="photo.jpg").first()

            self.assertIsNotNone(saved_file)
            self.assertEqual(saved_file.user_id, user.id)
            self.assertIsNone(saved_file.folder_id)
            self.assertEqual(saved_file.file_type, "image/jpeg")
            self.assertEqual(saved_file.file_size, 1024)
            self.assertIsNotNone(saved_file.created_at)

    def test_create_file_in_folder(self):
        with self.app.app_context():
            user = self.create_user()

            folder = Folder(
                name="Documents",
                user_id=user.id
            )

            db.session.add(folder)
            db.session.commit()

            file = File(
                name="document.pdf",
                file_url="https://example.com/document.pdf",
                file_type="application/pdf",
                file_size=2048,
                user_id=user.id,
                folder_id=folder.id
            )

            db.session.add(file)
            db.session.commit()

            saved_file = File.query.filter_by(name="document.pdf").first()

            self.assertIsNotNone(saved_file)
            self.assertEqual(saved_file.user_id, user.id)
            self.assertEqual(saved_file.folder_id, folder.id)
            self.assertEqual(saved_file.file_type, "application/pdf")
            self.assertEqual(saved_file.file_size, 2048)

    def test_file_folder_is_set_to_null_when_folder_is_deleted(self):
        with self.app.app_context():
            user = self.create_user()

            folder = Folder(
                name="Documents",
                user_id=user.id
            )

            db.session.add(folder)
            db.session.commit()

            file = File(
                name="photo.jpg",
                file_url="https://example.com/photo.jpg",
                file_type="image/jpeg",
                file_size=1024,
                user_id=user.id,
                folder_id=folder.id
            )

            db.session.add(file)
            db.session.commit()

            file_id = file.id

            db.session.delete(folder)
            db.session.commit()

            saved_file = db.session.get(File, file_id)

            self.assertIsNotNone(saved_file)
            self.assertIsNone(saved_file.folder_id)


if __name__ == "__main__":
    unittest.main()