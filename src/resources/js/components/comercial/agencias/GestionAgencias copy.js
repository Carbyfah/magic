// src/resources/js/components/comercial/agencias/GestionAgencias.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';

const { createElement: e, useState, useEffect } = React;

function GestionAgencias() {
    const [agencias, setAgencias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalAbierto, setModalAbierto] = useState(false);
    const [agenciaEditando, setAgenciaEditando] = useState(null);
    const [mostrarInactivas, setMostrarInactivas] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [filtroTipo, setFiltroTipo] = useState('todos');

    const [agenciasFiltradas, setAgenciasFiltradas] = useState([]);
    useEffect(() => {
        setAgenciasFiltradas(agencias);
    }, [agencias]);

    const [modalDuplicados, setModalDuplicados] = useState(false);
    const [duplicadoEncontrado, setDuplicadoEncontrado] = useState(null);
    const [agenciaSeleccionada, setAgenciaSeleccionada] = useState(null);
    const [modalEstadisticas, setModalEstadisticas] = useState(false);
    const [modalHistorial, setModalHistorial] = useState(false);
    const [modalCreditos, setModalCreditos] = useState(false);

    const [modalConfirmacion, setModalConfirmacion] = useState(false);
    const [accionConfirmacion, setAccionConfirmacion] = useState(null);
    const [agenciaConfirmacion, setAgenciaConfirmacion] = useState(null);

    // Estados para catálogos
    const [tiposAgencia, setTiposAgencia] = useState([]);
    const [estadosComercial, setEstadosComercial] = useState([]);
    const [paises, setPaises] = useState([]);
    const [formasPago, setFormasPago] = useState([]);

    // Datos del formulario
    const [formulario, setFormulario] = useState({
        codigo_agencia: '',
        razon_social: '',
        nombre_comercial: '',
        nit: '',
        registro_turistico: '',
        direccion: '',
        telefono_principal: '',
        telefono_secundario: '',
        email_principal: '',
        whatsapp: '',
        pais_id: '',
        contacto_nombre: '',
        contacto_cargo: '',
        contacto_telefono: '',
        contacto_email: '',
        tipo_agencia_id: '',
        comision_porcentaje: 10.00,
        limite_credito: 0.00,
        fecha_inicio_relacion: '',
        forma_pago_id: '',
        estado_comercial_id: '',
        situacion: 1
    });

    const abrirModalConfirmacion = (agencia, accion) => {
        setAgenciaConfirmacion(agencia);
        setAccionConfirmacion(accion);
        setModalConfirmacion(true);
    };

    const cerrarModalConfirmacion = () => {
        setModalConfirmacion(false);
        setAgenciaConfirmacion(null);
        setAccionConfirmacion(null);
    };

    const [errores, setErrores] = useState({});
    const [estadisticas, setEstadisticas] = useState({
        total_agencias: 0,
        activas: 0,
        con_credito: 0,
        comision_promedio: 0
    });

    useEffect(() => {
        cargarDatos();
        cargarCatalogos();
    }, []);

    useEffect(() => {
        filtrarAgencias();
    }, [searchTerm, filtroEstado, filtroTipo, mostrarInactivas]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/v1/agencias', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAgencias(Array.isArray(data) ? data : data.data || []);
                calcularEstadisticas(data);
            }
        } catch (error) {
            console.error('Error:', error);
            Notifications.error('Error al cargar agencias');
        } finally {
            setLoading(false);
        }
    };

    const cargarCatalogos = async () => {
        try {
            const [tiposRes, estadosRes, paisesRes, formasRes] = await Promise.all([
                fetch('/api/v1/tipos-agencia'),
                fetch('/api/v1/estados-comercial'),
                fetch('/api/v1/paises'),
                fetch('/api/v1/formas-pago')
            ]);

            if (tiposRes.ok) {
                const data = await tiposRes.json();
                setTiposAgencia(Array.isArray(data) ? data : data.data || []);
            }
            if (estadosRes.ok) {
                const data = await estadosRes.json();
                setEstadosComercial(Array.isArray(data) ? data : data.data || []);
            }
            if (paisesRes.ok) {
                const data = await paisesRes.json();
                setPaises(Array.isArray(data) ? data : data.data || []);
            }
            if (formasRes.ok) {
                const data = await formasRes.json();
                setFormasPago(Array.isArray(data) ? data : data.data || []);
            }
        } catch (error) {
            console.error('Error cargando catálogos:', error);
        }
    };

    const calcularEstadisticas = (data) => {
        const agenciasArray = Array.isArray(data) ? data : data.data || [];
        setEstadisticas({
            total_agencias: agenciasArray.length,
            activas: agenciasArray.filter(a => a.situacion === 1).length,
            con_credito: agenciasArray.filter(a => a.limite_credito > 0).length,
            comision_promedio: agenciasArray.length > 0 ?
                agenciasArray.reduce((acc, a) => acc + parseFloat(a.comision_porcentaje || 0), 0) / agenciasArray.length : 0
        });
    };

    const filtrarAgencias = () => {
        let agenciasFiltradas = [...agencias];

        // Filtro por búsqueda
        if (searchTerm.trim()) {
            const termino = searchTerm.toLowerCase();
            agenciasFiltradas = agenciasFiltradas.filter(agencia =>
                agencia.razon_social?.toLowerCase().includes(termino) ||
                agencia.nombre_comercial?.toLowerCase().includes(termino) ||
                agencia.codigo_agencia?.toLowerCase().includes(termino) ||
                agencia.nit?.toLowerCase().includes(termino) ||
                agencia.email_principal?.toLowerCase().includes(termino) ||
                agencia.contacto_nombre?.toLowerCase().includes(termino)
            );
        }

        // Filtro por tipo
        if (filtroTipo !== 'todos') {
            agenciasFiltradas = agenciasFiltradas.filter(agencia =>
                agencia.tipo_agencia_id?.toString() === filtroTipo
            );
        }

        // Filtro por estado comercial
        if (filtroEstado !== 'todos') {
            agenciasFiltradas = agenciasFiltradas.filter(agencia =>
                agencia.estado_comercial_id?.toString() === filtroEstado
            );
        }

        // CORREGIR: Filtro por situación activa/inactiva
        if (mostrarInactivas) {
            // Si está marcado "Mostrar inactivas", mostrar TODAS (activas + inactivas)
            // No filtrar nada
        } else {
            // Si NO está marcado, mostrar SOLO ACTIVAS
            agenciasFiltradas = agenciasFiltradas.filter(agencia => agencia.situacion === 1);
        }

        setAgenciasFiltradas(agenciasFiltradas);
    };
    const abrirModal = (agencia = null) => {
        if (agencia) {
            setAgenciaEditando(agencia);
            setFormulario({
                codigo_agencia: agencia.codigo_agencia || '',
                razon_social: agencia.razon_social || '',
                nombre_comercial: agencia.nombre_comercial || '',
                nit: agencia.nit || '',
                registro_turistico: agencia.registro_turistico || '',
                direccion: agencia.direccion || '',
                telefono_principal: agencia.telefono_principal || '',
                telefono_secundario: agencia.telefono_secundario || '',
                email_principal: agencia.email_principal || '',
                whatsapp: agencia.whatsapp || '',
                pais_id: agencia.pais_id || '',
                contacto_nombre: agencia.contacto_nombre || '',
                contacto_cargo: agencia.contacto_cargo || '',
                contacto_telefono: agencia.contacto_telefono || '',
                contacto_email: agencia.contacto_email || '',
                tipo_agencia_id: agencia.tipo_agencia_id || '',
                comision_porcentaje: agencia.comision_porcentaje || 10.00,
                limite_credito: agencia.limite_credito || 0.00,
                fecha_inicio_relacion: agencia.fecha_inicio_relacion || '',
                forma_pago_id: agencia.forma_pago_id || '',
                estado_comercial_id: agencia.estado_comercial_id || '',
                situacion: agencia.situacion !== undefined ? agencia.situacion : 1
            });
        } else {
            setAgenciaEditando(null);
            setFormulario({
                codigo_agencia: '', // Vacío - se genera automáticamente
                razon_social: '',
                nombre_comercial: '',
                nit: '',
                registro_turistico: '',
                direccion: '',
                telefono_principal: '',
                telefono_secundario: '',
                email_principal: '',
                whatsapp: '',
                pais_id: '',
                contacto_nombre: '',
                contacto_cargo: '',
                contacto_telefono: '',
                contacto_email: '',
                tipo_agencia_id: '',
                comision_porcentaje: 10.00,
                limite_credito: 0.00,
                fecha_inicio_relacion: '',
                forma_pago_id: '',
                estado_comercial_id: '',
                situacion: 1
            });
        }
        setErrores({});
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setAgenciaEditando(null);
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

        // Solo validar código si estamos editando una agencia existente
        if (agenciaEditando && !formulario.codigo_agencia.trim()) {
            nuevosErrores.codigo_agencia = 'El código de agencia es requerido';
        }

        if (!formulario.razon_social.trim()) {
            nuevosErrores.razon_social = 'La razón social es requerida';
        }
        if (!formulario.nit.trim()) {
            nuevosErrores.nit = 'El NIT es requerido';
        }
        if (!formulario.telefono_principal.trim()) {
            nuevosErrores.telefono_principal = 'El teléfono principal es requerido';
        }
        if (!formulario.email_principal.trim()) {
            nuevosErrores.email_principal = 'El email principal es requerido';
        }
        if (!formulario.direccion.trim()) {
            nuevosErrores.direccion = 'La dirección es requerida';
        }
        if (!formulario.pais_id) {
            nuevosErrores.pais_id = 'El país es requerido';
        }
        if (!formulario.tipo_agencia_id) {
            nuevosErrores.tipo_agencia_id = 'El tipo de agencia es requerido';
        }
        if (!formulario.forma_pago_id) {
            nuevosErrores.forma_pago_id = 'La forma de pago es requerida';
        }
        if (!formulario.estado_comercial_id) {
            nuevosErrores.estado_comercial_id = 'El estado comercial es requerido';
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const verificarDuplicados = async () => {
        try {
            const datosVerificacion = {
                nit: formulario.nit,
                email_principal: formulario.email_principal,
                id_actual: agenciaEditando?.id
            };

            // Solo verificar código si estamos editando (ya que al crear se genera automático)
            if (agenciaEditando) {
                datosVerificacion.codigo_agencia = formulario.codigo_agencia;
            }

            const response = await fetch('/api/v1/agencias/verificar-duplicados', {
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
                    setDuplicadoEncontrado(duplicados.agencia);
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

    const reactivarAgenciaExistente = async () => {
        try {
            const response = await fetch(`/api/v1/agencias/${duplicadoEncontrado.id}/reactivar`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formulario)
            });

            if (response.ok) {
                Notifications.success('Agencia reactivada y actualizada exitosamente');
                setModalDuplicados(false);
                cerrarModal();
                cargarDatos();
            }
        } catch (error) {
            Notifications.error('Error al reactivar agencia');
        }
    };

    const verEstadisticasAgencia = (agencia) => {
        setAgenciaSeleccionada(agencia);
        setModalEstadisticas(true);
    };

    const verHistorialAgencia = (agencia) => {
        setAgenciaSeleccionada(agencia);
        setModalHistorial(true);
    };

    const gestionarCreditos = (agencia) => {
        setAgenciaSeleccionada(agencia);
        setModalCreditos(true);
    };

    const guardarAgencia = async () => {
        if (!validarFormulario()) return;

        // Verificar duplicados antes de guardar
        const sinDuplicados = await verificarDuplicados();
        if (!sinDuplicados) return;

        try {
            setLoading(true); // Bloquear interfaz inmediatamente

            // Mostrar notificación de inicio
            Notifications.info(
                agenciaEditando ? 'Actualizando agencia...' : 'Guardando agencia...',
                'Procesando'
            );

            // Cerrar modal inmediatamente para evitar doble clic
            cerrarModal();

            const url = agenciaEditando
                ? `/api/v1/agencias/${agenciaEditando.id}`
                : '/api/v1/agencias';

            const method = agenciaEditando ? 'PUT' : 'POST';

            // Preparar datos para envío
            const datosEnvio = { ...formulario };

            // Para nuevas agencias, no enviar el código (lo genera el backend)
            if (!agenciaEditando) {
                delete datosEnvio.codigo_agencia;
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
                const agenciaCreada = await response.json();

                // Notificación de éxito con código generado si es nueva
                const mensaje = agenciaEditando
                    ? 'Agencia actualizada exitosamente'
                    : `Agencia creada exitosamente con código: ${agenciaCreada.data?.codigo_agencia || agenciaCreada.codigo_agencia}`;

                Notifications.success(mensaje);

                // Recargar datos
                cargarDatos();
            } else {
                const errorData = await response.json();

                // Si hay errores de validación, reabrir modal con errores
                if (errorData.errors) {
                    setErrores(errorData.errors);
                    setModalAbierto(true); // Reabrir modal para mostrar errores
                    Notifications.error('Errores de validación. Revise los campos marcados.');
                } else {
                    Notifications.error('Error al guardar agencia');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            Notifications.error('Error de conexión al guardar agencia');

            // En caso de error de red, reabrir modal
            setModalAbierto(true);
        } finally {
            setLoading(false);
        }
    };

    const cambiarEstadoAgencia = async (agencia) => {
        try {
            const nuevoEstado = agencia.situacion === 1 ? 0 : 1;
            const response = await fetch(`/api/v1/agencias/${agencia.id}`, {
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
                        ? 'Agencia activada exitosamente'
                        : 'Agencia desactivada exitosamente'
                );
                cargarDatos();
            }
        } catch (error) {
            console.error('Error:', error);
            Notifications.error('Error al cambiar estado de agencia');
        }
    };

    const getEstadoColor = (estado) => {
        const colores = {
            'ACT': '#22c55e',
            'SUSP': '#f59e0b',
            'MOR': '#ef4444',
            'VIP': '#8b5cf6'
        };
        return colores[estado?.codigo] || '#6b7280';
    };

    const getTipoColor = (tipo) => {
        const colores = {
            'MAY': '#3b82f6',
            'MIN': '#10b981',
            'ONL': '#8b5cf6',
            'HOT': '#f59e0b',
            'TOUR': '#ef4444'
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
                            backgroundColor: '#3b82f6',
                            borderRadius: '12px',
                            color: 'white'
                        }
                    }, Icons.building()),
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
                        }, 'Gestión de Agencias'),
                        e('p', {
                            key: 'description',
                            style: {
                                color: '#6b7280',
                                margin: '0.25rem 0 0 0',
                                fontSize: '1rem'
                            }
                        }, 'Administración de agencias colaboradoras')
                    ])
                ])
            ]),

            e('button', {
                key: 'btn-nueva',
                onClick: () => abrirModal(),
                style: {
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#3b82f6',
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
            }, [Icons.plus(), 'Nueva Agencia'])
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
                        }, 'Total Agencias'),
                        e('p', {
                            style: {
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: '#111827',
                                margin: '0'
                            }
                        }, estadisticas.total_agencias.toString())
                    ]),
                    e('div', {
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#dbeafe',
                            borderRadius: '8px',
                            color: '#3b82f6'
                        }
                    }, Icons.building())
                ])
            ]),

            e('div', {
                key: 'stat-activas',
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
                        }, 'Activas'),
                        e('p', {
                            style: {
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: '#22c55e',
                                margin: '0'
                            }
                        }, estadisticas.activas.toString())
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
                key: 'stat-comision',
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
                        }, 'Comisión Promedio'),
                        e('p', {
                            style: {
                                fontSize: '1.875rem',
                                fontWeight: '700',
                                color: '#8b5cf6',
                                margin: '0'
                            }
                        }, `${estadisticas.comision_promedio.toFixed(1)}%`)
                    ]),
                    e('div', {
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#ede9fe',
                            borderRadius: '8px',
                            color: '#8b5cf6'
                        }
                    }, Icons.percentage())
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
                    }, 'Buscar agencia'),
                    e('div', { style: { position: 'relative' } }, [
                        e('input', {
                            type: 'text',
                            placeholder: 'Razón social, NIT, código...',
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
                        ...tiposAgencia.map((tipo, idx) =>
                            e('option', { key: `tipo-${tipo.id || idx}`, value: tipo.id.toString() }, tipo.nombre_tipo)
                        )
                    ])
                ]),

                e('div', { key: 'filter-estado' }, [
                    e('label', {
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Estado'),
                    e('select', {
                        value: filtroEstado,
                        onChange: (e) => setFiltroEstado(e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    }, [
                        e('option', { key: 'todos', value: 'todos' }, 'Todos los estados'),
                        ...estadosComercial.map((estado, idx) =>
                            e('option', { key: `estado-${estado.id || idx}`, value: estado.id.toString() }, estado.nombre_estado)
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
                            checked: mostrarInactivas,
                            onChange: (e) => setMostrarInactivas(e.target.checked)
                        }),
                        'Mostrar inactivas'
                    ])
                ])
            ])
        ]),

        // Lista de agencias
        e('div', {
            key: 'agencias-list',
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
                        borderTop: '3px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }
                }),
                e('p', { style: { color: '#6b7280' } }, 'Cargando agencias...')
            ]) : agenciasFiltradas.length > 0 ? agenciasFiltradas.map((agencia, index) =>
                e('div', {
                    key: `agencia-${agencia.id || index}`,
                    style: {
                        padding: '1.5rem',
                        borderBottom: index < agencias.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }
                }, [
                    e('div', {
                        key: 'agencia-content',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }
                    }, [
                        e('div', {
                            key: 'agencia-info',
                            style: { flex: 1 }
                        }, [
                            e('div', {
                                key: 'agencia-header',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    marginBottom: '0.5rem'
                                }
                            }, [
                                e('h3', {
                                    key: 'agencia-nombre',
                                    style: {
                                        fontSize: '1.125rem',
                                        fontWeight: '600',
                                        color: '#111827',
                                        margin: '0'
                                    }
                                }, agencia.razon_social || agencia.nombre_comercial),

                                e('span', {
                                    key: 'agencia-codigo',
                                    style: {
                                        padding: '0.25rem 0.5rem',
                                        backgroundColor: '#f3f4f6',
                                        color: '#374151',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontFamily: 'monospace'
                                    }
                                }, agencia.codigo_agencia),

                                agencia.tipo_agencia && e('span', {
                                    key: 'agencia-tipo',
                                    style: {
                                        padding: '0.25rem 0.5rem',
                                        backgroundColor: getTipoColor(agencia.tipo_agencia) + '20',
                                        color: getTipoColor(agencia.tipo_agencia),
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500'
                                    }
                                }, agencia.tipo_agencia.nombre_tipo),

                                agencia.estado_comercial && e('span', {
                                    key: 'agencia-estado',
                                    style: {
                                        padding: '0.25rem 0.5rem',
                                        backgroundColor: getEstadoColor(agencia.estado_comercial) + '20',
                                        color: getEstadoColor(agencia.estado_comercial),
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500'
                                    }
                                }, agencia.estado_comercial.nombre_estado)
                            ]),

                            e('div', {
                                key: 'agencia-details',
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '1rem',
                                    color: '#6b7280',
                                    fontSize: '0.875rem'
                                }
                            }, [
                                e('div', { key: 'contact-info' }, [
                                    e('p', { style: { margin: '0 0 0.25rem 0' } }, [
                                        e('strong', {}, 'NIT: '),
                                        agencia.nit
                                    ]),
                                    e('p', { style: { margin: '0 0 0.25rem 0' } }, [
                                        e('strong', {}, 'Teléfono: '),
                                        agencia.telefono_principal
                                    ]),
                                    e('p', { style: { margin: '0' } }, [
                                        e('strong', {}, 'Email: '),
                                        agencia.email_principal
                                    ])
                                ]),

                                e('div', { key: 'commercial-info' }, [
                                    e('p', { style: { margin: '0 0 0.25rem 0' } }, [
                                        e('strong', {}, 'Comisión: '),
                                        `${agencia.comision_porcentaje}%`
                                    ]),
                                    e('p', { style: { margin: '0 0 0.25rem 0' } }, [
                                        e('strong', {}, 'Límite Crédito: '),
                                        `Q${parseFloat(agencia.limite_credito || 0).toLocaleString()}`
                                    ]),
                                    agencia.contacto_nombre && e('p', { style: { margin: '0' } }, [
                                        e('strong', {}, 'Contacto: '),
                                        `${agencia.contacto_nombre}${agencia.contacto_cargo ? ` (${agencia.contacto_cargo})` : ''}`
                                    ])
                                ])
                            ])
                        ]),

                        e('div', {
                            key: 'agencia-actions',
                            style: {
                                display: 'flex',
                                gap: '0.5rem',
                                alignItems: 'center'
                            }
                        }, [
                            e('button', {
                                key: 'btn-editar',
                                onClick: () => abrirModal(agencia),
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

                            e('button', {
                                key: 'btn-estado',
                                onClick: () => cambiarEstadoAgencia(agencia),
                                style: {
                                    padding: '0.5rem',
                                    border: 'none',
                                    borderRadius: '6px',
                                    backgroundColor: agencia.situacion === 1 ? '#fef3c7' : '#dcfce7',
                                    color: agencia.situacion === 1 ? '#f59e0b' : '#22c55e',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }
                            }, agencia.situacion === 1 ? Icons.pause() : Icons.play())
                        ])
                    ])
                ])
            ) : e('div', {
                key: 'no-agencias',
                style: {
                    padding: '3rem',
                    textAlign: 'center'
                }
            }, [
                e('div', {
                    key: 'no-agencias-icon',
                    style: {
                        fontSize: '3rem',
                        color: '#d1d5db',
                        marginBottom: '1rem'
                    }
                }, Icons.building()),
                e('h3', {
                    key: 'no-agencias-title',
                    style: {
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#374151',
                        margin: '0 0 0.5rem 0'
                    }
                }, 'No hay agencias registradas'),
                e('p', {
                    key: 'no-agencias-text',
                    style: {
                        color: '#6b7280',
                        margin: '0 0 1rem 0'
                    }
                }, 'Comienza agregando tu primera agencia colaboradora'),
                e('button', {
                    key: 'btn-primera',
                    onClick: () => abrirModal(),
                    style: {
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }
                }, 'Crear Primera Agencia')
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
                }, 'Agencia Duplicada Encontrada'),
                e('p', {
                    key: 'duplicados-message',
                    style: { margin: '0 0 1rem 0', color: '#374151' }
                }, `Se encontró una agencia ${duplicadoEncontrado?.situacion === 0 ? 'inactiva' : 'activa'} con datos similares:`),
                e('div', {
                    key: 'duplicados-info',
                    style: {
                        backgroundColor: '#f3f4f6',
                        padding: '1rem',
                        borderRadius: '8px',
                        margin: '1rem 0'
                    }
                }, [
                    e('p', { style: { margin: '0 0 0.5rem 0' } }, `Código: ${duplicadoEncontrado?.codigo_agencia}`),
                    e('p', { style: { margin: '0 0 0.5rem 0' } }, `NIT: ${duplicadoEncontrado?.nit}`),
                    e('p', { style: { margin: '0' } }, `Razón Social: ${duplicadoEncontrado?.razon_social}`)
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
                        onClick: reactivarAgenciaExistente,
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
                    }, agenciaEditando ? 'Editar Agencia' : 'Nueva Agencia'),
                    e('button', {
                        onClick: cerrarModal,
                        style: {
                            padding: '0.5rem',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer'
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
                        // Información básica
                        e('div', {
                            key: 'basic-info',
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
                            }, 'Información Básica'),

                            e('div', {
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '1rem'
                                }
                            }, [
                                e('div', { key: 'campo-codigo' }, [
                                    e('label', {
                                        style: {
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '0.5rem'
                                        }
                                    }, 'Código de Agencia'),
                                    e('input', {
                                        type: 'text',
                                        value: agenciaEditando ? formulario.codigo_agencia : 'Se generará automáticamente',
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
                                    }, agenciaEditando ? 'Código asignado' : 'El sistema generará el código automáticamente')
                                ]),

                                e('div', { key: 'campo-nit' }, [
                                    e('label', {
                                        style: {
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '0.5rem'
                                        }
                                    }, 'NIT *'),
                                    e('input', {
                                        type: 'text',
                                        value: formulario.nit,
                                        onChange: (e) => manejarCambioFormulario('nit', e.target.value),
                                        style: {
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: errores.nit ? '1px solid #ef4444' : '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem'
                                        },
                                        placeholder: 'Ej: 12345678-9'
                                    }),
                                    errores.nit && e('p', {
                                        style: {
                                            color: '#ef4444',
                                            fontSize: '0.75rem',
                                            margin: '0.25rem 0 0 0'
                                        }
                                    }, errores.nit)
                                ])
                            ]),

                            e('div', {
                                key: 'razon-social',
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
                                }, 'Razón Social *'),
                                e('input', {
                                    type: 'text',
                                    value: formulario.razon_social,
                                    onChange: (e) => manejarCambioFormulario('razon_social', e.target.value),
                                    style: {
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: errores.razon_social ? '1px solid #ef4444' : '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem'
                                    },
                                    placeholder: 'Nombre legal de la empresa'
                                }),
                                errores.razon_social && e('p', {
                                    style: {
                                        color: '#ef4444',
                                        fontSize: '0.75rem',
                                        margin: '0.25rem 0 0 0'
                                    }
                                }, errores.razon_social)
                            ]),

                            e('div', {
                                key: 'nombre-comercial',
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
                                }, 'Nombre Comercial'),
                                e('input', {
                                    type: 'text',
                                    value: formulario.nombre_comercial,
                                    onChange: (e) => manejarCambioFormulario('nombre_comercial', e.target.value),
                                    style: {
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem'
                                    },
                                    placeholder: 'Nombre comercial (si es diferente)'
                                })
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
                                    }, 'Teléfono Principal *'),
                                    e('input', {
                                        type: 'tel',
                                        value: formulario.telefono_principal,
                                        onChange: (e) => manejarCambioFormulario('telefono_principal', e.target.value),
                                        style: {
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: errores.telefono_principal ? '1px solid #ef4444' : '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem'
                                        },
                                        placeholder: '+502 1234-5678'
                                    }),
                                    errores.telefono_principal && e('p', {
                                        style: {
                                            color: '#ef4444',
                                            fontSize: '0.75rem',
                                            margin: '0.25rem 0 0 0'
                                        }
                                    }, errores.telefono_principal)
                                ]),

                                e('div', { key: 'email-principal' }, [
                                    e('label', {
                                        style: {
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '0.5rem'
                                        }
                                    }, 'Email Principal *'),
                                    e('input', {
                                        type: 'email',
                                        value: formulario.email_principal,
                                        onChange: (e) => manejarCambioFormulario('email_principal', e.target.value),
                                        style: {
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: errores.email_principal ? '1px solid #ef4444' : '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem'
                                        },
                                        placeholder: 'contacto@agencia.com'
                                    }),
                                    errores.email_principal && e('p', {
                                        style: {
                                            color: '#ef4444',
                                            fontSize: '0.75rem',
                                            margin: '0.25rem 0 0 0'
                                        }
                                    }, errores.email_principal)
                                ])
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
                                }, 'Dirección *'),
                                e('textarea', {
                                    value: formulario.direccion,
                                    onChange: (e) => manejarCambioFormulario('direccion', e.target.value),
                                    rows: 3,
                                    style: {
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: errores.direccion ? '1px solid #ef4444' : '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        resize: 'vertical'
                                    },
                                    placeholder: 'Dirección completa de la agencia'
                                }),
                                errores.direccion && e('p', {
                                    style: {
                                        color: '#ef4444',
                                        fontSize: '0.75rem',
                                        margin: '0.25rem 0 0 0'
                                    }
                                }, errores.direccion)
                            ]),

                            e('div', {
                                key: 'pais',
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
                                }, 'País *'),
                                e('select', {
                                    value: formulario.pais_id,
                                    onChange: (e) => manejarCambioFormulario('pais_id', e.target.value),
                                    style: {
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: errores.pais_id ? '1px solid #ef4444' : '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem'
                                    }
                                }, [
                                    e('option', { value: '' }, 'Seleccionar país'),
                                    ...paises.map((pais, idx) =>
                                        e('option', { key: `pais-${pais.id || idx}`, value: pais.id.toString() }, pais.nombre_pais)
                                    )
                                ]),
                                errores.pais_id && e('p', {
                                    style: {
                                        color: '#ef4444',
                                        fontSize: '0.75rem',
                                        margin: '0.25rem 0 0 0'
                                    }
                                }, errores.pais_id)
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
                                style: {
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                    gap: '1rem'
                                }
                            }, [
                                e('div', { key: 'tipo-agencia' }, [
                                    e('label', {
                                        style: {
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '0.5rem'
                                        }
                                    }, 'Tipo de Agencia *'),
                                    e('select', {
                                        value: formulario.tipo_agencia_id,
                                        onChange: (e) => manejarCambioFormulario('tipo_agencia_id', e.target.value),
                                        style: {
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: errores.tipo_agencia_id ? '1px solid #ef4444' : '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem'
                                        }
                                    }, [
                                        e('option', { value: '' }, 'Seleccionar tipo'),
                                        ...tiposAgencia.map((tipo, idx) =>
                                            e('option', { key: `tipo-${tipo.id || idx}`, value: tipo.id.toString() }, tipo.nombre_tipo)
                                        )
                                    ]),
                                    errores.tipo_agencia_id && e('p', {
                                        style: {
                                            color: '#ef4444',
                                            fontSize: '0.75rem',
                                            margin: '0.25rem 0 0 0'
                                        }
                                    }, errores.tipo_agencia_id)
                                ]),

                                e('div', { key: 'comision' }, [
                                    e('label', {
                                        style: {
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '0.5rem'
                                        }
                                    }, 'Comisión (%)'),
                                    e('input', {
                                        type: 'number',
                                        step: '0.01',
                                        min: '0',
                                        max: '100',
                                        value: formulario.comision_porcentaje,
                                        onChange: (e) => manejarCambioFormulario('comision_porcentaje', parseFloat(e.target.value) || 0),
                                        style: {
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem'
                                        },
                                        placeholder: '10.00'
                                    })
                                ]),

                                e('div', { key: 'forma-pago' }, [
                                    e('label', {
                                        style: {
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '0.5rem'
                                        }
                                    }, 'Forma de Pago *'),
                                    e('select', {
                                        value: formulario.forma_pago_id,
                                        onChange: (e) => manejarCambioFormulario('forma_pago_id', e.target.value),
                                        style: {
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: errores.forma_pago_id ? '1px solid #ef4444' : '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem'
                                        }
                                    }, [
                                        e('option', { value: '' }, 'Seleccionar forma de pago'),
                                        ...formasPago.map((forma, idx) =>
                                            e('option', { key: `forma-${forma.id || idx}`, value: forma.id.toString() }, forma.nombre_forma)
                                        )
                                    ]),
                                    errores.forma_pago_id && e('p', {
                                        style: {
                                            color: '#ef4444',
                                            fontSize: '0.75rem',
                                            margin: '0.25rem 0 0 0'
                                        }
                                    }, errores.forma_pago_id)
                                ]),

                                e('div', { key: 'estado-comercial' }, [
                                    e('label', {
                                        style: {
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '0.5rem'
                                        }
                                    }, 'Estado Comercial *'),
                                    e('select', {
                                        value: formulario.estado_comercial_id,
                                        onChange: (e) => manejarCambioFormulario('estado_comercial_id', e.target.value),
                                        style: {
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: errores.estado_comercial_id ? '1px solid #ef4444' : '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem'
                                        }
                                    }, [
                                        e('option', { value: '' }, 'Seleccionar estado'),
                                        ...estadosComercial.map((estado, idx) =>
                                            e('option', { key: `estado-${estado.id || idx}`, value: estado.id.toString() }, estado.nombre_estado)
                                        )
                                    ]),
                                    errores.estado_comercial_id && e('p', {
                                        style: {
                                            color: '#ef4444',
                                            fontSize: '0.75rem',
                                            margin: '0.25rem 0 0 0'
                                        }
                                    }, errores.estado_comercial_id)
                                ])
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
                        onClick: guardarAgencia,
                        disabled: loading, // Deshabilitar si está procesando
                        style: {
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
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
                                }, accionConfirmacion === 'activar' ? 'Activar Agencia' : 'Desactivar Agencia')
                            ]),

                            e('p', {
                                key: 'confirmacion-message',
                                style: {
                                    margin: '0 0 1rem 0',
                                    color: '#374151',
                                    lineHeight: '1.5'
                                }
                            }, `¿Está seguro que desea ${accionConfirmacion} la agencia "${agenciaConfirmacion?.razon_social || agenciaConfirmacion?.nombre_comercial}"?`),

                            agenciaConfirmacion && e('div', {
                                key: 'agencia-info',
                                style: {
                                    backgroundColor: '#f9fafb',
                                    padding: '0.75rem',
                                    borderRadius: '6px',
                                    marginBottom: '1.5rem',
                                    fontSize: '0.875rem',
                                    color: '#6b7280'
                                }
                            }, [
                                e('p', { style: { margin: '0' } }, `Código: ${agenciaConfirmacion.codigo_agencia}`),
                                e('p', { style: { margin: '0' } }, `NIT: ${agenciaConfirmacion.nit}`)
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
                    ])
                ])
            ])
        ])
    ]);
}

export default GestionAgencias;
