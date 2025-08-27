// src/resources/js/components/catalogos/modulos/TiposLicencia.js
import React from 'react';
import CatalogoBase from '../common/CatalogoBase';
import Icons from '../../../utils/Icons';

const { createElement: e } = React;

function TiposLicencia() {
    // Configuración específica para Tipos de Licencia
    const campos = [
        {
            key: 'codigo',
            label: 'Código',
            tipo: 'text',
            placeholder: 'Ej: A, B, C, M, E'
        },
        {
            key: 'nombre_tipo',
            label: 'Nombre del Tipo',
            tipo: 'text',
            placeholder: 'Ej: Licencia Tipo A, Tipo B, Motocicleta'
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            tipo: 'textarea',
            placeholder: 'Descripción del tipo de licencia y vehículos permitidos'
        }
    ];

    // Validaciones específicas según la base de datos
    const validaciones = {
        codigo: {
            required: true,
            minLength: 1,
            maxLength: 5,
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
        titulo: 'Tipos de Licencia',
        endpoint: 'tipos-licencia',
        campos: campos,
        validaciones: validaciones,
        icono: Icons.card(),
        descripcion: 'Gestión de tipos de licencias de conducir (A, B, C, M, E) para choferes'
    });
}

export default TiposLicencia;
