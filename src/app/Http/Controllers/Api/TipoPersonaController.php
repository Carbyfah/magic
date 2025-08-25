<?php

namespace App\Http\Controllers\Api;

use App\Models\TipoPersona;
use App\Http\Resources\TipoPersonaResource;

class TipoPersonaController extends BaseCatalogoController
{
    public function __construct()
    {
        $this->model = TipoPersona::class;
        $this->resource = TipoPersonaResource::class;
        $this->searchField = 'nombre';

        $this->storeRules = [
            'codigo' => 'required|string|max:10|unique:tipos_persona,codigo',
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string'
        ];

        $this->updateRules = [
            'codigo' => 'sometimes|required|string|max:10|unique:tipos_persona,codigo',
            'nombre' => 'sometimes|required|string|max:100',
            'descripcion' => 'sometimes|nullable|string'
        ];

        $this->relationships = ['personas'];
    }
}
