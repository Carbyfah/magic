// src/resources/js/components/catalogos/modulos/TiposCombustible.js
import React from 'react';
import CatalogoBase from '../common/CatalogoBase';
import Icons from '../../../utils/Icons';

const { createElement: e } = React;

function TiposCombustible() {
    // Configuración específica para Tipos de Combustible
    const campos = [
        {
            key: 'codigo',
            label: 'Código',
            tipo: 'text',
            placeholder: 'Ej: GAS, DIESEL, ELEC, HIB'
        },
        {
            key: 'nombre_combustible',
            label: 'Nombre del Combustible',
            tipo: 'text',
            placeholder: 'Ej: Gasolina, Diesel, Eléctrico'
        },
        {
            key: 'unidad_medida',
            label: 'Unidad de Medida',
            tipo: 'text',
            placeholder: 'Ej: GAL, LT',
            defaultValue: 'GAL'
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
        nombre_combustible: {
            required: true,
            minLength: 3,
            maxLength: 50
        },
        unidad_medida: {
            required: true,
            minLength: 2,
            maxLength: 10
        }
    };

    return e(CatalogoBase, {
        titulo: 'Tipos de Combustible',
        endpoint: 'tipos-combustible',
        campos: campos,
        validaciones: validaciones,
        icono: Icons.fuel(),
        descripcion: 'Gestión de tipos de combustible para vehículos (Gasolina, Diesel, Eléctrico, Híbrido)'
    });
}

export default TiposCombustible;
