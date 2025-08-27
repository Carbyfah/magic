// src/resources/js/components/catalogos/modulos/EstadosVehiculo.js
import React from 'react';
import CatalogoBase from '../common/CatalogoBase';
import Icons from '../../../utils/Icons';

const { createElement: e } = React;

function EstadosVehiculo() {
    // Configuración específica para Estados de Vehículo
    const campos = [
        {
            key: 'codigo',
            label: 'Código',
            tipo: 'text',
            placeholder: 'Ej: DISP, RUTA, MANT, AVER'
        },
        {
            key: 'nombre_estado',
            label: 'Nombre del Estado',
            tipo: 'text',
            placeholder: 'Ej: Disponible, En Ruta, Mantenimiento'
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            tipo: 'textarea',
            placeholder: 'Descripción detallada del estado del vehículo'
        },
        {
            key: 'color_hex',
            label: 'Color de Etiqueta',
            tipo: 'color',
            placeholder: '#10B981'
        },
        {
            key: 'disponible_operacion',
            label: '¿Disponible para Operación?',
            tipo: 'boolean',
            defaultValue: false
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
        nombre_estado: {
            required: true,
            minLength: 3,
            maxLength: 100
        },
        descripcion: {
            maxLength: 500
        },
        color_hex: {
            pattern: '^#[0-9A-Fa-f]{6}$',
            patternMessage: 'Formato hexadecimal válido: #RRGGBB'
        }
    };

    return e(CatalogoBase, {
        titulo: 'Estados de Vehículo',
        endpoint: 'estados-vehiculo',
        campos: campos,
        validaciones: validaciones,
        icono: Icons.settings(),
        descripcion: 'Control de estados de vehículos (Disponible, En Ruta, Mantenimiento, Averiado)'
    });
}

export default EstadosVehiculo;
