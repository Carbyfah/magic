// Servicio de autenticación para Magic Travel
const AuthService = {
    // Configuración
    TOKEN_KEY: 'magic_token',
    USER_KEY: 'magic_user',
    API_BASE: '/api/auth',

    // MODO PRODUCCIÓN - VALIDACIÓN DE ROLES ACTIVADA
    DESARROLLO_MODE: false,

    // Estado actual
    currentUser: null,
    currentToken: null,

    // Inicializar servicio
    init() {
        this.currentToken = this.getStoredToken();
        this.currentUser = this.getStoredUser();

        // DEBUG: Mostrar información al inicializar
        console.log('=== INIT AuthService ===');
        console.log('MODO PRODUCCIÓN ACTIVO - CON VALIDACIÓN DE ROLES');
        console.log('Token:', !!this.currentToken);
        console.log('Usuario:', this.currentUser);
        if (this.currentUser) {
            console.log('Rol nombre:', this.currentUser.rol?.nombre);
        }
        console.log('========================');
    },

    // Métodos de almacenamiento
    getStoredToken() {
        try {
            return localStorage.getItem(this.TOKEN_KEY);
        } catch (error) {
            console.error('Error obteniendo token:', error);
            return null;
        }
    },

    getStoredUser() {
        try {
            const userData = localStorage.getItem(this.USER_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            return null;
        }
    },

    setStoredToken(token) {
        try {
            if (token) {
                localStorage.setItem(this.TOKEN_KEY, token);
                this.currentToken = token;
                console.log('Token guardado en localStorage');
            } else {
                localStorage.removeItem(this.TOKEN_KEY);
                this.currentToken = null;
                console.log('Token removido de localStorage');
            }
        } catch (error) {
            console.error('Error guardando token:', error);
        }
    },

    setStoredUser(user) {
        try {
            if (user) {
                localStorage.setItem(this.USER_KEY, JSON.stringify(user));
                this.currentUser = user;

                // DEBUG: Mostrar información del usuario almacenado
                console.log('=== USUARIO ALMACENADO ===');
                console.log('Nombre:', user.nombre_completo);
                console.log('Rol:', user.rol?.rol_rol);
                console.log('==========================');
            } else {
                localStorage.removeItem(this.USER_KEY);
                this.currentUser = null;
                console.log('Usuario removido de localStorage');
            }
        } catch (error) {
            console.error('Error guardando usuario:', error);
        }
    },

    // Métodos principales de autenticación
    async login(usuario_codigo, password) {
        try {
            const response = await fetch(`${this.API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    usuario_codigo,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en el login');
            }

            // Guardar datos de usuario y token
            this.setStoredToken(data.token);
            this.setStoredUser(data.user);

            return {
                success: true,
                user: data.user,
                message: data.message
            };

        } catch (error) {
            console.error('Error en login:', error);
            return {
                success: false,
                message: error.message || 'Error de conexión'
            };
        }
    },

    async logout() {
        try {
            if (this.currentToken) {
                await fetch(`${this.API_BASE}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.currentToken}`,
                        'Content-Type': 'application/json',
                    }
                });
            }
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            // Limpiar datos locales siempre
            this.setStoredToken(null);
            this.setStoredUser(null);
        }
    },

    async getCurrentUser() {
        if (!this.currentToken) {
            return null;
        }

        try {
            const response = await fetch(`${this.API_BASE}/me`, {
                headers: {
                    'Authorization': `Bearer ${this.currentToken}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const user = await response.json();
                this.setStoredUser(user);
                return user;
            } else {
                // Token inválido o expirado
                this.logout();
                return null;
            }
        } catch (error) {
            console.error('Error obteniendo usuario actual:', error);
            this.logout();
            return null;
        }
    },

    // Verificar si está autenticado
    isAuthenticated() {
        return !!(this.currentToken && this.currentUser);
    },

    // Obtener usuario actual
    getUser() {
        return this.currentUser;
    },

    // Obtener token actual
    getToken() {
        return this.currentToken;
    },

    // ===== MÉTODOS DE ROLES ACTIVADOS PARA PRODUCCIÓN =====

    // Verificar permisos por rol
    hasRole(rolCodigo) {
        if (!this.currentUser || !this.currentUser.rol) {
            return false;
        }
        return this.currentUser.rol.rol_codigo === rolCodigo;
    },

    // Reemplaza estos métodos en auth.js para usar la estructura correcta del rol

    // Verificar si es administrador
    isAdmin() {
        if (!this.currentUser || !this.currentUser.rol || !this.currentUser.rol.nombre) {
            return false;
        }

        const rolNombre = this.currentUser.rol.nombre; // CAMBIAR: usar 'nombre' en lugar de 'rol_rol'

        const rolNormalizado = rolNombre
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');

        return rolNormalizado === 'administrador' ||
            rolNormalizado === 'admin';
    },

    // Verificar si es operador
    isOperator() {
        if (!this.currentUser || !this.currentUser.rol || !this.currentUser.rol.nombre) {
            return false;
        }

        const rolNombre = this.currentUser.rol.nombre; // CAMBIAR: usar 'nombre' en lugar de 'rol_rol'
        return rolNombre.toLowerCase().trim() === 'operador';
    },

    // Verificar si es vendedor
    isSeller() {
        if (!this.currentUser || !this.currentUser.rol || !this.currentUser.rol.nombre) {
            return false;
        }

        const rolNombre = this.currentUser.rol.nombre; // CAMBIAR: usar 'nombre' en lugar de 'rol_rol'
        return rolNombre.toLowerCase().trim() === 'vendedor';
    },

    // Método helper
    getRoleName() {
        return this.currentUser?.rol?.nombre || 'Sin rol'; // CAMBIAR: usar 'nombre' en lugar de 'rol_rol'
    },


    // Obtener módulos permitidos según rol
    getAllowedModules() {
        if (!this.currentUser) {
            return [];
        }

        // ADMINISTRADOR: Todos los 15 módulos
        if (this.isAdmin()) {
            return [
                'dashboard',
                'rutas-servicios', 'estados-sistema', 'tipos-persona', 'agencias',
                'control-flota', 'rutas-activas', 'tours-activados', 'reservaciones',
                'contactos-agencia', 'dashboard-ventas',
                'empleados', 'roles-permisos', 'usuarios-sistema',
                'auditoria', 'estadisticas'
            ];
        }

        // OPERADOR: Solo OPERACIÓN DIARIA (4 módulos)
        if (this.isOperator()) {
            return [
                'dashboard',
                'control-flota', 'rutas-activas', 'tours-activados', 'reservaciones'
            ];
        }

        // VENDEDOR: OPERACIÓN DIARIA + COMERCIAL (6 módulos)
        if (this.isSeller()) {
            return [
                'dashboard',
                'rutas-activas', 'tours-activados', 'reservaciones',
                'contactos-agencia', 'dashboard-ventas'
            ];
        }

        // Por defecto: solo dashboard
        return ['dashboard'];
    },

    // Verificar si un módulo está permitido
    canAccessModule(moduleId) {
        const allowedModules = this.getAllowedModules();
        return allowedModules.includes(moduleId);
    },

    // Método helper para obtener el nombre del rol
    getRoleName() {
        return this.currentUser?.rol?.rol_rol || 'Sin rol';
    },

    // Método helper para verificar múltiples roles
    hasAnyRole(roles) {
        if (!Array.isArray(roles)) {
            return this.hasRole(roles);
        }

        return roles.some(rol => this.hasRole(rol));
    },

    // Método para obtener permisos específicos por contexto
    getPermissions() {
        if (!this.currentUser) {
            return {
                canCreate: false,
                canEdit: false,
                canDelete: false,
                canViewReports: false,
                canManageUsers: false,
                canManageConfig: false
            };
        }

        const isAdmin = this.isAdmin();
        const isOperator = this.isOperator();
        const isSeller = this.isSeller();

        return {
            canCreate: isAdmin || isOperator,
            canEdit: isAdmin || isOperator,
            canDelete: isAdmin,
            canViewReports: isAdmin,
            canManageUsers: isAdmin,
            canManageConfig: isAdmin,
            canViewSalesData: isAdmin || isSeller,
            canManageReservations: isAdmin || isOperator || isSeller,
            canManageVehicles: isAdmin,
            canOperateRoutes: isAdmin || isOperator
        };
    }
};

// Inicializar al cargar
AuthService.init();

export default AuthService;
