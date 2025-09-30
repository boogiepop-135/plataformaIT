"""
Nuevos modelos para la arquitectura de ticketing mejorada
"""
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Text, DateTime, Integer, JSON, Enum
from datetime import datetime
import json
from werkzeug.security import generate_password_hash, check_password_hash

# Agregar a models.py existente

class Department(db.Model):
    """Modelo para departamentos de la empresa"""
    __tablename__ = 'departments'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    
    # Relaciones
    admins = db.relationship('AdminDepartment', back_populates='department', lazy='dynamic')
    tickets = db.relationship('Ticket', back_populates='department', lazy='dynamic')
    
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "created_by": self.created_by,
            "admin_count": self.admins.filter_by(is_active=True).count(),
            "ticket_count": self.tickets.count()
        }


class AdminDepartment(db.Model):
    """Tabla de relación muchos a muchos entre Admins y Departamentos"""
    __tablename__ = 'admin_departments'
    
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    assigned_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    
    # Relaciones
    admin = db.relationship('User', foreign_keys=[admin_id], back_populates='admin_departments')
    department = db.relationship('Department', back_populates='admins')
    assigned_by_user = db.relationship('User', foreign_keys=[assigned_by])
    
    # Índice único para evitar duplicados
    __table_args__ = (db.UniqueConstraint('admin_id', 'department_id', 'is_active'),)
    
    def serialize(self):
        return {
            "id": self.id,
            "admin_id": self.admin_id,
            "admin_name": self.admin.name if self.admin else None,
            "department_id": self.department_id,
            "department_name": self.department.name if self.department else None,
            "assigned_at": self.assigned_at.isoformat() if self.assigned_at else None,
            "assigned_by": self.assigned_by,
            "is_active": self.is_active
        }


# Actualizar modelo Ticket existente
class TicketEnhanced(db.Model):
    """Modelo de Ticket mejorado con departamentos y flujo completo"""
    __tablename__ = 'tickets'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    
    # Estados mejorados
    status = db.Column(db.Enum('open', 'in_progress', 'resolved', 'closed', name='ticket_status'), 
                      default='open', nullable=False)
    priority = db.Column(db.Enum('low', 'medium', 'high', 'urgent', name='ticket_priority'), 
                        default='medium', nullable=False)
    
    # Creador y solicitante
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    requester_name = db.Column(db.String(100), nullable=True)  # Para usuarios externos
    requester_email = db.Column(db.String(120), nullable=True)
    
    # Asignación y departamento
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=True)
    assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    assigned_at = db.Column(db.DateTime, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)
    
    # Sistema de calificación mejorado
    rating = db.Column(db.Integer, nullable=True)  # 1-5 estrellas
    rating_comment = db.Column(db.Text, nullable=True)
    rated_at = db.Column(db.DateTime, nullable=True)
    
    # Metadatos adicionales
    attachments = db.Column(db.JSON, nullable=True)  # Lista de archivos adjuntos
    internal_notes = db.Column(db.Text, nullable=True)  # Notas internas para admins
    
    # Relaciones
    creator = db.relationship('User', foreign_keys=[created_by], back_populates='created_tickets')
    assignee = db.relationship('User', foreign_keys=[assigned_to], back_populates='assigned_tickets')
    department = db.relationship('Department', back_populates='tickets')
    comments = db.relationship('TicketComment', back_populates='ticket', lazy='dynamic')
    history = db.relationship('TicketHistory', back_populates='ticket', lazy='dynamic')
    
    def serialize(self, include_internal=False):
        """Serializar ticket con opciones de privacidad"""
        data = {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
            "created_by": self.created_by,
            "creator_name": self.creator.name if self.creator else self.requester_name,
            "creator_email": self.creator.email if self.creator else self.requester_email,
            "department_id": self.department_id,
            "department_name": self.department.name if self.department else "General",
            "assigned_to": self.assigned_to,
            "assignee_name": self.assignee.name if self.assignee else None,
            "assigned_at": self.assigned_at.isoformat() if self.assigned_at else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "rating": self.rating,
            "rating_comment": self.rating_comment,
            "rated_at": self.rated_at.isoformat() if self.rated_at else None,
            "attachments": self.attachments or [],
            "comment_count": self.comments.count(),
            "can_rate": self.status == 'resolved' and not self.rating
        }
        
        # Incluir datos sensibles solo para admins
        if include_internal:
            data["internal_notes"] = self.internal_notes
            
        return data


