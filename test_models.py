import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

try:
    from api.models import db, User, Task, Ticket, CalendarEvent
    print("✓ Modelos importados correctamente")
    
    # Verificar que no hay referencias a enums
    print(f"Task status: {Task.__table__.columns['status'].type}")
    print(f"Task priority: {Task.__table__.columns['priority'].type}")
    print(f"Ticket status: {Ticket.__table__.columns['status'].type}")
    print(f"Ticket priority: {Ticket.__table__.columns['priority'].type}")
    print(f"Event type: {CalendarEvent.__table__.columns['event_type'].type}")
    
except Exception as e:
    print(f"❌ Error al importar modelos: {e}")
    import traceback
    traceback.print_exc()
