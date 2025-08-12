#!/usr/bin/env python3
"""
Script para inicializar la base de datos en Railway
Este script se ejecuta automáticamente durante el despliegue
"""
import os
import sys
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate, upgrade

# Añadir el directorio src al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app import app, db
    print("✅ App y db importados correctamente")
except ImportError as e:
    print(f"❌ Error importando app: {e}")
    sys.exit(1)

def init_database():
    """Inicializa la base de datos con todas las tablas"""
    with app.app_context():
        try:
            print("🔍 Verificando estado de la base de datos...")
            
            # Verificar si las tablas existen
            from sqlalchemy import inspect, text
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            
            print(f"📊 Tablas existentes: {tables}")
            
            if not tables or 'calendar_event' not in tables:
                print("🚀 Creando todas las tablas...")
                db.create_all()
                print("✅ Tablas creadas exitosamente")
                
                # Verificar tablas creadas
                inspector = inspect(db.engine)
                new_tables = inspector.get_table_names()
                print(f"📊 Tablas después de crear: {new_tables}")
            else:
                print(f"✅ Base de datos ya tiene {len(tables)} tablas")
                
            # Intentar ejecutar migraciones si existen
            try:
                if os.path.exists('../migrations'):
                    print("🔄 Aplicando migraciones...")
                    upgrade()
                    print("✅ Migraciones aplicadas exitosamente")
                else:
                    print("⚠️  No se encontró directorio de migraciones")
            except Exception as e:
                print(f"⚠️  Error con migraciones: {e}")
                # No es fatal, las tablas ya fueron creadas
                
            # Verificar que las tablas críticas existan
            inspector = inspect(db.engine)
            final_tables = inspector.get_table_names()
            required_tables = ['calendar_event', 'task', 'ticket']
            
            missing_tables = [table for table in required_tables if table not in final_tables]
            if missing_tables:
                print(f"⚠️  Tablas faltantes: {missing_tables}")
                return False
            else:
                print("✅ Todas las tablas requeridas están presentes")
                return True
                
        except Exception as e:
            print(f"❌ Error inicializando la base de datos: {e}")
            import traceback
            traceback.print_exc()
            return False

if __name__ == "__main__":
    print("🚀 Inicializando base de datos para Railway...")
    success = init_database()
    if success:
        print("✅ Base de datos lista!")
        sys.exit(0)
    else:
        print("❌ Error en la inicialización")
        sys.exit(1)
