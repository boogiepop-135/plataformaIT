import React, { useState, useEffect } from "react";

export const KanbanBoard = () => {
    const [tasks, setTasks] = useState([]);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        due_date: ""
    });

    const columns = [
        { id: "todo", title: "Por Hacer", className: "bg-light" },
        { id: "in_progress", title: "En Progreso", className: "bg-primary text-white" },
        { id: "review", title: "Revisión", className: "bg-warning text-dark" },
        { id: "done", title: "Completado", className: "bg-success text-white" }
    ];

    const priorityColors = {
        low: "success",
        medium: "warning",
        high: "danger",
        urgent: "dark"
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/tasks`);
            if (response.ok) {
                const data = await response.json();
                setTasks(data);
            }
        } catch (error) {
            console.error("Error loading tasks:", error);
        }
    };

    const handleSaveTask = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const url = editingTask
                ? `${backendUrl}/api/tasks/${editingTask.id}`
                : `${backendUrl}/api/tasks`;

            const method = editingTask ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newTask),
            });

            if (response.ok) {
                loadTasks();
                setShowTaskModal(false);
                setEditingTask(null);
                setNewTask({
                    title: "",
                    description: "",
                    status: "todo",
                    priority: "medium",
                    due_date: ""
                });
            }
        } catch (error) {
            console.error("Error saving task:", error);
        }
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setNewTask({
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            due_date: task.due_date ? task.due_date.split('T')[0] : ""
        });
        setShowTaskModal(true);
    };

    const handleDeleteTask = async (taskId) => {
        if (confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const response = await fetch(`${backendUrl}/api/tasks/${taskId}`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    loadTasks();
                }
            } catch (error) {
                console.error("Error deleting task:", error);
            }
        }
    };

    const handleDragStart = (e, task) => {
        e.dataTransfer.setData("text/plain", JSON.stringify(task));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        const taskData = JSON.parse(e.dataTransfer.getData("text/plain"));

        if (taskData.status !== newStatus) {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const response = await fetch(`${backendUrl}/api/tasks/${taskData.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ ...taskData, status: newStatus }),
                });

                if (response.ok) {
                    loadTasks();
                }
            } catch (error) {
                console.error("Error updating task status:", error);
            }
        }
    };

    const getTasksByStatus = (status) => {
        return tasks.filter(task => task.status === status);
    };

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h2">Tablero Kanban</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowTaskModal(true)}
                >
                    <i className="fas fa-plus me-2"></i>Nueva Tarea
                </button>
            </div>

            <div className="row">
                {columns.map(column => (
                    <div key={column.id} className="col-md-3 mb-4">
                        <div
                            className={`card h-100 ${column.className}`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.id)}
                        >
                            <div className="card-header">
                                <h5 className="mb-0">
                                    {column.title} ({getTasksByStatus(column.id).length})
                                </h5>
                            </div>
                            <div className="card-body" style={{ minHeight: "500px" }}>
                                {getTasksByStatus(column.id).map(task => (
                                    <div
                                        key={task.id}
                                        className="card mb-3 shadow-sm"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task)}
                                        style={{ cursor: "move" }}
                                    >
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h6 className="card-title mb-0">{task.title}</h6>
                                                <span className={`badge bg-${priorityColors[task.priority]}`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                            {task.description && (
                                                <p className="card-text small text-muted">
                                                    {task.description}
                                                </p>
                                            )}
                                            {task.due_date && (
                                                <small className="text-muted">
                                                    <i className="fas fa-calendar me-1"></i>
                                                    {new Date(task.due_date).toLocaleDateString()}
                                                </small>
                                            )}
                                            <div className="mt-2">
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-1"
                                                    onClick={() => handleEditTask(task)}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDeleteTask(task.id)}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Task Modal */}
            {showTaskModal && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingTask ? "Editar Tarea" : "Nueva Tarea"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowTaskModal(false);
                                        setEditingTask(null);
                                        setNewTask({
                                            title: "",
                                            description: "",
                                            status: "todo",
                                            priority: "medium",
                                            due_date: ""
                                        });
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="mb-3">
                                        <label className="form-label">Título</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={newTask.title}
                                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Descripción</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={newTask.description}
                                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                        ></textarea>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Estado</label>
                                                <select
                                                    className="form-select"
                                                    value={newTask.status}
                                                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                                                >
                                                    <option value="todo">Por Hacer</option>
                                                    <option value="in_progress">En Progreso</option>
                                                    <option value="review">Revisión</option>
                                                    <option value="done">Completado</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Prioridad</label>
                                                <select
                                                    className="form-select"
                                                    value={newTask.priority}
                                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                                >
                                                    <option value="low">Baja</option>
                                                    <option value="medium">Media</option>
                                                    <option value="high">Alta</option>
                                                    <option value="urgent">Urgente</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Fecha límite</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={newTask.due_date}
                                            onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                        />
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowTaskModal(false);
                                        setEditingTask(null);
                                        setNewTask({
                                            title: "",
                                            description: "",
                                            status: "todo",
                                            priority: "medium",
                                            due_date: ""
                                        });
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSaveTask}
                                    disabled={!newTask.title}
                                >
                                    {editingTask ? "Actualizar" : "Crear"} Tarea
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
