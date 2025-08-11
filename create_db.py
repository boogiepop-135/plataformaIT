import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from flask import Flask
from api.models import db, User, Task, Ticket, CalendarEvent

# Crear aplicación
app = Flask(__name__)
# Usar ruta absoluta para la base de datos
db_path = os.path.join(os.path.dirname(__file__), 'src', 'database.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{db_path}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    # Crear todas las tablas
    db.create_all()
    print("✅ Base de datos creada exitosamente")
    
    # Verificar que las tablas fueron creadas
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"✅ Tablas creadas: {tables}")
