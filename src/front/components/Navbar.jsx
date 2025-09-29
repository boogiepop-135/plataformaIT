import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import AdminLogin from "./AdminLogin.jsx";

export const Navbar = () => {
	const { isAuthenticated, logout } = useAuth();
	const [showLogin, setShowLogin] = useState(false);

	const handleLogout = async () => {
		await logout();
	};

	return (
		<>
			<nav className="navbar navbar-expand-lg">
				<div className="container-fluid">
					<Link to="/" className="navbar-brand">
						<i className="fas fa-laptop-code me-2"></i>
						<span className="navbar-brand mb-0 h1">Plataforma IT</span>
					</Link>

					<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" style={{ border: 'none' }}>
						<i className="fas fa-bars" style={{ color: 'white', fontSize: '18px' }}></i>
					</button>

					<div className="collapse navbar-collapse" id="navbarNav">
						<ul className="navbar-nav me-auto">
							<li className="nav-item">
								<Link to="/" className="nav-link">
									<i className="fas fa-home me-2"></i>Dashboard
								</Link>
							</li>
							<li className="nav-item">
								<Link to="/kanban" className="nav-link">
									<i className="fas fa-columns me-2"></i>Kanban Board
								</Link>
							</li>
							<li className="nav-item">
								<Link to="/tickets" className="nav-link">
									<i className="fas fa-ticket-alt me-2"></i>Sistema de Tickets
								</Link>
							</li>
							<li className="nav-item">
								<Link to="/calendar" className="nav-link">
									<i className="fas fa-calendar-alt me-2"></i>Calendario
								</Link>
							</li>
							<li className="nav-item">
								<Link to="/matrices" className="nav-link">
									<i className="fas fa-th me-2"></i>Matrices
								</Link>
							</li>
							<li className="nav-item">
								<Link to="/demo" className="nav-link">
									<i className="fas fa-flask me-2"></i>Demo
								</Link>
							</li>
						</ul>

						{/* Authentication Section */}
						<ul className="navbar-nav">
							{isAuthenticated ? (
								<li className="nav-item dropdown">
									<a className="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
										<i className="fas fa-user-shield me-2 text-success"></i>
										<span className="badge bg-success me-2">Admin</span>
										Administrador
									</a>
									<ul className="dropdown-menu dropdown-menu-end">
										<li>
											<button className="dropdown-item" onClick={handleLogout}>
												<i className="fas fa-sign-out-alt me-2"></i>
												Cerrar Sesión
											</button>
										</li>
									</ul>
								</li>
							) : (
								<li className="nav-item">
									<button
										className="nav-link btn btn-link text-white border-0"
										onClick={() => setShowLogin(true)}
										style={{ backgroundColor: 'transparent' }}
									>
										<i className="fas fa-lock me-2"></i>
										Acceso Admin
									</button>
								</li>
							)}
						</ul>
					</div>
				</div>
			</nav>

			{/* Login Modal */}
			{showLogin && (
				<AdminLogin
					onClose={() => setShowLogin(false)}
					onLoginSuccess={() => setShowLogin(false)}
				/>
			)}
		</>
	);
};