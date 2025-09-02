// src/resources/js/components/reportes/auditoria/GestionAuditorias.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';

const { createElement: e, useState, useEffect } = React;

function GestionAuditorias() {
    // Estados principales
    const [auditorias, setAuditorias] = useState([]);
    const [auditoriasFiltradas, setAuditoriasFiltradas] = useState([]);
    const [loading, setLoading] = useState(false);

    // Estados de filtros y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroTabla, setFiltroTabla] = useState('todas');
    const [filtroAccion, setFiltroAccion] = useState('todas');
    const [filtroUsuario, setFiltroUsuario] = useState('todos');
    const [filtroFecha, setFiltroFecha] = useState('hoy');

    // Estados de modales
    const [modalDetalles, setModalDetalles] = useState(false);
    const [modalFiltrosAvanzados, setModalFiltrosAvanzados] = useState(false);

    // Estados de datos específicos
    const [auditoriaSeleccionada, setAuditoriaSeleccionada] = useState(null);

    // Estados de catálogos
    const [catalogos, setCatalogos] = useState({
        usuarios: [],
        tablas: [
            { codigo: 'reserva', nombre: 'Reservas', icono: 'calendar' },
            { codigo: 'agencia', nombre: 'Agencias', icono: 'building' },
            { codigo: 'usuario', nombre: 'Usuarios', icono: 'user' },
            { codigo: 'persona', nombre: 'Personas', icono: 'users' },
            { codigo: 'vehiculo', nombre: 'Vehículos', icono: 'truck' },
            { codigo: 'servicio', nombre: 'Servicios', icono: 'package' },
            { codigo: 'ruta_activada', nombre: 'Rutas Activadas', icono: 'route' },
            { codigo: 'facturas', nombre: 'Facturas', icono: 'receipt' }
        ]
    });

    // Estado de estadísticas
    const [estadisticas, setEstadisticas] = useState({
        total_eventos: 0,
        eventos_hoy: 0,
        eventos_semana: 0,
        usuarios_activos: 0,
        tabla_mas_modificada: '',
        accion_mas_frecuente: '',
        ultimo_evento: null
    });

    // Efectos principales
    useEffect(() => {
        cargarAuditorias();
        cargarUsuarios();
    }, []);

    useEffect(() => {
        filtrarAuditorias();
    }, [auditorias, searchTerm, filtroTabla, filtroAccion, filtroUsuario, filtroFecha]);

    // Funciones de carga de datos
    const cargarAuditorias = async () => {
        try {
            setLoading(true);

            // Endpoint que crearemos después - por ahora datos mock
            // const response = await fetch('/api/magic/auditorias', {
            //     headers: {
            //         'Accept': 'application/json',
            //         'Content-Type': 'application/json'
            //     }
            // });

            // Por ahora usamos datos de ejemplo para mostrar la estructura
            const auditoriasMock = [
                {
                    auditoria_id: 1,
                    tabla: 'reserva',
                    registro_id: 15,
                    accion: 'UPDATE',
                    usuario_modificacion: 3,
                    usuario_nombre: 'María González',
                    fecha_modificacion: new Date().toISOString(),
                    ip_modificacion: '192.168.1.100',
                    datos_anteriores: { estado_id: 1, reserva_monto: 100 },
                    datos_nuevos: { estado_id: 2, reserva_monto: 100 },
                    campos_modificados: ['estado_id']
                },
                {
                    auditoria_id: 2,
                    tabla: 'agencia',
                    registro_id: 8,
                    accion: 'INSERT',
                    usuario_modificacion: 1,
                    usuario_nombre: 'Admin Sistema',
                    fecha_modificacion: new Date(Date.now() - 60000).toISOString(),
                    ip_modificacion: '192.168.1.50',
                    datos_nuevos: { agencia_razon_social: 'Tours Guatemala', agencia_nit: '12345678-9' },
                    campos_modificados: []
                }
            ];

            setAuditorias(auditoriasMock);
            calcularEstadisticas(auditoriasMock);
        } catch (error) {
            console.error('Error:', error);
            Notifications.error('Error de conexión al cargar auditorías');
        } finally {
            setLoading(false);
        }
    };

    const cargarUsuarios = async () => {
        try {
            const response = await fetch('/api/magic/usuarios/vendedores');
            if (response.ok) {
                const data = await response.json();
                setCatalogos(prev => ({
                    ...prev,
                    usuarios: Array.isArray(data) ? data : data.data || []
                }));
            }
        } catch (error) {
            console.error('Error cargando usuarios:', error);
        }
    };

    const calcularEstadisticas = (auditoriasArray) => {
        const hoy = new Date();
        const inicioSemana = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);

        const eventosHoy = auditoriasArray.filter(a => {
            const fechaEvento = new Date(a.fecha_modificacion);
            return fechaEvento.toDateString() === hoy.toDateString();
        });

        const eventosSemana = auditoriasArray.filter(a => {
            const fechaEvento = new Date(a.fecha_modificacion);
            return fechaEvento >= inicioSemana;
        });

        // Tabla más modificada
        const conteoTablas = {};
        auditoriasArray.forEach(a => {
            conteoTablas[a.tabla] = (conteoTablas[a.tabla] || 0) + 1;
        });
        const tablaMasModificada = Object.keys(conteoTablas).reduce((a, b) =>
            conteoTablas[a] > conteoTablas[b] ? a : b, 'N/A'
        );

        // Acción más frecuente
        const conteoAcciones = {};
        auditoriasArray.forEach(a => {
            conteoAcciones[a.accion] = (conteoAcciones[a.accion] || 0) + 1;
        });
        const accionMasFrecuente = Object.keys(conteoAcciones).reduce((a, b) =>
            conteoAcciones[a] > conteoAcciones[b] ? a : b, 'N/A'
        );

        setEstadisticas({
            total_eventos: auditoriasArray.length,
            eventos_hoy: eventosHoy.length,
            eventos_semana: eventosSemana.length,
            usuarios_activos: new Set(auditoriasArray.map(a => a.usuario_modificacion)).size,
            tabla_mas_modificada: tablaMasModificada,
            accion_mas_frecuente: accionMasFrecuente,
            ultimo_evento: auditoriasArray.length > 0 ? auditoriasArray[0] : null
        });
    };

    const filtrarAuditorias = () => {
        let resultado = [...auditorias];

        // Filtro por búsqueda
        if (searchTerm.trim()) {
            const termino = searchTerm.toLowerCase();
            resultado = resultado.filter(auditoria =>
                auditoria.tabla?.toLowerCase().includes(termino) ||
                auditoria.usuario_nombre?.toLowerCase().includes(termino) ||
                auditoria.registro_id?.toString().includes(termino) ||
                auditoria.ip_modificacion?.includes(termino)
            );
        }

        // Filtro por tabla
        if (filtroTabla !== 'todas') {
            resultado = resultado.filter(auditoria => auditoria.tabla === filtroTabla);
        }

        // Filtro por acción
        if (filtroAccion !== 'todas') {
            resultado = resultado.filter(auditoria => auditoria.accion === filtroAccion);
        }

        // Filtro por usuario
        if (filtroUsuario !== 'todos') {
            resultado = resultado.filter(auditoria =>
                auditoria.usuario_modificacion?.toString() === filtroUsuario
            );
        }

        // Filtro por fecha
        if (filtroFecha !== 'todas') {
            const hoy = new Date();
            let fechaInicio;

            switch (filtroFecha) {
                case 'hoy':
                    fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
                    break;
                case 'ayer':
                    fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1);
                    break;
                case 'semana':
                    fechaInicio = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'mes':
                    fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                    break;
            }

            if (fechaInicio) {
                resultado = resultado.filter(auditoria => {
                    const fechaEvento = new Date(auditoria.fecha_modificacion);
                    return fechaEvento >= fechaInicio;
                });
            }
        }

        setAuditoriasFiltradas(resultado);
    };

    // Funciones de modal
    const abrirModalDetalles = (auditoria) => {
        setAuditoriaSeleccionada(auditoria);
        setModalDetalles(true);
    };

    const cerrarModales = () => {
        setModalDetalles(false);
        setModalFiltrosAvanzados(false);
        setAuditoriaSeleccionada(null);
    };

    // Funciones de utilidad
    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleString('es-GT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getAccionColor = (accion) => {
        const colores = {
            'INSERT': '#22c55e',
            'UPDATE': '#f59e0b',
            'DELETE': '#ef4444'
        };
        return colores[accion] || '#6b7280';
    };

    const getAccionTexto = (accion) => {
        const textos = {
            'INSERT': 'Creación',
            'UPDATE': 'Modificación',
            'DELETE': 'Eliminación'
        };
        return textos[accion] || accion;
    };

    const getTablaTexto = (codigo) => {
        const tabla = catalogos.tablas.find(t => t.codigo === codigo);
        return tabla ? tabla.nombre : codigo;
    };

    const getTablaIcono = (codigo) => {
        const tabla = catalogos.tablas.find(t => t.codigo === codigo);
        if (!tabla) return Icons.database();

        const iconos = {
            'calendar': Icons.calendar(),
            'building': Icons.building(),
            'user': Icons.user(),
            'users': Icons.users(),
            'truck': Icons.truck(),
            'package': Icons.package(),
            'route': Icons.route(),
            'receipt': Icons.receipt()
        };

        return iconos[tabla.icono] || Icons.database();
    };

    const exportarAuditoria = () => {
        // Función para exportar a CSV o Excel
        const csv = auditoriasFiltradas.map(a => ({
            Fecha: formatearFecha(a.fecha_modificacion),
            Tabla: getTablaTexto(a.tabla),
            Accion: getAccionTexto(a.accion),
            Usuario: a.usuario_nombre,
            Registro: a.registro_id,
            IP: a.ip_modificacion
        }));

        console.log('Exportar auditoría:', csv);
        Notifications.info('Funcionalidad de exportación pendiente de implementar');
    };

    return e('div', {
        style: { padding: '1.5rem', maxWidth: '100%', minHeight: '100vh' }
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
                    key: 'title-content',
                    style: { display: 'flex', alignItems: 'center', gap: '0.75rem' }
                }, [
                    e('div', {
                        key: 'icon-container',
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#dc2626',
                            borderRadius: '12px',
                            color: 'white'
                        }
                    }, Icons.shield()),
                    e('div', { key: 'title-text' }, [
                        e('h1', {
                            key: 'main-title',
                            style: {
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: '#111827',
                                margin: '0',
                                lineHeight: '1.2'
                            }
                        }, 'Gestión de Auditorías'),
                        e('p', {
                            key: 'description',
                            style: {
                                color: '#6b7280',
                                margin: '0.25rem 0 0 0',
                                fontSize: '1rem'
                            }
                        }, 'Log completo de cambios en el sistema Magic Travel')
                    ])
                ])
            ]),
            e('div', {
                key: 'header-actions',
                style: { display: 'flex', gap: '0.75rem' }
            }, [
                e('button', {
                    key: 'btn-exportar',
                    onClick: exportarAuditoria,
                    style: {
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#22c55e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [Icons.download(), 'Exportar']),
                e('button', {
                    key: 'btn-actualizar',
                    onClick: cargarAuditorias,
                    style: {
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [Icons.refresh(), 'Actualizar'])
            ])
        ]),

        // Estadísticas de auditoría
        e('div', {
            key: 'stats',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }
        }, [
            e('div', {
                key: 'stat-eventos-total',
                style: {
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb'
                }
            }, [
                e('div', {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }
                }, [
                    e('div', {}, [
                        e('p', {
                            style: {
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                margin: '0 0 0.25rem 0'
                            }
                        }, 'Total Eventos'),
                        e('p', {
                            style: {
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: '#dc2626',
                                margin: '0'
                            }
                        }, estadisticas.total_eventos.toString())
                    ]),
                    e('div', {
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#fecaca',
                            borderRadius: '8px',
                            color: '#dc2626'
                        }
                    }, Icons.database())
                ])
            ]),

            e('div', {
                key: 'stat-eventos-hoy',
                style: {
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb'
                }
            }, [
                e('div', {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }
                }, [
                    e('div', {}, [
                        e('p', {
                            style: {
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                margin: '0 0 0.25rem 0'
                            }
                        }, 'Eventos Hoy'),
                        e('p', {
                            style: {
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: '#3b82f6',
                                margin: '0'
                            }
                        }, estadisticas.eventos_hoy.toString())
                    ]),
                    e('div', {
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#dbeafe',
                            borderRadius: '8px',
                            color: '#3b82f6'
                        }
                    }, Icons.clock())
                ])
            ]),

            e('div', {
                key: 'stat-usuarios-activos',
                style: {
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb'
                }
            }, [
                e('div', {
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }
                }, [
                    e('div', {}, [
                        e('p', {
                            style: {
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                margin: '0 0 0.25rem 0'
                            }
                        }, 'Usuarios Activos'),
                        e('p', {
                            style: {
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: '#22c55e',
                                margin: '0'
                            }
                        }, estadisticas.usuarios_activos.toString())
                    ]),
                    e('div', {
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#dcfce7',
                            borderRadius: '8px',
                            color: '#22c55e'
                        }
                    }, Icons.users())
                ])
            ]),

            e('div', {
                key: 'stat-tabla-top',
                style: {
                    backgroundColor: 'white',
                    padding: '1rem',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }
            }, [
                e('p', {
                    style: { fontSize: '0.75rem', color: '#6b7280', margin: '0' }
                }, 'Tabla Más Modificada'),
                e('p', {
                    style: {
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#f59e0b',
                        margin: '0',
                        textTransform: 'capitalize'
                    }
                }, getTablaTexto(estadisticas.tabla_mas_modificada))
            ])
        ]),

        // Alerta de último evento
        estadisticas.ultimo_evento && e('div', {
            key: 'last-event-alert',
            style: {
                backgroundColor: '#fef3c7',
                border: '1px solid #fbbf24',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }
        }, [
            e('div', {
                style: { color: '#f59e0b' }
            }, Icons.info()),
            e('div', { style: { flex: 1 } }, [
                e('p', {
                    style: {
                        fontSize: '0.875rem',
                        color: '#92400e',
                        margin: '0',
                        fontWeight: '500'
                    }
                }, 'Último evento registrado:'),
                e('p', {
                    style: {
                        fontSize: '0.75rem',
                        color: '#a16207',
                        margin: '0'
                    }
                }, `${getAccionTexto(estadisticas.ultimo_evento.accion)} en ${getTablaTexto(estadisticas.ultimo_evento.tabla)} por ${estadisticas.ultimo_evento.usuario_nombre} - ${formatearFecha(estadisticas.ultimo_evento.fecha_modificacion)}`)
            ])
        ]),

        // Filtros
        e('div', {
            key: 'filters',
            style: {
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }
        }, [
            e('div', {
                key: 'filters-row',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    alignItems: 'end'
                }
            }, [
                // Búsqueda
                e('div', { key: 'search-input' }, [
                    e('label', {
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Buscar en auditoría'),
                    e('div', { style: { position: 'relative' } }, [
                        e('input', {
                            type: 'text',
                            placeholder: 'Usuario, tabla, ID, IP...',
                            value: searchTerm,
                            onChange: (e) => setSearchTerm(e.target.value),
                            style: {
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '0.875rem'
                            }
                        }),
                        e('div', {
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

                // Filtro tabla
                e('div', { key: 'filter-tabla' }, [
                    e('label', {
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Tabla'),
                    e('select', {
                        value: filtroTabla,
                        onChange: (e) => setFiltroTabla(e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    }, [
                        e('option', { value: 'todas' }, 'Todas las tablas'),
                        ...catalogos.tablas.map(tabla =>
                            e('option', {
                                key: tabla.codigo,
                                value: tabla.codigo
                            }, tabla.nombre)
                        )
                    ])
                ]),

                // Filtro acción
                e('div', { key: 'filter-accion' }, [
                    e('label', {
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Acción'),
                    e('select', {
                        value: filtroAccion,
                        onChange: (e) => setFiltroAccion(e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    }, [
                        e('option', { value: 'todas' }, 'Todas'),
                        e('option', { value: 'INSERT' }, 'Creaciones'),
                        e('option', { value: 'UPDATE' }, 'Modificaciones'),
                        e('option', { value: 'DELETE' }, 'Eliminaciones')
                    ])
                ]),

                // Filtro fecha
                e('div', { key: 'filter-fecha' }, [
                    e('label', {
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Período'),
                    e('select', {
                        value: filtroFecha,
                        onChange: (e) => setFiltroFecha(e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    }, [
                        e('option', { value: 'todas' }, 'Todas'),
                        e('option', { value: 'hoy' }, 'Hoy'),
                        e('option', { value: 'ayer' }, 'Ayer'),
                        e('option', { value: 'semana' }, 'Esta semana'),
                        e('option', { value: 'mes' }, 'Este mes')
                    ])
                ])
            ])
        ]),

        // Lista de auditorías
        e('div', {
            key: 'auditorias-list',
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }
        }, [
            loading ? e('div', {
                key: 'loading',
                style: {
                    padding: '3rem',
                    textAlign: 'center'
                }
            }, [
                e('div', {
                    style: {
                        width: '32px',
                        height: '32px',
                        border: '3px solid #f3f4f6',
                        borderTop: '3px solid #dc2626',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }
                }),
                e('p', { style: { color: '#6b7280' } }, 'Cargando eventos de auditoría...')
            ]) : auditoriasFiltradas.length > 0 ? auditoriasFiltradas.map((auditoria, index) =>
                e('div', {
                    key: `auditoria-${auditoria.auditoria_id || index}`,
                    style: {
                        padding: '1.5rem',
                        borderBottom: index < auditoriasFiltradas.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }
                }, [
                    e('div', {
                        key: 'auditoria-content',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }
                    }, [
                        e('div', {
                            key: 'auditoria-info',
                            style: { flex: 1 }
                        }, [
                            e('div', {
                                key: 'auditoria-header',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    marginBottom: '0.5rem'
                                }
                            }, [
                                e('div', {
                                    key: 'tabla-icono',
                                    style: {
                                        padding: '0.5rem',
                                        backgroundColor: '#f3f4f6',
                                        borderRadius: '6px',
                                        color: '#374151'
                                    }
                                }, getTablaIcono(auditoria.tabla)),

                                e('h3', {
                                    key: 'evento-titulo',
                                    style: {
                                        fontSize: '1.125rem',
                                        fontWeight: '600',
                                        color: '#111827',
                                        margin: '0'
                                    }
                                }, `${getAccionTexto(auditoria.accion)} en ${getTablaTexto(auditoria.tabla)}`),

                                e('span', {
                                    key: 'registro-id',
                                    style: {
                                        padding: '0.25rem 0.5rem',
                                        backgroundColor: '#f3f4f6',
                                        color: '#374151',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontFamily: 'monospace'
                                    }
                                }, `ID: ${auditoria.registro_id}`),

                                e('span', {
                                    key: 'accion-badge',
                                    style: {
                                        padding: '0.25rem 0.5rem',
                                        backgroundColor: getAccionColor(auditoria.accion) + '20',
                                        color: getAccionColor(auditoria.accion),
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500'
                                    }
                                }, getAccionTexto(auditoria.accion))
                            ]),

                            e('div', {
                                key: 'auditoria-details',
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '1rem',
                                    color: '#6b7280',
                                    fontSize: '0.875rem'
                                }
                            }, [
                                e('div', { key: 'usuario-info' }, [
                                    e('p', { style: { margin: '0 0 0.25rem 0' } }, [
                                        e('strong', {}, 'Usuario: '),
                                        auditoria.usuario_nombre
                                    ]),
                                    e('p', { style: { margin: '0 0 0.25rem 0' } }, [
                                        e('strong', {}, 'IP: '),
                                        auditoria.ip_modificacion || 'N/A'
                                    ]),
                                    e('p', { style: { margin: '0' } }, [
                                        e('strong', {}, 'Fecha: '),
                                        formatearFecha(auditoria.fecha_modificacion)
                                    ])
                                ]),

                                e('div', { key: 'cambios-info' }, [
                                    e('p', { style: { margin: '0 0 0.25rem 0' } }, [
                                        e('strong', {}, 'Registro ID: '),
                                        auditoria.registro_id
                                    ]),
                                    auditoria.campos_modificados && auditoria.campos_modificados.length > 0 && e('p', {
                                        style: { margin: '0 0 0.25rem 0' }
                                    }, [
                                        e('strong', {}, 'Campos: '),
                                        auditoria.campos_modificados.join(', ')
                                    ]),
                                    e('p', { style: { margin: '0' } }, [
                                        e('strong', {}, 'Evento: '),
                                        `#${auditoria.auditoria_id}`
                                    ])
                                ])
                            ])
                        ]),

                        e('div', {
                            key: 'auditoria-actions',
                            style: {
                                display: 'flex',
                                gap: '0.5rem',
                                alignItems: 'center'
                            }
                        }, [
                            e('button', {
                                key: 'btn-detalles',
                                onClick: () => abrirModalDetalles(auditoria),
                                style: {
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    backgroundColor: 'white',
                                    color: '#374151',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }
                            }, Icons.eye())
                        ])
                    ])
                ])
            ) : e('div', {
                key: 'no-auditorias',
                style: {
                    padding: '3rem',
                    textAlign: 'center'
                }
            }, [
                e('div', {
                    key: 'no-auditorias-icon',
                    style: {
                        fontSize: '3rem',
                        color: '#d1d5db',
                        marginBottom: '1rem'
                    }
                }, Icons.shield()),
                e('h3', {
                    key: 'no-auditorias-title',
                    style: {
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#374151',
                        margin: '0 0 0.5rem 0'
                    }
                }, 'No hay eventos de auditoría'),
                e('p', {
                    key: 'no-auditorias-text',
                    style: {
                        color: '#6b7280',
                        margin: '0'
                    }
                }, 'Los eventos aparecen automáticamente cuando se realizan cambios en el sistema')
            ])
        ]),

        // Modal de detalles
        modalDetalles && auditoriaSeleccionada && e('div', {
            key: 'modal-detalles',
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
                zIndex: 1100,
                padding: '1rem'
            }
        }, [
            e('div', {
                key: 'modal-detalles-content',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    maxWidth: '800px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto'
                }
            }, [
                e('div', {
                    key: 'modal-header',
                    style: {
                        padding: '1.5rem',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }
                }, [
                    e('div', {
                        style: { display: 'flex', alignItems: 'center', gap: '0.75rem' }
                    }, [
                        e('div', {
                            style: {
                                padding: '0.5rem',
                                backgroundColor: getAccionColor(auditoriaSeleccionada.accion) + '20',
                                borderRadius: '6px',
                                color: getAccionColor(auditoriaSeleccionada.accion)
                            }
                        }, getTablaIcono(auditoriaSeleccionada.tabla)),
                        e('h3', {
                            style: {
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: '#111827',
                                margin: '0'
                            }
                        }, `Evento de Auditoría #${auditoriaSeleccionada.auditoria_id}`)
                    ]),
                    e('button', {
                        onClick: cerrarModales,
                        style: {
                            padding: '0.5rem',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            fontSize: '1.5rem'
                        }
                    }, Icons.x())
                ]),

                e('div', {
                    key: 'modal-body',
                    style: { padding: '1.5rem' }
                }, [
                    // Información del evento
                    e('div', {
                        key: 'evento-info',
                        style: {
                            marginBottom: '2rem'
                        }
                    }, [
                        e('h4', {
                            style: {
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: '#111827',
                                marginBottom: '1rem'
                            }
                        }, 'Información del Evento'),
                        e('div', {
                            style: {
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                fontSize: '0.875rem'
                            }
                        }, [
                            e('div', {}, [
                                e('p', { style: { margin: '0 0 0.5rem 0' } }, [
                                    e('strong', {}, 'Tabla: '),
                                    getTablaTexto(auditoriaSeleccionada.tabla)
                                ]),
                                e('p', { style: { margin: '0 0 0.5rem 0' } }, [
                                    e('strong', {}, 'Acción: '),
                                    getAccionTexto(auditoriaSeleccionada.accion)
                                ]),
                                e('p', { style: { margin: '0' } }, [
                                    e('strong', {}, 'Registro ID: '),
                                    auditoriaSeleccionada.registro_id
                                ])
                            ]),
                            e('div', {}, [
                                e('p', { style: { margin: '0 0 0.5rem 0' } }, [
                                    e('strong', {}, 'Usuario: '),
                                    auditoriaSeleccionada.usuario_nombre
                                ]),
                                e('p', { style: { margin: '0 0 0.5rem 0' } }, [
                                    e('strong', {}, 'Fecha: '),
                                    formatearFecha(auditoriaSeleccionada.fecha_modificacion)
                                ]),
                                e('p', { style: { margin: '0' } }, [
                                    e('strong', {}, 'IP: '),
                                    auditoriaSeleccionada.ip_modificacion || 'N/A'
                                ])
                            ])
                        ])
                    ]),

                    // Cambios realizados (solo para UPDATE)
                    auditoriaSeleccionada.accion === 'UPDATE' && auditoriaSeleccionada.datos_anteriores && e('div', {
                        key: 'cambios-section',
                        style: { marginBottom: '2rem' }
                    }, [
                        e('h4', {
                            style: {
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: '#111827',
                                marginBottom: '1rem'
                            }
                        }, 'Cambios Realizados'),
                        e('div', {
                            style: {
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem'
                            }
                        }, [
                            e('div', {
                                key: 'datos-anteriores',
                                style: {
                                    padding: '1rem',
                                    backgroundColor: '#fef2f2',
                                    borderRadius: '8px',
                                    border: '1px solid #fecaca'
                                }
                            }, [
                                e('h5', {
                                    style: {
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#dc2626',
                                        margin: '0 0 0.5rem 0'
                                    }
                                }, 'Valores Anteriores'),
                                e('pre', {
                                    style: {
                                        fontSize: '0.75rem',
                                        color: '#374151',
                                        margin: '0',
                                        whiteSpace: 'pre-wrap',
                                        fontFamily: 'monospace'
                                    }
                                }, JSON.stringify(auditoriaSeleccionada.datos_anteriores, null, 2))
                            ]),

                            e('div', {
                                key: 'datos-nuevos',
                                style: {
                                    padding: '1rem',
                                    backgroundColor: '#f0f9ff',
                                    borderRadius: '8px',
                                    border: '1px solid #bae6fd'
                                }
                            }, [
                                e('h5', {
                                    style: {
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#0284c7',
                                        margin: '0 0 0.5rem 0'
                                    }
                                }, 'Valores Nuevos'),
                                e('pre', {
                                    style: {
                                        fontSize: '0.75rem',
                                        color: '#374151',
                                        margin: '0',
                                        whiteSpace: 'pre-wrap',
                                        fontFamily: 'monospace'
                                    }
                                }, JSON.stringify(auditoriaSeleccionada.datos_nuevos, null, 2))
                            ])
                        ])
                    ]),

                    // Datos del registro (para INSERT)
                    auditoriaSeleccionada.accion === 'INSERT' && auditoriaSeleccionada.datos_nuevos && e('div', {
                        key: 'datos-creados',
                        style: { marginBottom: '2rem' }
                    }, [
                        e('h4', {
                            style: {
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: '#111827',
                                marginBottom: '1rem'
                            }
                        }, 'Datos del Nuevo Registro'),
                        e('div', {
                            style: {
                                padding: '1rem',
                                backgroundColor: '#f0fdf4',
                                borderRadius: '8px',
                                border: '1px solid #bbf7d0'
                            }
                        }, [
                            e('pre', {
                                style: {
                                    fontSize: '0.75rem',
                                    color: '#374151',
                                    margin: '0',
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: 'monospace'
                                }
                            }, JSON.stringify(auditoriaSeleccionada.datos_nuevos, null, 2))
                        ])
                    ])
                ])
            ])
        ])
    ]);
}

export default GestionAuditorias;
