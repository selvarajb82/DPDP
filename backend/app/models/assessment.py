import uuid
import logging
from sqlalchemy import Column, String, DateTime, func, CheckConstraint, JSON
from sqlalchemy.orm import relationship, Session
from app.database import Base

logger = logging.getLogger(__name__)


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_token = Column(String(64), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=True)
    business_name = Column(String(255), nullable=True)
    answers = Column(JSON, nullable=False, default=dict)
    status = Column(String(20), nullable=False, default="pending", server_default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'previewed', 'paid', 'completed')",
            name="ck_assessment_status",
        ),
    )

    reports = relationship("Report", back_populates="assessment", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="assessment", cascade="all, delete-orphan")
    email_logs = relationship("EmailLog", back_populates="assessment")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "session_token": self.session_token,
            "email": self.email,
            "business_name": self.business_name,
            "answers": self.answers,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


def create_assessment(db: Session, session_token: str, answers: dict,
                      email: str = None, business_name: str = None) -> Assessment:
    assessment = Assessment(
        session_token=session_token,
        answers=answers,
        email=email,
        business_name=business_name,
        status="pending",
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    logger.info("Assessment created: %s", assessment.id)
    return assessment


def get_assessment_by_token(db: Session, session_token: str) -> Assessment | None:
    return db.query(Assessment).filter_by(session_token=session_token).first()


def get_assessment_by_id(db: Session, assessment_id: str) -> Assessment | None:
    return db.query(Assessment).filter_by(id=assessment_id).first()


def update_assessment_status(db: Session, assessment_id: str, status: str) -> Assessment | None:
    assessment = db.query(Assessment).filter_by(id=assessment_id).first()
    if assessment:
        assessment.status = status
        db.commit()
        db.refresh(assessment)
    return assessment
