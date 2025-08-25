<?php

namespace App\Http\Controllers\Api;

use App\Models\TipoCliente;
use App\Http\Resources\TipoClienteResource;

class TipoClienteController extends BaseCatalogoController
{
    public function __construct()
    {
        $this->model = TipoCliente::class;
        $this->resource = TipoClienteResource::class;
        $this->searchField = 'nombre_tipo';

        $this->storeRules = [
            'codigo' => 'required|string|max:10|unique:tipos_cliente,codigo',
            'nombre_tipo' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'descuento_default' => 'numeric|min:0|max:100',
            'requiere_credito' => 'boolean',
            'dias_credito' => 'integer|min:0',
            'prioridad' => 'integer|min:1'
        ];

        $this->updateRules = [
            'codigo' => 'sometimes|required|string|max:10|unique:tipos_cliente,codigo',
            'nombre_tipo' => 'sometimes|required|string|max:100',
            'descripcion' => 'sometimes|nullable|string',
            'descuento_default' => 'sometimes|numeric|min:0|max:100',
            'requiere_credito' => 'sometimes|boolean',
            'dias_credito' => 'sometimes|integer|min:0',
            'prioridad' => 'sometimes|integer|min:1'
        ];

        $this->relationships = [];
    }
}
