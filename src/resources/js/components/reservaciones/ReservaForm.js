// src/resources/js/components/reservaciones/ReservaForm.js
import React from 'react';
import Icons from '../../utils/Icons';
import Notifications from '../../utils/notifications';

const { createElement: e, useState, useEffect } = React;

function ReservaForm({ reserva, onSave, onCancel, mode = 'create' }) {
    // Estado del formulario
    const [formData, setFormData] = useState({
        ruta_id: '',
        pax_adultos: 1,
        pax_ninos: 0,
        nombre_pasajero_principal: '',
        fecha_viaje: '',
        hora_pickup: '', // NUEVO CAMPO AGREGADO
        telefono_contacto: '',
        hotel_pickup: '',
        notas_pickup: '',
        voucher: '',
        precio_total: 0.00,
        responsable_pago: '',
        cliente_id: null,
        agencia_id: null,
        estado_reserva_id: 1 // PENDIENTE por defecto
    });

    // Estados para catálogos
    const [rutas, setRutas] = useState([]);
    const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [agencias, setAgencias] = useState([]);
    const [estados, setEstados] = useState([]);

    // Estados de validación y UI
    const [errores, setErrores] = useState({});
    const [loading, setLoading] = useState(false);
    const [verificandoDisponibilidad, setVerificandoDisponibilidad] = useState(false);
    const [disponibilidad, setDisponibilidad] = useState(null);

    // Cargar catálogos al montar el componente
    useEffect(() => {
        fetchCatalogos();
        if (reserva && mode !== 'create') {
            cargarDatosReserva(reserva);
        }
    }, [reserva, mode]);

    // Actualizar precio cuando cambian PAX o ruta
    useEffect(() => {
        if (rutaSeleccionada && (formData.pax_adultos > 0 || formData.pax_ninos > 0)) {
            calcularPrecioTotal();
        }
    }, [formData.pax_adultos, formData.pax_ninos, rutaSeleccionada]);

    // Verificar disponibilidad cuando cambian ruta y fecha
    useEffect(() => {
        if (formData.ruta_id && formData.fecha_viaje) {
            verificarDisponibilidad();
        }
    }, [formData.ruta_id, formData.fecha_viaje]);

    const fetchCatalogos = async () => {
        try {
            const [rutasRes, clientesRes, agenciasRes, estadosRes] = await Promise.all([
                fetch('/api/v1/rutas?activas=1'),
                fetch('/api/v1/clientes'),
                fetch('/api/v1/agencias'),
                fetch('/api/v1/estados-reserva')
            ]);

            const rutasData = (await rutasRes.json()).data || [];
            setRutas(rutasData);
            setClientes((await clientesRes.json()).data || []);
            setAgencias((await agenciasRes.json()).data || []);
            setEstados((await estadosRes.json()).data || []);
        } catch (error) {
            Notifications.error('Error al cargar datos del formulario', 'Error');
        }
    };

    const cargarDatosReserva = (reservaData) => {
        const ruta = rutas.find(r => r.id === reservaData.ruta_id);
        setRutaSeleccionada(ruta);

        setFormData({
            ruta_id: reservaData.ruta_id || '',
            pax_adultos: reservaData.pax_adultos || 1,
            pax_ninos: reservaData.pax_ninos || 0,
            nombre_pasajero_principal: reservaData.nombre_pasajero_principal || '',
            fecha_viaje: reservaData.fecha_viaje || '',
            hora_pickup: reservaData.hora_pickup || '', // NUEVO CAMPO AGREGADO
            telefono_contacto: reservaData.telefono_contacto || '',
            hotel_pickup: reservaData.hotel_pickup || '',
            notas_pickup: reservaData.notas_pickup || '',
            voucher: reservaData.voucher || '',
            precio_total: reservaData.precio_total || 0.00,
            responsable_pago: reservaData.responsable_pago || '',
            cliente_id: reservaData.cliente_id,
            agencia_id: reservaData.agencia_id,
            estado_reserva_id: reservaData.estado_reserva_id || 1
        });
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Limpiar error del campo modificado
        if (errores[field]) {
            setErrores(prev => ({
                ...prev,
                [field]: null
            }));
        }

        // Lógica especial para campos relacionados
        if (field === 'ruta_id') {
            const ruta = rutas.find(r => r.id === parseInt(value));
            setRutaSeleccionada(ruta);

            // NUEVA FUNCIONALIDAD: Auto-completar hora con la hora de la ruta
            if (ruta && ruta.hora_salida && !formData.hora_pickup) {
                setFormData(prev => ({
                    ...prev,
                    ruta_id: value,
                    hora_pickup: ruta.hora_salida // Auto-completar hora
                }));
            }
        }

        if (field === 'agencia_id') {
            // Si selecciona agencia, limpiar cliente y viceversa
            setFormData(prev => ({
                ...prev,
                agencia_id: value,
                cliente_id: value ? null : prev.cliente_id
            }));
        }

        if (field === 'cliente_id') {
            setFormData(prev => ({
                ...prev,
                cliente_id: value,
                agencia_id: value ? null : prev.agencia_id
            }));
        }
    };

    const calcularPrecioTotal = () => {
        if (!rutaSeleccionada) return;

        const precioAdultos = formData.pax_adultos * (rutaSeleccionada.precio_adulto || 0);
        const precioNinos = formData.pax_ninos * (rutaSeleccionada.precio_nino || 0);
        const total = precioAdultos + precioNinos;

        setFormData(prev => ({
            ...prev,
            precio_total: parseFloat(total.toFixed(2))
        }));
    };

    const verificarDisponibilidad = async () => {
        if (!formData.ruta_id || !formData.fecha_viaje) return;

        setVerificandoDisponibilidad(true);
        try {
            const response = await fetch(`/api/v1/rutas/${formData.ruta_id}/disponibilidad?fecha=${formData.fecha_viaje}`);
            const data = await response.json();
            setDisponibilidad(data.data);
        } catch (error) {
            console.error('Error verificando disponibilidad:', error);
        } finally {
            setVerificandoDisponibilidad(false);
        }
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        // Campos obligatorios
        if (!formData.ruta_id) nuevosErrores.ruta_id = 'La ruta es obligatoria';
        if (!formData.nombre_pasajero_principal.trim()) nuevosErrores.nombre_pasajero_principal = 'El nombre del pasajero es obligatorio';
        if (!formData.fecha_viaje) nuevosErrores.fecha_viaje = 'La fecha de viaje es obligatoria';
        if (formData.pax_adultos < 1) nuevosErrores.pax_adultos = 'Debe haber al menos 1 adulto';

        // NUEVA VALIDACIÓN: Hora pickup (opcional pero con formato)
        if (formData.hora_pickup && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.hora_pickup)) {
            nuevosErrores.hora_pickup = 'Formato de hora inválido (HH:MM)';
        }

        // Validaciones específicas
        if (formData.fecha_viaje) {
            const fechaViaje = new Date(formData.fecha_viaje);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            if (fechaViaje < hoy) {
                nuevosErrores.fecha_viaje = 'La fecha de viaje no puede ser anterior a hoy';
            }
        }

        // Verificar disponibilidad
        if (disponibilidad && disponibilidad.disponible === false) {
            nuevosErrores.fecha_viaje = disponibilidad.mensaje || 'No hay disponibilidad en esta fecha';
        }

        // Verificar capacidad
        const totalPax = formData.pax_adultos + formData.pax_ninos;
        if (disponibilidad && disponibilidad.espacios_disponibles < totalPax) {
            nuevosErrores.pax_adultos = `Solo hay ${disponibilidad.espacios_disponibles} espacios disponibles`;
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            Notifications.warning('Por favor corrija los errores en el formulario', 'Validación');
            return;
        }

        setLoading(true);
        try {
            const url = mode === 'create' ?
                '/api/v1/reservas' :
                `/api/v1/reservas/${reserva.id}`;

            const method = mode === 'create' ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar la reserva');
            }

            const data = await response.json();

            Notifications.success(
                mode === 'create' ?
                    'Reserva creada exitosamente' :
                    'Reserva actualizada exitosamente',
                'Éxito'
            );

            if (onSave) {
                onSave(data.data);
            }

        } catch (error) {
            console.error('Error:', error);
            Notifications.error(error.message, 'Error');
        } finally {
            setLoading(false);
        }
    };

    // Renderizar indicador de disponibilidad
    const renderDisponibilidad = () => {
        if (verificandoDisponibilidad) {
            return e('div', {
                key: 'checking-availability',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    marginTop: '0.5rem'
                }
            }, [
                e('div', {
                    key: 'spinner',
                    style: {
                        width: '16px',
                        height: '16px',
                        border: '2px solid #e5e7eb',
                        borderTop: '2px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }
                }),
                'Verificando disponibilidad...'
            ]);
        }

        if (disponibilidad) {
            const color = disponibilidad.disponible ? '#10b981' : '#ef4444';
            return e('div', {
                key: 'availability-status',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: disponibilidad.disponible ? '#f0fdf4' : '#fef2f2',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    marginTop: '0.5rem'
                }
            }, [
                e('div', {
                    key: 'icon',
                    style: { color }
                }, disponibilidad.disponible ?
                    Icons.checkCircle(color) : Icons.xCircle(color)
                ),
                e('div', { key: 'info' }, [
                    e('div', {
                        key: 'status',
                        style: { fontWeight: '500', color }
                    }, disponibilidad.disponible ? 'Disponible' : 'No Disponible'),
                    disponibilidad.espacios_disponibles && e('div', {
                        key: 'espacios',
                        style: { fontSize: '0.75rem', color: '#6b7280' }
                    }, `Espacios disponibles: ${disponibilidad.espacios_disponibles}`),
                    disponibilidad.mensaje && e('div', {
                        key: 'mensaje',
                        style: { fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }
                    }, disponibilidad.mensaje)
                ])
            ]);
        }

        return null;
    };

    return e('form', {
        onSubmit: handleSubmit,
        style: {
            maxWidth: '900px',
            margin: '0 auto'
        }
    }, [
        // Header del formulario
        e('div', {
            key: 'form-header',
            style: {
                marginBottom: '2rem',
                textAlign: 'center'
            }
        }, [
            e('h2', {
                key: 'form-title',
                style: {
                    fontSize: '1.875rem',
                    fontWeight: '700',
                    color: '#1f2937',
                    marginBottom: '0.5rem'
                }
            }, mode === 'create' ? 'Nueva Reserva' : 'Editar Reserva'),
            e('p', {
                key: 'form-subtitle',
                style: {
                    color: '#6b7280',
                    fontSize: '1rem'
                }
            }, 'Complete la información de la reserva')
        ]),

        // SECCIÓN: Información del Servicio
        e('div', {
            key: 'seccion-servicio',
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }
        }, [
            e('h3', {
                key: 'seccion-titulo-1',
                style: {
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }
            }, [
                Icons.map('#3b82f6'),
                'Información del Servicio'
            ]),

            e('div', {
                key: 'servicio-fields',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }
            }, [
                // Campo Ruta
                e('div', { key: 'ruta-field', style: { gridColumn: 'span 2' } }, [
                    e('label', {
                        key: 'ruta-label',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Ruta *'),
                    e('select', {
                        key: 'ruta-select',
                        value: formData.ruta_id,
                        onChange: (e) => handleInputChange('ruta_id', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: errores.ruta_id ? '2px solid #ef4444' : '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            backgroundColor: 'white'
                        }
                    }, [
                        e('option', { key: 'empty', value: '' }, 'Seleccione una ruta'),
                        ...rutas.map(ruta => e('option', {
                            key: ruta.id,
                            value: ruta.id
                        }, `${ruta.nombre_ruta} - Q${ruta.precio_adulto || 0}`))
                    ]),
                    errores.ruta_id && e('p', {
                        key: 'ruta-error',
                        style: {
                            color: '#ef4444',
                            fontSize: '0.75rem',
                            marginTop: '0.25rem'
                        }
                    }, errores.ruta_id)
                ]),

                // Campo Fecha de Viaje
                e('div', { key: 'fecha-field' }, [
                    e('label', {
                        key: 'fecha-label',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Fecha de Viaje *'),
                    e('input', {
                        key: 'fecha-input',
                        type: 'date',
                        value: formData.fecha_viaje,
                        min: new Date().toISOString().split('T')[0],
                        onChange: (e) => handleInputChange('fecha_viaje', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: errores.fecha_viaje ? '2px solid #ef4444' : '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    }),
                    errores.fecha_viaje && e('p', {
                        key: 'fecha-error',
                        style: {
                            color: '#ef4444',
                            fontSize: '0.75rem',
                            marginTop: '0.25rem'
                        }
                    }, errores.fecha_viaje),
                    renderDisponibilidad()
                ]),

                // NUEVO CAMPO: Hora de Pickup
                e('div', { key: 'hora-field' }, [
                    e('label', {
                        key: 'hora-label',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, [
                        'Hora de Pickup ',
                        rutaSeleccionada && rutaSeleccionada.hora_salida && e('span', {
                            key: 'hora-sugerida',
                            style: {
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                fontWeight: 'normal'
                            }
                        }, `(Sugerida: ${rutaSeleccionada.hora_salida})`)
                    ]),
                    e('input', {
                        key: 'hora-input',
                        type: 'time',
                        value: formData.hora_pickup,
                        onChange: (e) => handleInputChange('hora_pickup', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: errores.hora_pickup ? '2px solid #ef4444' : '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    }),
                    errores.hora_pickup && e('p', {
                        key: 'hora-error',
                        style: {
                            color: '#ef4444',
                            fontSize: '0.75rem',
                            marginTop: '0.25rem'
                        }
                    }, errores.hora_pickup),
                    rutaSeleccionada && rutaSeleccionada.hora_salida && e('p', {
                        key: 'hora-info',
                        style: {
                            color: '#6b7280',
                            fontSize: '0.75rem',
                            marginTop: '0.25rem'
                        }
                    }, 'La hora sugerida es la hora de salida de la ruta seleccionada')
                ])
            ])
        ]),

        // SECCIÓN: Información de Pasajeros
        e('div', {
            key: 'seccion-pasajeros',
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }
        }, [
            e('h3', {
                key: 'seccion-titulo-2',
                style: {
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }
            }, [
                Icons.users('#3b82f6'),
                'Información de Pasajeros'
            ]),

            e('div', {
                key: 'pasajeros-fields',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem'
                }
            }, [
                // Nombre del pasajero principal
                e('div', { key: 'nombre-field', style: { gridColumn: 'span 2' } }, [
                    e('label', {
                        key: 'nombre-label',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Nombre del Pasajero Principal *'),
                    e('input', {
                        key: 'nombre-input',
                        type: 'text',
                        value: formData.nombre_pasajero_principal,
                        placeholder: 'Nombre completo del pasajero principal',
                        onChange: (e) => handleInputChange('nombre_pasajero_principal', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: errores.nombre_pasajero_principal ? '2px solid #ef4444' : '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    }),
                    errores.nombre_pasajero_principal && e('p', {
                        key: 'nombre-error',
                        style: {
                            color: '#ef4444',
                            fontSize: '0.75rem',
                            marginTop: '0.25rem'
                        }
                    }, errores.nombre_pasajero_principal)
                ]),

                // PAX Adultos
                e('div', { key: 'pax-adultos-field' }, [
                    e('label', {
                        key: 'pax-adultos-label',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Adultos *'),
                    e('input', {
                        key: 'pax-adultos-input',
                        type: 'number',
                        min: '1',
                        max: '50',
                        value: formData.pax_adultos,
                        onChange: (e) => handleInputChange('pax_adultos', parseInt(e.target.value) || 1),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: errores.pax_adultos ? '2px solid #ef4444' : '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    }),
                    errores.pax_adultos && e('p', {
                        key: 'pax-adultos-error',
                        style: {
                            color: '#ef4444',
                            fontSize: '0.75rem',
                            marginTop: '0.25rem'
                        }
                    }, errores.pax_adultos)
                ]),

                // PAX Niños
                e('div', { key: 'pax-ninos-field' }, [
                    e('label', {
                        key: 'pax-ninos-label',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Niños (opcional)'),
                    e('input', {
                        key: 'pax-ninos-input',
                        type: 'number',
                        min: '0',
                        max: '20',
                        value: formData.pax_ninos,
                        onChange: (e) => handleInputChange('pax_ninos', parseInt(e.target.value) || 0),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    })
                ]),

                // Total PAX (mostrar cálculo)
                e('div', { key: 'total-pax-field' }, [
                    e('label', {
                        key: 'total-pax-label',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Total Pasajeros'),
                    e('div', {
                        key: 'total-pax-display',
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            textAlign: 'center'
                        }
                    }, `${formData.pax_adultos + formData.pax_ninos} PAX`)
                ])
            ])
        ]),

        // SECCIÓN: Detalles del Pickup
        e('div', {
            key: 'seccion-pickup',
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }
        }, [
            e('h3', {
                key: 'seccion-titulo-3',
                style: {
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }
            }, [
                Icons.mapPin('#3b82f6'),
                'Detalles del Pickup'
            ]),

            e('div', {
                key: 'pickup-fields',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem'
                }
            }, [
                // Hotel/Lugar de Pickup
                e('div', { key: 'hotel-field', style: { gridColumn: 'span 2' } }, [
                    e('label', {
                        key: 'hotel-label',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Hotel o Lugar de Pickup'),
                    e('input', {
                        key: 'hotel-input',
                        type: 'text',
                        value: formData.hotel_pickup,
                        placeholder: 'Ej: Hotel Plaza, Casa particular, Dirección específica',
                        onChange: (e) => handleInputChange('hotel_pickup', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    })
                ]),

                // Teléfono de Contacto
                e('div', { key: 'telefono-field' }, [
                    e('label', {
                        key: 'telefono-label',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Teléfono de Contacto'),
                    e('input', {
                        key: 'telefono-input',
                        type: 'tel',
                        value: formData.telefono_contacto,
                        placeholder: 'Ej: 5555-5555',
                        onChange: (e) => handleInputChange('telefono_contacto', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    })
                ]),

                // Voucher
                e('div', { key: 'voucher-field' }, [
                    e('label', {
                        key: 'voucher-label',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Voucher de Agencia'),
                    e('input', {
                        key: 'voucher-input',
                        type: 'text',
                        value: formData.voucher,
                        placeholder: 'Número de voucher (si aplica)',
                        onChange: (e) => handleInputChange('voucher', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    })
                ]),

                // Notas Especiales
                e('div', { key: 'notas-field', style: { gridColumn: 'span 2' } }, [
                    e('label', {
                        key: 'notas-label',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Notas Especiales para el Pickup'),
                    e('textarea', {
                        key: 'notas-input',
                        value: formData.notas_pickup,
                        placeholder: 'Instrucciones especiales, indicaciones, observaciones...',
                        onChange: (e) => handleInputChange('notas_pickup', e.target.value),
                        rows: 3,
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            resize: 'vertical'
                        }
                    })
                ])
            ])
        ]),

        // SECCIÓN: Información Comercial
        e('div', {
            key: 'seccion-comercial',
            style: {
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }
        }, [
            e('h3', {
                key: 'seccion-titulo-4',
                style: {
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1f2937',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }
            }, [
                Icons.dollarSign('#3b82f6'),
                'Información Comercial'
            ]),

            e('div', {
                key: 'comercial-fields',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem'
                }
            }, [
                // Precio Total (calculado automáticamente)
                e('div', { key: 'precio-field' }, [
                    e('label', {
                        key: 'precio-label',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Precio Total'),
                    e('div', {
                        key: 'precio-display',
                        style: {
                            padding: '0.75rem',
                            backgroundColor: '#f0fdf4',
                            border: '2px solid #22c55e',
                            borderRadius: '8px',
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: '#16a34a',
                            textAlign: 'center'
                        }
                    }, `Q ${formData.precio_total.toFixed(2)}`)
                ]),

                // Responsable de Pago
                e('div', { key: 'responsable-field' }, [
                    e('label', {
                        key: 'responsable-label',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Responsable de Pago'),
                    e('input', {
                        key: 'responsable-input',
                        type: 'text',
                        value: formData.responsable_pago,
                        placeholder: 'Ej: Cliente directo, Agencia X',
                        onChange: (e) => handleInputChange('responsable_pago', e.target.value),
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '0.875rem'
                        }
                    })
                ])
            ])
        ]),

        // Botones de acción
        e('div', {
            key: 'form-actions',
            style: {
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                marginTop: '2rem'
            }
        }, [
            // Botón Cancelar
            e('button', {
                key: 'btn-cancel',
                type: 'button',
                onClick: onCancel,
                style: {
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                },
                onMouseEnter: (e) => {
                    e.target.style.backgroundColor = '#e5e7eb';
                },
                onMouseLeave: (e) => {
                    e.target.style.backgroundColor = '#f3f4f6';
                }
            }, 'Cancelar'),

            // Botón Guardar
            e('button', {
                key: 'btn-save',
                type: 'submit',
                disabled: loading,
                style: {
                    padding: '0.75rem 2rem',
                    backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                },
                onMouseEnter: (e) => {
                    if (!loading) e.target.style.backgroundColor = '#2563eb';
                },
                onMouseLeave: (e) => {
                    if (!loading) e.target.style.backgroundColor = '#3b82f6';
                }
            }, [
                loading && e('div', {
                    key: 'loading-spinner',
                    style: {
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }
                }),
                loading ? 'Guardando...' : (mode === 'create' ? 'Crear Reserva' : 'Actualizar Reserva')
            ])
        ])
    ]);
}

export default ReservaForm;
