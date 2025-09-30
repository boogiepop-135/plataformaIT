import React, { useState, useEffect } from 'react';
import BACKEND_URL from '../config/backend.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { ProtectedRoute } from '../components/ProtectedRoute.jsx';

const MatrixManager = () => {
    const { isAuthenticated, getAuthHeaders } = useAuth();
    const [matrices, setMatrices] = useState([]);
    const [templates, setTemplates] = useState({});
    const [currentMatrix, setCurrentMatrix] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newMatrixForm, setNewMatrixForm] = useState({
        name: '',
        description: '',
        matrix_type: 'custom',
        rows: 3,
        columns: 3
    });

    useEffect(() => {
        fetchMatrices();
        fetchTemplates();
    }, []);

    const fetchMatrices = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BACKEND_URL}/api/matrices`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                setMatrices(data);
            }
        } catch (error) {
            console.error('Error loading matrices:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMatrices = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/matrices`);
            if (response.ok) {
                const data = await response.json();
                setMatrices(data);
            }
        } catch (error) {
            console.error('Error loading matrices:', error);
        }
    };

    const handleExportMatricesPDF = async () => {
        if (!isAuthenticated) {
            alert('Debe estar autenticado para exportar');
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/matrices/export/pdf`, {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `matrices_export_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Error al exportar PDF');
            }
        } catch (error) {
            alert('Error de conexión al exportar PDF');
        }
    };

    const handleExportMatricesExcel = async () => {
        if (!isAuthenticated) {
            alert('Debe estar autenticado para exportar');
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/matrices/export/excel`, {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `matrices_export_${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Error al exportar Excel');
            }
        } catch (error) {
            alert('Error de conexión al exportar Excel');
        }
    };

    const fetchTemplates = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/matrix-templates`);
            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const createMatrix = async (matrixData) => {
        if (!isAuthenticated) {
            alert("Debes estar autenticado para crear una matriz");
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/matrices`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(matrixData),
            });

            if (response.ok) {
                const newMatrix = await response.json();
                setMatrices([...matrices, newMatrix]);
                setCurrentMatrix(newMatrix);
                return true;
            }
        } catch (error) {
            console.error('Error creating matrix:', error);
        }
        return false;
    };

    const updateMatrix = async (matrixId, updates) => {
        if (!isAuthenticated) {
            alert("Debes estar autenticado para actualizar una matriz");
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/matrices/${matrixId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updates),
            });

            if (response.ok) {
                const updatedMatrix = await response.json();
                setMatrices(matrices.map(m => m.id === matrixId ? updatedMatrix : m));
                if (currentMatrix && currentMatrix.id === matrixId) {
                    setCurrentMatrix(updatedMatrix);
                }
                return true;
            }
        } catch (error) {
            console.error('Error updating matrix:', error);
        }
        return false;
    };

    const deleteMatrix = async (matrixId) => {
        if (!isAuthenticated) {
            alert("Debes estar autenticado para eliminar una matriz");
            return;
        }

        if (!window.confirm('¿Estás seguro de que quieres eliminar esta matriz?')) return;

        try {
            const response = await fetch(`${BACKEND_URL}/api/matrices/${matrixId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                setMatrices(matrices.filter(m => m.id !== matrixId));
                if (currentMatrix && currentMatrix.id === matrixId) {
                    setCurrentMatrix(null);
                }
            }
        } catch (error) {
            console.error('Error deleting matrix:', error);
        }
    };

    const handleCreateFromTemplate = (templateKey) => {
        const template = templates[templateKey];
        setNewMatrixForm({
            name: template.name,
            description: template.description,
            matrix_type: templateKey,
            rows: template.rows,
            columns: template.columns,
            headers: template.headers
        });
        setShowTemplateModal(false);
        setShowModal(true);
    };

    const handleCreateMatrix = async (e) => {
        e.preventDefault();
        const success = await createMatrix(newMatrixForm);
        if (success) {
            setShowModal(false);
            setNewMatrixForm({
                name: '',
                description: '',
                matrix_type: 'custom',
                rows: 3,
                columns: 3
            });
        }
    };

    const handleCellEdit = (row, col, value) => {
        if (!currentMatrix) return;

        const updatedData = { ...currentMatrix.data };
        updatedData[`${row}-${col}`] = value;

        updateMatrix(currentMatrix.id, { data: updatedData });
    };

    const getMatrixTypeLabel = (type) => {
        const labels = {
            swot: 'SWOT',
            eisenhower: 'Eisenhower',
            bcg: 'BCG',
            risk: 'Riesgos',
            decision: 'Decisión',
            custom: 'Personalizada'
        };
        return labels[type] || type;
    };

    const getMatrixTypeColor = (type) => {
        const colors = {
            swot: 'bg-primary',
            eisenhower: 'bg-success',
            bcg: 'bg-info',
            risk: 'bg-danger',
            decision: 'bg-warning',
            custom: 'bg-secondary'
        };
        return colors[type] || 'bg-secondary';
    };

    if (loading) {
        return (
            <div className="container py-4">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute requireAuth={true}>
            <div className="container-fluid py-4">
                <div className="row mb-4">
                    <div className="col-12">
                        <h1 className="display-4 mb-2">
                            <i className="fas fa-th me-3"></i>Gestor de Matrices
                        </h1>
                        <p className="lead text-muted">
                            Crea y gestiona matrices para análisis estratégico, toma de decisiones y más.
                        </p>
                    </div>
                </div>

                <div className="row">
                    {/* Lista de matrices */}
                    <div className="col-lg-4 col-md-5 mb-4">
                        <div className="card shadow">
                            <div className="card-header bg-primary text-white">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">
                                        <i className="fas fa-list me-2"></i>Mis Matrices
                                    </h5>
                                    <div className="btn-group" role="group">
                                        {isAuthenticated && (
                                            <div className="dropdown me-2">
                                                <button className="btn btn-outline-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                                    <i className="fas fa-download me-1"></i>
                                                </button>
                                                <ul className="dropdown-menu">
                                                    <li>
                                                        <button className="dropdown-item" onClick={handleExportMatricesPDF}>
                                                            <i className="fas fa-file-pdf me-2 text-danger"></i>PDF
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button className="dropdown-item" onClick={handleExportMatricesExcel}>
                                                            <i className="fas fa-file-excel me-2 text-success"></i>Excel
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setShowTemplateModal(true)}
                                            className="btn btn-outline-light btn-sm"
                                            title="Ver plantillas"
                                        >
                                            <i className="fas fa-layer-group"></i>
                                        </button>
                                        <button
                                            onClick={() => setShowModal(true)}
                                            className="btn btn-light btn-sm"
                                            title="Nueva matriz"
                                        >
                                            <i className="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body p-0" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                {matrices.length === 0 ? (
                                    <div className="text-center p-4">
                                        <i className="fas fa-th fa-3x text-muted mb-3"></i>
                                        <p className="text-muted">No hay matrices creadas</p>
                                        <button
                                            onClick={() => setShowModal(true)}
                                            className="btn btn-primary btn-sm"
                                        >
                                            <i className="fas fa-plus me-2"></i>Crear primera matriz
                                        </button>
                                    </div>
                                ) : (
                                    <div className="list-group list-group-flush">
                                        {matrices.map((matrix) => (
                                            <div
                                                key={matrix.id}
                                                className={`list-group-item list-group-item-action ${currentMatrix?.id === matrix.id ? 'active' : ''
                                                    }`}
                                                onClick={() => setCurrentMatrix(matrix)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div className="flex-grow-1">
                                                        <h6 className="mb-1">{matrix.name}</h6>
                                                        <p className="mb-1 small text-muted">
                                                            {matrix.description}
                                                        </p>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className={`badge ${getMatrixTypeColor(matrix.matrix_type)} text-white`}>
                                                                {getMatrixTypeLabel(matrix.matrix_type)}
                                                            </span>
                                                            <small className="text-muted">
                                                                {matrix.rows}×{matrix.columns}
                                                            </small>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteMatrix(matrix.id);
                                                        }}
                                                        className="btn btn-outline-danger btn-sm ms-2"
                                                        title="Eliminar matriz"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Matriz actual */}
                    <div className="col-lg-8 col-md-7">
                        {currentMatrix ? (
                            <div className="card shadow">
                                <div className="card-header bg-success text-white">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h5 className="mb-0">
                                                <i className="fas fa-edit me-2"></i>{currentMatrix.name}
                                            </h5>
                                            <small className="opacity-75">
                                                {currentMatrix.description}
                                            </small>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className={`badge ${getMatrixTypeColor(currentMatrix.matrix_type)} text-white`}>
                                                {getMatrixTypeLabel(currentMatrix.matrix_type)}
                                            </span>
                                            <small className="opacity-75">
                                                Actualizada: {new Date(currentMatrix.updated_at).toLocaleDateString()}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    {/* Tabla de la matriz */}
                                    <div className="table-responsive">
                                        <table className="table table-bordered">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="text-center" style={{ minWidth: '100px' }}></th>
                                                    {currentMatrix.headers.columns.map((col, colIndex) => (
                                                        <th key={colIndex} className="text-center bg-light" style={{ minWidth: '200px' }}>
                                                            <strong>{col}</strong>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentMatrix.headers.rows.map((row, rowIndex) => (
                                                    <tr key={rowIndex}>
                                                        <th className="bg-light text-center align-middle">
                                                            <strong>{row}</strong>
                                                        </th>
                                                        {currentMatrix.headers.columns.map((col, colIndex) => (
                                                            <td key={`${rowIndex}-${colIndex}`} className="p-2">
                                                                <textarea
                                                                    className="form-control border-0 resize-none"
                                                                    style={{ minHeight: '100px', fontSize: '14px' }}
                                                                    value={currentMatrix.data[`${rowIndex}-${colIndex}`] || ''}
                                                                    onChange={(e) => handleCellEdit(rowIndex, colIndex, e.target.value)}
                                                                    placeholder="Escribe aquí..."
                                                                />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="card shadow">
                                <div className="card-body text-center py-5">
                                    <i className="fas fa-th fa-4x text-muted mb-4"></i>
                                    <h4 className="text-muted">No hay matriz seleccionada</h4>
                                    <p className="text-muted mb-4">
                                        Selecciona una matriz existente o crea una nueva para comenzar.
                                    </p>
                                    <div className="d-grid gap-2 d-md-block">
                                        <button
                                            onClick={() => setShowTemplateModal(true)}
                                            className="btn btn-outline-primary me-2"
                                        >
                                            <i className="fas fa-layer-group me-2"></i>Ver Plantillas
                                        </button>
                                        <button
                                            onClick={() => setShowModal(true)}
                                            className="btn btn-primary"
                                        >
                                            <i className="fas fa-plus me-2"></i>Crear Nueva Matriz
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal para crear nueva matriz */}
                {showModal && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        <i className="fas fa-plus me-2"></i>Nueva Matriz
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    ></button>
                                </div>
                                <form onSubmit={handleCreateMatrix}>
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Nombre *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={newMatrixForm.name}
                                                    onChange={(e) => setNewMatrixForm({ ...newMatrixForm, name: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Tipo de Matriz</label>
                                                <select
                                                    className="form-select"
                                                    value={newMatrixForm.matrix_type}
                                                    onChange={(e) => setNewMatrixForm({ ...newMatrixForm, matrix_type: e.target.value })}
                                                >
                                                    <option value="custom">Personalizada</option>
                                                    <option value="swot">Análisis SWOT</option>
                                                    <option value="eisenhower">Matriz de Eisenhower</option>
                                                    <option value="bcg">Matriz BCG</option>
                                                    <option value="risk">Matriz de Riesgos</option>
                                                    <option value="decision">Matriz de Decisión</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Descripción</label>
                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                value={newMatrixForm.description}
                                                onChange={(e) => setNewMatrixForm({ ...newMatrixForm, description: e.target.value })}
                                            />
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <label className="form-label">Filas</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    className="form-control"
                                                    value={newMatrixForm.rows}
                                                    onChange={(e) => setNewMatrixForm({ ...newMatrixForm, rows: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label">Columnas</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    className="form-control"
                                                    value={newMatrixForm.columns}
                                                    onChange={(e) => setNewMatrixForm({ ...newMatrixForm, columns: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                        >
                                            <i className="fas fa-save me-2"></i>Crear Matriz
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de plantillas */}
                {showTemplateModal && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-xl">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        <i className="fas fa-layer-group me-2"></i>Plantillas de Matrices
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowTemplateModal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        {Object.entries(templates).map(([key, template]) => (
                                            <div key={key} className="col-md-6 col-lg-4">
                                                <div
                                                    className="card h-100 border-2 border-primary-subtle"
                                                    onClick={() => handleCreateFromTemplate(key)}
                                                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                                    onMouseEnter={(e) => e.target.closest('.card').classList.add('shadow')}
                                                    onMouseLeave={(e) => e.target.closest('.card').classList.remove('shadow')}
                                                >
                                                    <div className="card-body">
                                                        <h6 className="card-title text-primary">
                                                            <i className="fas fa-th me-2"></i>
                                                            {template.name}
                                                        </h6>
                                                        <p className="card-text small text-muted mb-3">
                                                            {template.description}
                                                        </p>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span className={`badge ${getMatrixTypeColor(key)} text-white`}>
                                                                {getMatrixTypeLabel(key)}
                                                            </span>
                                                            <small className="text-muted">
                                                                {template.rows}×{template.columns}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowTemplateModal(false)}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default MatrixManager;
