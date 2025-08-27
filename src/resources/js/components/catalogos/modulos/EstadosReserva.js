// src/resources/js/components/catalogos/modulos/EstadosReserva.js
import React from 'react';
import CatalogoBase from '../common/CatalogoBase';
import Icons from '../../../utils/Icons';

const { createElement: e } = React;

function EstadosReserva() {
    // En EstadosReserva.js - Configuración de campos
    const campos = [
        {
            key: 'codigo',
            label: 'Código',
            tipo: 'text',
            placeholder: 'Ej: PEND, CONF, CANC'
        },
        {
            key: 'nombre_estado',
            label: 'Nombre del Estado',
            tipo: 'text',
            placeholder: 'Ej: Pendiente, Confirmada, Cancelada'
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            tipo: 'textarea',
            placeholder: 'Descripción detallada del estado'
        },
        {
            key: 'color_hex',
            label: 'Color de Etiqueta',
            tipo: 'color', // ⚠️ NUEVO TIPO
            placeholder: '#FF5500'
        },
        {
            key: 'orden_flujo',
            label: 'Orden en Flujo',
            tipo: 'number',
            defaultValue: 1
        },
        {
            key: 'editable',
            label: '¿Es Editable?',
            tipo: 'boolean',
            defaultValue: true
        },
        {
            key: 'cuenta_ocupacion',
            label: '¿Cuenta Ocupación?',
            tipo: 'boolean',
            defaultValue: true
        }
    ];

    // Validaciones específicas
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
        },
        orden_flujo: {
            min: 0,
            max: 99
        }
    };

    return e(CatalogoBase, {
        titulo: 'Estados de Reserva',
        endpoint: 'estados-reserva', // VERIFICAR QUE ESTE ENDPOINT EXISTA EN EL BACKEND
        campos: campos,
        validaciones: validaciones,
        icono: Icons.clock(),
        descripcion: 'Gestión de estados del flujo de reservas (Pendiente → Confirmada → Ejecutada → Finalizada)'
    });
}

export default EstadosReserva;
