"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint, make_response
from api.models import db, User, Task, Ticket, CalendarEvent, Matrix, JournalEntry, PaymentReminder, ServiceOrder, MatrixHistory, SystemNotification, SystemBackup
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from datetime import datetime
from functools import wraps

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api, origins=[
    "http://localhost:3000",
    "https://localhost:3000",
    "http://127.0.0.1:3000",
    "https://informaticait.up.railway.app"
])


# Authentication helpers
def get_current_user():
    """Get current user from session/token - simplified for now"""
    # This is a simplified implementation
    # In a real app, you would extract user info from JWT token
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None

    token = auth_header.split(' ')[1]
    if token != "admin_authenticated":
        return None

    # For now, return a default admin user
    # In production, decode JWT and get real user info
    return {
        'id': 1,
        'email': 'admin@admin.com',
        'role': 'super_admin',  # Default to super_admin for now
        'name': 'Administrador'
    }

# Authentication decorators


def get_current_user():
    """Obtiene el usuario actual desde el token"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None

    token = auth_header.split(' ')[1]
    if token != "admin_authenticated":
        return None

    # Obtener el usuario de la base de datos
    try:
        user = User.query.filter_by(email="admin").first()
        if user:
            return {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "role": user.role
            }
    except:
        pass
    
    # Fallback si no se encuentra en la DB
    return {"id": 1, "role": "super_admin", "name": "Super Admin User", "email": "admin"}


def auth_required(f):
    """Decorador base que requiere autenticación"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function


def role_required(allowed_roles):
    """Decorador que permite especificar múltiples roles autorizados"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user = get_current_user()
            if not user:
                return jsonify({"error": "Authentication required"}), 401
            
            if isinstance(allowed_roles, str):
                allowed_roles_list = [allowed_roles]
            else:
                allowed_roles_list = allowed_roles
            
            if user['role'] not in allowed_roles_list:
                return jsonify({"error": "Insufficient permissions"}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def super_admin_required(f):
    """Solo super_admin puede acceder"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Authentication required"}), 401
        
        if user['role'] != 'super_admin':
            return jsonify({"error": "Super admin access required"}), 403
        
        return f(*args, **kwargs)
    return decorated_function


