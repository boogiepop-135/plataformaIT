"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Task, Ticket, CalendarEvent, Matrix
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from datetime import datetime

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api, origins=[
    "http://localhost:3000",
    "https://localhost:3000",
    "http://127.0.0.1:3000",
    "https://informaticait.up.railway.app"
])


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
def delete_ticket(ticket_id):
    try:
        ticket = Ticket.query.get_or_404(ticket_id)
        db.session.delete(ticket)
        db.session.commit()
        return jsonify({"message": "Ticket deleted successfully"}), 200
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
def get_matrices():
    try:
        matrices = Matrix.query.all()
        return jsonify([matrix.serialize() for matrix in matrices]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route('/matrices', methods=['POST'])
def create_matrix():
    try:
        data = request.get_json()

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
            user_id=data.get('user_id')
        )

        db.session.add(new_matrix)
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
def update_matrix(matrix_id):
    try:
        matrix = Matrix.query.get_or_404(matrix_id)
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
        db.session.commit()

        return jsonify(matrix.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/matrices/<int:matrix_id>', methods=['DELETE'])
def delete_matrix(matrix_id):
    try:
        matrix = Matrix.query.get_or_404(matrix_id)
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
