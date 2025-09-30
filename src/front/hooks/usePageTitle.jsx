import { useLocation } from "react-router-dom";

export const usePageTitle = () => {
    const location = useLocation();

    const getPageInfo = () => {
        const path = location.pathname;

        const pageMap = {
            '/': { title: 'Dashboard', icon: 'fas fa-home', description: 'Panel principal' },
            '/kanban': { title: 'Kanban Board', icon: 'fas fa-columns', description: 'Tablero de tareas' },
            '/tickets': { title: 'Tickets', icon: 'fas fa-ticket-alt', description: 'Sistema de tickets' },
            '/calendar': { title: 'Calendario', icon: 'fas fa-calendar-alt', description: 'Gestión de eventos' },
            '/matrices': { title: 'Matrices', icon: 'fas fa-th', description: 'Análisis estratégico' },
            '/journal': { title: 'Bitácora', icon: 'fas fa-book', description: 'Registro de actividades' },
            '/demo': { title: 'Demo', icon: 'fas fa-flask', description: 'Demostración' }
        };

        return pageMap[path] || { title: 'Página', icon: 'fas fa-file', description: 'Contenido' };
    };

    return getPageInfo();
};