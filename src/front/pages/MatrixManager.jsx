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
    const [saving, setSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [tempMatrixData, setTempMatrixData] = useState({});
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

            // Datos de prueba para matrices
            const mockMatrices = [
                {
                    id: 1,
                    name: 'Inventario Q4 2025',
                    description: 'Control de inventario cuarto trimestre',
                    matrix_type: 'inventory',
                    rows: 5,
                    columns: 4,
                    data: [
                        ['Producto', 'Stock Actual', 'Stock Mínimo', 'Precio Unitario'],
                        ['Laptops Dell XPS 13', '25', '10', '$1,250.00'],
                        ['Monitores Samsung 24"', '45', '15', '$320.00'],
                        ['Teclados Mecánicos', '78', '20', '$89.99'],
                        ['Mouse Logitech MX Master', '32', '12', '$99.99']
                    ],
                    created_at: '2025-09-15T10:30:00Z',
                    updated_at: '2025-10-01T14:22:00Z'
                },
                {
                    id: 2,
                    name: 'Empleados por Departamento',
                    description: 'Distribución de personal por área de trabajo',
                    matrix_type: 'hr',
                    rows: 6,
                    columns: 3,
                    data: [
                        ['Departamento', 'Empleados', 'Presupuesto Mensual'],
                        ['Tecnología', '12', '$48,000'],
                        ['Ventas', '8', '$32,000'],
                        ['Recursos Humanos', '4', '$18,000'],
                        ['Finanzas', '6', '$28,500'],
                        ['Administración', '3', '$15,000']
                    ],
                    created_at: '2025-09-20T09:15:00Z',
                    updated_at: '2025-09-28T16:45:00Z'
                },
                {
                    id: 3,
                    name: 'Ventas Mensuales 2025',
                    description: 'Registro de ventas por mes y producto',
                    matrix_type: 'sales',
                    rows: 4,
                    columns: 5,
                    data: [
                        ['Mes', 'Servicios IT', 'Hardware', 'Software', 'Total'],
                        ['Enero', '$15,230', '$8,450', '$3,200', '$26,880'],
                        ['Febrero', '$18,900', '$12,300', '$4,150', '$35,350'],
                        ['Marzo', '$22,100', '$9,800', '$5,670', '$37,570']
                    ],
                    created_at: '2025-08-30T11:20:00Z',
                    updated_at: '2025-10-02T08:30:00Z'
                },
                {
                    id: 4,
                    name: 'Proveedores y Contactos',
                    description: 'Lista de proveedores principales con información de contacto',
                    matrix_type: 'suppliers',
                    rows: 6,
                    columns: 4,
                    data: [
                        ['Proveedor', 'Contacto', 'Teléfono', 'Email'],
                        ['TechDist RD', 'María González', '809-555-0123', 'maria@techdist.do'],
                        ['CompuWorld', 'Carlos Martínez', '829-555-0456', 'carlos@compuworld.com'],
                        ['Digital Solutions', 'Ana López', '849-555-0789', 'ana@digitalsol.do'],
                        ['IT Hardware Plus', 'Roberto Silva', '809-555-0321', 'roberto@ithardware.do'],
                        ['Software Dominicano', 'Laura Pérez', '829-555-0654', 'laura@softdom.com']
                    ],
                    created_at: '2025-07-15T14:10:00Z',
                    updated_at: '2025-09-25T10:15:00Z'
                }
            ];

            // Simular delay de API
            setTimeout(() => {
                setMatrices(mockMatrices);
                setLoading(false);
            }, 800);

        } catch (error) {
            console.error('Error loading matrices:', error);
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

    const handleExportMatricesCSV = () => {
        if (!isAuthenticated) {
            alert('Debe estar autenticado para exportar');
            return;
        }

        try {
            let csvContent = '\uFEFF'; // BOM para UTF-8

            matrices.forEach((matrix, index) => {
                if (index > 0) csvContent += '\n\n';
                csvContent += `"=== ${matrix.name} ==="\n`;
                csvContent += `"Descripción: ${matrix.description}"\n`;
                csvContent += `"Tipo: ${matrix.matrix_type}"\n`;
                csvContent += `"Creada: ${new Date(matrix.created_at).toLocaleDateString('es-ES')}"\n`;
                csvContent += `"Actualizada: ${new Date(matrix.updated_at).toLocaleDateString('es-ES')}"\n\n`;

                if (matrix.data && matrix.data.length > 0) {
                    matrix.data.forEach(row => {
                        const csvRow = row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
                        csvContent += csvRow + '\n';
                    });
                }
            });

            // Crear y descargar archivo
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `matrices_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            alert(`¡${matrices.length} matrices exportadas exitosamente en formato CSV!`);
        } catch (error) {
            alert('Error al exportar las matrices');
            console.error('Export error:', error);
        }
    };

    const handleExportSingleMatrix = (matrix) => {
        try {
            let csvContent = '\uFEFF'; // BOM para UTF-8
            csvContent += `"${matrix.name}"\n`;
            csvContent += `"${matrix.description}"\n`;
            csvContent += `"Tipo: ${matrix.matrix_type}"\n`;
            csvContent += `"Creada: ${new Date(matrix.created_at).toLocaleDateString('es-ES')}"\n`;
            csvContent += `"Actualizada: ${new Date(matrix.updated_at).toLocaleDateString('es-ES')}"\n\n`;

            if (matrix.data && matrix.data.length > 0) {
                matrix.data.forEach(row => {
                    const csvRow = row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
                    csvContent += csvRow + '\n';
                });
            }

            // Crear y descargar archivo
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            const filename = matrix.name.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_').toLowerCase();
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            alert(`¡Matriz "${matrix.name}" exportada exitosamente!`);
        } catch (error) {
            alert('Error al exportar la matriz');
            console.error('Export error:', error);
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
                setTempMatrixData(newMatrix.data || {});
                setHasUnsavedChanges(false);
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

        const updatedData = { ...tempMatrixData };
        updatedData[`${row}-${col}`] = value;

        setTempMatrixData(updatedData);
        setHasUnsavedChanges(true);
    };

    const handleSaveMatrix = async () => {
        if (!currentMatrix || !hasUnsavedChanges) return;

        setSaving(true);
        try {
            const success = await updateMatrix(currentMatrix.id, { data: tempMatrixData });
            if (success) {
                setHasUnsavedChanges(false);
                // Actualizar la matriz actual con los nuevos datos
                setCurrentMatrix({
                    ...currentMatrix,
                    data: tempMatrixData
                });
            }
        } catch (error) {
            console.error('Error saving matrix:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDiscardChanges = () => {
        if (currentMatrix) {
            setTempMatrixData(currentMatrix.data || {});
            setHasUnsavedChanges(false);
        }
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
                                                        <button className="dropdown-item" onClick={handleExportMatricesCSV}>
                                                            <i className="fas fa-file-csv me-2 text-primary"></i>Exportar Todas (CSV)
                                                        </button>
                                                    </li>
                                                    <li><hr className="dropdown-divider" /></li>
                                                    <li>
                                                        <h6 className="dropdown-header text-muted">
                                                            <small>Exportar Individual:</small>
                                                        </h6>
                                                    </li>
                                                    {matrices.map((matrix) => (
                                                        <li key={matrix.id}>
                                                            <button
                                                                className="dropdown-item d-flex justify-content-between align-items-center"
                                                                onClick={() => handleExportSingleMatrix(matrix)}
                                                            >
                                                                <span>
                                                                    <i className="fas fa-table me-2 text-info"></i>
                                                                    {matrix.name}
                                                                </span>
                                                                <small className="text-muted">{matrix.matrix_type}</small>
                                                            </button>
                                                        </li>
                                                    ))}
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
                                                onClick={() => {
                                                    setCurrentMatrix(matrix);
                                                    setTempMatrixData(matrix.data || {});
                                                    setHasUnsavedChanges(false);
                                                }}
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
                                                    <div className="d-flex gap-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleExportSingleMatrix(matrix);
                                                            }}
                                                            className="btn btn-outline-primary btn-sm"
                                                            title="Exportar matriz"
                                                        >
                                                            <i className="fas fa-download"></i>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteMatrix(matrix.id);
                                                            }}
                                                            className="btn btn-outline-danger btn-sm"
                                                            title="Eliminar matriz"
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
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
                                                {hasUnsavedChanges && (
                                                    <span className="badge bg-warning text-dark ms-2">
                                                        <i className="fas fa-exclamation-triangle me-1"></i>
                                                        Cambios sin guardar
                                                    </span>
                                                )}
                                            </h5>
                                            <small className="opacity-75">
                                                {currentMatrix.description}
                                            </small>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            {hasUnsavedChanges && (
                                                <>
                                                    <button
                                                        className="btn btn-outline-light btn-sm"
                                                        onClick={handleDiscardChanges}
                                                        disabled={saving}
                                                        title="Descartar cambios"
                                                    >
                                                        <i className="fas fa-times me-1"></i>
                                                        Descartar
                                                    </button>
                                                    <button
                                                        className="btn btn-light btn-sm"
                                                        onClick={handleSaveMatrix}
                                                        disabled={saving}
                                                        title="Guardar cambios"
                                                    >
                                                        {saving ? (
                                                            <>
                                                                <i className="fas fa-spinner fa-spin me-1"></i>
                                                                Guardando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-save me-1"></i>
                                                                Guardar
                                                            </>
                                                        )}
                                                    </button>
                                                </>
                                            )}
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
                                                                    value={tempMatrixData[`${rowIndex}-${colIndex}`] || ''}
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
