import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import Config

logger = logging.getLogger(__name__)


class Base(DeclarativeBase):
    pass


_is_sqlite = Config.DATABASE_URL.startswith("sqlite")
if _is_sqlite:
    from sqlalchemy.pool import StaticPool
    engine = create_engine(
        Config.DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    engine = create_engine(
        Config.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Yield a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Import all models and create tables if they don't exist."""
    from app.models import assessment, report, payment, email_log  # noqa
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialised.")


def check_db_connection() -> bool:
    """Health check for database connectivity."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error("Database connection failed: %s", e)
        return False
