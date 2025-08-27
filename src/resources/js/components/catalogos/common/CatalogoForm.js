// src/resources/js/components/catalogos/common/CatalogoForm.js
import React from 'react';
import Icons from '../../../utils/Icons';
import CountryAutocomplete from './CountryAutocomplete';
import CityAutocomplete from '../../common/CityAutocomplete';

const { createElement: e, useState, useEffect } = React;

function CatalogoForm({
    campos,
    validaciones,
    initialData,
    onSubmit,
    onCancel
}) {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Inicializar datos del formulario
    useEffect(() => {
        const initData = {};
        campos.forEach(campo => {
            if (initialData && initialData[campo.key] !== undefined) {
                initData[campo.key] = initialData[campo.key];
            } else {
                // VALORES POR DEFECTO CORREGIDOS
                switch (campo.tipo) {
                    case 'boolean':
                        initData[campo.key] = campo.hasOwnProperty('defaultValue') ? campo.defaultValue : false;
                        break;
                    case 'number':
                    case 'decimal':
                        // CORRECCIÓN: Convertir a número válido
                        const numValue = campo.defaultValue ?? 0;
                        initData[campo.key] = Number.isInteger(numValue) ? numValue : 0;
                        break;
                    default:
                        initData[campo.key] = campo.defaultValue ?? '';
                }
            }
        });
        setFormData(initData);
    }, [campos, initialData]);

    // Validar un campo específico
    const validateField = (fieldName, value) => {
        const campo = campos.find(c => c.key === fieldName);
        const validacion = validaciones?.[fieldName];

        if (!validacion) return '';

        // Requerido
        if (validacion.required && (!value || value.toString().trim() === '')) {
            return `${campo.label} es requerido`;
        }

        // Longitud mínima
        if (validacion.minLength && value.toString().length < validacion.minLength) {
            return `${campo.label} debe tener al menos ${validacion.minLength} caracteres`;
        }

        // Longitud máxima
        if (validacion.maxLength && value.toString().length > validacion.maxLength) {
            return `${campo.label} no puede exceder ${validacion.maxLength} caracteres`;
        }

        // Valor mínimo (números)
        if (validacion.min !== undefined && parseFloat(value) < validacion.min) {
            return `${campo.label} debe ser mayor o igual a ${validacion.min}`;
        }

        // Valor máximo (números)
        if (validacion.max !== undefined && parseFloat(value) > validacion.max) {
            return `${campo.label} debe ser menor o igual a ${validacion.max}`;
        }

        // Email
        if (validacion.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return `${campo.label} debe ser un email válido`;
        }

        // Patrón personalizado
        if (validacion.pattern && value && !new RegExp(validacion.pattern).test(value)) {
            return validacion.patternMessage || `${campo.label} tiene un formato inválido`;
        }

        return '';
    };

    const handleCountrySelect = (countryData) => {
        console.log('País seleccionado en formulario:', countryData);

        // Actualizar todos los campos relacionados automáticamente
        setFormData(prev => ({
            ...prev,
            nombre_pais: countryData.nombre_pais,
            codigo_iso2: countryData.codigo_iso2,
            codigo_iso3: countryData.codigo_iso3,
            codigo_telefono: countryData.codigo_telefono
        }));

        // Limpiar errores de todos los campos relacionados
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.nombre_pais;
            delete newErrors.codigo_iso2;
            delete newErrors.codigo_iso3;
            delete newErrors.codigo_telefono;
            return newErrors;
        });
    };

    // NUEVA FUNCIÓN: Manejar selección de ciudades guatemaltecas
    const handleCitySelect = (cityData) => {
        console.log('Ciudad seleccionada en formulario:', cityData);

        // Actualizar todos los campos relacionados automáticamente
        setFormData(prev => ({
            ...prev,
            nombre_ciudad: cityData.nombre_ciudad,
            departamento: cityData.departamento,
            region: cityData.region
        }));

        // Limpiar errores de todos los campos relacionados
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.nombre_ciudad;
            delete newErrors.departamento;
            delete newErrors.region;
            return newErrors;
        });
    };

    // Manejar cambios en los campos
    const handleChange = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));

        // Limpiar error del campo si tenía uno
        if (errors[fieldName]) {
            setErrors(prev => ({
                ...prev,
                [fieldName]: ''
            }));
        }
    };

    // Validar todo el formulario
    const validateForm = () => {
        const newErrors = {};
        let hasErrors = false;

        campos.forEach(campo => {
            const error = validateField(campo.key, formData[campo.key]);
            if (error) {
                newErrors[campo.key] = error;
                hasErrors = true;
            }
        });

        setErrors(newErrors);
        return !hasErrors;
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            // Aquí podrías manejar errores específicos del servidor
        } finally {
            setLoading(false);
        }
    };

    // Renderizar campo según su tipo
    const renderField = (campo) => {
        const value = formData[campo.key] || '';
        const hasError = errors[campo.key];

        const commonStyles = {
            width: '100%',
            padding: '0.75rem',
            border: `1px solid ${hasError ? '#dc2626' : '#d1d5db'}`,
            borderRadius: '6px',
            fontSize: '0.875rem',
            backgroundColor: 'white',
            outline: 'none',
            transition: 'border-color 0.2s'
        };

        const focusStyles = {
            onFocus: (e) => {
                if (!hasError) {
                    e.target.style.borderColor = '#3b82f6';
                }
            },
            onBlur: (e) => {
                if (!hasError) {
                    e.target.style.borderColor = '#d1d5db';
                }
            }
        };

        switch (campo.tipo) {
            case 'textarea':
                return e('textarea', {
                    key: campo.key,
                    value: value,
                    onChange: (e) => handleChange(campo.key, e.target.value),
                    placeholder: campo.placeholder || `Ingrese ${campo.label.toLowerCase()}`,
                    rows: 3,
                    style: {
                        ...commonStyles,
                        resize: 'vertical',
                        fontFamily: 'inherit'
                    },
                    ...focusStyles
                });

            case 'select':
                return e('select', {
                    key: campo.key,
                    value: value,
                    onChange: (e) => handleChange(campo.key, e.target.value),
                    style: {
                        ...commonStyles,
                        cursor: 'pointer'
                    },
                    ...focusStyles
                }, [
                    e('option', {
                        key: 'empty',
                        value: ''
                    }, `Seleccionar ${campo.label.toLowerCase()}`),
                    ...(campo.options || []).map(option =>
                        e('option', {
                            key: option.value,
                            value: option.value
                        }, option.label)
                    )
                ]);

            case 'boolean':
                // Convertir valor a boolean verdadero para comparación
                const boolValue = Boolean(value === true || value === 1 || value === "1");

                return e('div', {
                    key: campo.key,
                    style: {
                        display: 'flex',
                        gap: '1rem'
                    }
                }, [
                    e('label', {
                        key: 'true',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer'
                        }
                    }, [
                        e('input', {
                            key: 'true-radio',
                            type: 'radio',
                            name: campo.key,
                            checked: boolValue === true,
                            onChange: () => handleChange(campo.key, true),
                            style: {
                                accentColor: '#3b82f6'
                            }
                        }),
                        e('span', { key: 'true-label' }, 'Sí')
                    ]),
                    e('label', {
                        key: 'false',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer'
                        }
                    }, [
                        e('input', {
                            key: 'false-radio',
                            type: 'radio',
                            name: campo.key,
                            checked: boolValue === false,
                            onChange: () => handleChange(campo.key, false),
                            style: {
                                accentColor: '#3b82f6'
                            }
                        }),
                        e('span', { key: 'false-label' }, 'No')
                    ])
                ]);

            case 'number':
                return e('input', {
                    key: campo.key,
                    type: 'number',
                    value: value,
                    onChange: (e) => handleChange(campo.key, parseFloat(e.target.value) || 0),
                    placeholder: campo.placeholder || `Ingrese ${campo.label.toLowerCase()}`,
                    min: validaciones?.[campo.key]?.min,
                    max: validaciones?.[campo.key]?.max,
                    step: campo.step || 1,
                    style: commonStyles,
                    ...focusStyles
                });

            case 'decimal':
                return e('input', {
                    key: campo.key,
                    type: 'number',
                    value: value,
                    onChange: (e) => handleChange(campo.key, parseFloat(e.target.value) || 0),
                    placeholder: campo.placeholder || `Ingrese ${campo.label.toLowerCase()}`,
                    min: validaciones?.[campo.key]?.min,
                    max: validaciones?.[campo.key]?.max,
                    step: '0.01',
                    style: commonStyles,
                    ...focusStyles
                });

            case 'date':
                return e('input', {
                    key: campo.key,
                    type: 'date',
                    value: value ? (typeof value === 'string' ? value.split('T')[0] : value) : '',
                    onChange: (e) => handleChange(campo.key, e.target.value),
                    style: commonStyles,
                    ...focusStyles
                });

            case 'country_autocomplete':
                return e(CountryAutocomplete, {
                    key: campo.key,
                    value: value,
                    onChange: (newValue) => handleChange(campo.key, newValue),
                    onCountrySelect: handleCountrySelect,
                    placeholder: campo.placeholder || 'Escriba el nombre del país...',
                    style: commonStyles,
                    hasError: hasError
                });

            case 'city_autocomplete':
                return e(CityAutocomplete, {
                    key: campo.key,
                    value: value,
                    onChange: (newValue) => handleChange(campo.key, newValue),
                    onCitySelect: handleCitySelect,
                    placeholder: campo.placeholder || 'Escriba el nombre de la ciudad...',
                    style: commonStyles,
                    hasError: hasError
                });

            case 'color':
                return e('div', {
                    key: campo.key,
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }
                }, [
                    e('input', {
                        key: 'color-input',
                        type: 'color',
                        value: value || '#3b82f6',
                        onChange: (e) => handleChange(campo.key, e.target.value),
                        style: {
                            width: '60px',
                            height: '40px',
                            border: hasError ? '2px solid #dc2626' : '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            backgroundColor: 'transparent'
                        }
                    }),
                    e('input', {
                        key: 'color-text',
                        type: 'text',
                        value: value || '',
                        onChange: (e) => {
                            const colorValue = e.target.value;
                            if (colorValue === '' || /^#[0-9A-Fa-f]{0,6}$/.test(colorValue)) {
                                handleChange(campo.key, colorValue);
                            }
                        },
                        placeholder: '#FF5500',
                        maxLength: 7,
                        style: {
                            ...commonStyles,
                            width: '100px',
                            fontFamily: 'monospace',
                            fontSize: '0.875rem'
                        },
                        ...focusStyles
                    }),
                    e('div', {
                        key: 'color-preview',
                        style: {
                            width: '40px',
                            height: '40px',
                            backgroundColor: value || '#f3f4f6',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            color: '#6b7280'
                        }
                    }, !value ? '?' : ''),
                    e('div', {
                        key: 'preset-colors',
                        style: {
                            display: 'flex',
                            gap: '0.5rem'
                        }
                    }, [
                        '#FFA500', '#28A745', '#DC3545', '#6C757D', '#17A2B8', '#FFC107'
                    ].map(color =>
                        e('button', {
                            key: `preset-${color}`,
                            type: 'button',
                            onClick: () => handleChange(campo.key, color),
                            style: {
                                width: '24px',
                                height: '24px',
                                backgroundColor: color,
                                border: value === color ? '2px solid #000' : '1px solid #d1d5db',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            },
                            title: color
                        })
                    ))
                ]);

            default: // text, email, etc.
                return e('input', {
                    key: campo.key,
                    type: campo.tipo === 'email' ? 'email' : 'text',
                    value: value,
                    onChange: (e) => handleChange(campo.key, e.target.value),
                    placeholder: campo.placeholder || `Ingrese ${campo.label.toLowerCase()}`,
                    maxLength: validaciones?.[campo.key]?.maxLength,
                    readOnly: campo.readonly || false,
                    style: {
                        ...commonStyles,
                        backgroundColor: campo.readonly ? '#f9fafb' : 'white',
                        cursor: campo.readonly ? 'not-allowed' : 'text'
                    },
                    ...focusStyles
                });
        }
    };

    return e('form', {
        onSubmit: handleSubmit,
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        }
    }, [
        // Campos del formulario
        e('div', {
            key: 'fields',
            style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
            }
        }, campos.map(campo =>
            e('div', {
                key: campo.key,
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }
            }, [
                e('label', {
                    key: 'label',
                    style: {
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }
                }, [
                    campo.label,
                    validaciones?.[campo.key]?.required &&
                    e('span', { key: 'required', style: { color: '#dc2626' } }, '*')
                ]),
                renderField(campo),
                errors[campo.key] && e('p', {
                    key: 'error',
                    style: {
                        fontSize: '0.75rem',
                        color: '#dc2626',
                        margin: '0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }
                }, [
                    Icons.alertCircle(),
                    errors[campo.key]
                ])
            ])
        )),

        // Botones de acción
        e('div', {
            key: 'actions',
            style: {
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb',
                marginTop: '0.5rem'
            }
        }, [
            e('button', {
                key: 'cancel',
                type: 'button',
                onClick: onCancel,
                disabled: loading,
                style: {
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.5 : 1
                },
                onMouseEnter: (e) => {
                    if (!loading) {
                        e.target.style.backgroundColor = '#f9fafb';
                        e.target.style.borderColor = '#9ca3af';
                    }
                },
                onMouseLeave: (e) => {
                    if (!loading) {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.borderColor = '#d1d5db';
                    }
                }
            }, 'Cancelar'),

            e('button', {
                key: 'submit',
                type: 'submit',
                disabled: loading,
                style: {
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'background-color 0.2s'
                },
                onMouseEnter: (e) => {
                    if (!loading) {
                        e.target.style.backgroundColor = '#2563eb';
                    }
                },
                onMouseLeave: (e) => {
                    if (!loading) {
                        e.target.style.backgroundColor = '#3b82f6';
                    }
                }
            }, [
                loading && e('div', {
                    key: 'spinner',
                    style: {
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }
                }),
                loading ? 'Guardando...' : 'Guardar'
            ])
        ])
    ]);
}

export default CatalogoForm;
