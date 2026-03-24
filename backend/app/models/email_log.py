import uuid
import logging
from sqlalchemy import Column, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship, Session
from app.database import Base

logger = logging.getLogger(__name__)


class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="SET NULL"), nullable=True)
    email = Column(String(255), nullable=True)
    type = Column(String(50), nullable=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())

    assessment = relationship("Assessment", back_populates="email_logs")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "assessment_id": self.assessment_id,
            "email": self.email,
            "type": self.type,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
        }


def log_email(db: Session, assessment_id: str, email: str, email_type: str) -> EmailLog:
    entry = EmailLog(
        assessment_id=assessment_id,
        email=email,
        type=email_type,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    logger.info("Email logged: type=%s, assessment=%s", email_type, assessment_id)
    return entry
