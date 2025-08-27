// src/resources/js/components/configuracion/RutasServiciosForm.js
import React from 'react';
import Icons from '../../utils/Icons';
import CityAutocomplete from '../common/CityAutocomplete';
import PlaceAutocomplete from '../common/PlaceAutocomplete';
import RouteCalculator from '../../utils/RouteCalculator';
import MapPlaceSelector from '../common/MapPlaceSelector';

const { createElement: e, useState, useEffect } = React;

function RutasServiciosForm({
    ruta = null,
    mode = 'create', // create, edit, view
    onSubmit,
    onCancel,
    loading = false
}) {
    // Estados del formulario
    const [formData, setFormData] = useState({
        codigo_ruta: '',
        nombre_ruta: '',
        tipo_servicio: 'shuttle',
        ciudad_origen: '',
        ciudad_destino: '',
        punto_salida: '',
        punto_llegada: '',
        distancia_km: '',
        hora_salida: '',
        hora_llegada_estimada: '',
        duracion_minutos: '',
        capacidad_maxima: '',
        capacidad_recomendada: '',
        tipo_vehiculo_id: '',
        dias_operacion: '1111111', // Todos los días por defecto
        precio_adulto: '',
        precio_nino: '',
        incluye: '',
        estado_ruta_id: ''
    });

    // Estados para los datos completos de lugares
    const [lugarOrigen, setLugarOrigen] = useState(null);
    const [lugarDestino, setLugarDestino] = useState(null);
    const [calculandoRuta, setCalculandoRuta] = useState(false);

    // Estados auxiliares
    const [errors, setErrors] = useState({});
    const [tiposVehiculo, setTiposVehiculo] = useState([]);
    const [estadosRuta, setEstadosRuta] = useState([]);
    const [loadingCatalogos, setLoadingCatalogos] = useState(true);

    // Cargar datos iniciales
    useEffect(() => {
        if (ruta && (mode === 'edit' || mode === 'view')) {
            setFormData({
                codigo_ruta: ruta.codigo_ruta || '',
                nombre_ruta: ruta.nombre_ruta || '',
                tipo_servicio: ruta.tipo_servicio || 'shuttle',
                ciudad_origen: ruta.origen_destino?.ciudad_origen || '',
                ciudad_destino: ruta.origen_destino?.ciudad_destino || '',
                punto_salida: ruta.origen_destino?.punto_salida || '',
                punto_llegada: ruta.origen_destino?.punto_llegada || '',
                distancia_km: ruta.origen_destino?.distancia_km || '',
                hora_salida: ruta.horarios?.hora_salida || '',
                hora_llegada_estimada: ruta.horarios?.hora_llegada_estimada || '',
                duracion_minutos: ruta.horarios?.duracion_minutos || '',
                capacidad_maxima: ruta.capacidad?.capacidad_maxima || '',
                capacidad_recomendada: ruta.capacidad?.capacidad_recomendada || '',
                tipo_vehiculo_id: ruta.tipo_vehiculo?.id || '',
                dias_operacion: ruta.dias_operacion || '1111111',
                precio_adulto: ruta.precios?.precio_adulto || '',
                precio_nino: ruta.precios?.precio_nino || '',
                incluye: ruta.incluye || '',
                estado_ruta_id: ruta.estado_ruta?.id || ''
            });
        }
        loadCatalogos();
    }, [ruta, mode]);

    // Cargar catálogos necesarios
    const loadCatalogos = async () => {
        try {
            setLoadingCatalogos(true);

            // Cargar tipos de vehículo
            const tiposResponse = await fetch('/api/v1/tipos-vehiculo');
            if (tiposResponse.ok) {
                const tiposData = await tiposResponse.json();
                setTiposVehiculo(Array.isArray(tiposData) ? tiposData : tiposData.data || []);
            }

            // Cargar estados de ruta
            const estadosResponse = await fetch('/api/v1/estados-ruta');
            if (estadosResponse.ok) {
                const estadosData = await estadosResponse.json();
                setEstadosRuta(Array.isArray(estadosData) ? estadosData : estadosData.data || []);
            }

        } catch (err) {
            console.error('Error cargando catálogos:', err);
        } finally {
            setLoadingCatalogos(false);
        }
    };

    // Función para manejar selección de ciudades
    const handleCitySelect = (field, cityData) => {
        console.log(`Ciudad seleccionada para ${field}:`, cityData);

        setFormData(prev => ({
            ...prev,
            [field]: cityData.nombre_ciudad
        }));

        // Limpiar error del campo
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }

        // Resetear puntos cuando cambia la ciudad
        if (field === 'ciudad_origen') {
            setLugarOrigen(null);
            setFormData(prev => ({ ...prev, punto_salida: '' }));
        } else if (field === 'ciudad_destino') {
            setLugarDestino(null);
            setFormData(prev => ({ ...prev, punto_llegada: '' }));
        }
    };

    // Función para manejar selección de lugares
    const handlePlaceSelect = async (field, placeData) => {
        console.log(`Lugar seleccionado para ${field}:`, placeData);

        // Actualizar el formulario
        setFormData(prev => ({
            ...prev,
            [field]: placeData.nombre
        }));

        // Guardar datos completos del lugar
        if (field === 'punto_salida') {
            setLugarOrigen(placeData);
        } else if (field === 'punto_llegada') {
            setLugarDestino(placeData);
        }

        // Limpiar error del campo
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }

        // Calcular ruta automáticamente si tenemos ambos puntos
        setTimeout(() => calcularRutaAutomatica(), 100);
    };

    // Calcular ruta automáticamente
    const calcularRutaAutomatica = async () => {
        if (!lugarOrigen || !lugarDestino) return;

        console.log('🧮 Calculando ruta automática...', { lugarOrigen, lugarDestino });

        try {
            setCalculandoRuta(true);

            // Usar RouteCalculator
            const resultado = RouteCalculator.calcular(
                lugarOrigen,
                lugarDestino,
                formData.hora_salida
            );

            if (resultado) {
                console.log('✅ Resultado del cálculo:', resultado);

                // Actualizar formulario con resultados
                setFormData(prev => ({
                    ...prev,
                    distancia_km: resultado.distancia_km.toString(),
                    duracion_minutos: resultado.duracion_minutos.toString(),
                    hora_llegada_estimada: resultado.hora_llegada_estimada || prev.hora_llegada_estimada
                }));

                // Generar nombre de ruta automáticamente si está vacío
                if (!formData.nombre_ruta) {
                    const nombreAutomatico = `${lugarOrigen.ciudad} - ${lugarDestino.ciudad}`;
                    setFormData(prev => ({
                        ...prev,
                        nombre_ruta: nombreAutomatico
                    }));
                }

                console.log('📊 Ruta calculada:', resultado.resumen);
            }

        } catch (error) {
            console.error('❌ Error calculando ruta:', error);
        } finally {
            setCalculandoRuta(false);
        }
    };

    // Recalcular cuando cambia la hora de salida
    useEffect(() => {
        if (formData.hora_salida && lugarOrigen && lugarDestino) {
            calcularRutaAutomatica();
        }
    }, [formData.hora_salida]);

    // Manejar cambios en inputs
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Limpiar error del campo si existe
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }

        // Cálculos automáticos
        if (field === 'capacidad_maxima' && value && !formData.capacidad_recomendada) {
            setFormData(prev => ({
                ...prev,
                capacidad_recomendada: Math.floor(parseInt(value) * 0.9).toString()
            }));
        }

        // Calcular duración si se cambian las horas manualmente
        if ((field === 'hora_salida' || field === 'hora_llegada_estimada') &&
            formData.hora_salida && formData.hora_llegada_estimada) {

            try {
                const inicio = new Date(`2000-01-01T${field === 'hora_salida' ? value : formData.hora_salida}`);
                const fin = new Date(`2000-01-01T${field === 'hora_llegada_estimada' ? value : formData.hora_llegada_estimada}`);

                if (fin > inicio) {
                    const duracion = Math.floor((fin - inicio) / (1000 * 60));
                    setFormData(prev => ({
                        ...prev,
                        duracion_minutos: duracion.toString()
                    }));
                }
            } catch (e) {
                // Ignorar errores de cálculo
            }
        }
    };

    // Manejar cambios en días de operación
    const handleDiaChange = (diaIndex, checked) => {
        const diasArray = formData.dias_operacion.split('');
        diasArray[diaIndex] = checked ? '1' : '0';
        setFormData(prev => ({
            ...prev,
            dias_operacion: diasArray.join('')
        }));
    };

    // Validar formulario
    const validateForm = () => {
        const newErrors = {};

        if (!formData.nombre_ruta.trim()) {
            newErrors.nombre_ruta = 'El nombre de la ruta es requerido';
        }

        if (!formData.ciudad_origen.trim()) {
            newErrors.ciudad_origen = 'La ciudad de origen es requerida';
        }

        if (!formData.ciudad_destino.trim()) {
            newErrors.ciudad_destino = 'La ciudad de destino es requerida';
        }

        if (!formData.hora_salida) {
            newErrors.hora_salida = 'La hora de salida es requerida';
        }

        if (!formData.capacidad_maxima || formData.capacidad_maxima <= 0) {
            newErrors.capacidad_maxima = 'La capacidad máxima debe ser mayor a 0';
        }

        if (!formData.tipo_vehiculo_id) {
            newErrors.tipo_vehiculo_id = 'Debe seleccionar un tipo de vehículo';
        }

        if (!formData.precio_adulto || formData.precio_adulto <= 0) {
            newErrors.precio_adulto = 'El precio para adultos es requerido';
        }

        if (!formData.estado_ruta_id) {
            newErrors.estado_ruta_id = 'Debe seleccionar un estado';
        }

        // Validar que al menos opere un día
        if (formData.dias_operacion === '0000000') {
            newErrors.dias_operacion = 'Debe operar al menos un día a la semana';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Enviar formulario
    const handleSubmit = (e) => {
        e.preventDefault();

        if (mode === 'view') {
            onCancel();
            return;
        }

        if (!validateForm()) {
            return;
        }

        onSubmit(formData);
    };

    // Nombres de días para la interfaz
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    if (loadingCatalogos) {
        return e('div', {
            style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem',
                minHeight: '200px'
            }
        }, [
            e('div', {
                key: 'loading-spinner',
                style: {
                    width: '32px',
                    height: '32px',
                    border: '3px solid #f3f4f6',
                    borderTop: '3px solid #8b5cf6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }
            })
        ]);
    }

    return e('form', {
        onSubmit: handleSubmit,
        style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        }
    }, [
        // Sección: Información Básica
        e('div', {
            key: 'seccion-basica',
            style: {
                backgroundColor: '#f9fafb',
                padding: '1.5rem',
                borderRadius: '8px'
            }
        }, [
            e('h3', {
                key: 'titulo-basica',
                style: {
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }
            }, [
                e('span', { key: 'icon-basica' }, Icons.info()),
                e('span', { key: 'text-basica' }, 'Información Básica')
            ]),

            e('div', {
                key: 'grid-basica',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem'
                }
            }, [
                // Código de ruta
                e('div', { key: 'campo-codigo' }, [
                    e('label', {
                        key: 'label-codigo',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Código de Ruta'),
                    e('input', {
                        key: 'input-codigo',
                        type: 'text',
                        value: formData.codigo_ruta,
                        onChange: (e) => handleInputChange('codigo_ruta', e.target.value),
                        disabled: mode === 'view' || (mode === 'edit' && ruta?.codigo_ruta),
                        placeholder: 'Se genera automáticamente si se deja vacío',
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: errors.codigo_ruta ? '1px solid #dc2626' : '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            outline: 'none',
                            backgroundColor: mode === 'view' || (mode === 'edit' && ruta?.codigo_ruta) ? '#f9fafb' : 'white'
                        }
                    }),
                    errors.codigo_ruta && e('p', {
                        key: 'error-codigo',
                        style: { fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }
                    }, errors.codigo_ruta)
                ]),

                // Nombre de la ruta
                e('div', { key: 'campo-nombre', style: { gridColumn: '1 / -1' } }, [
                    e('label', {
                        key: 'label-nombre',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Nombre de la Ruta *'),
                    e('input', {
                        key: 'input-nombre',
                        type: 'text',
                        value: formData.nombre_ruta,
                        onChange: (e) => handleInputChange('nombre_ruta', e.target.value),
                        disabled: mode === 'view',
                        placeholder: 'Se genera automáticamente basado en origen-destino',
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: errors.nombre_ruta ? '1px solid #dc2626' : '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            outline: 'none',
                            backgroundColor: mode === 'view' ? '#f9fafb' : 'white'
                        }
                    }),
                    errors.nombre_ruta && e('p', {
                        key: 'error-nombre',
                        style: { fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }
                    }, errors.nombre_ruta)
                ]),

                // Tipo de servicio
                e('div', { key: 'campo-tipo' }, [
                    e('label', {
                        key: 'label-tipo',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Tipo de Servicio *'),
                    e('select', {
                        key: 'select-tipo',
                        value: formData.tipo_servicio,
                        onChange: (e) => handleInputChange('tipo_servicio', e.target.value),
                        disabled: mode === 'view',
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            outline: 'none',
                            backgroundColor: mode === 'view' ? '#f9fafb' : 'white'
                        }
                    }, [
                        e('option', { key: 'tipo-shuttle', value: 'shuttle' }, 'Shuttle'),
                        e('option', { key: 'tipo-tour', value: 'tour' }, 'Tour'),
                        e('option', { key: 'tipo-transfer', value: 'transfer' }, 'Transfer'),
                        e('option', { key: 'tipo-privado', value: 'privado' }, 'Privado')
                    ])
                ])
            ])
        ]),

        // Sección: Ubicaciones con CityAutocomplete y PlaceAutocomplete
        e('div', {
            key: 'seccion-ubicaciones',
            style: {
                backgroundColor: '#f0f9ff',
                padding: '1.5rem',
                borderRadius: '8px',
                position: 'relative'
            }
        }, [
            e('h3', {
                key: 'titulo-ubicaciones',
                style: {
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }
            }, [
                e('span', { key: 'icon-ubicaciones' }, Icons.map()),
                e('span', { key: 'text-ubicaciones' }, 'Ubicaciones'),
                calculandoRuta && e('div', {
                    key: 'calculando-badge',
                    style: {
                        marginLeft: 'auto',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }
                }, [
                    e('div', {
                        style: {
                            width: '12px',
                            height: '12px',
                            border: '2px solid transparent',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }
                    }),
                    'Calculando...'
                ])
            ]),

            e('div', {
                key: 'grid-ubicaciones',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1rem'
                }
            }, [
                // Ciudad origen con CityAutocomplete
                e('div', { key: 'campo-ciudad-origen' }, [
                    e('label', {
                        key: 'label-ciudad-origen',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Ciudad de Origen *'),
                    mode === 'view'
                        ? e('input', {
                            key: 'input-ciudad-origen-readonly',
                            type: 'text',
                            value: formData.ciudad_origen,
                            readOnly: true,
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                backgroundColor: '#f9fafb'
                            }
                        })
                        : e(CityAutocomplete, {
                            key: 'city-origen',
                            value: formData.ciudad_origen,
                            onChange: (value) => handleInputChange('ciudad_origen', value),
                            onCitySelect: (cityData) => handleCitySelect('ciudad_origen', cityData),
                            placeholder: 'Ej: Guatemala, Antigua Guatemala, Cobán...',
                            hasError: !!errors.ciudad_origen,
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: errors.ciudad_origen ? '1px solid #dc2626' : '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                outline: 'none'
                            }
                        }),
                    errors.ciudad_origen && e('p', {
                        key: 'error-ciudad-origen',
                        style: { fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }
                    }, errors.ciudad_origen)
                ]),

                // Ciudad destino con CityAutocomplete
                e('div', { key: 'campo-ciudad-destino' }, [
                    e('label', {
                        key: 'label-ciudad-destino',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Ciudad de Destino *'),
                    mode === 'view'
                        ? e('input', {
                            key: 'input-ciudad-destino-readonly',
                            type: 'text',
                            value: formData.ciudad_destino,
                            readOnly: true,
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                backgroundColor: '#f9fafb'
                            }
                        })
                        : e(CityAutocomplete, {
                            key: 'city-destino',
                            value: formData.ciudad_destino,
                            onChange: (value) => handleInputChange('ciudad_destino', value),
                            onCitySelect: (cityData) => handleCitySelect('ciudad_destino', cityData),
                            placeholder: 'Ej: Río Dulce, Flores, Quetzaltenango...',
                            hasError: !!errors.ciudad_destino,
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: errors.ciudad_destino ? '1px solid #dc2626' : '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                outline: 'none'
                            }
                        }),
                    errors.ciudad_destino && e('p', {
                        key: 'error-ciudad-destino',
                        style: { fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }
                    }, errors.ciudad_destino)
                ]),

                // Punto de salida con MapPlaceSelector
                e('div', { key: 'campo-punto-salida' }, [
                    e('label', {
                        key: 'label-punto-salida',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Punto de Salida'),
                    mode === 'view'
                        ? e('input', {
                            key: 'input-punto-salida-readonly',
                            type: 'text',
                            value: formData.punto_salida,
                            readOnly: true,
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                backgroundColor: '#f9fafb'
                            }
                        })
                        : e(MapPlaceSelector, {
                            key: 'map-salida',
                            value: formData.punto_salida,
                            onChange: (value) => handleInputChange('punto_salida', value),
                            onPlaceSelect: (placeData) => handlePlaceSelect('punto_salida', placeData),
                            ciudadFiltro: formData.ciudad_origen,
                            placeholder: 'Seleccionar punto de salida en el mapa...',
                            hasError: !!errors.punto_salida,
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: errors.punto_salida ? '1px solid #dc2626' : '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                outline: 'none'
                            }
                        }),
                    errors.punto_salida && e('p', {
                        key: 'error-punto-salida',
                        style: { fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }
                    }, errors.punto_salida)
                ]),

                // Punto de llegada con MapPlaceSelector
                e('div', { key: 'campo-punto-llegada' }, [
                    e('label', {
                        key: 'label-punto-llegada',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Punto de Llegada'),
                    mode === 'view'
                        ? e('input', {
                            key: 'input-punto-llegada-readonly',
                            type: 'text',
                            value: formData.punto_llegada,
                            readOnly: true,
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                backgroundColor: '#f9fafb'
                            }
                        })
                        : e(MapPlaceSelector, {
                            key: 'map-llegada',
                            value: formData.punto_llegada,
                            onChange: (value) => handleInputChange('punto_llegada', value),
                            onPlaceSelect: (placeData) => handlePlaceSelect('punto_llegada', placeData),
                            ciudadFiltro: formData.ciudad_destino,
                            placeholder: 'Seleccionar punto de llegada en el mapa...',
                            hasError: !!errors.punto_llegada,
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                border: errors.punto_llegada ? '1px solid #dc2626' : '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                outline: 'none'
                            }
                        }),
                    errors.punto_llegada && e('p', {
                        key: 'error-punto-llegada',
                        style: { fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }
                    }, errors.punto_llegada)
                ]),

                // Distancia en km (calculada automáticamente)
                e('div', { key: 'campo-distancia' }, [
                    e('label', {
                        key: 'label-distancia',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Distancia (km)'),
                    e('div', { key: 'input-wrapper', style: { position: 'relative' } }, [
                        e('input', {
                            key: 'input-distancia',
                            type: 'number',
                            step: '0.1',
                            min: '0',
                            value: formData.distancia_km,
                            onChange: (e) => handleInputChange('distancia_km', e.target.value),
                            disabled: mode === 'view',
                            placeholder: 'Se calcula automáticamente',
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                paddingRight: formData.distancia_km && !calculandoRuta ? '2.5rem' : '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                outline: 'none',
                                backgroundColor: mode === 'view' ? '#f9fafb' : 'white'
                            }
                        }),
                        formData.distancia_km && !calculandoRuta && e('div', {
                            key: 'calculated-badge',
                            style: {
                                position: 'absolute',
                                right: '0.5rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#10b981',
                                fontSize: '0.75rem'
                            }
                        }, '✓')
                    ])
                ])
            ])
        ]),

        // Sección: Horarios y Operación
        e('div', {
            key: 'seccion-horarios',
            style: {
                backgroundColor: '#fefce8',
                padding: '1.5rem',
                borderRadius: '8px'
            }
        }, [
            e('h3', {
                key: 'titulo-horarios',
                style: {
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }
            }, [
                e('span', { key: 'icon-horarios' }, Icons.clock()),
                e('span', { key: 'text-horarios' }, 'Horarios y Operación')
            ]),

            e('div', {
                key: 'grid-horarios',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                }
            }, [
                // Hora de salida
                e('div', { key: 'campo-hora-salida' }, [
                    e('label', {
                        key: 'label-hora-salida',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Hora de Salida *'),
                    e('input', {
                        key: 'input-hora-salida',
                        type: 'time',
                        value: formData.hora_salida,
                        onChange: (e) => handleInputChange('hora_salida', e.target.value),
                        disabled: mode === 'view',
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: errors.hora_salida ? '1px solid #dc2626' : '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            outline: 'none',
                            backgroundColor: mode === 'view' ? '#f9fafb' : 'white'
                        }
                    }),
                    errors.hora_salida && e('p', {
                        key: 'error-hora-salida',
                        style: { fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }
                    }, errors.hora_salida)
                ]),

                // Hora de llegada estimada (calculada automáticamente)
                e('div', { key: 'campo-hora-llegada' }, [
                    e('label', {
                        key: 'label-hora-llegada',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Hora de Llegada Estimada'),
                    e('div', { key: 'input-wrapper-llegada', style: { position: 'relative' } }, [
                        e('input', {
                            key: 'input-hora-llegada',
                            type: 'time',
                            value: formData.hora_llegada_estimada,
                            onChange: (e) => handleInputChange('hora_llegada_estimada', e.target.value),
                            disabled: mode === 'view',
                            placeholder: 'Se calcula automáticamente',
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                paddingRight: formData.hora_llegada_estimada && lugarOrigen && lugarDestino ? '2.5rem' : '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                outline: 'none',
                                backgroundColor: mode === 'view' ? '#f9fafb' : 'white'
                            }
                        }),
                        formData.hora_llegada_estimada && lugarOrigen && lugarDestino && e('div', {
                            key: 'calculated-badge-hora',
                            style: {
                                position: 'absolute',
                                right: '0.5rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#10b981',
                                fontSize: '0.75rem'
                            }
                        }, '✓')
                    ])
                ]),

                // Duración en minutos (calculada automáticamente)
                e('div', { key: 'campo-duracion' }, [
                    e('label', {
                        key: 'label-duracion',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Duración (minutos)'),
                    e('div', { key: 'input-wrapper-duracion', style: { position: 'relative' } }, [
                        e('input', {
                            key: 'input-duracion',
                            type: 'number',
                            min: '0',
                            value: formData.duracion_minutos,
                            onChange: (e) => handleInputChange('duracion_minutos', e.target.value),
                            disabled: mode === 'view',
                            placeholder: 'Se calcula automáticamente',
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                paddingRight: formData.duracion_minutos && !calculandoRuta ? '2.5rem' : '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                outline: 'none',
                                backgroundColor: mode === 'view' ? '#f9fafb' : 'white'
                            }
                        }),
                        formData.duracion_minutos && !calculandoRuta && e('div', {
                            key: 'calculated-badge-duracion',
                            style: {
                                position: 'absolute',
                                right: '0.5rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#10b981',
                                fontSize: '0.75rem'
                            }
                        }, '✓')
                    ])
                ])
            ]),

            // Días de operación
            e('div', { key: 'campo-dias' }, [
                e('label', {
                    key: 'label-dias',
                    style: {
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '0.5rem'
                    }
                }, 'Días de Operación *'),
                e('div', {
                    key: 'dias-container',
                    style: {
                        display: 'flex',
                        gap: '0.5rem',
                        flexWrap: 'wrap'
                    }
                }, diasSemana.map((dia, index) =>
                    e('label', {
                        key: `dia-${index}`,
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.5rem 0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: mode === 'view' ? 'default' : 'pointer',
                            backgroundColor: formData.dias_operacion[index] === '1' ? '#dbeafe' : 'white',
                            color: formData.dias_operacion[index] === '1' ? '#1d4ed8' : '#374151',
                            fontSize: '0.875rem'
                        }
                    }, [
                        e('input', {
                            key: `checkbox-${index}`,
                            type: 'checkbox',
                            checked: formData.dias_operacion[index] === '1',
                            onChange: (e) => handleDiaChange(index, e.target.checked),
                            disabled: mode === 'view',
                            style: { margin: 0 }
                        }),
                        e('span', { key: `text-${index}` }, dia)
                    ])
                )),
                errors.dias_operacion && e('p', {
                    key: 'error-dias',
                    style: { fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }
                }, errors.dias_operacion)
            ])
        ]),

        // Sección: Capacidad y Vehículo
        e('div', {
            key: 'seccion-capacidad',
            style: {
                backgroundColor: '#f0fdf4',
                padding: '1.5rem',
                borderRadius: '8px'
            }
        }, [
            e('h3', {
                key: 'titulo-capacidad',
                style: {
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }
            }, [
                e('span', { key: 'icon-capacidad' }, Icons.truck()),
                e('span', { key: 'text-capacidad' }, 'Capacidad y Vehículo')
            ]),

            e('div', {
                key: 'grid-capacidad',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }
            }, [
                // Capacidad máxima
                e('div', { key: 'campo-capacidad-maxima' }, [
                    e('label', {
                        key: 'label-capacidad-maxima',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Capacidad Máxima *'),
                    e('input', {
                        key: 'input-capacidad-maxima',
                        type: 'number',
                        min: '1',
                        value: formData.capacidad_maxima,
                        onChange: (e) => handleInputChange('capacidad_maxima', e.target.value),
                        disabled: mode === 'view',
                        placeholder: '0',
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: errors.capacidad_maxima ? '1px solid #dc2626' : '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            outline: 'none',
                            backgroundColor: mode === 'view' ? '#f9fafb' : 'white'
                        }
                    }),
                    errors.capacidad_maxima && e('p', {
                        key: 'error-capacidad-maxima',
                        style: { fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }
                    }, errors.capacidad_maxima)
                ]),

                // Capacidad recomendada
                e('div', { key: 'campo-capacidad-recomendada' }, [
                    e('label', {
                        key: 'label-capacidad-recomendada',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Capacidad Recomendada'),
                    e('input', {
                        key: 'input-capacidad-recomendada',
                        type: 'number',
                        min: '1',
                        value: formData.capacidad_recomendada,
                        onChange: (e) => handleInputChange('capacidad_recomendada', e.target.value),
                        disabled: mode === 'view',
                        placeholder: 'Se calcula automáticamente (90%)',
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            outline: 'none',
                            backgroundColor: mode === 'view' ? '#f9fafb' : 'white'
                        }
                    })
                ]),

                // Tipo de vehículo
                e('div', { key: 'campo-tipo-vehiculo' }, [
                    e('label', {
                        key: 'label-tipo-vehiculo',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Tipo de Vehículo *'),
                    e('select', {
                        key: 'select-tipo-vehiculo',
                        value: formData.tipo_vehiculo_id,
                        onChange: (e) => handleInputChange('tipo_vehiculo_id', e.target.value),
                        disabled: mode === 'view',
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: errors.tipo_vehiculo_id ? '1px solid #dc2626' : '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            outline: 'none',
                            backgroundColor: mode === 'view' ? '#f9fafb' : 'white'
                        }
                    }, [
                        e('option', { key: 'vehiculo-vacio', value: '' }, 'Seleccionar tipo de vehículo'),
                        ...tiposVehiculo.map(tipo =>
                            e('option', {
                                key: `vehiculo-${tipo.id}`,
                                value: tipo.id
                            }, `${tipo.codigo} - ${tipo.nombre_tipo}`)
                        )
                    ]),
                    errors.tipo_vehiculo_id && e('p', {
                        key: 'error-tipo-vehiculo',
                        style: { fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }
                    }, errors.tipo_vehiculo_id)
                ])
            ])
        ]),

        // Sección: Precios y Estado
        e('div', {
            key: 'seccion-precios',
            style: {
                backgroundColor: '#fdf2f8',
                padding: '1.5rem',
                borderRadius: '8px'
            }
        }, [
            e('h3', {
                key: 'titulo-precios',
                style: {
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }
            }, [
                e('span', { key: 'icon-precios' }, Icons.dollar()),
                e('span', { key: 'text-precios' }, 'Precios y Estado')
            ]),

            e('div', {
                key: 'grid-precios',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1rem'
                }
            }, [
                // Precio adulto
                e('div', { key: 'campo-precio-adulto' }, [
                    e('label', {
                        key: 'label-precio-adulto',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Precio Adulto (Q) *'),
                    e('input', {
                        key: 'input-precio-adulto',
                        type: 'number',
                        step: '0.01',
                        min: '0',
                        value: formData.precio_adulto,
                        onChange: (e) => handleInputChange('precio_adulto', e.target.value),
                        disabled: mode === 'view',
                        placeholder: '0.00',
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: errors.precio_adulto ? '1px solid #dc2626' : '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            outline: 'none',
                            backgroundColor: mode === 'view' ? '#f9fafb' : 'white'
                        }
                    }),
                    errors.precio_adulto && e('p', {
                        key: 'error-precio-adulto',
                        style: { fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }
                    }, errors.precio_adulto)
                ]),

                // Precio niño
                e('div', { key: 'campo-precio-nino' }, [
                    e('label', {
                        key: 'label-precio-nino',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Precio Niño (Q)'),
                    e('input', {
                        key: 'input-precio-nino',
                        type: 'number',
                        step: '0.01',
                        min: '0',
                        value: formData.precio_nino,
                        onChange: (e) => handleInputChange('precio_nino', e.target.value),
                        disabled: mode === 'view',
                        placeholder: '0.00',
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            outline: 'none',
                            backgroundColor: mode === 'view' ? '#f9fafb' : 'white'
                        }
                    })
                ]),

                // Estado de la ruta
                e('div', { key: 'campo-estado' }, [
                    e('label', {
                        key: 'label-estado',
                        style: {
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }
                    }, 'Estado de la Ruta *'),
                    e('select', {
                        key: 'select-estado',
                        value: formData.estado_ruta_id,
                        onChange: (e) => handleInputChange('estado_ruta_id', e.target.value),
                        disabled: mode === 'view',
                        style: {
                            width: '100%',
                            padding: '0.75rem',
                            border: errors.estado_ruta_id ? '1px solid #dc2626' : '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            outline: 'none',
                            backgroundColor: mode === 'view' ? '#f9fafb' : 'white'
                        }
                    }, [
                        e('option', { key: 'estado-vacio', value: '' }, 'Seleccionar estado'),
                        ...estadosRuta.map(estado =>
                            e('option', {
                                key: `estado-${estado.id}`,
                                value: estado.id
                            }, `${estado.codigo} - ${estado.nombre_estado}`)
                        )
                    ]),
                    errors.estado_ruta_id && e('p', {
                        key: 'error-estado',
                        style: { fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }
                    }, errors.estado_ruta_id)
                ])
            ]),

            // Incluye (texto largo)
            e('div', { key: 'campo-incluye' }, [
                e('label', {
                    key: 'label-incluye',
                    style: {
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '0.5rem'
                    }
                }, 'Qué Incluye el Servicio'),
                e('textarea', {
                    key: 'textarea-incluye',
                    value: formData.incluye,
                    onChange: (e) => handleInputChange('incluye', e.target.value),
                    disabled: mode === 'view',
                    placeholder: 'Ej: Transporte, guía turístico, entrada a sitios...',
                    rows: 3,
                    style: {
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        outline: 'none',
                        backgroundColor: mode === 'view' ? '#f9fafb' : 'white',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                    }
                })
            ])
        ]),

        // Resumen del cálculo (si hay lugares seleccionados)
        lugarOrigen && lugarDestino && e('div', {
            key: 'resumen-calculo',
            style: {
                backgroundColor: '#f0f9ff',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #bfdbfe',
                marginBottom: '1rem'
            }
        }, [
            e('h4', {
                key: 'resumen-titulo',
                style: {
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#1d4ed8',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }
            }, [
                Icons.calculator(),
                'Cálculo Automático de Ruta'
            ]),
            e('div', {
                key: 'resumen-detalles',
                style: {
                    fontSize: '0.75rem',
                    color: '#374151',
                    lineHeight: '1.4'
                }
            }, [
                e('div', { key: 'origen-info' }, `Origen: ${lugarOrigen.nombre}, ${lugarOrigen.ciudad}`),
                e('div', { key: 'destino-info' }, `Destino: ${lugarDestino.nombre}, ${lugarDestino.ciudad}`),
                formData.distancia_km && e('div', { key: 'distancia-info' }, `Distancia: ${formData.distancia_km} km`),
                formData.duracion_minutos && e('div', { key: 'duracion-info' }, `Duración estimada: ${Math.floor(formData.duracion_minutos / 60)}h ${formData.duracion_minutos % 60}min`),
                formData.hora_llegada_estimada && e('div', { key: 'llegada-info' }, `Llegada estimada: ${formData.hora_llegada_estimada}`)
            ])
        ]),

        // Botones de acción
        e('div', {
            key: 'botones',
            style: {
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
            }
        }, [
            // Botón cancelar
            e('button', {
                key: 'btn-cancelar',
                type: 'button',
                onClick: onCancel,
                style: {
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                },
                onMouseEnter: (e) => {
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.borderColor = '#9ca3af';
                },
                onMouseLeave: (e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.borderColor = '#d1d5db';
                }
            }, mode === 'view' ? 'Cerrar' : 'Cancelar'),

            // Botón guardar (solo si no es modo view)
            mode !== 'view' && e('button', {
                key: 'btn-guardar',
                type: 'submit',
                disabled: loading || calculandoRuta,
                style: {
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'white',
                    backgroundColor: (loading || calculandoRuta) ? '#9ca3af' : '#8b5cf6',
                    cursor: (loading || calculandoRuta) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                },
                onMouseEnter: (e) => {
                    if (!loading && !calculandoRuta) e.target.style.backgroundColor = '#7c3aed';
                },
                onMouseLeave: (e) => {
                    if (!loading && !calculandoRuta) e.target.style.backgroundColor = '#8b5cf6';
                }
            }, [
                (loading || calculandoRuta) && e('div', {
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
                e('span', { key: 'btn-text' },
                    calculandoRuta ? 'Calculando...' :
                        loading ? 'Guardando...' :
                            mode === 'create' ? 'Crear Ruta' : 'Actualizar Ruta'
                )
            ])
        ])
    ]);
}

export default RutasServiciosForm;