class TicketComment(db.Model):
    """Comentarios en tickets con soporte para notas internas"""
    __tablename__ = 'ticket_comments'
    
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    comment = db.Column(db.Text, nullable=False)
    is_internal = db.Column(db.Boolean, default=False)  # Solo visible para admins
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    ticket = db.relationship('TicketEnhanced', back_populates='comments')
    user = db.relationship('User')
    
    def serialize(self, include_internal=False):
        if self.is_internal and not include_internal:
            return None
            
        return {
            "id": self.id,
            "ticket_id": self.ticket_id,
            "user_id": self.user_id,
            "user_name": self.user.name if self.user else "Usuario Eliminado",
            "comment": self.comment,
            "is_internal": self.is_internal,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class TicketHistory(db.Model):
    """Historial de cambios en tickets para auditoría"""
    __tablename__ = 'ticket_history'
    
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=False)
    changed_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    field_name = db.Column(db.String(50), nullable=False)  # 'status', 'assigned_to', etc.
    old_value = db.Column(db.Text, nullable=True)
    new_value = db.Column(db.Text, nullable=True)
    change_reason = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    ticket = db.relationship('TicketEnhanced', back_populates='history')
    user = db.relationship('User')
    
    def serialize(self):
        return {
            "id": self.id,
            "ticket_id": self.ticket_id,
            "changed_by": self.changed_by,
            "user_name": self.user.name if self.user else "Usuario Eliminado",
            "field_name": self.field_name,
            "old_value": self.old_value,
            "new_value": self.new_value,
            "change_reason": self.change_reason,
            "created_at": self.created_at.isoformat()
        }


class NotificationEnhanced(db.Model):
    """Sistema de notificaciones mejorado"""
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.Enum('info', 'success', 'warning', 'error', name='notification_type'), 
                    default='info', nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    related_ticket_id = db.Column(db.Integer, db.ForeignKey('tickets.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=True)
    
    # Relaciones
    user = db.relationship('User')
    related_ticket = db.relationship('TicketEnhanced')
    
    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "related_ticket_id": self.related_ticket_id,
            "related_ticket_title": self.related_ticket.title if self.related_ticket else None,
            "created_at": self.created_at.isoformat(),
            "expires_at": self.expires_at.isoformat() if self.expires_at else None
        }


# Actualizar modelo User existente para agregar relaciones
def extend_user_model():
    """Extensiones al modelo User existente"""
    # Agregar relaciones para departamentos
    User.admin_departments = db.relationship('AdminDepartment', 
                                           foreign_keys='AdminDepartment.admin_id',
                                           back_populates='admin', 
                                           lazy='dynamic')
    
    # Agregar relaciones para tickets
    User.created_tickets = db.relationship('TicketEnhanced', 
                                         foreign_keys='TicketEnhanced.created_by',
                                         back_populates='creator', 
                                         lazy='dynamic')
    
    User.assigned_tickets = db.relationship('TicketEnhanced', 
                                          foreign_keys='TicketEnhanced.assigned_to',
                                          back_populates='assignee', 
                                          lazy='dynamic')
    
    def get_user_departments(self):
        """Obtener departamentos asignados a un admin"""
        if self.role != 'admin':
            return []
        return [ad.department for ad in self.admin_departments.filter_by(is_active=True)]
    
    def can_access_ticket(self, ticket):
        """Verificar si el usuario puede acceder a un ticket específico"""
        if self.role == 'super_admin':
            return True
        elif self.role == 'admin':
            # Admin puede ver tickets de sus departamentos
            user_dept_ids = [d.id for d in self.get_user_departments()]
            return ticket.department_id in user_dept_ids or ticket.assigned_to == self.id
        elif self.role == 'usuario':
            # Usuario solo ve sus propios tickets
            return ticket.created_by == self.id
        return False
    
    def can_manage_ticket(self, ticket):
        """Verificar si el usuario puede gestionar (modificar) un ticket"""
        if self.role == 'super_admin':
            return True
        elif self.role == 'admin':
            # Admin puede gestionar tickets asignados a él o de sus departamentos
            user_dept_ids = [d.id for d in self.get_user_departments()]
            return ticket.department_id in user_dept_ids or ticket.assigned_to == self.id
        return False
    
    # Agregar métodos al modelo User
    User.get_user_departments = get_user_departments
    User.can_access_ticket = can_access_ticket
    User.can_manage_ticket = can_manage_ticket