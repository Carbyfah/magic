// src/resources/js/components/comercial/clientes/GestionClientes.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';

const { createElement: e, useState, useEffect } = React;

function GestionClientes() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalAbierto, setModalAbierto] = useState(false);
    const [clienteEditando, setClienteEditando] = useState(null);
    const [mostrarInactivos, setMostrarInactivos] = useState(false);
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [filtroPais, setFiltroPais] = useState('todos');

    const [clientesFiltrados, setClientesFiltrados] = useState([]);
    useEffect(() => {
        setClientesFiltrados(clientes);
    }, [clientes]);

    const [modalDuplicados, setModalDuplicados] = useState(false);
    const [duplicadoEncontrado, setDuplicadoEncontrado] = useState(null);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [modalHistorial, setModalHistorial] = useState(false);
    const [modalCredito, setModalCredito] = useState(false);

    const [modalConfirmacion, setModalConfirmacion] = useState(false);
    const [accionConfirmacion, setAccionConfirmacion] = useState(null);
    const [clienteConfirmacion, setClienteConfirmacion] = useState(null);

    // Estados para catálogos
    const [tiposCliente, setTiposCliente] = useState([]);
    const [paises, setPaises] = useState([]);

    // Datos del formulario
    const [formulario, setFormulario] = useState({
        // Datos de persona
        nombres: '',
        apellidos: '',
        documento_identidad: '',
        email: '',
        telefono_principal: '',
        whatsapp: '',
        direccion: '',

        // Datos de cliente
        codigo_cliente: '',
        tipo_cliente_id: '',
        pais_residencia_id: '',
        ciudad_residencia: '',
        limite_credito: 0.00,
        referido_por: '',
        situacion: 1
    });

    const [errores, setErrores] = useState({});
    const [estadisticas, setEstadisticas] = useState({
        total_clientes: 0,
        activos: 0,
        con_credito: 0,
        limite_promedio: 0
    });

    // FUNCIONES PARA MODAL DE CONFIRMACIÓN
    const abrirModalConfirmacion = (cliente, accion) => {
        setClienteConfirmacion(cliente);
        setAccionConfirmacion(accion);
        setModalConfirmacion(true);
    };

    const cerrarModalConfirmacion = () => {
        setModalConfirmacion(false);
        setClienteConfirmacion(null);
        setAccionConfirmacion(null);
    };

    const ejecutarCambioEstado = async () => {
        if (!clienteConfirmacion) return;

        try {
            const nuevoEstado = clienteConfirmacion.situacion === 1 ? 0 : 1;
            const response = await fetch(`/api/v1/clientes/${clienteConfirmacion.id}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ situacion: nuevoEstado })
            });

            if (response.ok) {
                Notifications.success(
                    nuevoEstado === 1
                        ? 'Cliente activado exitosamente'
                        : 'Cliente desactivado exitosamente'
                );
                cerrarModalConfirmacion();
                cargarDatos();
            } else {
                Notifications.error('Error al cambiar estado del cliente');
            }
        } catch (error) {
            console.error('Error:', error);
            Notifications.error('Error al cambiar estado del cliente');
        }
    };

    useEffect(() => {
        cargarDatos();
        cargarCatalogos();
    }, []);

    useEffect(() => {
        filtrarClientes();
    }, [searchTerm, filtroTipo, filtroPais, mostrarInactivos]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/v1/clientes', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setClientes(Array.isArray(data) ? data : data.data || []);
                calcularEstadisticas(data);
            }
        } catch (error) {
            console.error('Error:', error);
            Notifications.error('Error al cargar clientes');
        } finally {
            setLoading(false);
        }
    };

    const cargarCatalogos = async () => {
        try {
            const [tiposRes, paisesRes] = await Promise.all([
                fetch('/api/v1/tipos-cliente'),
                fetch('/api/v1/paises')
            ]);

            if (tiposRes.ok) {
                const data = await tiposRes.json();
                setTiposCliente(Array.isArray(data) ? data : data.data || []);
            }
            if (paisesRes.ok) {
                const data = await paisesRes.json();
                setPaises(Array.isArray(data) ? data : data.data || []);
            }
        } catch (error) {
            console.error('Error cargando catálogos:', error);
        }
    };

    const calcularEstadisticas = (data) => {
        const clientesArray = Array.isArray(data) ? data : data.data || [];
        setEstadisticas({
            total_clientes: clientesArray.length,
            activos: clientesArray.filter(c => c.situacion === 1).length,
            con_credito: clientesArray.filter(c => c.limite_credito > 0).length,
            limite_promedio: clientesArray.length > 0 ?
                clientesArray.reduce((acc, c) => acc + parseFloat(c.limite_credito || 0), 0) / clientesArray.length : 0
        });
    };

    const filtrarClientes = () => {
        let clientesFiltrados = [...clientes];

        // Filtro por búsqueda
        if (searchTerm.trim()) {
            const termino = searchTerm.toLowerCase();
            clientesFiltrados = clientesFiltrados.filter(cliente =>
                cliente.persona?.nombres?.toLowerCase().includes(termino) ||
                cliente.persona?.apellidos?.toLowerCase().includes(termino) ||
                cliente.codigo_cliente?.toLowerCase().includes(termino) ||
                cliente.persona?.documento_identidad?.toLowerCase().includes(termino) ||
                cliente.persona?.email?.toLowerCase().includes(termino) ||
                cliente.persona?.telefono_principal?.toLowerCase().includes(termino)
            );
        }

        // Filtro por tipo
        if (filtroTipo !== 'todos') {
            clientesFiltrados = clientesFiltrados.filter(cliente =>
                cliente.tipo_cliente_id?.toString() === filtroTipo
            );
        }

        // Filtro por país
        if (filtroPais !== 'todos') {
            clientesFiltrados = clientesFiltrados.filter(cliente =>
                cliente.pais_residencia_id?.toString() === filtroPais
            );
        }

        // Filtro por situación activa/inactiva
        if (mostrarInactivos) {
            // Si está marcado "Mostrar inactivos", mostrar TODOS (activos + inactivos)
            // No filtrar nada
        } else {
            // Si NO está marcado, mostrar SOLO ACTIVOS
            clientesFiltrados = clientesFiltrados.filter(cliente => cliente.situacion === 1);
        }

        setClientesFiltrados(clientesFiltrados);
    };

    const abrirModal = (cliente = null) => {
        if (cliente) {
            setClienteEditando(cliente);
            setFormulario({
                // Datos de persona
                nombres: cliente.persona?.nombres || '',
                apellidos: cliente.persona?.apellidos || '',
                documento_identidad: cliente.persona?.documento_identidad || '',
                email: cliente.persona?.email || '',
                telefono_principal: cliente.persona?.telefono_principal || '',
                whatsapp: cliente.persona?.whatsapp || '',
                direccion: cliente.persona?.direccion || '',

                // Datos de cliente
                codigo_cliente: cliente.codigo_cliente || '',
                tipo_cliente_id: cliente.tipo_cliente_id || '',
                pais_residencia_id: cliente.pais_residencia_id || '',
                ciudad_residencia: cliente.ciudad_residencia || '',
                limite_credito: cliente.limite_credito || 0.00,
                referido_por: cliente.referido_por || '',
                situacion: cliente.situacion !== undefined ? cliente.situacion : 1
            });
        } else {
            setClienteEditando(null);
            setFormulario({
                nombres: '',
                apellidos: '',
                documento_identidad: '',
                email: '',
                telefono_principal: '',
                whatsapp: '',
                direccion: '',
                codigo_cliente: '',
                tipo_cliente_id: '',
                pais_residencia_id: '',
                ciudad_residencia: '',
                limite_credito: 0.00,
                referido_por: '',
                situacion: 1
            });
        }
        setErrores({});
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setClienteEditando(null);
        setErrores({});
    };

    const manejarCambioFormulario = (campo, valor) => {
        setFormulario(prev => ({ ...prev, [campo]: valor }));
        if (errores[campo]) {
            setErrores(prev => ({ ...prev, [campo]: '' }));
        }
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formulario.nombres.trim()) {
            nuevosErrores.nombres = 'Los nombres son requeridos';
        }
        if (!formulario.apellidos.trim()) {
            nuevosErrores.apellidos = 'Los apellidos son requeridos';
        }
        if (!formulario.tipo_cliente_id) {
            nuevosErrores.tipo_cliente_id = 'El tipo de cliente es requerido';
        }

        // Email opcional pero si se llena debe ser válido
        if (formulario.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email)) {
            nuevosErrores.email = 'Formato de email inválido';
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const verificarDuplicados = async () => {
        try {
            const datosVerificacion = {
                documento_identidad: formulario.documento_identidad,
                email: formulario.email,
                id_actual: clienteEditando?.id
            };

            const response = await fetch('/api/v1/clientes/verificar-duplicados', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosVerificacion)
            });

            if (response.ok) {
                const duplicados = await response.json();
                if (duplicados.encontrados) {
                    setDuplicadoEncontrado(duplicados.cliente);
                    setModalDuplicados(true);
                    return false;
                }
            }
            return true;
        } catch (error) {
            console.error('Error verificando duplicados:', error);
            return true;
        }
    };

    const reactivarClienteExistente = async () => {
        try {
            const response = await fetch(`/api/v1/clientes/${duplicadoEncontrado.id}/reactivar`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formulario)
            });

            if (response.ok) {
                Notifications.success('Cliente reactivado y actualizado exitosamente');
                setModalDuplicados(false);
                cerrarModal();
                cargarDatos();
            }
        } catch (error) {
            Notifications.error('Error al reactivar cliente');
        }
    };

    const verHistorialCliente = (cliente) => {
        setClienteSeleccionado(cliente);
        setModalHistorial(true);
    };

    const gestionarCredito = (cliente) => {
        setClienteSeleccionado(cliente);
        setModalCredito(true);
    };

    const guardarCliente = async () => {
        if (!validarFormulario()) return;

        if (formulario.documento_identidad || formulario.email) {
            const sinDuplicados = await verificarDuplicados();
            if (!sinDuplicados) return;
        }

        try {
            setLoading(true);

            Notifications.info(
                clienteEditando ? 'Actualizando cliente...' : 'Guardando cliente...',
                'Procesando'
            );

            cerrarModal();

            const url = clienteEditando
                ? `/api/v1/clientes/${clienteEditando.id}`
                : '/api/v1/clientes';

            const method = clienteEditando ? 'PUT' : 'POST';

            const datosEnvio = { ...formulario };

            if (!clienteEditando) {
                delete datosEnvio.codigo_cliente;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosEnvio)
            });

            if (response.ok) {
                const clienteCreado = await response.json();

                const mensaje = clienteEditando
                    ? 'Cliente actualizado exitosamente'
                    : `Cliente creado exitosamente con código: ${clienteCreado.data?.codigo_cliente || clienteCreado.codigo_cliente}`;

                Notifications.success(mensaje);
                cargarDatos();
            } else {
                const errorData = await response.json();

                if (errorData.errors) {
                    setErrores(errorData.errors);
                    setModalAbierto(true);
                    Notifications.error('Errores de validación. Revise los campos marcados.');
                } else {
                    Notifications.error('Error al guardar cliente');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            Notifications.error('Error de conexión al guardar cliente');
            setModalAbierto(true);
        } finally {
            setLoading(false);
        }
    };

    const getTipoColor = (tipo) => {
        const colores = {
            'REG': '#3b82f6',
            'VIP': '#8b5cf6',
            'COR': '#10b981',
            'TUR': '#f59e0b'
        };
        return colores[tipo?.codigo] || '#6b7280';
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
                            backgroundColor: '#10b981',
                            borderRadius: '12px',
                            color: 'white'
                        }
                    }, Icons.user()),
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
                        }, 'Gestión de Clientes'),
                        e('p', {
                            key: 'description',
                            style: {
                                color: '#6b7280',
                                margin: '0.25rem 0 0 0',
                                fontSize: '1rem'
                            }
                        }, 'Administración de clientes individuales y empresariales')
                    ])
                ])
            ]),

            e('button', {
                key: 'btn-nuevo',
                onClick: () => abrirModal(),
                style: {
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#10b981',
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
            }, [Icons.plus(), 'Nuevo Cliente'])
        ]),

        // Estadísticas
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
                key: 'stat-total',
                style: {
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
                        }, 'Total Clientes'),
                        e('p', {
                            style: {
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: '#111827',
                                margin: '0'
                            }
                        }, estadisticas.total_clientes.toString())
                    ]),
                    e('div', {
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#ecfdf5',
                            borderRadius: '8px',
                            color: '#10b981'
                        }
                    }, Icons.user())
                ])
            ]),

            e('div', {
                key: 'stat-activos',
                style: {
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
                        }, 'Activos'),
                        e('p', {
                            style: {
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: '#22c55e',
                                margin: '0'
                            }
                        }, estadisticas.activos.toString())
                    ]),
                    e('div', {
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#dcfce7',
                            borderRadius: '8px',
                            color: '#22c55e'
                        }
                    }, Icons.checkCircle())
                ])
            ]),

            e('div', {
                key: 'stat-credito',
                style: {
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
                        }, 'Con Crédito'),
                        e('p', {
                            style: {
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: '#f59e0b',
                                margin: '0'
                            }
                        }, estadisticas.con_credito.toString())
                    ]),
                    e('div', {
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#fef3c7',
                            borderRadius: '8px',
                            color: '#f59e0b'
                        }
                    }, Icons.creditCard())
                ])
            ]),

            e('div', {
                key: 'stat-limite',
                style: {
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
                        }, 'Límite Promedio'),
                        e('p', {
                            style: {
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: '#8b5cf6',
                                margin: '0'
                            }
                        }, `Q${estadisticas.limite_promedio.toFixed(0)}`)
                    ]),
                    e('div', {
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#ede9fe',
                            borderRadius: '8px',
                            color: '#8b5cf6'
                        }
                    }, Icons.trendingUp())
                ])
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
                e('div', { key: 'search-input' }, [
                    e('label', {
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Buscar cliente'),
                    e('div', { style: { position: 'relative' } }, [
                        e('input', {
                            type: 'text',
                            placeholder: 'Nombre, código, documento, email...',
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

                e('div', { key: 'filter-tipo' }, [
                    e('label', {
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Tipo'),
                    e('select', {
                        value: filtroTipo,
                        onChange: (e) => setFiltroTipo(e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    }, [
                        e('option', { key: 'todos', value: 'todos' }, 'Todos los tipos'),
                        ...tiposCliente.map((tipo, idx) =>
                            e('option', { key: `tipo-${tipo.id || idx}`, value: tipo.id.toString() }, tipo.nombre_tipo)
                        )
                    ])
                ]),

                e('div', { key: 'filter-pais' }, [
                    e('label', {
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'País'),
                    e('select', {
                        value: filtroPais,
                        onChange: (e) => setFiltroPais(e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    }, [
                        e('option', { key: 'todos', value: 'todos' }, 'Todos los países'),
                        ...paises.map((pais, idx) =>
                            e('option', { key: `pais-${pais.id || idx}`, value: pais.id.toString() }, pais.nombre_pais)
                        )
                    ])
                ]),

                e('div', {
                    key: 'filter-actions',
                    style: { display: 'flex', gap: '0.5rem', alignItems: 'center' }
                }, [
                    e('label', {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            color: '#374151',
                            cursor: 'pointer'
                        }
                    }, [
                        e('input', {
                            type: 'checkbox',
                            checked: mostrarInactivos,
                            onChange: (e) => setMostrarInactivos(e.target.checked)
                        }),
                        'Mostrar inactivos'
                    ])
                ])
            ])
        ]),

        // Lista de clientes
        e('div', {
            key: 'clientes-list',
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
                        borderTop: '3px solid #10b981',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }
                }),
                e('p', { style: { color: '#6b7280' } }, 'Cargando clientes...')
            ]) : clientesFiltrados.length > 0 ? clientesFiltrados.map((cliente, index) =>
                e('div', {
                    key: `cliente-${cliente.id || index}`,
                    style: {
                        padding: '1.5rem',
                        borderBottom: index < clientesFiltrados.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }
                }, [
                    e('div', {
                        key: 'cliente-content',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }
                    }, [
                        e('div', {
                            key: 'cliente-info',
                            style: { flex: 1 }
                        }, [
                            e('div', {
                                key: 'cliente-header',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    marginBottom: '0.5rem'
                                }
                            }, [
                                e('h3', {
                                    key: 'cliente-nombre',
                                    style: {
                                        fontSize: '1.125rem',
                                        fontWeight: '600',
                                        color: '#111827',
                                        margin: '0'
                                    }
                                }, `${cliente.persona?.nombres || ''} ${cliente.persona?.apellidos || ''}`.trim()),

                                e('span', {
                                    key: 'cliente-codigo',
                                    style: {
                                        padding: '0.25rem 0.5rem',
                                        backgroundColor: '#f3f4f6',
                                        color: '#374151',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontFamily: 'monospace'
                                    }
                                }, cliente.codigo_cliente),

                                cliente.tipo_cliente && e('span', {
                                    key: 'cliente-tipo',
                                    style: {
                                        padding: '0.25rem 0.5rem',
                                        backgroundColor: getTipoColor(cliente.tipo_cliente) + '20',
                                        color: getTipoColor(cliente.tipo_cliente),
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500'
                                    }
                                }, cliente.tipo_cliente.nombre),

                                cliente.limite_credito > 0 && e('span', {
                                    key: 'cliente-credito',
                                    style: {
                                        padding: '0.25rem 0.5rem',
                                        backgroundColor: '#fef3c720',
                                        color: '#f59e0b',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500'
                                    }
                                }, 'Con Crédito')
                            ]),

                            e('div', {
                                key: 'cliente-details',
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '1rem',
                                    color: '#6b7280',
                                    fontSize: '0.875rem'
                                }
                            }, [
                                e('div', { key: 'contact-info' }, [
                                    cliente.persona?.documento_identidad && e('p', { style: { margin: '0 0 0.25rem 0' } }, [
                                        e('strong', {}, 'Documento: '),
                                        cliente.persona.documento_identidad
                                    ]),
                                    cliente.persona?.telefono_principal && e('p', { style: { margin: '0 0 0.25rem 0' } }, [
                                        e('strong', {}, 'Teléfono: '),
                                        cliente.persona.telefono_principal
                                    ]),
                                    cliente.persona?.email && e('p', { style: { margin: '0' } }, [
                                        e('strong', {}, 'Email: '),
                                        cliente.persona.email
                                    ])
                                ]),

                                e('div', { key: 'commercial-info' }, [
                                    cliente.ciudad_residencia && e('p', { style: { margin: '0 0 0.25rem 0' } }, [
                                        e('strong', {}, 'Ciudad: '),
                                        cliente.ciudad_residencia
                                    ]),
                                    e('p', { style: { margin: '0 0 0.25rem 0' } }, [
                                        e('strong', {}, 'Límite Crédito: '),
                                        `Q${parseFloat(cliente.limite_credito || 0).toLocaleString()}`
                                    ]),
                                    cliente.referido_por && e('p', { style: { margin: '0' } }, [
                                        e('strong', {}, 'Referido por: '),
                                        cliente.referido_por
                                    ])
                                ])
                            ])
                        ]),

                        e('div', {
                            key: 'cliente-actions',
                            style: {
                                display: 'flex',
                                gap: '0.5rem',
                                alignItems: 'center'
                            }
                        }, [
                            e('button', {
                                key: 'btn-editar',
                                onClick: () => abrirModal(cliente),
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
                            }, Icons.edit()),

                            cliente.limite_credito > 0 && e('button', {
                                key: 'btn-credito',
                                onClick: () => gestionarCredito(cliente),
                                title: 'Gestionar crédito',
                                style: {
                                    padding: '0.5rem',
                                    border: 'none',
                                    borderRadius: '6px',
                                    backgroundColor: '#fef3c7',
                                    color: '#f59e0b',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }
                            }, Icons.creditCard()),

                            e('button', {
                                key: 'btn-estado',
                                onClick: () => abrirModalConfirmacion(cliente, cliente.situacion === 1 ? 'desactivar' : 'activar'),
                                style: {
                                    padding: '0.5rem',
                                    border: 'none',
                                    borderRadius: '6px',
                                    backgroundColor: cliente.situacion === 1 ? '#fef3c7' : '#dcfce7',
                                    color: cliente.situacion === 1 ? '#f59e0b' : '#22c55e',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }
                            }, cliente.situacion === 1 ? Icons.pause() : Icons.play())
                        ])
                    ])
                ])
            ) : e('div', {
                key: 'no-clientes',
                style: {
                    padding: '3rem',
                    textAlign: 'center'
                }
            }, [
                e('div', {
                    key: 'no-clientes-icon',
                    style: {
                        fontSize: '3rem',
                        color: '#d1d5db',
                        marginBottom: '1rem'
                    }
                }, Icons.user()),
                e('h3', {
                    key: 'no-clientes-title',
                    style: {
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#374151',
                        margin: '0 0 0.5rem 0'
                    }
                }, 'No hay clientes registrados'),
                e('p', {
                    key: 'no-clientes-text',
                    style: {
                        color: '#6b7280',
                        margin: '0 0 1rem 0'
                    }
                }, 'Comienza agregando tu primer cliente'),
                e('button', {
                    key: 'btn-primero',
                    onClick: () => abrirModal(),
                    style: {
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }
                }, 'Crear Primer Cliente')
            ])
        ]),

        // Modal de duplicados
        modalDuplicados && e('div', {
            key: 'modal-duplicados',
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
                zIndex: 1050
            }
        }, [
            e('div', {
                key: 'modal-duplicados-content',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    maxWidth: '500px',
                    width: '90%',
                    padding: '2rem'
                }
            }, [
                e('h3', {
                    key: 'duplicados-title',
                    style: {
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#dc2626',
                        margin: '0 0 1rem 0'
                    }
                }, 'Cliente Duplicado Encontrado'),
                e('p', {
                    key: 'duplicados-message',
                    style: { margin: '0 0 1rem 0', color: '#374151' }
                }, `Se encontró un cliente ${duplicadoEncontrado?.situacion === 0 ? 'inactivo' : 'activo'} con datos similares:`),
                e('div', {
                    key: 'duplicados-info',
                    style: {
                        backgroundColor: '#f3f4f6',
                        padding: '1rem',
                        borderRadius: '8px',
                        margin: '1rem 0'
                    }
                }, [
                    e('p', { style: { margin: '0 0 0.5rem 0' } }, `Código: ${duplicadoEncontrado?.codigo_cliente}`),
                    e('p', { style: { margin: '0 0 0.5rem 0' } }, `Nombre: ${duplicadoEncontrado?.persona?.nombres} ${duplicadoEncontrado?.persona?.apellidos}`),
                    duplicadoEncontrado?.persona?.documento_identidad && e('p', { style: { margin: '0' } }, `Documento: ${duplicadoEncontrado.persona.documento_identidad}`)
                ]),
                e('div', {
                    key: 'duplicados-actions',
                    style: {
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'flex-end'
                    }
                }, [
                    e('button', {
                        key: 'btn-cancelar-duplicados',
                        onClick: () => setModalDuplicados(false),
                        style: {
                            padding: '0.5rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            backgroundColor: 'white',
                            cursor: 'pointer'
                        }
                    }, 'Cancelar'),
                    duplicadoEncontrado?.situacion === 0 && e('button', {
                        key: 'btn-reactivar',
                        onClick: reactivarClienteExistente,
                        style: {
                            padding: '0.5rem 1rem',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: '#22c55e',
                            color: 'white',
                            cursor: 'pointer'
                        }
                    }, 'Reactivar con Datos Actuales')
                ])
            ])
        ]),

        // Modal de confirmación
        modalConfirmacion && e('div', {
            key: 'modal-confirmacion',
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
                zIndex: 1100
            }
        }, [
            e('div', {
                key: 'modal-confirmacion-content',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    maxWidth: '400px',
                    width: '90%',
                    padding: '2rem'
                }
            }, [
                e('div', {
                    key: 'confirmacion-header',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1rem'
                    }
                }, [
                    e('div', {
                        style: {
                            padding: '0.75rem',
                            borderRadius: '50%',
                            backgroundColor: accionConfirmacion === 'activar' ? '#dcfce7' : '#fef3c7'
                        }
                    }, accionConfirmacion === 'activar' ? Icons.play('#22c55e') : Icons.pause('#f59e0b')),
                    e('h3', {
                        style: {
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#111827',
                            margin: '0'
                        }
                    }, accionConfirmacion === 'activar' ? 'Activar Cliente' : 'Desactivar Cliente')
                ]),

                e('p', {
                    key: 'confirmacion-message',
                    style: {
                        margin: '0 0 1rem 0',
                        color: '#374151',
                        lineHeight: '1.5'
                    }
                }, `¿Está seguro que desea ${accionConfirmacion} el cliente "${clienteConfirmacion?.persona?.nombres} ${clienteConfirmacion?.persona?.apellidos}"?`),

                clienteConfirmacion && e('div', {
                    key: 'cliente-info',
                    style: {
                        backgroundColor: '#f9fafb',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        marginBottom: '1.5rem',
                        fontSize: '0.875rem',
                        color: '#6b7280'
                    }
                }, [
                    e('p', { style: { margin: '0' } }, `Código: ${clienteConfirmacion.codigo_cliente}`),
                    clienteConfirmacion.persona?.documento_identidad && e('p', { style: { margin: '0' } }, `Documento: ${clienteConfirmacion.persona.documento_identidad}`)
                ]),

                e('div', {
                    key: 'confirmacion-actions',
                    style: {
                        display: 'flex',
                        gap: '0.75rem',
                        justifyContent: 'flex-end'
                    }
                }, [
                    e('button', {
                        key: 'btn-cancelar-confirmacion',
                        onClick: cerrarModalConfirmacion,
                        style: {
                            padding: '0.75rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                        }
                    }, 'Cancelar'),
                    e('button', {
                        key: 'btn-confirmar',
                        onClick: ejecutarCambioEstado,
                        style: {
                            padding: '0.75rem 1rem',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: accionConfirmacion === 'activar' ? '#22c55e' : '#f59e0b',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                        }
                    }, accionConfirmacion === 'activar' ? 'Activar' : 'Desactivar')
                ])
            ])
        ]),

        // Modal de formulario principal
        modalAbierto && e('div', {
            key: 'modal-overlay',
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
                zIndex: 1000,
                padding: '1rem'
            }
        }, [
            e('div', {
                key: 'modal-content',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    maxWidth: '800px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
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
                    e('h3', {
                        style: {
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: '#111827',
                            margin: '0'
                        }
                    }, clienteEditando ? 'Editar Cliente' : 'Nuevo Cliente'),
                    e('button', {
                        onClick: cerrarModal,
                        style: {
                            padding: '0.5rem',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            fontSize: '1.5rem'
                        }
                    }, '×')
                ]),
                e('div', {
                    key: 'modal-form',
                    style: { padding: '1.5rem' }
                }, [
                    e('div', {
                        key: 'form-grid',
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '1rem'
                        }
                    }, [
                        // Información personal
                        e('div', {
                            key: 'personal-info',
                            style: {
                                gridColumn: 'span 2',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '1rem'
                            }
                        }, [
                            e('h4', {
                                style: {
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: '#111827',
                                    margin: '0 0 1rem 0'
                                }
                            }, 'Información Personal'),

                            e('div', {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '1rem'
                                }
                            }, [
                                e('div', { key: 'campo-nombres' }, [
                                    e('label', {
                                        style: {
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '0.5rem'
                                        }
                                    }, 'Nombres *'),
                                    e('input', {
                                        type: 'text',
                                        value: formulario.nombres,
                                        onChange: (e) => manejarCambioFormulario('nombres', e.target.value),
                                        style: {
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: errores.nombres ? '1px solid #ef4444' : '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem'
                                        },
                                        placeholder: 'Juan Carlos'
                                    }),
                                    errores.nombres && e('p', {
                                        style: {
                                            color: '#ef4444',
                                            fontSize: '0.75rem',
                                            margin: '0.25rem 0 0 0'
                                        }
                                    }, errores.nombres)
                                ]),

                                e('div', { key: 'campo-apellidos' }, [
                                    e('label', {
                                        style: {
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '0.5rem'
                                        }
                                    }, 'Apellidos *'),
                                    e('input', {
                                        type: 'text',
                                        value: formulario.apellidos,
                                        onChange: (e) => manejarCambioFormulario('apellidos', e.target.value),
                                        style: {
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: errores.apellidos ? '1px solid #ef4444' : '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem'
                                        },
                                        placeholder: 'Pérez López'
                                    }),
                                    errores.apellidos && e('p', {
                                        style: {
                                            color: '#ef4444',
                                            fontSize: '0.75rem',
                                            margin: '0.25rem 0 0 0'
                                        }
                                    }, errores.apellidos)
                                ])
                            ]),

                            e('div', {
                                key: 'documento-identidad',
                                style: { marginTop: '1rem' }
                            }, [
                                e('label', {
                                    style: {
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '0.5rem'
                                    }
                                }, 'Documento de Identidad'),
                                e('input', {
                                    type: 'text',
                                    value: formulario.documento_identidad,
                                    onChange: (e) => manejarCambioFormulario('documento_identidad', e.target.value),
                                    style: {
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: errores.documento_identidad ? '1px solid #ef4444' : '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem'
                                    },
                                    placeholder: 'DPI, Pasaporte, Cédula'
                                }),
                                errores.documento_identidad && e('p', {
                                    style: {
                                        color: '#ef4444',
                                        fontSize: '0.75rem',
                                        margin: '0.25rem 0 0 0'
                                    }
                                }, errores.documento_identidad)
                            ])
                        ]),

                        // Información de contacto
                        e('div', {
                            key: 'contact-info',
                            style: {
                                gridColumn: 'span 2',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '1rem',
                                marginTop: '1rem'
                            }
                        }, [
                            e('h4', {
                                style: {
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: '#111827',
                                    margin: '0 0 1rem 0'
                                }
                            }, 'Información de Contacto'),

                            e('div', {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '1rem'
                                }
                            }, [
                                e('div', { key: 'telefono-principal' }, [
                                    e('label', {
                                        style: {
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '0.5rem'
                                        }
                                    }, 'Teléfono Principal'),
                                    e('input', {
                                        type: 'tel',
                                        value: formulario.telefono_principal,
                                        onChange: (e) => manejarCambioFormulario('telefono_principal', e.target.value),
                                        style: {
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem'
                                        },
                                        placeholder: '+502 1234-5678'
                                    })
                                ]),

                                e('div', { key: 'whatsapp' }, [
                                    e('label', {
                                        style: {
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '0.5rem'
                                        }
                                    }, 'WhatsApp'),
                                    e('input', {
                                        type: 'tel',
                                        value: formulario.whatsapp,
                                        onChange: (e) => manejarCambioFormulario('whatsapp', e.target.value),
                                        style: {
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem'
                                        },
                                        placeholder: '+502 1234-5678'
                                    })
                                ])
                            ]),

                            e('div', {
                                key: 'email',
                                style: { marginTop: '1rem' }
                            }, [
                                e('label', {
                                    style: {
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '0.5rem'
                                    }
                                }, 'Email'),
                                e('input', {
                                    type: 'email',
                                    value: formulario.email,
                                    onChange: (e) => manejarCambioFormulario('email', e.target.value),
                                    style: {
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: errores.email ? '1px solid #ef4444' : '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem'
                                    },
                                    placeholder: 'cliente@email.com'
                                }),
                                errores.email && e('p', {
                                    style: {
                                        color: '#ef4444',
                                        fontSize: '0.75rem',
                                        margin: '0.25rem 0 0 0'
                                    }
                                }, errores.email)
                            ]),

                            e('div', {
                                key: 'direccion',
                                style: { marginTop: '1rem' }
                            }, [
                                e('label', {
                                    style: {
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '0.5rem'
                                    }
                                }, 'Dirección'),
                                e('textarea', {
                                    value: formulario.direccion,
                                    onChange: (e) => manejarCambioFormulario('direccion', e.target.value),
                                    rows: 3,
                                    style: {
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        resize: 'vertical'
                                    },
                                    placeholder: 'Dirección completa del cliente'
                                })
                            ])
                        ]),

                        // Información comercial
                        e('div', {
                            key: 'commercial-info',
                            style: {
                                gridColumn: 'span 2',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '1rem',
                                marginTop: '1rem'
                            }
                        }, [
                            e('h4', {
                                style: {
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: '#111827',
                                    margin: '0 0 1rem 0'
                                }
                            }, 'Información Comercial'),

                            e('div', {
                                key: 'codigo-cliente',
                                style: { marginBottom: '1rem' }
                            }, [
                                e('label', {
                                    style: {
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '0.5rem'
                                    }
                                }, 'Código de Cliente'),
                                e('input', {
                                    type: 'text',
                                    value: clienteEditando ? formulario.codigo_cliente : 'Se generará automáticamente',
                                    readOnly: true,
                                    style: {
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        backgroundColor: '#f9fafb',
                                        cursor: 'not-allowed',
                                        color: '#6b7280'
                                    }
                                }),
                                e('p', {
                                    style: {
                                        color: '#6b7280',
                                        fontSize: '0.75rem',
                                        margin: '0.25rem 0 0 0'
                                    }
                                }, clienteEditando ? 'Código asignado' : 'El sistema generará el código automáticamente')
                            ]),

                            e('div', {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '1rem'
                                }
                            }, [
                                e('div', { key: 'tipo-cliente' }, [
                                    e('label', {
                                        style: {
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '0.5rem'
                                        }
                                    }, 'Tipo de Cliente *'),
                                    e('select', {
                                        value: formulario.tipo_cliente_id,
                                        onChange: (e) => manejarCambioFormulario('tipo_cliente_id', e.target.value),
                                        style: {
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: errores.tipo_cliente_id ? '1px solid #ef4444' : '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem'
                                        }
                                    }, [
                                        e('option', { value: '' }, 'Seleccionar tipo'),
                                        ...tiposCliente.map((tipo, idx) =>
                                            e('option', { key: `tipo-${tipo.id || idx}`, value: tipo.id.toString() }, tipo.nombre_tipo)
                                        )
                                    ]),
                                    errores.tipo_cliente_id && e('p', {
                                        style: {
                                            color: '#ef4444',
                                            fontSize: '0.75rem',
                                            margin: '0.25rem 0 0 0'
                                        }
                                    }, errores.tipo_cliente_id)
                                ]),

                                e('div', { key: 'limite-credito' }, [
                                    e('label', {
                                        style: {
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '0.5rem'
                                        }
                                    }, 'Límite de Crédito'),
                                    e('input', {
                                        type: 'number',
                                        step: '0.01',
                                        min: '0',
                                        value: formulario.limite_credito,
                                        onChange: (e) => manejarCambioFormulario('limite_credito', parseFloat(e.target.value) || 0),
                                        style: {
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem'
                                        },
                                        placeholder: '0.00'
                                    })
                                ])
                            ]),

                            e('div', {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '1rem',
                                    marginTop: '1rem'
                                }
                            }, [
                                e('div', { key: 'pais-residencia' }, [
                                    e('label', {
                                        style: {
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '0.5rem'
                                        }
                                    }, 'País de Residencia'),
                                    e('select', {
                                        value: formulario.pais_residencia_id,
                                        onChange: (e) => manejarCambioFormulario('pais_residencia_id', e.target.value),
                                        style: {
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem'
                                        }
                                    }, [
                                        e('option', { value: '' }, 'Seleccionar país'),
                                        ...paises.map((pais, idx) =>
                                            e('option', { key: `pais-${pais.id || idx}`, value: pais.id.toString() }, pais.nombre_pais)
                                        )
                                    ])
                                ]),

                                e('div', { key: 'ciudad-residencia' }, [
                                    e('label', {
                                        style: {
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '0.5rem'
                                        }
                                    }, 'Ciudad de Residencia'),
                                    e('input', {
                                        type: 'text',
                                        value: formulario.ciudad_residencia,
                                        onChange: (e) => manejarCambioFormulario('ciudad_residencia', e.target.value),
                                        style: {
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem'
                                        },
                                        placeholder: 'Ciudad o región'
                                    })
                                ])
                            ]),

                            e('div', {
                                key: 'referido-por',
                                style: { marginTop: '1rem' }
                            }, [
                                e('label', {
                                    style: {
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '0.5rem'
                                    }
                                }, 'Referido Por'),
                                e('input', {
                                    type: 'text',
                                    value: formulario.referido_por,
                                    onChange: (e) => manejarCambioFormulario('referido_por', e.target.value),
                                    style: {
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem'
                                    },
                                    placeholder: 'Quien lo refirió (opcional)'
                                })
                            ])
                        ])
                    ])
                ]),
                e('div', {
                    key: 'modal-footer',
                    style: {
                        padding: '1.5rem',
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        gap: '0.75rem',
                        justifyContent: 'flex-end'
                    }
                }, [
                    e('button', {
                        onClick: cerrarModal,
                        style: {
                            padding: '0.75rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            cursor: 'pointer'
                        }
                    }, 'Cancelar'),
                    e('button', {
                        onClick: guardarCliente,
                        disabled: loading,
                        style: {
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: loading ? '#9ca3af' : '#10b981',
                            color: 'white',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: loading ? 0.6 : 1
                        }
                    }, [
                        loading && e('div', {
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
                        loading ? 'Guardando...' : 'Guardar'
                    ])
                ])
            ])
        ])
    ]);
}

export default GestionClientes;
