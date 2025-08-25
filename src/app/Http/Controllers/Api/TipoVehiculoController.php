<?php

namespace App\Http\Controllers\Api;

use App\Models\TipoVehiculo;
use App\Http\Resources\TipoVehiculoResource;

class TipoVehiculoController extends BaseCatalogoController
{
    public function __construct()
    {
        $this->model = TipoVehiculo::class;
        $this->resource = TipoVehiculoResource::class;
        $this->searchField = 'nombre_tipo';

        $this->storeRules = [
            'codigo' => 'required|string|max:10|unique:tipos_vehiculo,codigo',
            'nombre_tipo' => 'required|string|max:100',
            'capacidad_estandar' => 'integer|min:1',
            'descripcion' => 'nullable|string'
        ];

        $this->updateRules = [
            'codigo' => 'sometimes|required|string|max:10|unique:tipos_vehiculo,codigo',
            'nombre_tipo' => 'sometimes|required|string|max:100',
            'capacidad_estandar' => 'sometimes|integer|min:1',
            'descripcion' => 'sometimes|nullable|string'
        ];

        $this->relationships = [];
    }
}
