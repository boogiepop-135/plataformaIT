from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Text, DateTime, Integer, JSON
from datetime import datetime
import json
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean(), nullable=False, default=True)
    is_suspended = db.Column(db.Boolean(), nullable=False, default=False)
    suspension_reason = db.Column(db.Text, nullable=True)
    suspended_by = db.Column(
        db.Integer, db.ForeignKey('user.id'), nullable=True)
    suspended_at = db.Column(db.DateTime, nullable=True)
    name = db.Column(db.String(100), nullable=True)
    # 'super_admin', 'admin-rh-financiero', 'usuario'
    role = db.Column(db.String(50), nullable=False, default='usuario')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    def set_password(self, password):
        """Set password hash from plain text password"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Check if provided password matches hash"""
        return check_password_hash(self.password_hash, password)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "is_active": self.is_active,
            "is_suspended": self.is_suspended,
            "suspension_reason": self.suspension_reason,
            "suspended_by": self.suspended_by,
            "suspended_at": self.suspended_at.isoformat() if self.suspended_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "created_by": self.created_by,
            # do not serialize the password hash, its a security breach
        }


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    # todo, in_progress, review, done
    status = db.Column(db.String(50), default="todo")
    # low, medium, high, urgent
    priority = db.Column(db.String(50), default="medium")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    due_date = db.Column(db.DateTime, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    user = db.relationship("User", backref="tasks")

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "user_id": self.user_id,
        }


class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    # open, in_progress, resolved, closed
    status = db.Column(db.String(50), default="open")
    # low, medium, high, urgent
    priority = db.Column(db.String(50), default="medium")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    assigned_to = db.Column(
        db.Integer, db.ForeignKey('user.id'), nullable=True)
    requester_name = db.Column(db.String(100), nullable=True)
    requester_email = db.Column(db.String(120), nullable=True)
    # Sistema de calificación
    rating = db.Column(db.Integer, nullable=True)  # 1-3 estrellas
    rating_comment = db.Column(db.Text, nullable=True)
    rated_at = db.Column(db.DateTime, nullable=True)
    rated_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    assignee = db.relationship("User", foreign_keys=[
                               assigned_to], backref="assigned_tickets")
    rater = db.relationship("User", foreign_keys=[
                            rated_by], backref="rated_tickets")

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "assigned_to": self.assigned_to,
            "requester_name": self.requester_name,
            "requester_email": self.requester_email,
            "rating": self.rating,
            "rating_comment": self.rating_comment,
            "rated_at": self.rated_at.isoformat() if self.rated_at else None,
            "rated_by": self.rated_by,
        }


class CalendarEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    # visit, maintenance, meeting, other
    event_type = db.Column(db.String(50), default="other")
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=True)
    all_day = db.Column(db.Boolean(), default=False)
    location = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    # Campos para mantenimientos
    equipment = db.Column(db.String(200), nullable=True)  # Nombre del equipo
    branch = db.Column(db.String(200), nullable=True)     # Sucursal
    maintenance_type = db.Column(
        db.String(100), nullable=True)  # Tipo de mantenimiento

    # Campos para eventos recurrentes
    # ID para agrupar eventos recurrentes
    recurrence_id = db.Column(db.String(100), nullable=True)
    is_recurring = db.Column(db.Boolean(), default=False)
    # weekly, biweekly, monthly, custom
    recurrence_pattern = db.Column(db.String(50), nullable=True)

    user = db.relationship("User", backref="events")

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "event_type": self.event_type,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "all_day": self.all_day,
            "location": self.location,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "user_id": self.user_id,
            "equipment": self.equipment,
            "branch": self.branch,
            "maintenance_type": self.maintenance_type,
            "recurrence_id": self.recurrence_id,
            "is_recurring": self.is_recurring,
            "recurrence_pattern": self.recurrence_pattern,
        }


class Matrix(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    # 'decision', 'risk', 'bcg', 'swot', 'eisenhower', 'custom'
    matrix_type = db.Column(db.String(100), nullable=False)
    rows = db.Column(db.Integer, nullable=False, default=2)
    columns = db.Column(db.Integer, nullable=False, default=2)
    # Almacena los datos de la matriz en formato JSON
    data = db.Column(db.JSON, nullable=True)
    # Almacena los encabezados de filas y columnas
    headers = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    user = db.relationship("User", backref="matrices")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "matrix_type": self.matrix_type,
            "rows": self.rows,
            "columns": self.columns,
            "data": self.data if self.data else {},
            "headers": self.headers if self.headers else {"rows": [], "columns": []},
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "user_id": self.user_id,
        }


class JournalEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    entry_date = db.Column(db.DateTime, nullable=False,
                           default=datetime.utcnow)
    # work, personal, meeting, maintenance, issue, achievement, note
    category = db.Column(db.String(50), default="work")
    # low, medium, high, urgent
    priority = db.Column(db.String(50), default="medium")
    # pending, completed, cancelled
    status = db.Column(db.String(50), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    # Campos adicionales para la bitácora
    hours_worked = db.Column(db.Float, nullable=True)  # Horas trabajadas
    location = db.Column(db.String(200), nullable=True)  # Ubicación/Oficina
    tags = db.Column(db.Text, nullable=True)  # Tags separados por comas
    # Referencias a archivos adjuntos
    attachments = db.Column(db.JSON, nullable=True)

    user = db.relationship("User", backref="journal_entries")

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "entry_date": self.entry_date.isoformat() if self.entry_date else None,
            "category": self.category,
            "priority": self.priority,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "user_id": self.user_id,
            "hours_worked": self.hours_worked,
            "location": self.location,
            "tags": self.tags.split(",") if self.tags else [],
            "attachments": self.attachments if self.attachments else [],
        }


class PaymentReminder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    amount = db.Column(db.Float, nullable=True)
    currency = db.Column(db.String(10), default='USD')
    due_date = db.Column(db.DateTime, nullable=False)
    # pending, paid, overdue, cancelled
    status = db.Column(db.String(50), default='pending')
    # monthly, quarterly, annually, one_time
    recurrence = db.Column(db.String(50), default='one_time')
    # Días antes de vencimiento para recordar
    reminder_days = db.Column(db.Integer, default=7)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    user = db.relationship("User", backref="payment_reminders")

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "amount": self.amount,
            "currency": self.currency,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "status": self.status,
            "recurrence": self.recurrence,
            "reminder_days": self.reminder_days,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "user_id": self.user_id,
        }


class ServiceOrder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    client_name = db.Column(db.String(200), nullable=False)
    client_email = db.Column(db.String(120), nullable=True)
    client_phone = db.Column(db.String(50), nullable=True)
    # maintenance, installation, support, etc.
    service_type = db.Column(db.String(100), nullable=False)
    # pending, in_progress, completed, cancelled
    status = db.Column(db.String(50), default='pending')
    # low, medium, high, urgent
    priority = db.Column(db.String(50), default='medium')
    estimated_hours = db.Column(db.Float, nullable=True)
    hourly_rate = db.Column(db.Float, nullable=True)
    # JSON para almacenar el estado mensual {month_year: {completed: bool, completed_date: date}}
    monthly_status = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    assigned_to = db.Column(
        db.Integer, db.ForeignKey('user.id'), nullable=True)
    created_by = db.Column(
        db.Integer, db.ForeignKey('user.id'), nullable=False)

    assignee = db.relationship("User", foreign_keys=[
                               assigned_to], backref="assigned_service_orders")
    creator = db.relationship("User", foreign_keys=[
                              created_by], backref="created_service_orders")

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "client_name": self.client_name,
            "client_email": self.client_email,
            "client_phone": self.client_phone,
            "service_type": self.service_type,
            "status": self.status,
            "priority": self.priority,
            "estimated_hours": self.estimated_hours,
            "hourly_rate": self.hourly_rate,
            "monthly_status": self.monthly_status if self.monthly_status else {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "assigned_to": self.assigned_to,
            "created_by": self.created_by,
        }


class MatrixHistory(db.Model):
    """Historial de cambios en matrices"""
    id = db.Column(db.Integer, primary_key=True)
    matrix_id = db.Column(db.Integer, db.ForeignKey(
        'matrix.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    # 'created', 'updated', 'deleted'
    action = db.Column(db.String(50), nullable=False)
    # JSON con los cambios específicos
    changes = db.Column(db.JSON, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    matrix = db.relationship("Matrix", backref="history")
    user = db.relationship("User", backref="matrix_changes")

    def serialize(self):
        return {
            "id": self.id,
            "matrix_id": self.matrix_id,
            "user_id": self.user_id,
            "action": self.action,
            "changes": self.changes,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "user_name": self.user.name if self.user else None
        }


class SystemNotification(db.Model):
    """Notificaciones del sistema"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    # info, warning, error, success
    notification_type = db.Column(db.String(50), default='info')
    is_read = db.Column(db.Boolean(), default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=True)  # Fecha de expiración

    user = db.relationship("User", backref="notifications")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "message": self.message,
            "notification_type": self.notification_type,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None
        }


class SystemBackup(db.Model):
    """Registro de backups del sistema"""
    id = db.Column(db.Integer, primary_key=True)
    # 'automatic', 'manual'
    backup_type = db.Column(db.String(50), nullable=False)
    file_path = db.Column(db.String(500), nullable=True)
    file_size = db.Column(db.BigInteger, nullable=True)  # Tamaño en bytes
    # in_progress, completed, failed
    status = db.Column(db.String(50), default='in_progress')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    creator = db.relationship("User", backref="backups_created")

    def serialize(self):
        return {
            "id": self.id,
            "backup_type": self.backup_type,
            "file_path": self.file_path,
            "file_size": self.file_size,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "created_by": self.created_by
        }


class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean(), default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
        }
