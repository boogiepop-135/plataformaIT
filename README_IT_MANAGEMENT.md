# Plataforma IT - Sistema de Gestión Profesional

Una aplicación completa para la gestión profesional de tareas IT, tickets de soporte y calendario de actividades.

## 🚀 Características

### 📊 Dashboard Principal

- Vista general de estadísticas
- Resumen de tareas, tickets y eventos
- Acceso rápido a todas las funcionalidades

### 📋 Kanban Board

- Gestión visual de tareas con drag & drop
- Estados: Por Hacer, En Progreso, Revisión, Completado
- Prioridades: Baja, Media, Alta, Urgente
- Fechas límite y descripciones detalladas

### 🎫 Sistema de Tickets

- Gestión completa de tickets de soporte
- Estados: Abierto, En Progreso, Resuelto, Cerrado
- Información del solicitante
- Filtros por estado y prioridad

### 📅 Calendario

- Vista mensual completa
- Tipos de eventos: Visitas, Mantenimientos, Reuniones
- Programación de eventos con ubicación
- Vista de próximos eventos

## 🛠️ Tecnologías

**Backend:**

- Flask 3.0 (Python)
- SQLAlchemy 2.0
- Flask-Migrate para migraciones
- Flask-CORS para comunicación frontend-backend

**Frontend:**

- React 18
- Vite (build tool)
- Bootstrap 5
- Font Awesome icons

**Base de Datos:**

- SQLite (desarrollo)
- PostgreSQL (producción)

## 📦 Instalación y Configuración

### Prerrequisitos

- Python 3.8+
- Node.js 18+
- npm o yarn

### Backend Setup

1. **Instalar dependencias de Python:**

```bash
pip install -r requirements.txt
```

2. **Configurar variables de entorno:**
   Crear archivo `.env` en la raíz del proyecto:

```
FLASK_DEBUG=1
DATABASE_URL=sqlite:///app.db
```

3. **Inicializar la base de datos:**

```bash
cd src
flask db init
flask db migrate -m "Add IT management models"
flask db upgrade
```

4. **Ejecutar el backend:**

```bash
python src/app.py
```

### Frontend Setup

1. **Instalar dependencias:**

```bash
npm install
```

2. **Configurar variables de entorno:**
   Crear archivo `.env` en la raíz:

```
VITE_BACKEND_URL=http://localhost:5000
```

3. **Ejecutar el frontend:**

```bash
npm run dev
```

## 🎯 Uso de la Aplicación

### Dashboard

- Accede a `/` para ver el resumen general
- Revisa estadísticas de tareas, tickets y eventos
- Usa los accesos rápidos para navegar

### Kanban Board

- Ve a `/kanban` para gestionar tareas
- Arrastra y suelta tareas entre columnas
- Crea nuevas tareas con el botón "Nueva Tarea"
- Edita tareas haciendo clic en el ícono de editar

### Sistema de Tickets

- Accede a `/tickets` para gestionar tickets
- Filtra por estado usando los botones de filtro
- Crea tickets con información del solicitante
- Actualiza estados y prioridades

### Calendario

- Ve a `/calendar` para gestionar eventos
- Haz clic en cualquier día para crear un evento
- Ve próximos eventos en la barra lateral
- Tipos de eventos codificados por colores

## 📱 Características Móviles

- Diseño completamente responsivo
- Navegación optimizada para móviles
- Funcionalidad táctil para drag & drop

## 🔧 API Endpoints

### Tareas

- `GET /api/tasks` - Obtener todas las tareas
- `POST /api/tasks` - Crear nueva tarea
- `PUT /api/tasks/{id}` - Actualizar tarea
- `DELETE /api/tasks/{id}` - Eliminar tarea

### Tickets

- `GET /api/tickets` - Obtener todos los tickets
- `POST /api/tickets` - Crear nuevo ticket
- `PUT /api/tickets/{id}` - Actualizar ticket
- `DELETE /api/tickets/{id}` - Eliminar ticket

### Eventos de Calendario

- `GET /api/calendar-events` - Obtener todos los eventos
- `POST /api/calendar-events` - Crear nuevo evento
- `PUT /api/calendar-events/{id}` - Actualizar evento
- `DELETE /api/calendar-events/{id}` - Eliminar evento

## 🚀 Despliegue

### Desarrollo

```bash
# Backend
python src/app.py

# Frontend
npm run dev
```

### Producción

```bash
# Build frontend
npm run build

# Run with Gunicorn
gunicorn --bind 0.0.0.0:5000 src.wsgi:app
```

## 📄 Estructura del Proyecto

```
plataformaIT/
├── src/
│   ├── api/
│   │   ├── models.py      # Modelos de base de datos
│   │   ├── routes.py      # Rutas de la API
│   │   └── ...
│   ├── front/
│   │   ├── pages/         # Páginas principales
│   │   ├── components/    # Componentes reutilizables
│   │   └── ...
│   └── app.py            # Aplicación Flask principal
├── migrations/           # Migraciones de base de datos
├── requirements.txt      # Dependencias Python
├── package.json         # Dependencias Node.js
└── README.md           # Este archivo
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 📧 Contacto

Para soporte técnico o consultas sobre la plataforma, contacta al departamento de IT.

---

**Desarrollado con ❤️ para la gestión profesional de IT**
