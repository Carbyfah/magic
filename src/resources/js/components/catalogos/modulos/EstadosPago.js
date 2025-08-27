import React from 'react';
import CatalogoBase from '../common/CatalogoBase';
import Icons from '../../../utils/Icons';

const { createElement: e } = React;

function EstadosPago() {
    const campos = [
        {
            key: 'codigo',
            label: 'Código',
            tipo: 'text',
            placeholder: 'Ej: PEND, PARC, PAG, VENC, INCOB'
        },
        {
            key: 'nombre_estado',
            label: 'Nombre del Estado',
            tipo: 'text',
            placeholder: 'Ej: Pendiente, Parcial, Pagado, Vencido'
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            tipo: 'textarea',
            placeholder: 'Descripción del estado del pago'
        },
        {
            key: 'color_hex',
            label: 'Color de Etiqueta',
            tipo: 'color',
            placeholder: '#EF4444'
        },
        {
            key: 'requiere_cobro',
            label: '¿Requiere Cobro?',
            tipo: 'boolean',
            defaultValue: true
        },
        {
            key: 'permite_servicio',
            label: '¿Permite Servicio?',
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
        titulo: 'Estados de Pago',
        endpoint: 'estados-pago',
        campos: campos,
        validaciones: validaciones,
        icono: Icons.creditCard(),
        descripcion: 'Control de estados de pago (Pendiente, Parcial, Pagado, Vencido, Incobrable) y gestión de cobros'
    });
}

export default EstadosPago;
