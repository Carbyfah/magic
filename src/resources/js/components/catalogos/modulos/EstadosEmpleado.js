// src/resources/js/components/catalogos/modulos/EstadosEmpleado.js
import React from 'react';
import CatalogoBase from '../common/CatalogoBase';
import Icons from '../../../utils/Icons';

const { createElement: e } = React;

function EstadosEmpleado() {
    // Configuración específica para Estados de Empleado
    const campos = [
        {
            key: 'codigo',
            label: 'Código',
            tipo: 'text',
            placeholder: 'Ej: ACT, VAC, SUS, BAJA'
        },
        {
            key: 'nombre_estado',
            label: 'Nombre del Estado',
            tipo: 'text',
            placeholder: 'Ej: Activo, Vacaciones, Suspendido'
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            tipo: 'textarea',
            placeholder: 'Descripción detallada del estado del empleado'
        },
        {
            key: 'color_hex',
            label: 'Color de Etiqueta',
            tipo: 'color',
            placeholder: '#10B981'
        },
        {
            key: 'permite_trabajar',
            label: '¿Permite Trabajar?',
            tipo: 'boolean',
            defaultValue: false
        },
        {
            key: 'cuenta_planilla',
            label: '¿Cuenta en Planilla?',
            tipo: 'boolean',
            defaultValue: true
        },
        {
            key: 'orden',
            label: 'Orden de Visualización',
            tipo: 'number',
            placeholder: '0, 1, 2...',
            defaultValue: 0
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
        orden: {
            min: 0,
            max: 99
        }
    };

    return e(CatalogoBase, {
        titulo: 'Estados de Empleado',
        endpoint: 'estados-empleado',
        campos: campos,
        validaciones: validaciones,
        icono: Icons.userCheck(),
        descripcion: 'Control de estados de empleados (Activo, Vacaciones, Suspendido, Baja) y su impacto operativo'
    });
}

export default EstadosEmpleado;
