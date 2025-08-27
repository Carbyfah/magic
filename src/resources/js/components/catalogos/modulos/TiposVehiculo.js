// src/resources/js/components/catalogos/modulos/TiposVehiculo.js
import React from 'react';
import CatalogoBase from '../common/CatalogoBase';
import Icons from '../../../utils/Icons';

const { createElement: e } = React;

function TiposVehiculo() {
    // Configuración específica para Tipos de Vehículo
    const campos = [
        {
            key: 'codigo',
            label: 'Código',
            tipo: 'text',
            placeholder: 'Ej: BUS, MINIBUS, VAN'
        },
        {
            key: 'nombre_tipo',
            label: 'Nombre del Tipo',
            tipo: 'text',
            placeholder: 'Ej: Bus Turístico, Minibús, Van'
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            tipo: 'textarea',
            placeholder: 'Características y especificaciones del tipo de vehículo'
        },
        {
            key: 'capacidad_estandar',
            label: 'Capacidad Estándar',
            tipo: 'number',
            placeholder: 'Número de pasajeros',
            defaultValue: 1  // CAMBIO: De 0 a 1
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
        capacidad_estandar: {
            required: true,
            min: 1,
            max: 100
        }
    };

    return e(CatalogoBase, {
        titulo: 'Tipos de Vehículo',
        endpoint: 'tipos-vehiculo',
        campos: campos,
        validaciones: validaciones,
        icono: Icons.truck(),
        descripcion: 'Clasificación de vehículos de la flota (Bus, Minibús, Van) con capacidades estándar'
    });
}

export default TiposVehiculo;
