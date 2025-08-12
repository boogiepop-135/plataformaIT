import React, { useState, useEffect } from "react";
import BACKEND_URL from "../config/backend.js";
import authManager from "../utils/auth.js";

export const Calendar = () => {
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showEventModal, setShowEventModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [viewMode, setViewMode] = useState("month");
    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        event_type: "other",
        start_date: "",
        end_date: "",
        all_day: false,
        location: "",
        is_recurring: false,
        recurrence_type: "none",
        recurrence_interval: 1,
        recurrence_end_date: ""
    });

    const eventTypes = [
        { value: "visit", label: "Visita", color: "primary", icon: "fas fa-home" },
        { value: "maintenance", label: "Mantenimiento", color: "warning", icon: "fas fa-tools" },
        { value: "meeting", label: "Reunión", color: "info", icon: "fas fa-users" },
        { value: "other", label: "Otro", color: "secondary", icon: "fas fa-calendar" }
    ];

    const recurrenceTypes = [
        { value: "none", label: "No repetir" },
        { value: "daily", label: "Diariamente" },
        { value: "weekly", label: "Semanalmente" },
        { value: "biweekly", label: "Cada 2 semanas" },
        { value: "monthly", label: "Mensualmente" },
        { value: "custom_days", label: "Cada X días" }
    ];

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/calendar-events`);
            if (response.ok) {
                const data = await response.json();
                setEvents(data);
            }
        } catch (error) {
            console.error("Error loading events:", error);
        }
    };

    const handleSaveEvent = async () => {
        // Check authentication before saving
        const isAuthenticated = await authManager.checkAuthForAction(
            editingEvent ? "editar este evento" : "crear un nuevo evento"
        );
        
        if (!isAuthenticated) {
            return;
        }

        try {
            const url = editingEvent
                ? `${BACKEND_URL}/api/calendar-events/${editingEvent.id}`
                : `${BACKEND_URL}/api/calendar-events`;

            const method = editingEvent ? "PUT" : "POST";

            // Prepare the event data
            const eventData = { ...newEvent };

            // If all_day is true, set times to beginning and end of day
            if (eventData.all_day) {
                eventData.start_date = eventData.start_date + "T00:00:00";
                eventData.end_date = eventData.end_date || eventData.start_date + "T23:59:59";
            } else {
                // Ensure we have proper datetime format
                if (!eventData.start_date.includes("T")) {
                    eventData.start_date = eventData.start_date + "T09:00:00";
                }
                if (eventData.end_date && !eventData.end_date.includes("T")) {
                    eventData.end_date = eventData.end_date + "T10:00:00";
                }
            }

            // Generate recurring events if needed
            if (eventData.is_recurring && eventData.recurrence_type !== "none") {
                const recurringEvents = generateRecurringEvents(eventData);
                
                // Save all recurring events
                for (const event of recurringEvents) {
                    await fetch(`${BACKEND_URL}/api/calendar-events`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(event),
                    });
                }
            } else {
                // Save single event
                const response = await fetch(url, {
                    method,
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(eventData),
                });

                if (!response.ok) {
                    throw new Error("Error saving event");
                }
            }

            loadEvents();
            setShowEventModal(false);
            setEditingEvent(null);
            setSelectedDate(null);
            resetEventForm();
            
            authManager.showNotification(
                editingEvent ? "Evento actualizado correctamente" : "Evento creado correctamente",
                "success"
            );

        } catch (error) {
            console.error("Error saving event:", error);
            authManager.showNotification("Error al guardar el evento", "danger");
        }
    };

    const generateRecurringEvents = (baseEvent) => {
        const events = [];
        const startDate = new Date(baseEvent.start_date);
        const endDate = baseEvent.recurrence_end_date ? 
            new Date(baseEvent.recurrence_end_date) : 
            new Date(startDate.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year default

        let currentDate = new Date(startDate);
        let interval = baseEvent.recurrence_interval || 1;

        while (currentDate <= endDate) {
            const event = {
                ...baseEvent,
                start_date: currentDate.toISOString(),
                end_date: baseEvent.end_date ? 
                    new Date(currentDate.getTime() + (new Date(baseEvent.end_date) - new Date(baseEvent.start_date))).toISOString() :
                    currentDate.toISOString(),
                is_recurring: false, // Individual instances are not recurring
                title: `${baseEvent.title} ${baseEvent.recurrence_type !== "none" ? "(Recurrente)" : ""}`
            };
            
            events.push(event);

            // Calculate next occurrence
            switch (baseEvent.recurrence_type) {
                case "daily":
                    currentDate.setDate(currentDate.getDate() + interval);
                    break;
                case "weekly":
                    currentDate.setDate(currentDate.getDate() + (7 * interval));
                    break;
                case "biweekly":
                    currentDate.setDate(currentDate.getDate() + 14);
                    break;
                case "monthly":
                    currentDate.setMonth(currentDate.getMonth() + interval);
                    break;
                case "custom_days":
                    if (baseEvent.title.includes("25")) {
                        currentDate.setDate(currentDate.getDate() + 25);
                    } else {
                        currentDate.setDate(currentDate.getDate() + interval);
                    }
                    break;
                default:
                    return events; // Stop if no valid recurrence type
            }

            // Safety check to prevent infinite loops
            if (events.length > 100) {
                break;
            }
        }

        return events;
    };

    const resetEventForm = () => {
        setNewEvent({
            title: "",
            description: "",
            event_type: "other",
            start_date: "",
            end_date: "",
            all_day: false,
            location: "",
            is_recurring: false,
            recurrence_type: "none",
            recurrence_interval: 1,
            recurrence_end_date: ""
        });
    };

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setNewEvent({
            title: event.title,
            description: event.description,
            event_type: event.event_type,
            start_date: event.start_date ? event.start_date.split('T')[0] : "",
            end_date: event.end_date ? event.end_date.split('T')[0] : "",
            all_day: event.all_day,
            location: event.location || "",
            is_recurring: event.is_recurring || false,
            recurrence_type: event.recurrence_type || "none",
            recurrence_interval: event.recurrence_interval || 1,
            recurrence_end_date: event.recurrence_end_date ? event.recurrence_end_date.split('T')[0] : ""
        });
        setShowEventModal(true);
    };

    const handleDeleteEvent = async (eventId) => {
        // Check authentication before deleting
        const isAuthenticated = await authManager.checkAuthForAction("eliminar este evento");
        
        if (!isAuthenticated) {
            return;
        }

        if (confirm("¿Estás seguro de que quieres eliminar este evento?")) {
            try {
                const response = await fetch(`${BACKEND_URL}/api/calendar-events/${eventId}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    loadEvents();
                    authManager.showNotification("Evento eliminado correctamente", "success");
                } else {
                    throw new Error("Error deleting event");
                }
            } catch (error) {
                console.error("Error deleting event:", error);
                authManager.showNotification("Error al eliminar el evento", "danger");
            }
        }
    };

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const getEventsForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return events.filter(event => {
            const eventDate = event.start_date.split('T')[0];
            return eventDate === dateStr;
        });
    };

    const getEventTypeInfo = (type) => {
        return eventTypes.find(t => t.value === type) || eventTypes[3];
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const navigateToToday = () => {
        setCurrentDate(new Date());
    };

    const handleDateClick = (day) => {
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(clickedDate);
        setNewEvent({
            ...newEvent,
            start_date: clickedDate.toISOString().split('T')[0],
            end_date: clickedDate.toISOString().split('T')[0]
        });
        setShowEventModal(true);
    };

    const renderMonthView = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dayEvents = getEventsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();

            days.push(
                <div
                    key={day}
                    className={`calendar-day ${isToday ? 'today' : ''}`}
                    onClick={() => handleDateClick(day)}
                >
                    <div className="day-number">{day}</div>
                    <div className="day-events">
                        {dayEvents.slice(0, 3).map(event => {
                            const typeInfo = getEventTypeInfo(event.event_type);
                            return (
                                <div
                                    key={event.id}
                                    className={`event-item bg-${typeInfo.color}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditEvent(event);
                                    }}
                                    title={event.title}
                                >
                                    <i className={`${typeInfo.icon} me-1`}></i>
                                    <small>{event.title.length > 15 ? event.title.substring(0, 15) + "..." : event.title}</small>
                                </div>
                            );
                        })}
                        {dayEvents.length > 3 && (
                            <div className="event-item bg-light text-dark">
                                <small>+{dayEvents.length - 3} más</small>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    const getUpcomingEvents = () => {
        const now = new Date();
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        return events
            .filter(event => {
                const eventDate = new Date(event.start_date);
                return eventDate >= now && eventDate <= oneWeekFromNow;
            })
            .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    };

    return (
        <div className="container-fluid mt-4">
            <div className="row">
                <div className="col-lg-9">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h2 className="mb-0">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h2>
                            <div className="btn-group">
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => navigateMonth(-1)}
                                >
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={navigateToToday}
                                >
                                    Hoy
                                </button>
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => navigateMonth(1)}
                                >
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowEventModal(true)}
                                >
                                    <i className="fas fa-plus me-2"></i>Nuevo Evento
                                </button>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            <div className="calendar-container">
                                <div className="calendar-header">
                                    {dayNames.map(day => (
                                        <div key={day} className="calendar-day-header">
                                            {day}
                                        </div>
                                    ))}
                                </div>
                                <div className="calendar-grid">
                                    {renderMonthView()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0 text-white">Próximos Eventos</h5>
                        </div>
                        <div className="card-body">
                            {getUpcomingEvents().length === 0 ? (
                                <p className="text-dark fw-bold">No hay eventos próximos</p>
                            ) : (
                                getUpcomingEvents().map(event => {
                                    const typeInfo = getEventTypeInfo(event.event_type);
                                    return (
                                        <div key={event.id} className="mb-3 p-2 border rounded bg-light">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex align-items-center mb-1">
                                                        <span className={`badge bg-${typeInfo.color} me-2`}>
                                                            <i className={`${typeInfo.icon} me-1`}></i>
                                                            {typeInfo.label}
                                                        </span>
                                                    </div>
                                                    <h6 className="mb-1 text-dark fw-bold">{event.title}</h6>
                                                    <small className="text-dark fw-bold">
                                                        <i className="fas fa-calendar me-1"></i>
                                                        {new Date(event.start_date).toLocaleDateString()}
                                                        {!event.all_day && (
                                                            <span>
                                                                {" - "}
                                                                {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        )}
                                                    </small>
                                                    {event.location && (
                                                        <div>
                                                            <small className="text-dark fw-bold">
                                                                <i className="fas fa-map-marker-alt me-1"></i>
                                                                {event.location}
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="dropdown">
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary"
                                                        type="button"
                                                        onClick={() => handleEditEvent(event)}
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Event Types Legend */}
                    <div className="card mt-3">
                        <div className="card-header bg-dark text-white">
                            <h6 className="mb-0 text-white">Tipos de Eventos</h6>
                        </div>
                        <div className="card-body">
                            {eventTypes.map(type => (
                                <div key={type.value} className="d-flex align-items-center mb-2">
                                    <span className={`badge bg-${type.color} me-2`}>
                                        <i className={`${type.icon}`}></i>
                                    </span>
                                    <span className="text-dark fw-bold">{type.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Modal */}
            {showEventModal && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingEvent ? "Editar Evento" : "Nuevo Evento"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowEventModal(false);
                                        setEditingEvent(null);
                                        setSelectedDate(null);
                                        resetEventForm();
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="mb-3">
                                        <label className="form-label">Título *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newEvent.title}
                                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Descripción</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={newEvent.description}
                                            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Tipo de Evento</label>
                                        <select
                                            className="form-select"
                                            value={newEvent.event_type}
                                            onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                                        >
                                            {eventTypes.map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Fecha de inicio *</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={newEvent.start_date}
                                                    onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Fecha de fin</label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={newEvent.end_date}
                                                    onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={newEvent.all_day}
                                                onChange={(e) => setNewEvent({ ...newEvent, all_day: e.target.checked })}
                                            />
                                            <label className="form-check-label">
                                                Todo el día
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Ubicación</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newEvent.location}
                                            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                            placeholder="Ubicación del evento"
                                        />
                                    </div>
                                    
                                    {/* Recurrence Section */}
                                    <div className="mb-3">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={newEvent.is_recurring}
                                                onChange={(e) => setNewEvent({ ...newEvent, is_recurring: e.target.checked })}
                                            />
                                            <label className="form-check-label">
                                                <i className="fas fa-repeat me-1"></i>
                                                Evento recurrente
                                            </label>
                                        </div>
                                    </div>

                                    {newEvent.is_recurring && (
                                        <div className="card mb-3" style={{ backgroundColor: "var(--background-light)" }}>
                                            <div className="card-body">
                                                <h6 className="card-title">
                                                    <i className="fas fa-cog me-1"></i>
                                                    Configuración de Recurrencia
                                                </h6>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="mb-3">
                                                            <label className="form-label">Tipo de repetición</label>
                                                            <select
                                                                className="form-select"
                                                                value={newEvent.recurrence_type}
                                                                onChange={(e) => setNewEvent({ ...newEvent, recurrence_type: e.target.value })}
                                                            >
                                                                {recurrenceTypes.map(type => (
                                                                    <option key={type.value} value={type.value}>
                                                                        {type.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        {(newEvent.recurrence_type === "daily" || newEvent.recurrence_type === "custom_days") && (
                                                            <div className="mb-3">
                                                                <label className="form-label">
                                                                    {newEvent.recurrence_type === "daily" ? "Cada X días" : "Cada X días (ej: 25)"}
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    min="1"
                                                                    max="365"
                                                                    value={newEvent.recurrence_interval}
                                                                    onChange={(e) => setNewEvent({ ...newEvent, recurrence_interval: parseInt(e.target.value) })}
                                                                />
                                                            </div>
                                                        )}
                                                        {newEvent.recurrence_type === "weekly" && (
                                                            <div className="mb-3">
                                                                <label className="form-label">Cada X semanas</label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    min="1"
                                                                    max="52"
                                                                    value={newEvent.recurrence_interval}
                                                                    onChange={(e) => setNewEvent({ ...newEvent, recurrence_interval: parseInt(e.target.value) })}
                                                                />
                                                            </div>
                                                        )}
                                                        {newEvent.recurrence_type === "monthly" && (
                                                            <div className="mb-3">
                                                                <label className="form-label">Cada X meses</label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    min="1"
                                                                    max="12"
                                                                    value={newEvent.recurrence_interval}
                                                                    onChange={(e) => setNewEvent({ ...newEvent, recurrence_interval: parseInt(e.target.value) })}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Repetir hasta (opcional)</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        value={newEvent.recurrence_end_date}
                                                        onChange={(e) => setNewEvent({ ...newEvent, recurrence_end_date: e.target.value })}
                                                    />
                                                    <div className="form-text">
                                                        Si no se especifica, se repetirá por 1 año
                                                    </div>
                                                </div>
                                                <div className="alert alert-info small">
                                                    <i className="fas fa-info-circle me-1"></i>
                                                    <strong>Ejemplos:</strong><br/>
                                                    • Cada 25 días: Selecciona "Cada X días" y escribe 25<br/>
                                                    • Cada semana: Selecciona "Semanalmente"<br/>
                                                    • Una semana sí, otra no: Selecciona "Cada 2 semanas"
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <label className="form-label">Ubicación</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newEvent.location}
                                            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                            placeholder="Oficina, dirección, etc."
                                        />
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                {editingEvent && (
                                    <button
                                        type="button"
                                        className="btn btn-danger me-auto"
                                        onClick={() => handleDeleteEvent(editingEvent.id)}
                                    >
                                        <i className="fas fa-trash me-1"></i>Eliminar
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowEventModal(false);
                                        setEditingEvent(null);
                                        setSelectedDate(null);
                                        setNewEvent({
                                            title: "",
                                            description: "",
                                            event_type: "other",
                                            start_date: "",
                                            end_date: "",
                                            all_day: false,
                                            location: ""
                                        });
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSaveEvent}
                                    disabled={!newEvent.title || !newEvent.start_date}
                                >
                                    {editingEvent ? "Actualizar" : "Crear"} Evento
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .calendar-container {
                    width: 100%;
                }
                
                .calendar-header {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    background-color: #f8f9fa;
                }
                
                .calendar-day-header {
                    padding: 10px;
                    text-align: center;
                    font-weight: bold;
                    border: 1px solid #dee2e6;
                }
                
                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                }
                
                .calendar-day {
                    min-height: 120px;
                    border: 1px solid #dee2e6;
                    padding: 8px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .calendar-day:hover {
                    background-color: #f8f9fa;
                }
                
                .calendar-day.today {
                    background-color: #e3f2fd;
                }
                
                .calendar-day.empty {
                    background-color: #f8f9fa;
                    cursor: default;
                }
                
                .day-number {
                    font-weight: bold;
                    margin-bottom: 4px;
                }
                
                .day-events {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                
                .event-item {
                    padding: 2px 6px;
                    border-radius: 3px;
                    color: white;
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: opacity 0.2s;
                }
                
                .event-item:hover {
                    opacity: 0.8;
                }
            `}</style>
        </div>
    );
};
