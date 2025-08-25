<?php

namespace App\Http\Controllers\Api;

use App\Models\EstadoComercial;
use App\Http\Resources\EstadoComercialResource;

class EstadoComercialController extends BaseCatalogoController
{
    public function __construct()
    {
        $this->model = EstadoComercial::class;
        $this->resource = EstadoComercialResource::class;
        $this->searchField = 'nombre_estado';

        $this->storeRules = [
            'codigo' => 'required|string|max:10|unique:estados_comercial,codigo',
            'nombre_estado' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'color_hex' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/'
        ];

        $this->updateRules = [
            'codigo' => 'sometimes|required|string|max:10|unique:estados_comercial,codigo',
            'nombre_estado' => 'sometimes|required|string|max:100',
            'descripcion' => 'sometimes|nullable|string',
            'color_hex' => 'sometimes|nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/'
        ];

        $this->relationships = [];
    }
}
