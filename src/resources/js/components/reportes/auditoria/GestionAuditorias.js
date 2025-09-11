// src/resources/js/components/reportes/auditoria/GestionAuditorias.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';
import ModalUniversal from '../../common/ModalUniversal';
import BotonesUniversal from '../../common/BotonesUniversal';

// IMPORTAR EL NUEVO SISTEMA REUTILIZABLE
import useTableData from '../../common/useTableData';
import TableControls from '../../common/TableControls';
import TablePagination from '../../common/TablePagination';
import { auditoriasConfig } from './auditoriasConfig';
import apiHelper from '../../../utils/apiHelper';

const { createElement: e, useState, useEffect } = React;

function GestionAuditorias() {
    // Estados principales
    const [auditorias, setAuditorias] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    // Estados de modales
    const [modalDetalles, setModalDetalles] = useState(false);
    const [modalReporte, setModalReporte] = useState(false);
    const [modalLimpiar, setModalLimpiar] = useState(false);
    const [modalConfirmacion, setModalConfirmacion] = useState(false);

    // Estados de datos específicos
    const [itemDetalles, setItemDetalles] = useState(null);
    const [itemConfirmacion, setItemConfirmacion] = useState(null);
    const [accionConfirmacion, setAccionConfirmacion] = useState(null);

    // Estados de filtros MEJORADOS
    const [filtros, setFiltros] = useState({
        tabla: '',
        accion: '',
        usuario_id: '',
        fecha_inicio: '',
        fecha_fin: '',
        busqueda: ''
    });

    // Estados del formulario de reportes - MODIFICADO CON EXCEL
    const [formularioReporte, setFormularioReporte] = useState({
        fecha_inicio: '',
        fecha_fin: '',
        tabla: '',
        accion: '',
        usuario_id: '',
        tipo_reporte: 'resumen' // NUEVO
    });

    // Estados para limpieza
    const [diasLimpiar, setDiasLimpiar] = useState(90);

    // INTEGRAR EL NUEVO SISTEMA REUTILIZABLE
    const currentConfig = auditoriasConfig.auditorias;
    const currentRawData = auditorias;

    const tableData = useTableData(currentConfig, currentRawData);

    // Efectos principales
    useEffect(() => {
        cargarDatos();
        cargarEstadisticas();
        cargarUsuarios();
    }, [filtros]);

    // Función para cargar usuarios
    const cargarUsuarios = async () => {
        try {
            const response = await apiHelper.usuarios.getAll();
            const result = await apiHelper.handleResponse(response);

            if (result.success && result.data) {
                setUsuarios(result.data);
            } else if (result.data) {
                setUsuarios(result.data);
            } else {
                setUsuarios([]);
            }
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    };

    // Función para cargar datos de auditorías
    const cargarDatos = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            Object.entries(filtros).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await apiHelper.get(`/auditorias?${params.toString()}`);
            const result = await apiHelper.handleResponse(response);

            if (result.success && result.data) {
                setAuditorias(result.data);
                console.log('Auditorías cargadas:', result.data.length, 'items');
            } else {
                setAuditorias([]);
                console.log('No se encontraron auditorías');
            }

        } catch (error) {
            console.error('Error de conexión:', error);
            Notifications.error('Error de conexión al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar estadísticas
    const cargarEstadisticas = async () => {
        try {
            const response = await apiHelper.get('/auditorias/stats');
            const result = await apiHelper.handleResponse(response);
            setEstadisticas(result.data);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        }
    };

    // Función para manejar cambios en filtros
    const manejarCambioFiltro = (campo, valor) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
    };

    // Función para limpiar filtros
    const limpiarFiltros = () => {
        setFiltros({
            tabla: '',
            accion: '',
            usuario_id: '',
            fecha_inicio: '',
            fecha_fin: '',
            busqueda: ''
        });
    };

    // NUEVA FUNCIÓN: Obtener nombre de usuario CORREGIDA
    const obtenerNombreUsuario = (usuarioId) => {
        if (!usuarioId) return 'Sistema';

        const usuario = usuarios.find(u => u.id == usuarioId);
        if (usuario) {
            return usuario.nombre_completo ||
                (usuario.persona ? usuario.persona.nombre : '') ||
                `Usuario ${usuario.codigo}`;
        }
        return `Usuario ID: ${usuarioId}`;
    };

    // NUEVA FUNCIÓN: Generar labels personalizados para el modal
    const generarLabelsPersonalizados = (item) => {
        if (!item || !item.tabla_original) return {};

        const tabla = item.tabla_original;
        const labelsMap = {
            'reserva': {
                'reserva_codigo': 'Código de Reserva',
                'reserva_nombres_cliente': 'Nombres del Cliente',
                'reserva_apellidos_cliente': 'Apellidos del Cliente',
                'reserva_telefono_cliente': 'Teléfono del Cliente',
                'reserva_monto': 'Monto de la Reserva',
                'reserva_cantidad_adultos': 'Cantidad de Adultos',
                'reserva_cantidad_ninos': 'Cantidad de Niños',
                'reserva_observaciones': 'Observaciones',
                'usuario_modificacion': 'Usuario que Modificó',
                'fecha_modificacion': 'Fecha de Modificación',
                'accion': 'Tipo de Acción',
                'ip_modificacion': 'Dirección IP'
            },
            'vehiculo': {
                'vehiculo_codigo': 'Código del Vehículo',
                'vehiculo_placa': 'Placa del Vehículo',
                'vehiculo_marca': 'Marca',
                'vehiculo_modelo': 'Modelo',
                'vehiculo_capacidad': 'Capacidad de Pasajeros',
                'vehiculo_observaciones': 'Observaciones del Vehículo',
                'usuario_modificacion': 'Usuario que Modificó',
                'fecha_modificacion': 'Fecha de Modificación',
                'accion': 'Tipo de Acción',
                'ip_modificacion': 'Dirección IP'
            },
            'persona': {
                'persona_codigo': 'Código de Persona',
                'persona_nombres': 'Nombres',
                'persona_apellidos': 'Apellidos',
                'persona_email': 'Correo Electrónico',
                'persona_telefono': 'Teléfono',
                'persona_direccion': 'Dirección',
                'usuario_modificacion': 'Usuario que Modificó',
                'fecha_modificacion': 'Fecha de Modificación',
                'accion': 'Tipo de Acción',
                'ip_modificacion': 'Dirección IP'
            },
            'ruta_activada': {
                'ruta_activada_codigo': 'Código de Ruta Activada',
                'ruta_activada_fecha_hora': 'Fecha y Hora Programada',
                'ruta_activada_precio_adulto': 'Precio por Adulto',
                'ruta_activada_precio_nino': 'Precio por Niño',
                'ruta_activada_observaciones': 'Observaciones',
                'usuario_modificacion': 'Usuario que Modificó',
                'fecha_modificacion': 'Fecha de Modificación',
                'accion': 'Tipo de Acción',
                'ip_modificacion': 'Dirección IP'
            },
            'usuario': {
                'usuario_codigo': 'Código de Usuario',
                'usuario_modificacion': 'Usuario que Modificó',
                'fecha_modificacion': 'Fecha de Modificación',
                'accion': 'Tipo de Acción',
                'ip_modificacion': 'Dirección IP'
            },
            'agencia': {
                'agencia_codigo': 'Código de Agencia',
                'agencia_razon_social': 'Razón Social',
                'agencia_direccion': 'Dirección',
                'agencia_telefono': 'Teléfono',
                'agencia_email': 'Correo Electrónico',
                'usuario_modificacion': 'Usuario que Modificó',
                'fecha_modificacion': 'Fecha de Modificación',
                'accion': 'Tipo de Acción',
                'ip_modificacion': 'Dirección IP'
            }
        };

        // Labels comunes para todas las tablas
        const labelsComunes = {
            'usuario_modificacion': 'Usuario que Realizó el Cambio',
            'fecha_modificacion': 'Fecha y Hora del Cambio',
            'accion': 'Tipo de Operación',
            'ip_modificacion': 'Dirección IP de Origen',
            'tabla_original': 'Tabla Afectada',
            'auditoria_id': 'ID de Auditoría'
        };

        return { ...(labelsMap[tabla] || {}), ...labelsComunes };
    };

    // Renderizar item de lista - MEJORADO
    const renderizarItem = (item) => {
        const tabla = item.tabla_original || 'desconocida';
        const accion = item.accion || 'N/A';
        const fecha = item.fecha_modificacion ? new Date(item.fecha_modificacion).toLocaleString('es-GT') : 'N/A';
        const usuarioNombre = obtenerNombreUsuario(item.usuario_modificacion);

        // Obtener el campo principal del registro auditado
        let campoPrincipal = 'N/A';
        const tablaSinSufijo = tabla.replace('_auditoria', '');

        // Definir campos específicos por tabla
        const camposEspecificos = {
            'reserva': ['reserva_codigo', 'reserva_nombres_cliente', 'reserva_apellidos_cliente'],
            'vehiculo': ['vehiculo_codigo', 'vehiculo_placa'],
            'persona': ['persona_codigo', 'persona_nombres', 'persona_apellidos'],
            'usuario': ['usuario_codigo'],
            'servicio': ['servicio_codigo', 'servicio_servicio'],
            'ruta': ['ruta_codigo', 'ruta_ruta'],
            'agencia': ['agencia_codigo', 'agencia_razon_social'],
            'tipo_persona': ['tipo_persona_codigo', 'tipo_persona_tipo'],
            'rol': ['rol_codigo', 'rol_rol'],
            'estado': ['estado_codigo', 'estado_estado'],
            'ruta_activada': ['ruta_activada_codigo'],
            'contactos_agencia': ['contactos_agencia_codigo', 'contactos_agencia_nombres']
        };

        // Usar campos específicos de la tabla o fallback genérico
        const campos = camposEspecificos[tablaSinSufijo] || [
            `${tablaSinSufijo}_codigo`,
            `${tablaSinSufijo}_nombre`,
            `${tablaSinSufijo}_${tablaSinSufijo}`
        ];

        for (const campo of campos) {
            if (item[campo]) {
                if (tablaSinSufijo === 'reserva' && campo === 'reserva_nombres_cliente' && item['reserva_apellidos_cliente']) {
                    campoPrincipal = `${item['reserva_nombres_cliente']} ${item['reserva_apellidos_cliente']}`;
                } else if (tablaSinSufijo === 'persona' && campo === 'persona_nombres' && item['persona_apellidos']) {
                    campoPrincipal = `${item['persona_nombres']} ${item['persona_apellidos']}`;
                } else {
                    campoPrincipal = item[campo];
                }
                break;
            }
        }

        const colorAccion = {
            'INSERT': '#22c55e',
            'UPDATE': '#f59e0b',
            'DELETE': '#ef4444'
        }[accion] || '#6b7280';

        return e('div', {
            style: {
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto auto',
                gap: '1rem',
                alignItems: 'center',
                color: '#6b7280',
                fontSize: '0.875rem'
            }
        }, [
            // Indicador visual de acción
            e('div', {
                key: 'indicador',
                style: {
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: colorAccion,
                    flexShrink: 0
                }
            }),

            // Información principal - MEJORADA
            e('div', {
                key: 'info',
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                }
            }, [
                e('div', {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap'
                    }
                }, [
                    BotonesUniversal.badge({
                        texto: accion,
                        color: accion === 'INSERT' ? 'verde' : accion === 'UPDATE' ? 'amarillo' : 'rojo'
                    }),
                    e('strong', { style: { color: '#374151' } }, tabla.replace('_', ' ').toUpperCase()),
                    e('span', {}, '→'),
                    e('span', { style: { color: '#111827' } }, campoPrincipal)
                ]),
                e('div', {
                    style: {
                        fontSize: '0.75rem',
                        color: '#9ca3af'
                    }
                }, [
                    e('span', {}, `Usuario: ${usuarioNombre} | `),
                    e('span', {}, `Fecha: ${fecha}`)
                ])
            ]),

            // IP (si existe)
            item.ip_modificacion && e('div', {
                key: 'ip',
                style: {
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    fontFamily: 'monospace'
                }
            }, item.ip_modificacion),

            // ID de auditoría
            e('div', {
                key: 'id',
                style: {
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    fontFamily: 'monospace'
                }
            }, `#${item.auditoria_id}`)
        ]);
    };

    // Funciones auxiliares
    const obtenerNombreItem = (item) => {
        return `Auditoría #${item.auditoria_id}` || 'Auditoría';
    };

    const obtenerIdItem = (item) => {
        return item.auditoria_id;
    };

    // Abrir modal de detalles - MEJORADO
    const abrirModalDetalles = (item) => {
        setItemDetalles(item);
        setModalDetalles(true);
    };

    // Abrir modal de reporte
    const abrirModalReporte = () => {
        setFormularioReporte({
            fecha_inicio: '',
            fecha_fin: '',
            tabla: '',
            accion: '',
            usuario_id: '',
            tipo_reporte: 'resumen' // NUEVO
        });
        setModalReporte(true);
    };

    // Generar reporte (texto original)
    const generarReporte = async () => {
        if (!formularioReporte.fecha_inicio || !formularioReporte.fecha_fin) {
            Notifications.error('Las fechas de inicio y fin son requeridas');
            return;
        }

        setLoadingAction(true);
        try {
            const response = await fetch('/api/magic/auditorias/reporte', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(formularioReporte)
            });

            if (response.ok) {
                const result = await response.json();

                // Crear un reporte visual simple
                let reporteTexto = `REPORTE DE AUDITORÍA\n`;
                reporteTexto += `Período: ${formularioReporte.fecha_inicio} a ${formularioReporte.fecha_fin}\n\n`;

                if (result.data.resumen) {
                    reporteTexto += `RESUMEN POR TABLA:\n`;
                    Object.entries(result.data.resumen).forEach(([tabla, datos]) => {
                        if (datos.total > 0) {
                            reporteTexto += `${tabla}: ${datos.total} registros\n`;
                            if (datos.por_accion) {
                                Object.entries(datos.por_accion).forEach(([accion, count]) => {
                                    reporteTexto += `  - ${accion}: ${count}\n`;
                                });
                            }
                        }
                    });
                }

                // Crear descarga
                const blob = new Blob([reporteTexto], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `reporte-auditoria-${new Date().toISOString().split('T')[0]}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                Notifications.success('Reporte de texto generado exitosamente');
            } else {
                const errorData = await response.json();
                Notifications.error(`Error al generar reporte: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            Notifications.error('Error de conexión');
        } finally {
            setLoadingAction(false);
        }
    };

    // Función para generar reporte Excel
    const generarReporteExcel = async () => {
        if (!formularioReporte.fecha_inicio || !formularioReporte.fecha_fin) {
            Notifications.error('Las fechas de inicio y fin son requeridas');
            return;
        }

        setLoadingAction(true);
        try {
            const response = await apiHelper.post('/auditorias/reporte-excel', formularioReporte);

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `reporte-auditoria-${formularioReporte.tipo_reporte}-${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);

                Notifications.success('Reporte Excel generado exitosamente');
                setModalReporte(false);
            } else {
                const errorData = await apiHelper.handleResponse(response);
                Notifications.error(`Error al generar reporte Excel: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            Notifications.error('Error de conexión al generar Excel');
        } finally {
            setLoadingAction(false);
        }
    };

    // Abrir confirmación de limpieza
    const abrirModalLimpiar = () => {
        setModalLimpiar(true);
    };

    // Función para ejecutar limpieza
    const ejecutarLimpieza = async () => {
        if (diasLimpiar < 30) {
            Notifications.error('Mínimo 30 días para limpieza');
            return;
        }

        setLoadingAction(true);
        try {
            const response = await apiHelper.delete('/auditorias/limpiar', { dias: diasLimpiar });
            const result = await apiHelper.handleResponse(response);

            Notifications.success(result.message);
            setModalLimpiar(false);
            cargarDatos();
            cargarEstadisticas();
        } catch (error) {
            console.error('Error:', error);
            Notifications.error('Error de conexión');
        } finally {
            setLoadingAction(false);
        }
    };

    // USAR DATOS DIRECTOS (sin sistema reutilizable para este caso específico)
    const datosActuales = auditorias;
    const totalDatos = auditorias.length;

    return e('div', {
        style: { padding: '1.5rem', maxWidth: '100%', minHeight: '100vh' }
    }, [
        // Header - MODIFICADO TEXTO DEL BOTÓN
        e('div', {
            key: 'header',
            style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }
        }, [
            e('div', { key: 'title-section' }, [
                e('h1', {
                    key: 'title',
                    style: {
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#111827',
                        margin: '0 0 0.5rem 0'
                    }
                }, 'Gestión de Auditorías'),
                e('p', {
                    key: 'subtitle',
                    style: {
                        color: '#6b7280',
                        margin: 0
                    }
                }, 'Monitoreo y seguimiento de cambios en el sistema')
            ]),

            e('div', {
                key: 'header-actions',
                style: { display: 'flex', gap: '0.75rem', alignItems: 'center' }
            }, [
                BotonesUniversal.secundario({
                    onClick: abrirModalReporte,
                    texto: 'Reportes', // CAMBIADO DE "Generar Reporte" A "Reportes"
                    icono: Icons.download('#6b7280'),
                    key: 'btn-reporte'
                }),
                BotonesUniversal.peligro({
                    onClick: abrirModalLimpiar,
                    texto: 'Limpiar Antiguos',
                    icono: Icons.trash('#ffffff'),
                    key: 'btn-limpiar'
                })
            ])
        ]),

        // Panel de estadísticas
        estadisticas && e('div', {
            key: 'panel-estadisticas',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }
        }, [
            // Total de registros
            e('div', {
                key: 'stat-total',
                style: {
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    textAlign: 'center'
                }
            }, [
                e('div', {
                    style: {
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: '#0369a1',
                        marginBottom: '0.5rem'
                    }
                }, estadisticas.total_registros?.toLocaleString() || '0'),
                e('div', {
                    style: {
                        fontSize: '0.875rem',
                        color: '#0369a1',
                        fontWeight: '500'
                    }
                }, 'Total de Registros de Auditoría')
            ]),

            // Acciones por tipo
            Object.entries(estadisticas.acciones_por_tipo || {}).map(([accion, total]) => {
                const colores = {
                    'INSERT': { bg: '#dcfce7', border: '#bbf7d0', text: '#16a34a' },
                    'UPDATE': { bg: '#fef3c7', border: '#fde68a', text: '#f59e0b' },
                    'DELETE': { bg: '#fef2f2', border: '#fecaca', text: '#ef4444' }
                };
                const color = colores[accion] || colores.UPDATE;

                return e('div', {
                    key: `stat-${accion}`,
                    style: {
                        backgroundColor: color.bg,
                        border: `1px solid ${color.border}`,
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'center'
                    }
                }, [
                    e('div', {
                        style: {
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: color.text,
                            marginBottom: '0.5rem'
                        }
                    }, total.toLocaleString()),
                    e('div', {
                        style: {
                            fontSize: '0.875rem',
                            color: color.text,
                            fontWeight: '500'
                        }
                    }, `${accion}s`)
                ]);
            })
        ]),

        // Panel de filtros MEJORADO
        e('div', {
            key: 'panel-filtros',
            style: {
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem'
            }
        }, [
            e('h3', {
                style: {
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 1rem 0'
                }
            }, 'Filtros de Búsqueda'),

            // PRIMERA FILA: Búsqueda de texto y Usuario
            e('div', {
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1rem'
                }
            }, [
                // Campo de búsqueda de texto libre
                e('div', {}, [
                    e('label', {
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Buscar en registros:'),
                    e('input', {
                        type: 'text',
                        value: filtros.busqueda,
                        onChange: (e) => manejarCambioFiltro('busqueda', e.target.value),
                        placeholder: 'Código, nombre, teléfono, etc...',
                        style: {
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem'
                        }
                    })
                ]),

                // Usuario - Select normal mejorado
                e('div', {}, [
                    e('label', {
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Usuario:'),
                    e('select', {
                        value: filtros.usuario_id || '',
                        onChange: (e) => manejarCambioFiltro('usuario_id', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem'
                        }
                    }, [
                        e('option', { value: '' }, 'Todos los usuarios'),
                        ...usuarios.map(usuario => {
                            const nombre = usuario.nombre_completo ||
                                (usuario.persona ? usuario.persona.nombre : '') ||
                                `Usuario ${usuario.codigo}`;

                            return e('option', {
                                key: usuario.id,
                                value: usuario.id.toString()
                            }, `${nombre} (${usuario.codigo})`);
                        })
                    ])
                ])
            ]),

            // SEGUNDA FILA: Filtros existentes
            e('div', {
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1rem'
                }
            }, [
                // Tabla - Select normal mejorado
                e('div', {}, [
                    e('label', {
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Tabla:'),
                    e('select', {
                        value: filtros.tabla || '',
                        onChange: (e) => manejarCambioFiltro('tabla', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem'
                        }
                    }, [
                        e('option', { value: '' }, 'Todas las tablas'),
                        e('option', { value: 'tipo_persona' }, 'Tipos de Persona'),
                        e('option', { value: 'rol' }, 'Roles'),
                        e('option', { value: 'estado' }, 'Estados'),
                        e('option', { value: 'servicio' }, 'Servicios'),
                        e('option', { value: 'ruta' }, 'Rutas'),
                        e('option', { value: 'agencia' }, 'Agencias'),
                        e('option', { value: 'persona' }, 'Personas'),
                        e('option', { value: 'vehiculo' }, 'Vehículos'),
                        e('option', { value: 'contactos_agencia' }, 'Contactos Agencia'),
                        e('option', { value: 'usuario' }, 'Usuarios'),
                        e('option', { value: 'ruta_activada' }, 'Rutas Activadas'),
                        e('option', { value: 'reserva' }, 'Reservas')
                    ])
                ]),

                // Acción - Select normal
                e('div', {}, [
                    e('label', {
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Acción:'),
                    e('select', {
                        value: filtros.accion || '',
                        onChange: (e) => manejarCambioFiltro('accion', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem'
                        }
                    }, [
                        e('option', { value: '' }, 'Todas las acciones'),
                        e('option', { value: 'INSERT' }, 'Creaciones (INSERT)'),
                        e('option', { value: 'UPDATE' }, 'Modificaciones (UPDATE)'),
                        e('option', { value: 'DELETE' }, 'Eliminaciones (DELETE)')
                    ])
                ]),

                // Fecha inicio
                e('div', {}, [
                    e('label', {
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Fecha Inicio:'),
                    e('input', {
                        type: 'date',
                        value: filtros.fecha_inicio,
                        onChange: (e) => manejarCambioFiltro('fecha_inicio', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem'
                        }
                    })
                ]),

                // Fecha fin
                e('div', {}, [
                    e('label', {
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Fecha Fin:'),
                    e('input', {
                        type: 'date',
                        value: filtros.fecha_fin,
                        onChange: (e) => manejarCambioFiltro('fecha_fin', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem'
                        }
                    })
                ])
            ]),

            // Botones de filtros
            e('div', {
                style: {
                    display: 'flex',
                    gap: '0.5rem',
                    justifyContent: 'flex-end'
                }
            }, [
                BotonesUniversal.secundario({
                    onClick: limpiarFiltros,
                    texto: 'Limpiar',
                    icono: Icons.refresh('#6b7280')
                }),
                BotonesUniversal.primario({
                    onClick: cargarDatos,
                    texto: 'Aplicar Filtros',
                    icono: Icons.search('#ffffff'),
                    loading: loading
                })
            ])
        ]),

        // Lista principal
        e('div', {
            key: 'lista-principal',
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }
        }, [
            loading ? e('div', {
                key: 'loading',
                style: { padding: '3rem', textAlign: 'center' }
            }, 'Cargando auditorías...') :
                datosActuales.length > 0 ?
                    datosActuales.map((item, index) => {
                        const itemId = obtenerIdItem(item) || index;

                        return e('div', {
                            key: `item-${itemId}`,
                            style: {
                                padding: '1.5rem',
                                borderBottom: index < datosActuales.length - 1 ? '1px solid #f3f4f6' : 'none',
                                transition: 'background-color 0.2s ease'
                            },
                            onMouseEnter: (e) => e.currentTarget.style.backgroundColor = '#f9fafb',
                            onMouseLeave: (e) => e.currentTarget.style.backgroundColor = 'transparent'
                        }, [
                            e('div', {
                                key: `item-content-${itemId}`,
                                style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '1.5rem'
                                }
                            }, [
                                // Información del item
                                e('div', {
                                    key: `item-info-${itemId}`,
                                    style: { flex: '1' }
                                }, [
                                    renderizarItem(item)
                                ]),

                                // Acciones
                                e('div', {
                                    key: `item-actions-${itemId}`,
                                    style: {
                                        display: 'flex',
                                        gap: '0.5rem',
                                        flexShrink: 0
                                    }
                                }, [
                                    BotonesUniversal.ver({ onClick: () => abrirModalDetalles(item) })
                                ])
                            ])
                        ]);
                    }) :
                    e('div', {
                        key: 'no-data',
                        style: {
                            padding: '4rem',
                            textAlign: 'center',
                            color: '#9ca3af'
                        }
                    }, [
                        e('p', {
                            key: 'no-data-text',
                            style: { fontSize: '1.125rem', marginBottom: '0.5rem' }
                        }, 'No hay registros de auditoría disponibles'),
                        e('p', {
                            key: 'no-data-hint',
                            style: { fontSize: '0.875rem' }
                        }, 'Ajusta los filtros para ver más resultados')
                    ])
        ]),

        // Información básica de paginación
        totalDatos > 0 && e('div', {
            key: 'info-paginacion',
            style: {
                padding: '1rem',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '0.875rem',
                backgroundColor: '#f9fafb'
            }
        }, `Mostrando ${datosActuales.length} de ${totalDatos} registros de auditoría`),

        // Modal de detalles MEJORADO - con labels personalizados
        ModalUniversal.detalles({
            abierto: modalDetalles,
            cerrar: () => setModalDetalles(false),
            item: itemDetalles,
            tipoItem: itemDetalles ? `Auditoría de ${itemDetalles.tabla_original?.replace('_', ' ') || 'registro'}` : 'auditoría',
            camposExcluir: ['original_created_at', 'original_updated_at', 'original_created_by', 'original_updated_by', 'original_deleted_at'],
            labelsPersonalizados: itemDetalles ? generarLabelsPersonalizados(itemDetalles) : {}
        }),

        // MODAL DE REPORTE COMPLETAMENTE NUEVO CON EXCEL
        modalReporte && e('div', {
            key: 'modal-reporte-overlay',
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1200
            }
        }, [
            e('div', {
                key: 'modal-reporte-content',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    maxWidth: '650px',
                    width: '90%',
                    padding: '2rem',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }
            }, [
                // Header del modal
                e('div', {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1.5rem'
                    }
                }, [
                    e('div', {
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#16a34a',
                            borderRadius: '8px',
                            color: 'white'
                        }
                    }, Icons.download('#ffffff')),
                    e('h3', {
                        style: {
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#111827',
                            margin: '0'
                        }
                    }, 'Generar Reporte de Auditoría')
                ]),

                e('div', {
                    style: { display: 'grid', gap: '1.5rem', marginBottom: '2rem' }
                }, [
                    // Tipo de reporte - NUEVO CAMPO
                    e('div', {}, [
                        e('label', {
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '0.75rem'
                            }
                        }, 'Tipo de Reporte'),
                        e('select', {
                            value: formularioReporte.tipo_reporte,
                            onChange: (e) => setFormularioReporte(prev => ({ ...prev, tipo_reporte: e.target.value })),
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                backgroundColor: 'white'
                            }
                        }, [
                            e('option', { value: 'resumen' }, 'Resumen General - Vista consolidada por tabla'),
                            e('option', { value: 'detallado' }, 'Reporte Detallado - Lista completa de registros'),
                            e('option', { value: 'por_usuario' }, 'Agrupado por Usuario - Estadísticas de actividad'),
                            e('option', { value: 'por_tabla' }, 'Agrupado por Tabla - Similar al resumen')
                        ])
                    ]),

                    // Fechas en una fila
                    e('div', {
                        style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem',
                            padding: '1rem',
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                        }
                    }, [
                        e('div', {}, [
                            e('label', {
                                style: {
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }
                            }, 'Fecha Inicio *'),
                            e('input', {
                                type: 'date',
                                value: formularioReporte.fecha_inicio,
                                onChange: (e) => setFormularioReporte(prev => ({ ...prev, fecha_inicio: e.target.value })),
                                style: {
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem'
                                }
                            })
                        ]),

                        e('div', {}, [
                            e('label', {
                                style: {
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }
                            }, 'Fecha Fin *'),
                            e('input', {
                                type: 'date',
                                value: formularioReporte.fecha_fin,
                                onChange: (e) => setFormularioReporte(prev => ({ ...prev, fecha_fin: e.target.value })),
                                style: {
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '0.875rem'
                                }
                            })
                        ])
                    ]),

                    // Filtros opcionales
                    e('div', {
                        style: {
                            padding: '1rem',
                            backgroundColor: '#fefce8',
                            borderRadius: '8px',
                            border: '1px solid #facc15'
                        }
                    }, [
                        e('h4', {
                            style: {
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#a16207',
                                margin: '0 0 1rem 0'
                            }
                        }, 'Filtros Opcionales (dejar vacío para incluir todo)'),

                        e('div', {
                            style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }
                        }, [
                            e('div', {}, [
                                e('label', {
                                    style: {
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '0.5rem'
                                    }
                                }, 'Tabla Específica'),
                                e('select', {
                                    value: formularioReporte.tabla,
                                    onChange: (e) => setFormularioReporte(prev => ({ ...prev, tabla: e.target.value })),
                                    style: {
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem'
                                    }
                                }, [
                                    e('option', { value: '' }, 'Todas las tablas'),
                                    e('option', { value: 'reserva' }, 'Reservas'),
                                    e('option', { value: 'vehiculo' }, 'Vehículos'),
                                    e('option', { value: 'persona' }, 'Personas'),
                                    e('option', { value: 'agencia' }, 'Agencias'),
                                    e('option', { value: 'usuario' }, 'Usuarios'),
                                    e('option', { value: 'ruta_activada' }, 'Rutas Activadas'),
                                    e('option', { value: 'servicio' }, 'Servicios'),
                                    e('option', { value: 'ruta' }, 'Rutas'),
                                    e('option', { value: 'contactos_agencia' }, 'Contactos Agencia')
                                ])
                            ]),

                            e('div', {}, [
                                e('label', {
                                    style: {
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '0.5rem'
                                    }
                                }, 'Tipo de Acción'),
                                e('select', {
                                    value: formularioReporte.accion,
                                    onChange: (e) => setFormularioReporte(prev => ({ ...prev, accion: e.target.value })),
                                    style: {
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem'
                                    }
                                }, [
                                    e('option', { value: '' }, 'Todas las acciones'),
                                    e('option', { value: 'INSERT' }, 'Solo Creaciones (INSERT)'),
                                    e('option', { value: 'UPDATE' }, 'Solo Modificaciones (UPDATE)'),
                                    e('option', { value: 'DELETE' }, 'Solo Eliminaciones (DELETE)')
                                ])
                            ])
                        ])
                    ])
                ]),

                // Información útil
                e('div', {
                    style: {
                        padding: '1rem',
                        backgroundColor: '#dbeafe',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        border: '1px solid #93c5fd'
                    }
                }, [
                    e('h4', {
                        style: {
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#1d4ed8',
                            margin: '0 0 0.5rem 0'
                        }
                    }, 'Información del Reporte Excel'),
                    e('ul', {
                        style: {
                            fontSize: '0.75rem',
                            color: '#1e40af',
                            margin: '0',
                            paddingLeft: '1rem',
                            lineHeight: '1.4'
                        }
                    }, [
                        e('li', {}, 'El archivo se descargará automáticamente en formato .xlsx'),
                        e('li', {}, 'Incluye formato profesional con colores y estilos'),
                        e('li', {}, 'Los reportes detallados están limitados a 3,000 registros por rendimiento'),
                        e('li', {}, 'Compatible con Excel, Google Sheets y LibreOffice Calc')
                    ])
                ]),

                // REEMPLAZAR la sección de botones del modal (al final del modal) con:

                // Botones de acción - SOLO EXCEL
                e('div', {
                    style: {
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'flex-end'
                    }
                }, [
                    e('button', {
                        onClick: () => setModalReporte(false),
                        disabled: loadingAction,
                        style: {
                            padding: '0.75rem 1.5rem',
                            border: '2px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            color: '#374151',
                            cursor: loadingAction ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            opacity: loadingAction ? 0.7 : 1
                        }
                    }, 'Cancelar'),

                    e('button', {
                        onClick: generarReporteExcel,
                        disabled: loadingAction || !formularioReporte.fecha_inicio || !formularioReporte.fecha_fin,
                        style: {
                            padding: '0.75rem 2rem',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: loadingAction || !formularioReporte.fecha_inicio || !formularioReporte.fecha_fin ?
                                '#9ca3af' : '#16a34a',
                            color: 'white',
                            cursor: (loadingAction || !formularioReporte.fecha_inicio || !formularioReporte.fecha_fin) ?
                                'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }
                    }, [
                        loadingAction && e('div', {
                            key: 'spinner',
                            style: {
                                width: '16px',
                                height: '16px',
                                border: '2px solid #ffffff40',
                                borderTop: '2px solid #ffffff',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }
                        }),
                        loadingAction ? 'Generando Excel...' : 'Generar Excel'
                    ])
                ])
            ])
        ]),

        // Modal de limpieza
        modalLimpiar && e('div', {
            key: 'modal-limpiar-overlay',
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1200
            }
        }, [
            e('div', {
                key: 'modal-limpiar-content',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    maxWidth: '500px',
                    width: '90%',
                    padding: '2rem',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }
            }, [
                e('div', {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1.5rem'
                    }
                }, [
                    e('div', {
                        style: {
                            padding: '0.75rem',
                            borderRadius: '50%',
                            backgroundColor: '#fef2f2'
                        }
                    }, Icons.alertTriangle('#ef4444')),
                    e('h3', {
                        style: {
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#111827',
                            margin: '0'
                        }
                    }, 'Limpiar Auditorías Antiguas')
                ]),

                e('p', {
                    style: {
                        color: '#374151',
                        marginBottom: '1.5rem',
                        fontSize: '0.875rem'
                    }
                }, 'Esta acción eliminará permanentemente los registros de auditoría más antiguos. Mínimo 30 días.'),

                e('div', {
                    style: { marginBottom: '1.5rem' }
                }, [
                    e('label', {
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            marginBottom: '0.5rem'
                        }
                    }, 'Eliminar registros anteriores a (días):'),
                    e('input', {
                        type: 'number',
                        min: '30',
                        value: diasLimpiar,
                        onChange: (e) => setDiasLimpiar(parseInt(e.target.value) || 30),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px'
                        }
                    })
                ]),

                e('div', {
                    style: {
                        display: 'flex',
                        gap: '0.75rem',
                        justifyContent: 'flex-end'
                    }
                }, [
                    e('button', {
                        onClick: () => setModalLimpiar(false),
                        style: {
                            padding: '0.75rem 1.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            cursor: 'pointer'
                        }
                    }, 'Cancelar'),

                    e('button', {
                        onClick: ejecutarLimpieza,
                        disabled: loadingAction || diasLimpiar < 30,
                        style: {
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: loadingAction || diasLimpiar < 30 ? '#9ca3af' : '#ef4444',
                            color: 'white',
                            cursor: loadingAction || diasLimpiar < 30 ? 'not-allowed' : 'pointer'
                        }
                    }, loadingAction ? 'Limpiando...' : 'Limpiar')
                ])
            ])
        ])
    ]);
}

export default GestionAuditorias;
