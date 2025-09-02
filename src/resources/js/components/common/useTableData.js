// src/resources/js/components/common/useTableData.js
import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Hook personalizado para manejo de datos de tabla con paginación, filtros y ordenamiento
 * Preparado para todas las 13 tablas del sistema Magic Travel
 * @param {Object} config - Configuración específica del módulo
 * @param {Array} rawData - Datos sin procesar desde la API
 * @param {Function} onDataUpdate - Callback cuando cambian los datos procesados
 * @returns {Object} - Estado y funciones para manejar la tabla
 */
const useTableData = (config, rawData = [], onDataUpdate = null) => {
    // Estados de paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(config.defaultItemsPerPage || 10);

    // Estados de filtros
    const [globalSearch, setGlobalSearch] = useState('');
    const [fieldFilters, setFieldFilters] = useState({});
    const [showInactive, setShowInactive] = useState(false);

    // Estados de ordenamiento
    const [sortField, setSortField] = useState(config.defaultSortField || '');
    const [sortDirection, setSortDirection] = useState(config.defaultSortDirection || 'asc');

    // Estados de control
    const [isLoading, setIsLoading] = useState(false);

    // Resetear página al cambiar filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [globalSearch, fieldFilters, showInactive]);

    // Función para aplicar filtros globales
    const applyGlobalFilter = useCallback((items) => {
        if (!globalSearch.trim()) return items;

        const searchTerm = globalSearch.toLowerCase();
        const searchableFields = config.searchableFields || [];

        return items.filter(item => {
            // Si no hay campos específicos, buscar en todos los valores
            if (searchableFields.length === 0) {
                return Object.values(item).some(value =>
                    value && value.toString().toLowerCase().includes(searchTerm)
                );
            }

            // Buscar solo en campos específicos
            return searchableFields.some(field => {
                const value = item[field];
                return value && value.toString().toLowerCase().includes(searchTerm);
            });
        });
    }, [globalSearch, config.searchableFields]);

    // Función para aplicar filtros por campo
    const applyFieldFilters = useCallback((items) => {
        if (Object.keys(fieldFilters).length === 0) return items;

        return items.filter(item => {
            return Object.entries(fieldFilters).every(([field, filterValue]) => {
                if (!filterValue) return true;

                const itemValue = item[field];
                const filterConfig = config.fields?.[field];

                if (filterConfig?.type === 'select') {
                    return itemValue === filterValue;
                }

                if (filterConfig?.type === 'number') {
                    return parseFloat(itemValue) === parseFloat(filterValue);
                }

                if (filterConfig?.type === 'date') {
                    const itemDate = new Date(itemValue).toDateString();
                    const filterDate = new Date(filterValue).toDateString();
                    return itemDate === filterDate;
                }

                // Texto por defecto
                return itemValue && itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
            });
        });
    }, [fieldFilters, config.fields]);

    // Función para aplicar filtro de activos/inactivos
    const applyStatusFilter = useCallback((items) => {
        if (showInactive) return items;

        const situacionField = config.statusField || `${config.tableName}_situacion`;

        return items.filter(item => {
            const status = item[situacionField];
            return status === 1 || status === true;
        });
    }, [showInactive, config.statusField, config.tableName]);

    // Función para aplicar ordenamiento
    const applySorting = useCallback((items) => {
        if (!sortField) return items;

        return [...items].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            const fieldConfig = config.fields?.[sortField];

            // Ordenamiento numérico
            if (fieldConfig?.type === 'number' || fieldConfig?.sortType === 'numeric') {
                const numA = parseFloat(aValue) || 0;
                const numB = parseFloat(bValue) || 0;
                return sortDirection === 'asc' ? numA - numB : numB - numA;
            }

            // Ordenamiento por fecha
            if (fieldConfig?.type === 'date' || fieldConfig?.sortType === 'date') {
                const dateA = new Date(aValue || 0);
                const dateB = new Date(bValue || 0);
                return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
            }

            // Ordenamiento alfabético por defecto
            const strA = (aValue || '').toString().toLowerCase();
            const strB = (bValue || '').toString().toLowerCase();

            if (sortDirection === 'asc') {
                return strA.localeCompare(strB);
            } else {
                return strB.localeCompare(strA);
            }
        });
    }, [sortField, sortDirection, config.fields]);

    // Datos procesados con todos los filtros y ordenamiento
    const processedData = useMemo(() => {
        let result = [...rawData];

        // Aplicar filtros en orden
        result = applyStatusFilter(result);
        result = applyGlobalFilter(result);
        result = applyFieldFilters(result);
        result = applySorting(result);

        return result;
    }, [rawData, applyStatusFilter, applyGlobalFilter, applyFieldFilters, applySorting]);

    // Datos paginados
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return processedData.slice(startIndex, endIndex);
    }, [processedData, currentPage, itemsPerPage]);

    // Información de paginación
    const paginationInfo = useMemo(() => {
        const totalItems = processedData.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);

        return {
            totalItems,
            totalPages,
            currentPage,
            itemsPerPage,
            startItem,
            endItem,
            hasPreviousPage: currentPage > 1,
            hasNextPage: currentPage < totalPages
        };
    }, [processedData.length, currentPage, itemsPerPage]);

    // Estadísticas para dashboard
    const statistics = useMemo(() => {
        const total = rawData.length;
        const situacionField = config.statusField || `${config.tableName}_situacion`;

        const active = rawData.filter(item => {
            const status = item[situacionField];
            return status === 1 || status === true;
        }).length;

        const inactive = total - active;
        const filtered = processedData.length;

        // CORECCIÓN: Determinar si hay filtros activos
        const hasFilters = globalSearch.trim() !== '' ||
            Object.keys(fieldFilters).some(key => fieldFilters[key] && fieldFilters[key] !== '') ||
            showInactive;

        return {
            total,
            active,
            inactive,
            filtered,
            isFiltered: hasFilters
        };
    }, [rawData, processedData.length, config.statusField, config.tableName, globalSearch, fieldFilters, showInactive]);

    // Funciones de control
    const handlePageChange = useCallback((page) => {
        setCurrentPage(Math.max(1, Math.min(page, paginationInfo.totalPages)));
    }, [paginationInfo.totalPages]);

    const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    }, []);

    const handleGlobalSearchChange = useCallback((searchTerm) => {
        setGlobalSearch(searchTerm);
    }, []);

    const handleFieldFilterChange = useCallback((field, value) => {
        setFieldFilters(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const handleSortChange = useCallback((field) => {
        if (sortField === field) {
            // Cambiar dirección si es el mismo campo
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            // Nuevo campo, empezar con ascendente
            setSortField(field);
            setSortDirection('asc');
        }
    }, [sortField]);

    const handleShowInactiveChange = useCallback((show) => {
        setShowInactive(show);
    }, []);

    // Función para limpiar todos los filtros
    const clearAllFilters = useCallback(() => {
        setGlobalSearch('');
        setFieldFilters({});
        setShowInactive(false);
        setSortField(config.defaultSortField || '');
        setSortDirection(config.defaultSortDirection || 'asc');
        setCurrentPage(1);
    }, [config.defaultSortField, config.defaultSortDirection]);

    // Función para limpiar solo filtros (mantener ordenamiento)
    const clearFilters = useCallback(() => {
        setGlobalSearch('');
        setFieldFilters({});
        setShowInactive(false);
        setCurrentPage(1);
    }, []);

    // Notificar cambios al componente padre si se proporciona callback
    useEffect(() => {
        if (onDataUpdate) {
            onDataUpdate({
                data: paginatedData,
                processedData,
                statistics,
                paginationInfo
            });
        }
    }, [paginatedData, processedData, statistics, paginationInfo, onDataUpdate]);

    // Estado del hook para debuggeo
    const debugInfo = {
        rawDataLength: rawData.length,
        processedDataLength: processedData.length,
        paginatedDataLength: paginatedData.length,
        currentFilters: {
            globalSearch,
            fieldFilters,
            showInactive,
            sortField,
            sortDirection
        }
    };

    return {
        // Datos
        data: paginatedData,
        processedData,
        rawData,
        statistics,

        // Paginación
        pagination: paginationInfo,

        // Estados de filtros
        filters: {
            globalSearch,
            fieldFilters,
            showInactive,
            sortField,
            sortDirection
        },

        // Funciones de control
        actions: {
            // Paginación
            goToPage: handlePageChange,
            goToFirstPage: () => handlePageChange(1),
            goToLastPage: () => handlePageChange(paginationInfo.totalPages),
            goToNextPage: () => handlePageChange(currentPage + 1),
            goToPreviousPage: () => handlePageChange(currentPage - 1),
            setItemsPerPage: handleItemsPerPageChange,

            // Filtros
            setGlobalSearch: handleGlobalSearchChange,
            setFieldFilter: handleFieldFilterChange,
            setShowInactive: handleShowInactiveChange,

            // Ordenamiento
            setSorting: handleSortChange,

            // Limpiar
            clearAllFilters,
            clearFilters
        },

        // Estado
        isLoading,
        setIsLoading,

        // Debug
        debug: debugInfo
    };
};

export default useTableData;
