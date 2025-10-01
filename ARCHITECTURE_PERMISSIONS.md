# 🔐 **MATRIZ DE PERMISOS Y ENDPOINTS**

## **Decoradores de Autenticación Actualizados:**

```python
# Nuevos decoradores para el sistema de permisos
def super_admin_required(f):
    """Solo Super Admin puede acceder"""
    pass

def admin_required(f):
    """Admin de cualquier departamento o Super Admin"""
    pass

def department_admin_required(department_id=None):
    """Admin del departamento específico o Super Admin"""
    pass

def owner_or_admin_required(f):
    """Creador del recurso, Admin asignado o Super Admin"""
    pass
```

## **ENDPOINTS Y PERMISOS:**

### **👥 GESTIÓN DE USUARIOS**

| Endpoint             | Método | Permisos    | Descripción              |
| -------------------- | ------ | ----------- | ------------------------ |
| `/api/users`         | GET    | Super Admin | Ver todos los usuarios   |
| `/api/users`         | POST   | Super Admin | Crear nuevo usuario      |
| `/api/users/{id}`    | PUT    | Super Admin | Modificar usuario        |
| `/api/users/{id}`    | DELETE | Super Admin | Eliminar usuario         |
| `/api/users/profile` | GET    | Autenticado | Ver propio perfil        |
| `/api/users/profile` | PUT    | Autenticado | Actualizar propio perfil |

### **🏢 GESTIÓN DE DEPARTAMENTOS**

| Endpoint                                  | Método | Permisos    | Descripción                  |
| ----------------------------------------- | ------ | ----------- | ---------------------------- |
| `/api/departments`                        | GET    | Super Admin | Ver todos los departamentos  |
| `/api/departments`                        | POST   | Super Admin | Crear departamento           |
| `/api/departments/{id}`                   | PUT    | Super Admin | Modificar departamento       |
| `/api/departments/{id}`                   | DELETE | Super Admin | Eliminar departamento        |
| `/api/departments/{id}/admins`            | GET    | Super Admin | Ver admins de departamento   |
| `/api/departments/{id}/admins`            | POST   | Super Admin | Asignar admin a departamento |
| `/api/departments/{id}/admins/{admin_id}` | DELETE | Super Admin | Desasignar admin             |

### **🎫 GESTIÓN DE TICKETS**

| Endpoint                     | Método | Permisos          | Lógica de Acceso                                                                                               |
| ---------------------------- | ------ | ----------------- | -------------------------------------------------------------------------------------------------------------- |
| `/api/tickets`               | GET    | Autenticado       | **Super Admin:** Todos los tickets<br>**Admin:** Tickets de sus departamentos<br>**Usuario:** Solo sus tickets |
| `/api/tickets`               | POST   | Autenticado       | Cualquier usuario puede crear                                                                                  |
| `/api/tickets/{id}`          | GET    | Owner/Admin/Super | Ver ticket específico                                                                                          |
| `/api/tickets/{id}`          | PUT    | Admin/Super       | Actualizar ticket (solo campos permitidos)                                                                     |
| `/api/tickets/{id}/status`   | PUT    | Admin/Super       | Cambiar estado del ticket                                                                                      |
| `/api/tickets/{id}/assign`   | PUT    | Admin/Super       | Asignar ticket a admin                                                                                         |
| `/api/tickets/{id}/comments` | GET    | Owner/Admin/Super | Ver comentarios                                                                                                |
| `/api/tickets/{id}/comments` | POST   | Owner/Admin/Super | Agregar comentario                                                                                             |
| `/api/tickets/{id}/rate`     | POST   | Owner             | Calificar ticket resuelto                                                                                      |
| `/api/tickets/{id}/history`  | GET    | Admin/Super       | Ver historial de cambios                                                                                       |

### **🔔 NOTIFICACIONES**

| Endpoint                           | Método | Permisos    | Descripción                |
| ---------------------------------- | ------ | ----------- | -------------------------- |
| `/api/notifications`               | GET    | Autenticado | Notificaciones del usuario |
| `/api/notifications/{id}/read`     | PUT    | Owner       | Marcar como leída          |
| `/api/notifications/mark-all-read` | PUT    | Autenticado | Marcar todas como leídas   |

### **📊 REPORTES Y ESTADÍSTICAS**

| Endpoint                   | Método | Permisos    | Descripción                  |
| -------------------------- | ------ | ----------- | ---------------------------- |
| `/api/reports/tickets`     | GET    | Admin/Super | Estadísticas de tickets      |
| `/api/reports/departments` | GET    | Super Admin | Rendimiento por departamento |
| `/api/reports/users`       | GET    | Super Admin | Actividad de usuarios        |

## **REGLAS DE NEGOCIO ESPECÍFICAS:**

### **🎯 Creación de Tickets:**

- Usuario puede crear ticket dirigido a:
  - Departamento específico → Se asigna al Admin de ese departamento
  - "General" o sin departamento → Se asigna al Super Admin
- Auto-asignación inteligente basada en carga de trabajo

### **🔄 Flujo de Estados:**

```
open → in_progress → resolved → closed
  ↓         ↓           ↓
[Solo Admin/Super puede cambiar estados]
```

### **⭐ Sistema de Calificación:**

- Solo disponible cuando ticket está en estado "resolved"
- Solo el creador puede calificar
- Calificación de 1-5 estrellas + comentario opcional
- Notificación automática al Admin responsable

### **👀 Visibilidad de Datos:**

- **Super Admin:** Ve TODO
- **Admin:** Ve tickets de SUS departamentos + usuarios de esos departamentos
- **Usuario:** Ve solo SUS tickets + su perfil
