// src/resources/js/components/configuracion/RutasServicios.js
import React from 'react';
import RutasServiciosList from './RutasServiciosList';
import RutasServiciosModal from './RutasServiciosModal';
import DuplicateModal from '../catalogos/common/DuplicateModal';
import Icons from '../../utils/Icons';
import Notifications from '../../utils/notifications';

const { createElement: e, useState, useEffect } = React;

function RutasServicios() {
    // Estados principales
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados del modal
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedRuta, setSelectedRuta] = useState(null);

    // Estados del modal de duplicados
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [duplicateData, setDuplicateData] = useState(null);
    const [pendingFormData, setPendingFormData] = useState(null);

    // Estados de búsqueda y filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroTipoServicio, setFiltroTipoServicio] = useState('todos');
    const [filtroSituacion, setFiltroSituacion] = useState('todos'); // Filtro activos/inactivos
    const [filtroColumna, setFiltroColumna] = useState('todos'); // Filtrar por columna
    const [valorFiltroColumna, setValorFiltroColumna] = useState(''); // Valor del filtro
    const [filtroOrigen, setFiltroOrigen] = useState('');
    const [filtroDestino, setFiltroDestino] = useState('');

    // Estados de ordenamiento
    const [ordenarPor, setOrdenarPor] = useState('id');
    const [ordenDireccion, setOrdenDireccion] = useState('asc');

    // Estados de paginación
    const [itemsPorPagina, setItemsPorPagina] = useState(10);
    const [paginaActual, setPaginaActual] = useState(1);

    // Cargar datos iniciales
    useEffect(() => {
        fetchData();
    }, []); // Solo cargar al inicio

    // Función para obtener datos de rutas - CORREGIDA
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Construir URL con parámetros - INCLUYENDO filtro de situación
            const params = new URLSearchParams();

            // Enviar filtros que el backend debe manejar
            if (searchTerm.trim()) {
                params.append('buscar', searchTerm.trim());
            }

            if (filtroTipoServicio !== 'todos') {
                params.append('tipo_servicio', filtroTipoServicio);
            }

            // AGREGAR filtro de situación para que el backend traiga inactivos
            if (filtroSituacion !== 'todos') {
                params.append('filtro_situacion', filtroSituacion);
            } else {
                // Si es "todos", pedimos explícitamente que traiga activos e inactivos
                params.append('incluir_inactivos', 'true');
            }

            if (filtroOrigen.trim() && filtroDestino.trim()) {
                params.append('origen', filtroOrigen.trim());
                params.append('destino', filtroDestino.trim());
            }

            const url = `/api/v1/rutas${params.toString() ? '?' + params.toString() : ''}`;

            console.log(`Cargando rutas desde: ${url}`);

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
            console.log('Rutas cargadas:', result);

            // Manejar respuesta paginada o simple array
            if (result.data && Array.isArray(result.data)) {
                setData(result.data);
            } else if (Array.isArray(result)) {
                setData(result);
            } else {
                setData([]);
            }

        } catch (err) {
            console.error('Error al cargar rutas:', err);
            setError(err.message);
            Notifications.error('Error al cargar las rutas: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handlers para el modal
    const handleCreate = () => {
        setSelectedRuta(null);
        setModalMode('create');
        setShowModal(true);
    };

    const handleEdit = (ruta) => {
        setSelectedRuta(ruta);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleView = (ruta) => {
        setSelectedRuta(ruta);
        setModalMode('view');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedRuta(null);
    };

    // Función save con detección de duplicados
    const handleSave = async (formData) => {
        Notifications.loading(
            modalMode === 'create' ? 'Creando ruta...' : 'Actualizando ruta...',
            'Guardando'
        );

        try {
            const url = modalMode === 'create' ? '/api/v1/rutas' : `/api/v1/rutas/${selectedRuta.id}`;
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

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`Error ${response.status}: El servidor no respondió correctamente`);
            }

            if (!response.ok) {
                const errorData = await response.json();

                // Detección de registro inactivo encontrado
                if (response.status === 422 && errorData.duplicate_inactive) {
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
                    throw new Error(errorData.message || `Error ${response.status}`);
                }
                return;
            }

            const result = await response.json();
            const rutaName = result.data?.nombre_ruta || result.data?.codigo_ruta || 'la ruta';

            if (modalMode === 'create') {
                Notifications.success(`Ruta "${rutaName}" creada correctamente`);
            } else {
                Notifications.success(`Ruta "${rutaName}" actualizada correctamente`);
            }

            handleCloseModal();
            await fetchData();

        } catch (err) {
            Notifications.hideLoading();
            Notifications.clear();
            console.error('Error al guardar ruta:', err);
            Notifications.error('Error al guardar: ' + err.message);
            throw err;
        }
    };

    // Handler para cambiar estado de ruta con confirmación
    const handleToggleStatus = async (ruta) => {
        const rutaName = ruta.nombre_ruta || ruta.codigo_ruta || 'esta ruta';
        const isActive = Boolean(ruta.situacion) && (ruta.situacion === 1 || ruta.situacion === true);

        const action = isActive ? 'desactivar' : 'reactivar';
        const confirmMessage = isActive ?
            `¿Está seguro de DESACTIVAR "${rutaName}"? La ruta pasará a estado inactivo y no estará disponible para nuevas reservas.` :
            `¿Está seguro de REACTIVAR "${rutaName}"? La ruta volverá a estar disponible para reservas.`;

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
                id: 'toggle-ruta-confirm',
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
                const response = await fetch(`/api/v1/rutas/${ruta.id}/toggle-status`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    // Fallback a método original
                    const fallbackResponse = await fetch(`/api/v1/rutas/${ruta.id}`, {
                        method: 'PUT',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            situacion: !ruta.situacion
                        })
                    });

                    if (!fallbackResponse.ok) {
                        const errorData = await fallbackResponse.json();
                        throw new Error(errorData.message || 'Error al cambiar estado');
                    }
                }

                Notifications.success(`Ruta "${rutaName}" ${isActive ? 'desactivada' : 'reactivada'} correctamente`);
                await fetchData();

            } catch (err) {
                console.error('Error al cambiar estado:', err);
                Notifications.error('Error al cambiar estado: ' + err.message);
            }
        }
    };

    // Handler para eliminar ruta con confirmación
    const handleDelete = async (ruta) => {
        const rutaName = ruta.nombre_ruta || ruta.codigo_ruta || 'esta ruta';

        if (typeof window.iziToast !== 'undefined') {
            window.iziToast.question({
                timeout: false,
                close: false,
                overlay: true,
                displayMode: 'once',
                id: 'delete-ruta-confirm',
                zindex: 9999,
                title: 'Confirmar Eliminación',
                message: `¿Está seguro de eliminar la ruta "${rutaName}"? Esta acción NO se puede deshacer.`,
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
            if (confirm(`¿Está seguro de eliminar la ruta "${rutaName}"?`)) {
                await executeDeleteAction();
            }
        }

        async function executeDeleteAction() {
            try {
                const response = await fetch(`/api/v1/rutas/${ruta.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al eliminar');
                }

                Notifications.success(`Ruta "${rutaName}" eliminada correctamente`);
                await fetchData();

            } catch (err) {
                console.error('Error al eliminar ruta:', err);
                Notifications.error('Error al eliminar: ' + err.message);
            }
        }
    };

    // Funciones para el modal de duplicados
    const handleReactivate = async () => {
        if (!duplicateData || !pendingFormData) return;

        try {
            const response = await fetch(`/api/v1/rutas/${duplicateData.id}/reactivate`, {
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
                    `La ruta "${duplicateData.value}" ha sido reactivada y actualizada exitosamente`,
                    'Ruta Reactivada'
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
        Notifications.info(
            'Puede cambiar el código de ruta e intentar crear un registro nuevo',
            'Modifique el Código'
        );
    };

    const handleCancelDuplicate = () => {
        setShowDuplicateModal(false);
        setDuplicateData(null);
        setPendingFormData(null);
    };

    // Función para obtener valor de campo anidado
    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : '';
        }, obj);
    };

    // FILTRADO Y ORDENAMIENTO CORREGIDO - TODO EN FRONTEND
    const datosFiltrados = data.filter(ruta => {
        // 1. FILTRO GENERAL DE BÚSQUEDA
        if (searchTerm.trim()) {
            const termino = searchTerm.toLowerCase();
            const cumpleBusqueda = (
                ruta.codigo_ruta?.toLowerCase().includes(termino) ||
                ruta.nombre_ruta?.toLowerCase().includes(termino) ||
                ruta.origen_destino?.ciudad_origen?.toLowerCase().includes(termino) ||
                ruta.origen_destino?.ciudad_destino?.toLowerCase().includes(termino)
            );
            if (!cumpleBusqueda) return false;
        }

        // 2. FILTRO POR TIPO DE SERVICIO
        if (filtroTipoServicio !== 'todos' && ruta.tipo_servicio !== filtroTipoServicio) {
            return false;
        }

        // 3. FILTRO POR SITUACIÓN CORREGIDO
        if (filtroSituacion !== 'todos') {
            const estaActivo = Boolean(ruta.situacion) && (ruta.situacion === 1 || ruta.situacion === true);
            if (filtroSituacion === 'activos' && !estaActivo) return false;
            if (filtroSituacion === 'inactivos' && estaActivo) return false;
        }

        // 4. FILTRO POR COLUMNA ESPECÍFICA
        if (filtroColumna !== 'todos' && valorFiltroColumna.trim()) {
            const valorColumna = getNestedValue(ruta, filtroColumna);
            const valorBusqueda = valorFiltroColumna.toLowerCase();

            if (!valorColumna || !valorColumna.toString().toLowerCase().includes(valorBusqueda)) {
                return false;
            }
        }

        return true;
    }).sort((a, b) => {
        // 5. ORDENAMIENTO INTELIGENTE
        const aValue = getNestedValue(a, ordenarPor);
        const bValue = getNestedValue(b, ordenarPor);

        // Detectar si son números
        const aIsNum = !isNaN(aValue) && !isNaN(parseFloat(aValue));
        const bIsNum = !isNaN(bValue) && !isNaN(parseFloat(bValue));

        let comparison = 0;

        if (aIsNum && bIsNum) {
            // Comparación numérica
            comparison = parseFloat(aValue) - parseFloat(bValue);
        } else {
            // Comparación de texto
            const aStr = aValue ? aValue.toString().toLowerCase() : '';
            const bStr = bValue ? bValue.toString().toLowerCase() : '';
            comparison = aStr.localeCompare(bStr);
        }

        return ordenDireccion === 'asc' ? comparison : -comparison;
    });

    // Calcular paginación
    const totalPaginas = Math.ceil(datosFiltrados.length / itemsPorPagina);
    const inicioIndice = (paginaActual - 1) * itemsPorPagina;
    const dataPaginada = datosFiltrados.slice(inicioIndice, inicioIndice + itemsPorPagina);

    // Opciones de columnas para filtrar
    const columnasDisponibles = [
        { value: 'codigo_ruta', label: 'Código de Ruta' },
        { value: 'nombre_ruta', label: 'Nombre de Ruta' },
        { value: 'tipo_servicio', label: 'Tipo de Servicio' },
        { value: 'origen_destino.ciudad_origen', label: 'Ciudad Origen' },
        { value: 'origen_destino.ciudad_destino', label: 'Ciudad Destino' },
        { value: 'horarios.hora_salida', label: 'Hora de Salida' },
        { value: 'precios.precio_adulto', label: 'Precio Adulto' },
        { value: 'capacidad.capacidad_maxima', label: 'Capacidad Máxima' }
    ];

    return e('div', {
        style: {
            padding: '1.5rem',
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
                e('div', {
                    key: 'icon-title',
                    style: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }
                }, [
                    e('div', {
                        key: 'icon-container',
                        style: {
                            padding: '0.5rem',
                            backgroundColor: '#8b5cf6',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'white'
                        }
                    }, Icons.route()),
                    e('h1', {
                        key: 'main-title',
                        style: {
                            fontSize: '1.875rem',
                            fontWeight: '700',
                            color: '#111827',
                            margin: '0'
                        }
                    }, 'Rutas y Servicios')
                ]),
                e('p', {
                    key: 'description',
                    style: {
                        color: '#6b7280',
                        margin: '0'
                    }
                }, 'Configuración de rutas y servicios de transporte')
            ]),
            e('button', {
                key: 'btn-create',
                onClick: handleCreate,
                style: {
                    backgroundColor: '#8b5cf6',
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
                onMouseEnter: (e) => e.target.style.backgroundColor = '#7c3aed',
                onMouseLeave: (e) => e.target.style.backgroundColor = '#8b5cf6'
            }, [
                e('span', { key: 'btn-icon' }, Icons.plus()),
                e('span', { key: 'btn-text' }, 'Nueva Ruta')
            ])
        ]),

        // CONTROLES CONSOLIDADOS
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
            // Primera fila: Búsqueda y filtros principales
            e('div', {
                key: 'main-filters-row',
                style: {
                    display: 'grid',
                    gridTemplateColumns: '2.5fr 1fr 1fr 0.8fr',
                    gap: '1rem',
                    marginBottom: '1rem'
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
                            placeholder: 'Código, nombre, origen, destino...',
                            value: searchTerm,
                            onChange: (e) => {
                                setSearchTerm(e.target.value);
                                // Buscar automáticamente después de 500ms sin cambios
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
                            onFocus: (e) => e.target.style.borderColor = '#8b5cf6',
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

                // Filtro por tipo de servicio
                e('div', { key: 'filter-tipo' }, [
                    e('label', {
                        key: 'tipo-label',
                        style: { fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', display: 'block' }
                    }, 'Tipo de Servicio'),
                    e('select', {
                        key: 'tipo-select',
                        value: filtroTipoServicio,
                        onChange: (e) => {
                            setFiltroTipoServicio(e.target.value);
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
                        e('option', { key: 'tipo-todos', value: 'todos' }, 'Todos'),
                        e('option', { key: 'tipo-shuttle', value: 'shuttle' }, 'Shuttle'),
                        e('option', { key: 'tipo-tour', value: 'tour' }, 'Tour'),
                        e('option', { key: 'tipo-transfer', value: 'transfer' }, 'Transfer'),
                        e('option', { key: 'tipo-privado', value: 'privado' }, 'Privado')
                    ])
                ]),

                // FILTRO SITUACIÓN CORREGIDO
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
                        e('option', { key: 'situacion-activos', value: 'activos' }, 'Solo activos'),
                        e('option', { key: 'situacion-inactivos', value: 'inactivos' }, 'Solo inactivos')
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
            ]),

            // Segunda fila: Filtros avanzados y ordenamiento
            e('div', {
                key: 'advanced-row',
                style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr 1fr 1fr',
                    gap: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #f3f4f6'
                }
            }, [
                // Filtrar por columna
                e('div', { key: 'filter-column' }, [
                    e('label', {
                        key: 'column-label',
                        style: { fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', display: 'block' }
                    }, 'Filtrar por:'),
                    e('select', {
                        key: 'column-select',
                        value: filtroColumna,
                        onChange: (e) => {
                            setFiltroColumna(e.target.value);
                            setValorFiltroColumna(''); // Limpiar valor al cambiar columna
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
                        e('option', { key: 'column-todos', value: 'todos' }, 'Todas las columnas'),
                        ...columnasDisponibles.map(col =>
                            e('option', {
                                key: `column-${col.value}`,
                                value: col.value
                            }, col.label)
                        )
                    ])
                ]),

                // Valor del filtro de columna
                e('div', { key: 'filter-value' }, [
                    e('label', {
                        key: 'value-label',
                        style: { fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', display: 'block' }
                    }, 'Valor a buscar:'),
                    e('input', {
                        key: 'value-input',
                        type: 'text',
                        placeholder: filtroColumna === 'todos' ? 'Seleccione una columna primero' : 'Escriba el valor...',
                        value: valorFiltroColumna,
                        onChange: (e) => setValorFiltroColumna(e.target.value),
                        disabled: filtroColumna === 'todos',
                        style: {
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            outline: 'none',
                            backgroundColor: filtroColumna === 'todos' ? '#f9fafb' : 'white'
                        }
                    })
                ]),

                // Ordenar por
                e('div', { key: 'sort-column' }, [
                    e('label', {
                        key: 'sort-label',
                        style: { fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', display: 'block' }
                    }, 'Ordenar por:'),
                    e('select', {
                        key: 'sort-select',
                        value: ordenarPor,
                        onChange: (e) => setOrdenarPor(e.target.value),
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
                        e('option', { key: 'sort-id', value: 'id' }, 'ID'),
                        ...columnasDisponibles.map(col =>
                            e('option', {
                                key: `sort-${col.value}`,
                                value: col.value
                            }, col.label)
                        ),
                        e('option', { key: 'sort-created', value: 'created_at' }, 'Fecha creación'),
                        e('option', { key: 'sort-updated', value: 'updated_at' }, 'Fecha modificación')
                    ])
                ]),

                // Dirección de orden
                e('div', { key: 'sort-direction' }, [
                    e('label', {
                        key: 'direction-label',
                        style: { fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem', display: 'block' }
                    }, 'Dirección:'),
                    e('button', {
                        key: 'direction-toggle',
                        onClick: () => setOrdenDireccion(prev => prev === 'asc' ? 'desc' : 'asc'),
                        style: {
                            width: '100%',
                            padding: '0.75rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                        },
                        title: ordenDireccion === 'asc' ? 'Orden Ascendente' : 'Orden Descendente'
                    }, [
                        e('span', { key: 'arrow-icon' }, ordenDireccion === 'asc' ? '↑' : '↓'),
                        e('span', { key: 'direction-text' }, ordenDireccion === 'asc' ? 'A→Z' : 'Z→A')
                    ])
                ])
            ])
        ]),

        // Lista de rutas
        e(RutasServiciosList, {
            key: 'rutas-list',
            data: dataPaginada,
            loading,
            error,
            onEdit: handleEdit,
            onView: handleView,
            onToggleStatus: handleToggleStatus,
            onDelete: handleDelete
        }),

        // Información de paginación
        data.length > 0 && e('div', {
            key: 'pagination-info',
            style: {
                textAlign: 'center',
                margin: '1rem 0',
                fontSize: '0.875rem',
                color: '#6b7280'
            }
        }, `Mostrando ${inicioIndice + 1}-${Math.min(inicioIndice + itemsPorPagina, datosFiltrados.length)} de ${datosFiltrados.length} rutas`),

        // Modal para crear/editar/ver rutas
        showModal && e(RutasServiciosModal, {
            key: 'rutas-modal',
            isOpen: showModal,
            mode: modalMode,
            ruta: selectedRuta,
            onClose: handleCloseModal,
            onSave: handleSave
        }),

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

export default RutasServicios;
