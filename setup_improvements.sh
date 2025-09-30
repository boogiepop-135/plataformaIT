#!/bin/bash

# Script para aplicar migraciones y preparar la base de datos

echo "🔄 Aplicando migraciones de base de datos..."

# Configurar el entorno Python
export FLASK_APP=src/app.py
export DATABASE_URL=${DATABASE_URL:-"sqlite:///instance/app.db"}

# Crear directorio de instancia si no existe
mkdir -p instance

# Aplicar migraciones
echo "📋 Ejecutando migraciones de Alembic..."
cd /workspaces/plataformaIT
python -m flask db upgrade 2>/dev/null || echo "⚠️  Migraciones ya aplicadas o error"

# Crear usuario super_admin por defecto si no existe
echo "👤 Verificando usuario super_admin..."
python -c "
import sys
sys.path.append('src')
from app import app
from api.models import db, User
import os

with app.app_context():
    try:
        # Verificar si existe usuario super_admin
        super_admin = User.query.filter_by(email='admin@admin.com').first()
        
        if not super_admin:
            # Crear usuario super_admin
            super_admin = User(
                email='admin@admin.com',
                name='Super Administrador',
                role='super_admin',
                is_active=True
            )
            super_admin.set_password('admin123')
            db.session.add(super_admin)
            db.session.commit()
            print('✅ Usuario super_admin creado')
        else:
            # Actualizar rol si es necesario
            if super_admin.role != 'super_admin':
                super_admin.role = 'super_admin'
                db.session.commit()
                print('✅ Rol de administrador actualizado a super_admin')
            else:
                print('✅ Usuario super_admin ya existe')
                
    except Exception as e:
        print(f'❌ Error: {e}')
"

echo "🎉 ¡Configuración completada!"
echo ""
echo "📊 Credenciales del Super Administrador:"
echo "   Email: admin@admin.com"
echo "   Contraseña: admin123"
echo ""
echo "🔧 Nuevas funcionalidades agregadas:"
echo "   ✅ Botón de guardar manual para matrices"
echo "   ✅ Sistema de 3 roles (super_admin, admin, user)"
echo "   ✅ Recordatorios de pagos con notificaciones"
echo "   ✅ Órdenes de servicio con seguimiento mensual"
echo "   ✅ Dashboard mejorado con alertas"
echo "   ✅ Permisos granulares por rol"
echo ""