// src/resources/js/components/catalogos/modulos/Roles.js
import React from 'react';
import CatalogoBase from '../common/CatalogoBase';
import Icons from '../../../utils/Icons';

const { createElement: e } = React;

function Roles() {
    // Configuración específica para Roles
    const campos = [
        {
            key: 'codigo',
            label: 'Código',
            tipo: 'text',
            placeholder: 'Ej: ADMIN, GERENTE, VENDEDOR'
        },
        {
            key: 'nombre_rol',
            label: 'Nombre del Rol',
            tipo: 'text',
            placeholder: 'Ej: Administrador, Gerente, Vendedor'
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            tipo: 'textarea',
            placeholder: 'Descripción detallada del rol y sus responsabilidades'
        },
        {
            key: 'nivel_jerarquia',
            label: 'Nivel Jerárquico',
            tipo: 'number',
            placeholder: '1-10 (10=más alto)',
            defaultValue: 1
        },
        {
            key: 'puede_autorizar',
            label: '¿Puede Autorizar?',
            tipo: 'boolean',
            defaultValue: false
        }
    ];

    // Validaciones específicas según el modelo Role.php
    const validaciones = {
        codigo: {
            required: true,
            minLength: 2,
            maxLength: 20,
            pattern: '^[A-Z0-9_]+$',
            patternMessage: 'Solo letras mayúsculas, números y guiones bajos'
        },
        nombre_rol: {
            required: true,
            minLength: 3,
            maxLength: 100
        },
        descripcion: {
            maxLength: 500
        },
        nivel_jerarquia: {
            required: true,
            min: 1,
            max: 10
        }
    };

    return e(CatalogoBase, {
        titulo: 'Roles de Usuario',
        endpoint: 'roles',
        campos: campos,
        validaciones: validaciones,
        icono: Icons.shield(),
        descripcion: 'Gestión de roles y jerarquías del sistema (Administrador, Gerente, Vendedor, Chofer)'
    });
}

export default Roles;
