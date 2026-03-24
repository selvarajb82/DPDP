import logging
from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

limiter = Limiter(key_func=get_remote_address)


def create_app() -> Flask:
    app = Flask(__name__)

    from app.config import Config
    app.config["SECRET_KEY"] = Config.SECRET_KEY
    app.config["DEBUG"] = Config.DEBUG

    CORS(app, resources={r"/api/*": {"origins": [Config.FRONTEND_URL, "http://localhost:5173"]}})

    limiter.init_app(app)

    from app.routes.assessment import assessment_bp
    from app.routes.payment import payment_bp
    from app.routes.report import report_bp

    app.register_blueprint(assessment_bp, url_prefix="/api/assessment")
    app.register_blueprint(payment_bp, url_prefix="/api/payment")
    app.register_blueprint(report_bp, url_prefix="/api/report")

    @app.get("/api/health")
    def health():
        from app.database import check_db_connection
        db_ok = check_db_connection()
        return {"status": "healthy" if db_ok else "degraded", "database": db_ok}, 200 if db_ok else 503

    return app
