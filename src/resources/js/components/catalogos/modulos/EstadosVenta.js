import React from 'react';
import CatalogoBase from '../common/CatalogoBase';
import Icons from '../../../utils/Icons';

const { createElement: e } = React;

function EstadosVenta() {
    const campos = [
        {
            key: 'codigo',
            label: 'Código',
            tipo: 'text',
            placeholder: 'Ej: ACT, CANC, REEMB, ANUL'
        },
        {
            key: 'nombre_estado',
            label: 'Nombre del Estado',
            tipo: 'text',
            placeholder: 'Ej: Activa, Cancelada, Reembolso, Anulada'
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            tipo: 'textarea',
            placeholder: 'Descripción del estado de la venta'
        },
        {
            key: 'color_hex',
            label: 'Color de Etiqueta',
            tipo: 'color',
            placeholder: '#F59E0B'
        },
        {
            key: 'cuenta_ingreso',
            label: '¿Cuenta como Ingreso?',
            tipo: 'boolean',
            defaultValue: true
        },
        {
            key: 'modificable',
            label: '¿Es Modificable?',
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
        titulo: 'Estados de Venta',
        endpoint: 'estados-venta',
        campos: campos,
        validaciones: validaciones,
        icono: Icons.dollarSign(),
        descripcion: 'Control de estados de ventas (Activa, Cancelada, Reembolso, Anulada) y su impacto en ingresos'
    });
}

export default EstadosVenta;
