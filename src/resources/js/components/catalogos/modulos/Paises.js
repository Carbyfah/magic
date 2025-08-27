// src/resources/js/components/catalogos/modulos/Paises.js
import React from 'react';
import CatalogoBase from '../common/CatalogoBase';
import Icons from '../../../utils/Icons';

const { createElement: e } = React;

function Paises() {
    // Configuración específica para Países con AUTOCOMPLETADO
    const campos = [
        {
            key: 'nombre_pais',
            label: 'Nombre del País',
            tipo: 'country_autocomplete', // NUEVO TIPO ESPECIAL
            placeholder: 'Escriba "Hon" para ver Honduras...'
        },
        {
            key: 'codigo_iso2',
            label: 'Código ISO2',
            tipo: 'text',
            placeholder: 'Se completa automáticamente',
            readonly: true // Se completa automáticamente
        },
        {
            key: 'codigo_iso3',
            label: 'Código ISO3',
            tipo: 'text',
            placeholder: 'Se completa automáticamente',
            readonly: true // Se completa automáticamente
        },
        {
            key: 'codigo_telefono',
            label: 'Código Telefónico',
            tipo: 'text',
            placeholder: 'Se completa automáticamente',
            readonly: true // Se completa automáticamente
        }
    ];

    // Validaciones específicas (más flexibles para autocompletado)
    const validaciones = {
        nombre_pais: {
            required: true,
            minLength: 2,
            maxLength: 100
        },
        codigo_iso2: {
            required: true,
            minLength: 2,
            maxLength: 2,
            pattern: '^[A-Z]{2}$',
            patternMessage: 'Debe ser exactamente 2 letras mayúsculas'
        },
        codigo_iso3: {
            required: true,
            minLength: 3,
            maxLength: 3,
            pattern: '^[A-Z]{3}$',
            patternMessage: 'Debe ser exactamente 3 letras mayúsculas'
        },
        codigo_telefono: {
            pattern: '^\\+[0-9]{1,4}$',
            patternMessage: 'Formato: +502 (hasta 4 dígitos después del +)'
        }
    };

    return e(CatalogoBase, {
        titulo: 'Países',
        endpoint: 'paises',
        campos: campos,
        validaciones: validaciones,
        icono: Icons.globe(),
        descripcion: 'Catálogo de países con autocompletado inteligente. Escriba las primeras letras y seleccione de la lista.',

        // CONFIGURACIÓN ESPECIAL PARA AUTOCOMPLETADO
        specialComponents: {
            country_autocomplete: 'CountryAutocomplete'
        }
    });
}

export default Paises;
