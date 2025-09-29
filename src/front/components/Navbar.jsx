import { Link } from "react-router-dom";

export const Navbar = () => {

	return (
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
					<ul className="navbar-nav ms-auto">
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
				</div>
			</div>
		</nav>
	);
};