// src/resources/js/components/usuarios/empleados/EmpleadosForm.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';

const { createElement: e, useState, useEffect } = React;

function EmpleadosForm({
    empleado = null,
    mode = 'create',
    roles = [],
    estadosEmpleado = [],
    onSave,
    onCancel
}) {
    // Estados del formulario
    const [formData, setFormData] = useState({
        // Datos de persona
        nombres: '',
        apellidos: '',
        documento_identidad: '',
        email: '',
        telefono_principal: '',
        whatsapp: '',
        direccion: '',
        tipo_persona_id: 1, // Por defecto "Empleado"

        // Datos de empleado
        codigo_empleado: '',
        password: '',
        confirmPassword: '',
        fecha_ingreso: '',
        fecha_baja: '',
        rol_id: '',
        estado_empleado_id: '',
        situacion: true
    });

    // Estados de validación
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Estados auxiliares
    const [tiposPersona, setTiposPersona] = useState([]);

    // Cargar datos del empleado para edición
    useEffect(() => {
        if (empleado && mode !== 'create') {
            setFormData({
                nombres: empleado.persona?.nombres || '',
                apellidos: empleado.persona?.apellidos || '',
                documento_identidad: empleado.persona?.documento_identidad || '',
                email: empleado.persona?.email || '',
                telefono_principal: empleado.persona?.telefono_principal || '',
                whatsapp: empleado.persona?.whatsapp || '',
                direccion: empleado.persona?.direccion || '',
                tipo_persona_id: empleado.persona?.tipo_persona_id || 1,
                codigo_empleado: empleado.codigo_empleado || '',
                password: '', // No llenar password en edición
                confirmPassword: '',
                fecha_ingreso: empleado.fecha_ingreso || '',
                fecha_baja: empleado.fecha_baja || '',
                rol_id: empleado.rol_id || '',
                estado_empleado_id: empleado.estado_empleado_id || '',
                situacion: empleado.situacion !== undefined ? empleado.situacion : true
            });
        }
        loadTiposPersona();
    }, [empleado, mode]);

    // Cargar tipos de persona
    const loadTiposPersona = async () => {
        try {
            const response = await fetch('/api/v1/tipos-persona');
            if (response.ok) {
                const data = await response.json();
                setTiposPersona(Array.isArray(data) ? data : data.data || []);
            }
        } catch (error) {
            console.error('Error cargando tipos de persona:', error);
        }
    };

    // Generar código de empleado automático
    const generarCodigoEmpleado = () => {
        const nombres = formData.nombres.trim();
        const apellidos = formData.apellidos.trim();

        if (nombres && apellidos) {
            const iniciales = nombres.charAt(0) + apellidos.charAt(0);
            const numero = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
            const codigo = `EMP${iniciales.toUpperCase()}${numero}`;

            handleInputChange('codigo_empleado', codigo);
            Notifications.info(`Código generado: ${codigo}`, 'Código Auto-generado');
        } else {
            Notifications.warning('Complete nombres y apellidos para generar el código', 'Datos Requeridos');
        }
    };

    // Manejar cambios en inputs
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Limpiar errores del campo
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Validar formulario
    const validateForm = () => {
        const newErrors = {};

        // Validaciones de persona
        if (!formData.nombres.trim()) {
            newErrors.nombres = 'Los nombres son requeridos';
        }

        if (!formData.apellidos.trim()) {
            newErrors.apellidos = 'Los apellidos son requeridos';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'El email no es válido';
        }

        // Validaciones de empleado
        if (!formData.codigo_empleado.trim()) {
            newErrors.codigo_empleado = 'El código de empleado es requerido';
        }

        if (!formData.rol_id) {
            newErrors.rol_id = 'Debe seleccionar un rol';
        }

        if (!formData.estado_empleado_id) {
            newErrors.estado_empleado_id = 'Debe seleccionar un estado';
        }

        // Validar password solo en creación o si se está cambiando
        if (mode === 'create' || formData.password) {
            if (!formData.password) {
                newErrors.password = 'La contraseña es requerida';
            } else if (formData.password.length < 6) {
                newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Las contraseñas no coinciden';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Enviar formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            Notifications.warning('Corrija los errores del formulario', 'Errores de Validación');
            return;
        }

        setLoading(true);

        try {
            // Preparar datos para envío
            const dataToSend = {
                // Datos de persona
                nombres: formData.nombres.trim(),
                apellidos: formData.apellidos.trim(),
                documento_identidad: formData.documento_identidad.trim() || null,
                email: formData.email.trim() || null,
                telefono_principal: formData.telefono_principal.trim() || null,
                whatsapp: formData.whatsapp.trim() || null,
                direccion: formData.direccion.trim() || null,
                tipo_persona_id: formData.tipo_persona_id,

                // Datos de empleado
                codigo_empleado: formData.codigo_empleado.trim(),
                fecha_ingreso: formData.fecha_ingreso || null,
                fecha_baja: formData.fecha_baja || null,
                rol_id: parseInt(formData.rol_id),
                estado_empleado_id: parseInt(formData.estado_empleado_id),
                situacion: formData.situacion
            };

            // Incluir password solo si es necesario
            if (mode === 'create' || formData.password) {
                dataToSend.password = formData.password;
            }

            await onSave(dataToSend);

        } catch (error) {
            console.error('Error en envío:', error);
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener el estilo del campo con error
    const getFieldStyle = (fieldName, baseStyle = {}) => ({
        ...baseStyle,
        border: errors[fieldName] ? '2px solid #ef4444' : '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        outline: 'none',
        transition: 'border-color 0.2s',
        backgroundColor: mode === 'view' ? '#f9fafb' : 'white'
    });

    if (mode === 'view') {
        // Modo solo lectura - Vista detallada
        return e('div', {
            style: { padding: '2rem' }
        }, [
            e('div', {
                key: 'view-content',
                style: {
                    display: 'grid',
                    gap: '2rem'
                }
            }, [
                // Información Personal
                e('div', {
                    key: 'personal-section',
                    style: {
                        backgroundColor: '#f8fafc',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                    }
                }, [
                    e('h3', {
                        key: 'personal-title',
                        style: {
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#1e293b',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }
                    }, [
                        Icons.user(),
                        'Información Personal'
                    ]),
                    e('div', {
                        key: 'personal-grid',
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '1rem'
                        }
                    }, [
                        // Nombre completo
                        e('div', { key: 'nombre-field' }, [
                            e('label', {
                                key: 'nombre-label',
                                style: { fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }
                            }, 'Nombre Completo'),
                            e('div', {
                                key: 'nombre-value',
                                style: { fontSize: '0.875rem', color: '#1e293b', fontWeight: '500', marginTop: '0.25rem' }
                            }, `${formData.nombres} ${formData.apellidos}`)
                        ]),

                        // Documento
                        formData.documento_identidad && e('div', { key: 'documento-field' }, [
                            e('label', {
                                key: 'documento-label',
                                style: { fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }
                            }, 'Documento de Identidad'),
                            e('div', {
                                key: 'documento-value',
                                style: { fontSize: '0.875rem', color: '#1e293b', fontWeight: '500', marginTop: '0.25rem' }
                            }, formData.documento_identidad)
                        ]),

                        // Email
                        formData.email && e('div', { key: 'email-field' }, [
                            e('label', {
                                key: 'email-label',
                                style: { fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }
                            }, 'Correo Electrónico'),
                            e('div', {
                                key: 'email-value',
                                style: { fontSize: '0.875rem', color: '#1e293b', fontWeight: '500', marginTop: '0.25rem' }
                            }, formData.email)
                        ]),

                        // Teléfono
                        formData.telefono_principal && e('div', { key: 'telefono-field' }, [
                            e('label', {
                                key: 'telefono-label',
                                style: { fontSize: '0.75rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }
                            }, 'Teléfono'),
                            e('div', {
                                key: 'telefono-value',
                                style: { fontSize: '0.875rem', color: '#1e293b', fontWeight: '500', marginTop: '0.25rem' }
                            }, formData.telefono_principal)
                        ])
                    ])
                ]),

                // Información Laboral
                e('div', {
                    key: 'laboral-section',
                    style: {
                        backgroundColor: '#f0f9ff',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        border: '1px solid #bae6fd'
                    }
                }, [
                    e('h3', {
                        key: 'laboral-title',
                        style: {
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#0c4a6e',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }
                    }, [
                        Icons.briefcase(),
                        'Información Laboral'
                    ]),
                    e('div', {
                        key: 'laboral-grid',
                        style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '1rem'
                        }
                    }, [
                        // Código empleado
                        e('div', { key: 'codigo-field' }, [
                            e('label', {
                                key: 'codigo-label',
                                style: { fontSize: '0.75rem', fontWeight: '600', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em' }
                            }, 'Código de Empleado'),
                            e('div', {
                                key: 'codigo-value',
                                style: {
                                    fontSize: '0.875rem',
                                    color: '#0c4a6e',
                                    fontWeight: '600',
                                    fontFamily: 'monospace',
                                    marginTop: '0.25rem',
                                    padding: '0.5rem',
                                    backgroundColor: 'white',
                                    borderRadius: '4px',
                                    border: '1px solid #bae6fd'
                                }
                            }, formData.codigo_empleado)
                        ]),

                        // Rol
                        e('div', { key: 'rol-field' }, [
                            e('label', {
                                key: 'rol-label',
                                style: { fontSize: '0.75rem', fontWeight: '600', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em' }
                            }, 'Rol'),
                            e('div', {
                                key: 'rol-value',
                                style: { fontSize: '0.875rem', color: '#0c4a6e', fontWeight: '500', marginTop: '0.25rem' }
                            }, roles.find(r => r.id === formData.rol_id)?.nombre_rol || 'No asignado')
                        ]),

                        // Estado
                        e('div', { key: 'estado-field' }, [
                            e('label', {
                                key: 'estado-label',
                                style: { fontSize: '0.75rem', fontWeight: '600', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em' }
                            }, 'Estado'),
                            e('div', {
                                key: 'estado-value',
                                style: { fontSize: '0.875rem', color: '#0c4a6e', fontWeight: '500', marginTop: '0.25rem' }
                            }, estadosEmpleado.find(e => e.id === formData.estado_empleado_id)?.nombre_estado || 'No asignado')
                        ]),

                        // Situación
                        e('div', { key: 'situacion-field' }, [
                            e('label', {
                                key: 'situacion-label',
                                style: { fontSize: '0.75rem', fontWeight: '600', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em' }
                            }, 'Situación'),
                            e('span', {
                                key: 'situacion-badge',
                                style: {
                                    display: 'inline-block',
                                    marginTop: '0.25rem',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    backgroundColor: formData.situacion ? '#dcfce7' : '#fef3c7',
                                    color: formData.situacion ? '#16a34a' : '#d97706',
                                    border: `1px solid ${formData.situacion ? '#bbf7d0' : '#fde68a'}`
                                }
                            }, formData.situacion ? 'Activo' : 'Inactivo')
                        ])
                    ])
                ])
            ])
        ]);
    }

    // Modo formulario (create/edit)
    return e('form', {
        onSubmit: handleSubmit,
        style: { padding: '2rem' }
    }, [
        e('div', {
            key: 'form-sections',
            style: { display: 'flex', flexDirection: 'column', gap: '2rem' }
        }, [
            // Sección: Información Personal
            e('div', {
                key: 'section-personal',
                style: {
                    backgroundColor: '#f8fafc',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                }
            }, [
                e('h3', {
                    key: 'section-title-personal',
                    style: {
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [
                    Icons.user(),
                    'Información Personal'
                ]),

                e('div', {
                    key: 'personal-grid',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1rem'
                    }
                }, [
                    // Nombres
                    e('div', { key: 'nombres-field' }, [
                        e('label', {
                            key: 'nombres-label',
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, [
                            'Nombres ',
                            e('span', { key: 'required', style: { color: '#ef4444' } }, '*')
                        ]),
                        e('input', {
                            key: 'nombres-input',
                            type: 'text',
                            value: formData.nombres,
                            onChange: (e) => handleInputChange('nombres', e.target.value),
                            placeholder: 'Ej: Juan Carlos',
                            style: getFieldStyle('nombres', { width: '100%' }),
                            onFocus: (e) => e.target.style.borderColor = '#3b82f6',
                            onBlur: (e) => e.target.style.borderColor = errors.nombres ? '#ef4444' : '#d1d5db'
                        }),
                        errors.nombres && e('p', {
                            key: 'nombres-error',
                            style: { color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }
                        }, errors.nombres)
                    ]),

                    // Apellidos
                    e('div', { key: 'apellidos-field' }, [
                        e('label', {
                            key: 'apellidos-label',
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, [
                            'Apellidos ',
                            e('span', { key: 'required', style: { color: '#ef4444' } }, '*')
                        ]),
                        e('input', {
                            key: 'apellidos-input',
                            type: 'text',
                            value: formData.apellidos,
                            onChange: (e) => handleInputChange('apellidos', e.target.value),
                            placeholder: 'Ej: Pérez López',
                            style: getFieldStyle('apellidos', { width: '100%' }),
                            onFocus: (e) => e.target.style.borderColor = '#3b82f6',
                            onBlur: (e) => e.target.style.borderColor = errors.apellidos ? '#ef4444' : '#d1d5db'
                        }),
                        errors.apellidos && e('p', {
                            key: 'apellidos-error',
                            style: { color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }
                        }, errors.apellidos)
                    ]),

                    // Documento de identidad
                    e('div', { key: 'documento-field' }, [
                        e('label', {
                            key: 'documento-label',
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, 'Documento de Identidad'),
                        e('input', {
                            key: 'documento-input',
                            type: 'text',
                            value: formData.documento_identidad,
                            onChange: (e) => handleInputChange('documento_identidad', e.target.value),
                            placeholder: 'DPI o Pasaporte',
                            style: getFieldStyle('documento_identidad', { width: '100%' }),
                            onFocus: (e) => e.target.style.borderColor = '#3b82f6',
                            onBlur: (e) => e.target.style.borderColor = '#d1d5db'
                        })
                    ]),

                    // Email
                    e('div', { key: 'email-field' }, [
                        e('label', {
                            key: 'email-label',
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, 'Correo Electrónico'),
                        e('input', {
                            key: 'email-input',
                            type: 'email',
                            value: formData.email,
                            onChange: (e) => handleInputChange('email', e.target.value),
                            placeholder: 'ejemplo@email.com',
                            style: getFieldStyle('email', { width: '100%' }),
                            onFocus: (e) => e.target.style.borderColor = '#3b82f6',
                            onBlur: (e) => e.target.style.borderColor = errors.email ? '#ef4444' : '#d1d5db'
                        }),
                        errors.email && e('p', {
                            key: 'email-error',
                            style: { color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }
                        }, errors.email)
                    ]),

                    // Teléfono
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
                        }, 'Teléfono Principal'),
                        e('input', {
                            key: 'telefono-input',
                            type: 'tel',
                            value: formData.telefono_principal,
                            onChange: (e) => handleInputChange('telefono_principal', e.target.value),
                            placeholder: '5555-5555',
                            style: getFieldStyle('telefono_principal', { width: '100%' }),
                            onFocus: (e) => e.target.style.borderColor = '#3b82f6',
                            onBlur: (e) => e.target.style.borderColor = '#d1d5db'
                        })
                    ]),

                    // WhatsApp
                    e('div', { key: 'whatsapp-field' }, [
                        e('label', {
                            key: 'whatsapp-label',
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, 'WhatsApp'),
                        e('input', {
                            key: 'whatsapp-input',
                            type: 'tel',
                            value: formData.whatsapp,
                            onChange: (e) => handleInputChange('whatsapp', e.target.value),
                            placeholder: '5555-5555',
                            style: getFieldStyle('whatsapp', { width: '100%' }),
                            onFocus: (e) => e.target.style.borderColor = '#3b82f6',
                            onBlur: (e) => e.target.style.borderColor = '#d1d5db'
                        })
                    ])
                ]),

                // Dirección (campo completo)
                e('div', {
                    key: 'direccion-field',
                    style: { marginTop: '1rem' }
                }, [
                    e('label', {
                        key: 'direccion-label',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Dirección'),
                    e('textarea', {
                        key: 'direccion-input',
                        value: formData.direccion,
                        onChange: (e) => handleInputChange('direccion', e.target.value),
                        placeholder: 'Dirección completa...',
                        rows: 2,
                        style: getFieldStyle('direccion', {
                            width: '100%',
                            resize: 'vertical',
                            minHeight: '60px'
                        }),
                        onFocus: (e) => e.target.style.borderColor = '#3b82f6',
                        onBlur: (e) => e.target.style.borderColor = '#d1d5db'
                    })
                ])
            ]),

            // Sección: Información Laboral
            e('div', {
                key: 'section-laboral',
                style: {
                    backgroundColor: '#f0f9ff',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #bae6fd'
                }
            }, [
                e('h3', {
                    key: 'section-title-laboral',
                    style: {
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#0c4a6e',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [
                    Icons.briefcase(),
                    'Información Laboral'
                ]),

                e('div', {
                    key: 'laboral-grid',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1rem'
                    }
                }, [
                    // Código de empleado
                    e('div', { key: 'codigo-empleado-field' }, [
                        e('label', {
                            key: 'codigo-label',
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, [
                            'Código de Empleado ',
                            e('span', { key: 'required', style: { color: '#ef4444' } }, '*')
                        ]),
                        e('div', {
                            key: 'codigo-input-group',
                            style: { display: 'flex', gap: '0.5rem' }
                        }, [
                            e('input', {
                                key: 'codigo-input',
                                type: 'text',
                                value: formData.codigo_empleado,
                                onChange: (e) => handleInputChange('codigo_empleado', e.target.value.toUpperCase()),
                                placeholder: 'EMP001',
                                style: getFieldStyle('codigo_empleado', {
                                    flex: '1',
                                    fontFamily: 'monospace',
                                    fontWeight: '600'
                                }),
                                onFocus: (e) => e.target.style.borderColor = '#3b82f6',
                                onBlur: (e) => e.target.style.borderColor = errors.codigo_empleado ? '#ef4444' : '#d1d5db'
                            }),
                            e('button', {
                                key: 'btn-generar-codigo',
                                type: 'button',
                                onClick: generarCodigoEmpleado,
                                title: 'Generar código automático',
                                style: {
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    backgroundColor: '#f9fafb',
                                    color: '#6b7280',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                },
                                onMouseEnter: (e) => {
                                    e.target.style.backgroundColor = '#f3f4f6';
                                    e.target.style.borderColor = '#9ca3af';
                                },
                                onMouseLeave: (e) => {
                                    e.target.style.backgroundColor = '#f9fafb';
                                    e.target.style.borderColor = '#d1d5db';
                                }
                            }, Icons.refresh())
                        ]),
                        errors.codigo_empleado && e('p', {
                            key: 'codigo-error',
                            style: { color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }
                        }, errors.codigo_empleado)
                    ]),

                    // Rol
                    e('div', { key: 'rol-field' }, [
                        e('label', {
                            key: 'rol-label',
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, [
                            'Rol ',
                            e('span', { key: 'required', style: { color: '#ef4444' } }, '*')
                        ]),
                        e('select', {
                            key: 'rol-select',
                            value: formData.rol_id,
                            onChange: (e) => handleInputChange('rol_id', e.target.value),
                            style: getFieldStyle('rol_id', { width: '100%' }),
                            onFocus: (e) => e.target.style.borderColor = '#3b82f6',
                            onBlur: (e) => e.target.style.borderColor = errors.rol_id ? '#ef4444' : '#d1d5db'
                        }, [
                            e('option', { key: 'rol-default', value: '' }, 'Seleccionar rol...'),
                            ...roles.map(rol =>
                                e('option', { key: rol.id, value: rol.id }, rol.nombre_rol)
                            )
                        ]),
                        errors.rol_id && e('p', {
                            key: 'rol-error',
                            style: { color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }
                        }, errors.rol_id)
                    ]),

                    // Estado empleado
                    e('div', { key: 'estado-field' }, [
                        e('label', {
                            key: 'estado-label',
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, [
                            'Estado ',
                            e('span', { key: 'required', style: { color: '#ef4444' } }, '*')
                        ]),
                        e('select', {
                            key: 'estado-select',
                            value: formData.estado_empleado_id,
                            onChange: (e) => handleInputChange('estado_empleado_id', e.target.value),
                            style: getFieldStyle('estado_empleado_id', { width: '100%' }),
                            onFocus: (e) => e.target.style.borderColor = '#3b82f6',
                            onBlur: (e) => e.target.style.borderColor = errors.estado_empleado_id ? '#ef4444' : '#d1d5db'
                        }, [
                            e('option', { key: 'estado-default', value: '' }, 'Seleccionar estado...'),
                            ...estadosEmpleado.map(estado =>
                                e('option', { key: estado.id, value: estado.id }, estado.nombre_estado)
                            )
                        ]),
                        errors.estado_empleado_id && e('p', {
                            key: 'estado-error',
                            style: { color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }
                        }, errors.estado_empleado_id)
                    ]),

                    // Fecha de ingreso
                    e('div', { key: 'fecha-ingreso-field' }, [
                        e('label', {
                            key: 'fecha-ingreso-label',
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, 'Fecha de Ingreso'),
                        e('input', {
                            key: 'fecha-ingreso-input',
                            type: 'date',
                            value: formData.fecha_ingreso,
                            onChange: (e) => handleInputChange('fecha_ingreso', e.target.value),
                            style: getFieldStyle('fecha_ingreso', { width: '100%' }),
                            onFocus: (e) => e.target.style.borderColor = '#3b82f6',
                            onBlur: (e) => e.target.style.borderColor = '#d1d5db'
                        })
                    ]),

                    // Situación (activo/inactivo)
                    e('div', { key: 'situacion-field' }, [
                        e('label', {
                            key: 'situacion-label',
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, 'Situación'),
                        e('div', {
                            key: 'situacion-toggle',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                backgroundColor: 'white',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px'
                            }
                        }, [
                            e('input', {
                                key: 'situacion-checkbox',
                                type: 'checkbox',
                                id: 'situacion-checkbox',
                                checked: formData.situacion,
                                onChange: (e) => handleInputChange('situacion', e.target.checked),
                                style: {
                                    width: '18px',
                                    height: '18px',
                                    accentColor: '#3b82f6'
                                }
                            }),
                            e('label', {
                                key: 'situacion-checkbox-label',
                                htmlFor: 'situacion-checkbox',
                                style: {
                                    fontSize: '0.875rem',
                                    color: '#374151',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }
                            }, 'Empleado activo'),
                            e('span', {
                                key: 'situacion-badge',
                                style: {
                                    marginLeft: 'auto',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    backgroundColor: formData.situacion ? '#dcfce7' : '#fef3c7',
                                    color: formData.situacion ? '#16a34a' : '#d97706'
                                }
                            }, formData.situacion ? 'Activo' : 'Inactivo')
                        ])
                    ])
                ])
            ]),

            // Sección: Credenciales (solo si es creación o se quiere cambiar password)
            e('div', {
                key: 'section-credenciales',
                style: {
                    backgroundColor: '#fefce8',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #fde047'
                }
            }, [
                e('h3', {
                    key: 'section-title-credenciales',
                    style: {
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#a16207',
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }
                }, [
                    Icons.key(),
                    mode === 'create' ? 'Credenciales de Acceso' : 'Cambiar Contraseña'
                ]),

                mode === 'edit' && e('p', {
                    key: 'password-help-text',
                    style: {
                        fontSize: '0.875rem',
                        color: '#a16207',
                        marginBottom: '1rem'
                    }
                }, 'Deje los campos vacíos si no desea cambiar la contraseña'),

                e('div', {
                    key: 'password-grid',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: mode === 'create' ? '1fr 1fr' : '1fr 1fr',
                        gap: '1rem'
                    }
                }, [
                    // Password
                    e('div', { key: 'password-field' }, [
                        e('label', {
                            key: 'password-label',
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, [
                            'Contraseña',
                            mode === 'create' && e('span', { key: 'required', style: { color: '#ef4444' } }, ' *')
                        ]),
                        e('div', {
                            key: 'password-input-group',
                            style: { position: 'relative' }
                        }, [
                            e('input', {
                                key: 'password-input',
                                type: showPassword ? 'text' : 'password',
                                value: formData.password,
                                onChange: (e) => handleInputChange('password', e.target.value),
                                placeholder: mode === 'create' ? 'Mínimo 6 caracteres' : 'Nueva contraseña (opcional)',
                                style: getFieldStyle('password', {
                                    width: '100%',
                                    paddingRight: '3rem'
                                }),
                                onFocus: (e) => e.target.style.borderColor = '#3b82f6',
                                onBlur: (e) => e.target.style.borderColor = errors.password ? '#ef4444' : '#d1d5db'
                            }),
                            e('button', {
                                key: 'toggle-password',
                                type: 'button',
                                onClick: () => setShowPassword(!showPassword),
                                style: {
                                    position: 'absolute',
                                    right: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: '#6b7280',
                                    cursor: 'pointer',
                                    padding: '0.25rem'
                                }
                            }, showPassword ? Icons.eyeOff() : Icons.eye())
                        ]),
                        errors.password && e('p', {
                            key: 'password-error',
                            style: { color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }
                        }, errors.password)
                    ]),

                    // Confirmar Password
                    e('div', { key: 'confirm-password-field' }, [
                        e('label', {
                            key: 'confirm-password-label',
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, [
                            'Confirmar Contraseña',
                            mode === 'create' && e('span', { key: 'required', style: { color: '#ef4444' } }, ' *')
                        ]),
                        e('div', {
                            key: 'confirm-password-input-group',
                            style: { position: 'relative' }
                        }, [
                            e('input', {
                                key: 'confirm-password-input',
                                type: showConfirmPassword ? 'text' : 'password',
                                value: formData.confirmPassword,
                                onChange: (e) => handleInputChange('confirmPassword', e.target.value),
                                placeholder: 'Repetir contraseña',
                                style: getFieldStyle('confirmPassword', {
                                    width: '100%',
                                    paddingRight: '3rem'
                                }),
                                onFocus: (e) => e.target.style.borderColor = '#3b82f6',
                                onBlur: (e) => e.target.style.borderColor = errors.confirmPassword ? '#ef4444' : '#d1d5db'
                            }),
                            e('button', {
                                key: 'toggle-confirm-password',
                                type: 'button',
                                onClick: () => setShowConfirmPassword(!showConfirmPassword),
                                style: {
                                    position: 'absolute',
                                    right: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: '#6b7280',
                                    cursor: 'pointer',
                                    padding: '0.25rem'
                                }
                            }, showConfirmPassword ? Icons.eyeOff() : Icons.eye())
                        ]),
                        errors.confirmPassword && e('p', {
                            key: 'confirm-password-error',
                            style: { color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }
                        }, errors.confirmPassword)
                    ])
                ])
            ])
        ]),

        // Botones de acción
        e('div', {
            key: 'form-actions',
            style: {
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid #e5e7eb'
            }
        }, [
            // Botón Cancelar
            e('button', {
                key: 'btn-cancel',
                type: 'button',
                onClick: onCancel,
                disabled: loading,
                style: {
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.6 : 1
                },
                onMouseEnter: !loading ? (e) => {
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.borderColor = '#9ca3af';
                } : undefined,
                onMouseLeave: !loading ? (e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.borderColor = '#d1d5db';
                } : undefined
            }, 'Cancelar'),

            // Botón Guardar
            e('button', {
                key: 'btn-save',
                type: 'submit',
                disabled: loading,
                style: {
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                },
                onMouseEnter: !loading ? (e) => {
                    e.target.style.backgroundColor = '#2563eb';
                    e.target.style.transform = 'translateY(-1px)';
                } : undefined,
                onMouseLeave: !loading ? (e) => {
                    e.target.style.backgroundColor = '#3b82f6';
                    e.target.style.transform = 'translateY(0)';
                } : undefined
            }, [
                loading && e('div', {
                    key: 'loading-spinner',
                    style: {
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid currentColor',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }
                }),
                e('span', { key: 'save-text' },
                    loading ? 'Guardando...' :
                        mode === 'create' ? 'Crear Empleado' : 'Actualizar Empleado'
                )
            ])
        ])
    ]);
}

export default EmpleadosForm;
