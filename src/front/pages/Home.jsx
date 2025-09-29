import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import BACKEND_URL from "../config/backend.js";

export const Home = () => {

	const { store, dispatch } = useGlobalReducer()
	const [stats, setStats] = useState({
		tasks: { total: 0, completed: 0, inProgress: 0 },
		tickets: { total: 0, open: 0, resolved: 0 },
		events: { today: 0, thisWeek: 0 }
	})

	const loadStats = async () => {
		try {
			// Load tasks
			const tasksResponse = await fetch(BACKEND_URL + "/api/tasks")
			const tasksData = await tasksResponse.json()

			// Load tickets
			const ticketsResponse = await fetch(BACKEND_URL + "/api/tickets")
			const ticketsData = await ticketsResponse.json()

			// Load events
			const eventsResponse = await fetch(BACKEND_URL + "/api/calendar-events")
			const eventsData = await eventsResponse.json()

			if (tasksResponse.ok && ticketsResponse.ok && eventsResponse.ok) {
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
					}
				})
			}

		} catch (error) {
			console.error("Error loading stats:", error)
		}
	}

	const loadMessage = async () => {
		try {
			const response = await fetch(BACKEND_URL + "/api/hello")
			const data = await response.json()

			if (response.ok) dispatch({ type: "set_hello", payload: data.message })

			return data

		} catch (error) {
			if (error.message) throw new Error(
				`Could not fetch the message from the backend.
				Please check if the backend is running and the backend port is public.`
			);
		}
	}

	useEffect(() => {
		loadMessage()
		loadStats()
	}, [])

	return (
		<div className="container mt-4">
			<div className="row">
				<div className="col-12">
					<h1 className="display-4 mb-4">IT Management Dashboard</h1>
					<p className="lead">Gestiona tus tareas, tickets y calendario de forma profesional</p>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="row mb-4">
				<div className="col-md-3">
					<div className="card bg-primary text-white">
						<div className="card-body">
							<div className="d-flex justify-content-between">
								<div>
									<h4>{stats.tasks.total}</h4>
									<p className="mb-0">Total Tareas</p>
								</div>
								<div className="align-self-center">
									<i className="fas fa-tasks fa-2x"></i>
								</div>
							</div>
							<small>{stats.tasks.completed} completadas, {stats.tasks.inProgress} en progreso</small>
						</div>
					</div>
				</div>
				<div className="col-md-3">
					<div className="card bg-warning text-white">
						<div className="card-body">
							<div className="d-flex justify-content-between">
								<div>
									<h4>{stats.tickets.total}</h4>
									<p className="mb-0">Total Tickets</p>
								</div>
								<div className="align-self-center">
									<i className="fas fa-ticket-alt fa-2x"></i>
								</div>
							</div>
							<small>{stats.tickets.open} abiertos, {stats.tickets.resolved} resueltos</small>
						</div>
					</div>
				</div>
				<div className="col-md-3">
					<div className="card bg-success text-white">
						<div className="card-body">
							<div className="d-flex justify-content-between">
								<div>
									<h4>{stats.events.today}</h4>
									<p className="mb-0">Eventos Hoy</p>
								</div>
								<div className="align-self-center">
									<i className="fas fa-calendar-day fa-2x"></i>
								</div>
							</div>
							<small>{stats.events.thisWeek} esta semana</small>
						</div>
					</div>
				</div>
				<div className="col-md-3">
					<div className="card bg-info text-white">
						<div className="card-body">
							<div className="d-flex justify-content-between">
								<div>
									<h4>IT</h4>
									<p className="mb-0">Departamento</p>
								</div>
								<div className="align-self-center">
									<i className="fas fa-user-cog fa-2x"></i>
								</div>
							</div>
							<small>Gestión completa</small>
						</div>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="row mb-4">
				<div className="col-12">
					<h3>Acciones Rápidas</h3>
				</div>
				<div className="col-md-4 mb-3">
					<Link to="/kanban" className="text-decoration-none">
						<div className="card h-100 border-primary">
							<div className="card-body text-center">
								<i className="fas fa-tasks fa-3x text-primary mb-3"></i>
								<h5 className="card-title">Tablero Kanban</h5>
								<p className="card-text">Gestiona tus tareas con un tablero visual intuitivo</p>
							</div>
						</div>
					</Link>
				</div>
				<div className="col-md-4 mb-3">
					<Link to="/tickets" className="text-decoration-none">
						<div className="card h-100 border-warning">
							<div className="card-body text-center">
								<i className="fas fa-ticket-alt fa-3x text-warning mb-3"></i>
								<h5 className="card-title">Sistema de Tickets</h5>
								<p className="card-text">Administra y resuelve tickets de soporte técnico</p>
							</div>
						</div>
					</Link>
				</div>
				<div className="col-md-4 mb-3">
					<Link to="/calendar" className="text-decoration-none">
						<div className="card h-100 border-success">
							<div className="card-body text-center">
								<i className="fas fa-calendar-alt fa-3x text-success mb-3"></i>
								<h5 className="card-title">Calendario</h5>
								<p className="card-text">Programa visitas, mantenimientos y reuniones</p>
							</div>
						</div>
					</Link>
				</div>
			</div>

			{/* Additional Tools */}
			<div className="row mb-4">
				<div className="col-12">
					<h3>Herramientas de Análisis</h3>
				</div>
				<div className="col-md-6 mb-3">
					<Link to="/matrices" className="text-decoration-none">
						<div className="card h-100 border-info">
							<div className="card-body text-center">
								<i className="fas fa-th fa-3x text-info mb-3"></i>
								<h5 className="card-title">Matrices de Análisis</h5>
								<p className="card-text">Crea matrices SWOT, de riesgos, decisión y más para análisis estratégico</p>
							</div>
						</div>
					</Link>
				</div>
				<div className="col-md-6 mb-3">
					<Link to="/demo" className="text-decoration-none">
						<div className="card h-100 border-secondary">
							<div className="card-body text-center">
								<i className="fas fa-flask fa-3x text-secondary mb-3"></i>
								<h5 className="card-title">Demo</h5>
								<p className="card-text">Explora funcionalidades de demostración del sistema</p>
							</div>
						</div>
					</Link>
				</div>
			</div>

			{/* Backend Status */}
			<div className="row">
				<div className="col-12">
					<div className="alert alert-info">
						{store.message ? (
							<span><i className="fas fa-check-circle me-2"></i>Backend conectado: {store.message}</span>
						) : (
							<span className="text-danger">
								<i className="fas fa-exclamation-triangle me-2"></i>
								Conectando con el backend...
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}; 