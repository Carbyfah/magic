// src/resources/js/components/catalogos/modulos/TiposAgencia.js
import React from 'react';
import CatalogoBase from '../common/CatalogoBase';
import Icons from '../../../utils/Icons';

const { createElement: e } = React;

function TiposAgencia() {
    // Configuración específica para Tipos de Agencia
    const campos = [
        {
            key: 'codigo',
            label: 'Código',
            tipo: 'text',
            placeholder: 'Ej: MAY, MIN, ONL, HOT, TOUR'
        },
        {
            key: 'nombre_tipo',
            label: 'Nombre del Tipo',
            tipo: 'text',
            placeholder: 'Ej: Mayorista, Minorista, Online, Hotel'
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            tipo: 'textarea',
            placeholder: 'Descripción del tipo de agencia y sus características'
        }
    ];

    // Validaciones específicas según la base de datos
    const validaciones = {
        codigo: {
            required: true,
            minLength: 2,
            maxLength: 10,
            pattern: '^[A-Z0-9_]+$',
            patternMessage: 'Solo letras mayúsculas, números y guiones bajos'
        },
        nombre_tipo: {
            required: true,
            minLength: 3,
            maxLength: 100
        },
        descripcion: {
            maxLength: 500
        }
    };

    return e(CatalogoBase, {
        titulo: 'Tipos de Agencia',
        endpoint: 'tipos-agencia',
        campos: campos,
        validaciones: validaciones,
        icono: Icons.building(),
        descripcion: 'Clasificación de agencias colaboradoras (Mayorista, Minorista, Online, Hotel, Tour Operador)'
    });
}

export default TiposAgencia;
