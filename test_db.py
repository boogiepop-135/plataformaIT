import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from flask import Flask
from api.models import db
from api.routes import api

# Crear una aplicación de prueba mínima
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
app.register_blueprint(api, url_prefix='/api')

with app.app_context():
    try:
        # Crear las tablas si no existen
        db.create_all()
        print("✓ Base de datos inicializada")
        
        # Hacer una consulta de prueba
        from api.models import CalendarEvent
        events = CalendarEvent.query.all()
        print(f"✓ Consulta exitosa: {len(events)} eventos encontrados")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
