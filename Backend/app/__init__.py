from flask import Flask, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_marshmallow import Marshmallow

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()
ma = Marshmallow()

def create_app(config_override=None):
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    if config_override:
        app.config.update(config_override)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app)
    ma.init_app(app)

    @app.route('/health')
    def health_check():
        return {"status": "healthy"}, 200

    @app.post('/api/search')
    def search_files():
        from app.search import rank_files

        payload = request.get_json(silent=True) or {}
        query = str(payload.get('query', '')).strip()
        files = payload.get('files', [])
        if not isinstance(files, list):
            return {"error": "files must be an array"}, 400
        return {"query": query, "provider": "ollama", "results": rank_files(files, query)}, 200

    return app