import React from 'react';
import CatalogoBase from '../common/CatalogoBase';
import Icons from '../../../utils/Icons';

const { createElement: e } = React;

function TiposVenta() {
    const campos = [
        {
            key: 'codigo',
            label: 'Código',
            tipo: 'text',
            placeholder: 'Ej: DIR, AGEN, ONL, SHUT, TOUR'
        },
        {
            key: 'nombre_tipo',
            label: 'Nombre del Tipo',
            tipo: 'text',
            placeholder: 'Ej: Directa, Agencia, Online, Shuttle'
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            tipo: 'textarea',
            placeholder: 'Descripción del tipo de venta'
        },
        {
            key: 'genera_comision',
            label: '¿Genera Comisión?',
            tipo: 'boolean',
            defaultValue: false
        },
        {
            key: 'requiere_voucher',
            label: '¿Requiere Voucher?',
            tipo: 'boolean',
            defaultValue: false
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
        titulo: 'Tipos de Venta',
        endpoint: 'tipos-venta',
        campos: campos,
        validaciones: validaciones,
        icono: Icons.tag(),
        descripcion: 'Clasificación de tipos de venta (Directa, Agencia, Online, Shuttle, Tour) y configuraciones'
    });
}

export default TiposVenta;
