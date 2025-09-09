// Servicio de autenticación para Magic Travel
const AuthService = {
    // Configuración
    TOKEN_KEY: 'magic_token',
    USER_KEY: 'magic_user',
    API_BASE: '/api/auth',

    // Estado actual
    currentUser: null,
    currentToken: null,

    // Inicializar servicio
    init() {
        this.currentToken = this.getStoredToken();
        this.currentUser = this.getStoredUser();

        // DEBUG: Mostrar información al inicializar
        console.log('=== INIT AuthService ===');
        console.log('Token:', !!this.currentToken);
        console.log('Usuario:', this.currentUser);
        if (this.currentUser) {
            console.log('Rol nombre:', this.currentUser.rol?.nombre);
            console.log('Es admin?', this.isAdmin());
        }
        console.log('========================');
    },

    // Métodos de almacenamiento
    getStoredToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },

    getStoredUser() {
        const userData = localStorage.getItem(this.USER_KEY);
        return userData ? JSON.parse(userData) : null;
    },

    setStoredToken(token) {
        if (token) {
            localStorage.setItem(this.TOKEN_KEY, token);
            this.currentToken = token;
        } else {
            localStorage.removeItem(this.TOKEN_KEY);
            this.currentToken = null;
        }
    },

    setStoredUser(user) {
        if (user) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
            this.currentUser = user;

            // DEBUG: Mostrar información del usuario almacenado
            console.log('=== USUARIO ALMACENADO ===');
            console.log('Nombre:', user.nombre_completo);
            console.log('Rol:', user.rol?.nombre);
            console.log('==========================');
        } else {
            localStorage.removeItem(this.USER_KEY);
            this.currentUser = null;
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

    // Verificar permisos por rol
    hasRole(rolCodigo) {
        if (!this.currentUser || !this.currentUser.rol) {
            return false;
        }
        return this.currentUser.rol.codigo === rolCodigo;
    },

    // Verificar si es administrador
    isAdmin() {
        if (!this.currentUser || !this.currentUser.rol) {
            console.log('DEBUG: No hay usuario o rol');
            return false;
        }

        const rolNombre = this.currentUser.rol.nombre;
        console.log('DEBUG: Verificando admin. Rol nombre:', rolNombre);

        // Comparación ultra-robusta - normalizar y limpiar caracteres especiales
        const rolNormalizado = rolNombre
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Quitar acentos/diacríticos
            .replace(/[ıi]/g, 'i'); // Normalizar variaciones de 'i'

        console.log('DEBUG: Rol normalizado:', rolNormalizado);

        const esAdmin = rolNormalizado.includes('admin') ||
            rolNormalizado === 'administrador' ||
            rolNormalizado.includes('administrador');

        console.log('DEBUG: Es admin?', esAdmin);
        return esAdmin;
    },

    // Verificar si es operador
    isOperator() {
        if (!this.currentUser || !this.currentUser.rol) {
            return false;
        }

        const rolNombre = this.currentUser.rol.nombre;

        return rolNombre === 'Operador' ||
            rolNombre === 'OPERADOR' ||
            rolNombre === 'operador';
    },

    // Verificar si es vendedor
    isSeller() {
        if (!this.currentUser || !this.currentUser.rol) {
            return false;
        }

        const rolNombre = this.currentUser.rol.nombre;

        return rolNombre === 'Vendedor' ||
            rolNombre === 'VENDEDOR' ||
            rolNombre === 'vendedor';
    },

    // Obtener módulos permitidos según rol
    getAllowedModules() {
        if (!this.currentUser) {
            console.log('DEBUG: No hay usuario actual');
            return [];
        }

        console.log('=== DEBUG getAllowedModules ===');
        console.log('Usuario:', this.currentUser.nombre_completo);
        console.log('Rol:', this.currentUser.rol?.nombre);
        console.log('Es admin?', this.isAdmin());
        console.log('Es operador?', this.isOperator());
        console.log('Es vendedor?', this.isSeller());

        // ADMINISTRADOR: Acceso total a todos los módulos del sistema
        if (this.isAdmin()) {
            const adminModules = [
                'dashboard',
                'catalogos', 'rutas-servicios', 'estados-sistema', 'tipos-persona', 'agencias',
                'operacion', 'control-flota', 'rutas-activas', 'reservaciones',
                'comercial', 'contactos-agencia', 'dashboard-ventas',
                'personal', 'empleados', 'roles-permisos', 'usuarios-sistema',
                'reportes', 'auditoria', 'estadisticas'
            ];
            console.log('DEBUG: Devolviendo módulos de admin:', adminModules);
            return adminModules;
        }

        // Operador: módulos operacionales
        if (this.isOperator()) {
            const operatorModules = [
                'dashboard',
                'operacion', 'control-flota', 'rutas-activas', 'reservaciones',
                'comercial', 'contactos-agencia',
                'catalogos', 'rutas-servicios', 'agencias'
            ];
            console.log('DEBUG: Devolviendo módulos de operador:', operatorModules);
            return operatorModules;
        }

        // Vendedor: módulos comerciales
        if (this.isSeller()) {
            const sellerModules = [
                'dashboard',
                'operacion', 'reservaciones',
                'comercial', 'contactos-agencia', 'dashboard-ventas',
                'catalogos', 'agencias'
            ];
            console.log('DEBUG: Devolviendo módulos de vendedor:', sellerModules);
            return sellerModules;
        }

        // Por defecto: solo dashboard
        console.log('DEBUG: Devolviendo módulos por defecto: [dashboard]');
        return ['dashboard'];
    },

    // Verificar si un módulo está permitido
    canAccessModule(moduleId) {
        const allowedModules = this.getAllowedModules();
        return allowedModules.includes(moduleId);
    }
};

// Inicializar al cargar
AuthService.init();

export default AuthService;
