// src/resources/js/components/reservaciones/Reservaciones.js
import React from 'react';
import Icons from '../../utils/Icons';
import Notifications from '../../utils/notifications';
import ReservaModal from './ReservaModal';
import ReservaCard from './ReservaCard';
import DateSelectionModal from '../common/DateSelectionModal';

const { createElement: e, useState, useEffect } = React;

function Reservaciones() {
    // Estados principales
    const [loading, setLoading] = useState(false);
    const [reservas, setReservas] = useState([]);
    const [filtroRapido, setFiltroRapido] = useState(null);

    // Estados del modal
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

    // Estados para estadísticas dinámicas
    const [estadisticas, setEstadisticas] = useState({
        pendientes: 0,
        confirmadas: 0,
        en_ejecucion: 0,
        finalizadas: 0
    });
    const [loadingEstadisticas, setLoadingEstadisticas] = useState(true);

    // Estados para filtros avanzados
    const [filtros, setFiltros] = useState({
        searchPasajero: '',
        fechaDesde: '',
        fechaHasta: '',
        ordenPor: 'fecha_viaje', // fecha_viaje, nombre_pasajero, numero_reserva
        ordenDireccion: 'desc', // asc, desc
        rutaId: '',
        empleadoId: ''
    });

    // Catálogos para filtros
    const [rutas, setRutas] = useState([]);
    const [empleados, setEmpleados] = useState([]);

    // Estados dinámicos desde la base de datos
    const [estadosReserva, setEstadosReserva] = useState([]);

    // Estados para modales de fecha
    const [showDateModal, setShowDateModal] = useState(false);
    const [dateModalConfig, setDateModalConfig] = useState({
        title: '',
        description: '',
        confirmText: '',
        confirmColor: '',
        icon: null,
        action: null
    });

    useEffect(() => {
        cargarDatos();
        cargarCatalogos();
    }, []);

    // Recargar reservas cuando cambian los filtros
    useEffect(() => {
        cargarReservas();
    }, [filtros, filtroRapido]);

    const cargarDatos = async () => {
        await Promise.all([
            cargarEstadisticas(),
            cargarReservas()
        ]);
    };

    // Cargar estados de reserva desde el backend
    const cargarCatalogos = async () => {
        try {
            const [rutasRes, empleadosRes, estadosRes] = await Promise.all([
                fetch('/api/v1/rutas?activas=1'),
                fetch('/api/v1/empleados?activos=1'),
                fetch('/api/v1/estados-reserva')
            ]);

            setRutas((await rutasRes.json()).data || []);
            setEmpleados((await empleadosRes.json()).data || []);
            setEstadosReserva((await estadosRes.json()).data || []);
        } catch (error) {
            console.error('Error cargando catálogos:', error);
        }
    };

    const cargarEstadisticas = async () => {
        setLoadingEstadisticas(true);
        try {
            const response = await fetch('/api/v1/reservas/estadisticas');
            if (!response.ok) {
                throw new Error('Error al cargar estadísticas');
            }
            const data = await response.json();

            if (data.success) {
                setEstadisticas(data.data);
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            Notifications.error('Error al cargar estadísticas', 'Error');
        } finally {
            setLoadingEstadisticas(false);
        }
    };

    const cargarReservas = async () => {
        setLoading(true);
        try {
            // Construir parámetros de consulta
            const params = new URLSearchParams();
            // Filtros avanzados
            if (filtros.searchPasajero) params.append('buscar', filtros.searchPasajero);
            if (filtros.fechaDesde) params.append('fecha_inicio', filtros.fechaDesde);
            if (filtros.fechaHasta) params.append('fecha_fin', filtros.fechaHasta);
            if (filtros.rutaId) params.append('ruta_id', filtros.rutaId);
            if (filtros.empleadoId) params.append('empleado_id', filtros.empleadoId);

            // Ordenamiento
            params.append('order_by', filtros.ordenPor);
            params.append('order_dir', filtros.ordenDireccion);

            // Filtro rápido por estado (ahora usa ID numérico)
            if (filtroRapido) params.append('estado_reserva_id', filtroRapido);

            const response = await fetch(`/api/v1/reservas?${params.toString()}`);
            if (!response.ok) {
                throw new Error('Error al cargar reservas');
            }
            const data = await response.json();
            setReservas(data.data || []);
        } catch (error) {
            console.error('Error cargando reservas:', error);
            Notifications.error('Error al cargar las reservas', 'Error');
        } finally {
            setLoading(false);
        }
    };

    // Handler para cambios en filtros avanzados
    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    // Limpiar todos los filtros
    const limpiarFiltros = () => {
        setFiltros({
            searchPasajero: '',
            fechaDesde: '',
            fechaHasta: '',
            ordenPor: 'fecha_viaje',
            ordenDireccion: 'desc',
            rutaId: '',
            empleadoId: ''
        });
        setFiltroRapido(null);
    };

    // Contar filtros activos
    const getFiltrosActivos = () => {
        let count = 0;
        if (filtros.searchPasajero) count++;
        if (filtros.fechaDesde) count++;
        if (filtros.fechaHasta) count++;
        if (filtros.rutaId) count++;
        if (filtros.empleadoId) count++;
        if (filtroRapido) count++;
        return count;
    };

    // Función para obtener color por código de estado
    const getColorForEstado = (codigo) => {
        const colores = {
            'PEND': '#f59e0b', // Amarillo
            'CONF': '#10b981', // Verde
            'EJEC': '#3b82f6', // Azul
            'FINA': '#6b7280', // Gris
            'CANC': '#ef4444'  // Rojo
        };
        return colores[codigo] || '#6b7280';
    };

    // Generar filtros rápidos dinámicamente con orden específico
    const getFiltrosRapidos = () => {
        const ordenEstados = ['PEND', 'CONF', 'EJEC', 'FINA'];
        const estadosOrdenados = [];

        // Primero agregar "Todas"
        estadosOrdenados.push({ id: null, label: 'Todas', color: '#6b7280' });

        // Luego agregar en el orden específico
        ordenEstados.forEach(codigo => {
            const estado = estadosReserva.find(e => e.codigo === codigo);
            if (estado) {
                estadosOrdenados.push({
                    id: estado.id,
                    label: estado.nombre_estado,
                    color: getColorForEstado(estado.codigo)
                });
            }
        });

        return estadosOrdenados;
    };

    // Crear las tarjetas de estadísticas dinámicamente
    const crearTarjetasEstadisticas = () => {
        return [
            {
                id: 'pendientes',
                titulo: 'Reservas Pendientes',
                valor: estadisticas.pendientes?.toString() || '0',
                icono: Icons.clock(),
                color: '#f59e0b',
                descripcion: 'Esperando confirmación'
            },
            {
                id: 'confirmadas',
                titulo: 'Confirmadas',
                valor: estadisticas.confirmadas?.toString() || '0',
                icono: Icons.checkCircle(),
                color: '#10b981',
                descripcion: 'Listas para ejecutar'
            },
            {
                id: 'ejecucion',
                titulo: 'En Ejecución',
                valor: estadisticas.en_ejecucion?.toString() || '0',
                icono: Icons.truck(),
                color: '#3b82f6',
                descripcion: 'Viajes activos'
            },
            {
                id: 'finalizadas',
                titulo: 'Finalizadas',
                valor: estadisticas.finalizadas?.toString() || '0',
                icono: Icons.check(),
                color: '#6b7280',
                descripcion: 'Completadas'
            }
        ];
    };

    // FUNCIONES DEL MODAL
    const handleNuevaReserva = () => {
        setReservaSeleccionada(null);
        setModalMode('create');
        setShowModal(true);
    };

    const handleEditarReserva = (reserva) => {
        setReservaSeleccionada(reserva);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleVerReserva = (reserva) => {
        setReservaSeleccionada(reserva);
        setModalMode('view');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setReservaSeleccionada(null);
        setModalMode('create');
    };

    const handleSaveReserva = (nuevaReserva) => {
        // Recargar datos después de guardar
        cargarDatos();

        // Mostrar notificación de éxito
        if (modalMode === 'create') {
            Notifications.success('Reserva creada exitosamente', 'Éxito');
        } else {
            Notifications.success('Reserva actualizada exitosamente', 'Éxito');
        }
    };

    // FUNCIONES PARA CAMBIOS DE ESTADO
    const handleConfirmarReserva = async (reserva) => {
        try {
            const response = await fetch(`/api/v1/reservas/${reserva.id}/confirmar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al confirmar reserva');
            }

            Notifications.success('Reserva confirmada exitosamente', 'Éxito');
            cargarDatos();
        } catch (error) {
            console.error('Error confirmando reserva:', error);
            Notifications.error('Error al confirmar reserva', 'Error');
        }
    };

    const handleEjecutarReserva = async (reserva) => {
        try {
            const response = await fetch(`/api/v1/reservas/${reserva.id}/ejecutar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al ejecutar reserva');
            }

            Notifications.success('Reserva ejecutada exitosamente', 'Éxito');
            cargarDatos();
        } catch (error) {
            console.error('Error ejecutando reserva:', error);
            Notifications.error('Error al ejecutar reserva', 'Error');
        }
    };

    const handleFinalizarReserva = async (reserva) => {
        try {
            const response = await fetch(`/api/v1/reservas/${reserva.id}/finalizar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al finalizar reserva');
            }

            Notifications.success('Reserva finalizada exitosamente', 'Éxito');
            cargarDatos();
        } catch (error) {
            console.error('Error finalizando reserva:', error);
            Notifications.error('Error al finalizar reserva', 'Error');
        }
    };

    // FUNCIONES PARA GESTIÓN MASIVA POR FECHA
    const handleConfirmarRutasFecha = async () => {
        setDateModalConfig({
            title: 'Confirmar Rutas por Fecha',
            description: 'Se confirmarán todas las reservas pendientes de la fecha seleccionada',
            confirmText: 'Confirmar Rutas',
            confirmColor: '#10b981',
            icon: Icons.checkCircle('#10b981'),
            action: 'confirmar'
        });
        setShowDateModal(true);
    };

    const handleEjecutarRutasFecha = async () => {
        setDateModalConfig({
            title: 'Ejecutar Rutas por Fecha',
            description: 'Se ejecutarán todas las reservas confirmadas de la fecha seleccionada',
            confirmText: 'Ejecutar Rutas',
            confirmColor: '#3b82f6',
            icon: Icons.truck('#3b82f6'),
            action: 'ejecutar'
        });
        setShowDateModal(true);
    };

    const handleFinalizarRutasFecha = async () => {
        setDateModalConfig({
            title: 'Finalizar Rutas por Fecha',
            description: 'Se finalizarán todas las reservas en ejecución de la fecha seleccionada',
            confirmText: 'Finalizar Rutas',
            confirmColor: '#6b7280',
            icon: Icons.check('#6b7280'),
            action: 'finalizar'
        });
        setShowDateModal(true);
    };

    // ACTUALIZACIÓN: Recibir también la hora del modal
    const handleDateModalConfirm = async (fecha, rutaId, horaPickup) => {
        const { action } = dateModalConfig;

        try {
            let endpoint = '';
            let successMessage = '';

            switch (action) {
                case 'confirmar':
                    endpoint = '/api/v1/reservas/confirmar-por-fecha';
                    successMessage = 'reservas confirmadas';
                    break;
                case 'ejecutar':
                    endpoint = '/api/v1/reservas/ejecutar-por-fecha';
                    successMessage = 'reservas ejecutadas';
                    break;
                case 'finalizar':
                    endpoint = '/api/v1/reservas/finalizar-por-fecha';
                    successMessage = 'reservas finalizadas';
                    break;
                default:
                    throw new Error('Acción no válida');
            }

            // ACTUALIZACIÓN: Incluir la hora en la petición
            const requestBody = {
                fecha: fecha,
                ruta_id: rutaId
            };

            // Si se proporciona hora, incluirla
            if (horaPickup) {
                requestBody.hora_pickup = horaPickup;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Error al ${action} rutas por fecha`);
            }

            const data = await response.json();
            const count = data[action === 'confirmar' ? 'confirmadas' : action === 'ejecutar' ? 'ejecutadas' : 'finalizadas'];

            // Buscar el nombre de la ruta seleccionada para mostrar en el mensaje
            const rutaSeleccionada = rutas.find(r => r.id.toString() === rutaId.toString());
            const nombreRuta = rutaSeleccionada ? ` de la ruta ${rutaSeleccionada.nombre_ruta}` : '';
            const horaInfo = horaPickup ? ` a las ${horaPickup}` : '';

            Notifications.success(`${count} ${successMessage}${nombreRuta}${horaInfo} para el ${fecha}`, 'Éxito');
            cargarDatos();
        } catch (error) {
            console.error(`Error ${action} rutas por fecha:`, error);
            Notifications.error(`Error al ${action} rutas por fecha`, 'Error');
        }
    };

    const tarjetasEstadisticas = crearTarjetasEstadisticas();
    const filtrosActivos = getFiltrosActivos();

    return e('div', {
        style: {
            padding: '2rem',
            backgroundColor: '#f8fafc',
            minHeight: '100vh'
        }
    }, [
        // Header principal
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
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginLeft: '5rem'
                }
            }, [
                e('div', {
                    key: 'icon-container',
                    style: {
                        width: '64px',
                        height: '64px',
                        backgroundColor: '#eff6ff',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }
                }, Icons.calendar('#3b82f6')),
                e('div', { key: 'title-text' }, [
                    e('h1', {
                        key: 'main-title',
                        style: {
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            color: '#1f2937',
                            margin: '0'
                        }
                    }, 'Gestión de Reservas'),
                    e('p', {
                        key: 'subtitle',
                        style: {
                            color: '#6b7280',
                            margin: '0.25rem 0 0 0',
                            fontSize: '1.125rem'
                        }
                    }, 'Administración completa del ciclo de reservas')
                ])
            ]),

            // Botón Nueva Reserva
            e('div', {
                key: 'header-actions',
                style: { display: 'flex', gap: '1rem', alignItems: 'center' }
            }, [
                // Botones de gestión masiva
                e('div', {
                    key: 'bulk-actions',
                    style: { display: 'flex', gap: '0.5rem' }
                }, [
                    // Confirmar rutas por fecha
                    e('button', {
                        key: 'btn-confirmar-fecha',
                        onClick: handleConfirmarRutasFecha,
                        style: {
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }
                    }, [
                        Icons.checkCircle('white'),
                        'Confirmar Fecha'
                    ]),

                    // Ejecutar rutas por fecha
                    e('button', {
                        key: 'btn-ejecutar-fecha',
                        onClick: handleEjecutarRutasFecha,
                        style: {
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }
                    }, [
                        Icons.truck('white'),
                        'Ejecutar Fecha'
                    ]),

                    // Finalizar rutas por fecha
                    e('button', {
                        key: 'btn-finalizar-fecha',
                        onClick: handleFinalizarRutasFecha,
                        style: {
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }
                    }, [
                        Icons.check('white'),
                        'Finalizar Fecha'
                    ])
                ]),

                // Botón refrescar
                e('button', {
                    key: 'btn-refresh',
                    onClick: cargarDatos,
                    disabled: loadingEstadisticas,
                    style: {
                        backgroundColor: 'white',
                        color: '#6b7280',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        cursor: loadingEstadisticas ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        opacity: loadingEstadisticas ? 0.6 : 1
                    }
                }, [
                    e('span', {
                        key: 'refresh-icon',
                        style: {
                            animation: loadingEstadisticas ? 'spin 1s linear infinite' : 'none'
                        }
                    }, Icons.refresh('#6b7280'))
                ]),

                // Botón Nueva Reserva
                e('button', {
                    key: 'btn-nueva-reserva',
                    onClick: handleNuevaReserva,
                    style: {
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '1rem 2rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                        transition: 'all 0.2s'
                    },
                    onMouseEnter: (e) => {
                        e.target.style.backgroundColor = '#2563eb';
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 8px 12px -1px rgba(59, 130, 246, 0.4)';
                    },
                    onMouseLeave: (e) => {
                        e.target.style.backgroundColor = '#3b82f6';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.3)';
                    }
                }, [
                    e('span', { key: 'plus-icon' }, Icons.plus()),
                    e('span', { key: 'btn-text' }, 'Nueva Reserva')
                ])
            ])
        ]),

        // Tarjetas de estadísticas DINÁMICAS
        e('div', {
            key: 'stats-cards',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }
        }, tarjetasEstadisticas.map(stat =>
            e('div', {
                key: stat.id,
                style: {
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                    opacity: loadingEstadisticas ? 0.6 : 1,
                    position: 'relative'
                },
                onMouseEnter: (e) => {
                    if (!loadingEstadisticas) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }
                },
                onMouseLeave: (e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                }
            }, [
                // Indicador de carga
                loadingEstadisticas && e('div', {
                    key: 'loading-indicator',
                    style: {
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        width: '16px',
                        height: '16px',
                        border: '2px solid #e5e7eb',
                        borderTop: '2px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }
                }),

                e('div', {
                    key: 'stat-header',
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem'
                    }
                }, [
                    e('div', {
                        key: 'stat-icon',
                        style: {
                            width: '48px',
                            height: '48px',
                            backgroundColor: stat.color + '15',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }
                    }, e('div', {
                        key: `icon-wrapper-${stat.id}`,
                        style: { color: stat.color }
                    }, stat.icono)),
                    e('div', {
                        key: 'stat-value',
                        style: {
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            color: '#1f2937'
                        }
                    }, stat.valor)
                ]),
                e('div', { key: 'stat-details' }, [
                    e('h3', {
                        key: 'stat-title',
                        style: {
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: '0 0 0.25rem 0'
                        }
                    }, stat.titulo),
                    e('p', {
                        key: 'stat-description',
                        style: {
                            color: '#6b7280',
                            fontSize: '0.875rem',
                            margin: '0'
                        }
                    }, stat.descripcion)
                ])
            ])
        )),

        // SECCIÓN: Búsqueda y Filtros Avanzados
        e('div', {
            key: 'search-and-filters',
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }
        }, [
            // Header de la sección
            e('div', {
                key: 'filter-header',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }
            }, [
                e('div', {
                    key: 'filter-title',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [
                    Icons.filter('#3b82f6'),
                    e('h3', {
                        style: {
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: '0'
                        }
                    }, 'Búsqueda y Filtros'),
                    filtrosActivos > 0 && e('span', {
                        key: 'active-filters-badge',
                        style: {
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '9999px',
                            marginLeft: '0.5rem'
                        }
                    }, filtrosActivos)
                ]),
                e('button', {
                    key: 'clear-filters',
                    onClick: limpiarFiltros,
                    disabled: filtrosActivos === 0,
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: filtrosActivos > 0 ? '#f3f4f6' : '#f9fafb',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        color: filtrosActivos > 0 ? '#374151' : '#9ca3af',
                        cursor: filtrosActivos > 0 ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s'
                    }
                }, [
                    Icons.refresh('#6b7280'),
                    'Limpiar Filtros'
                ])
            ]),

            // Fila principal de filtros
            e('div', {
                key: 'main-filters',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1rem'
                }
            }, [
                // Búsqueda por nombre de pasajero
                e('div', {
                    key: 'search-field',
                    style: {
                        position: 'relative',
                        gridColumn: 'span 2'
                    }
                }, [
                    e('input', {
                        key: 'search-input',
                        type: 'text',
                        placeholder: 'Buscar por nombre de pasajero...',
                        value: filtros.searchPasajero,
                        onChange: (e) => handleFiltroChange('searchPasajero', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 2.5rem',
                            border: filtros.searchPasajero ? '2px solid #3b82f6' : '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            transition: 'border-color 0.2s'
                        },
                        onFocus: (e) => e.target.style.borderColor = '#3b82f6',
                        onBlur: (e) => e.target.style.borderColor = filtros.searchPasajero ? '#3b82f6' : '#d1d5db'
                    }),
                    e('div', {
                        key: 'search-icon',
                        style: {
                            position: 'absolute',
                            left: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: filtros.searchPasajero ? '#3b82f6' : '#9ca3af',
                            pointerEvents: 'none'
                        }
                    }, Icons.search())
                ]),

                // Filtro por fecha desde
                e('div', { key: 'fecha-desde' }, [
                    e('label', {
                        style: {
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            color: '#6b7280',
                            marginBottom: '0.25rem'
                        }
                    }, 'Fecha desde'),
                    e('input', {
                        type: 'date',
                        value: filtros.fechaDesde,
                        onChange: (e) => handleFiltroChange('fechaDesde', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: filtros.fechaDesde ? '2px solid #3b82f6' : '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    })
                ]),

                // Filtro por fecha hasta
                e('div', { key: 'fecha-hasta' }, [
                    e('label', {
                        style: {
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            color: '#6b7280',
                            marginBottom: '0.25rem'
                        }
                    }, 'Fecha hasta'),
                    e('input', {
                        type: 'date',
                        value: filtros.fechaHasta,
                        onChange: (e) => handleFiltroChange('fechaHasta', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: filtros.fechaHasta ? '2px solid #3b82f6' : '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    })
                ])
            ]),

            // Segunda fila de filtros
            e('div', {
                key: 'secondary-filters',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }
            }, [
                // Filtro por ruta
                e('div', { key: 'ruta-filter' }, [
                    e('label', {
                        style: {
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            color: '#6b7280',
                            marginBottom: '0.25rem'
                        }
                    }, 'Ruta'),
                    e('select', {
                        value: filtros.rutaId,
                        onChange: (e) => handleFiltroChange('rutaId', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: filtros.rutaId ? '2px solid #3b82f6' : '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            backgroundColor: 'white'
                        }
                    }, [
                        e('option', { key: 'empty-ruta', value: '' }, 'Todas las rutas'),
                        ...rutas.map(ruta =>
                            e('option', { key: ruta.id, value: ruta.id }, ruta.nombre_ruta)
                        )
                    ])
                ]),

                // Selector de ordenamiento
                e('div', { key: 'orden' }, [
                    e('label', {
                        style: {
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            color: '#6b7280',
                            marginBottom: '0.25rem'
                        }
                    }, 'Ordenar por'),
                    e('select', {
                        value: filtros.ordenPor,
                        onChange: (e) => handleFiltroChange('ordenPor', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            backgroundColor: 'white'
                        }
                    }, [
                        e('option', { value: 'fecha_viaje' }, 'Fecha de viaje'),
                        e('option', { value: 'nombre_pasajero' }, 'Nombre pasajero'),
                        e('option', { value: 'numero_reserva' }, 'Número reserva'),
                        e('option', { value: 'created_at' }, 'Fecha creación')
                    ])
                ]),

                // Dirección del ordenamiento
                e('div', { key: 'direccion' }, [
                    e('label', {
                        style: {
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            color: '#6b7280',
                            marginBottom: '0.25rem'
                        }
                    }, 'Orden'),
                    e('div', {
                        key: 'orden-buttons',
                        style: {
                            display: 'flex',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }
                    }, [
                        e('button', {
                            key: 'btn-desc',
                            onClick: () => handleFiltroChange('ordenDireccion', 'desc'),
                            style: {
                                flex: 1,
                                padding: '0.75rem',
                                border: 'none',
                                backgroundColor: filtros.ordenDireccion === 'desc' ? '#3b82f6' : 'white',
                                color: filtros.ordenDireccion === 'desc' ? 'white' : '#374151',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.25rem'
                            }
                        }, [
                            e('span', { key: 'sort-desc-icon' }, Icons.sortDesc('#currentColor')),
                            e('span', { key: 'desc-text' }, 'Desc')
                        ]),
                        e('button', {
                            key: 'btn-asc',
                            onClick: () => handleFiltroChange('ordenDireccion', 'asc'),
                            style: {
                                flex: 1,
                                padding: '0.75rem',
                                border: 'none',
                                backgroundColor: filtros.ordenDireccion === 'asc' ? '#3b82f6' : 'white',
                                color: filtros.ordenDireccion === 'asc' ? 'white' : '#374151',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.25rem'
                            }
                        }, [
                            Icons.sortAsc('#currentColor'),
                            'Asc'
                        ])
                    ])
                ])
            ])
        ]),

        // Filtros rápidos dinámicos
        e('div', {
            key: 'filtros-rapidos',
            style: {
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                padding: '0 1rem',
                overflowX: 'auto'
            }
        }, getFiltrosRapidos().map(filtro =>
            e('button', {
                key: filtro.id || 'todos',
                onClick: () => setFiltroRapido(filtro.id),
                style: {
                    padding: '0.75rem 1.5rem',
                    border: filtroRapido === filtro.id ?
                        '2px solid ' + filtro.color : '2px solid transparent',
                    backgroundColor: filtroRapido === filtro.id ? filtro.color + '15' : 'white',
                    color: filtroRapido === filtro.id ? filtro.color : '#6b7280',
                    fontWeight: filtroRapido === filtro.id ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap'
                }
            }, filtro.label)
        )),

        // Lista de reservas
        e('div', {
            key: 'reservas-content',
            style: {
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }
        }, [
            loading ?
                e('div', {
                    key: 'loading',
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '1rem',
                        color: '#6b7280'
                    }
                }, [
                    e('div', {
                        key: 'spinner',
                        style: {
                            width: '48px',
                            height: '48px',
                            border: '4px solid #f3f4f6',
                            borderTop: '4px solid #3b82f6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }
                    }),
                    e('p', { key: 'loading-text' }, 'Cargando reservas...')
                ]) :
                reservas.length > 0 ?
                    e('div', {
                        key: 'reservas-list',
                        style: {
                            width: '100%',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                            gap: '1.5rem',
                            alignItems: 'start'
                        }
                    }, reservas.map(reserva => e(ReservaCard, {
                        key: reserva.id,
                        reserva: reserva,
                        onView: handleVerReserva,
                        onEdit: handleEditarReserva,
                        onDelete: (reserva) => {
                            if (confirm('¿Está seguro de cancelar esta reserva?')) {
                                console.log('Cancelar reserva:', reserva.id);
                            }
                        },
                        onClick: () => handleVerReserva(reserva),
                        showActions: true,
                        compact: false,
                        onConfirmar: handleConfirmarReserva,
                        onEjecutar: handleEjecutarReserva,
                        onFinalizar: handleFinalizarReserva
                    }))) :
                    // Estado vacío
                    e('div', {
                        key: 'empty-state',
                        style: {
                            textAlign: 'center',
                            color: '#6b7280'
                        }
                    }, [
                        e('div', {
                            key: 'empty-icon',
                            style: {
                                width: '96px',
                                height: '96px',
                                backgroundColor: '#f3f4f6',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                fontSize: '3rem'
                            }
                        }, Icons.calendar('#9ca3af')),
                        e('h3', {
                            key: 'empty-title',
                            style: {
                                fontSize: '1.5rem',
                                fontWeight: '600',
                                color: '#1f2937',
                                marginBottom: '0.5rem'
                            }
                        }, filtrosActivos > 0 ? 'No se encontraron reservas' : 'No hay reservas'),
                        e('p', {
                            key: 'empty-description',
                            style: {
                                fontSize: '1rem',
                                marginBottom: '1.5rem'
                            }
                        }, filtrosActivos > 0 ? 'Intente ajustar los filtros de búsqueda' : 'Comience creando su primera reserva'),
                        e('button', {
                            key: 'empty-cta',
                            onClick: filtrosActivos > 0 ? limpiarFiltros : handleNuevaReserva,
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
                                margin: '0 auto'
                            }
                        }, [
                            e('span', { key: 'icon' }, filtrosActivos > 0 ? Icons.refresh() : Icons.plus()),
                            e('span', { key: 'text' }, filtrosActivos > 0 ? 'Limpiar Filtros' : 'Nueva Reserva')
                        ])
                    ])
        ]),

        // Modal de Reserva
        showModal && e(ReservaModal, {
            key: 'reserva-modal',
            show: showModal,
            onClose: handleCloseModal,
            reserva: reservaSeleccionada,
            mode: modalMode,
            onSave: handleSaveReserva,
            refreshList: cargarDatos
        }),

        // Modal de selección de fecha para acciones masivas
        showDateModal && e(DateSelectionModal, {
            key: 'date-modal',
            show: showDateModal,
            onClose: () => setShowDateModal(false),
            onConfirm: handleDateModalConfirm,
            title: dateModalConfig.title,
            description: dateModalConfig.description,
            confirmText: dateModalConfig.confirmText,
            confirmColor: dateModalConfig.confirmColor,
            icon: dateModalConfig.icon
        })
    ]);
}

export default Reservaciones;
