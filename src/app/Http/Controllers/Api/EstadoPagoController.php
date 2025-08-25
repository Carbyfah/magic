<?php

namespace App\Http\Controllers\Api;

use App\Models\EstadoPago;
use App\Http\Resources\EstadoPagoResource;

class EstadoPagoController extends BaseCatalogoController
{
    public function __construct()
    {
        $this->model = EstadoPago::class;
        $this->resource = EstadoPagoResource::class;
        $this->searchField = 'nombre_estado';

        $this->storeRules = [
            'codigo' => 'required|string|max:10|unique:estados_pago,codigo',
            'nombre_estado' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'color_hex' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'requiere_cobro' => 'boolean',
            'permite_servicio' => 'boolean'
        ];

        $this->updateRules = [
            'codigo' => 'sometimes|required|string|max:10|unique:estados_pago,codigo',
            'nombre_estado' => 'sometimes|required|string|max:100',
            'descripcion' => 'sometimes|nullable|string',
            'color_hex' => 'sometimes|nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'requiere_cobro' => 'sometimes|boolean',
            'permite_servicio' => 'sometimes|boolean'
        ];

        $this->relationships = [];
    }
}
