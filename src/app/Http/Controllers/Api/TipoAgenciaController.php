<?php

namespace App\Http\Controllers\Api;

use App\Models\TipoAgencia;
use App\Http\Resources\TipoAgenciaResource;

class TipoAgenciaController extends BaseCatalogoController
{
    public function __construct()
    {
        $this->model = TipoAgencia::class;
        $this->resource = TipoAgenciaResource::class;
        $this->searchField = 'nombre_tipo';

        $this->storeRules = [
            'codigo' => 'required|string|max:10|unique:tipos_agencia,codigo',
            'nombre_tipo' => 'required|string|max:100',
            'descripcion' => 'nullable|string'
        ];

        $this->updateRules = [
            'codigo' => 'sometimes|required|string|max:10|unique:tipos_agencia,codigo',
            'nombre_tipo' => 'sometimes|required|string|max:100',
            'descripcion' => 'sometimes|nullable|string'
        ];

        $this->relationships = [];
    }
}
