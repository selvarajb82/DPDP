import uuid
import logging
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import relationship, Session
from app.database import Base

logger = logging.getLogger(__name__)


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    razorpay_payment_id = Column(String(255), unique=True, nullable=True)
    amount = Column(Integer, nullable=False)
    currency = Column(String(10), nullable=False, default="INR")
    status = Column(String(20), nullable=False, default="pending")
    webhook_payload = Column(JSON, nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    assessment = relationship("Assessment", back_populates="payments")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "assessment_id": self.assessment_id,
            "razorpay_payment_id": self.razorpay_payment_id,
            "amount": self.amount,
            "currency": self.currency,
            "status": self.status,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


def create_payment(db: Session, assessment_id: str, amount: int = 99900) -> Payment:
    payment = Payment(
        assessment_id=assessment_id,
        amount=amount,
        currency="INR",
        status="pending",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def mark_payment_success(db: Session, assessment_id: str, razorpay_payment_id: str,
                         webhook_payload: dict) -> Payment | None:
    from datetime import datetime, timezone
    payment = db.query(Payment).filter_by(assessment_id=assessment_id).first()
    if payment:
        payment.status = "success"
        payment.razorpay_payment_id = razorpay_payment_id
        payment.webhook_payload = webhook_payload
        payment.paid_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(payment)
        logger.info("Payment marked success: %s", razorpay_payment_id)
    return payment


def get_payment_by_assessment(db: Session, assessment_id: str) -> Payment | None:
    return db.query(Payment).filter_by(assessment_id=assessment_id).first()
