import { Link } from "react-router-dom";

export const Navbar = () => {

	return (
		<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
			<div className="container">
				<Link to="/" className="navbar-brand">
					<span className="navbar-brand mb-0 h1">IT Management Platform</span>
				</Link>

				<button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
					<span className="navbar-toggler-icon"></span>
				</button>

				<div className="collapse navbar-collapse" id="navbarNav">
					<ul className="navbar-nav me-auto">
						<li className="nav-item">
							<Link to="/" className="nav-link">
								<i className="fas fa-home me-1"></i>Dashboard
							</Link>
						</li>
						<li className="nav-item">
							<Link to="/kanban" className="nav-link">
								<i className="fas fa-tasks me-1"></i>Kanban Board
							</Link>
						</li>
						<li className="nav-item">
							<Link to="/tickets" className="nav-link">
								<i className="fas fa-ticket-alt me-1"></i>Tickets
							</Link>
						</li>
						<li className="nav-item">
							<Link to="/calendar" className="nav-link">
								<i className="fas fa-calendar-alt me-1"></i>Calendar
							</Link>
						</li>
					</ul>
					<div className="navbar-nav">
						<Link to="/demo" className="nav-link">
							<button className="btn btn-outline-light btn-sm">Demo</button>
						</Link>
					</div>
				</div>
			</div>
		</nav>
	);
};