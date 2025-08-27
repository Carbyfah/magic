// src/resources/js/components/catalogos/modulos/TiposCliente.js
import React from 'react';
import CatalogoBase from '../common/CatalogoBase';
import Icons from '../../../utils/Icons';

const { createElement: e } = React;

function TiposCliente() {
    // Configuración específica para Tipos de Cliente
    const campos = [
        {
            key: 'codigo',
            label: 'Código',
            tipo: 'text',
            placeholder: 'Ej: IND, AGEN, CORP'
        },
        {
            key: 'nombre_tipo',
            label: 'Nombre del Tipo',
            tipo: 'text',
            placeholder: 'Ej: Individual, Agencia, Corporativo'
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            tipo: 'textarea',
            placeholder: 'Descripción detallada del tipo de cliente'
        },
        {
            key: 'descuento_default',
            label: 'Descuento por Defecto (%)',
            tipo: 'decimal',
            placeholder: '0.00, 5.00, 10.00'
        },
        {
            key: 'limite_credito_default',
            label: 'Límite Crédito por Defecto',
            tipo: 'decimal',
            placeholder: '0.00, 1000.00, 5000.00'
        },
        {
            key: 'requiere_garantia',
            label: 'Requiere Garantía',
            tipo: 'boolean'
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
        nombre_tipo: {
            required: true,
            minLength: 3,
            maxLength: 100
        },
        descripcion: {
            maxLength: 500
        },
        descuento_default: {
            min: 0,
            max: 100
        },
        limite_credito_default: {
            min: 0,
            max: 999999.99
        }
    };

    return e(CatalogoBase, {
        titulo: 'Tipos de Cliente',
        endpoint: 'tipos-cliente',
        campos: campos,
        validaciones: validaciones,
        icono: Icons.users(),
        descripcion: 'Clasificación de clientes (Individual, Agencia, Corporativo) con sus configuraciones por defecto'
    });
}

export default TiposCliente;
