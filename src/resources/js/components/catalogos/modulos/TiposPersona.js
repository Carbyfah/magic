// src/resources/js/components/catalogos/modulos/TiposPersona.js
import React from 'react';
import CatalogoBase from '../common/CatalogoBase';
import Icons from '../../../utils/Icons';

const { createElement: e } = React;

function TiposPersona() {
    // Configuración específica para Tipos de Persona
    const campos = [
        {
            key: 'codigo',
            label: 'Código',
            tipo: 'text',
            placeholder: 'Ej: EMP, CLI, CHOF'
        },
        {
            key: 'nombre',
            label: 'Nombre del Tipo',
            tipo: 'text',
            placeholder: 'Ej: Empleado, Cliente, Chofer'
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            tipo: 'textarea',
            placeholder: 'Descripción detallada del tipo de persona'
        },
        {
            key: 'puede_eliminarse',
            label: '¿Puede Eliminarse?',
            tipo: 'boolean',
            defaultValue: false
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
        nombre: {
            required: true,
            minLength: 3,
            maxLength: 100
        },
        descripcion: {
            maxLength: 500
        },
        color_identificador: {
            pattern: '^#[0-9A-Fa-f]{6}$',
            patternMessage: 'Formato hexadecimal válido: #RRGGBB'
        }
    };

    return e(CatalogoBase, {
        titulo: 'Tipos de Persona',
        endpoint: 'tipos-persona',
        campos: campos,
        validaciones: validaciones,
        icono: Icons.user(),
        descripcion: 'Clasificación base de personas en el sistema (Empleado, Cliente, Chofer, Contacto)'
    });
}

export default TiposPersona;
