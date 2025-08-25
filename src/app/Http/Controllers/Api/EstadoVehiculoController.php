<?php

namespace App\Http\Controllers\Api;

use App\Models\EstadoVehiculo;
use App\Http\Resources\EstadoVehiculoResource;

class EstadoVehiculoController extends BaseCatalogoController
{
    public function __construct()
    {
        $this->model = EstadoVehiculo::class;
        $this->resource = EstadoVehiculoResource::class;
        $this->searchField = 'nombre_estado';

        $this->storeRules = [
            'codigo' => 'required|string|max:10|unique:estados_vehiculo,codigo',
            'nombre_estado' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'color_hex' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'disponible_operacion' => 'boolean'
        ];

        $this->updateRules = [
            'codigo' => 'sometimes|required|string|max:10|unique:estados_vehiculo,codigo',
            'nombre_estado' => 'sometimes|required|string|max:100',
            'descripcion' => 'sometimes|nullable|string',
            'color_hex' => 'sometimes|nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'disponible_operacion' => 'sometimes|boolean'
        ];

        $this->relationships = [];
    }
}
