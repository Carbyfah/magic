<?php

namespace App\Http\Controllers\Api;

use App\Models\EstadoReserva;
use App\Http\Resources\EstadoReservaResource;

class EstadoReservaController extends BaseCatalogoController
{
    public function __construct()
    {
        $this->model = EstadoReserva::class;
        $this->resource = EstadoReservaResource::class;
        $this->searchField = 'nombre_estado';

        $this->storeRules = [
            'codigo' => 'required|string|max:10|unique:estados_reserva,codigo',
            'nombre_estado' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'color_hex' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'orden_flujo' => 'integer|min:0',
            'editable' => 'boolean',
            'cuenta_ocupacion' => 'boolean'
        ];

        $this->updateRules = [
            'codigo' => 'sometimes|required|string|max:10|unique:estados_reserva,codigo',
            'nombre_estado' => 'sometimes|required|string|max:100',
            'descripcion' => 'sometimes|nullable|string',
            'color_hex' => 'sometimes|nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'orden_flujo' => 'sometimes|integer|min:0',
            'editable' => 'sometimes|boolean',
            'cuenta_ocupacion' => 'sometimes|boolean'
        ];

        $this->relationships = [];
    }
}
