// Authentication system with 10-minute token expiration
class AuthManager {
    constructor() {
        this.token = null;
        this.expirationTime = null;
        this.PASSWORD = "admin2025"; // Change this to your desired password
    }

    // Check if user is authenticated
    isAuthenticated() {
        if (!this.token || !this.expirationTime) {
            return false;
        }
        
        const now = new Date().getTime();
        if (now > this.expirationTime) {
            this.clearToken();
            return false;
        }
        
        return true;
    }

    // Request password from user
    async requestPassword(action = "realizar esta acción") {
        return new Promise((resolve) => {
            const modal = this.createPasswordModal(action, resolve);
            document.body.appendChild(modal);
        });
    }

    // Create password modal
    createPasswordModal(action, callback) {
        const modal = document.createElement('div');
        modal.className = 'modal show d-block';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.style.zIndex = '9999';
        
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-lock me-2"></i>
                            Autenticación Requerida
                        </h5>
                    </div>
                    <div class="modal-body">
                        <p class="mb-3">Para ${action}, ingresa la contraseña de administrador:</p>
                        <div class="mb-3">
                            <label class="form-label">Contraseña:</label>
                            <input type="password" class="form-control" id="authPassword" placeholder="Ingresa la contraseña">
                            <div class="invalid-feedback" id="authError" style="display: none;">
                                Contraseña incorrecta. Inténtalo de nuevo.
                            </div>
                        </div>
                        <div class="text-muted small">
                            <i class="fas fa-info-circle me-1"></i>
                            El token será válido por 10 minutos.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="authCancel">
                            <i class="fas fa-times me-1"></i>Cancelar
                        </button>
                        <button type="button" class="btn btn-primary" id="authSubmit">
                            <i class="fas fa-check me-1"></i>Autenticar
                        </button>
                    </div>
                </div>
            </div>
        `;

        const passwordInput = modal.querySelector('#authPassword');
        const submitBtn = modal.querySelector('#authSubmit');
        const cancelBtn = modal.querySelector('#authCancel');
        const errorDiv = modal.querySelector('#authError');

        const handleSubmit = () => {
            const password = passwordInput.value;
            if (password === this.PASSWORD) {
                this.setToken();
                modal.remove();
                callback(true);
            } else {
                errorDiv.style.display = 'block';
                passwordInput.classList.add('is-invalid');
                passwordInput.value = '';
                passwordInput.focus();
            }
        };

        const handleCancel = () => {
            modal.remove();
            callback(false);
        };

        submitBtn.addEventListener('click', handleSubmit);
        cancelBtn.addEventListener('click', handleCancel);
        
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSubmit();
            }
        });

        passwordInput.addEventListener('input', () => {
            errorDiv.style.display = 'none';
            passwordInput.classList.remove('is-invalid');
        });

        // Focus on password input when modal opens
        setTimeout(() => passwordInput.focus(), 100);

        return modal;
    }

    // Set authentication token (valid for 10 minutes)
    setToken() {
        this.token = this.generateToken();
        this.expirationTime = new Date().getTime() + (10 * 60 * 1000); // 10 minutes
        
        // Show success notification
        this.showNotification('Autenticado correctamente. Token válido por 10 minutos.', 'success');
        
        // Set up expiration warning (8 minutes)
        setTimeout(() => {
            if (this.isAuthenticated()) {
                this.showNotification('Tu sesión expirará en 2 minutos.', 'warning');
            }
        }, 8 * 60 * 1000);
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
        this.expirationTime = null;
    }

    // Generate random token
    generateToken() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '10000';
        notification.style.minWidth = '300px';
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'warning' ? 'exclamation-triangle' : 
                    type === 'danger' ? 'times-circle' : 'info-circle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Main method to check authentication before actions
    async checkAuthForAction(action = "realizar esta acción") {
        if (this.isAuthenticated()) {
            return true;
        }
        
        return await this.requestPassword(action);
    }

    // Get remaining time in minutes
    getRemainingTime() {
        if (!this.expirationTime) return 0;
        const remaining = this.expirationTime - new Date().getTime();
        return Math.max(0, Math.floor(remaining / 60000));
    }
}

// Create global auth manager instance
window.authManager = new AuthManager();

export default window.authManager;
