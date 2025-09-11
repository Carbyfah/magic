// src/resources/js/components/Login.js
import React from 'react';
import AuthService from '../services/auth';
import Icons from '../utils/Icons';

const { createElement: e, useState, useEffect } = React;

function Login({ onLoginSuccess }) {
    const [formData, setFormData] = useState({
        usuario_codigo: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // MODO PRODUCCIÓN - Sin bypass de desarrollo
    const DESARROLLO_MODE = false;

    // Verificar si ya esta autenticado al cargar
    useEffect(() => {
        if (AuthService.isAuthenticated()) {
            onLoginSuccess(AuthService.getUser());
        }
    }, [onLoginSuccess]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Limpiar error cuando el usuario empiece a escribir
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.usuario_codigo.trim() || !formData.password.trim()) {
            setError('Por favor complete todos los campos');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await AuthService.login(
                formData.usuario_codigo.trim(),
                formData.password
            );

            if (result.success) {
                onLoginSuccess(result.user);
            } else {
                setError(result.message || 'Error en las credenciales');
            }
        } catch (error) {
            console.error('Error en login:', error);
            setError('Error de conexión. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return e('div', {
        style: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }
    }, [
        // Contenedor principal
        e('div', {
            key: 'login-container',
            style: {
                width: '100%',
                maxWidth: '400px',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden'
            }
        }, [
            // Header
            e('div', {
                key: 'header',
                style: {
                    padding: '2rem 2rem 1rem 2rem',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }
            }, [
                e('div', {
                    key: 'logo',
                    style: {
                        width: '80px',
                        height: '80px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        fontSize: '36px'
                    }
                }, Icons.shield()),

                e('h1', {
                    key: 'title',
                    style: {
                        fontSize: '28px',
                        fontWeight: '700',
                        margin: '0 0 0.5rem 0',
                        letterSpacing: '-0.025em'
                    }
                }, 'Magic Travel'),

                e('p', {
                    key: 'subtitle',
                    style: {
                        fontSize: '16px',
                        opacity: 0.9,
                        margin: 0,
                        fontWeight: '400'
                    }
                }, 'Sistema de Gestión Turística')
            ]),

            // Formulario
            e('div', {
                key: 'form-container',
                style: {
                    padding: '2rem'
                }
            }, [
                // Panel informativo con credenciales por defecto - LOS 3 ROLES
                e('div', {
                    key: 'credentials-info',
                    style: {
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        backgroundColor: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '8px',
                        fontSize: '14px'
                    }
                }, [
                    e('div', {
                        key: 'info-title',
                        style: {
                            fontWeight: '600',
                            color: '#0369a1',
                            marginBottom: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }
                    }, [
                        Icons.info(),
                        'Usuarios de prueba disponibles'
                    ]),

                    // ADMINISTRADOR
                    e('div', {
                        key: 'admin-credentials',
                        style: {
                            marginBottom: '0.5rem',
                            padding: '0.5rem',
                            backgroundColor: '#fef2f2',
                            borderRadius: '4px',
                            borderLeft: '3px solid #dc2626'
                        }
                    }, [
                        e('div', {
                            key: 'admin-title',
                            style: { fontWeight: '600', color: '#dc2626', fontSize: '12px', marginBottom: '2px' }
                        }, 'ADMINISTRADOR (Acceso completo)'),
                        e('div', { key: 'admin-user', style: { color: '#0c4a6e' } }, 'Usuario: USR-001'),
                        e('div', { key: 'admin-pass', style: { color: '#0c4a6e' } }, 'Contraseña: MagicTravel2025!')
                    ]),

                    // OPERADOR
                    e('div', {
                        key: 'operator-credentials',
                        style: {
                            marginBottom: '0.5rem',
                            padding: '0.5rem',
                            backgroundColor: '#eff6ff',
                            borderRadius: '4px',
                            borderLeft: '3px solid #2563eb'
                        }
                    }, [
                        e('div', {
                            key: 'operator-title',
                            style: { fontWeight: '600', color: '#2563eb', fontSize: '12px', marginBottom: '2px' }
                        }, 'OPERADOR (Solo operación)'),
                        e('div', { key: 'operator-user', style: { color: '#0c4a6e' } }, 'Usuario: USR-002'),
                        e('div', { key: 'operator-pass', style: { color: '#0c4a6e' } }, 'Contraseña: Operador123!')
                    ]),

                    // VENDEDOR
                    e('div', {
                        key: 'seller-credentials',
                        style: {
                            padding: '0.5rem',
                            backgroundColor: '#ecfdf5',
                            borderRadius: '4px',
                            borderLeft: '3px solid #059669'
                        }
                    }, [
                        e('div', {
                            key: 'seller-title',
                            style: { fontWeight: '600', color: '#059669', fontSize: '12px', marginBottom: '2px' }
                        }, 'VENDEDOR (Operación + Comercial)'),
                        e('div', { key: 'seller-user', style: { color: '#0c4a6e' } }, 'Usuario: USR-003'),
                        e('div', { key: 'seller-pass', style: { color: '#0c4a6e' } }, 'Contraseña: Vendedora123!')
                    ])
                ]),

                e('form', {
                    key: 'login-form',
                    onSubmit: handleSubmit,
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                    }
                }, [
                    // Campo Usuario
                    e('div', {
                        key: 'usuario-field',
                        style: { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
                    }, [
                        e('label', {
                            key: 'usuario-label',
                            style: {
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151'
                            }
                        }, 'Código de Usuario'),

                        e('div', {
                            key: 'usuario-input-container',
                            style: {
                                position: 'relative'
                            }
                        }, [
                            e('div', {
                                key: 'usuario-icon',
                                style: {
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9ca3af',
                                    zIndex: 1
                                }
                            }, Icons.user()),

                            e('input', {
                                key: 'usuario-input',
                                type: 'text',
                                value: formData.usuario_codigo,
                                onChange: (e) => handleInputChange('usuario_codigo', e.target.value),
                                onKeyPress: handleKeyPress,
                                placeholder: 'DEV-ADMIN-001',
                                disabled: loading,
                                style: {
                                    width: '100%',
                                    padding: '12px 12px 12px 40px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease',
                                    backgroundColor: loading ? '#f9fafb' : 'white',
                                    boxSizing: 'border-box'
                                },
                                onFocus: (e) => {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                },
                                onBlur: (e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                    e.target.style.boxShadow = 'none';
                                }
                            })
                        ])
                    ]),

                    // Campo Contraseña
                    e('div', {
                        key: 'password-field',
                        style: { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
                    }, [
                        e('label', {
                            key: 'password-label',
                            style: {
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#374151'
                            }
                        }, 'Contraseña'),

                        e('div', {
                            key: 'password-input-container',
                            style: {
                                position: 'relative'
                            }
                        }, [
                            e('div', {
                                key: 'password-icon',
                                style: {
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9ca3af',
                                    zIndex: 1
                                }
                            }, Icons.lock()),

                            e('input', {
                                key: 'password-input',
                                type: 'password',
                                value: formData.password,
                                onChange: (e) => handleInputChange('password', e.target.value),
                                onKeyPress: handleKeyPress,
                                placeholder: 'MagicTravel2025!',
                                disabled: loading,
                                style: {
                                    width: '100%',
                                    padding: '12px 12px 12px 40px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease',
                                    backgroundColor: loading ? '#f9fafb' : 'white',
                                    boxSizing: 'border-box'
                                },
                                onFocus: (e) => {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                },
                                onBlur: (e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                    e.target.style.boxShadow = 'none';
                                }
                            })
                        ])
                    ]),

                    // Mensaje de Error
                    error && e('div', {
                        key: 'error-message',
                        style: {
                            padding: '12px',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            color: '#dc2626',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }
                    }, [
                        Icons.alertTriangle(),
                        error
                    ]),

                    // Botón de Login
                    e('button', {
                        key: 'login-button',
                        type: 'submit',
                        disabled: loading || !formData.usuario_codigo.trim() || !formData.password.trim(),
                        style: {
                            width: '100%',
                            padding: '14px',
                            backgroundColor: loading ? '#9ca3af' : '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        },
                        onMouseEnter: (e) => {
                            if (!loading && formData.usuario_codigo.trim() && formData.password.trim()) {
                                e.target.style.backgroundColor = '#5a67d8';
                            }
                        },
                        onMouseLeave: (e) => {
                            if (!loading) {
                                e.target.style.backgroundColor = '#667eea';
                            }
                        }
                    }, [
                        loading && e('div', {
                            key: 'spinner',
                            style: {
                                width: '20px',
                                height: '20px',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderTop: '2px solid white',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }
                        }),
                        loading ? 'Iniciando sesión...' : 'Iniciar Sesión'
                    ])
                ])
            ]),

            // Footer
            e('div', {
                key: 'footer',
                style: {
                    padding: '1rem 2rem',
                    borderTop: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    textAlign: 'center'
                }
            }, [
                e('p', {
                    key: 'footer-text',
                    style: {
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: 0
                    }
                }, 'Copyright 2025 Magic Travel Guatemala - Sistema de Gestión Turística')
            ])
        ])
    ]);
}

// Estilos CSS para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

export default Login;
