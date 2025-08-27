// src/resources/js/components/usuarios/roles/GestionRoles.js
import React from 'react';
import Icons from '../../../utils/Icons';
import Notifications from '../../../utils/notifications';
import RolesBadge from '../common/RolesBadge';

const { createElement: e, useState, useEffect } = React;

function GestionRoles() {
    // Estados principales
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados del modal
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [rolSeleccionado, setRolSeleccionado] = useState(null);

    // Estados del formulario
    const [formData, setFormData] = useState({
        codigo: '',
        nombre_rol: '',
        descripcion: '',
        nivel_jerarquia: 1,
        puede_autorizar: false,
        permisos_json: []
    });
    const [errores, setErrores] = useState({});
    const [guardando, setGuardando] = useState(false);

    // Permisos disponibles del sistema
    const [permisosDisponibles] = useState([
        {
            categoria: 'Personas',
            permisos: [
                'personas.ver',
                'personas.crear',
                'personas.editar',
                'personas.eliminar',
                'empleados.ver',
                'empleados.crear',
                'empleados.editar',
                'empleados.eliminar',
                'clientes.ver',
                'clientes.crear',
                'clientes.editar',
                'clientes.eliminar'
            ]
        },
        {
            categoria: 'Vehículos y Flota',
            permisos: [
                'vehiculos.ver',
                'vehiculos.crear',
                'vehiculos.editar',
                'vehiculos.eliminar'
            ]
        },
        {
            categoria: 'Rutas y Operaciones',
            permisos: [
                'rutas.ver',
                'rutas.crear',
                'rutas.editar',
                'rutas.eliminar',
                'rutas.ejecutar',
                'rutas.asignar_chofer'
            ]
        },
        {
            categoria: 'Reservas',
            permisos: [
                'reservas.ver',
                'reservas.crear',
                'reservas.editar',
                'reservas.eliminar',
                'reservas.confirmar',
                'reservas.cancelar'
            ]
        },
        {
            categoria: 'Ventas y Facturación',
            permisos: [
                'ventas.ver',
                'ventas.crear',
                'ventas.editar',
                'ventas.anular',
                'ventas.aplicar_descuento',
                'ventas.autorizar_credito'
            ]
        },
        {
            categoria: 'Reportes y Dashboard',
            permisos: [
                'reportes.ver',
                'reportes.exportar',
                'dashboard.ver'
            ]
        },
        {
            categoria: 'Administración',
            permisos: [
                'auditoria.ver',
                'catalogos.ver',
                'catalogos.editar',
                'sistema.configurar',
                'sistema.respaldos'
            ]
        }
    ]);

    // Cargar roles al inicializar
    useEffect(() => {
        fetchRoles();
    }, []);

    // Obtener roles desde la API
    const fetchRoles = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/v1/roles', {
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
            setRoles(Array.isArray(result) ? result : result.data || []);

        } catch (err) {
            console.error('Error al cargar roles:', err);
            setError(err.message);
            Notifications.error('Error al cargar roles: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Manejar cambios en el formulario
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errores[field]) {
            setErrores(prev => {
                const newErrores = { ...prev };
                delete newErrores[field];
                return newErrores;
            });
        }
    };

    // Manejar cambios en permisos
    const handlePermisoChange = (permiso, checked) => {
        setFormData(prev => ({
            ...prev,
            permisos_json: checked
                ? [...prev.permisos_json, permiso]
                : prev.permisos_json.filter(p => p !== permiso)
        }));
    };

    // Seleccionar/deseleccionar todos los permisos de una categoría
    const handleCategoriaChange = (categoria, checked) => {
        const permisosCategoria = permisosDisponibles.find(c => c.categoria === categoria)?.permisos || [];

        setFormData(prev => ({
            ...prev,
            permisos_json: checked
                ? [...new Set([...prev.permisos_json, ...permisosCategoria])]
                : prev.permisos_json.filter(p => !permisosCategoria.includes(p))
        }));
    };

    // Validar formulario
    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formData.codigo.trim()) {
            nuevosErrores.codigo = 'El código es requerido';
        } else if (!/^[A-Z0-9_]+$/.test(formData.codigo)) {
            nuevosErrores.codigo = 'Solo letras mayúsculas, números y guiones bajos';
        }

        if (!formData.nombre_rol.trim()) {
            nuevosErrores.nombre_rol = 'El nombre del rol es requerido';
        }

        if (formData.nivel_jerarquia < 1 || formData.nivel_jerarquia > 10) {
            nuevosErrores.nivel_jerarquia = 'El nivel debe estar entre 1 y 10';
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // Guardar rol
    const guardarRol = async () => {
        if (!validarFormulario()) {
            Notifications.warning('Corrija los errores del formulario', 'Errores de Validación');
            return;
        }

        setGuardando(true);

        try {
            const url = modalMode === 'create' ? '/api/v1/roles' : `/api/v1/roles/${rolSeleccionado.id}`;
            const method = modalMode === 'create' ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}`);
            }

            Notifications.success(
                modalMode === 'create' ? 'Rol creado correctamente' : 'Rol actualizado correctamente'
            );

            cerrarModal();
            await fetchRoles();

        } catch (err) {
            console.error('Error al guardar rol:', err);
            Notifications.error('Error al guardar: ' + err.message);
        } finally {
            setGuardando(false);
        }
    };

    // Abrir modal para crear
    const abrirModalCrear = () => {
        setFormData({
            codigo: '',
            nombre_rol: '',
            descripcion: '',
            nivel_jerarquia: 1,
            puede_autorizar: false,
            permisos_json: []
        });
        setErrores({});
        setModalMode('create');
        setRolSeleccionado(null);
        setShowModal(true);
    };

    // Abrir modal para editar
    const abrirModalEditar = (rol) => {
        setFormData({
            codigo: rol.codigo || '',
            nombre_rol: rol.nombre_rol || '',
            descripcion: rol.descripcion || '',
            nivel_jerarquia: rol.nivel_jerarquia || 1,
            puede_autorizar: rol.puede_autorizar || false,
            permisos_json: rol.permisos_json || []
        });
        setErrores({});
        setModalMode('edit');
        setRolSeleccionado(rol);
        setShowModal(true);
    };

    // Cerrar modal
    const cerrarModal = () => {
        setShowModal(false);
        setRolSeleccionado(null);
        setFormData({
            codigo: '',
            nombre_rol: '',
            descripcion: '',
            nivel_jerarquia: 1,
            puede_autorizar: false,
            permisos_json: []
        });
        setErrores({});
    };

    // Eliminar rol
    const eliminarRol = async (rol) => {
        if (typeof window.iziToast !== 'undefined') {
            window.iziToast.question({
                timeout: false,
                close: false,
                overlay: true,
                displayMode: 'once',
                id: 'delete-rol-confirm',
                zindex: 9999,
                title: 'Confirmar Eliminación',
                message: `¿Está seguro de eliminar el rol "${rol.nombre_rol}"? Esta acción NO se puede deshacer.`,
                position: 'center',
                buttons: [
                    [`<button style="background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; padding: 8px 16px; border-radius: 6px; margin-right: 8px;">Cancelar</button>`,
                        function (instance, toast) {
                            instance.hide({ transitionOut: 'fadeOutUp' }, toast, 'button');
                        }],
                    [`<button style="background: #dc2626; color: #ffffff; border: 1px solid #dc2626; padding: 8px 16px; border-radius: 6px;">Eliminar</button>`,
                        async function (instance, toast) {
                            instance.hide({ transitionOut: 'fadeOutUp' }, toast, 'button');
                            await ejecutarEliminacion();
                        }]
                ]
            });
        } else {
            if (confirm(`¿Está seguro de eliminar el rol "${rol.nombre_rol}"?`)) {
                await ejecutarEliminacion();
            }
        }

        async function ejecutarEliminacion() {
            try {
                const response = await fetch(`/api/v1/roles/${rol.id}`, {
                    method: 'DELETE',
                    headers: { 'Accept': 'application/json' }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al eliminar');
                }

                Notifications.success(`Rol "${rol.nombre_rol}" eliminado correctamente`);
                await fetchRoles();

            } catch (err) {
                console.error('Error al eliminar rol:', err);
                Notifications.error('Error al eliminar: ' + err.message);
            }
        }
    };

    return e('div', {
        style: { maxWidth: '100%' }
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
                }, 'Gestión de Roles y Permisos'),
                e('p', {
                    key: 'description',
                    style: {
                        color: '#6b7280',
                        margin: '0',
                        fontSize: '0.875rem'
                    }
                }, `${roles.length} rol${roles.length !== 1 ? 'es' : ''} configurado${roles.length !== 1 ? 's' : ''}`)
            ]),
            e('button', {
                key: 'btn-create',
                onClick: abrirModalCrear,
                style: {
                    backgroundColor: '#dc2626',
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
                onMouseEnter: (e) => e.target.style.backgroundColor = '#b91c1c',
                onMouseLeave: (e) => e.target.style.backgroundColor = '#dc2626'
            }, [
                Icons.plus(),
                'Nuevo Rol'
            ])
        ]),

        // Lista de roles
        loading ? e('div', {
            key: 'loading',
            style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '3rem'
            }
        }, [
            e('div', {
                style: {
                    width: '32px',
                    height: '32px',
                    border: '3px solid #f3f4f6',
                    borderTop: '3px solid #dc2626',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }
            })
        ]) : error ? e('div', {
            key: 'error',
            style: {
                padding: '2rem',
                textAlign: 'center',
                color: '#dc2626'
            }
        }, `Error: ${error}`) : e('div', {
            key: 'roles-grid',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '1.5rem'
            }
        }, roles.map(rol =>
            e('div', {
                key: `rol-${rol.id}`,
                style: {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.2s'
                },
                onMouseEnter: (e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)',
                onMouseLeave: (e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
            }, [
                // Header del rol
                e('div', {
                    key: 'rol-header',
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1rem'
                    }
                }, [
                    e('div', {
                        key: 'rol-info',
                        style: { flex: '1' }
                    }, [
                        e('div', {
                            key: 'rol-title',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginBottom: '0.5rem'
                            }
                        }, [
                            e(RolesBadge, {
                                key: 'rol-badge',
                                rol: rol,
                                size: 'normal',
                                showJerarquia: true
                            }),
                            rol.puede_autorizar && e('span', {
                                key: 'auth-badge',
                                style: {
                                    padding: '0.125rem 0.375rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.6875rem',
                                    fontWeight: '500',
                                    backgroundColor: '#fef3c7',
                                    color: '#d97706'
                                }
                            }, 'Autoriza')
                        ]),
                        e('h3', {
                            key: 'rol-name',
                            style: {
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: '#111827',
                                margin: '0 0 0.25rem 0'
                            }
                        }, rol.nombre_rol),
                        rol.descripcion && e('p', {
                            key: 'rol-description',
                            style: {
                                fontSize: '0.875rem',
                                color: '#6b7280',
                                margin: '0',
                                lineHeight: '1.4'
                            }
                        }, rol.descripcion)
                    ]),

                    // Acciones
                    e('div', {
                        key: 'rol-actions',
                        style: {
                            display: 'flex',
                            gap: '0.5rem'
                        }
                    }, [
                        e('button', {
                            key: 'btn-edit',
                            onClick: () => abrirModalEditar(rol),
                            title: 'Editar rol',
                            style: {
                                padding: '0.5rem',
                                border: 'none',
                                borderRadius: '6px',
                                backgroundColor: '#dbeafe',
                                color: '#3b82f6',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            },
                            onMouseEnter: (e) => e.target.style.backgroundColor = '#bfdbfe',
                            onMouseLeave: (e) => e.target.style.backgroundColor = '#dbeafe'
                        }, Icons.edit()),

                        e('button', {
                            key: 'btn-delete',
                            onClick: () => eliminarRol(rol),
                            title: 'Eliminar rol',
                            style: {
                                padding: '0.5rem',
                                border: 'none',
                                borderRadius: '6px',
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            },
                            onMouseEnter: (e) => e.target.style.backgroundColor = '#fecaca',
                            onMouseLeave: (e) => e.target.style.backgroundColor = '#fee2e2'
                        }, Icons.trash())
                    ])
                ]),

                // Información del rol
                e('div', {
                    key: 'rol-details',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                        marginBottom: '1rem',
                        padding: '1rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px'
                    }
                }, [
                    e('div', { key: 'codigo-info' }, [
                        e('div', {
                            key: 'codigo-label',
                            style: {
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                fontWeight: '500',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }
                        }, 'Código'),
                        e('div', {
                            key: 'codigo-value',
                            style: {
                                fontSize: '0.875rem',
                                color: '#111827',
                                fontWeight: '600',
                                fontFamily: 'monospace',
                                marginTop: '0.25rem'
                            }
                        }, rol.codigo)
                    ]),
                    e('div', { key: 'empleados-info' }, [
                        e('div', {
                            key: 'empleados-label',
                            style: {
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                fontWeight: '500',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }
                        }, 'Empleados'),
                        e('div', {
                            key: 'empleados-value',
                            style: {
                                fontSize: '0.875rem',
                                color: '#111827',
                                fontWeight: '600',
                                marginTop: '0.25rem'
                            }
                        }, '0') // TODO: Obtener conteo real
                    ])
                ]),

                // Permisos resumen
                e('div', {
                    key: 'permisos-summary',
                    style: { borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }
                }, [
                    e('div', {
                        key: 'permisos-header',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem'
                        }
                    }, [
                        e('span', {
                            key: 'permisos-label',
                            style: {
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                fontWeight: '500',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }
                        }, 'Permisos'),
                        e('span', {
                            key: 'permisos-count',
                            style: {
                                padding: '0.125rem 0.375rem',
                                borderRadius: '9999px',
                                fontSize: '0.6875rem',
                                fontWeight: '500',
                                backgroundColor: '#e0e7ff',
                                color: '#4338ca'
                            }
                        }, rol.permisos_json?.length || 0)
                    ]),
                    e('div', {
                        key: 'permisos-preview',
                        style: {
                            fontSize: '0.75rem',
                            color: '#374151',
                            lineHeight: '1.4',
                            maxHeight: '3rem',
                            overflow: 'hidden'
                        }
                    }, rol.permisos_json?.slice(0, 3).join(', ') + (rol.permisos_json?.length > 3 ? '...' : ''))
                ])
            ])
        )),

        // Modal para crear/editar rol
        showModal && e('div', {
            key: 'modal',
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
            },
            onClick: (e) => e.target === e.currentTarget && cerrarModal()
        }, [
            e('div', {
                key: 'modal-content',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '800px',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }
            }, [
                // Modal header
                e('div', {
                    key: 'modal-header',
                    style: {
                        padding: '1.5rem 2rem 1rem 2rem',
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }
                }, [
                    e('h2', {
                        key: 'modal-title',
                        style: {
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#111827',
                            margin: '0'
                        }
                    }, modalMode === 'create' ? 'Crear Nuevo Rol' : 'Editar Rol'),
                    e('button', {
                        key: 'close-btn',
                        onClick: cerrarModal,
                        style: {
                            padding: '0.5rem',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: 'transparent',
                            color: '#6b7280',
                            cursor: 'pointer'
                        }
                    }, Icons.x())
                ]),

                // Modal body
                e('div', {
                    key: 'modal-body',
                    style: {
                        padding: '2rem',
                        maxHeight: '60vh',
                        overflow: 'auto'
                    }
                }, [
                    // Información básica
                    e('div', {
                        key: 'basic-info',
                        style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem',
                            marginBottom: '2rem'
                        }
                    }, [
                        e('div', { key: 'codigo-field' }, [
                            e('label', {
                                key: 'codigo-label',
                                style: {
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }
                            }, 'Código *'),
                            e('input', {
                                key: 'codigo-input',
                                type: 'text',
                                value: formData.codigo,
                                onChange: (e) => handleInputChange('codigo', e.target.value.toUpperCase()),
                                placeholder: 'Ej: ADMIN, VENDEDOR',
                                style: {
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    border: errores.codigo ? '2px solid #ef4444' : '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    outline: 'none'
                                }
                            }),
                            errores.codigo && e('p', {
                                key: 'codigo-error',
                                style: { color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }
                            }, errores.codigo)
                        ]),

                        e('div', { key: 'nombre-field' }, [
                            e('label', {
                                key: 'nombre-label',
                                style: {
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }
                            }, 'Nombre del Rol *'),
                            e('input', {
                                key: 'nombre-input',
                                type: 'text',
                                value: formData.nombre_rol,
                                onChange: (e) => handleInputChange('nombre_rol', e.target.value),
                                placeholder: 'Ej: Administrador, Vendedor',
                                style: {
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    border: errores.nombre_rol ? '2px solid #ef4444' : '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    outline: 'none'
                                }
                            }),
                            errores.nombre_rol && e('p', {
                                key: 'nombre-error',
                                style: { color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }
                            }, errores.nombre_rol)
                        ])
                    ]),

                    // Descripción
                    e('div', {
                        key: 'descripcion-field',
                        style: { marginBottom: '2rem' }
                    }, [
                        e('label', {
                            key: 'descripcion-label',
                            style: {
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '0.5rem'
                            }
                        }, 'Descripción'),
                        e('textarea', {
                            key: 'descripcion-input',
                            value: formData.descripcion,
                            onChange: (e) => handleInputChange('descripcion', e.target.value),
                            placeholder: 'Descripción del rol y sus responsabilidades...',
                            rows: 3,
                            style: {
                                width: '100%',
                                padding: '0.75rem 1rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                outline: 'none',
                                resize: 'vertical'
                            }
                        })
                    ]),

                    // Configuración avanzada
                    e('div', {
                        key: 'advanced-config',
                        style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem',
                            marginBottom: '2rem'
                        }
                    }, [
                        e('div', { key: 'jerarquia-field' }, [
                            e('label', {
                                key: 'jerarquia-label',
                                style: {
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }
                            }, 'Nivel Jerárquico *'),
                            e('input', {
                                key: 'jerarquia-input',
                                type: 'number',
                                min: 1,
                                max: 10,
                                value: formData.nivel_jerarquia,
                                onChange: (e) => handleInputChange('nivel_jerarquia', parseInt(e.target.value) || 1),
                                style: {
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    border: errores.nivel_jerarquia ? '2px solid #ef4444' : '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    outline: 'none'
                                }
                            }),
                            errores.nivel_jerarquia && e('p', {
                                key: 'jerarquia-error',
                                style: { color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }
                            }, errores.nivel_jerarquia),
                            e('p', {
                                key: 'jerarquia-help',
                                style: {
                                    fontSize: '0.75rem',
                                    color: '#6b7280',
                                    marginTop: '0.25rem'
                                }
                            }, '1-10 (10 = nivel más alto)')
                        ]),

                        e('div', { key: 'autorizar-field' }, [
                            e('label', {
                                key: 'autorizar-label',
                                style: {
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '0.5rem'
                                }
                            }, 'Permisos de Autorización'),
                            e('div', {
                                key: 'autorizar-toggle',
                                style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem',
                                    backgroundColor: '#f9fafb',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                }
                            }, [
                                e('input', {
                                    key: 'autorizar-checkbox',
                                    type: 'checkbox',
                                    id: 'puede-autorizar',
                                    checked: formData.puede_autorizar,
                                    onChange: (e) => handleInputChange('puede_autorizar', e.target.checked),
                                    style: {
                                        width: '18px',
                                        height: '18px',
                                        accentColor: '#dc2626'
                                    }
                                }),
                                e('label', {
                                    key: 'autorizar-checkbox-label',
                                    htmlFor: 'puede-autorizar',
                                    style: {
                                        fontSize: '0.875rem',
                                        color: '#374151',
                                        cursor: 'pointer'
                                    }
                                }, 'Puede autorizar operaciones')
                            ])
                        ])
                    ]),

                    // Permisos por categoría
                    e('div', {
                        key: 'permisos-section',
                        style: { marginBottom: '2rem' }
                    }, [
                        e('h3', {
                            key: 'permisos-title',
                            style: {
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                color: '#111827',
                                marginBottom: '1rem'
                            }
                        }, 'Permisos del Sistema'),

                        ...permisosDisponibles.map(categoria =>
                            e('div', {
                                key: `categoria-${categoria.categoria}`,
                                style: {
                                    marginBottom: '1.5rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    overflow: 'hidden'
                                }
                            }, [
                                // Header de categoría
                                e('div', {
                                    key: 'categoria-header',
                                    style: {
                                        padding: '0.75rem 1rem',
                                        backgroundColor: '#f9fafb',
                                        borderBottom: '1px solid #e5e7eb',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem'
                                    }
                                }, [
                                    e('input', {
                                        key: 'categoria-checkbox',
                                        type: 'checkbox',
                                        checked: categoria.permisos.every(p => formData.permisos_json.includes(p)),
                                        onChange: (e) => handleCategoriaChange(categoria.categoria, e.target.checked),
                                        style: {
                                            width: '16px',
                                            height: '16px',
                                            accentColor: '#dc2626'
                                        }
                                    }),
                                    e('span', {
                                        key: 'categoria-name',
                                        style: {
                                            fontWeight: '600',
                                            color: '#374151'
                                        }
                                    }, categoria.categoria),
                                    e('span', {
                                        key: 'categoria-count',
                                        style: {
                                            fontSize: '0.75rem',
                                            color: '#6b7280'
                                        }
                                    }, `(${categoria.permisos.filter(p => formData.permisos_json.includes(p)).length}/${categoria.permisos.length})`)
                                ]),
                                // Permisos de la categoría
                                e('div', {
                                    key: 'categoria-permisos',
                                    style: {
                                        padding: '1rem',
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: '0.5rem'
                                    }
                                }, categoria.permisos.map(permiso =>
                                    e('label', {
                                        key: `permiso-${permiso}`,
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
                                            key: 'permiso-checkbox',
                                            type: 'checkbox',
                                            checked: formData.permisos_json.includes(permiso),
                                            onChange: (e) => handlePermisoChange(permiso, e.target.checked),
                                            style: {
                                                width: '14px',
                                                height: '14px',
                                                accentColor: '#dc2626'
                                            }
                                        }),
                                        e('span', { key: 'permiso-name' }, permiso.replace('.', ' → '))
                                    ])
                                ))
                            ])
                        )
                    ])
                ]),

                // Modal footer
                e('div', {
                    key: 'modal-footer',
                    style: {
                        padding: '1rem 2rem 2rem 2rem',
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '1rem'
                    }
                }, [
                    e('button', {
                        key: 'cancel-btn',
                        onClick: cerrarModal,
                        disabled: guardando,
                        style: {
                            padding: '0.75rem 1.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            color: '#374151',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: guardando ? 'not-allowed' : 'pointer'
                        }
                    }, 'Cancelar'),

                    e('button', {
                        key: 'save-btn',
                        onClick: guardarRol,
                        disabled: guardando,
                        style: {
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            borderRadius: '8px',
                            backgroundColor: guardando ? '#9ca3af' : '#dc2626',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: guardando ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }
                    }, [
                        guardando && e('div', {
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
                        guardando ? 'Guardando...' : (modalMode === 'create' ? 'Crear Rol' : 'Actualizar Rol')
                    ])
                ])
            ])
        ])
    ]);
}

export default GestionRoles;
