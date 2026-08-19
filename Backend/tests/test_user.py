import unittest

from flask import Flask

from app import db
from app.models.user import User


class UserModelTestCase(unittest.TestCase):

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

    def test_create_user(self):
        with self.app.app_context():
            user = User(
                username="testuser",
                email="test@example.com",
                password_hash="hashed_password"
            )

            db.session.add(user)
            db.session.commit()

            saved_user = User.query.filter_by(username="testuser").first()

            self.assertIsNotNone(saved_user)
            self.assertEqual(saved_user.email, "test@example.com")
            self.assertEqual(saved_user.password_hash, "hashed_password")
            self.assertIsNotNone(saved_user.created_at)

    def test_username_is_unique(self):
        with self.app.app_context():
            user1 = User(
                username="testuser",
                email="one@example.com",
                password_hash="hashed_password"
            )

            user2 = User(
                username="testuser",
                email="two@example.com",
                password_hash="hashed_password"
            )

            db.session.add(user1)
            db.session.commit()

            db.session.add(user2)

            with self.assertRaises(Exception):
                db.session.commit()

            db.session.rollback()

    def test_email_is_unique(self):
        with self.app.app_context():
            user1 = User(
                username="userone",
                email="test@example.com",
                password_hash="hashed_password"
            )

            user2 = User(
                username="usertwo",
                email="test@example.com",
                password_hash="hashed_password"
            )

            db.session.add(user1)
            db.session.commit()

            db.session.add(user2)

            with self.assertRaises(Exception):
                db.session.commit()

            db.session.rollback()


if __name__ == "__main__":
    unittest.main()