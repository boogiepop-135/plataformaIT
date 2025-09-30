import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const BudgetModule = () => {
    const { user } = useAuth();
    const [selectedPeriod, setSelectedPeriod] = useState('agosto');
    const [budgetData, setBudgetData] = useState(null);

    // Datos de ventas por mes
    const ventasPorMes = {
        agosto: 3506579,
        septiembre: 3462804,
        octubre: 3505000,
        noviembre: 3250000,
        diciembre: 3095000,
        promedio: 3363877
    };

    // Áreas de presupuesto
    const areasPresupuesto = [
        {
            nombre: 'Costo de Ventas',
            categoria: 'Compras Centros',
            porcentaje: 35.0,
            icon: '🛒',
            color: '#f56565',
            descripcion: 'Materia prima, empaque y retail'
        },
        {
            nombre: 'Sueldos y Prestaciones',
            categoria: 'Recursos Humanos',
            porcentaje: 21.0,
            icon: '👥',
            color: '#4299e1',
            descripcion: 'Nómina, IMSS y provisiones'
        },
        {
            nombre: 'Impuestos',
            categoria: 'Fiscal',
            porcentaje: 10.0,
            icon: '🏛️',
            color: '#c19a6b',
            descripcion: 'ISR, IVA y otros impuestos'
        },
        {
            nombre: 'Renta',
            categoria: 'Operaciones',
            porcentaje: 5.5,
            icon: '🏢',
            color: '#ed8936',
            descripcion: 'Arrendamiento sucursales'
        },
        {
            nombre: 'Operaciones',
            categoria: 'Operaciones',
            porcentaje: 3.7,
            icon: '⚙️',
            color: '#48bb78',
            descripcion: 'OPEX y mantenimientos'
        },
        {
            nombre: 'Comisiones Bancarias',
            categoria: 'Finanzas',
            porcentaje: 1.2,
            icon: '💳',
            color: '#805ad5',
            descripcion: 'Uber Eats, Amex, Visa, Mastercard'
        },
        {
            nombre: 'Marketing',
            categoria: 'Marketing',
            porcentaje: 1.9,
            icon: '📢',
            color: '#d69e2e',
            descripcion: 'Publicidad y promociones'
        },
        {
            nombre: 'Servicios',
            categoria: 'Operaciones',
            porcentaje: 2.0,
            icon: '💡',
            color: '#ecc94b',
            descripcion: 'Luz, agua, gas, internet'
        },
        {
            nombre: 'Capital Humano',
            categoria: 'Recursos Humanos',
            porcentaje: 1.0,
            icon: '🎓',
            color: '#38b2ac',
            descripcion: 'Reclutamiento y desarrollo'
        },
        {
            nombre: 'Tecnología e IT',
            categoria: 'Tecnología',
            porcentaje: 1.0,
            icon: '💻',
            color: '#667eea',
            descripcion: 'Licencias y equipo de cómputo'
        },
        {
            nombre: 'Compras Administración',
            categoria: 'Administración',
            porcentaje: 0.8,
            icon: '📎',
            color: '#a0aec0',
            descripcion: 'Papelería y artículos oficina'
        },
        {
            nombre: 'Asesorías',
            categoria: 'Administración',
            porcentaje: 0.9,
            icon: '📊',
            color: '#718096',
            descripcion: 'Contable, legal y fiscal'
        },
        {
            nombre: 'Limpieza',
            categoria: 'Operaciones',
            porcentaje: 0.5,
            icon: '🧹',
            color: '#cbd5e0',
            descripcion: 'Servicios de limpieza'
        },
        {
            nombre: 'Otros Gastos',
            categoria: 'Administración',
            porcentaje: 1.7,
            icon: '📋',
            color: '#e2e8f0',
            descripcion: 'Contingencias y diversos'
        }
    ];

    const formatCurrency = (amount) => {
        return '$' + amount.toLocaleString('es-MX', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    };

    const getSummaryData = () => {
        const ventasBase = ventasPorMes[selectedPeriod];
        const costos = ventasBase * 0.35;
        const impuestos = ventasBase * 0.10;
        const gastosOperativos = ventasBase * 0.414;
        const utilidad = ventasBase - costos - impuestos - gastosOperativos;
        
        return {
            ventas: ventasBase,
            costos,
            impuestos,
            utilidad,
            margenUtilidad: (utilidad / ventasBase * 100).toFixed(1)
        };
    };

    const printReport = () => {
        window.print();
    };

    // Verificar permisos
    if (!user || (user.role !== 'super_admin' && user.role !== 'admin-rh-financiero')) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <div className="text-red-500 text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h2>
                    <p className="text-gray-600">
                        Solo usuarios con rol 'super_admin' o 'admin-rh-financiero' pueden acceder al módulo financiero.
                    </p>
                </div>
            </div>
        );
    }

    const summaryData = getSummaryData();

    return (
        <div className="min-h-screen" style={{
            background: 'linear-gradient(135deg, #c19a6b 0%, #8b7355 100%)',
            padding: '20px'
        }}>
            {/* Botón de imprimir */}
            <button 
                onClick={printReport}
                className="fixed bottom-8 right-8 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 hover:scale-105 z-50"
            >
                📄 Descargar PDF
            </button>

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white p-8 rounded-2xl shadow-xl mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">
                        PRESUPUESTO POR ÁREAS OPERATIVAS
                    </h1>
                    <p className="text-gray-600 text-lg">
                        San Cosme Cafetería Saludable | Agosto - Diciembre 2025
                    </p>
                </div>

                {/* Selector de período */}
                <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
                    <div className="flex justify-center gap-4 flex-wrap">
                        {Object.keys(ventasPorMes).map((periodo) => (
                            <button
                                key={periodo}
                                onClick={() => setSelectedPeriod(periodo)}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                                    selectedPeriod === periodo
                                        ? 'bg-yellow-600 text-white shadow-lg scale-105'
                                        : 'bg-white text-yellow-600 border-2 border-yellow-600 hover:bg-yellow-600 hover:text-white hover:scale-105'
                                }`}
                            >
                                {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tarjetas de resumen */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Ventas Totales</h3>
                        <div className="text-3xl font-bold text-gray-800 mb-1">
                            {formatCurrency(summaryData.ventas)}
                        </div>
                        <div className="text-sm text-gray-500">Base de cálculo</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-red-500">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Costo de Ventas</h3>
                        <div className="text-3xl font-bold text-gray-800 mb-1">
                            {formatCurrency(summaryData.costos)}
                        </div>
                        <div className="text-sm text-gray-500">35.0% sobre ventas</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-yellow-600">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Impuestos</h3>
                        <div className="text-3xl font-bold text-gray-800 mb-1">
                            {formatCurrency(summaryData.impuestos)}
                        </div>
                        <div className="text-sm text-gray-500">10.0% sobre ventas</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-500">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Utilidad Neta</h3>
                        <div className="text-3xl font-bold text-gray-800 mb-1">
                            {formatCurrency(summaryData.utilidad)}
                        </div>
                        <div className="text-sm text-gray-500">{summaryData.margenUtilidad}% margen</div>
                    </div>
                </div>

                {/* Grid de áreas de presupuesto */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {areasPresupuesto.map((area, index) => {
                        const monto = summaryData.ventas * (area.porcentaje / 100);
                        
                        return (
                            <div key={index} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <div 
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                        style={{ 
                                            backgroundColor: area.color + '20',
                                            color: area.color 
                                        }}
                                    >
                                        {area.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800 text-lg">{area.nombre}</h3>
                                        <div className="text-xs text-gray-500 uppercase font-semibold">
                                            {area.categoria}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-3xl font-bold text-gray-800 mb-2">
                                    {formatCurrency(monto)}
                                </div>
                                
                                <div className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold text-gray-700 mb-3">
                                    {area.porcentaje}% sobre ventas
                                </div>
                                
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                    <div 
                                        className="h-2 rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.min(area.porcentaje * 1.5, 100)}%`,
                                            backgroundColor: area.color
                                        }}
                                    ></div>
                                </div>
                                
                                <p className="text-sm text-gray-600">{area.descripcion}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Tabla comparativa */}
                <div className="bg-white p-8 rounded-2xl shadow-lg overflow-x-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        📊 Comparativo Presupuestal Mensual (Escenario Base)
                    </h2>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left p-4 font-semibold text-gray-700 border-b-2 border-gray-200">Área</th>
                                    <th className="text-left p-4 font-semibold text-gray-700 border-b-2 border-gray-200">% Ventas</th>
                                    <th className="text-left p-4 font-semibold text-gray-700 border-b-2 border-gray-200">Agosto</th>
                                    <th className="text-left p-4 font-semibold text-gray-700 border-b-2 border-gray-200">Septiembre</th>
                                    <th className="text-left p-4 font-semibold text-gray-700 border-b-2 border-gray-200">Octubre</th>
                                    <th className="text-left p-4 font-semibold text-gray-700 border-b-2 border-gray-200">Noviembre</th>
                                    <th className="text-left p-4 font-semibold text-gray-700 border-b-2 border-gray-200">Diciembre</th>
                                    <th className="text-left p-4 font-semibold text-gray-700 border-b-2 border-gray-200">Total Periodo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {areasPresupuesto.map((area, index) => {
                                    const agosto = ventasPorMes.agosto * (area.porcentaje / 100);
                                    const septiembre = ventasPorMes.septiembre * (area.porcentaje / 100);
                                    const octubre = ventasPorMes.octubre * (area.porcentaje / 100);
                                    const noviembre = ventasPorMes.noviembre * (area.porcentaje / 100);
                                    const diciembre = ventasPorMes.diciembre * (area.porcentaje / 100);
                                    const total = agosto + septiembre + octubre + noviembre + diciembre;
                                    
                                    return (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 border-b border-gray-200">
                                                <strong>{area.nombre}</strong>
                                            </td>
                                            <td className="p-4 border-b border-gray-200 bg-gray-50 font-semibold">
                                                {area.porcentaje}%
                                            </td>
                                            <td className="p-4 border-b border-gray-200">{formatCurrency(agosto)}</td>
                                            <td className="p-4 border-b border-gray-200">{formatCurrency(septiembre)}</td>
                                            <td className="p-4 border-b border-gray-200">{formatCurrency(octubre)}</td>
                                            <td className="p-4 border-b border-gray-200">{formatCurrency(noviembre)}</td>
                                            <td className="p-4 border-b border-gray-200">{formatCurrency(diciembre)}</td>
                                            <td className="p-4 border-b border-gray-200 bg-gray-100 font-bold">
                                                {formatCurrency(total)}
                                            </td>
                                        </tr>
                                    );
                                })}
                                
                                {/* Total row */}
                                <tr className="bg-green-50 font-bold">
                                    <td className="p-4 border-b border-gray-200">
                                        <strong>TOTAL PRESUPUESTO</strong>
                                    </td>
                                    <td className="p-4 border-b border-gray-200 bg-green-100">86.4%</td>
                                    <td className="p-4 border-b border-gray-200">
                                        {formatCurrency(ventasPorMes.agosto * 0.864)}
                                    </td>
                                    <td className="p-4 border-b border-gray-200">
                                        {formatCurrency(ventasPorMes.septiembre * 0.864)}
                                    </td>
                                    <td className="p-4 border-b border-gray-200">
                                        {formatCurrency(ventasPorMes.octubre * 0.864)}
                                    </td>
                                    <td className="p-4 border-b border-gray-200">
                                        {formatCurrency(ventasPorMes.noviembre * 0.864)}
                                    </td>
                                    <td className="p-4 border-b border-gray-200">
                                        {formatCurrency(ventasPorMes.diciembre * 0.864)}
                                    </td>
                                    <td className="p-4 border-b border-gray-200 bg-green-200">
                                        {formatCurrency(
                                            ventasPorMes.agosto * 0.864 +
                                            ventasPorMes.septiembre * 0.864 +
                                            ventasPorMes.octubre * 0.864 +
                                            ventasPorMes.noviembre * 0.864 +
                                            ventasPorMes.diciembre * 0.864
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Notas importantes */}
                <div className="bg-white p-8 rounded-2xl shadow-lg mt-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        📋 Notas Importantes del Presupuesto
                    </h2>
                    <div className="space-y-4 text-gray-700 leading-relaxed">
                        <div><strong>Costo de Ventas (35%):</strong> Incluye materia prima, material de empaque y productos para reventa. Reducción del 2.5% respecto a objetivo inicial para mejorar márgenes.</div>
                        <div><strong>Sueldos y Prestaciones (21%):</strong> Incluye nómina, IMSS, provisiones de aguinaldo, PTU y otras prestaciones. Incremento para atraer y retener talento de calidad.</div>
                        <div><strong>Impuestos (10%):</strong> Provisión para ISR, IVA por pagar y otros impuestos federales y locales. Considera utilidad gravable estimada.</div>
                        <div><strong>Comisiones Bancarias (1.2%):</strong> Incluye comisiones de Uber Eats (ventas digitales), comisiones bancarias por TPV y procesamiento de tarjetas Amex, Visa y Mastercard.</div>
                        <div><strong>Renta (5.5%):</strong> Arrendamiento de las tres sucursales. Porcentaje saludable para ubicaciones comerciales en Querétaro.</div>
                        <div><strong>Marketing (1.9%):</strong> Inversión en publicidad digital, contenido y promociones. Optimización del presupuesto con enfoque en ROI y eficiencia.</div>
                        <div><strong>Operaciones (3.7%):</strong> OPEX, mantenimientos preventivos y correctivos, gestión operativa diaria y mejora continua de procesos.</div>
                        <div><strong>Servicios (2%):</strong> Luz, agua, gas, internet, telefonía y otros servicios públicos. Incremento por aumento de tarifas.</div>
                        <div><strong>Capital Humano (1%):</strong> Reclutamiento, capacitación, desarrollo organizacional y plataformas de gestión de talento.</div>
                        <div><strong>Tecnología (1%):</strong> Licencias de software (POS, contabilidad, gestión), equipo de cómputo y herramientas digitales.</div>
                        <div><strong>Compras Administración (0.8%):</strong> Papelería, artículos de oficina, limpieza administrativa y consumibles.</div>
                        <div><strong>Asesorías (0.9%):</strong> Consultoría contable, legal, fiscal, auditorías y otras asesorías especializadas para cumplimiento normativo.</div>
                        <div><strong>Otros Gastos (1.7%):</strong> Contingencias, donaciones, uniformes, licencias, seguros y gastos diversos no categorizados.</div>
                        <div><strong>Margen Objetivo:</strong> 13-15% utilidad neta es saludable considerando estructura de costos y obligaciones fiscales.</div>
                        <div><strong>EBITDA Esperado:</strong> Aproximadamente 18-20% sobre ventas antes de depreciaciones y amortizaciones.</div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media print {
                    body { background: white !important; padding: 0 !important; }
                    button { display: none !important; }
                    .fixed { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default BudgetModule;