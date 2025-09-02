// src/resources/js/services/api.js
// Servicio HTTP para Magic Travel API

class ApiService {
    constructor() {
        this.baseURL = '/api/magic';
        this.timeout = 10000; // 10 segundos
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    // Método base para realizar peticiones
    async request(method, endpoint, data = null, options = {}) {
        const config = {
            method: method.toUpperCase(),
            headers: {
                ...this.defaultHeaders,
                ...options.headers
            },
            signal: AbortSignal.timeout(this.timeout)
        };

        // Agregar body para métodos que lo requieren
        if (data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
            config.body = JSON.stringify(data);
        }

        // Construir URL completa
        const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

        try {
            const response = await fetch(url, config);

            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Intentar parsear como JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            // Si no es JSON, devolver como texto
            return await response.text();

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('La petición tardó demasiado en responder');
            }
            throw error;
        }
    }

    // Métodos HTTP específicos
    async get(endpoint, params = null) {
        let url = endpoint;

        // Agregar parámetros de consulta si existen
        if (params) {
            const searchParams = new URLSearchParams();
            Object.keys(params).forEach(key => {
                if (params[key] !== null && params[key] !== undefined) {
                    searchParams.append(key, params[key]);
                }
            });
            url += `?${searchParams.toString()}`;
        }

        return this.request('GET', url);
    }

    async post(endpoint, data) {
        return this.request('POST', endpoint, data);
    }

    async put(endpoint, data) {
        return this.request('PUT', endpoint, data);
    }

    async patch(endpoint, data) {
        return this.request('PATCH', endpoint, data);
    }

    async delete(endpoint) {
        return this.request('DELETE', endpoint);
    }

    // Métodos específicos para Magic Travel

    // DASHBOARD
    async getDashboardStats() {
        return this.get('/dashboard/stats-generales');
    }

    async getWhatsAppReport(fecha = null, incluirEstadisticas = true) {
        return this.post('/reservas/whatsapp-report', {
            fecha,
            incluir_estadisticas: incluirEstadisticas
        });
    }

    async getAlertasSistema() {
        return this.get('/reservas/alertas-sistema');
    }

    async getResumenRapido() {
        return this.get('/reservas/resumen-rapido');
    }

    // RESERVAS
    async getReservas(params = {}) {
        return this.get('/reservas', params);
    }

    async createReserva(data) {
        return this.post('/reservas', data);
    }

    async getReserva(id) {
        return this.get(`/reservas/${id}`);
    }

    async updateReserva(id, data) {
        return this.put(`/reservas/${id}`, data);
    }

    async deleteReserva(id) {
        return this.delete(`/reservas/${id}`);
    }

    async confirmarReserva(id) {
        return this.patch(`/reservas/${id}/confirmar`);
    }

    async cancelarReserva(id) {
        return this.patch(`/reservas/${id}/cancelar`);
    }

    // RUTAS ACTIVADAS
    async getRutasActivadas(params = {}) {
        return this.get('/rutas-activadas', params);
    }

    async createRutaActivada(data) {
        return this.post('/rutas-activadas', data);
    }

    async getRutaActivada(id) {
        return this.get(`/rutas-activadas/${id}`);
    }

    async updateRutaActivada(id, data) {
        return this.put(`/rutas-activadas/${id}`, data);
    }

    async iniciarRuta(id) {
        return this.patch(`/rutas-activadas/${id}/iniciar`);
    }

    async finalizarRuta(id) {
        return this.patch(`/rutas-activadas/${id}/finalizar`);
    }

    // VEHÍCULOS
    async getVehiculos(params = {}) {
        return this.get('/vehiculos', params);
    }

    async getVehiculosDisponibles() {
        return this.get('/vehiculos/disponibles');
    }

    async createVehiculo(data) {
        return this.post('/vehiculos', data);
    }

    async updateVehiculo(id, data) {
        return this.put(`/vehiculos/${id}`, data);
    }

    async marcarVehiculoDisponible(id) {
        return this.patch(`/vehiculos/${id}/disponible`);
    }

    async marcarVehiculoOcupado(id) {
        return this.patch(`/vehiculos/${id}/ocupado`);
    }

    // AGENCIAS
    async getAgencias(params = {}) {
        return this.get('/agencias', params);
    }

    async createAgencia(data) {
        return this.post('/agencias', data);
    }

    async getAgencia(id) {
        return this.get(`/agencias/${id}`);
    }

    async updateAgencia(id, data) {
        return this.put(`/agencias/${id}`, data);
    }

    // USUARIOS
    async getUsuarios(params = {}) {
        return this.get('/usuarios', params);
    }

    async createUsuario(data) {
        return this.post('/usuarios', data);
    }

    async getUsuario(id) {
        return this.get(`/usuarios/${id}`);
    }

    async updateUsuario(id, data) {
        return this.put(`/usuarios/${id}`, data);
    }

    // SERVICIOS
    async getServicios(params = {}) {
        return this.get('/servicios', params);
    }

    async createServicio(data) {
        return this.post('/servicios', data);
    }

    async getServicio(id) {
        return this.get(`/servicios/${id}`);
    }

    async updateServicio(id, data) {
        return this.put(`/servicios/${id}`, data);
    }

    // SISTEMA
    async executeBackup() {
        return this.post('/sistema/backup');
    }

    async getSystemHealth() {
        return this.get('/sistema/health');
    }

    async getSystemInfo() {
        return this.get('/sistema/info');
    }

    async cleanupSystem() {
        return this.post('/sistema/cleanup');
    }

    async optimizeSystem() {
        return this.post('/sistema/optimize');
    }

    // ESTADÍSTICAS
    async getReservasStats() {
        return this.get('/reservas/stats');
    }

    async getRutasStats() {
        return this.get('/rutas-activadas/stats');
    }

    async getVehiculosStats() {
        return this.get('/vehiculos/stats');
    }

    async getFacturasStats() {
        return this.get('/facturas/stats');
    }

    // REPORTES
    async getReporteVentas(fechaInicio, fechaFin) {
        return this.get('/reservas/ventas', {
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin
        });
    }

    async getReporteOperacional(fecha) {
        return this.get('/rutas-activadas', {
            fecha,
            with_relations: true,
            with_reservas: true
        });
    }

    // AUDITORÍA
    async getAuditorias(params = {}) {
        return this.get('/auditorias', params);
    }

    async getAuditoriaByTable(table, params = {}) {
        return this.get(`/auditorias/tabla/${table}`, params);
    }

    // MÉTODO DE UTILIDAD PARA MANEJAR ERRORES
    handleError(error, context = '') {
        console.error(`Error en API ${context}:`, error);

        if (error.message.includes('fetch')) {
            return {
                success: false,
                message: 'Error de conexión con el servidor',
                error: error.message
            };
        }

        if (error.message.includes('HTTP 4')) {
            return {
                success: false,
                message: 'Error en la petición',
                error: error.message
            };
        }

        if (error.message.includes('HTTP 5')) {
            return {
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            };
        }

        return {
            success: false,
            message: 'Error desconocido',
            error: error.message
        };
    }
}

// Crear instancia única
const api = new ApiService();

// Exportar instancia por defecto
export default api;

// También exportar la clase por si se necesita crear instancias personalizadas
export { ApiService };
