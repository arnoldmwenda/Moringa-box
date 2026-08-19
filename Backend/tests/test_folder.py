import unittest

from flask import Flask

from app import db
from app.models.user import User
from app.models.folder import Folder


class FolderModelTestCase(unittest.TestCase):

    def setUp(self):
        self.app = Flask(__name__)
        self.app.config["TESTING"] = True
        self.app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        self.app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

        db.init_app(self.app)

        with self.app.app_context():
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

    def test_create_root_folder(self):
        with self.app.app_context():
            user = self.create_user()

            folder = Folder(
                name="Documents",
                user_id=user.id
            )

            db.session.add(folder)
            db.session.commit()

            saved_folder = Folder.query.filter_by(name="Documents").first()

            self.assertIsNotNone(saved_folder)
            self.assertEqual(saved_folder.user_id, user.id)
            self.assertIsNone(saved_folder.parent_folder_id)
            self.assertIsNotNone(saved_folder.created_at)

    def test_create_nested_folder(self):
        with self.app.app_context():
            user = self.create_user()

            parent_folder = Folder(
                name="Documents",
                user_id=user.id
            )

            db.session.add(parent_folder)
            db.session.commit()

            child_folder = Folder(
                name="School",
                user_id=user.id,
                parent_folder_id=parent_folder.id
            )

            db.session.add(child_folder)
            db.session.commit()

            saved_child = Folder.query.filter_by(name="School").first()

            self.assertIsNotNone(saved_child)
            self.assertEqual(saved_child.parent_folder_id, parent_folder.id)
            self.assertEqual(saved_child.user_id, user.id)

    def test_duplicate_folder_name_in_same_parent_is_rejected(self):
        with self.app.app_context():
            user = self.create_user()

            folder1 = Folder(
                name="Documents",
                user_id=user.id
            )

            db.session.add(folder1)
            db.session.commit()

            folder2 = Folder(
                name="Documents",
                user_id=user.id
            )

            db.session.add(folder2)

            with self.assertRaises(Exception):
                db.session.commit()

            db.session.rollback()

    def test_same_folder_name_in_different_parents_is_allowed(self):
        with self.app.app_context():
            user = self.create_user()

            parent1 = Folder(
                name="School",
                user_id=user.id
            )

            parent2 = Folder(
                name="Work",
                user_id=user.id
            )

            db.session.add_all([parent1, parent2])
            db.session.commit()

            folder1 = Folder(
                name="Documents",
                user_id=user.id,
                parent_folder_id=parent1.id
            )

            folder2 = Folder(
                name="Documents",
                user_id=user.id,
                parent_folder_id=parent2.id
            )

            db.session.add_all([folder1, folder2])
            db.session.commit()

            folders = Folder.query.filter_by(name="Documents").all()

            self.assertEqual(len(folders), 2)


if __name__ == "__main__":
    unittest.main()