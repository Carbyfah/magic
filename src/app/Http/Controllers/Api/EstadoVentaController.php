<?php

namespace App\Http\Controllers\Api;

use App\Models\EstadoVenta;
use App\Http\Resources\EstadoVentaResource;

class EstadoVentaController extends BaseCatalogoController
{
    public function __construct()
    {
        $this->model = EstadoVenta::class;
        $this->resource = EstadoVentaResource::class;
        $this->searchField = 'nombre_estado';

        $this->storeRules = [
            'codigo' => 'required|string|max:10|unique:estados_venta,codigo',
            'nombre_estado' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'color_hex' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'cuenta_ingreso' => 'boolean',
            'modificable' => 'boolean'
        ];

        $this->updateRules = [
            'codigo' => 'sometimes|required|string|max:10|unique:estados_venta,codigo',
            'nombre_estado' => 'sometimes|required|string|max:100',
            'descripcion' => 'sometimes|nullable|string',
            'color_hex' => 'sometimes|nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'cuenta_ingreso' => 'sometimes|boolean',
            'modificable' => 'sometimes|boolean'
        ];

        $this->relationships = [];
    }
}
