import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import BACKEND_URL from "../config/backend.js";

export const Home = () => {
	const { store, dispatch } = useGlobalReducer()
	const { isAuthenticated } = useAuth()
	const [stats, setStats] = useState({
		tasks: { total: 0, completed: 0, inProgress: 0 },
		tickets: { total: 0, open: 0, resolved: 0 },
		events: { today: 0, thisWeek: 0 },
		matrices: { total: 0 }
	})
	const [storageInfo, setStorageInfo] = useState({
		usage_percent: 85,
		status: 'warning',
		total_gb: 100,
		used_gb: 85,
		free_gb: 15
	})
	const [loading, setLoading] = useState(true)

	const loadStats = async () => {
		try {
			setLoading(true)
			// Load tasks
			const tasksResponse = await fetch(BACKEND_URL + "/api/tasks")
			const tasksData = await tasksResponse.json()

			// Load tickets
			const ticketsResponse = await fetch(BACKEND_URL + "/api/tickets")
			const ticketsData = await ticketsResponse.json()

			// Load events
			const eventsResponse = await fetch(BACKEND_URL + "/api/calendar-events")
			const eventsData = await eventsResponse.json()

			// Load matrices
			const matricesResponse = await fetch(BACKEND_URL + "/api/matrices")
			const matricesData = await matricesResponse.json()

			// Load storage info
			const storageResponse = await fetch(BACKEND_URL + "/api/system/storage")
			const storageData = await storageResponse.json()

			if (tasksResponse.ok && ticketsResponse.ok && eventsResponse.ok && matricesResponse.ok) {
				setStats({
					tasks: {
						total: tasksData.length,
						completed: tasksData.filter(task => task.status === 'done').length,
						inProgress: tasksData.filter(task => task.status === 'in_progress').length
					},
					tickets: {
						total: ticketsData.length,
						open: ticketsData.filter(ticket => ticket.status === 'open').length,
						resolved: ticketsData.filter(ticket => ticket.status === 'resolved').length
					},
					events: {
						today: eventsData.filter(event => {
							const today = new Date().toDateString()
							const eventDate = new Date(event.start_date).toDateString()
							return today === eventDate
						}).length,
						thisWeek: eventsData.filter(event => {
							const now = new Date()
							const eventDate = new Date(event.start_date)
							const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
							return eventDate >= now && eventDate <= weekFromNow
						}).length
					},
					matrices: {
						total: matricesData.length
					}
				})

				// Update storage info if available
				if (storageResponse.ok) {
					setStorageInfo(storageData)
				}
			}

		} catch (error) {
			console.error("Error loading stats:", error)
		} finally {
			setLoading(false)
		}
	}

	const loadMessage = async () => {
		try {
			const response = await fetch(BACKEND_URL + "/api/hello")
			const data = await response.json()

			if (response.ok) dispatch({ type: "set_hello", payload: data.message })

			return data

		} catch (error) {
			console.error("Backend connection error:", error)
		}
	}

	useEffect(() => {
		loadMessage()
		loadStats()
	}, [])

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
						<i className="fas fa-laptop-code text-white text-2xl"></i>
					</div>
					<h3 className="text-gray-800 font-semibold mb-2">Cargando Dashboard</h3>
					<p className="text-gray-600">Obteniendo datos del sistema...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
			{/* Hero Section */}
			<div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
					<div className="text-center">
						<div className="flex items-center justify-center space-x-4 mb-6">
							<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
								<i className="fas fa-laptop-code text-2xl"></i>
							</div>
							<div className="text-left">
								<h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
									Plataforma IT
								</h1>
								<p className="text-blue-300 text-lg">Professional Management Suite</p>
							</div>
						</div>
						<p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
							Sistema integral de gestión para equipos de IT. Administra tareas, tickets, calendario y matrices
							de análisis desde una sola plataforma profesional.
						</p>
						{!isAuthenticated && (
							<div className="mt-8 p-4 bg-blue-800/30 border border-blue-600/50 rounded-xl max-w-md mx-auto">
								<div className="flex items-center space-x-3">
									<i className="fas fa-info-circle text-blue-300 text-lg"></i>
									<p className="text-blue-200 text-sm">
										Para acceder a funciones administrativas, usa las credenciales de prueba en el botón "Acceso Administrativo"
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Stats Dashboard */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
					{/* Tasks Stats */}
					<div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
						<div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
							<div className="flex items-center justify-between text-white">
								<div>
									<h3 className="text-2xl font-bold">{stats.tasks.total}</h3>
									<p className="text-blue-100">Tareas Totales</p>
								</div>
								<div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
									<i className="fas fa-tasks text-xl"></i>
								</div>
							</div>
						</div>
						<div className="p-4">
							<div className="flex justify-between text-sm">
								<span className="text-green-600 font-medium">✓ {stats.tasks.completed} completadas</span>
								<span className="text-orange-600 font-medium">⏳ {stats.tasks.inProgress} en progreso</span>
							</div>
						</div>
					</div>

					{/* Tickets Stats */}
					<div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
						<div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
							<div className="flex items-center justify-between text-white">
								<div>
									<h3 className="text-2xl font-bold">{stats.tickets.total}</h3>
									<p className="text-orange-100">Tickets Totales</p>
								</div>
								<div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
									<i className="fas fa-ticket-alt text-xl"></i>
								</div>
							</div>
						</div>
						<div className="p-4">
							<div className="flex justify-between text-sm">
								<span className="text-red-600 font-medium">🔴 {stats.tickets.open} abiertos</span>
								<span className="text-green-600 font-medium">✅ {stats.tickets.resolved} resueltos</span>
							</div>
						</div>
					</div>

					{/* Events Stats */}
					<div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
						<div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
							<div className="flex items-center justify-between text-white">
								<div>
									<h3 className="text-2xl font-bold">{stats.events.today}</h3>
									<p className="text-green-100">Eventos Hoy</p>
								</div>
								<div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
									<i className="fas fa-calendar-day text-xl"></i>
								</div>
							</div>
						</div>
						<div className="p-4">
							<div className="text-sm text-gray-600">
								<span className="font-medium">📅 {stats.events.thisWeek} eventos esta semana</span>
							</div>
						</div>
					</div>

					{/* Matrices Stats */}
					<div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
						<div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4">
							<div className="flex items-center justify-between text-white">
								<div>
									<h3 className="text-2xl font-bold">{stats.matrices.total}</h3>
									<p className="text-purple-100">Matrices</p>
								</div>
								<div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
									<i className="fas fa-th text-xl"></i>
								</div>
							</div>
						</div>
						<div className="p-4">
							<div className="text-sm text-gray-600">
								<span className="font-medium">📊 Análisis estratégico</span>
							</div>
						</div>
					</div>
				</div>

				{/* Quick Actions */}
				<div className="mb-12">
					<h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Herramientas Disponibles</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{[
							{
								title: "Kanban Board",
								description: "Gestiona tus tareas de forma visual con tableros interactivos",
								icon: "fas fa-columns",
								color: "from-blue-500 to-blue-600",
								link: "/kanban",
								features: ["Drag & Drop", "Estados personalizados", "Prioridades"]
							},
							{
								title: "Sistema de Tickets",
								description: "Reporta y gestiona incidencias de manera eficiente",
								icon: "fas fa-ticket-alt",
								color: "from-orange-500 to-orange-600",
								link: "/tickets",
								features: ["Creación pública", "Gestión admin", "Estados automáticos"]
							},
							{
								title: "Calendario Inteligente",
								description: "Programa eventos y mantenimientos con recordatorios",
								icon: "fas fa-calendar-alt",
								color: "from-green-500 to-green-600",
								link: "/calendar",
								features: ["Eventos recurrentes", "Múltiples tipos", "Vista mensual"]
							},
							{
								title: "Matrices de Análisis",
								description: "Herramientas profesionales para toma de decisiones",
								icon: "fas fa-th",
								color: "from-purple-500 to-purple-600",
								link: "/matrices",
								features: ["SWOT", "Eisenhower", "BCG", "Personalizable"]
							},
							{
								title: "Panel Administrativo",
								description: "Configuración y gestión avanzada del sistema",
								icon: "fas fa-cogs",
								color: "from-gray-600 to-gray-700",
								link: "/demo",
								features: ["Configuración", "Estadísticas", "Mantenimiento"]
							},
							{
								title: "Reportes y Análisis",
								description: "Visualiza métricas y genera informes detallados",
								icon: "fas fa-chart-bar",
								color: "from-indigo-500 to-indigo-600",
								link: "/demo",
								features: ["Dashboards", "Exportación", "Métricas en tiempo real"]
							}
						].map((tool, index) => (
							<Link key={index} to={tool.link} className="group block">
								<div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-2 border border-gray-100 overflow-hidden">
									<div className={`bg-gradient-to-r ${tool.color} p-6 text-white`}>
										<div className="flex items-center justify-between mb-4">
											<div className={`w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
												<i className={`${tool.icon} text-xl`}></i>
											</div>
											<i className="fas fa-arrow-right opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300"></i>
										</div>
										<h3 className="text-xl font-bold mb-2">{tool.title}</h3>
									</div>
									<div className="p-6">
										<p className="text-gray-600 mb-4 leading-relaxed">{tool.description}</p>
										<div className="space-y-2">
											{tool.features.map((feature, idx) => (
												<div key={idx} className="flex items-center text-sm text-gray-500">
													<div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
													{feature}
												</div>
											))}
										</div>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>

				{/* System Status */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* System Health */}
					<div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
						<div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
							<h3 className="text-xl font-bold flex items-center">
								<i className="fas fa-heartbeat mr-3"></i>
								Estado del Sistema
							</h3>
						</div>
						<div className="p-6 space-y-4">
							{[
								{ service: "Base de Datos", status: "Operativo", color: "green" },
								{ service: "API Backend", status: "Operativo", color: "green" },
								{ service: "Autenticación", status: "Operativo", color: "green" },
								{ 
									service: "Almacenamiento", 
									status: `${storageInfo.usage_percent}% Usado (${storageInfo.used_gb}GB/${storageInfo.total_gb}GB)`, 
									color: storageInfo.status === 'warning' ? "yellow" : "green" 
								}
							].map((item, idx) => (
								<div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
									<span className="font-medium text-gray-700">{item.service}</span>
									<span className={`px-3 py-1 rounded-full text-sm font-semibold ${item.color === 'green' ? 'bg-green-100 text-green-800' :
											item.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
												'bg-red-100 text-red-800'
										}`}>
										{item.status}
									</span>
								</div>
							))}
						</div>
					</div>

					{/* Backend Connection */}
					<div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
						<div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
							<h3 className="text-xl font-bold flex items-center">
								<i className="fas fa-server mr-3"></i>
								Conexión Backend
							</h3>
						</div>
						<div className="p-6">
							<div className="text-center">
								{store.message ? (
									<div className="space-y-4">
										<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
											<i className="fas fa-check-circle text-green-600 text-2xl"></i>
										</div>
										<div>
											<h4 className="font-semibold text-green-800 mb-2">Conexión Exitosa</h4>
											<p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-xl">
												{store.message}
											</p>
										</div>
									</div>
								) : (
									<div className="space-y-4">
										<div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
											<i className="fas fa-spinner fa-spin text-yellow-600 text-2xl"></i>
										</div>
										<div>
											<h4 className="font-semibold text-yellow-800 mb-2">Conectando...</h4>
											<p className="text-gray-600 text-sm">
												Estableciendo conexión con el servidor backend
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}; 