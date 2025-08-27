// src/resources/js/components/common/MapPlaceSelector.js
import React from 'react';
import Icons from '../../utils/Icons';

const { createElement: e, useState, useEffect, useRef } = React;

function MapPlaceSelector({
    value = '',
    onChange,
    onPlaceSelect,
    ciudadFiltro = '',
    placeholder = 'Buscar lugar en el mapa...',
    style = {},
    hasError = false
}) {
    const [showMap, setShowMap] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);

    // Coordenadas de Guatemala
    const guatemalaCenter = [15.7835, -90.2308];
    const guatemalaBounds = [[13.5, -92.5], [18.0, -88.0]];

    // FUNCIÓN DE RESET COMPLETO
    const resetMapState = () => {
        console.log('Reseteando estado del mapa...');

        // Limpiar marcadores si existen
        clearMarkers();

        // Destruir instancia del mapa si existe
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }

        // Resetear estados
        setSearchQuery('');
        setSearchResults([]);
        setIsLoading(false);
        setSelectedPlace(null);

        console.log('Estado del mapa reseteado');
    };

    // FUNCIÓN PARA CERRAR MODAL CON RESET
    const closeMapModal = () => {
        console.log('Cerrando modal del mapa...');
        setShowMap(false);
        // Reset con un pequeño delay para evitar conflictos visuales
        setTimeout(resetMapState, 100);
    };

    // Inicializar mapa cuando se abre
    useEffect(() => {
        if (showMap && mapRef.current && !mapInstanceRef.current) {
            initializeMap();
        }
    }, [showMap]);

    // Inicializar Leaflet
    const initializeMap = () => {
        console.log('Inicializando mapa...');
        // Verificar si Leaflet está disponible
        if (typeof L === 'undefined') {
            loadLeaflet().then(() => {
                createMap();
            });
        } else {
            createMap();
        }
    };

    // Cargar Leaflet dinámicamente
    const loadLeaflet = () => {
        return new Promise((resolve) => {
            // CSS de Leaflet
            const linkElement = document.createElement('link');
            linkElement.rel = 'stylesheet';
            linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(linkElement);

            // JavaScript de Leaflet
            const scriptElement = document.createElement('script');
            scriptElement.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            scriptElement.onload = resolve;
            document.head.appendChild(scriptElement);
        });
    };

    // Crear mapa
    const createMap = () => {
        if (!mapRef.current || mapInstanceRef.current) return;

        console.log('Creando nueva instancia del mapa...');

        const map = L.map(mapRef.current, {
            center: guatemalaCenter,
            zoom: 8,
            maxBounds: guatemalaBounds,
            maxZoom: 18,
            minZoom: 7
        });

        // Tile layer de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(map);

        // Evento de clic en el mapa
        map.on('click', handleMapClick);

        mapInstanceRef.current = map;

        // Si hay ciudad filtro, centrar en esa ciudad
        if (ciudadFiltro) {
            centerOnCity(ciudadFiltro);
        }

        console.log('Mapa creado exitosamente');
    };

    // Centrar mapa en ciudad específica
    const centerOnCity = async (ciudad) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(ciudad)}, Guatemala&format=json&limit=1`
            );
            const data = await response.json();

            if (data.length > 0 && mapInstanceRef.current) {
                const { lat, lon } = data[0];
                mapInstanceRef.current.setView([parseFloat(lat), parseFloat(lon)], 12);
            }
        } catch (error) {
            console.warn('Error centrando en ciudad:', error);
        }
    };

    // Manejar clic en el mapa
    const handleMapClick = async (e) => {
        const { lat, lng } = e.latlng;

        setIsLoading(true);
        clearMarkers();

        try {
            // Búsqueda reversa para obtener información del lugar
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?` +
                `lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=18`
            );

            const data = await response.json();

            if (data && data.display_name) {
                const place = {
                    nombre: extractPlaceName(data),
                    ciudad: ciudadFiltro || extractCity(data.address),
                    tipo: determineType(data),
                    latitud: parseFloat(lat),
                    longitud: parseFloat(lng),
                    descripcion: data.display_name,
                    direccion_completa: data.display_name
                };

                console.log('MapPlaceSelector - Lugar desde clic en mapa:', place);

                // Agregar marcador al mapa
                addMarker(place.latitud, place.longitud, place.nombre);

                // Actualizar estado
                setSelectedPlace(place);
                onChange(place.nombre);

                if (onPlaceSelect) {
                    onPlaceSelect(place);
                }
            }
        } catch (error) {
            console.error('Error en búsqueda reversa:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Buscar lugares por texto
    const searchPlaces = async (query) => {
        if (!query || query.length < 3) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);

        try {
            let searchQuery = query;
            if (ciudadFiltro) {
                searchQuery += `, ${ciudadFiltro}`;
            }
            searchQuery += ', Guatemala';

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?` +
                `q=${encodeURIComponent(searchQuery)}&format=json&limit=8&addressdetails=1`
            );

            const data = await response.json();

            const results = data.map(item => ({
                nombre: extractPlaceName(item),
                ciudad: ciudadFiltro || extractCity(item.address),
                tipo: determineType(item),
                latitud: parseFloat(item.lat),
                longitud: parseFloat(item.lon),
                descripcion: item.display_name,
                direccion_completa: item.display_name
            }));

            setSearchResults(results);

            // Mostrar marcadores en el mapa
            if (mapInstanceRef.current) {
                clearMarkers();
                results.forEach(place => {
                    addMarker(place.latitud, place.longitud, place.nombre);
                });

                // Ajustar vista si hay resultados
                if (results.length > 0) {
                    const group = L.featureGroup(markersRef.current);
                    mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
                }
            }

        } catch (error) {
            console.error('Error buscando lugares:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Agregar marcador al mapa
    const addMarker = (lat, lng, title) => {
        if (!mapInstanceRef.current) return;

        const marker = L.marker([lat, lng])
            .bindPopup(title)
            .addTo(mapInstanceRef.current);

        markersRef.current.push(marker);
        return marker;
    };

    // Limpiar marcadores
    const clearMarkers = () => {
        markersRef.current.forEach(marker => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.removeLayer(marker);
            }
        });
        markersRef.current = [];
    };

    // Seleccionar lugar de la lista
    const selectPlace = (place) => {
        console.log('MapPlaceSelector - Lugar original seleccionado:', place);

        // Normalizar datos para RouteCalculator
        const placeNormalizado = {
            nombre: place.nombre,
            ciudad: place.ciudad,
            tipo: place.tipo,
            latitud: parseFloat(place.latitud),
            longitud: parseFloat(place.longitud),
            descripcion: place.descripcion,
            direccion_completa: place.direccion_completa || place.nombre
        };

        console.log('MapPlaceSelector - Lugar normalizado:', placeNormalizado);

        setSelectedPlace(placeNormalizado);
        onChange(placeNormalizado.nombre);

        if (onPlaceSelect) {
            onPlaceSelect(placeNormalizado);
        }

        // Centrar mapa en el lugar
        if (mapInstanceRef.current) {
            clearMarkers();
            addMarker(placeNormalizado.latitud, placeNormalizado.longitud, placeNormalizado.nombre);
            mapInstanceRef.current.setView([placeNormalizado.latitud, placeNormalizado.longitud], 15);
        }

        // Limpiar búsqueda
        setSearchQuery('');
        setSearchResults([]);
    };

    // Funciones auxiliares
    const extractPlaceName = (data) => {
        if (data.name) return data.name;
        if (data.address) {
            return data.address.amenity ||
                data.address.building ||
                data.address.shop ||
                data.address.road ||
                data.display_name.split(',')[0];
        }
        return data.display_name.split(',')[0];
    };

    const extractCity = (address) => {
        if (!address) return '';
        return address.city || address.town || address.village || address.municipality || '';
    };

    const determineType = (data) => {
        const tags = data.extratags || {};
        const type = data.type || '';
        const category = data.class || '';

        if (tags.amenity === 'bus_station' || type === 'bus_station') return 'terminal';
        if (tags.tourism === 'hotel' || category === 'tourism') return 'hotel';
        if (tags.aeroway || category === 'aeroway') return 'aeropuerto';
        if (tags.amenity === 'hospital') return 'hospital';
        if (tags.shop || category === 'shop') return 'comercial';

        return 'lugar';
    };

    // Obtener icono por tipo
    const getTypeIcon = (tipo) => {
        const icons = {
            'terminal': '🚌',
            'aeropuerto': '✈️',
            'hotel': '🏨',
            'hospital': '🏥',
            'comercial': '🛍️',
            'lugar': '📍'
        };
        return icons[tipo] || '📍';
    };

    // Debounce para búsqueda
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchPlaces(searchQuery);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    return e('div', {
        style: {
            position: 'relative',
            width: '100%'
        }
    }, [
        // Input principal
        e('div', {
            key: 'input-container',
            style: { position: 'relative' }
        }, [
            e('input', {
                key: 'main-input',
                type: 'text',
                value: value,
                onChange: (e) => onChange(e.target.value),
                placeholder: placeholder,
                style: {
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '5rem',
                    border: hasError ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    outline: 'none',
                    ...style
                }
            }),

            // Botón para abrir mapa
            e('button', {
                key: 'map-button',
                type: 'button',
                onClick: () => setShowMap(!showMap),
                style: {
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: '0.5rem',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: showMap ? '#3b82f6' : '#f3f4f6',
                    color: showMap ? 'white' : '#6b7280',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem'
                }
            }, [
                Icons.map(),
                'Mapa'
            ])
        ]),

        // Modal del mapa
        showMap && e('div', {
            key: 'map-modal',
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
            },
            onClick: (e) => {
                if (e.target === e.currentTarget) {
                    closeMapModal(); // ← CAMBIO: Usar función con reset
                }
            }
        }, [
            e('div', {
                key: 'map-container',
                style: {
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    width: '90vw',
                    height: '80vh',
                    maxWidth: '1000px',
                    maxHeight: '700px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }
            }, [
                // Header del modal
                e('div', {
                    key: 'map-header',
                    style: {
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }
                }, [
                    e('h3', {
                        key: 'map-title',
                        style: {
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#111827',
                            margin: 0
                        }
                    }, `Seleccionar ${ciudadFiltro ? `lugar en ${ciudadFiltro}` : 'lugar en Guatemala'}`),

                    e('button', {
                        key: 'close-button',
                        onClick: closeMapModal, // ← CAMBIO: Usar función con reset
                        style: {
                            padding: '0.5rem',
                            border: 'none',
                            borderRadius: '6px',
                            backgroundColor: 'transparent',
                            cursor: 'pointer'
                        }
                    }, Icons.x())
                ]),

                // Barra de búsqueda
                e('div', {
                    key: 'search-bar',
                    style: {
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb'
                    }
                }, [
                    e('div', { key: 'search-container', style: { position: 'relative' } }, [
                        e('input', {
                            key: 'search-input',
                            type: 'text',
                            value: searchQuery,
                            onChange: (e) => setSearchQuery(e.target.value),
                            placeholder: 'Buscar lugares por nombre...',
                            style: {
                                width: '100%',
                                padding: '0.75rem',
                                paddingRight: '2.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                outline: 'none'
                            }
                        }),
                        e('div', {
                            key: 'search-icon',
                            style: {
                                position: 'absolute',
                                right: '0.75rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#9ca3af'
                            }
                        }, isLoading ? e('div', {
                            style: {
                                width: '16px',
                                height: '16px',
                                border: '2px solid #e5e7eb',
                                borderTop: '2px solid #3b82f6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }
                        }) : Icons.search())
                    ])
                ]),

                // Contenido principal - mapa y resultados
                e('div', {
                    key: 'map-content',
                    style: {
                        flex: 1,
                        display: 'flex',
                        minHeight: 0
                    }
                }, [
                    // Mapa
                    e('div', {
                        key: 'map-wrapper',
                        style: {
                            flex: 1,
                            position: 'relative'
                        }
                    }, [
                        e('div', {
                            key: 'map-element',
                            ref: mapRef,
                            style: {
                                width: '100%',
                                height: '100%'
                            }
                        }),

                        // Instrucciones
                        e('div', {
                            key: 'instructions',
                            style: {
                                position: 'absolute',
                                top: '1rem',
                                left: '1rem',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                color: '#374151',
                                maxWidth: '200px'
                            }
                        }, 'Haz clic en cualquier lugar del mapa para seleccionar un punto')
                    ]),

                    // Panel de resultados (si hay búsqueda)
                    searchResults.length > 0 && e('div', {
                        key: 'results-panel',
                        style: {
                            width: '300px',
                            borderLeft: '1px solid #e5e7eb',
                            backgroundColor: '#f9fafb',
                            overflow: 'auto'
                        }
                    }, [
                        e('div', {
                            key: 'results-header',
                            style: {
                                padding: '1rem',
                                borderBottom: '1px solid #e5e7eb',
                                backgroundColor: 'white'
                            }
                        }, [
                            e('h4', {
                                style: {
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: '#111827',
                                    margin: 0
                                }
                            }, `${searchResults.length} lugares encontrados`)
                        ]),

                        e('div', {
                            key: 'results-list',
                            style: { padding: '0.5rem' }
                        }, searchResults.map((place, index) =>
                            e('div', {
                                key: `result-${index}`,
                                onClick: () => selectPlace(place),
                                style: {
                                    padding: '0.75rem',
                                    margin: '0.25rem 0',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    border: '1px solid #e5e7eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    transition: 'all 0.2s'
                                },
                                onMouseEnter: (e) => e.target.style.backgroundColor = '#f3f4f6',
                                onMouseLeave: (e) => e.target.style.backgroundColor = 'white'
                            }, [
                                e('div', {
                                    key: 'place-icon',
                                    style: { fontSize: '1.25rem' }
                                }, getTypeIcon(place.tipo)),

                                e('div', {
                                    key: 'place-info',
                                    style: { flex: 1, minWidth: 0 }
                                }, [
                                    e('div', {
                                        key: 'place-name',
                                        style: {
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: '#111827',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }
                                    }, place.nombre),
                                    e('div', {
                                        key: 'place-desc',
                                        style: {
                                            fontSize: '0.75rem',
                                            color: '#6b7280',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }
                                    }, `${place.ciudad} • ${place.tipo}`)
                                ])
                            ])
                        ))
                    ])
                ]),

                // Footer con lugar seleccionado
                selectedPlace && e('div', {
                    key: 'selected-footer',
                    style: {
                        padding: '1rem',
                        borderTop: '1px solid #e5e7eb',
                        backgroundColor: '#f0f9ff'
                    }
                }, [
                    e('div', {
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }
                    }, [
                        e('div', {
                            style: { fontSize: '1.25rem' }
                        }, getTypeIcon(selectedPlace.tipo)),

                        e('div', { style: { flex: 1 } }, [
                            e('div', {
                                style: {
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: '#111827'
                                }
                            }, selectedPlace.nombre),
                            e('div', {
                                style: {
                                    fontSize: '0.75rem',
                                    color: '#6b7280'
                                }
                            }, `${selectedPlace.ciudad} • Coordenadas: ${selectedPlace.latitud.toFixed(4)}, ${selectedPlace.longitud.toFixed(4)}`)
                        ]),

                        e('button', {
                            onClick: closeMapModal, // ← CAMBIO: Usar función con reset
                            style: {
                                padding: '0.5rem 1rem',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }
                        }, 'Seleccionar')
                    ])
                ])
            ])
        ])
    ]);
}

export default MapPlaceSelector;
