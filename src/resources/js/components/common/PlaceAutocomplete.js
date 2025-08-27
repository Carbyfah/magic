// src/resources/js/components/common/PlaceAutocomplete.js
import React from 'react';
import Icons from '../../utils/Icons';

const { createElement: e, useState, useRef, useEffect } = React;

function PlaceAutocomplete({
    value = '',
    onChange,
    onPlaceSelect,
    ciudadFiltro = '', // Ciudad para filtrar búsquedas
    placeholder = 'Escriba el nombre del lugar...',
    style = {},
    hasError = false
}) {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef(null);

    // BASE DE DATOS LOCAL DE PUNTOS IMPORTANTES (Top 100 lugares)
    const puntosImportantes = [
        // GUATEMALA CIUDAD - Transporte y Lugares Clave
        { nombre: "Terminal Central de Buses", ciudad: "Guatemala", tipo: "terminal", lat: 14.6349, lng: -90.5069, descripcion: "Terminal principal de buses" },
        { nombre: "Aeropuerto La Aurora", ciudad: "Guatemala", tipo: "aeropuerto", lat: 14.5833, lng: -90.5275, descripcion: "Aeropuerto Internacional" },
        { nombre: "Terminal del Norte", ciudad: "Guatemala", tipo: "terminal", lat: 14.6403, lng: -90.5147, descripcion: "Terminal buses al norte" },
        { nombre: "Terminal del Sur", ciudad: "Guatemala", tipo: "terminal", lat: 14.6198, lng: -90.5189, descripcion: "Terminal buses al sur" },
        { nombre: "Centro Histórico", ciudad: "Guatemala", tipo: "centro", lat: 14.6426, lng: -90.5136, descripcion: "Plaza de la Constitución" },
        { nombre: "Zona Viva", ciudad: "Guatemala", tipo: "zona", lat: 14.5937, lng: -90.5069, descripcion: "Zona Rosa - Hoteles y restaurantes" },
        { nombre: "Hotel Westin Camino Real", ciudad: "Guatemala", tipo: "hotel", lat: 14.5945, lng: -90.5060, descripcion: "Hotel 5 estrellas Zona 10" },
        { nombre: "Centro Comercial Oakland Mall", ciudad: "Guatemala", tipo: "comercial", lat: 14.5891, lng: -90.4934, descripcion: "Centro comercial principal" },

        // ANTIGUA GUATEMALA - Destino Turístico Principal
        { nombre: "Parque Central Antigua", ciudad: "Antigua Guatemala", tipo: "centro", lat: 14.5586, lng: -90.7337, descripcion: "Plaza principal de Antigua" },
        { nombre: "Hotel Casa Santo Domingo", ciudad: "Antigua Guatemala", tipo: "hotel", lat: 14.5547, lng: -90.7350, descripcion: "Hotel boutique histórico" },
        { nombre: "Terminal de Buses Antigua", ciudad: "Antigua Guatemala", tipo: "terminal", lat: 14.5614, lng: -90.7294, descripcion: "Terminal buses Antigua" },
        { nombre: "Volcán de Agua Mirador", ciudad: "Antigua Guatemala", tipo: "turistico", lat: 14.5311, lng: -90.7408, descripcion: "Mirador volcán" },

        // PANAJACHEL - Lago Atitlán
        { nombre: "Muelle Principal Panajachel", ciudad: "Panajachel", tipo: "muelle", lat: 14.7407, lng: -91.1593, descripcion: "Embarcadero principal" },
        { nombre: "Hotel Atitlán", ciudad: "Panajachel", tipo: "hotel", lat: 14.7389, lng: -91.1456, descripcion: "Hotel vista al lago" },
        { nombre: "Calle Santander", ciudad: "Panajachel", tipo: "comercial", lat: 14.7425, lng: -91.1589, descripcion: "Calle turística principal" },

        // FLORES - PETÉN
        { nombre: "Aeropuerto Mundo Maya", ciudad: "Flores", tipo: "aeropuerto", lat: 16.9158, lng: -89.8661, descripcion: "Aeropuerto Flores Petén" },
        { nombre: "Isla de Flores Centro", ciudad: "Flores", tipo: "centro", lat: 16.9268, lng: -89.8906, descripcion: "Centro histórico isla" },
        { nombre: "Terminal ADN Flores", ciudad: "Flores", tipo: "terminal", lat: 16.9301, lng: -89.8889, descripcion: "Terminal buses ADN" },
        { nombre: "Hotel Villa Maya", ciudad: "Flores", tipo: "hotel", lat: 16.9145, lng: -89.8634, descripcion: "Hotel cerca aeropuerto" },

        // QUETZALTENANGO (XELA)
        { nombre: "Parque Centro América Xela", ciudad: "Quetzaltenango", tipo: "centro", lat: 14.8406, lng: -91.5186, descripcion: "Plaza central Xela" },
        { nombre: "Terminal Minerva Xela", ciudad: "Quetzaltenango", tipo: "terminal", lat: 14.8278, lng: -91.5314, descripcion: "Terminal principal Xela" },
        { nombre: "Hotel Casa Mañen", ciudad: "Quetzaltenango", tipo: "hotel", lat: 14.8397, lng: -91.5189, descripcion: "Hotel centro histórico" },

        // COBÁN - ALTA VERAPAZ
        { nombre: "Terminal Cobán", ciudad: "Cobán", tipo: "terminal", lat: 15.4708, lng: -90.3706, descripcion: "Terminal buses Cobán" },
        { nombre: "Parque Central Cobán", ciudad: "Cobán", tipo: "centro", lat: 15.4714, lng: -90.3689, descripcion: "Plaza central Cobán" },
        { nombre: "Hotel La Posada", ciudad: "Cobán", tipo: "hotel", lat: 15.4703, lng: -90.3667, descripcion: "Hotel centro Cobán" },

        // RÍO DULCE
        { nombre: "Muelle Río Dulce", ciudad: "Río Dulce", tipo: "muelle", lat: 15.6622, lng: -89.0167, descripción: "Embarcadero principal" },
        { nombre: "Hotel Casa Perico", ciudad: "Río Dulce", tipo: "hotel", lat: 15.6589, lng: -89.0134, descripcion: "Hotel vista río" },

        // LIVINGTON
        { nombre: "Muelle Livingston", ciudad: "Livingston", tipo: "muelle", lat: 15.8278, lng: -88.7500, descripcion: "Puerto Livingston" },
        { nombre: "Hotel Villa Caribe", ciudad: "Livingston", tipo: "hotel", lat: 15.8267, lng: -88.7489, descripcion: "Hotel frente al mar" },

        // PUERTO BARRIOS
        { nombre: "Puerto Santo Tomás", ciudad: "Puerto Barrios", tipo: "puerto", lat: 15.7306, lng: -88.6022, descripcion: "Puerto principal" },
        { nombre: "Terminal Puerto Barrios", ciudad: "Puerto Barrios", tipo: "terminal", lat: 15.7278, lng: -88.5956, descripcion: "Terminal de buses" },

        // ESCUINTLA
        { nombre: "Terminal Escuintla", ciudad: "Escuintla", tipo: "terminal", lat: 14.3056, lng: -90.7850, descripcion: "Terminal buses Escuintla" },
        { nombre: "Puerto San José", ciudad: "San José", tipo: "puerto", lat: 13.9278, lng: -90.8333, descripcion: "Puerto Pacífico" },

        // HUEHUETENANGO
        { nombre: "Terminal Huehuetenango", ciudad: "Huehuetenango", tipo: "terminal", lat: 15.3197, lng: -91.4714, descripcion: "Terminal buses Huehue" },
        { nombre: "Parque Central Huehuetenango", ciudad: "Huehuetenango", tipo: "centro", lat: 15.3206, lng: -91.4703, descripcion: "Plaza central" },

        // CHIQUIMULA
        { nombre: "Terminal Chiquimula", ciudad: "Chiquimula", tipo: "terminal", lat: 14.8000, lng: -89.5453, descripcion: "Terminal buses" },

        // ESQUIPULAS
        { nombre: "Basílica Esquipulas", ciudad: "Esquipulas", tipo: "religioso", lat: 14.5664, lng: -89.3508, descripcion: "Basílica del Cristo Negro" },
        { nombre: "Terminal Esquipulas", ciudad: "Esquipulas", tipo: "terminal", lat: 14.5642, lng: -89.3528, descripcion: "Terminal buses" },

        // RETALHULEU
        { nombre: "Terminal Retalhuleu", ciudad: "Retalhuleu", tipo: "terminal", lat: 14.5406, lng: -91.6831, descripcion: "Terminal buses Reu" },
        { nombre: "Parque Central Retalhuleu", ciudad: "Retalhuleu", tipo: "centro", lat: 14.5422, lng: -91.6825, descripcion: "Plaza central" }
    ];

    // Función para buscar en base de datos local
    const buscarLocal = (query) => {
        if (!query || query.length < 2) return [];

        return puntosImportantes
            .filter(lugar => {
                const matchNombre = lugar.nombre.toLowerCase().includes(query.toLowerCase());
                const matchCiudad = !ciudadFiltro || lugar.ciudad.toLowerCase().includes(ciudadFiltro.toLowerCase());
                return matchNombre && matchCiudad;
            })
            .slice(0, 4); // Máximo 4 resultados locales
    };

    // Función para buscar en Nominatim (OpenStreetMap)
    const buscarNominatim = async (query) => {
        try {
            let searchQuery = query;

            // Agregar ciudad al filtro si existe
            if (ciudadFiltro) {
                searchQuery += `, ${ciudadFiltro}`;
            }

            // Siempre incluir Guatemala para mejores resultados
            searchQuery += ', Guatemala';

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(searchQuery)}` +
                `&format=json` +
                `&limit=6` +
                `&addressdetails=1` +
                `&extratags=1` +
                `&namedetails=1` +
                `&countrycodes=gt`, // Solo Guatemala
                {
                    headers: {
                        'User-Agent': 'MagicTravel-Frontend/1.0'
                    }
                }
            );

            if (!response.ok) return [];

            const data = await response.json();

            return data.map(item => ({
                nombre: item.display_name.split(',')[0],
                ciudad: ciudadFiltro || extraerCiudad(item.address),
                tipo: determinarTipo(item),
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                descripcion: generarDescripcion(item),
                fuente: 'nominatim',
                direccion_completa: item.display_name
            }));

        } catch (error) {
            console.warn('Error buscando en Nominatim:', error);
            return [];
        }
    };

    // Función para extraer ciudad del address
    const extraerCiudad = (address) => {
        if (!address) return '';
        return address.city || address.town || address.village || address.municipality || '';
    };

    // Función para determinar tipo de lugar
    const determinarTipo = (item) => {
        const tags = item.extratags || {};
        const type = item.type || '';
        const category = item.class || '';

        if (tags.amenity === 'bus_station' || type === 'bus_station') return 'terminal';
        if (tags.tourism === 'hotel' || category === 'tourism') return 'hotel';
        if (tags.aeroway || category === 'aeroway') return 'aeropuerto';
        if (tags.amenity === 'hospital') return 'hospital';
        if (tags.shop || category === 'shop') return 'comercial';
        if (tags.historic || category === 'historic') return 'historico';
        if (tags.natural || category === 'natural') return 'natural';
        if (tags.amenity === 'restaurant') return 'restaurant';

        return 'lugar';
    };

    // Función para generar descripción
    const generarDescripcion = (item) => {
        const address = item.address || {};
        const type = determinarTipo(item);

        let desc = '';
        if (address.road) desc += address.road;
        if (address.suburb) desc += desc ? `, ${address.suburb}` : address.suburb;
        if (address.city) desc += desc ? `, ${address.city}` : address.city;

        return desc || `${type} encontrado`;
    };

    // Función principal de búsqueda
    const buscarLugares = async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsLoading(true);

        try {
            // 1. Buscar en base de datos local primero
            const resultadosLocales = buscarLocal(query);

            // 2. Buscar en Nominatim
            const resultadosNominatim = await buscarNominatim(query);

            // 3. Combinar resultados (locales primero)
            const todosLosResultados = [
                ...resultadosLocales,
                ...resultadosNominatim.filter(item =>
                    !resultadosLocales.some(local =>
                        local.nombre.toLowerCase() === item.nombre.toLowerCase()
                    )
                )
            ].slice(0, 8); // Máximo 8 resultados totales

            setSuggestions(todosLosResultados);
            setShowSuggestions(todosLosResultados.length > 0);
            setSelectedIndex(-1);

        } catch (error) {
            console.error('Error en búsqueda:', error);
            setSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounce para búsquedas
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            buscarLugares(value);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [value, ciudadFiltro]);

    // Manejar clics fuera del componente
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                setShowSuggestions(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Manejar navegación por teclado
    const handleKeyDown = (e) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;

            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;

            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    seleccionarLugar(suggestions[selectedIndex]);
                }
                break;

            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    };

    // Seleccionar lugar de la lista
    const seleccionarLugar = (lugar) => {
        console.log('📍 Lugar seleccionado:', lugar);

        // Actualizar el campo de nombre
        onChange(lugar.nombre);

        // Notificar al componente padre con todos los datos
        if (onPlaceSelect) {
            onPlaceSelect({
                nombre: lugar.nombre,
                ciudad: lugar.ciudad,
                tipo: lugar.tipo,
                latitud: lugar.lat,
                longitud: lugar.lng,
                descripcion: lugar.descripcion,
                direccion_completa: lugar.direccion_completa || lugar.nombre
            });
        }

        // Ocultar sugerencias
        setShowSuggestions(false);
        setSelectedIndex(-1);
    };

    // Obtener color por tipo de lugar
    const obtenerColorTipo = (tipo) => {
        const colores = {
            'terminal': '#dc2626',
            'aeropuerto': '#2563eb',
            'hotel': '#7c3aed',
            'muelle': '#059669',
            'puerto': '#0891b2',
            'centro': '#ea580c',
            'comercial': '#ca8a04',
            'turistico': '#16a34a',
            'religioso': '#9333ea',
            'hospital': '#dc2626',
            'restaurant': '#f59e0b',
            'historico': '#92400e',
            'natural': '#16a34a',
            'lugar': '#6b7280'
        };
        return colores[tipo] || '#6b7280';
    };

    // Obtener icono por tipo
    const obtenerIconoTipo = (tipo) => {
        switch (tipo) {
            case 'terminal': return '🚌';
            case 'aeropuerto': return '✈️';
            case 'hotel': return '🏨';
            case 'muelle': case 'puerto': return '⛵';
            case 'centro': return '🏛️';
            case 'comercial': return '🛍️';
            case 'turistico': return '🎯';
            case 'religioso': return '⛪';
            case 'hospital': return '🏥';
            case 'restaurant': return '🍽️';
            case 'historico': return '🏺';
            case 'natural': return '🌲';
            default: return '📍';
        }
    };

    return e('div', {
        ref: inputRef,
        style: {
            position: 'relative',
            width: '100%'
        }
    }, [
        // Input principal
        e('input', {
            key: 'place-input',
            type: 'text',
            value: value,
            placeholder: placeholder,
            onChange: (e) => onChange(e.target.value),
            onKeyDown: handleKeyDown,
            onFocus: () => {
                if (suggestions.length > 0) {
                    setShowSuggestions(true);
                }
            },
            style: {
                width: '100%',
                padding: '0.75rem',
                paddingRight: isLoading ? '3rem' : '2.5rem',
                border: hasError ? '2px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s',
                ...style
            }
        }),

        // Icono de búsqueda o loading
        e('div', {
            key: 'search-icon',
            style: {
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                display: 'flex',
                alignItems: 'center'
            }
        }, isLoading
            ? e('div', {
                style: {
                    width: '16px',
                    height: '16px',
                    border: '2px solid #e5e7eb',
                    borderTop: '2px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }
            })
            : Icons.mapPin('#9ca3af')
        ),

        // Lista de sugerencias
        showSuggestions && suggestions.length > 0 && e('div', {
            key: 'suggestions',
            style: {
                position: 'absolute',
                top: '100%',
                left: '0',
                right: '0',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                zIndex: 1000,
                marginTop: '4px',
                maxHeight: '320px',
                overflowY: 'auto'
            }
        }, suggestions.map((lugar, index) =>
            e('div', {
                key: `${lugar.nombre}-${lugar.ciudad}-${index}`,
                onClick: () => seleccionarLugar(lugar),
                style: {
                    padding: '0.75rem',
                    cursor: 'pointer',
                    borderBottom: index < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                    backgroundColor: selectedIndex === index ? '#f9fafb' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'background-color 0.1s'
                },
                onMouseEnter: () => setSelectedIndex(index),
                onMouseLeave: () => setSelectedIndex(-1)
            }, [
                // Icono del tipo
                e('div', {
                    key: 'tipo-icon',
                    style: {
                        fontSize: '1.25rem',
                        flexShrink: 0
                    }
                }, obtenerIconoTipo(lugar.tipo)),

                // Información del lugar
                e('div', {
                    key: 'place-info',
                    style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.1rem',
                        flex: 1,
                        minWidth: 0
                    }
                }, [
                    e('div', {
                        key: 'place-name',
                        style: {
                            fontWeight: '500',
                            color: '#111827',
                            fontSize: '0.875rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }
                    }, lugar.nombre),
                    e('div', {
                        key: 'place-details',
                        style: {
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }
                    }, `${lugar.ciudad} • ${lugar.descripcion}`),
                    lugar.fuente === 'nominatim' && e('div', {
                        key: 'source-badge',
                        style: {
                            fontSize: '0.625rem',
                            color: '#10b981',
                            fontWeight: '500'
                        }
                    }, 'OpenStreetMap')
                ]),

                // Indicador de tipo
                e('div', {
                    key: 'type-indicator',
                    style: {
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: obtenerColorTipo(lugar.tipo),
                        flexShrink: 0
                    }
                })
            ])
        ))
    ]);
}

export default PlaceAutocomplete;
