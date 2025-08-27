// src/resources/js/components/catalogos/modulos/FormasPago.js
import React from 'react';
import CatalogoBase from '../common/CatalogoBase';
import Icons from '../../../utils/Icons';

const { createElement: e } = React;

function FormasPago() {
    // Configuración específica para Formas de Pago
    const campos = [
        {
            key: 'codigo',
            label: 'Código',
            tipo: 'text',
            placeholder: 'Ej: EFE, TAR, TRANS'
        },
        {
            key: 'nombre_forma',
            label: 'Nombre de la Forma',
            tipo: 'text',
            placeholder: 'Ej: Efectivo, Tarjeta de Crédito'
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            tipo: 'textarea',
            placeholder: 'Descripción detallada de la forma de pago'
        },
        {
            key: 'requiere_comprobante',
            label: 'Requiere Comprobante',
            tipo: 'boolean'
        },
        {
            key: 'genera_credito',
            label: 'Genera Crédito',
            tipo: 'boolean'
        },
        {
            key: 'dias_credito',
            label: 'Días de Crédito',
            tipo: 'number',
            placeholder: '0, 15, 30, 60...'
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
        nombre_forma: {
            required: true,
            minLength: 3,
            maxLength: 100
        },
        descripcion: {
            maxLength: 500
        },
        dias_credito: {
            min: 0,
            max: 365
        }
    };

    return e(CatalogoBase, {
        titulo: 'Formas de Pago',
        endpoint: 'formas-pago',
        campos: campos,
        validaciones: validaciones,
        icono: Icons.creditCard(),
        descripcion: 'Gestión de métodos de pago disponibles (Efectivo, Tarjeta, Transferencia, Crédito, etc.)'
    });
}

export default FormasPago;
