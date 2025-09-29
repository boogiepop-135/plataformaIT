from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Text, DateTime, Integer, JSON
from datetime import datetime
import json

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean(), nullable=False, default=True)
    name = db.Column(db.String(100), nullable=True)
    # 'admin', 'user', 'viewer'
    role = db.Column(db.String(50), nullable=False, default='viewer')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "created_by": self.created_by,
            # do not serialize the password, its a security breach
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

    assignee = db.relationship("User", backref="assigned_tickets")

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