def admin_or_super_required(f):
    """admin-rh-financiero o super_admin pueden acceder"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Authentication required"}), 401
        
        if user['role'] not in ['super_admin', 'admin-rh-financiero']:
            return jsonify({"error": "Admin access required"}), 403
        
        return f(*args, **kwargs)
    return decorated_function


# Mantener admin_required para compatibilidad con código existente
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        return auth_required(f)(*args, **kwargs)
    return decorated_function


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200

# TASK ROUTES


@api.route('/tasks', methods=['GET'])
def get_tasks():
    try:
        tasks = Task.query.all()
        return jsonify([task.serialize() for task in tasks]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/tasks', methods=['POST'])
@admin_required
def create_task():
    try:
        data = request.get_json()

        new_task = Task(
            title=data.get('title'),
            description=data.get('description', ''),
            status=data.get('status', 'todo'),
            priority=data.get('priority', 'medium'),
            due_date=datetime.fromisoformat(
                data.get('due_date')) if data.get('due_date') else None,
            user_id=data.get('user_id')
        )

        db.session.add(new_task)
        db.session.commit()

        return jsonify(new_task.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/tasks/<int:task_id>', methods=['PUT'])
@admin_required
def update_task(task_id):
    try:
        task = Task.query.get_or_404(task_id)
        data = request.get_json()

        if 'title' in data:
            task.title = data['title']
        if 'description' in data:
            task.description = data['description']
        if 'status' in data:
            task.status = data['status']
        if 'priority' in data:
            task.priority = data['priority']
        if 'due_date' in data:
            task.due_date = datetime.fromisoformat(
                data['due_date']) if data['due_date'] else None

        task.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify(task.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/tasks/<int:task_id>', methods=['DELETE'])
@admin_required
def delete_task(task_id):
    try:
        task = Task.query.get_or_404(task_id)
        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Task deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# TICKET ROUTES


@api.route('/tickets', methods=['GET'])
def get_tickets():
    try:
        tickets = Ticket.query.all()
        return jsonify([ticket.serialize() for ticket in tickets]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/tickets', methods=['POST'])
def create_ticket():
    try:
        data = request.get_json()

        new_ticket = Ticket(
            title=data.get('title'),
            description=data.get('description', ''),
            status=data.get('status', 'open'),
            priority=data.get('priority', 'medium'),
            assigned_to=data.get('assigned_to'),
            requester_name=data.get('requester_name'),
            requester_email=data.get('requester_email')
        )

        db.session.add(new_ticket)
        db.session.commit()

        return jsonify(new_ticket.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/tickets/<int:ticket_id>', methods=['PUT'])
@admin_required
def update_ticket(ticket_id):
    try:
        ticket = Ticket.query.get_or_404(ticket_id)
        data = request.get_json()

        if 'title' in data:
            ticket.title = data['title']
        if 'description' in data:
            ticket.description = data['description']
        if 'status' in data:
            ticket.status = data['status']
        if 'priority' in data:
            ticket.priority = data['priority']
        if 'assigned_to' in data:
            ticket.assigned_to = data['assigned_to']

        ticket.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify(ticket.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/tickets/<int:ticket_id>', methods=['DELETE'])
@admin_required
def delete_ticket(ticket_id):
    try:
        ticket = Ticket.query.get_or_404(ticket_id)
        db.session.delete(ticket)
        db.session.commit()
        return jsonify({"message": "Ticket deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/tickets/<int:ticket_id>/rate', methods=['POST'])
@admin_required
def rate_ticket(ticket_id):
    """Rate a resolved ticket with 1-3 stars and comment"""
    try:
        ticket = Ticket.query.get_or_404(ticket_id)
        current_user = get_current_user()
        data = request.get_json()

        # Verificar que el ticket esté resuelto
        if ticket.status != 'resolved':
            return jsonify({"error": "Solo se pueden calificar tickets resueltos"}), 400

        # Verificar que el usuario puede calificar (creador del ticket o admin)
        if (ticket.requester_email != current_user.get('email') and
                current_user['role'] not in ['admin', 'super_admin', 'hr']):
            return jsonify({"error": "No tienes permisos para calificar este ticket"}), 403

        # Validar calificación
        rating = data.get('rating')
        if not rating or rating not in [1, 2, 3]:
            return jsonify({"error": "La calificación debe ser 1, 2 o 3 estrellas"}), 400

        # Actualizar calificación
        ticket.rating = rating
        ticket.rating_comment = data.get('comment', '')
        ticket.rated_at = datetime.utcnow()
        ticket.rated_by = current_user['id']

        db.session.commit()

        # Crear notificación para el super admin
        notification = SystemNotification(
            user_id=1,  # Super admin
            title=f"Ticket Calificado: {ticket.title}",
            message=f"El ticket #{ticket.id} fue calificado con {rating} estrellas por {current_user['name']}",
            notification_type='info'
        )
        db.session.add(notification)
        db.session.commit()

        return jsonify({
            "message": "Ticket calificado exitosamente",
            "ticket": ticket.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# CALENDAR EVENT ROUTES


@api.route('/calendar-events', methods=['GET'])
def get_calendar_events():
    try:
        print("🔍 Getting calendar events...")
        events = CalendarEvent.query.all()
        print(f"🔍 Found {len(events)} events")
        result = [event.serialize() for event in events]
        print(f"🔍 Serialized events: {result}")
        return jsonify(result), 200
    except Exception as e:
        print(f"❌ Error in get_calendar_events: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@api.route('/calendar-events', methods=['POST'])
def create_calendar_event():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        if not data.get('title'):
            return jsonify({"error": "Title is required"}), 400

        if not data.get('start_date'):
            return jsonify({"error": "Start date is required"}), 400

        # Parse dates with better error handling
        try:
            start_date_str = data.get('start_date')
            if 'T' not in start_date_str:
                start_date_str += 'T00:00:00'
            start_date = datetime.fromisoformat(
                start_date_str.replace('Z', '+00:00'))
        except (ValueError, TypeError) as e:
            return jsonify({"error": f"Invalid start_date format: {str(e)}"}), 400

        end_date = None
        if data.get('end_date'):
            try:
                end_date_str = data.get('end_date')
                if 'T' not in end_date_str:
                    end_date_str += 'T23:59:59'
                end_date = datetime.fromisoformat(
                    end_date_str.replace('Z', '+00:00'))
            except (ValueError, TypeError) as e:
                return jsonify({"error": f"Invalid end_date format: {str(e)}"}), 400

        new_event = CalendarEvent(
            title=data.get('title'),
            description=data.get('description', ''),
            event_type=data.get('event_type', 'other'),
            start_date=start_date,
            end_date=end_date,
            all_day=data.get('all_day', False),
            location=data.get('location'),
            user_id=data.get('user_id'),
            equipment=data.get('equipment'),
            branch=data.get('branch'),
            maintenance_type=data.get('maintenance_type'),
            recurrence_id=data.get('recurrence_id'),
            is_recurring=data.get('is_recurring', False),
            recurrence_pattern=data.get('recurrence_pattern')
        )

        db.session.add(new_event)
        db.session.commit()

        return jsonify(new_event.serialize()), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating calendar event: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@api.route('/calendar-events/<int:event_id>', methods=['PUT'])
def update_calendar_event(event_id):
    try:
        event = CalendarEvent.query.get_or_404(event_id)
        data = request.get_json()

        if 'title' in data:
            event.title = data['title']
        if 'description' in data:
            event.description = data['description']
        if 'event_type' in data:
            event.event_type = data['event_type']
        if 'start_date' in data:
            event.start_date = datetime.fromisoformat(data['start_date'])
        if 'end_date' in data:
            event.end_date = datetime.fromisoformat(
                data['end_date']) if data['end_date'] else None
        if 'all_day' in data:
            event.all_day = data['all_day']
        if 'location' in data:
            event.location = data['location']
        if 'equipment' in data:
            event.equipment = data['equipment']
        if 'branch' in data:
            event.branch = data['branch']
        if 'maintenance_type' in data:
            event.maintenance_type = data['maintenance_type']

        event.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify(event.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/calendar-events/<int:event_id>', methods=['DELETE'])
def delete_calendar_event(event_id):
    try:
        event = CalendarEvent.query.get_or_404(event_id)
        db.session.delete(event)
        db.session.commit()
        return jsonify({"message": "Event deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ENDPOINTS PARA EVENTOS RECURRENTES


@api.route('/calendar-events/<int:event_id>/update-recurring', methods=['PUT'])
def update_recurring_events(event_id):
    try:
        event = CalendarEvent.query.get_or_404(event_id)
        data = request.get_json()

        update_all = data.get('update_all', False)

        if update_all and event.recurrence_id:
            # Actualizar todos los eventos con el mismo recurrence_id
            events_to_update = CalendarEvent.query.filter_by(
                recurrence_id=event.recurrence_id).all()

            for recurring_event in events_to_update:
                if 'title' in data:
                    recurring_event.title = data['title']
                if 'description' in data:
                    recurring_event.description = data['description']
                if 'event_type' in data:
                    recurring_event.event_type = data['event_type']
                if 'location' in data:
                    recurring_event.location = data['location']
                if 'equipment' in data:
                    recurring_event.equipment = data['equipment']
                if 'branch' in data:
                    recurring_event.branch = data['branch']
                if 'maintenance_type' in data:
                    recurring_event.maintenance_type = data['maintenance_type']

                recurring_event.updated_at = datetime.utcnow()

            db.session.commit()
            return jsonify({"message": f"Updated {len(events_to_update)} recurring events"}), 200
        else:
            # Actualizar solo este evento
            if 'title' in data:
                event.title = data['title']
            if 'description' in data:
                event.description = data['description']
            if 'event_type' in data:
                event.event_type = data['event_type']
            if 'location' in data:
                event.location = data['location']
            if 'equipment' in data:
                event.equipment = data['equipment']
            if 'branch' in data:
                event.branch = data['branch']
            if 'maintenance_type' in data:
                event.maintenance_type = data['maintenance_type']

            event.updated_at = datetime.utcnow()
            db.session.commit()
            return jsonify(event.serialize()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/calendar-events/<int:event_id>/delete-recurring', methods=['DELETE'])
def delete_recurring_events(event_id):
    try:
        event = CalendarEvent.query.get_or_404(event_id)
        data = request.get_json()

        delete_all = data.get('delete_all', False)

        if delete_all and event.recurrence_id:
            # Eliminar todos los eventos con el mismo recurrence_id
            events_to_delete = CalendarEvent.query.filter_by(
                recurrence_id=event.recurrence_id).all()
            deleted_count = len(events_to_delete)

            for recurring_event in events_to_delete:
                db.session.delete(recurring_event)

            db.session.commit()
            return jsonify({"message": f"Deleted {deleted_count} recurring events"}), 200
        else:
            # Eliminar solo este evento
            db.session.delete(event)
            db.session.commit()
            return jsonify({"message": "Event deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# MATRIX ROUTES


@api.route('/matrices', methods=['GET'])
@admin_required
def get_matrices():
    """Get matrices - filtered by user role"""
    try:
        current_user = get_current_user()

        if current_user['role'] == 'super_admin':
            # Super admin ve todas las matrices
            matrices = Matrix.query.all()
        elif current_user['role'] == 'admin':
            # Admin ve todas las matrices
            matrices = Matrix.query.all()
        else:
            # Usuario normal solo ve las suyas
            matrices = Matrix.query.filter_by(user_id=current_user['id']).all()

        return jsonify([matrix.serialize() for matrix in matrices]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/matrices', methods=['POST'])
@admin_required
def create_matrix():
    try:
        data = request.get_json()
        current_user = get_current_user()

        if not data.get('name'):
            return jsonify({"error": "Name is required"}), 400

        if not data.get('matrix_type'):
            return jsonify({"error": "Matrix type is required"}), 400

        # Validar dimensiones
        rows = data.get('rows', 2)
        columns = data.get('columns', 2)

        if rows < 1 or columns < 1:
            return jsonify({"error": "Rows and columns must be at least 1"}), 400

        # Inicializar datos de la matriz
        matrix_data = {}
        for i in range(rows):
            for j in range(columns):
                matrix_data[f"{i}-{j}"] = ""

        # Inicializar headers según el tipo de matriz
        headers = {"rows": [], "columns": []}

        if data.get('matrix_type') == 'swot':
            headers = {
                "rows": ["Fortalezas", "Debilidades"],
                "columns": ["Oportunidades", "Amenazas"]
            }
        elif data.get('matrix_type') == 'eisenhower':
            headers = {
                "rows": ["Urgente", "No Urgente"],
                "columns": ["Importante", "No Importante"]
            }
        elif data.get('matrix_type') == 'bcg':
            headers = {
                "rows": ["Alto Crecimiento", "Bajo Crecimiento"],
                "columns": ["Alta Participación", "Baja Participación"]
            }
        elif data.get('matrix_type') == 'risk':
            headers = {
                "rows": ["Alta Probabilidad", "Media Probabilidad", "Baja Probabilidad"],
                "columns": ["Alto Impacto", "Medio Impacto", "Bajo Impacto"]
            }
        else:
            # Para matrices personalizadas, usar headers proporcionados o genéricos
            custom_headers = data.get('headers', {})
            headers["rows"] = custom_headers.get(
                'rows', [f"Fila {i+1}" for i in range(rows)])
            headers["columns"] = custom_headers.get(
                'columns', [f"Columna {j+1}" for j in range(columns)])

        new_matrix = Matrix(
            name=data.get('name'),
            description=data.get('description', ''),
            matrix_type=data.get('matrix_type'),
            rows=rows,
            columns=columns,
            data=matrix_data,
            headers=headers,
            user_id=current_user['id']  # Asignar al usuario actual
        )

        db.session.add(new_matrix)
        db.session.flush()  # Para obtener el ID

        # Registrar en el historial
        history_record = MatrixHistory(
            matrix_id=new_matrix.id,
            user_id=current_user['id'],
            action='created',
            changes={'name': new_matrix.name, 'type': new_matrix.matrix_type}
        )
        db.session.add(history_record)

        db.session.commit()

        return jsonify(new_matrix.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/matrices/<int:matrix_id>', methods=['GET'])
def get_matrix(matrix_id):
    try:
        matrix = Matrix.query.get_or_404(matrix_id)
        return jsonify(matrix.serialize()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/matrices/<int:matrix_id>', methods=['PUT'])
@admin_required
def update_matrix(matrix_id):
    try:
        matrix = Matrix.query.get_or_404(matrix_id)
        current_user = get_current_user()

        # Solo super_admin puede editar todo, admin y user solo lo suyo
        if current_user['role'] != 'super_admin' and matrix.user_id != current_user['id']:
            return jsonify({"error": "No tienes permisos para editar esta matriz"}), 403

        data = request.get_json()

        if 'name' in data:
            matrix.name = data['name']
        if 'description' in data:
            matrix.description = data['description']
        if 'data' in data:
            matrix.data = data['data']
        if 'headers' in data:
            matrix.headers = data['headers']
        if 'rows' in data:
            matrix.rows = data['rows']
        if 'columns' in data:
            matrix.columns = data['columns']

        matrix.updated_at = datetime.utcnow()

        # Registrar en el historial
        history_record = MatrixHistory(
            matrix_id=matrix_id,
            user_id=current_user['id'],
            action='updated',
            changes=data  # Guardar los cambios realizados
        )
        db.session.add(history_record)

        db.session.commit()

        return jsonify(matrix.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/matrices/<int:matrix_id>', methods=['DELETE'])
@admin_required
def delete_matrix(matrix_id):
    try:
        matrix = Matrix.query.get_or_404(matrix_id)
        current_user = get_current_user()

        # Solo super_admin puede eliminar todo, admin y user solo lo suyo
        if current_user['role'] != 'super_admin' and matrix.user_id != current_user['id']:
            return jsonify({"error": "No tienes permisos para eliminar esta matriz"}), 403

        # Registrar en el historial antes de eliminar
        history_record = MatrixHistory(
            matrix_id=matrix_id,
            user_id=current_user['id'],
            action='deleted',
            changes={'name': matrix.name, 'type': matrix.matrix_type}
        )
        db.session.add(history_record)

        db.session.delete(matrix)
        db.session.commit()
        return jsonify({"message": "Matrix deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/matrix-templates', methods=['GET'])
def get_matrix_templates():
    """Devuelve las plantillas predefinidas de matrices"""
    templates = {
        "swot": {
            "name": "Análisis SWOT",
            "description": "Matriz para análisis de Fortalezas, Oportunidades, Debilidades y Amenazas",
            "rows": 2,
            "columns": 2,
            "headers": {
                "rows": ["Fortalezas", "Debilidades"],
                "columns": ["Oportunidades", "Amenazas"]
            }
        },
        "eisenhower": {
            "name": "Matriz de Eisenhower",
            "description": "Matriz para priorización de tareas basada en urgencia e importancia",
            "rows": 2,
            "columns": 2,
            "headers": {
                "rows": ["Urgente", "No Urgente"],
                "columns": ["Importante", "No Importante"]
            }
        },
        "bcg": {
            "name": "Matriz BCG",
            "description": "Matriz Boston Consulting Group para análisis de portafolio",
            "rows": 2,
            "columns": 2,
            "headers": {
                "rows": ["Alto Crecimiento", "Bajo Crecimiento"],
                "columns": ["Alta Participación", "Baja Participación"]
            }
        },
        "risk": {
            "name": "Matriz de Riesgos",
            "description": "Matriz para evaluación de riesgos basada en probabilidad e impacto",
            "rows": 3,
            "columns": 3,
            "headers": {
                "rows": ["Alta Probabilidad", "Media Probabilidad", "Baja Probabilidad"],
                "columns": ["Alto Impacto", "Medio Impacto", "Bajo Impacto"]
            }
        },
        "decision": {
            "name": "Matriz de Decisión",
            "description": "Matriz para evaluar opciones contra criterios",
            "rows": 3,
            "columns": 3,
            "headers": {
                "rows": ["Opción 1", "Opción 2", "Opción 3"],
                "columns": ["Criterio 1", "Criterio 2", "Criterio 3"]
            }
        },
        "custom": {
            "name": "Matriz Personalizada",
            "description": "Matriz personalizable con dimensiones y headers definidos por el usuario",
            "rows": 3,
            "columns": 3,
            "headers": {
                "rows": ["Fila 1", "Fila 2", "Fila 3"],
                "columns": ["Columna 1", "Columna 2", "Columna 3"]
            }
        }
    }

    return jsonify(templates), 200


# AUTHENTICATION ROUTES

@api.route('/auth/login', methods=['POST'])
def admin_login():
    """Admin login endpoint"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"error": "Username and password required"}), 400

        # Check if user exists in database (admin or any role)
        user = User.query.filter_by(email=username).first()

        if user and user.is_active:
            # Check password using hash
            if user.check_password(password):
                # Update last login
                user.last_login = datetime.utcnow()
                db.session.commit()

                return jsonify({
                    "success": True,
                    "message": "Login successful",
                    "token": "admin_authenticated",
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "name": user.name,
                        "role": user.role
                    },
                    "expires_in": 3600
                }), 200

        # Fallback to hardcoded credentials for super admin
        if username == "admin" and password == "admin123":
            # Verificar si existe en la base de datos
            db_user = User.query.filter_by(email="admin").first()
            if db_user:
                return jsonify({
                    "success": True,
                    "message": "Login successful (super admin)",
                    "token": "admin_authenticated",
                    "user": {
                        "id": db_user.id,
                        "email": db_user.email,
                        "name": db_user.name,
                        "role": db_user.role
                    },
                    "expires_in": 3600
                }), 200
            else:
                return jsonify({
                    "success": True,
                    "message": "Login successful (fallback)",
                    "token": "admin_authenticated",
                    "user": {
                        "id": 1,
                        "email": "admin",
                        "name": "Super Administrator",
                        "role": "super_admin"
                    },
                    "expires_in": 3600
                }), 200

        return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/auth/verify', methods=['POST'])
