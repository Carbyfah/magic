<?php

namespace App\Http\Controllers\Api;

use App\Models\EstadoEmpleado;
use App\Http\Resources\EstadoEmpleadoResource;

class EstadoEmpleadoController extends BaseCatalogoController
{
    public function __construct()
    {
        $this->model = EstadoEmpleado::class;
        $this->resource = EstadoEmpleadoResource::class;
        $this->searchField = 'nombre_estado';

        $this->storeRules = [
            'codigo' => 'required|string|max:10|unique:estados_empleado,codigo',
            'nombre_estado' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'color_hex' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'permite_trabajar' => 'boolean',
            'cuenta_planilla' => 'boolean',
            'orden' => 'integer|min:0'
        ];

        $this->updateRules = [
            'codigo' => 'sometimes|required|string|max:10|unique:estados_empleado,codigo',
            'nombre_estado' => 'sometimes|required|string|max:100',
            'descripcion' => 'sometimes|nullable|string',
            'color_hex' => 'sometimes|nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'permite_trabajar' => 'sometimes|boolean',
            'cuenta_planilla' => 'sometimes|boolean',
            'orden' => 'sometimes|integer|min:0'
        ];

        $this->relationships = [];
    }
}
