// src/resources/js/utils/apiHelper.js
import AuthService from '../services/auth';

class ApiHelper {
    constructor() {
        this.baseUrl = '/api/magic';
    }

    // Obtener headers por defecto con autenticación
    getDefaultHeaders(includeCSRF = false) {
        const token = AuthService.getToken();

        console.log('=== DEBUG APIHELPER ===');
        console.log('Token obtenido:', token);
        console.log('Token existe:', !!token);
        console.log('Token length:', token ? token.length : 0);
        console.log('======================');

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('Header Authorization agregado:', headers['Authorization']);
        } else {
            console.log('NO SE AGREGÓ Authorization header - token es null');
        }

        console.log('Headers finales:', headers);
        return headers;
    }

    // Método genérico para hacer peticiones
    async request(url, options = {}) {
        const finalUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

        const defaultOptions = {
            headers: this.getDefaultHeaders(options.method !== 'GET')
        };

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(finalUrl, finalOptions);
            return response;
        } catch (error) {
            console.error('Error en petición API:', error);
            throw error;
        }
    }

    // MÉTODOS ESPECÍFICOS PARA CRUD

    // GET - Obtener datos
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST - Crear nuevo
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT - Actualizar completo
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // PATCH - Actualizar parcial
    async patch(endpoint, data = null) {
        const options = { method: 'PATCH' };
        if (data) {
            options.body = JSON.stringify(data);
        }
        return this.request(endpoint, options);
    }

    // DELETE - Eliminar
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // MÉTODOS ESPECÍFICOS PARA CADA MÓDULO

    // === ESTADOS ===
    estados = {
        getAll: () => this.get('/estados'),
        getById: (id) => this.get(`/estados/${id}`),
        create: (data) => this.post('/estados', data),
        update: (id, data) => this.put(`/estados/${id}`, data),
        activate: (id) => this.patch(`/estados/${id}/activate`),
        deactivate: (id) => this.patch(`/estados/${id}/deactivate`),
        delete: (id) => this.delete(`/estados/${id}`)
    };

    // === SERVICIOS ===
    servicios = {
        getAll: () => this.get('/servicios'),
        getById: (id) => this.get(`/servicios/${id}`),
        create: (data) => this.post('/servicios', data),
        update: (id, data) => this.put(`/servicios/${id}`, data),
        activate: (id) => this.patch(`/servicios/${id}/activate`),
        deactivate: (id) => this.patch(`/servicios/${id}/deactivate`),
        delete: (id) => this.delete(`/servicios/${id}`)
    };

    // === RUTAS ===
    rutas = {
        getAll: () => this.get('/rutas'),
        getById: (id) => this.get(`/rutas/${id}`),
        create: (data) => this.post('/rutas', data),
        update: (id, data) => this.put(`/rutas/${id}`, data),
        activate: (id) => this.patch(`/rutas/${id}/activate`),
        deactivate: (id) => this.patch(`/rutas/${id}/deactivate`),
        delete: (id) => this.delete(`/rutas/${id}`)
    };

    // === TIPOS DE PERSONA ===
    tiposPersona = {
        getAll: () => this.get('/tipo-personas'),
        getById: (id) => this.get(`/tipo-personas/${id}`),
        create: (data) => this.post('/tipo-personas', data),
        update: (id, data) => this.put(`/tipo-personas/${id}`, data),
        activate: (id) => this.patch(`/tipo-personas/${id}/activate`),
        deactivate: (id) => this.patch(`/tipo-personas/${id}/deactivate`),
        delete: (id) => this.delete(`/tipo-personas/${id}`)
    };

    // === AGENCIAS ===
    agencias = {
        getAll: () => this.get('/agencias'),
        getById: (id) => this.get(`/agencias/${id}`),
        create: (data) => this.post('/agencias', data),
        update: (id, data) => this.put(`/agencias/${id}`, data),
        activate: (id) => this.patch(`/agencias/${id}/activate`),
        deactivate: (id) => this.patch(`/agencias/${id}/deactivate`),
        delete: (id) => this.delete(`/agencias/${id}`)
    };

    // === CONTACTOS AGENCIA ===
    contactosAgencia = {
        getAll: () => this.get('/contactos-agencia'),
        getById: (id) => this.get(`/contactos-agencia/${id}`),
        create: (data) => this.post('/contactos-agencia', data),
        update: (id, data) => this.put(`/contactos-agencia/${id}`, data),
        activate: (id) => this.patch(`/contactos-agencia/${id}/activate`),
        deactivate: (id) => this.patch(`/contactos-agencia/${id}/deactivate`),
        delete: (id) => this.delete(`/contactos-agencia/${id}`)
    };

    // === VEHÍCULOS ===
    vehiculos = {
        getAll: () => this.get('/vehiculos'),
        getById: (id) => this.get(`/vehiculos/${id}`),
        create: (data) => this.post('/vehiculos', data),
        update: (id, data) => this.put(`/vehiculos/${id}`, data),
        activate: (id) => this.patch(`/vehiculos/${id}/activate`),
        deactivate: (id) => this.patch(`/vehiculos/${id}/deactivate`),
        delete: (id) => this.delete(`/vehiculos/${id}`)
    };

    // === RESERVAS ===
    reservas = {
        getAll: () => this.get('/reservas'),
        getById: (id) => this.get(`/reservas/${id}`),
        create: (data) => this.post('/reservas', data),
        update: (id, data) => this.put(`/reservas/${id}`, data),
        activate: (id) => this.patch(`/reservas/${id}/activate`),
        deactivate: (id) => this.patch(`/reservas/${id}/deactivate`),
        delete: (id) => this.delete(`/reservas/${id}`)
    };

    // === RUTAS ACTIVAS ===
    rutasActivas = {
        getAll: () => this.get('/rutas-activas'),
        getById: (id) => this.get(`/rutas-activas/${id}`),
        create: (data) => this.post('/rutas-activas', data),
        update: (id, data) => this.put(`/rutas-activas/${id}`, data),
        activate: (id) => this.patch(`/rutas-activas/${id}/activate`),
        deactivate: (id) => this.patch(`/rutas-activas/${id}/deactivate`),
        delete: (id) => this.delete(`/rutas-activas/${id}`)
    };

    // === TOURS ACTIVADOS ===
    toursActivados = {
        getAll: () => this.get('/tours-activados'),
        getById: (id) => this.get(`/tours-activados/${id}`),
        create: (data) => this.post('/tours-activados', data),
        update: (id, data) => this.put(`/tours-activados/${id}`, data),
        activate: (id) => this.patch(`/tours-activados/${id}/activate`),
        deactivate: (id) => this.patch(`/tours-activados/${id}/deactivate`),
        delete: (id) => this.delete(`/tours-activados/${id}`)
    };

    // === EMPLEADOS ===
    empleados = {
        getAll: () => this.get('/empleados'),
        getById: (id) => this.get(`/empleados/${id}`),
        create: (data) => this.post('/empleados', data),
        update: (id, data) => this.put(`/empleados/${id}`, data),
        activate: (id) => this.patch(`/empleados/${id}/activate`),
        deactivate: (id) => this.patch(`/empleados/${id}/deactivate`),
        delete: (id) => this.delete(`/empleados/${id}`)
    };

    // === ROLES ===
    roles = {
        getAll: () => this.get('/roles'),
        getById: (id) => this.get(`/roles/${id}`),
        create: (data) => this.post('/roles', data),
        update: (id, data) => this.put(`/roles/${id}`, data),
        activate: (id) => this.patch(`/roles/${id}/activate`),
        deactivate: (id) => this.patch(`/roles/${id}/deactivate`),
        delete: (id) => this.delete(`/roles/${id}`)
    };

    // === USUARIOS ===
    usuarios = {
        getAll: () => this.get('/usuarios'),
        getById: (id) => this.get(`/usuarios/${id}`),
        create: (data) => this.post('/usuarios', data),
        update: (id, data) => this.put(`/usuarios/${id}`, data),
        activate: (id) => this.patch(`/usuarios/${id}/activate`),
        deactivate: (id) => this.patch(`/usuarios/${id}/deactivate`),
        delete: (id) => this.delete(`/usuarios/${id}`)
    };

    // === AUDITORÍAS ===
    auditorias = {
        getAll: () => this.get('/auditorias'),
        getById: (id) => this.get(`/auditorias/${id}`)
    };

    // === ESTADÍSTICAS ===
    estadisticas = {
        getAll: () => this.get('/estadisticas'),
        getDashboard: () => this.get('/dashboard-stats')
    };

    // === VENTAS ===
    ventas = {
        getAll: () => this.get('/ventas'),
        getDashboard: () => this.get('/dashboard-ventas'),
        getById: (id) => this.get(`/ventas/${id}`)
    };

    // MÉTODO HELPER PARA MANEJO DE RESPUESTAS
    async handleResponse(response) {
        if (response.ok) {
            return await response.json();
        } else {
            const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
            throw new Error(error.message || `Error ${response.status}`);
        }
    }

    // MÉTODO SIMPLIFICADO PARA CARGAR DATOS
    async loadData(endpoint) {
        try {
            const response = await this.get(endpoint);
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`Error cargando datos de ${endpoint}:`, error);
            throw error;
        }
    }

    // MÉTODO SIMPLIFICADO PARA GUARDAR DATOS
    async saveData(endpoint, data, isEdit = false, id = null) {
        try {
            const response = isEdit
                ? await this.put(`${endpoint}/${id}`, data)
                : await this.post(endpoint, data);
            return await this.handleResponse(response);
        } catch (error) {
            console.error(`Error guardando datos en ${endpoint}:`, error);
            throw error;
        }
    }
}

// Crear instancia única
const apiHelper = new ApiHelper();

export default apiHelper;
