// js/sessionManager.js - Gestor de sesiones centralizado

const SessionManager = {
    /**
     * Verifica si hay una sesión activa
     * @returns {boolean} true si hay sesión activa, false en caso contrario
     */
    isSessionActive() {
        try {
            const currentUser = localStorage.getItem("currentUser");
            const userSession = localStorage.getItem("userSession");
            
            if (!currentUser || !userSession) {
                return false;
            }
            
            const session = JSON.parse(userSession);
            return session && session.sessionActive === true;
        } catch (e) {
            console.error("Error verificando sesión:", e);
            return false;
        }
    },

    /**
     * Obtiene el usuario actual
     * @returns {Object|null} objeto del usuario o null si no hay sesión
     */
    getCurrentUser() {
        try {
            if (this.isSessionActive()) {
                return JSON.parse(localStorage.getItem("currentUser"));
            }
            return null;
        } catch (e) {
            console.error("Error obteniendo usuario:", e);
            return null;
        }
    },

    /**
     * Crea una nueva sesión después del login
     * @param {Object} user - objeto del usuario
     * @param {string} email - email del usuario
     */
    createSession(user, email) {
        try {
            localStorage.setItem("userSession", JSON.stringify({
                userId: user.id,
                email: email,
                loginTime: new Date().toISOString(),
                sessionActive: true
            }));
            
            const currentUser = {...user};
            delete currentUser.password;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
            
            console.log("✅ Sesión creada para:", email);
        } catch (e) {
            console.error("Error creando sesión:", e);
        }
    },

    /**
     * Destruye la sesión actual (logout)
     */
    destroySession() {
        try {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userSession');
            localStorage.removeItem('rememberedLogin');
            localStorage.removeItem('onboardingCompleted');
            console.log("✅ Sesión destruida");
        } catch (e) {
            console.error("Error destruyendo sesión:", e);
        }
    },

    /**
     * Verifica sesión y redirige si no es válida
     * @param {string} redirectTo - página a la que redirigir si no hay sesión
     * @returns {boolean} true si hay sesión válida, false si se redirige
     */
    checkSessionOrRedirect(redirectTo = "login.html") {
        if (!this.isSessionActive()) {
            console.warn("⚠️ No hay sesión activa, redirigiendo a:", redirectTo);
            this.destroySession();
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }
};

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SessionManager;
}
