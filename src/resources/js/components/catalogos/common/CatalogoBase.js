// src/resources/js/components/catalogos/common/CatalogoBase.js
import React from 'react';
import CatalogoTable from './CatalogoTable';
import CatalogoModal from './CatalogoModal';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';
import DuplicateModal from './DuplicateModal';

const { createElement: e, useState, useEffect } = React;

function CatalogoBase({
    titulo,
    endpoint,
    campos,
    validaciones,
    icono,
    descripcion
}) {
    // Estados principales
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados del modal
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // create, edit, view
    const [selectedItem, setSelectedItem] = useState(null);

    // Estados del modal de duplicados
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicateData, setDuplicateData] = useState(null);
    const [pendingFormData, setPendingFormData] = useState(null);

    // Estados de búsqueda y filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroSituacion, setFiltroSituacion] = useState('todos');

    // Estados para filtros avanzados
    const [ordenarPor, setOrdenarPor] = useState('id');
    const [ordenDireccion, setOrdenDireccion] = useState('asc');

    // Estados de paginación
    const [itemsPorPagina, setItemsPorPagina] = useState(10);
    const [paginaActual, setPaginaActual] = useState(1);

    // Recargar datos cuando cambie el filtro de situación
    useEffect(() => {
        fetchData();
    }, [filtroSituacion]);

    // FUNCIÓN fetchData CORREGIDA CON FILTRO
    const fetchData = async () => {
        try {
            setLoading(true);

            // CONSTRUIR URL CON PARÁMETROS
            let url = `/api/v1/${endpoint}`;
            const params = new URLSearchParams();

            // Mapear filtro del frontend al backend
            const filtroBackend = {
                'todos': 'todos',
                'activos': 'activos',
                'inactivos': 'inactivos'
            };

            params.append('filtro_situacion', filtroBackend[filtroSituacion]);

            url += `?${params.toString()}`;

            console.log(`Cargando datos desde: ${url}`);

            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            // Verificar si la respuesta es JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.error('Respuesta no es JSON:', textResponse);
                throw new Error('El servidor no está respondiendo correctamente. Verifique que el backend esté funcionando.');
            }

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('Datos recibidos:', result);

            setData(result.data || []);
            setError(null);

            console.log(`Datos cargados: ${result.data?.length || 0} registros`);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message);
            Notifications.error(
                'No se pudieron cargar los datos. Verifique su conexión e intente nuevamente.',
                'Error de Conexión'
            );
        } finally {
            setLoading(false);
        }
    };

    const filteredData = data.filter(item => {
        // Filtro de búsqueda por columna específica
        const matchesSearch = campos.some(campo =>
            item[campo.key] &&
            item[campo.key].toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

        const matchesSituacion = filtroSituacion === 'todos' ||
            (filtroSituacion === 'activos' && (item.situacion === 1 || item.situacion === true)) ||
            (filtroSituacion === 'inactivos' && (item.situacion === 0 || item.situacion === false));

        return matchesSearch && matchesSituacion;
    }).sort((a, b) => {
        // Función de ordenamiento inteligente
        const getValueForSort = (item, field) => {
            let value = item[field];
            if (value === null || value === undefined) return '';
            return value.toString();
        };

        const aValue = getValueForSort(a, ordenarPor);
        const bValue = getValueForSort(b, ordenarPor);

        // Detectar si son números
        const aIsNum = !isNaN(aValue) && !isNaN(parseFloat(aValue));
        const bIsNum = !isNaN(bValue) && !isNaN(parseFloat(bValue));

        let comparison = 0;

        if (aIsNum && bIsNum) {
            // Comparación numérica
            comparison = parseFloat(aValue) - parseFloat(bValue);
        } else {
            // Comparación de texto
            comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
        }

        return ordenDireccion === 'asc' ? comparison : -comparison;
    });

    // Calcular paginación
    const totalItems = filteredData.length;
    const totalPaginas = Math.ceil(totalItems / itemsPorPagina);
    const indexInicio = (paginaActual - 1) * itemsPorPagina;
    const indexFin = indexInicio + itemsPorPagina;
    const dataPaginada = filteredData.slice(indexInicio, indexFin);

    // Handlers para acciones
    const handleCreate = () => {
        setSelectedItem(null);
        setModalMode('create');
        setShowModal(true);
    };

    const handleEdit = (item) => {
        setSelectedItem(item);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleView = (item) => {
        setSelectedItem(item);
        setModalMode('view');
        setShowModal(true);
    };

    // FUNCIÓN DELETE - ELIMINACIÓN COMPLETA (SOFT DELETE)
    const handleDelete = async (item) => {
        const itemName = item.nombre || item.codigo || item.nombre_estado || item.nombre_forma || item.nombre_tipo || item.nombre_pais || 'este registro';

        // Usar iziToast para confirmación
        Notifications.confirm(
            `¿Está seguro de eliminar "${itemName}"? Esta acción NO se puede deshacer.`,
            async () => {
                // Mostrar loading
                Notifications.loading('Eliminando registro...', 'Procesando');

                try {
                    const response = await fetch(`/api/v1/${endpoint}/${item.id}`, {
                        method: 'DELETE'
                    });

                    // MÉTODO BRUTAL PARA QUITAR LOADING
                    Notifications.hideLoading();
                    Notifications.clear();
                    await new Promise(resolve => setTimeout(resolve, 100));

                    if (!response.ok) {
                        const errorData = await response.json();

                        // MANEJAR ERROR DE INTEGRIDAD REFERENCIAL CON UBICACIONES ESPECÍFICAS
                        if (response.status === 400) {
                            let specificMessage = `No se puede eliminar "${itemName}" porque está siendo utilizado en:\n\n`;

                            // Mensajes específicos por tipo de catálogo
                            switch (endpoint) {
                                case 'estados-reserva':
                                    specificMessage += `• Reservas que están en este estado\n`;
                                    specificMessage += `• Configuraciones del sistema\n\n`;
                                    specificMessage += `Para eliminarlo:\n`;
                                    specificMessage += `1. Vaya a "Reservas" y cambie todas las reservas con este estado\n`;
                                    specificMessage += `2. Luego regrese aquí para eliminar el estado`;
                                    break;

                                case 'formas-pago':
                                    specificMessage += `• Ventas que usaron esta forma de pago\n`;
                                    specificMessage += `• Pagos registrados en el sistema\n\n`;
                                    specificMessage += `Para eliminarlo:\n`;
                                    specificMessage += `1. Vaya a "Ventas" y revise los pagos que usan esta forma\n`;
                                    specificMessage += `2. Cambie o elimine esos registros primero`;
                                    break;

                                case 'tipos-cliente':
                                    specificMessage += `• Clientes registrados con este tipo\n`;
                                    specificMessage += `• Agencias clasificadas con este tipo\n\n`;
                                    specificMessage += `Para eliminarlo:\n`;
                                    specificMessage += `1. Vaya a "Clientes" y cambie el tipo de todos los clientes\n`;
                                    specificMessage += `2. Luego regrese aquí para eliminar este tipo`;
                                    break;

                                case 'paises':
                                    specificMessage += `• Clientes de este país\n`;
                                    specificMessage += `• Empleados de este país\n`;
                                    specificMessage += `• Agencias ubicadas en este país\n\n`;
                                    specificMessage += `Para eliminarlo:\n`;
                                    specificMessage += `1. Revise "Clientes", "Empleados" y "Agencias"\n`;
                                    specificMessage += `2. Cambie todos los registros a otro país`;
                                    break;

                                default:
                                    specificMessage += `• Otros registros del sistema\n\n`;
                                    specificMessage += `Para eliminarlo:\n`;
                                    specificMessage += `1. Identifique dónde se está usando este registro\n`;
                                    specificMessage += `2. Cambie o elimine esos registros primero`;
                            }

                            Notifications.warning(
                                specificMessage,
                                `${itemName} está en uso`
                            );
                            return;
                        }

                        throw new Error(errorData.message || 'Error al eliminar el registro');
                    }

                    await fetchData(); // Recargar datos

                    Notifications.success(
                        `El registro "${itemName}" ha sido eliminado exitosamente`,
                        'Registro Eliminado'
                    );
                } catch (err) {
                    // DOBLE BRUTAL EN CASO DE ERROR
                    Notifications.hideLoading();
                    Notifications.clear();

                    console.error('Error deleting:', err);
                    Notifications.error(err.message, 'Error al Eliminar');
                }
            },
            () => {
                // Si cancela
                Notifications.info('Operación cancelada', 'Cancelado');
            },
            'Confirmar Eliminación'
        );
    };

    // FUNCIÓN TOGGLE STATUS CORREGIDA - REEMPLAZAR EN CatalogoBase.js
    const handleToggleStatus = async (item) => {
        const itemName = item.nombre || item.codigo || item.nombre_estado || item.nombre_forma || item.nombre_tipo || item.nombre_pais || 'este registro';
        const isActive = Boolean(item.situacion) && (item.situacion === 1 || item.situacion === true);

        const action = isActive ? 'desactivar' : 'reactivar';
        const confirmMessage = isActive ?
            `¿Está seguro de DESACTIVAR "${itemName}"? El registro pasará a estado inactivo.` :
            `¿Está seguro de REACTIVAR "${itemName}"? El registro volverá a estar disponible.`;

        // Confirmación con iziToast
        if (typeof window.iziToast !== 'undefined') {
            const titleText = isActive ? 'Confirmar Desactivación' : 'Confirmar Reactivación';
            const buttonText = isActive ? 'Desactivar' : 'Reactivar';
            const buttonColor = isActive ? '#dc2626' : '#059669';

            window.iziToast.question({
                timeout: false,
                close: false,
                overlay: true,
                displayMode: 'once',
                id: 'toggle-status-confirm',
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
            // Fallback si no hay iziToast
            if (confirm(confirmMessage)) {
                await executeToggleAction();
            }
        }

        // FUNCIÓN INTERNA PARA EJECUTAR EL TOGGLE
        async function executeToggleAction() {
            console.log('=== EJECUTANDO TOGGLE ===');
            console.log('Enviando petición para item ID:', item.id);
            console.log('Endpoint:', `/api/v1/${endpoint}/${item.id}/toggle-status`);

            Notifications.loading(`${action.charAt(0).toUpperCase() + action.slice(1)}ando registro...`, 'Procesando');

            try {
                const response = await fetch(`/api/v1/${endpoint}/${item.id}/toggle-status`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                    // SIN BODY - El backend maneja el toggle automáticamente
                });

                console.log('Response status:', response.status);
                console.log('Response headers:', [...response.headers.entries()]);

                Notifications.hideLoading();
                Notifications.clear();
                await new Promise(resolve => setTimeout(resolve, 100));

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error response:', errorData);
                    throw new Error(errorData.message || `Error al ${action} el registro`);
                }

                // OBTENER RESPUESTA DEL BACKEND
                const responseData = await response.json();
                console.log('Response data completa:', responseData);

                const nuevoEstado = responseData.data?.situacion;
                console.log('Nuevo estado del registro:', nuevoEstado);

                // RECARGAR DATOS
                await fetchData();

                // NOTIFICACIÓN BASADA EN EL NUEVO ESTADO
                const estadoTexto = nuevoEstado ? 'reactivado' : 'desactivado';
                const estadoTitulo = nuevoEstado ? 'Reactivado' : 'Desactivado';

                Notifications.success(
                    `El registro "${itemName}" ha sido ${estadoTexto} correctamente`,
                    `Registro ${estadoTitulo}`
                );

                console.log('=== TOGGLE COMPLETADO ===');
            } catch (err) {
                Notifications.hideLoading();
                Notifications.clear();
                console.error(`Error en toggle:`, err);
                Notifications.error(err.message, `Error al ${action.charAt(0).toUpperCase() + action.slice(1)}`);
            }
        }
    };

    // FUNCIÓN SAVE CON DETECCIÓN DE DUPLICADOS
    const handleSave = async (formData) => {
        // Mostrar loading
        Notifications.loading(
            modalMode === 'create' ? 'Creando registro...' : 'Actualizando registro...',
            'Guardando'
        );

        try {
            const url = modalMode === 'create'
                ? `/api/v1/${endpoint}`
                : `/api/v1/${endpoint}/${selectedItem.id}`;

            const method = modalMode === 'create' ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(formData)
            });

            // Ocultar loading
            Notifications.hideLoading();
            Notifications.clear();
            await new Promise(resolve => setTimeout(resolve, 100));

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`Error ${response.status}: El servidor no respondió correctamente`);
            }

            if (!response.ok) {
                const errorData = await response.json();

                // NUEVA DETECCIÓN: REGISTRO INACTIVO ENCONTRADO
                if (response.status === 422 && errorData.duplicate_inactive) {
                    // Guardar datos para el modal
                    setDuplicateData(errorData.inactive_record);
                    setPendingFormData(formData);
                    setShowDuplicateModal(true);
                    return;
                }

                // Manejo normal de errores de validación
                if (response.status === 422 && errorData.errors) {
                    const errorMessages = Object.values(errorData.errors).flat();
                    Notifications.warning(
                        errorMessages.join('\n'),
                        'Errores de Validación'
                    );
                } else {
                    throw new Error(errorData.message || `Error ${response.status} al guardar`);
                }
                return;
            }

            // ÉXITO - Procesar respuesta
            const responseData = await response.json();
            setShowModal(false);
            await fetchData();

            // Notificación de éxito
            const itemName = responseData.data?.nombre ||
                responseData.data?.codigo ||
                responseData.data?.nombre_estado ||
                responseData.data?.nombre_forma ||
                responseData.data?.nombre_tipo ||
                responseData.data?.nombre_pais ||
                'el registro';

            if (modalMode === 'create') {
                Notifications.success(
                    `El registro "${itemName}" ha sido creado exitosamente`,
                    'Registro Creado'
                );
            } else {
                Notifications.success(
                    `El registro "${itemName}" ha sido actualizado exitosamente`,
                    'Registro Actualizado'
                );
            }
        } catch (err) {
            // Manejo de errores generales
            Notifications.hideLoading();
            Notifications.clear();
            Notifications.error(err.message, 'Error al Guardar');
        }
    };

    // FUNCIONES PARA EL MODAL DE DUPLICADOS
    const handleReactivate = async () => {
        if (!duplicateData || !pendingFormData) return;

        try {
            // USAR EL ENDPOINT DE REACTIVATE
            const response = await fetch(`/api/v1/${endpoint}/${duplicateData.id}/reactivate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(pendingFormData)
            });

            if (response.ok) {
                setShowModal(false);
                setShowDuplicateModal(false);
                await fetchData();

                Notifications.success(
                    `El registro "${duplicateData.value}" ha sido reactivado y actualizado exitosamente`,
                    'Registro Reactivado'
                );
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Error al reactivar');
            }
        } catch (err) {
            Notifications.error(err.message, 'Error al Reactivar');
        }
    };

    const handleCreateNew = () => {
        setShowDuplicateModal(false);
        // Mantener modal abierto para que usuario cambie código
        Notifications.info(
            `Puede cambiar el código e intentar crear un registro nuevo`,
            'Modifique el Código'
        );
    };

    const handleCancelDuplicate = () => {
        setShowDuplicateModal(false);
        setDuplicateData(null);
        setPendingFormData(null);
    };

    return e('div', {
        style: {
            padding: '2rem',
            maxWidth: '1200px',
            margin: '0 auto'
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
            e('div', {
                key: 'title-section',
                style: { display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '9rem' }
            }, [
                e('div', {
                    key: 'icon-container',
                    style: {
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#f0f4ff',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }
                }, icono || Icons.calendar()),
                e('div', { key: 'title-text-container' }, [
                    e('h1', {
                        key: 'main-title',
                        style: {
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#1f2937',
                            margin: '0'
                        }
                    }, titulo),
                    descripcion && e('p', {
                        key: 'main-description',
                        style: {
                            color: '#6b7280',
                            margin: '0.25rem 0 0 0'
                        }
                    }, descripcion)
                ])
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
                e('span', { key: 'btn-text' }, 'Nuevo Registro')
            ])
        ]),

        // Controles de búsqueda y filtros
        e('div', {
            key: 'controls',
            style: {
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                alignItems: 'center'
            }
        }, [
            // Campo de búsqueda
            e('div', {
                key: 'search-container',
                style: { position: 'relative', flex: '1', maxWidth: '400px' }
            }, [
                e('input', {
                    key: 'search-input',
                    type: 'text',
                    placeholder: 'Buscar registros...',
                    value: searchTerm,
                    onChange: (e) => setSearchTerm(e.target.value),
                    style: {
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'border-color 0.2s'
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
            ]),

            // Filtro de situación
            e('select', {
                key: 'filter-situacion',
                value: filtroSituacion,
                onChange: (e) => setFiltroSituacion(e.target.value),
                style: {
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                }
            }, [
                e('option', { key: 'option-todos', value: 'todos' }, 'Todos los registros'),
                e('option', { key: 'option-activos', value: 'activos' }, 'Solo activos'),
                e('option', { key: 'option-inactivos', value: 'inactivos' }, 'Solo inactivos')
            ]),
            // Label y Ordenar por
            e('div', {
                key: 'ordenar-por-container',
                style: { display: 'flex', flexDirection: 'column', gap: '0.25rem' }
            }, [
                e('label', {
                    key: 'ordenar-por-label',
                    style: {
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        color: '#6b7280'
                    }
                }, 'Ordenar por:'),
                e('select', {
                    key: 'ordenar-por',
                    value: ordenarPor,
                    onChange: (e) => setOrdenarPor(e.target.value),
                    style: {
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        minWidth: '140px'
                    }
                }, [
                    e('option', { key: 'ordenar-id', value: 'id' }, 'ID'),
                    ...campos.map(campo =>
                        e('option', {
                            key: `orden-${campo.key}`,
                            value: campo.key
                        }, campo.label)
                    ),
                    e('option', { key: 'ordenar-created', value: 'created_at' }, 'Fecha creación'),
                    e('option', { key: 'ordenar-updated', value: 'updated_at' }, 'Fecha modificación')
                ])
            ]),

            // Label y Dirección de orden
            e('div', {
                key: 'toggle-direccion-container',
                style: { display: 'flex', flexDirection: 'column', gap: '0.25rem' }
            }, [
                e('label', {
                    key: 'toggle-direccion-label',
                    style: {
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        color: '#6b7280'
                    }
                }, 'Dirección:'),
                e('button', {
                    key: 'toggle-direccion',
                    onClick: () => setOrdenDireccion(prev => prev === 'asc' ? 'desc' : 'asc'),
                    style: {
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem'
                    },
                    title: ordenDireccion === 'asc' ? 'Orden Ascendente' : 'Orden Descendente'
                }, [
                    e('span', { key: 'arrow-icon' }, ordenDireccion === 'asc' ? '↑' : '↓'),
                    e('span', { key: 'direction-text' }, ordenDireccion === 'asc' ? 'A→Z' : 'Z→A')
                ])
            ])
        ]),

        // Tabla de datos
        e(CatalogoTable, {
            key: 'data-table',
            data: dataPaginada,
            campos,
            loading,
            error,
            onEdit: handleEdit,
            onView: handleView,
            onToggleStatus: handleToggleStatus
        }),

        // Modal para crear/editar
        showModal && e(CatalogoModal, {
            key: 'crud-modal',
            isOpen: showModal,
            mode: modalMode,
            item: selectedItem,
            campos,
            validaciones,
            titulo: modalMode === 'create' ? `Crear ${titulo}` :
                modalMode === 'edit' ? `Editar ${titulo}` : `Ver ${titulo}`,
            onClose: () => setShowModal(false),
            onSave: handleSave
        }),

        // Controles de paginación
        e('div', {
            key: 'pagination-controls',
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
            }
        }, [
            // Selector de items por página
            e('div', {
                key: 'items-per-page',
                style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }
            }, [
                e('span', {
                    key: 'items-label',
                    style: { fontSize: '0.875rem', color: '#64748b' }
                }, 'Mostrar:'),
                e('select', {
                    key: 'items-select',
                    value: itemsPorPagina,
                    onChange: (e) => {
                        setItemsPorPagina(Number(e.target.value));
                        setPaginaActual(1);
                    },
                    style: {
                        padding: '0.25rem 0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                    }
                }, [
                    e('option', { key: 'opt-5', value: 5 }, '5'),
                    e('option', { key: 'opt-10', value: 10 }, '10'),
                    e('option', { key: 'opt-20', value: 20 }, '20'),
                    e('option', { key: 'opt-50', value: 50 }, '50'),
                    e('option', { key: 'opt-100', value: 100 }, '100')
                ])
            ]),

            // Info de paginación
            e('div', {
                key: 'pagination-info',
                style: { fontSize: '0.875rem', color: '#64748b' }
            }, `Mostrando ${indexInicio + 1}-${Math.min(indexFin, totalItems)} de ${totalItems} registros`),

            // Botones de navegación
            e('div', {
                key: 'pagination-buttons',
                style: { display: 'flex', gap: '0.5rem' }
            }, [
                e('button', {
                    key: 'btn-prev',
                    onClick: () => setPaginaActual(prev => Math.max(1, prev - 1)),
                    disabled: paginaActual === 1,
                    style: {
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: paginaActual === 1 ? '#f3f4f6' : 'white',
                        cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem'
                    }
                }, '← Anterior'),

                e('span', {
                    key: 'page-info',
                    style: {
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        color: '#374151'
                    }
                }, `${paginaActual} de ${totalPaginas}`),

                e('button', {
                    key: 'btn-next',
                    onClick: () => setPaginaActual(prev => Math.min(totalPaginas, prev + 1)),
                    disabled: paginaActual === totalPaginas,
                    style: {
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: paginaActual === totalPaginas ? '#f3f4f6' : 'white',
                        cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem'
                    }
                }, 'Siguiente →')
            ])
        ]),

        // Modal para duplicados inactivos
        showDuplicateModal && e(DuplicateModal, {
            key: 'duplicate-modal',
            isOpen: showDuplicateModal,
            inactiveRecord: duplicateData,
            newData: pendingFormData,
            onReactivate: handleReactivate,
            onCreateNew: handleCreateNew,
            onCancel: handleCancelDuplicate
        })
    ]);
}

export default CatalogoBase;
