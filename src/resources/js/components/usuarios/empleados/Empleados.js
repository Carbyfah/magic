// src/resources/js/components/usuarios/empleados/Empleados.js
import React from 'react';
import EmpleadosList from './EmpleadosList';
import EmpleadosModal from './EmpleadosModal';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';

const { createElement: e, useState, useEffect } = React;

function Empleados() {
    // Estados principales
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados del modal
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedEmpleado, setSelectedEmpleado] = useState(null);

    // Estados de búsqueda y filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroRol, setFiltroRol] = useState('todos');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroSituacion, setFiltroSituacion] = useState('activos');

    // Estados auxiliares
    const [roles, setRoles] = useState([]);
    const [estadosEmpleado, setEstadosEmpleado] = useState([]);

    // Cargar datos iniciales
    useEffect(() => {
        fetchData();
        loadCatalogos();
    }, []);

    // Función para obtener empleados
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Construir URL con parámetros
            const params = new URLSearchParams();

            if (searchTerm.trim()) {
                params.append('buscar', searchTerm.trim());
            }

            if (filtroRol !== 'todos') {
                params.append('rol_id', filtroRol);
            }

            if (filtroEstado !== 'todos') {
                params.append('estado_empleado_id', filtroEstado);
            }

            // Filtro de situación
            if (filtroSituacion === 'activos') {
                params.append('solo_activos', 'true');
            } else if (filtroSituacion === 'inactivos') {
                params.append('incluir_inactivos', 'true');
                params.append('filtro_situacion', 'inactivos');
            } else {
                params.append('incluir_inactivos', 'true');
            }

            const url = `/api/v1/empleados${params.toString() ? '?' + params.toString() : ''}`;

            console.log(`Cargando empleados desde: ${url}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Empleados cargados:', result);

            // Manejar respuesta paginada o simple array
            if (result.data && Array.isArray(result.data)) {
                setData(result.data);
            } else if (Array.isArray(result)) {
                setData(result);
            } else {
                setData([]);
            }

        } catch (err) {
            console.error('Error al cargar empleados:', err);
            setError(err.message);
            Notifications.error('Error al cargar empleados: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Cargar catálogos necesarios
    const loadCatalogos = async () => {
        try {
            // Cargar roles
            const rolesResponse = await fetch('/api/v1/roles');
            if (rolesResponse.ok) {
                const rolesData = await rolesResponse.json();
                setRoles(Array.isArray(rolesData) ? rolesData : rolesData.data || []);
            }

            // Cargar estados de empleado
            const estadosResponse = await fetch('/api/v1/estados-empleado');
            if (estadosResponse.ok) {
                const estadosData = await estadosResponse.json();
                setEstadosEmpleado(Array.isArray(estadosData) ? estadosData : estadosData.data || []);
            }
        } catch (error) {
            console.error('Error cargando catálogos:', error);
        }
    };

    // Handlers para el modal
    const handleCreate = () => {
        setSelectedEmpleado(null);
        setModalMode('create');
        setShowModal(true);
    };

    const handleEdit = (empleado) => {
        setSelectedEmpleado(empleado);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleView = (empleado) => {
        setSelectedEmpleado(empleado);
        setModalMode('view');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedEmpleado(null);
    };

    // Función para guardar empleado
    const handleSave = async (formData) => {
        Notifications.loading(
            modalMode === 'create' ? 'Creando empleado...' : 'Actualizando empleado...',
            'Guardando'
        );

        try {
            const url = modalMode === 'create' ? '/api/v1/empleados' : `/api/v1/empleados/${selectedEmpleado.id}`;
            const method = modalMode === 'create' ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            Notifications.hideLoading();
            Notifications.clear();
            await new Promise(resolve => setTimeout(resolve, 100));

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 422 && errorData.errors) {
                    const errorMessages = Object.values(errorData.errors).flat();
                    Notifications.warning(
                        errorMessages.join('\n'),
                        'Errores de Validación'
                    );
                } else {
                    throw new Error(errorData.message || `Error ${response.status}`);
                }
                return;
            }

            const result = await response.json();
            const empleadoName = result.data?.persona?.nombre_completo || result.data?.codigo_empleado || 'el empleado';

            if (modalMode === 'create') {
                Notifications.success(`Empleado "${empleadoName}" creado correctamente`);
            } else {
                Notifications.success(`Empleado "${empleadoName}" actualizado correctamente`);
            }

            handleCloseModal();
            await fetchData();

        } catch (err) {
            Notifications.hideLoading();
            Notifications.clear();
            console.error('Error al guardar empleado:', err);
            Notifications.error('Error al guardar: ' + err.message);
            throw err;
        }
    };

    // Handler para cambiar estado
    const handleToggleStatus = async (empleado) => {
        const empleadoName = empleado.persona?.nombre_completo || empleado.codigo_empleado || 'este empleado';
        const isActive = Boolean(empleado.situacion);

        const confirmMessage = isActive ?
            `¿Está seguro de DESACTIVAR al empleado "${empleadoName}"? No podrá acceder al sistema.` :
            `¿Está seguro de REACTIVAR al empleado "${empleadoName}"? Podrá volver a acceder al sistema.`;

        if (typeof window.iziToast !== 'undefined') {
            const titleText = isActive ? 'Confirmar Desactivación' : 'Confirmar Reactivación';
            const buttonText = isActive ? 'Desactivar' : 'Reactivar';
            const buttonColor = isActive ? '#dc2626' : '#059669';

            window.iziToast.question({
                timeout: false,
                close: false,
                overlay: true,
                displayMode: 'once',
                id: 'toggle-empleado-confirm',
                zindex: 9999,
                title: titleText,
                message: confirmMessage,
                position: 'center',
                buttons: [
                    [`<button type="button" style="background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; padding: 8px 16px; border-radius: 6px; font-weight: 500; margin-right: 8px; cursor: pointer;">Cancelar</button>`,
                        function (instance, toast) {
                            instance.hide({ transitionOut: 'fadeOutUp' }, toast, 'button');
                            Notifications.info('Operación cancelada', 'Cancelado');
                        }],

                    [`<button type="button" style="background: ${buttonColor}; color: #ffffff; border: 1px solid ${buttonColor}; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer;">${buttonText}</button>`,
                    async function (instance, toast) {
                        instance.hide({ transitionOut: 'fadeOutUp' }, toast, 'button');
                        await executeToggleAction();
                    }]
                ]
            });
        } else {
            if (confirm(confirmMessage)) {
                await executeToggleAction();
            }
        }

        async function executeToggleAction() {
            try {
                const response = await fetch(`/api/v1/empleados/${empleado.id}`, {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        situacion: !empleado.situacion
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al cambiar estado');
                }

                Notifications.success(`Empleado "${empleadoName}" ${isActive ? 'desactivado' : 'reactivado'} correctamente`);
                await fetchData();

            } catch (err) {
                console.error('Error al cambiar estado:', err);
                Notifications.error('Error al cambiar estado: ' + err.message);
            }
        }
    };

    // Handler para eliminar empleado
    const handleDelete = async (empleado) => {
        const empleadoName = empleado.persona?.nombre_completo || empleado.codigo_empleado || 'este empleado';

        if (typeof window.iziToast !== 'undefined') {
            window.iziToast.question({
                timeout: false,
                close: false,
                overlay: true,
                displayMode: 'once',
                id: 'delete-empleado-confirm',
                zindex: 9999,
                title: 'Confirmar Eliminación',
                message: `¿Está seguro de eliminar al empleado "${empleadoName}"? Esta acción NO se puede deshacer.`,
                position: 'center',
                buttons: [
                    [`<button type="button" style="background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; padding: 8px 16px; border-radius: 6px; font-weight: 500; margin-right: 8px; cursor: pointer;">Cancelar</button>`,
                        function (instance, toast) {
                            instance.hide({ transitionOut: 'fadeOutUp' }, toast, 'button');
                            Notifications.info('Operación cancelada', 'Cancelado');
                        }],

                    [`<button type="button" style="background: #dc2626; color: #ffffff; border: 1px solid #dc2626; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer;">Eliminar</button>`,
                        async function (instance, toast) {
                            instance.hide({ transitionOut: 'fadeOutUp' }, toast, 'button');
                            await executeDeleteAction();
                        }]
                ]
            });
        } else {
            if (confirm(`¿Está seguro de eliminar al empleado "${empleadoName}"?`)) {
                await executeDeleteAction();
            }
        }

        async function executeDeleteAction() {
            try {
                const response = await fetch(`/api/v1/empleados/${empleado.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al eliminar');
                }

                Notifications.success(`Empleado "${empleadoName}" eliminado correctamente`);
                await fetchData();

            } catch (err) {
                console.error('Error al eliminar empleado:', err);
                Notifications.error('Error al eliminar: ' + err.message);
            }
        }
    };

    // Filtrar datos localmente
    const datosFiltrados = data.filter(empleado => {
        if (searchTerm.trim()) {
            const termino = searchTerm.toLowerCase();
            return (
                empleado.codigo_empleado?.toLowerCase().includes(termino) ||
                empleado.persona?.nombres?.toLowerCase().includes(termino) ||
                empleado.persona?.apellidos?.toLowerCase().includes(termino) ||
                empleado.persona?.email?.toLowerCase().includes(termino) ||
                empleado.rol?.nombre_rol?.toLowerCase().includes(termino)
            );
        }
        return true;
    });

    return e('div', {
        style: {
            maxWidth: '100%'
        }
    }, [
        // Header
        e('div', {
            key: 'header',
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }
        }, [
            e('div', { key: 'title-section' }, [
                e('h2', {
                    key: 'title',
                    style: {
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        color: '#111827',
                        margin: '0 0 0.25rem 0'
                    }
                }, 'Gestión de Empleados'),
                e('p', {
                    key: 'description',
                    style: {
                        color: '#6b7280',
                        margin: '0',
                        fontSize: '0.875rem'
                    }
                }, `${datosFiltrados.length} empleado${datosFiltrados.length !== 1 ? 's' : ''} encontrado${datosFiltrados.length !== 1 ? 's' : ''}`)
            ]),
            e('button', {
                key: 'btn-create',
                onClick: handleCreate,
                style: {
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                },
                onMouseEnter: (e) => e.target.style.backgroundColor = '#2563eb',
                onMouseLeave: (e) => e.target.style.backgroundColor = '#3b82f6'
            }, [
                e('span', { key: 'btn-icon' }, Icons.plus()),
                e('span', { key: 'btn-text' }, 'Nuevo Empleado')
            ])
        ]),

        // Controles de búsqueda y filtros
        e('div', {
            key: 'controls',
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }
        }, [
            e('div', {
                key: 'filters-row',
                style: {
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 0.8fr',
                    gap: '1rem'
                }
            }, [
                // Búsqueda general
                e('div', { key: 'search-general' }, [
                    e('label', {
                        key: 'search-label',
                        style: { fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', display: 'block' }
                    }, 'Buscar'),
                    e('div', { key: 'search-container', style: { position: 'relative' } }, [
                        e('input', {
                            key: 'search-input',
                            type: 'text',
                            placeholder: 'Código, nombre, email, rol...',
                            value: searchTerm,
                            onChange: (e) => {
                                setSearchTerm(e.target.value);
                                clearTimeout(window.searchTimeout);
                                window.searchTimeout = setTimeout(fetchData, 500);
                            },
                            onKeyPress: (e) => {
                                if (e.key === 'Enter') {
                                    fetchData();
                                }
                            },
                            style: {
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                outline: 'none'
                            },
                            onFocus: (e) => e.target.style.borderColor = '#3b82f6',
                            onBlur: (e) => e.target.style.borderColor = '#d1d5db'
                        }),
                        e('div', {
                            key: 'search-icon',
                            style: {
                                position: 'absolute',
                                left: '0.75rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#9ca3af'
                            }
                        }, Icons.search())
                    ])
                ]),

                // Filtro por rol
                e('div', { key: 'filter-rol' }, [
                    e('label', {
                        key: 'rol-label',
                        style: { fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', display: 'block' }
                    }, 'Rol'),
                    e('select', {
                        key: 'rol-select',
                        value: filtroRol,
                        onChange: (e) => {
                            setFiltroRol(e.target.value);
                            setTimeout(fetchData, 100);
                        },
                        style: {
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            backgroundColor: 'white',
                            outline: 'none'
                        }
                    }, [
                        e('option', { key: 'rol-todos', value: 'todos' }, 'Todos los roles'),
                        ...roles.map(rol =>
                            e('option', { key: rol.id, value: rol.id }, rol.nombre_rol)
                        )
                    ])
                ]),

                // Filtro por estado
                e('div', { key: 'filter-estado' }, [
                    e('label', {
                        key: 'estado-label',
                        style: { fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', display: 'block' }
                    }, 'Estado'),
                    e('select', {
                        key: 'estado-select',
                        value: filtroEstado,
                        onChange: (e) => {
                            setFiltroEstado(e.target.value);
                            setTimeout(fetchData, 100);
                        },
                        style: {
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            backgroundColor: 'white',
                            outline: 'none'
                        }
                    }, [
                        e('option', { key: 'estado-todos', value: 'todos' }, 'Todos los estados'),
                        ...estadosEmpleado.map(estado =>
                            e('option', { key: estado.id, value: estado.id }, estado.nombre_estado)
                        )
                    ])
                ]),

                // Filtro situación
                e('div', { key: 'filter-situacion' }, [
                    e('label', {
                        key: 'situacion-label',
                        style: { fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', display: 'block' }
                    }, 'Situación'),
                    e('select', {
                        key: 'situacion-select',
                        value: filtroSituacion,
                        onChange: (e) => {
                            setFiltroSituacion(e.target.value);
                            setTimeout(fetchData, 100);
                        },
                        style: {
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            backgroundColor: 'white',
                            outline: 'none'
                        }
                    }, [
                        e('option', { key: 'situacion-todos', value: 'todos' }, 'Todos'),
                        e('option', { key: 'situacion-activos', value: 'activos' }, 'Activos'),
                        e('option', { key: 'situacion-inactivos', value: 'inactivos' }, 'Inactivos')
                    ])
                ]),

                // Botón actualizar
                e('div', { key: 'btn-refresh-container', style: { display: 'flex', alignItems: 'end' } }, [
                    e('button', {
                        key: 'btn-refresh',
                        onClick: fetchData,
                        title: 'Actualizar datos',
                        style: {
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%'
                        },
                        onMouseEnter: (e) => e.target.style.backgroundColor = '#4b5563',
                        onMouseLeave: (e) => e.target.style.backgroundColor = '#6b7280'
                    }, Icons.refresh())
                ])
            ])
        ]),

        // Lista de empleados
        e(EmpleadosList, {
            key: 'empleados-list',
            data: datosFiltrados,
            loading,
            error,
            onEdit: handleEdit,
            onView: handleView,
            onToggleStatus: handleToggleStatus,
            onDelete: handleDelete
        }),

        // Modal para crear/editar/ver empleados
        showModal && e(EmpleadosModal, {
            key: 'empleados-modal',
            isOpen: showModal,
            mode: modalMode,
            empleado: selectedEmpleado,
            roles: roles,
            estadosEmpleado: estadosEmpleado,
            onClose: handleCloseModal,
            onSave: handleSave
        })
    ]);
}

export default Empleados;
