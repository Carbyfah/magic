<?php

namespace App\Http\Controllers\Api;

use App\Models\EstadoRuta;
use App\Http\Resources\EstadoRutaResource;

class EstadoRutaController extends BaseCatalogoController
{
    public function __construct()
    {
        $this->model = EstadoRuta::class;
        $this->resource = EstadoRutaResource::class;
        $this->searchField = 'nombre_estado';

        $this->storeRules = [
            'codigo' => 'required|string|max:10|unique:estados_ruta,codigo',
            'nombre_estado' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'color_hex' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'acepta_reservas' => 'boolean'
        ];

        $this->updateRules = [
            'codigo' => 'sometimes|required|string|max:10|unique:estados_ruta,codigo',
            'nombre_estado' => 'sometimes|required|string|max:100',
            'descripcion' => 'sometimes|nullable|string',
            'color_hex' => 'sometimes|nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'acepta_reservas' => 'sometimes|boolean'
        ];

        $this->relationships = [];
    }
}
