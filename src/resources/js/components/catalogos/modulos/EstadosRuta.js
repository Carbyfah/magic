import React from 'react';
import CatalogoBase from '../common/CatalogoBase';
import Icons from '../../../utils/Icons';

const { createElement: e } = React;

function EstadosRuta() {
    const campos = [
        {
            key: 'codigo',
            label: 'Código',
            tipo: 'text',
            placeholder: 'Ej: ACT, INACT, TEMP, CANC'
        },
        {
            key: 'nombre_estado',
            label: 'Nombre del Estado',
            tipo: 'text',
            placeholder: 'Ej: Activa, Inactiva, Temporal, Cancelada'
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            tipo: 'textarea',
            placeholder: 'Descripción del estado de la ruta'
        },
        {
            key: 'color_hex',
            label: 'Color de Etiqueta',
            tipo: 'color',
            placeholder: '#3B82F6'
        },
        {
            key: 'acepta_reservas',
            label: '¿Acepta Reservas?',
            tipo: 'boolean',
            defaultValue: true
        }
    ];

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
        titulo: 'Estados de Ruta',
        endpoint: 'estados-ruta',
        campos: campos,
        validaciones: validaciones,
        icono: Icons.route(),
        descripcion: 'Control de estados de rutas (Activa, Inactiva, Temporal, Cancelada) y disponibilidad para reservas'
    });
}

export default EstadosRuta;
