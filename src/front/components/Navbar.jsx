import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import AdminLogin from "./AdminLogin.jsx";
import UserManagement from "./UserManagement.jsx";

export const Navbar = () => {
	const { isAuthenticated, logout } = useAuth();
	const [showLogin, setShowLogin] = useState(false);
	const [showUserManagement, setShowUserManagement] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const location = useLocation();

	const handleLogout = async () => {
		await logout();
	};

	const navItems = [
		{ path: "/", icon: "fas fa-home", label: "Dashboard" },
		{ path: "/kanban", icon: "fas fa-columns", label: "Kanban Board" },
		{ path: "/tickets", icon: "fas fa-ticket-alt", label: "Tickets" },
		{ path: "/calendar", icon: "fas fa-calendar-alt", label: "Calendario" },
		{ path: "/matrices", icon: "fas fa-th", label: "Matrices" },
		{ path: "/journal", icon: "fas fa-book", label: "Bitácora" },
		{ path: "/demo", icon: "fas fa-flask", label: "Demo" }
	];

	const isActivePath = (path) => {
		return location.pathname === path;
	};

	return (
		<>
			{/* Modern Professional Navbar */}
			<nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-2xl border-b border-blue-800/30 sticky top-0 z-50 backdrop-blur-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						{/* Logo */}
						<div className="flex items-center">
							<Link to="/" className="flex items-center space-x-3 group">
								<div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-105">
									<i className="fas fa-laptop-code text-white text-xl"></i>
								</div>
								<div className="hidden sm:block">
									<h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
										Plataforma IT
									</h1>
									<p className="text-xs text-blue-300/80 font-medium tracking-wide">
										Professional Management Suite
									</p>
								</div>
							</Link>
						</div>

						{/* Desktop Navigation */}
						<div className="hidden md:block">
							<div className="ml-10 flex items-baseline space-x-1">
								{navItems.map((item) => (
									<Link
										key={item.path}
										to={item.path}
										className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 group ${isActivePath(item.path)
											? 'bg-blue-600/90 text-white shadow-lg shadow-blue-600/30'
											: 'text-blue-100 hover:bg-white/10 hover:text-white'
											}`}
									>
										<i className={`${item.icon} text-sm`}></i>
										<span>{item.label}</span>
									</Link>
								))}
							</div>
						</div>

						{/* Right side - Auth Section */}
						<div className="hidden md:block">
							<div className="ml-4 flex items-center md:ml-6 space-x-3">
								{isAuthenticated ? (
									<div className="relative group">
										<button
											className="flex items-center space-x-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-4 py-2 rounded-xl text-white font-medium shadow-lg hover:shadow-green-500/25 transition-all duration-200 transform hover:scale-105"
											onClick={() => document.getElementById('adminDropdown').classList.toggle('hidden')}
										>
											<div className="flex items-center space-x-2">
												<div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
													<i className="fas fa-user-shield text-sm"></i>
												</div>
												<div className="text-left">
													<div className="text-sm font-semibold">Administrador</div>
													<div className="text-xs opacity-90">Acceso Total</div>
												</div>
											</div>
											<i className="fas fa-chevron-down text-xs transition-transform group-hover:rotate-180"></i>
										</button>

										<div id="adminDropdown" className="hidden absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
											<div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100">
												<p className="text-sm font-semibold text-gray-900">Panel Administrativo</p>
												<p className="text-xs text-gray-600">Sesión activa</p>
											</div>
											<div className="py-2">
												<button
													onClick={() => {
														setShowUserManagement(true);
														document.getElementById('adminDropdown').classList.add('hidden');
													}}
													className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 flex items-center space-x-2"
												>
													<i className="fas fa-users"></i>
													<span>Gestión de Usuarios</span>
												</button>
												<Link
													to="/settings"
													onClick={() => {
														document.getElementById('adminDropdown').classList.add('hidden');
													}}
													className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-600 transition-colors duration-150 flex items-center space-x-2"
												>
													<i className="fas fa-cogs"></i>
													<span>Configuración</span>
												</Link>
												<Link
													to="/profile"
													className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-600 transition-colors duration-150 flex items-center space-x-2"
													onClick={() => document.getElementById('adminDropdown').classList.add('hidden')}
												>
													<i className="fas fa-user"></i>
													<span>Mi Perfil</span>
												</Link>
												<Link
													to="/users"
													className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-600 transition-colors duration-150 flex items-center space-x-2"
													onClick={() => document.getElementById('adminDropdown').classList.add('hidden')}
												>
													<i className="fas fa-users-cog"></i>
													<span>Gestión de Usuarios</span>
												</Link>
											</div>
											<div className="border-t border-gray-100">
												<button
													onClick={handleLogout}
													className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 flex items-center space-x-2"
												>
													<i className="fas fa-sign-out-alt"></i>
													<span>Cerrar Sesión</span>
												</button>
											</div>
										</div>
									</div>
								) : (
									<button
										onClick={() => setShowLogin(true)}
										className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
									>
										<i className="fas fa-shield-alt"></i>
										<span>Acceso Administrativo</span>
										<i className="fas fa-arrow-right text-xs"></i>
									</button>
								)}
							</div>
						</div>

						{/* Mobile menu button */}
						<div className="md:hidden">
							<button
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								className="bg-white/10 inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-all duration-200"
							>
								<i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
							</button>
						</div>
					</div>
				</div>

				{/* Mobile Navigation Menu */}
				{mobileMenuOpen && (
					<div className="md:hidden bg-slate-800/95 backdrop-blur-sm border-t border-blue-800/30">
						<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
							{navItems.map((item) => (
								<Link
									key={item.path}
									to={item.path}
									onClick={() => setMobileMenuOpen(false)}
									className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${isActivePath(item.path)
										? 'bg-blue-600 text-white'
										: 'text-blue-100 hover:bg-white/10 hover:text-white'
										}`}
								>
									<i className={`${item.icon} mr-3`}></i>
									{item.label}
								</Link>
							))}
						</div>

						{/* Mobile Auth Section */}
						<div className="pt-4 pb-3 border-t border-blue-800/30">
							<div className="px-2">
								{isAuthenticated ? (
									<div className="space-y-2">
										<div className="bg-green-600/20 border border-green-500/30 rounded-lg p-3">
											<div className="flex items-center space-x-3">
												<div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
													<i className="fas fa-user-shield text-white"></i>
												</div>
												<div>
													<div className="text-white font-semibold">Administrador</div>
													<div className="text-green-300 text-sm">Acceso Total</div>
												</div>
											</div>
										</div>
										<button
											onClick={handleLogout}
											className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
										>
											<i className="fas fa-sign-out-alt"></i>
											<span>Cerrar Sesión</span>
										</button>
									</div>
								) : (
									<button
										onClick={() => {
											setShowLogin(true);
											setMobileMenuOpen(false);
										}}
										className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
									>
										<i className="fas fa-shield-alt"></i>
										<span>Acceso Administrativo</span>
									</button>
								)}
							</div>
						</div>
					</div>
				)}
			</nav>

			{/* Login Modal */}
			{showLogin && (
				<AdminLogin
					onClose={() => setShowLogin(false)}
					onLoginSuccess={() => setShowLogin(false)}
				/>
			)}

			{/* User Management Modal */}
			{showUserManagement && (
				<UserManagement
					onClose={() => setShowUserManagement(false)}
				/>
			)}
		</>
	);
};