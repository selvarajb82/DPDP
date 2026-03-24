import uuid
import secrets
import logging
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import relationship, Session
from app.database import Base

logger = logging.getLogger(__name__)


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    risk_score = Column(Integer, nullable=False)
    preview_data = Column(JSON, nullable=True)
    full_data = Column(JSON, nullable=True)
    pdf_path = Column(String(500), nullable=True)
    access_token = Column(String(64), unique=True, nullable=True, index=True)
    is_paid = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    assessment = relationship("Assessment", back_populates="reports")

    def to_preview_dict(self) -> dict:
        return {
            "id": self.id,
            "assessment_id": self.assessment_id,
            "risk_score": self.risk_score,
            "preview_data": self.preview_data,
            "is_paid": self.is_paid,
            "access_token": self.access_token if self.is_paid else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def to_full_dict(self) -> dict:
        return {
            "id": self.id,
            "assessment_id": self.assessment_id,
            "risk_score": self.risk_score,
            "preview_data": self.preview_data,
            "full_data": self.full_data,
            "pdf_path": self.pdf_path,
            "access_token": self.access_token,
            "is_paid": self.is_paid,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


def create_report(db: Session, assessment_id: str, risk_score: int, preview_data: dict) -> Report:
    access_token = secrets.token_urlsafe(48)
    report = Report(
        assessment_id=assessment_id,
        risk_score=risk_score,
        preview_data=preview_data,
        access_token=access_token,
        is_paid=False,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    logger.info("Report created for assessment: %s", assessment_id)
    return report


def get_report_by_assessment_id(db: Session, assessment_id: str) -> Report | None:
    return db.query(Report).filter_by(assessment_id=assessment_id).first()


def get_report_by_access_token(db: Session, access_token: str) -> Report | None:
    return db.query(Report).filter_by(access_token=access_token).first()


def update_report_full_data(db: Session, report_id: str, full_data: dict) -> Report | None:
    report = db.query(Report).filter_by(id=report_id).first()
    if report:
        report.full_data = full_data
        db.commit()
        db.refresh(report)
        logger.info("Report full_data updated: %s", report_id)
    return report


def update_report_pdf_path(db: Session, report_id: str, pdf_path: str) -> Report | None:
    report = db.query(Report).filter_by(id=report_id).first()
    if report:
        report.pdf_path = pdf_path
        db.commit()
        db.refresh(report)
    return report


def mark_report_paid(db: Session, assessment_id: str) -> Report | None:
    report = db.query(Report).filter_by(assessment_id=assessment_id).first()
    if report:
        report.is_paid = True
        db.commit()
        db.refresh(report)
        logger.info("Report marked as paid for assessment: %s", assessment_id)
    return report