def verify_admin():
    """Verify token and return user info"""
    try:
        data = request.get_json()
        token = data.get('token')

        if token == "admin_authenticated":
            # In a real implementation, you would decode the token to get user info
            # For now, return a basic response
            return jsonify({
                "valid": True,
                "user": {
                    "id": 1,
                    "email": "admin",
                    "name": "Administrator",
                    "role": "admin"
                }
            }), 200
        else:
            return jsonify({"valid": False}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/auth/logout', methods=['POST'])
def admin_logout():
    """Admin logout endpoint"""
    try:
        # In a full implementation, you would invalidate the token here
        # For now, we just return success and let the frontend handle cleanup
        return jsonify({"success": True, "message": "Logged out successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# USER MANAGEMENT ROUTES (keeping the enhanced versions)


@api.route('/users/<int:user_id>/toggle-status', methods=['PUT'])
@admin_required
def toggle_user_status(user_id):
    """Toggle user active status (admin only)"""
    try:
        user = User.query.get_or_404(user_id)

        # Prevent deactivation of main admin
        if user_id == 1:
            return jsonify({"error": "Cannot deactivate main admin user"}), 400

        user.is_active = not user.is_active
        db.session.commit()

        status = "activated" if user.is_active else "deactivated"
        return jsonify({
            "message": f"User {status} successfully",
            "user": user.serialize()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/auth/change-password', methods=['POST'])
@admin_required
def change_admin_password():
    """Change admin password"""
    try:
        data = request.get_json()

        current_password = data.get('current_password')
        new_password = data.get('new_password')
        user_id = data.get('user_id', 1)  # Default to admin user

        if not current_password or not new_password:
            return jsonify({"error": "Current password and new password are required"}), 400

        if len(new_password) < 6:
            return jsonify({"error": "New password must be at least 6 characters"}), 400

        # Find the admin user in database
        admin_user = User.query.filter_by(id=user_id, role='admin').first()

        if admin_user:
            # Verify current password using hash verification
            if not admin_user.check_password(current_password):
                return jsonify({"error": "Current password is incorrect"}), 400

            # Update password using hash
            admin_user.set_password(new_password)
            db.session.commit()

            return jsonify({
                "success": True,
                "message": "Password changed successfully",
                "note": "Password updated in database"
            }), 200
        else:
            # Handle case where admin user doesn't exist in DB yet
            # Create admin user with new password
            new_admin = User(
                email="admin",
                name="Administrator",
                role="admin",
                is_active=True,
                created_by=1
            )
            new_admin.set_password(new_password)
            db.session.add(new_admin)
            db.session.commit()

            return jsonify({
                "success": True,
                "message": "Admin user created with new password",
                "note": "New admin user created in database"
            }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/system/storage', methods=['GET'])
def get_storage_info():
    """Get system storage information"""
    try:
        import os
        import shutil

        # Get current working directory info
        total, used, free = shutil.disk_usage('/')

        # Convert to GB
        total_gb = total // (1024**3)
        used_gb = used // (1024**3)
        free_gb = free // (1024**3)

        usage_percent = (used / total) * 100

        return jsonify({
            "total_gb": total_gb,
            "used_gb": used_gb,
            "free_gb": free_gb,
            "usage_percent": round(usage_percent, 1),
            "status": "warning" if usage_percent > 80 else "good"
        }), 200

    except Exception as e:
        return jsonify({
            "total_gb": 100,
            "used_gb": 85,
            "free_gb": 15,
            "usage_percent": 85.0,
            "status": "warning",
            "note": f"Could not get real storage info: {str(e)}"
        }), 200


# JOURNAL/LOGBOOK ROUTES

@api.route('/journal', methods=['GET'])
@admin_required
def get_journal_entries():
    """Get all journal entries for the authenticated user"""
    try:
        # Get query parameters for filtering
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        category = request.args.get('category')
        status = request.args.get('status')

        # Base query
        query = JournalEntry.query

        # Apply filters
        if date_from:
            query = query.filter(JournalEntry.entry_date >=
                                 datetime.fromisoformat(date_from))
        if date_to:
            query = query.filter(JournalEntry.entry_date <=
                                 datetime.fromisoformat(date_to))
        if category:
            query = query.filter(JournalEntry.category == category)
        if status:
            query = query.filter(JournalEntry.status == status)

        # Order by entry date descending (most recent first)
        entries = query.order_by(JournalEntry.entry_date.desc()).all()

        return jsonify([entry.serialize() for entry in entries]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/journal', methods=['POST'])
@admin_required
def create_journal_entry():
    """Create a new journal entry"""
    try:
        data = request.get_json()

        if not data.get('title'):
            return jsonify({"error": "Title is required"}), 400
        if not data.get('content'):
            return jsonify({"error": "Content is required"}), 400

        # Parse entry date
        entry_date = datetime.utcnow()
        if data.get('entry_date'):
            try:
                entry_date = datetime.fromisoformat(
                    data.get('entry_date').replace('Z', '+00:00'))
            except (ValueError, TypeError):
                return jsonify({"error": "Invalid entry_date format"}), 400

        new_entry = JournalEntry(
            title=data.get('title'),
            content=data.get('content'),
            entry_date=entry_date,
            category=data.get('category', 'work'),
            priority=data.get('priority', 'medium'),
            status=data.get('status', 'pending'),
            user_id=data.get('user_id', 1),  # Default to admin user
            hours_worked=data.get('hours_worked'),
            location=data.get('location'),
            tags=",".join(data.get('tags', [])) if data.get('tags') else None,
            attachments=data.get('attachments', [])
        )

        db.session.add(new_entry)
        db.session.commit()

        return jsonify(new_entry.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/journal/<int:entry_id>', methods=['GET'])
@admin_required
def get_journal_entry(entry_id):
    """Get a specific journal entry"""
    try:
        entry = JournalEntry.query.get_or_404(entry_id)
        return jsonify(entry.serialize()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/journal/<int:entry_id>', methods=['PUT'])
@admin_required
def update_journal_entry(entry_id):
    """Update a journal entry"""
    try:
        entry = JournalEntry.query.get_or_404(entry_id)
        data = request.get_json()

        if 'title' in data:
            entry.title = data['title']
        if 'content' in data:
            entry.content = data['content']
        if 'entry_date' in data:
            entry.entry_date = datetime.fromisoformat(
                data['entry_date'].replace('Z', '+00:00'))
        if 'category' in data:
            entry.category = data['category']
        if 'priority' in data:
            entry.priority = data['priority']
        if 'status' in data:
            entry.status = data['status']
        if 'hours_worked' in data:
            entry.hours_worked = data['hours_worked']
        if 'location' in data:
            entry.location = data['location']
        if 'tags' in data:
            entry.tags = ",".join(data['tags']) if data['tags'] else None
        if 'attachments' in data:
            entry.attachments = data['attachments']

        entry.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify(entry.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/journal/<int:entry_id>', methods=['DELETE'])
@admin_required
def delete_journal_entry(entry_id):
    """Delete a journal entry"""
    try:
        entry = JournalEntry.query.get_or_404(entry_id)
        db.session.delete(entry)
        db.session.commit()
        return jsonify({"message": "Journal entry deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/journal/stats', methods=['GET'])
@admin_required
def get_journal_stats():
    """Get journal statistics"""
    try:
        # Get date range for filtering (default to current month)
        from datetime import date, timedelta

        today = date.today()
        start_of_month = today.replace(day=1)
        end_of_month = date(today.year, today.month + 1, 1) - timedelta(
            days=1) if today.month < 12 else date(today.year + 1, 1, 1) - timedelta(days=1)

        # Query entries for the current month
        entries = JournalEntry.query.filter(
            JournalEntry.entry_date >= start_of_month,
            JournalEntry.entry_date <= end_of_month
        ).all()

        # Calculate statistics
        total_entries = len(entries)
        total_hours = sum(entry.hours_worked or 0 for entry in entries)

        # Group by category
        categories = {}
        statuses = {}

        for entry in entries:
            categories[entry.category] = categories.get(entry.category, 0) + 1
            statuses[entry.status] = statuses.get(entry.status, 0) + 1

        return jsonify({
            "total_entries": total_entries,
            "total_hours": round(total_hours, 2),
            "categories": categories,
            "statuses": statuses,
            "period": {
                "start": start_of_month.isoformat(),
                "end": end_of_month.isoformat()
            }
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# EXPORT ROUTES

@api.route('/tickets/export/pdf', methods=['GET'])
@admin_required
def export_tickets_pdf():
    """Export tickets to PDF"""
    try:
        from api.export_utils import export_manager

        tickets = Ticket.query.all()
        tickets_data = [ticket.serialize() for ticket in tickets]

        pdf_buffer = export_manager.export_tickets_pdf(tickets_data)

        response = make_response(pdf_buffer.getvalue())
        response.headers['Content-Type'] = 'application/pdf'
        response.headers[
            'Content-Disposition'] = f'attachment; filename=tickets_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf'

        return response
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/tickets/export/excel', methods=['GET'])
@admin_required
def export_tickets_excel():
    """Export tickets to Excel"""
    try:
        from api.export_utils import export_manager

        tickets = Ticket.query.all()
        tickets_data = [ticket.serialize() for ticket in tickets]

        excel_buffer = export_manager.export_tickets_excel(tickets_data)

        response = make_response(excel_buffer.getvalue())
        response.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        response.headers[
            'Content-Disposition'] = f'attachment; filename=tickets_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'

        return response
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/matrices/export/pdf', methods=['GET'])
@admin_required
def export_matrices_pdf():
    """Export matrices to PDF"""
    try:
        # Import at the top or handle import errors better
        try:
            from api.export_utils import export_manager
        except ImportError as ie:
            return jsonify({"error": f"Import error: {str(ie)}"}), 500

        matrices = Matrix.query.all()
        matrices_data = [matrix.serialize() for matrix in matrices]

        if not matrices_data:
            return jsonify({"error": "No matrices found to export"}), 404

        pdf_buffer = export_manager.export_matrices_pdf(matrices_data)

        response = make_response(pdf_buffer.getvalue())
        response.headers['Content-Type'] = 'application/pdf'
        response.headers[
            'Content-Disposition'] = f'attachment; filename=matrices_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf'

        return response
    except Exception as e:
        # Better error logging
        import traceback
        error_details = {
            "error": str(e),
            "type": type(e).__name__,
            "traceback": traceback.format_exc()
        }
        print(f"PDF Export Error: {error_details}")  # For server logs
        return jsonify({"error": f"Export failed: {str(e)}"}), 500


@api.route('/matrices/export/health', methods=['GET'])
def export_health_check():
    """Health check for export functionality"""
    try:
        # Test imports
        try:
            from api.export_utils import export_manager
            import reportlab
            import openpyxl
            import pandas

            return jsonify({
                "status": "healthy",
                "reportlab_version": reportlab.Version,
                "openpyxl_available": True,
                "pandas_available": True,
                "export_manager_available": True
            }), 200
        except ImportError as e:
            return jsonify({
                "status": "unhealthy",
                "error": f"Import error: {str(e)}"
            }), 500
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500


@api.route('/matrices/export/excel', methods=['GET'])
@admin_required
def export_matrices_excel():
    """Export matrices to Excel"""
    try:
        # Import at the top or handle import errors better
        try:
            from api.export_utils import export_manager
        except ImportError as ie:
            return jsonify({"error": f"Import error: {str(ie)}"}), 500

        matrices = Matrix.query.all()
        matrices_data = [matrix.serialize() for matrix in matrices]

        if not matrices_data:
            return jsonify({"error": "No matrices found to export"}), 404

        excel_buffer = export_manager.export_matrices_excel(matrices_data)

        response = make_response(excel_buffer.getvalue())
        response.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        response.headers[
            'Content-Disposition'] = f'attachment; filename=matrices_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'

        return response
    except Exception as e:
        # Better error logging
        import traceback
        error_details = {
            "error": str(e),
            "type": type(e).__name__,
            "traceback": traceback.format_exc()
        }
        print(f"Excel Export Error: {error_details}")  # For server logs
        return jsonify({"error": f"Export failed: {str(e)}"}), 500


@api.route('/journal/export/pdf', methods=['GET'])
@admin_required
def export_journal_pdf():
    """Export journal entries to PDF"""
    try:
        from api.export_utils import export_manager

        # Get query parameters for filtering
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        category = request.args.get('category')
        status = request.args.get('status')

        # Base query
        query = JournalEntry.query

        # Apply filters
        if date_from:
            query = query.filter(JournalEntry.entry_date >=
                                 datetime.fromisoformat(date_from))
        if date_to:
            query = query.filter(JournalEntry.entry_date <=
                                 datetime.fromisoformat(date_to))
        if category:
            query = query.filter(JournalEntry.category == category)
        if status:
            query = query.filter(JournalEntry.status == status)

        journal_entries = query.order_by(JournalEntry.entry_date.desc()).all()
        journal_data = [entry.serialize() for entry in journal_entries]

        pdf_buffer = export_manager.export_journal_pdf(journal_data)

        response = make_response(pdf_buffer.getvalue())
        response.headers['Content-Type'] = 'application/pdf'
        response.headers[
            'Content-Disposition'] = f'attachment; filename=journal_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf'

        return response
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/journal/export/excel', methods=['GET'])
@admin_required
def export_journal_excel():
    """Export journal entries to Excel"""
    try:
        from api.export_utils import export_manager

        # Get query parameters for filtering
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        category = request.args.get('category')
        status = request.args.get('status')

        # Base query
        query = JournalEntry.query

        # Apply filters
        if date_from:
            query = query.filter(JournalEntry.entry_date >=
                                 datetime.fromisoformat(date_from))
        if date_to:
            query = query.filter(JournalEntry.entry_date <=
                                 datetime.fromisoformat(date_to))
        if category:
            query = query.filter(JournalEntry.category == category)
        if status:
            query = query.filter(JournalEntry.status == status)

        journal_entries = query.order_by(JournalEntry.entry_date.desc()).all()
        journal_data = [entry.serialize() for entry in journal_entries]

        excel_buffer = export_manager.export_journal_excel(journal_data)

        response = make_response(excel_buffer.getvalue())
        response.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        response.headers[
            'Content-Disposition'] = f'attachment; filename=journal_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'

        return response
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# SETTINGS ROUTES
@api.route('/settings', methods=['GET'])
@admin_required
def get_settings():
    """Get system settings"""
    try:
        # Default settings (in a real app, these would be stored in database)
        default_settings = {
            'systemName': 'Plataforma IT',
            'systemDescription': 'Sistema integral de gestión para equipos de IT',
            'enableNotifications': True,
            'autoBackup': True,
            'maintenanceMode': False,
            'sessionTimeout': 60,
            'maxFileSize': 10,
            'dateFormat': 'DD/MM/YYYY',
            'timeFormat': '24h'
        }

        return jsonify(default_settings), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/settings', methods=['POST'])
@admin_required
def save_settings():
    """Save system settings"""
    try:
        settings = request.get_json()

        # In a real application, these would be saved to database
        # For now, we'll just return success

        return jsonify({
            "message": "Configuración guardada exitosamente",
            "settings": settings
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# USER MANAGEMENT ROUTES

@api.route('/users', methods=['GET'])
@admin_required
def get_users():
    """Get all users - admin only"""
    try:
        users = User.query.all()
        return jsonify([user.serialize() for user in users]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/users', methods=['POST'])
@super_admin_required
def create_user():
    """Create new user - super admin only"""
    try:
        data = request.get_json()

        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({"error": "Email y contraseña son requeridos"}), 400

        # Check if email already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({"error": "El email ya está en uso"}), 400

        # Validate role - super admin can create any role except another super_admin
        valid_roles = ['admin-rh-financiero', 'usuario']
        role = data.get('role', 'usuario')
        if role not in valid_roles:
            return jsonify({"error": f"Rol inválido. Roles disponibles: {', '.join(valid_roles)}"}), 400

        # Create new user with password hashing
        user = User(
            email=data['email'],
            name=data.get('name', ''),
            role=role,
            is_active=data.get('is_active', True)
        )
        user.set_password(data['password'])

        db.session.add(user)
        db.session.commit()

        return jsonify({
            "message": "Usuario creado exitosamente",
            "user": user.serialize()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """Update user - admin only"""
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()

        # Update fields
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            # Check if new email is already in use by another user
            existing = User.query.filter_by(email=data['email']).first()
            if existing and existing.id != user_id:
                return jsonify({"error": "El email ya está en uso"}), 400
            user.email = data['email']
        if 'role' in data:
            user.role = data['role']
        if 'is_active' in data:
            user.is_active = data['is_active']
        if 'password' in data and data['password']:
            user.set_password(data['password'])

        db.session.commit()

        return jsonify({
            "message": "Usuario actualizado exitosamente",
            "user": user.serialize()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Delete user - admin only"""
    try:
        user = User.query.get_or_404(user_id)

        # Prevent deletion of main admin user
        if user_id == 1:
            return jsonify({"error": "No se puede eliminar el usuario administrador principal"}), 400

        db.session.delete(user)
        db.session.commit()

        return jsonify({"message": "Usuario eliminado exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/users/<int:user_id>/change-password', methods=['POST'])
@admin_required
def admin_change_user_password(user_id):
    """Admin changes any user's password"""
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()

        if not data.get('new_password'):
            return jsonify({"error": "Nueva contraseña requerida"}), 400

        user.set_password(data['new_password'])
        db.session.commit()

        return jsonify({"message": "Contraseña cambiada exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/users/change-password', methods=['POST'])
@admin_required
def change_own_password():
    """User changes their own password"""
    try:
        # Note: This endpoint would need to be enhanced to identify the current user
        # For now, it's placeholder functionality
        data = request.get_json()

        if not data.get('current_password') or not data.get('new_password'):
            return jsonify({"error": "Contraseña actual y nueva contraseña requeridas"}), 400

        # In a real implementation, you would:
        # 1. Get current user from token
        # 2. Verify current password
        # 3. Set new password

        return jsonify({"message": "Contraseña cambiada exitosamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# PAYMENT REMINDER ROUTES

@api.route('/payment-reminders', methods=['GET'])
@admin_required
def get_payment_reminders():
    """Get payment reminders - filtered by user role"""
    try:
        current_user = get_current_user()

        if current_user['role'] == 'super_admin':
            # Super admin ve todos los recordatorios
            reminders = PaymentReminder.query.all()
        elif current_user['role'] == 'admin':
            # Admin ve todos pero solo puede editar los suyos
            reminders = PaymentReminder.query.all()
        else:
            # Usuario normal solo ve los suyos
            reminders = PaymentReminder.query.filter_by(
                user_id=current_user['id']).all()

        return jsonify([reminder.serialize() for reminder in reminders]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/payment-reminders', methods=['POST'])
@admin_required
def create_payment_reminder():
    """Create new payment reminder"""
    try:
        data = request.get_json()
        current_user = get_current_user()

        if not data.get('title'):
            return jsonify({"error": "Título es requerido"}), 400

        if not data.get('due_date'):
            return jsonify({"error": "Fecha de vencimiento es requerida"}), 400

        new_reminder = PaymentReminder(
            title=data.get('title'),
            description=data.get('description', ''),
            amount=data.get('amount'),
            currency=data.get('currency', 'USD'),
            due_date=datetime.fromisoformat(data.get('due_date')),
            status=data.get('status', 'pending'),
            recurrence=data.get('recurrence', 'one_time'),
            reminder_days=data.get('reminder_days', 7),
            user_id=current_user['id']
        )

        db.session.add(new_reminder)
        db.session.commit()

        return jsonify(new_reminder.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/payment-reminders/<int:reminder_id>', methods=['PUT'])
@admin_required
def update_payment_reminder(reminder_id):
    """Update payment reminder - with role-based permissions"""
    try:
        reminder = PaymentReminder.query.get_or_404(reminder_id)
        current_user = get_current_user()

        # Solo super_admin puede editar todo, admin y user solo lo suyo
        if current_user['role'] != 'super_admin' and reminder.user_id != current_user['id']:
            return jsonify({"error": "No tienes permisos para editar este recordatorio"}), 403

        data = request.get_json()

        if 'title' in data:
            reminder.title = data['title']
        if 'description' in data:
            reminder.description = data['description']
        if 'amount' in data:
            reminder.amount = data['amount']
        if 'currency' in data:
            reminder.currency = data['currency']
        if 'due_date' in data:
            reminder.due_date = datetime.fromisoformat(data['due_date'])
        if 'status' in data:
            reminder.status = data['status']
        if 'recurrence' in data:
            reminder.recurrence = data['recurrence']
        if 'reminder_days' in data:
            reminder.reminder_days = data['reminder_days']

        reminder.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify(reminder.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/payment-reminders/<int:reminder_id>', methods=['DELETE'])
@admin_required
def delete_payment_reminder(reminder_id):
    """Delete payment reminder - with role-based permissions"""
    try:
        reminder = PaymentReminder.query.get_or_404(reminder_id)
        current_user = get_current_user()

        # Solo super_admin puede eliminar todo, admin y user solo lo suyo
        if current_user['role'] != 'super_admin' and reminder.user_id != current_user['id']:
            return jsonify({"error": "No tienes permisos para eliminar este recordatorio"}), 403

        db.session.delete(reminder)
        db.session.commit()

        return jsonify({"message": "Recordatorio eliminado exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/payment-reminders/upcoming', methods=['GET'])
@admin_required
def get_upcoming_payments():
    """Get upcoming payment reminders for dashboard"""
    try:
        current_user = get_current_user()
        today = datetime.utcnow()

        # Filtrar por rol
        if current_user['role'] == 'super_admin':
            base_query = PaymentReminder.query
        elif current_user['role'] == 'admin':
            base_query = PaymentReminder.query
        else:
            base_query = PaymentReminder.query.filter_by(
                user_id=current_user['id'])

        # Obtener próximos a vencer (dentro de reminder_days)
        upcoming = base_query.filter(
            PaymentReminder.status == 'pending',
            PaymentReminder.due_date >= today,
            PaymentReminder.due_date <= today +
            db.text('INTERVAL reminder_days DAY')
        ).order_by(PaymentReminder.due_date).all()

        return jsonify([reminder.serialize() for reminder in upcoming]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# SERVICE ORDER ROUTES

@api.route('/service-orders', methods=['GET'])
@admin_required
def get_service_orders():
    """Get service orders - filtered by user role"""
    try:
        current_user = get_current_user()

        if current_user['role'] == 'super_admin':
            # Super admin ve todas las órdenes
            orders = ServiceOrder.query.all()
        elif current_user['role'] == 'admin':
            # Admin ve todas pero solo puede editar las suyas
            orders = ServiceOrder.query.all()
        else:
            # Usuario normal solo ve las asignadas a él o creadas por él
            orders = ServiceOrder.query.filter(
                db.or_(
                    ServiceOrder.assigned_to == current_user['id'],
                    ServiceOrder.created_by == current_user['id']
                )
            ).all()

        return jsonify([order.serialize() for order in orders]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/service-orders', methods=['POST'])
@admin_required
def create_service_order():
    """Create new service order"""
    try:
        data = request.get_json()
        current_user = get_current_user()

        if not data.get('title'):
            return jsonify({"error": "Título es requerido"}), 400

        if not data.get('client_name'):
            return jsonify({"error": "Nombre del cliente es requerido"}), 400

        if not data.get('service_type'):
            return jsonify({"error": "Tipo de servicio es requerido"}), 400

        new_order = ServiceOrder(
            title=data.get('title'),
            description=data.get('description', ''),
            client_name=data.get('client_name'),
            client_email=data.get('client_email'),
            client_phone=data.get('client_phone'),
            service_type=data.get('service_type'),
            status=data.get('status', 'pending'),
            priority=data.get('priority', 'medium'),
            estimated_hours=data.get('estimated_hours'),
            hourly_rate=data.get('hourly_rate'),
            assigned_to=data.get('assigned_to'),
            created_by=current_user['id'],
            monthly_status={}
        )

        db.session.add(new_order)
        db.session.commit()

        return jsonify(new_order.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/service-orders/<int:order_id>/monthly-status', methods=['PUT'])
@admin_required
def update_monthly_status(order_id):
    """Update monthly status for service order"""
    try:
        order = ServiceOrder.query.get_or_404(order_id)
        current_user = get_current_user()

        # Solo super_admin puede editar todo, otros solo lo suyo
        if (current_user['role'] != 'super_admin' and
            order.created_by != current_user['id'] and
                order.assigned_to != current_user['id']):
            return jsonify({"error": "No tienes permisos para editar esta orden"}), 403

        data = request.get_json()
        month_year = data.get('month_year')  # formato: "2024-01"
        completed = data.get('completed', False)

        if not month_year:
            return jsonify({"error": "month_year es requerido"}), 400

        monthly_status = order.monthly_status or {}
        monthly_status[month_year] = {
            'completed': completed,
            'completed_date': datetime.utcnow().isoformat() if completed else None,
            'updated_by': current_user['id']
        }

        order.monthly_status = monthly_status
        order.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify(order.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# NOTIFICATION ROUTES

@api.route('/notifications', methods=['GET'])
@admin_required
def get_notifications():
    """Get user notifications"""
    try:
        current_user = get_current_user()

        # Obtener notificaciones no expiradas
        notifications = SystemNotification.query.filter(
            SystemNotification.user_id == current_user['id'],
            db.or_(
                SystemNotification.expires_at.is_(None),
                SystemNotification.expires_at > datetime.utcnow()
            )
        ).order_by(SystemNotification.created_at.desc()).all()

        return jsonify([notification.serialize() for notification in notifications]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/notifications/<int:notification_id>/read', methods=['POST'])
@admin_required
def mark_notification_read(notification_id):
    """Mark notification as read"""
    try:
        current_user = get_current_user()
        notification = SystemNotification.query.filter_by(
            id=notification_id,
            user_id=current_user['id']
        ).first_or_404()

        notification.is_read = True
        db.session.commit()

        return jsonify({"message": "Notification marked as read"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/notifications/mark-all-read', methods=['POST'])
@admin_required
def mark_all_notifications_read():
    """Mark all notifications as read"""
    try:
        current_user = get_current_user()

        SystemNotification.query.filter_by(
            user_id=current_user['id'],
            is_read=False
        ).update({'is_read': True})

        db.session.commit()

        return jsonify({"message": "All notifications marked as read"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# MATRIX HISTORY ROUTES

@api.route('/matrices/<int:matrix_id>/history', methods=['GET'])
@admin_required
def get_matrix_history(matrix_id):
    """Get history of changes for a matrix"""
    try:
        current_user = get_current_user()
        matrix = Matrix.query.get_or_404(matrix_id)

        # Verificar permisos
        if (current_user['role'] != 'super_admin' and
                matrix.user_id != current_user['id']):
            return jsonify({"error": "No tienes permisos para ver el historial"}), 403

        history = MatrixHistory.query.filter_by(matrix_id=matrix_id)\
            .order_by(MatrixHistory.timestamp.desc())\
            .all()

        return jsonify([record.serialize() for record in history]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# BACKUP ROUTES

@api.route('/system/backups', methods=['GET'])
@admin_required
def get_backups():
    """Get system backups - admin only"""
    try:
        current_user = get_current_user()

        if current_user['role'] not in ['admin', 'super_admin']:
            return jsonify({"error": "No tienes permisos para ver los backups"}), 403

        backups = SystemBackup.query.order_by(
            SystemBackup.created_at.desc()).all()
        return jsonify([backup.serialize() for backup in backups]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/system/backup/create', methods=['POST'])
@admin_required
def create_backup():
    """Create manual backup - admin only"""
    try:
        current_user = get_current_user()

        if current_user['role'] not in ['admin', 'super_admin']:
            return jsonify({"error": "No tienes permisos para crear backups"}), 403

        # Crear registro de backup
        backup = SystemBackup(
            backup_type='manual',
            status='in_progress',
            created_by=current_user['id']
        )

        db.session.add(backup)
        db.session.commit()

        # TODO: Implementar lógica real de backup aquí
        # Por ahora solo simulamos
        import time
        time.sleep(1)  # Simular proceso

        backup.status = 'completed'
        backup.completed_at = datetime.utcnow()
        backup.file_path = f"/backups/backup_{backup.id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.sql"
        backup.file_size = 1024 * 1024  # 1MB simulado

        db.session.commit()

        return jsonify({
            "message": "Backup creado exitosamente",
            "backup": backup.serialize()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# HR SPECIFIC ROUTES

@api.route('/hr/users/suspend', methods=['POST'])
@admin_required
def hr_suspend_user():
    """HR suspends a user - notifies super admin"""
    try:
        current_user = get_current_user()

        # Verificar que sea HR
        if current_user['role'] not in ['hr', 'super_admin']:
            return jsonify({"error": "Solo RH puede suspender usuarios"}), 403

        data = request.get_json()
        user_id = data.get('user_id')
        reason = data.get('reason', '')

        if not user_id:
            return jsonify({"error": "user_id es requerido"}), 400

        user = User.query.get_or_404(user_id)

        # No permitir suspender al super admin
        if user.role == 'super_admin':
            return jsonify({"error": "No se puede suspender al super administrador"}), 400

        # Suspender usuario
        user.is_suspended = True
        user.suspension_reason = reason
        user.suspended_by = current_user['id']
        user.suspended_at = datetime.utcnow()

        db.session.commit()

        # Notificar al super admin
        notification = SystemNotification(
            user_id=1,  # Super admin (asumiendo ID 1)
            title=f"Usuario Suspendido por RH",
            message=f"RH ha suspendido al usuario {user.name} ({user.email}). Razón: {reason}. Considera eliminar la cuenta si es necesario.",
            notification_type='warning'
        )
        db.session.add(notification)
        db.session.commit()

        return jsonify({
            "message": "Usuario suspendido exitosamente",
            "user": user.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/hr/users/create-request', methods=['POST'])
@admin_required
def hr_create_user_request():
    """HR creates a new user and notifies super admin"""
    try:
        current_user = get_current_user()

        # Verificar que sea HR
        if current_user['role'] not in ['hr', 'super_admin']:
            return jsonify({"error": "Solo RH puede crear usuarios"}), 403

        data = request.get_json()

        # Validar campos requeridos
        if not data.get('email') or not data.get('name'):
            return jsonify({"error": "Email y nombre son requeridos"}), 400

        # Verificar que el email no exista
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({"error": "El email ya está en uso"}), 400

        # Crear usuario con contraseña temporal
        new_user = User(
            email=data['email'],
            name=data['name'],
            role=data.get('role', 'user'),
            is_active=True,
            created_by=current_user['id']
        )

        # Contraseña temporal
        temp_password = data.get('password', 'temporal123')
        new_user.set_password(temp_password)

        db.session.add(new_user)
        db.session.flush()  # Para obtener el ID

        # Notificar al super admin
        notification = SystemNotification(
            user_id=1,  # Super admin
            title=f"Nuevo Usuario Creado por RH",
            message=f"RH ha creado el usuario {new_user.name} ({new_user.email}) con rol '{new_user.role}'. Contraseña temporal: {temp_password}",
            notification_type='info'
        )
        db.session.add(notification)
        db.session.commit()

        return jsonify({
            "message": "Usuario creado exitosamente",
            "user": new_user.serialize(),
            "temporary_password": temp_password
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/superadmin/users/<int:user_id>/delete', methods=['DELETE'])
@admin_required
def superadmin_delete_user(user_id):
    """Super admin deletes a user completely"""
    try:
        current_user = get_current_user()

        # Solo super admin puede eliminar usuarios
        if current_user['role'] != 'super_admin':
            return jsonify({"error": "Solo el super administrador puede eliminar usuarios"}), 403

        user = User.query.get_or_404(user_id)

        # No permitir eliminar al super admin
        if user.role == 'super_admin':
            return jsonify({"error": "No se puede eliminar al super administrador"}), 400

        # Eliminar usuario
        db.session.delete(user)
        db.session.commit()

        return jsonify({"message": "Usuario eliminado exitosamente"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/superadmin/users/<int:user_id>/unsuspend', methods=['POST'])
@admin_required
def superadmin_unsuspend_user(user_id):
    """Super admin unsuspends a user"""
    try:
        current_user = get_current_user()

        # Solo super admin puede reactivar usuarios
        if current_user['role'] != 'super_admin':
            return jsonify({"error": "Solo el super administrador puede reactivar usuarios"}), 403

        user = User.query.get_or_404(user_id)

        # Reactivar usuario
        user.is_suspended = False
        user.suspension_reason = None
        user.suspended_by = None
        user.suspended_at = None

        db.session.commit()

        return jsonify({
            "message": "Usuario reactivado exitosamente",
            "user": user.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# BUDGET MODULE ROUTES

@api.route('/budget/data', methods=['GET'])
@role_required(['super_admin', 'admin-rh-financiero'])
def get_budget_data():
    """Get budget data for financial module"""
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({"error": "Usuario no autenticado"}), 401
        
        # Return basic budget configuration
        budget_config = {
            "ventas_por_mes": {
                "agosto": 3506579,
                "septiembre": 3462804,
                "octubre": 3505000,
                "noviembre": 3250000,
                "diciembre": 3095000,
                "promedio": 3363877
            },
            "areas_presupuesto": [
                {
                    "nombre": "Costo de Ventas",
                    "categoria": "Compras Centros",
                    "porcentaje": 35.0,
                    "descripcion": "Materia prima, empaque y retail"
                },
                {
                    "nombre": "Sueldos y Prestaciones",
                    "categoria": "Recursos Humanos",
                    "porcentaje": 21.0,
                    "descripcion": "Nómina, IMSS y provisiones"
                },
                {
                    "nombre": "Impuestos",
                    "categoria": "Fiscal",
                    "porcentaje": 10.0,
                    "descripcion": "ISR, IVA y otros impuestos"
                }
                # Más áreas pueden agregarse aquí
            ],
            "user_permissions": {
                "can_edit": current_user['role'] == 'super_admin',
                "can_view": current_user['role'] in ['super_admin', 'admin-rh-financiero']
            }
        }
        
        return jsonify(budget_config), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
